import React from 'react';
import { Dialog, DialogTitle, DialogContent, IconButton, Typography } from '@mui/material';
import { Close } from '@mui/icons-material';

/**
 * FormDialog component for displaying forms in a modal dialog
 * @param {string} title - The title of the dialog
 * @param {boolean} openPopup - Whether the dialog is open
 * @param {function} setOpenPopup - Function to set the open state
 * @param {function} onClose - Optional callback when dialog is closed
 * @param {ReactNode} children - The content of the dialog
 */
const FormDialog = ({ title, children, openPopup, setOpenPopup, onClose }) => {
    
    const handleClose = () => {
        setOpenPopup(false);
        if (onClose) {
            onClose();
        }
    };
    
    return (
        <Dialog 
            open={openPopup} 
            maxWidth="md" 
            fullWidth
            onClose={handleClose}
        >
            <DialogTitle>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6">{title}</Typography>
                    <IconButton onClick={handleClose}>
                        <Close />
                    </IconButton>
                </div>
            </DialogTitle>
            <DialogContent dividers>
                {children}
            </DialogContent>
        </Dialog>
    );
};

export default FormDialog;
