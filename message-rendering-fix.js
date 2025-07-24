// This fix adds validation to ensure message data is valid before rendering
// and improves the key generation to prevent duplicate key warnings

// Improve message rendering
// 1. Add checks for null/undefined properties
// 2. Use a more robust key generation strategy
// 3. Handle edge cases gracefully

// Apply this to StudentMessages.js around line 484-525
// Replace the sortedMessages.map section with this code:

sortedMessages.map((msg, index) => {
    // Skip rendering if message is invalid
    if (!msg || !msg.sender || !msg.content) {
        return null;
    }
    
    // Check if current user ID matches message sender ID
    const isCurrentUser = msg.sender.id === currentUser._id;
    
    // Create a guaranteed unique key using multiple properties
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
            >
                <Typography variant="body1">
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
