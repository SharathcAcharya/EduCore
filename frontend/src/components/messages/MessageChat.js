import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    Box,
    Paper,
    Typography,
    TextField,
    Button,
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    Avatar,
    Divider,
    IconButton,
    CircularProgress,
    Chip,
    Tooltip,
    Snackbar,
    Alert
} from '@mui/material';
import {
    Send as SendIcon,
    Person as PersonIcon,
    School as SchoolIcon,
    EmojiPeople as StudentIcon,
    SupervisorAccount as TeacherIcon,
    AdminPanelSettings as AdminIcon,
    Groups as GroupIcon,
    Refresh as RefreshIcon,
    AttachFile as AttachFileIcon
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { 
    getAllMessages, 
    getInbox, 
    sendMessage as sendReduxMessage
} from '../../redux/messageRelated/messageHandle';
import { 
    initSocket, 
    joinChatRoom, 
    joinRoleRoom,
    sendMessage as sendSocketMessage,
    sendBroadcastMessage as sendSocketBroadcast,
    subscribeToMessages,
    subscribeToBroadcasts,
    disconnectSocket
} from '../../utils/socketService';
import { formatDistanceToNow } from 'date-fns';

const MessageChat = ({ role }) => {
    const dispatch = useDispatch();
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);
    
    // Current user info
    const { currentUser } = useSelector(state => state.user);
    const { messages, inbox, loading, error } = useSelector(state => state.message);
    
    // Local state
    const [selectedChat, setSelectedChat] = useState(null);
    const [messageText, setMessageText] = useState('');
    const [subject, setSubject] = useState('');
    const [attachment, setAttachment] = useState(null);
    const [showBroadcastOptions, setShowBroadcastOptions] = useState(false);
    const [broadcastType, setBroadcastType] = useState('');
    const [notification, setNotification] = useState({ show: false, message: '', severity: 'info' });
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);
    const [chatInitialized, setChatInitialized] = useState(false);    // Initialize socket and fetch inbox on component mount
    useEffect(() => {
        let socketInitialized = false;
        
        if (currentUser && currentUser._id && !chatInitialized) {
            // Initialize socket with current user
            initSocket(currentUser);
            socketInitialized = true;
            
            // Join role-specific room for broadcasts
            joinRoleRoom(currentUser.role);
            
            // Fetch inbox messages
            dispatch(getInbox(currentUser._id, currentUser.role.toLowerCase()));
            
            setChatInitialized(true);
        }
        
        // Cleanup on unmount
        return () => {
            // Only disconnect if we initialized in this effect
            if (socketInitialized) {
                disconnectSocket();
            }
        };
    }, [dispatch, currentUser, chatInitialized]);

    // Subscribe to socket messages
    useEffect(() => {
        if (!currentUser) return;
        
        const unsubscribeMessages = subscribeToMessages((message) => {
            // If the received message is from the current chat, refresh messages
            if (selectedChat && 
                ((message.sender.id === selectedChat.id && message.receiver.id === currentUser._id) ||
                 (message.sender.id === currentUser._id && message.receiver.id === selectedChat.id))) {
                refreshMessages();
            } else {
                // Otherwise, refresh the inbox to show the new message
                dispatch(getInbox(currentUser._id, currentUser.role.toLowerCase()));
                
                // Show notification
                setNotification({
                    show: true,
                    message: `New message from ${message.sender.name}: ${message.subject}`,
                    severity: 'info'
                });
            }
        });
        
        const unsubscribeBroadcasts = subscribeToBroadcasts((message) => {
            // Always refresh inbox for broadcasts
            dispatch(getInbox(currentUser._id, currentUser.role.toLowerCase()));
            
            // Show notification
            setNotification({
                show: true,
                message: `Broadcast message: ${message.subject}`,
                severity: 'info'
            });
        });        return () => {
            unsubscribeMessages();
            unsubscribeBroadcasts();
        };
    }, [dispatch, currentUser, selectedChat]);

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Refresh messages for the current chat
    const refreshMessages = useCallback(async () => {
        if (!selectedChat) return;
        
        setIsLoadingMessages(true);
        try {
            await dispatch(getAllMessages(
                currentUser?._id, 
                currentUser?.role.toLowerCase(), 
                selectedChat.id, 
                selectedChat.model.toLowerCase()
            ));
        } catch (error) {
            console.error('Error refreshing messages:', error);
        } finally {
            setIsLoadingMessages(false);
        }
    }, [dispatch, currentUser, selectedChat]);

    // Select a chat from the inbox
    const handleSelectChat = async (chatInfo) => {
        setSelectedChat(chatInfo);
        setIsLoadingMessages(true);
        
        try {
            // Join the chat room via socket
            if (chatInfo.id) {
                joinChatRoom(currentUser._id, chatInfo.id);
            }
            
            // Fetch messages between these users
            await dispatch(getAllMessages(
                currentUser._id, 
                currentUser.role.toLowerCase(), 
                chatInfo.id, 
                chatInfo.model.toLowerCase()
            ));
        } catch (error) {
            console.error('Error fetching messages:', error);
            setNotification({
                show: true,
                message: 'Failed to load messages. Please try again.',
                severity: 'error'
            });        } finally {
            setIsLoadingMessages(false);
        }
    };

    // Handle sending a message
    const handleSendMessage = async () => {
        if (!messageText.trim() || !subject.trim() || !selectedChat) return;
        
        // Prepare message data
        const messageData = {
            sender: {
                id: currentUser._id,
                model: currentUser.role.toLowerCase(),
                name: currentUser.name
            },
            receiver: {
                id: selectedChat.id,
                model: selectedChat.model.toLowerCase(),
                name: selectedChat.name
            },
            subject: subject,
            content: messageText,
            school: currentUser.school || '',
            attachment: attachment ? 'attachment-placeholder' : ''
        };
        
        try {
            // Send via Redux for API (persistent storage)
            await dispatch(sendReduxMessage(messageData));
            
            // Also send via socket for real-time
            sendSocketMessage(messageData);
            
            // Clear form
            setMessageText('');
            setSubject('');
            setAttachment(null);
            
            // Refresh messages to show the new one
            refreshMessages();
            
            setNotification({
                show: true,
                message: 'Message sent successfully',
                severity: 'success'
            });
        } catch (error) {
            console.error('Error sending message:', error);
            setNotification({
                show: true,
                message: 'Failed to send message. Please try again.',
                severity: 'error'
            });
        }
    };

    // Handle sending a broadcast message
    const handleSendBroadcast = async () => {
        if (!messageText.trim() || !subject.trim() || !broadcastType) return;
        
        // Map broadcast type to receiver model
        let receiverModel;
        switch (broadcastType) {
            case 'teachers':
                receiverModel = 'all_teachers';
                break;
            case 'students':
                receiverModel = 'all_students';
                break;
            case 'all':
                receiverModel = 'all';
                break;
            default:
                receiverModel = 'all';
        }
        
        // Prepare broadcast data
        const broadcastData = {
            sender: {
                id: currentUser._id,
                model: currentUser.role.toLowerCase(),
                name: currentUser.name
            },
            receiver: {
                id: 'broadcast',
                model: receiverModel,
                name: `All ${broadcastType}`
            },
            subject: subject,
            content: messageText,
            school: currentUser.school || '',
            attachment: attachment ? 'attachment-placeholder' : '',
            isBroadcast: true
        };
        
        try {
            // Send via Redux for API (persistent storage)
            await dispatch(sendReduxMessage(broadcastData));
            
            // Also send via socket for real-time
            sendSocketBroadcast(broadcastData);
            
            // Clear form
            setMessageText('');
            setSubject('');
            setAttachment(null);
            setShowBroadcastOptions(false);
            setBroadcastType('');
            
            // Refresh inbox
            dispatch(getInbox(currentUser._id, currentUser.role.toLowerCase()));
            
            setNotification({
                show: true,
                message: 'Broadcast message sent successfully',
                severity: 'success'
            });
        } catch (error) {
            console.error('Error sending broadcast message:', error);
            setNotification({
                show: true,
                message: 'Failed to send broadcast message. Please try again.',
                severity: 'error'
            });
        }
    };    // Get avatar for a user based on their role
    const getUserAvatar = (userRole) => {
        if (!userRole) return <PersonIcon />;
        
        switch (userRole.toLowerCase()) {
            case 'admin':
                return <AdminIcon />;
            case 'teacher':
                return <TeacherIcon />;
            case 'student':
                return <StudentIcon />;
            case 'all_teachers':
            case 'all_students':
            case 'all':
                return <GroupIcon />;
            default:
                return <PersonIcon />;
        }
    };

    // Format the timestamp for display
    const formatMessageTime = (timestamp) => {
        try {
            return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
        } catch (error) {
            return 'Unknown time';
        }
    };    // Render broadcast options based on user role
    const renderBroadcastOptions = () => {
        if (!currentUser || !currentUser.role) return null;
        
        if (currentUser.role.toLowerCase() === 'admin') {
            return (
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <Chip 
                        label="All Teachers" 
                        clickable
                        color={broadcastType === 'teachers' ? 'primary' : 'default'}
                        onClick={() => setBroadcastType('teachers')}
                        icon={<TeacherIcon />}
                    />
                    <Chip 
                        label="All Students" 
                        clickable
                        color={broadcastType === 'students' ? 'primary' : 'default'}
                        onClick={() => setBroadcastType('students')}
                        icon={<StudentIcon />}
                    />
                    <Chip 
                        label="Everyone" 
                        clickable
                        color={broadcastType === 'all' ? 'primary' : 'default'}
                        onClick={() => setBroadcastType('all')}
                        icon={<GroupIcon />}
                    />
                </Box>
            );
        } else if (currentUser.role.toLowerCase() === 'teacher') {
            return (
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <Chip 
                        label="My Students" 
                        clickable
                        color={broadcastType === 'students' ? 'primary' : 'default'}
                        onClick={() => setBroadcastType('students')}
                        icon={<StudentIcon />}
                    />
                </Box>
            );
        }
        
        return null;
    };

    return (
        <Box sx={{ display: 'flex', height: 'calc(100vh - 150px)', overflow: 'hidden' }}>
            {/* Left sidebar - Inbox */}
            <Paper 
                elevation={3} 
                sx={{ 
                    width: 300, 
                    mr: 2, 
                    display: 'flex', 
                    flexDirection: 'column',
                    borderRadius: 2,
                    overflow: 'hidden'
                }}
            >
                <Box sx={{ 
                    p: 2, 
                    bgcolor: 'primary.main', 
                    color: 'white',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <Typography variant="h6">Messages</Typography>
                    <IconButton 
                        size="small" 
                        color="inherit"
                        onClick={() => dispatch(getInbox(currentUser._id, currentUser.role.toLowerCase()))}
                    >
                        <RefreshIcon />
                    </IconButton>
                </Box>
                
                <Box sx={{ overflow: 'auto', flexGrow: 1 }}>
                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                            <CircularProgress />
                        </Box>
                    ) : inbox && inbox.length > 0 ? (
                        <List>
                            {inbox.map((chat, index) => (
                                <React.Fragment key={`${chat.id}-${index}`}>
                                    <ListItem 
                                        button 
                                        selected={selectedChat && selectedChat.id === chat.id}
                                        onClick={() => handleSelectChat(chat)}
                                    >
                                        <ListItemAvatar>
                                            <Avatar>
                                                {getUserAvatar(chat.model)}
                                            </Avatar>
                                        </ListItemAvatar>
                                        <ListItemText 
                                            primary={                                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <Typography 
                                                        variant="body1" 
                                                        sx={{ 
                                                            fontWeight: chat.unread ? 700 : 400,
                                                            width: '70%',
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis',
                                                            whiteSpace: 'nowrap'
                                                        }}
                                                    >
                                                        {chat.name || 'Unknown Contact'}
                                                    </Typography>
                                                    {chat.unread && (
                                                        <Chip 
                                                            size="small" 
                                                            label={chat.unreadCount || 'New'} 
                                                            color="primary" 
                                                            sx={{ height: 20, ml: 1 }}
                                                        />
                                                    )}
                                                </Box>
                                            }
                                            secondary={
                                                <Typography 
                                                    variant="body2" 
                                                    color="text.secondary"
                                                    sx={{ 
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        whiteSpace: 'nowrap'
                                                    }}
                                                >
                                                    {chat.lastMessage || 'Start a conversation'}
                                                </Typography>
                                            }
                                        />
                                    </ListItem>
                                    <Divider component="li" />
                                </React.Fragment>
                            ))}
                        </List>
                    ) : (
                        <Box sx={{ p: 3, textAlign: 'center' }}>
                            <Typography color="text.secondary">No messages yet</Typography>
                        </Box>
                    )}
                </Box>
                
                <Box sx={{ p: 2 }}>
                    <Button
                        fullWidth
                        variant="contained"
                        onClick={() => setShowBroadcastOptions(!showBroadcastOptions)}
                        startIcon={<GroupIcon />}
                        sx={{ mb: 1 }}
                    >
                        {showBroadcastOptions ? 'Cancel Broadcast' : 'Send Broadcast'}
                    </Button>
                </Box>
            </Paper>
            
            {/* Right side - Chat or Broadcast */}
            <Paper 
                elevation={3} 
                sx={{ 
                    flexGrow: 1, 
                    display: 'flex', 
                    flexDirection: 'column',
                    borderRadius: 2,
                    overflow: 'hidden'
                }}
            >
                {/* Chat Header */}
                <Box sx={{ 
                    p: 2, 
                    bgcolor: 'primary.main', 
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center'
                }}>
                    {showBroadcastOptions ? (
                        <>
                            <GroupIcon sx={{ mr: 1 }} />
                            <Typography variant="h6">
                                Broadcast Message
                            </Typography>
                        </>
                    ) : selectedChat ? (
                        <>
                            <Avatar sx={{ mr: 2 }}>
                                {getUserAvatar(selectedChat.model)}
                            </Avatar>
                            <Typography variant="h6">
                                {selectedChat.name}
                            </Typography>
                        </>
                    ) : (
                        <Typography variant="h6">
                            Select a conversation
                        </Typography>
                    )}
                </Box>
                
                {/* Broadcast UI */}
                {showBroadcastOptions ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', p: 2, flexGrow: 1 }}>
                        <Typography variant="subtitle1" gutterBottom>
                            Send message to:
                        </Typography>
                        
                        {renderBroadcastOptions()}
                        
                        <TextField
                            label="Subject"
                            variant="outlined"
                            fullWidth
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            sx={{ mb: 2 }}
                        />
                        
                        <TextField
                            label="Message"
                            variant="outlined"
                            fullWidth
                            multiline
                            rows={6}
                            value={messageText}
                            onChange={(e) => setMessageText(e.target.value)}
                            sx={{ mb: 2 }}
                        />
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 'auto' }}>
                            <Button
                                variant="outlined"
                                startIcon={<AttachFileIcon />}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                Attach File
                            </Button>
                            
                            <Button
                                variant="contained"
                                endIcon={<SendIcon />}
                                disabled={!messageText.trim() || !subject.trim() || !broadcastType}
                                onClick={handleSendBroadcast}
                            >
                                Send Broadcast
                            </Button>
                            
                            <input
                                type="file"
                                ref={fileInputRef}
                                style={{ display: 'none' }}
                                onChange={(e) => setAttachment(e.target.files?.[0] || null)}
                            />
                        </Box>
                        
                        {attachment && (
                            <Box sx={{ mt: 2 }}>
                                <Chip
                                    label={attachment.name}
                                    onDelete={() => setAttachment(null)}
                                    color="primary"
                                    variant="outlined"
                                />
                            </Box>
                        )}
                    </Box>
                ) : (
                    <>
                        {/* Chat Messages */}
                        <Box sx={{ flexGrow: 1, p: 2, overflow: 'auto' }}>
                            {isLoadingMessages ? (
                                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                                    <CircularProgress />
                                </Box>
                            ) : selectedChat ? (
                                messages && messages.length > 0 ? (
                                    <List>                                        {messages.map((message, index) => {
                                            const isCurrentUser = currentUser && message.sender && message.sender.id === currentUser._id;
                                            return (
                                                <ListItem
                                                    key={`${message._id || index}-${index}`}
                                                    sx={{ 
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        alignItems: isCurrentUser ? 'flex-end' : 'flex-start',
                                                        mb: 1
                                                    }}
                                                >
                                                    <Box 
                                                        sx={{ 
                                                            maxWidth: '80%',
                                                            bgcolor: isCurrentUser ? 'primary.light' : 'grey.100',
                                                            color: isCurrentUser ? 'white' : 'text.primary',
                                                            p: 2,
                                                            borderRadius: 2
                                                        }}
                                                    >
                                                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                                            {message.subject}
                                                        </Typography>
                                                        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                                                            {message.content}
                                                        </Typography>
                                                        <Typography variant="caption" color={isCurrentUser ? 'grey.300' : 'text.secondary'} sx={{ display: 'block', mt: 1, textAlign: 'right' }}>
                                                            {formatMessageTime(message.createdAt)}
                                                        </Typography>
                                                    </Box>
                                                </ListItem>
                                            );
                                        })}
                                        <div ref={messagesEndRef} />
                                    </List>
                                ) : (
                                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                                        <Typography color="text.secondary">
                                            No messages yet. Start the conversation!
                                        </Typography>
                                    </Box>
                                )
                            ) : (
                                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                                    <Typography color="text.secondary">
                                        Select a conversation from the sidebar
                                    </Typography>
                                </Box>
                            )}
                        </Box>
                        
                        {/* Message Input */}
                        {selectedChat && (
                            <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
                                <TextField
                                    label="Subject"
                                    variant="outlined"
                                    fullWidth
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    sx={{ mb: 2 }}
                                />
                                
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <TextField
                                        label="Type a message"
                                        variant="outlined"
                                        fullWidth
                                        value={messageText}
                                        onChange={(e) => setMessageText(e.target.value)}
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleSendMessage();
                                            }
                                        }}
                                    />
                                    
                                    <Tooltip title="Attach File">
                                        <IconButton 
                                            sx={{ ml: 1 }} 
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            <AttachFileIcon />
                                        </IconButton>
                                    </Tooltip>
                                    
                                    <Button
                                        variant="contained"
                                        endIcon={<SendIcon />}
                                        disabled={!messageText.trim() || !subject.trim()}
                                        onClick={handleSendMessage}
                                        sx={{ ml: 1 }}
                                    >
                                        Send
                                    </Button>
                                    
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        style={{ display: 'none' }}
                                        onChange={(e) => setAttachment(e.target.files?.[0] || null)}
                                    />
                                </Box>
                                
                                {attachment && (
                                    <Box sx={{ mt: 2 }}>
                                        <Chip
                                            label={attachment.name}
                                            onDelete={() => setAttachment(null)}
                                            color="primary"
                                            variant="outlined"
                                        />
                                    </Box>
                                )}
                            </Box>
                        )}
                    </>
                )}
            </Paper>
            
            {/* Notification Snackbar */}
            <Snackbar
                open={notification.show}
                autoHideDuration={6000}
                onClose={() => setNotification({ ...notification, show: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert 
                    onClose={() => setNotification({ ...notification, show: false })} 
                    severity={notification.severity} 
                    elevation={6} 
                    variant="filled"
                >
                    {notification.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default MessageChat;
