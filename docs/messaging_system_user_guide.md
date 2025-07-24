# EduSphere Messaging System - User Guide

## Overview

The EduSphere messaging system allows real-time communication between administrators, teachers, and students. The system supports both direct messages and broadcasts.

## Features

- **Direct Messaging**: Send private messages to specific users
- **Broadcast Messaging**: Send messages to groups of users (all teachers, all students, or everyone)
- **Real-time Updates**: Messages appear instantly without refreshing
- **Message History**: View all past conversations
- **Secure Communication**: Messages are encrypted for privacy

## How to Use

### For All Users

1. The messaging system is now integrated directly into your dashboard
2. Look for the "Communication Center" or "Messaging Center" panel
3. Your inbox shows all conversations on the left side
4. Select a conversation to view and reply to messages
5. To send a new message, use the input fields at the bottom of the chat

### For Administrators

Administrators have additional broadcasting capabilities:

- Click "Send Broadcast" to create a broadcast message
- Choose the recipient group (All Teachers, All Students, or Everyone)
- Write your subject and message, then click Send

### For Teachers

Teachers can:

- Message any student in their class
- Message school administrators
- Send broadcasts to their students

### For Students

Students can:

- Message their teachers
- Message school administrators
- View broadcasts sent to them

## Technical Implementation

The messaging system uses:

- Socket.IO for real-time communication
- MongoDB for message storage
- AES encryption for message security
- Role-based channels for broadcast messages

## Troubleshooting

If you encounter any issues with the messaging system:

1. **Messages not appearing?** Check your internet connection and refresh the page
2. **Can't send messages?** Ensure all fields (subject and message) are filled out
3. **Not receiving broadcasts?** Make sure you're logged in with the correct role
4. **Message errors?** Contact your system administrator

For technical support, please contact the IT department at your school.

## Privacy and Security

All messages in the EduSphere system are encrypted for security. Administrators cannot read direct messages between other users. However, all communications must adhere to school policies regarding appropriate use of school resources.
