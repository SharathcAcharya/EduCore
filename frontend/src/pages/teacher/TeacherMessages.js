import { useState, useEffect, useRef } from 'react';
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
import { allStudentsByClass } from '../../redux/studentRelated/studentHandle';
import { getAllAdmins } from '../../redux/adminRelated/adminHandle';
import { 
    initSocket, 
    joinChatRoom, 
    subscribeToMessages 
} from '../../utils/socketService';

const TeacherMessages = () => {    const dispatch = useDispatch();
    const { currentUser } = useSelector((state) => state.user);
    const { messages } = useSelector((state) => state.message);
    const { students } = useSelector((state) => state.student || { students: [] });
    const { admins } = useSelector((state) => state.admin || { admins: [] });

    const [selectedUser, setSelectedUser] = useState(null);
    const [messageText, setMessageText] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [userType, setUserType] = useState(0); // 0: Students, 1: Admins
    const [loadingConversation, setLoadingConversation] = useState(false);
    const [chatRoomId, setChatRoomId] = useState(null);
    const [realTimeMessages, setRealTimeMessages] = useState([]);
    const [socketConnected, setSocketConnected] = useState(false);
    const messagesEndRef = useRef(null);    useEffect(() => {
        // Initialize socket when component mounts
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
    }, [chatRoomId]);    useEffect(() => {
        if (currentUser?.school && currentUser?.teachSclass?._id) {
            // Make sure we're using the school ID as a string
            const schoolId = typeof currentUser.school === 'object' 
                ? currentUser.school._id 
                : currentUser.school;
                
            dispatch(getInbox(currentUser._id, 'teacher'));
            dispatch(allStudentsByClass(currentUser.teachSclass._id));
            dispatch(getAllAdmins(schoolId));
        }
    }, [dispatch, currentUser]);

    useEffect(() => {
        if (selectedUser) {
            setLoadingConversation(true);
            // Get conversation history
            dispatch(getMessageDetail(selectedUser.id, currentUser._id, 'teacher'))
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
    }, [dispatch, currentUser, selectedUser]);

    // Combine server messages with real-time messages
    const combinedMessages = [...(messages || []), ...realTimeMessages];
    
    // Sort messages by timestamp
    const sortedMessages = combinedMessages.sort((a, b) => 
        new Date(a.timestamp) - new Date(b.timestamp)
    );

    useEffect(() => {
        scrollToBottom();
    }, [sortedMessages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleUserSelect = (user, role) => {
        setSelectedUser({
            id: user._id,
            name: user.name,
            role: role,
        });
    };    const handleSendMessage = async () => {
        if (messageText.trim() && selectedUser) {
            // Create the message data structure
            const messageData = {
                sender: {
                    id: currentUser._id,
                    model: 'teacher',
                    name: currentUser.name
                },
                receiver: {
                    id: selectedUser.id,
                    model: selectedUser.role,
                    name: selectedUser.name
                },
                subject: `Message from ${currentUser.name}`,
                content: messageText.trim(),
                school: currentUser.school,
                timestamp: new Date().toISOString(),
                chatRoomId: chatRoomId
            };
            
            try {
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
                    alert('Failed to send message. Please try again.');
                }
            } catch (error) {
                console.error('Error sending message:', error);
                alert('Error sending message. Please try again.');
            }
            
            // Clear the message input
            setMessageText('');
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

    const filteredStudents = students && students.length > 0
        ? students.filter(student => 
            student.name.toLowerCase().includes(searchTerm.toLowerCase()))
        : [];

    const filteredAdmins = admins && admins.length > 0
        ? admins.filter(admin => 
            admin.name.toLowerCase().includes(searchTerm.toLowerCase()))
        : [];

    const handleTabChange = (event, newValue) => {
        setUserType(newValue);
        setSelectedUser(null);
    };
    
    const refreshMessages = () => {
        if (selectedUser) {
            setLoadingConversation(true);
            dispatch(getMessageDetail(selectedUser.id, currentUser._id, 'teacher'))
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
                                <Tab icon={<Group />} label="Students" />
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
                                filteredStudents.length > 0 ? (
                                    filteredStudents.map((student) => (
                                        <ListItem 
                                            key={student._id}
                                            button
                                            selected={selectedUser && selectedUser.id === student._id}
                                            onClick={() => handleUserSelect(student, 'student')}
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
                                                    <Person />
                                                </Avatar>
                                            </ListItemAvatar>
                                            <ListItemText 
                                                primary={student.name} 
                                                secondary={`Roll: ${student.rollNum}`} 
                                            />
                                        </ListItem>
                                    ))
                                ) : (
                                    <ListItem>
                                        <ListItemText primary="No students found" />
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
                                            {selectedUser.role === 'admin' ? <AdminPanelSettings /> : <Person />}
                                        </Avatar>
                                        <Typography variant="h6">
                                            {selectedUser.name}
                                        </Typography>
                                        <Typography variant="body2" color="textSecondary" sx={{ ml: 1 }}>
                                            {selectedUser.role === 'admin' ? 'Administrator' : 'Student'}
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
                                        </Box>
                                    ) : sortedMessages && sortedMessages.length > 0 ? (                                        sortedMessages.map((msg, index) => {
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

export default TeacherMessages;
