import { useState, useEffect, useRef, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Box,
    Typography,
    Paper,
    Grid,
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    Avatar,
    Divider,
    TextField,
    Button,
    IconButton,
    CircularProgress,
    InputAdornment,
    Tabs,
    Tab,
    Badge,
    Tooltip,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Chip
} from '@mui/material';
import {
    Send,
    Search,
    School,
    Group,
    Message,
    Refresh,
    SignalWifi4Bar,
    SignalWifiOff,
    Campaign,
    People,
    Lock,
    LockOpen
} from '@mui/icons-material';
import { 
    getInbox, 
    getSentMessages,
    getMessageDetail,
    getBroadcastMessages,
    sendMessage 
} from '../../../redux/messageRelated/messageHandle';
import { getAllSclasses } from '../../../redux/sclassRelated/sclassHandle';
import { getAllTeachers } from '../../../redux/teacherRelated/teacherHandle';
import { getAllStudents } from '../../../redux/studentRelated/studentHandle';
import { 
    initSocket, 
    joinChatRoom,
    joinRoleRoom,
    subscribeToMessages,
    subscribeToBroadcasts,
    sendBroadcastMessage
} from '../../../utils/socketService';

const AdminMessages = () => {
    const dispatch = useDispatch();
    const { currentUser } = useSelector((state) => state.user);    const { messages = [], broadcastMessages = [] } = useSelector((state) => state.message || {});
    const { teachers } = useSelector((state) => state.teacher || { teachers: [] });
    const { students } = useSelector((state) => state.student || { students: [] });

    const [selectedUser, setSelectedUser] = useState(null);
    const [messageText, setMessageText] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [userType, setUserType] = useState(0); // 0: Teachers, 1: Students, 2: Broadcast
    const [broadcastType, setBroadcastType] = useState('all'); // 'all', 'all_teachers', 'all_students'
    const [loadingConversation, setLoadingConversation] = useState(false);
    const [chatRoomId, setChatRoomId] = useState(null);
    const [realTimeMessages, setRealTimeMessages] = useState([]);
    const [socketConnected, setSocketConnected] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        // Initialize socket when component mounts
        const socket = initSocket();
        
        socket.on('connect', () => {
            console.log("Admin socket connected");
            setSocketConnected(true);
            
            // Join admin room for broadcasts
            joinRoleRoom('admin');
        });
        
        socket.on('disconnect', () => {
            console.log("Admin socket disconnected");
            setSocketConnected(false);
        });
        
        socket.on('room_joined', (data) => {
            console.log('Admin joined room:', data);
        });
        
        // Clean up function
        return () => {
            socket.off('connect');
            socket.off('disconnect');
            socket.off('room_joined');
        };
    }, []);

    useEffect(() => {
        if (currentUser?.school) {
            // Load necessary data when component mounts
            console.log("Loading admin data for school:", currentUser.school);
            
            Promise.all([
                dispatch(getInbox(currentUser._id, 'admin')),
                dispatch(getSentMessages(currentUser._id, 'admin')),
                dispatch(getBroadcastMessages(currentUser._id, 'admin')),
                dispatch(getAllSclasses(currentUser.school, "Sclass")),
                dispatch(getAllTeachers(currentUser.school)),
                dispatch(getAllStudents(currentUser.school))
            ]).then(() => {
                console.log("Admin data loaded successfully");
            }).catch((error) => {
                console.error("Error loading admin data:", error);
            });
        }
    }, [dispatch, currentUser]);    useEffect(() => {
        if (selectedUser) {
            // Skip fetching conversation for broadcast recipients
            if (userType === 2 || selectedUser.id === 'broadcast') {
                // Just load broadcast messages instead
                dispatch(getBroadcastMessages(currentUser._id, 'admin'))
                    .then(() => {
                        console.log("Broadcast messages loaded successfully");
                    })
                    .catch((error) => {
                        console.error("Error loading broadcast messages:", error);
                    });
                return;
            }
            
            setLoadingConversation(true);
            // Get conversation history between admin and selected user
            dispatch(getMessageDetail(selectedUser.id, currentUser._id, 'admin'))
                .then(() => {
                    console.log("Conversation loaded successfully");
                    setLoadingConversation(false);
                })
                .catch((error) => {
                    console.error("Error loading conversation:", error);
                    setLoadingConversation(false);
                });
            
            // Join chat room for real-time messaging
            const roomId = joinChatRoom(currentUser._id, selectedUser.id);
            setChatRoomId(roomId);
            
            // Reset real-time messages when changing users
            setRealTimeMessages([]);
            
            // Subscribe to new messages
            const unsubscribe = subscribeToMessages((message) => {
                console.log("Received real-time message:", message);
                if (message.chatRoomId === roomId) {
                    setRealTimeMessages(prevMessages => {
                        // Check if this message is already in our list (avoid duplicates)
                        const isDuplicate = prevMessages.some(m => 
                            m._id === message._id || 
                            (m.timestamp === message.timestamp && 
                             m.sender.id === message.sender.id &&
                             m.content === message.content)
                        );
                        
                        if (isDuplicate) {
                            console.log("Duplicate message, not adding to state");
                            return prevMessages;
                        }
                        
                        return [...prevMessages, message];
                    });
                }
            });
            
            return () => {
                unsubscribe();
            };
        }
    }, [dispatch, currentUser, selectedUser, userType]);

    // Subscribe to broadcast messages
    useEffect(() => {
        const unsubscribe = subscribeToBroadcasts((message) => {
            console.log("Received broadcast message:", message);
            
            // Add to realTimeMessages if in broadcast view
            if (userType === 2) {
                setRealTimeMessages(prevMessages => {
                    // Check for duplicates
                    const isDuplicate = prevMessages.some(m => 
                        m._id === message._id || 
                        (m.timestamp === message.timestamp && 
                         m.sender.id === message.sender.id &&
                         m.content === message.content)
                    );
                    
                    if (isDuplicate) {
                        return prevMessages;
                    }
                    
                    return [...prevMessages, message];
                });
            }
        });
        
        return () => {
            unsubscribe();
        };
    }, [userType]);

    // Combine server messages with real-time messages
    const combinedMessages = useMemo(() => {
        const combined = [...(messages || []), ...realTimeMessages];
        
        // Remove duplicates by message ID or by content+timestamp+sender if ID is not available
        const uniqueMessages = combined.reduce((unique, message) => {
            const key = message._id || `${message.sender.id}-${message.timestamp}-${message.content}`;
            if (!unique[key]) {
                unique[key] = message;
            }
            return unique;
        }, {});
        
        // Convert back to array and sort by timestamp
        return Object.values(uniqueMessages).sort((a, b) => 
            new Date(a.timestamp) - new Date(b.timestamp)
        );
    }, [messages, realTimeMessages]);

    useEffect(() => {
        scrollToBottom();
    }, [combinedMessages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleUserSelect = (user, role) => {
        setSelectedUser({
            id: user._id,
            name: user.name,
            role: role,
        });
    };

    // Select broadcast recipient type
    const handleBroadcastSelect = (type) => {
        setBroadcastType(type);
        setSelectedUser({
            id: 'broadcast',
            name: type === 'all' ? 'All Users' : 
                  type === 'all_teachers' ? 'All Teachers' : 'All Students',
            role: type
        });
    };

    // Handle sending a message
    const handleSendMessage = async () => {
        if (!messageText.trim() || !selectedUser) return;
        
        // Handle broadcast message
        if (userType === 2) {
            const broadcastData = {
                sender: {
                    id: currentUser._id,
                    model: 'admin',
                    name: currentUser.name || "Admin"
                },
                receiver: {
                    id: selectedUser.id,
                    model: broadcastType, // 'all', 'all_teachers', 'all_students'
                    name: selectedUser.name
                },
                subject: `Broadcast from ${currentUser.name || "Admin"}`,
                content: messageText.trim(),
                school: currentUser.school,
                timestamp: new Date().toISOString(),
                isBroadcast: true
            };
            
            try {
                console.log('Sending broadcast message:', broadcastData);
                const result = await dispatch(sendMessage(broadcastData));
                
                if (result && result.success) {
                    console.log('Broadcast message sent successfully:', result.data);
                    setMessageText('');
                    
                    // Refresh broadcasts
                    dispatch(getBroadcastMessages(currentUser._id, 'admin'));
                    
                    // Also send via WebSocket for real-time updates
                    sendBroadcastMessage(broadcastData);
                    
                    // Scroll to bottom
                    setTimeout(() => {
                        scrollToBottom();
                    }, 100);
                } else {
                    console.error('Failed to send broadcast:', result?.error || 'Unknown error');
                    alert('Failed to send broadcast message. Please try again.');
                }
            } catch (error) {
                console.error('Error in handleSendMessage for broadcast:', error);
                alert('An error occurred while sending the broadcast. Please try again.');
            }
            return;
        }
        
        // Handle regular message
        // Generate a consistent chat room ID
        const roomId = joinChatRoom(currentUser._id, selectedUser.id);
        
        const messageData = {
            sender: {
                id: currentUser._id,
                model: 'admin',
                name: currentUser.name || "Admin"
            },
            receiver: {
                id: selectedUser.id,
                model: selectedUser.role,
                name: selectedUser.name
            },
            subject: `Message from ${currentUser.name || "Admin"}`,
            content: messageText.trim(),
            chatRoomId: roomId,
            school: currentUser.school,
            timestamp: new Date().toISOString()
        };
        
        try {
            console.log('Sending message data:', messageData);
            const result = await dispatch(sendMessage(messageData));
            
            if (result && result.success) {
                console.log('Message sent successfully:', result.data);
                setMessageText('');
                
                // Refresh the conversation after sending a message
                dispatch(getMessageDetail(selectedUser.id, currentUser._id, 'admin'));
                
                // Also send via WebSocket for real-time updates to other users
                const { sendMessage: socketSendMessage } = await import('../../../utils/socketService');
                socketSendMessage(result.data);
                
                // Scroll to bottom
                setTimeout(() => {
                    scrollToBottom();
                }, 100);
            } else {
                console.error('Failed to send message:', result?.error || 'Unknown error');
                alert('Failed to send message. Please try again.');
            }
        } catch (error) {
            console.error('Error in handleSendMessage:', error);
            alert('An error occurred while sending the message. Please try again.');
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
        }) + ' | ' + date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
        });
    };

    // Helper function to render user list
    const renderUserList = () => {
        if (userType === 2) {
            // Render broadcast options
            return (
                <List>
                    <ListItem 
                        button 
                        selected={broadcastType === 'all'}
                        onClick={() => handleBroadcastSelect('all')}
                        sx={{
                            borderRadius: 1,
                            mb: 0.5,
                            bgcolor: broadcastType === 'all' ? 'action.selected' : 'background.paper'
                        }}
                    >
                        <ListItemAvatar>
                            <Avatar sx={{ bgcolor: 'primary.main' }}>
                                <People />
                            </Avatar>
                        </ListItemAvatar>
                        <ListItemText 
                            primary="All Users" 
                            secondary="Broadcast to all teachers and students"
                        />
                    </ListItem>
                    
                    <ListItem 
                        button 
                        selected={broadcastType === 'all_teachers'}
                        onClick={() => handleBroadcastSelect('all_teachers')}
                        sx={{
                            borderRadius: 1,
                            mb: 0.5,
                            bgcolor: broadcastType === 'all_teachers' ? 'action.selected' : 'background.paper'
                        }}
                    >
                        <ListItemAvatar>
                            <Avatar sx={{ bgcolor: 'info.main' }}>
                                <Group />
                            </Avatar>
                        </ListItemAvatar>
                        <ListItemText 
                            primary="All Teachers" 
                            secondary={`Broadcast to ${teachers?.length || 0} teachers`}
                        />
                    </ListItem>
                    
                    <ListItem 
                        button 
                        selected={broadcastType === 'all_students'}
                        onClick={() => handleBroadcastSelect('all_students')}
                        sx={{
                            borderRadius: 1,
                            mb: 0.5,
                            bgcolor: broadcastType === 'all_students' ? 'action.selected' : 'background.paper'
                        }}
                    >
                        <ListItemAvatar>
                            <Avatar sx={{ bgcolor: 'success.main' }}>
                                <School />
                            </Avatar>
                        </ListItemAvatar>
                        <ListItemText 
                            primary="All Students" 
                            secondary={`Broadcast to ${students?.length || 0} students`}
                        />
                    </ListItem>
                </List>
            );
        }
        
        let usersToDisplay = [];
        
        if (userType === 0 && teachers) {
            usersToDisplay = teachers.filter(teacher => 
                teacher.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        } else if (userType === 1 && students) {
            usersToDisplay = students.filter(student => 
                student.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        
        if (usersToDisplay.length === 0) {
            return (
                <Box sx={{ p: 2, textAlign: 'center' }}>
                    <Typography color="text.secondary">
                        {userType === 0 
                            ? "No teachers found. Try a different search term." 
                            : "No students found. Try a different search term."}
                    </Typography>
                </Box>
            );
        }
        
        return usersToDisplay.map((user) => (
            <ListItem
                button
                key={user._id}
                onClick={() => handleUserSelect(user, userType === 0 ? 'teacher' : 'student')}
                selected={selectedUser && selectedUser.id === user._id}
                sx={{
                    borderRadius: 1,
                    mb: 0.5,
                    bgcolor: selectedUser && selectedUser.id === user._id ? 'action.selected' : 'background.paper'
                }}
            >
                <ListItemAvatar>
                    <Avatar>
                        {userType === 0 ? <Group /> : <School />}
                    </Avatar>
                </ListItemAvatar>
                <ListItemText 
                    primary={user.name}
                    secondary={userType === 0 
                        ? `Teacher - ${user.teachSubject?.map(s => s.subName).join(', ') || 'No subject assigned'}`
                        : `Student - ${user.sclassName?.sclassName || 'No class assigned'}`
                    }
                />
            </ListItem>
        ));
    };

    return (
        <Box sx={{ flexGrow: 1, p: 2 }}>
            <Paper elevation={3} sx={{ p: 2 }}>
                <Grid container spacing={2}>
                    {/* Header */}
                    <Grid item xs={12}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                            <Typography variant="h5" component="h1" gutterBottom>
                                Messages 
                                {socketConnected ? 
                                    <Tooltip title="Connected">
                                        <SignalWifi4Bar color="success" sx={{ ml: 1, verticalAlign: 'middle' }} />
                                    </Tooltip> : 
                                    <Tooltip title="Disconnected">
                                        <SignalWifiOff color="error" sx={{ ml: 1, verticalAlign: 'middle' }} />
                                    </Tooltip>
                                }
                            </Typography>
                            <Tooltip title="End-to-End Encrypted">
                                <Lock color="success" />
                            </Tooltip>
                        </Box>
                    </Grid>
                    
                    {/* Left sidebar - User list */}
                    <Grid item xs={12} md={4}>
                        <Paper elevation={2} sx={{ height: '75vh', display: 'flex', flexDirection: 'column' }}>
                            {/* Tabs for selecting user type */}
                            <Tabs 
                                value={userType}                                onChange={(e, newValue) => {
                                    setUserType(newValue);
                                    setSelectedUser(null);
                                    setRealTimeMessages([]);
                                    
                                    // If switching to broadcast tab, load broadcast messages
                                    if (newValue === 2 && currentUser?._id) {
                                        dispatch(getBroadcastMessages(currentUser._id, 'admin'));
                                        // Also set a default broadcast selection
                                        handleBroadcastSelect('all');
                                    }
                                }}
                                variant="fullWidth"
                                sx={{ borderBottom: 1, borderColor: 'divider' }}
                            >
                                <Tab 
                                    icon={<Group />} 
                                    label="Teachers" 
                                    id="user-type-tab-0"
                                    aria-controls="user-type-tabpanel-0"
                                />
                                <Tab 
                                    icon={<School />} 
                                    label="Students" 
                                    id="user-type-tab-1"
                                    aria-controls="user-type-tabpanel-1"
                                />
                                <Tab                                    icon={<Campaign />} 
                                    label="Broadcast" 
                                    id="user-type-tab-2"
                                    aria-controls="user-type-tabpanel-2"
                                />
                            </Tabs>
                            
                            {/* Search box */}
                            {userType !== 2 && (
                                <Box sx={{ p: 1, borderBottom: 1, borderColor: 'divider' }}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        placeholder={`Search ${userType === 0 ? 'teachers' : 'students'}...`}
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <Search />
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                </Box>
                            )}
                            
                            {/* User list */}
                            <Box sx={{ flexGrow: 1, overflow: 'auto', p: 1 }}>
                                <List sx={{ width: '100%' }}>
                                    {renderUserList()}
                                </List>
                            </Box>
                        </Paper>
                    </Grid>
                    
                    {/* Right side - Chat window */}
                    <Grid item xs={12} md={8}>
                        <Paper elevation={2} sx={{ height: '75vh', display: 'flex', flexDirection: 'column' }}>
                            {/* Chat header */}
                            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between' }}>
                                {selectedUser ? (
                                    <Box display="flex" alignItems="center">
                                        <Avatar sx={{ mr: 1, bgcolor: userType === 2 ? 'primary.main' : 'default' }}>
                                            {userType === 0 ? <Group /> : userType === 1 ? <School /> : <Campaign />}
                                        </Avatar>                                        <Box>
                                            <Typography variant="h6">{selectedUser.name}</Typography>
                                            <Typography variant="body2" color="text.secondary" component="span">
                                                {userType === 0 ? 'Teacher' : userType === 1 ? 'Student' : 'Broadcast'}
                                                {userType === 2 && (
                                                    <Chip 
                                                        size="small" 
                                                        label={`${broadcastType === 'all' ? 'All Users' : 
                                                                broadcastType === 'all_teachers' ? 'All Teachers' : 
                                                                'All Students'}`} 
                                                        color="primary" 
                                                        sx={{ ml: 1 }} 
                                                    />
                                                )}
                                            </Typography>
                                        </Box>
                                    </Box>
                                ) : (
                                    <Typography variant="body1" color="text.secondary">
                                        Select a {userType === 0 ? 'teacher' : userType === 1 ? 'student' : 'broadcast option'} to start messaging
                                    </Typography>
                                )}
                                
                                <IconButton 
                                    color="primary" 
                                    onClick={() => {
                                        if (selectedUser) {
                                            if (userType === 2) {
                                                dispatch(getBroadcastMessages(currentUser._id, 'admin'));
                                            } else {
                                                dispatch(getMessageDetail(selectedUser.id, currentUser._id, 'admin'));
                                            }
                                        }
                                    }}
                                    disabled={!selectedUser}
                                >
                                    <Refresh />
                                </IconButton>
                            </Box>
                            
                            {/* Message area */}
                            <Box sx={{ flexGrow: 1, p: 2, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
                                {loadingConversation ? (
                                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                                        <CircularProgress />
                                    </Box>
                                ) : selectedUser ? (                                    userType === 2 ? (
                                        // Show broadcast messages
                                        (broadcastMessages || []).length > 0 ? (
                                            (broadcastMessages || []).map((message, index) => (
                                                <Box 
                                                    key={message._id || index}
                                                    sx={{
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        alignItems: message.sender.id === currentUser._id ? 'flex-end' : 'flex-start',
                                                        mb: 2
                                                    }}
                                                >
                                                    <Box
                                                        sx={{
                                                            maxWidth: '70%',
                                                            p: 2,
                                                            borderRadius: 2,
                                                            bgcolor: message.sender.id === currentUser._id ? 'primary.light' : 'background.default',
                                                            boxShadow: 1
                                                        }}
                                                    >
                                                        <Typography variant="body1">{message.content}</Typography>
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                                                            <Typography variant="caption" color="text.secondary">
                                                                {formatDate(message.timestamp)}
                                                            </Typography>
                                                            <Tooltip title="End-to-End Encrypted">
                                                                <Lock fontSize="small" color="success" sx={{ ml: 1 }} />
                                                            </Tooltip>
                                                        </Box>
                                                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                                            <strong>To:</strong> {message.receiver.name}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            ))
                                        ) : (
                                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                                                <Typography color="text.secondary">No broadcast messages yet.</Typography>
                                            </Box>
                                        )
                                    ) : (
                                        // Show one-to-one messages
                                        combinedMessages && combinedMessages.length > 0 ? (
                                            combinedMessages.map((message, index) => (
                                                <Box 
                                                    key={message._id || index}
                                                    sx={{
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        alignItems: message.sender.id === currentUser._id ? 'flex-end' : 'flex-start',
                                                        mb: 2
                                                    }}
                                                >
                                                    <Box
                                                        sx={{
                                                            maxWidth: '70%',
                                                            p: 2,
                                                            borderRadius: 2,
                                                            bgcolor: message.sender.id === currentUser._id ? 'primary.light' : 'background.default',
                                                            boxShadow: 1
                                                        }}
                                                    >
                                                        <Typography variant="body1">{message.content}</Typography>
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                                                            <Typography variant="caption" color="text.secondary">
                                                                {formatDate(message.timestamp)}
                                                            </Typography>
                                                            <Tooltip title="End-to-End Encrypted">
                                                                <Lock fontSize="small" color="success" sx={{ ml: 1 }} />
                                                            </Tooltip>
                                                        </Box>
                                                    </Box>
                                                </Box>
                                            ))
                                        ) : (
                                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                                                <Typography color="text.secondary">No messages yet. Start the conversation!</Typography>
                                            </Box>
                                        )
                                    )
                                ) : (
                                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                                        <Typography color="text.secondary">
                                            Select a {userType === 0 ? 'teacher' : userType === 1 ? 'student' : 'broadcast option'} to view messages
                                        </Typography>
                                    </Box>
                                )}
                                <div ref={messagesEndRef} />
                            </Box>
                            
                            {/* Message input */}
                            <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
                                <Grid container spacing={1}>
                                    <Grid item xs>
                                        <TextField
                                            fullWidth
                                            placeholder={userType === 2 ? "Type your broadcast message..." : "Type a message..."}
                                            value={messageText}
                                            onChange={(e) => setMessageText(e.target.value)}
                                            onKeyPress={(e) => {
                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                    e.preventDefault();
                                                    handleSendMessage();
                                                }
                                            }}
                                            disabled={!selectedUser}
                                            InputProps={{
                                                endAdornment: (
                                                    <InputAdornment position="end">
                                                        <Tooltip title="End-to-End Encrypted">
                                                            <Lock color="success" />
                                                        </Tooltip>
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                    </Grid>
                                    <Grid item>
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            endIcon={userType === 2 ? <Campaign /> : <Send />}
                                            onClick={handleSendMessage}
                                            disabled={!selectedUser || !messageText.trim()}
                                        >
                                            {userType === 2 ? 'Broadcast' : 'Send'}
                                        </Button>
                                    </Grid>
                                </Grid>
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>
            </Paper>
        </Box>
    );
};

export default AdminMessages;
