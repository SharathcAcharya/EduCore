import React, { useState, useEffect, useRef } from 'react';
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
    Tooltip
} from '@mui/material';
import {
    Send,
    Search,
    School,
    Group,
    Message,
    Refresh,
    AdminPanelSettings,
    Person,
    SignalWifi4Bar,
    SignalWifiOff
} from '@mui/icons-material';
import { 
    getInbox, 
    getMessageDetail,
    sendMessage 
} from '../../redux/messageRelated/messageHandle';
import { getAllTeachersByClass } from '../../redux/teacherRelated/teacherHandle';
import { getAllAdmins } from '../../redux/adminRelated/adminHandle';
import { 
    initSocket, 
    joinChatRoom, 
    subscribeToMessages 
} from '../../utils/socketService';

const StudentMessages = () => {    const dispatch = useDispatch();
    const { currentUser } = useSelector((state) => state.user);
    const { messages } = useSelector((state) => state.message) || {};
    const { teachers } = useSelector((state) => state.teacher) || { teachers: [] };
    const { admins } = useSelector((state) => state.admin) || { admins: [] };
    
    const [selectedUser, setSelectedUser] = useState(null);
    const [messageText, setMessageText] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [userType, setUserType] = useState(0); // 0: Teachers, 1: Admins
    const [loadingConversation, setLoadingConversation] = useState(false);
    const [chatRoomId, setChatRoomId] = useState(null);
    const [realTimeMessages, setRealTimeMessages] = useState([]);
    const [socketConnected, setSocketConnected] = useState(false);
    const messagesEndRef = useRef(null);    // Initialize socket
    useEffect(() => {
        const socket = initSocket();
        
        socket.on('connect', () => {
            setSocketConnected(true);
        });
        
        socket.on('disconnect', () => {
            setSocketConnected(false);
        });
        
        return () => {
            // Clean up socket connection when component unmounts
            if (chatRoomId) {
                // Handle any cleanup if needed
            }
            socket.off('connect');
            socket.off('disconnect');
        };
    }, [chatRoomId]);    // Load initial data
    useEffect(() => {
        if (currentUser?.school && currentUser?.sclassName?._id) {
            const loadData = async () => {
                try {
                    // Make sure we're using the school ID as a string
                    const schoolId = typeof currentUser.school === 'object' 
                        ? currentUser.school._id 
                        : currentUser.school;
                        
                    await Promise.all([
                        dispatch(getInbox(currentUser._id, 'student')),
                        dispatch(getAllTeachersByClass(currentUser.sclassName._id)),
                        dispatch(getAllAdmins(schoolId))
                    ]);
                } catch (error) {
                    console.error('Error loading messages data:', error);
                }
            };
            loadData();
        }
    }, [dispatch, currentUser?.school, currentUser?._id, currentUser?.sclassName?._id]);

    // Load conversation when user is selected
    useEffect(() => {
        if (selectedUser) {
            setLoadingConversation(true);
            // Get conversation history
            dispatch(getMessageDetail(selectedUser.id, currentUser._id, 'student'))
                .finally(() => setLoadingConversation(false));
            
            // Join chat room for real-time messaging
            const roomId = joinChatRoom(currentUser._id, selectedUser.id);
            setChatRoomId(roomId);
            
            // Reset real-time messages when changing users
            setRealTimeMessages([]);
            
            // Subscribe to new messages
            const unsubscribe = subscribeToMessages((message) => {
                if (message.chatRoomId === roomId) {
                    setRealTimeMessages(prevMessages => [...prevMessages, message]);
                }
            });
            
            return () => {
                unsubscribe();
            };
        }
    }, [dispatch, currentUser?._id, selectedUser]);    // Combine server messages with real-time messages with improved deduplication
    const combinedMessages = React.useMemo(() => {
        // Start with server-fetched messages
        const baseMessages = Array.isArray(messages) ? [...messages] : [];
        
        // Create a Set of message IDs to track which messages we already have
        const messageIds = new Set(baseMessages.map(msg => msg._id || ''));
        
        // Track seen message content with timestamps to detect duplicates even without IDs
        const messageSignatures = new Set(
            baseMessages.map(msg => 
                `${msg.sender?.id || ''}-${msg.content || ''}-${msg.timestamp || ''}`
            )
        );
        
        // Only add real-time messages that aren't duplicates
        const uniqueRealTimeMessages = (Array.isArray(realTimeMessages) ? realTimeMessages : [])
            .filter(rtMsg => {
                // Skip if message is invalid
                if (!rtMsg || !rtMsg.sender || !rtMsg.content) {
                    return false;
                }
                
                // If the message has an ID and it's not already in our list, add it
                if (rtMsg._id && !messageIds.has(rtMsg._id)) {
                    messageIds.add(rtMsg._id);
                    
                    // Also check content signature
                    const signature = `${rtMsg.sender.id || ''}-${rtMsg.content || ''}-${rtMsg.timestamp || ''}`;
                    if (!messageSignatures.has(signature)) {
                        messageSignatures.add(signature);
                        return true;
                    }
                }
                
                // If it doesn't have an ID, check by content signature
                if (!rtMsg._id) {
                    const signature = `${rtMsg.sender.id || ''}-${rtMsg.content || ''}-${rtMsg.timestamp || ''}`;
                    if (!messageSignatures.has(signature)) {
                        messageSignatures.add(signature);
                        return true;
                    }
                }
                
                return false;
            });
        
        return [...baseMessages, ...uniqueRealTimeMessages];
    }, [messages, realTimeMessages]);
    
    // Sort messages by timestamp
    const sortedMessages = React.useMemo(() => {
        return [...combinedMessages].sort((a, b) => 
            new Date(a.timestamp) - new Date(b.timestamp)
        );
    }, [combinedMessages]);

    // Scroll to bottom when messages update
    useEffect(() => {
        scrollToBottom();
    }, [sortedMessages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // Filter and memoize teachers list
    const filteredTeachers = React.useMemo(() => {
        if (!Array.isArray(teachers)) return [];
        return teachers.filter(teacher => 
            teacher?.name?.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [teachers, searchTerm]);

    // Filter and memoize admins list
    const filteredAdmins = React.useMemo(() => {
        if (!Array.isArray(admins)) return [];
        return admins.filter(admin =>
            admin?.name?.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [admins, searchTerm]);

    // Handler for selecting a user to message
    const handleUserSelect = (user, role) => {
        setSelectedUser({
            id: user._id,
            name: user.name,
            role: role,
        });
    };    // Handler for sending a message
    const handleSendMessage = async () => {
        if (messageText.trim() && selectedUser) {
            try {
                // Get school ID correctly, ensuring it's a string
                let schoolId;
                if (typeof currentUser.school === 'object') {
                    schoolId = currentUser.school._id;
                } else {
                    schoolId = currentUser.school;
                }
                
                // Validate we have a valid school ID
                if (!schoolId) {
                    throw new Error('Missing school ID');
                }
                
                const messageData = {
                    sender: {
                        id: currentUser._id,
                        model: 'student',
                        name: currentUser.name
                    },
                    receiver: {
                        id: selectedUser.id,
                        model: selectedUser.role,
                        name: selectedUser.name
                    },
                    subject: `Message from ${currentUser.name}`,
                    content: messageText.trim(),
                    school: schoolId,
                    timestamp: new Date().toISOString(),
                    chatRoomId: chatRoomId
                };
                
                console.log('Preparing to send message:', JSON.stringify(messageData, null, 2));
                
                // Clear the message input right away for better UX
                setMessageText('');
                
                // Send message to server via API
                const result = await dispatch(sendMessage(messageData));
                
                if (result.success) {
                    console.log('Message sent successfully:', result.data);
                    
                    // Add the successfully saved message to real-time messages
                    setRealTimeMessages(prevMessages => [...prevMessages, result.data]);
                    
                    // Also send via WebSocket for real-time updates
                    import('../../utils/socketService').then(({ sendMessage: socketSendMessage }) => {
                        socketSendMessage(result.data);
                    });
                } else {
                    console.error('Failed to send message:', result.error);
                    alert(`Failed to send message: ${result.error.message}`);
                    // Restore message text if sending failed
                    setMessageText(messageData.content);
                }
            } catch (error) {
                console.error('Error in handleSendMessage:', error);
                alert(`Error sending message: ${error.message || 'Unknown error'}`);
            }
        }
    };

    // Format timestamp for display
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

    // Handle tab change between teachers and admins
    const handleTabChange = (event, newValue) => {
        setUserType(newValue);
        setSelectedUser(null);
    };

    // Refresh current conversation
    const refreshMessages = () => {
        if (selectedUser) {
            setLoadingConversation(true);
            dispatch(getMessageDetail(selectedUser.id, currentUser._id, 'student'))
                .finally(() => {
                    setLoadingConversation(false);
                    // Clear real-time messages to avoid duplicates after refreshing from server
                    setRealTimeMessages([]);
                });
        }
    };

    return (
        <Box sx={{ p: 2 }}>            <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Message sx={{ mr: 1 }} />
                Messaging Center
                <Tooltip title={socketConnected ? "Connected to messaging service" : "Disconnected from messaging service"}>
                    <IconButton size="small" sx={{ ml: 1 }}>
                        {socketConnected ? 
                            <SignalWifi4Bar color="success" fontSize="small" /> : 
                            <SignalWifiOff color="error" fontSize="small" />
                        }
                    </IconButton>
                </Tooltip>
            </Typography>

            <Grid container spacing={2} sx={{ height: 'calc(100vh - 180px)' }}>
                {/* Users List */}
                <Grid item xs={12} md={4} lg={3}>
                    <Paper 
                        elevation={3} 
                        sx={{ 
                            height: '100%', 
                            overflow: 'hidden',
                            display: 'flex',
                            flexDirection: 'column'
                        }}
                    >
                        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                            <Tabs 
                                value={userType} 
                                onChange={handleTabChange} 
                                variant="fullWidth"
                            >
                                <Tab icon={<School />} label="Teachers" />
                                <Tab icon={<AdminPanelSettings />} label="Admins" />
                            </Tabs>
                        </Box>

                        <Box sx={{ p: 1 }}>
                            <TextField
                                fullWidth
                                size="small"
                                placeholder="Search..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Search fontSize="small" />
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{ mb: 1 }}
                            />
                        </Box>

                        <Divider />
                        
                        <List sx={{ 
                            overflowY: 'auto', 
                            flexGrow: 1,
                            '&::-webkit-scrollbar': {
                                width: '0.4em'
                            },
                            '&::-webkit-scrollbar-track': {
                                background: '#f1f1f1'
                            },
                            '&::-webkit-scrollbar-thumb': {
                                backgroundColor: '#888'
                            }
                        }}>
                            {userType === 0 ? (
                                filteredTeachers.length > 0 ? (
                                    filteredTeachers.map((teacher) => (
                                        <ListItem 
                                            key={teacher._id}
                                            button
                                            selected={selectedUser && selectedUser.id === teacher._id}
                                            onClick={() => handleUserSelect(teacher, 'teacher')}
                                            sx={{
                                                '&.Mui-selected': {
                                                    backgroundColor: 'rgba(25, 118, 210, 0.08)',
                                                },
                                                '&.Mui-selected:hover': {
                                                    backgroundColor: 'rgba(25, 118, 210, 0.12)',
                                                },
                                            }}
                                        >
                                            <ListItemAvatar>
                                                <Avatar>
                                                    <School />
                                                </Avatar>
                                            </ListItemAvatar>
                                            <ListItemText 
                                                primary={teacher.name} 
                                                secondary={teacher.teachSubject ? teacher.teachSubject.subName : 'Teacher'} 
                                            />
                                        </ListItem>
                                    ))
                                ) : (
                                    <ListItem>
                                        <ListItemText primary="No teachers found" />
                                    </ListItem>
                                )
                            ) : (
                                filteredAdmins.length > 0 ? (
                                    filteredAdmins.map((admin) => (
                                        <ListItem 
                                            key={admin._id}
                                            button
                                            selected={selectedUser && selectedUser.id === admin._id}
                                            onClick={() => handleUserSelect(admin, 'admin')}
                                            sx={{
                                                '&.Mui-selected': {
                                                    backgroundColor: 'rgba(25, 118, 210, 0.08)',
                                                },
                                                '&.Mui-selected:hover': {
                                                    backgroundColor: 'rgba(25, 118, 210, 0.12)',
                                                },
                                            }}
                                        >
                                            <ListItemAvatar>
                                                <Avatar>
                                                    <AdminPanelSettings />
                                                </Avatar>
                                            </ListItemAvatar>
                                            <ListItemText 
                                                primary={admin.name} 
                                                secondary="Administrator" 
                                            />
                                        </ListItem>
                                    ))
                                ) : (
                                    <ListItem>
                                        <ListItemText primary="No administrators found" />
                                    </ListItem>
                                )
                            )}
                        </List>
                    </Paper>
                </Grid>

                {/* Messages Area */}
                <Grid item xs={12} md={8} lg={9}>
                    <Paper 
                        elevation={3} 
                        sx={{ 
                            height: '100%', 
                            display: 'flex',
                            flexDirection: 'column'
                        }}
                    >
                        {selectedUser ? (
                            <>
                                <Box 
                                    sx={{ 
                                        p: 2, 
                                        borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <Avatar sx={{ mr: 1 }}>
                                            {selectedUser.role === 'admin' ? <AdminPanelSettings /> : <School />}
                                        </Avatar>
                                        <Typography variant="h6">
                                            {selectedUser.name}
                                        </Typography>
                                        <Typography variant="body2" color="textSecondary" sx={{ ml: 1 }}>
                                            {selectedUser.role === 'admin' ? 'Administrator' : 'Teacher'}
                                        </Typography>
                                    </Box>
                                    <IconButton color="primary" onClick={refreshMessages}>
                                        <Refresh />
                                    </IconButton>
                                </Box>

                                <Box 
                                    sx={{ 
                                        p: 2, 
                                        flexGrow: 1, 
                                        overflowY: 'auto',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        '&::-webkit-scrollbar': {
                                            width: '0.4em'
                                        },
                                        '&::-webkit-scrollbar-track': {
                                            background: '#f1f1f1'
                                        },
                                        '&::-webkit-scrollbar-thumb': {
                                            backgroundColor: '#888'
                                        }
                                    }}
                                >
                                    {loadingConversation ? (
                                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                                            <CircularProgress />
                                        </Box>                                    ) : sortedMessages && sortedMessages.length > 0 ? (                                        sortedMessages.map((msg, index) => {
                                            // Skip rendering if message is invalid
                                            if (!msg || !msg.sender || !msg.content) {
                                                return null;
                                            }
                                            
                                            const isCurrentUser = msg.sender.id === currentUser._id;
                                            // Create a guaranteed unique key combining multiple properties
                                            const uniqueKey = msg._id ? 
                                                `${msg._id}-${index}` : 
                                                `msg-${index}-${new Date(msg.timestamp || Date.now()).getTime()}-${msg.sender.id || 'unknown'}-${(msg.content || '').substring(0, 10)}`;
                                            
                                            return (
                                                <Box 
                                                    key={uniqueKey}
                                                    sx={{ 
                                                        alignSelf: isCurrentUser ? 'flex-end' : 'flex-start',
                                                        maxWidth: '75%',
                                                        mb: 2
                                                    }}
                                                >
                                                    <Paper 
                                                        elevation={1}
                                                        sx={{ 
                                                            p: 2, 
                                                            backgroundColor: isCurrentUser ? 'primary.light' : 'grey.100',
                                                            color: isCurrentUser ? 'white' : 'inherit',
                                                            borderRadius: isCurrentUser 
                                                                ? '20px 20px 5px 20px' 
                                                                : '20px 20px 20px 5px',
                                                        }}
                                                    >                                                        <Typography variant="body1">
                                                            {msg.content || msg.message || 'No message content'}
                                                        </Typography>
                                                        <Typography 
                                                            variant="caption" 
                                                            sx={{ 
                                                                display: 'block', 
                                                                mt: 1,
                                                                textAlign: 'right',
                                                                opacity: 0.8
                                                            }}
                                                        >
                                                            {formatDate(msg.timestamp || new Date())}
                                                        </Typography>
                                                    </Paper>
                                                </Box>
                                            );
                                        })
                                    ) : (
                                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                                            <Typography variant="body1" color="textSecondary">
                                                No messages yet. Start a conversation!
                                            </Typography>
                                        </Box>
                                    )}
                                    <div ref={messagesEndRef} />
                                </Box>

                                <Box 
                                    component="form" 
                                    sx={{ 
                                        p: 2, 
                                        borderTop: '1px solid rgba(0, 0, 0, 0.12)',
                                        display: 'flex',
                                        alignItems: 'center'
                                    }}
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        handleSendMessage();
                                    }}
                                >
                                    <TextField
                                        fullWidth
                                        placeholder="Type your message..."
                                        value={messageText}
                                        onChange={(e) => setMessageText(e.target.value)}
                                        variant="outlined"
                                        size="small"
                                        sx={{ mr: 1 }}
                                    />
                                    <Button 
                                        variant="contained" 
                                        color="primary" 
                                        endIcon={<Send />}
                                        disabled={!messageText.trim()}
                                        type="submit"
                                    >
                                        Send
                                    </Button>
                                </Box>
                            </>
                        ) : (
                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                                <Typography variant="h6" color="textSecondary">
                                    Select a user to start messaging
                                </Typography>
                            </Box>
                        )}
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default StudentMessages;
