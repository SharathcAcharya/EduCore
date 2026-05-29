import {
    TableCell,
    TableRow,
    styled,
    tableCellClasses,
    Drawer as MuiDrawer,
    AppBar as MuiAppBar,
} from "@mui/material";

const drawerWidth = 240

export const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
        backgroundColor: theme.palette.common.black,
        color: theme.palette.common.white,
    },
    [`&.${tableCellClasses.body}`]: {
        fontSize: 14,
    },
}));

export const StyledTableRow = styled(TableRow)(({ theme }) => ({
    '&:nth-of-type(odd)': {
        backgroundColor: theme.palette.action.hover,
    },
    // hide last border
    '&:last-child td, &:last-child th': {
        border: 0,
    },
}));

export const AppBar = styled(MuiAppBar, {
    shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
    zIndex: theme.zIndex.drawer + 1,
    marginTop: '16px',
    marginRight: '16px',
    marginLeft: '16px',
    width: `calc(100% - 32px)`,
    borderRadius: '24px',
    background: theme.palette.mode === 'light' 
        ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.88), rgba(244, 246, 248, 0.78))' 
        : 'linear-gradient(135deg, rgba(15, 23, 42, 0.92), rgba(30, 41, 59, 0.82))',
    backdropFilter: 'blur(18px)',
    boxShadow: theme.palette.mode === 'light' 
        ? '0 12px 40px rgba(67, 97, 238, 0.12)' 
        : '0 12px 40px rgba(0,0,0,0.32)',
    border: `1px solid ${theme.palette.mode === 'light' ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.08)'}`,
    transition: theme.transitions.create(['width', 'margin'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    ...(open && {
        marginLeft: drawerWidth + 32, // Accommodate for the floating sidebar width
        width: `calc(100% - (${drawerWidth}px + 48px))`, // Drawer + margins
        transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    }),
}));

export const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
    ({ theme, open }) => ({
        '& .MuiDrawer-paper': {
            position: 'relative',
            whiteSpace: 'nowrap',
            width: drawerWidth,
            transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
            }),
            boxSizing: 'border-box',
            background: theme.palette.mode === 'light'
                ? 'linear-gradient(180deg, rgba(255,255,255,0.92), rgba(248,250,252,0.86))'
                : 'linear-gradient(180deg, rgba(15,23,42,0.96), rgba(30,41,59,0.88))',
            border: `1px solid ${theme.palette.mode === 'light' ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.08)'}`,
            borderRadius: '28px',
            margin: '16px 0 16px 16px',
            height: 'calc(100vh - 32px)',
            boxShadow: theme.palette.mode === 'light' ? '0 18px 50px rgba(67, 97, 238, 0.12)' : '0 18px 50px rgba(0,0,0,0.35)',
            backdropFilter: 'blur(18px)',
            ...(!open && {
                overflowX: 'hidden',
                transition: theme.transitions.create('width', {
                    easing: theme.transitions.easing.sharp,
                    duration: theme.transitions.duration.leavingScreen,
                }),
                width: theme.spacing(9), // Slight change for collapsed sidebar to look more pill-like
                [theme.breakpoints.up('sm')]: {
                    width: theme.spacing(11),
                },
            }),
        },
    }),
);