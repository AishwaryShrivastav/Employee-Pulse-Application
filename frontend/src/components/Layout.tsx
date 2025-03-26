import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  Container,
  Avatar,
  Tooltip,
  MenuItem,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery,
  ListItemButton,
  SwipeableDrawer,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  Assessment,
  Person,
  Logout,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    {
      text: 'Dashboard',
      icon: <Dashboard />,
      path: user?.role === 'admin' ? '/admin' : '/dashboard',
    },
  ];

  const renderDrawer = (
    <Box 
      sx={{ 
        width: isSmall ? '100vw' : 250,
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }} 
      role="presentation"
    >
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h6" component="div">
          Menu
        </Typography>
      </Box>
      <List sx={{ flexGrow: 1 }}>
        {menuItems.map((item) => (
          <ListItem
            key={item.text}
            disablePadding
          >
            <ListItemButton
              component={RouterLink}
              to={item.path}
              onClick={() => setDrawerOpen(false)}
              sx={{
                py: 2,
                '&:hover': {
                  backgroundColor: 'action.hover',
                },
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText 
                primary={item.text}
                primaryTypographyProps={{
                  fontSize: isSmall ? '1.1rem' : 'inherit'
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', flexDirection: 'column' }}>
      <AppBar 
        position="fixed"
        sx={{
          zIndex: theme.zIndex.drawer + 1,
          boxShadow: isMobile ? 1 : 3
        }}
      >
        <Container maxWidth={false}>
          <Toolbar 
            disableGutters 
            sx={{ 
              minHeight: isSmall ? 56 : 64,
              px: isSmall ? 1 : 2
            }}
          >
            {isMobile && (
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={() => setDrawerOpen(true)}
                sx={{ mr: isSmall ? 1 : 2 }}
              >
                <MenuIcon />
              </IconButton>
            )}

            <Typography
              variant={isSmall ? "subtitle1" : "h6"}
              noWrap
              component={RouterLink}
              to={user?.role === 'admin' ? '/admin' : '/dashboard'}
              sx={{
                flexGrow: 1,
                color: 'inherit',
                textDecoration: 'none',
                fontWeight: 700,
                fontSize: isSmall ? '1.1rem' : 'inherit'
              }}
            >
              Employee Pulse
            </Typography>

            {!isMobile && (
              <Box sx={{ flexGrow: 1 }} />
            )}

            <Box sx={{ flexGrow: 0 }}>
              <Tooltip title="Open settings">
                <IconButton 
                  onClick={handleOpenUserMenu} 
                  sx={{ 
                    p: isSmall ? 0.5 : 1,
                    ml: isSmall ? 1 : 2
                  }}
                >
                  <Avatar 
                    sx={{ 
                      bgcolor: 'secondary.main',
                      width: isSmall ? 32 : 40,
                      height: isSmall ? 32 : 40
                    }}
                  >
                    {user?.name?.charAt(0) || 'U'}
                  </Avatar>
                </IconButton>
              </Tooltip>
              <Menu
                sx={{ mt: '45px' }}
                id="menu-appbar"
                anchorEl={anchorElUser}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorElUser)}
                onClose={handleCloseUserMenu}
                PaperProps={{
                  elevation: 3,
                  sx: {
                    minWidth: 200,
                    mt: 1.5
                  }
                }}
              >
                <MenuItem onClick={handleCloseUserMenu}>
                  <ListItemIcon>
                    <Person fontSize="small" />
                  </ListItemIcon>
                  <Typography>{user?.name}</Typography>
                </MenuItem>
                <MenuItem onClick={handleLogout}>
                  <ListItemIcon>
                    <Logout fontSize="small" />
                  </ListItemIcon>
                  <Typography>Logout</Typography>
                </MenuItem>
              </Menu>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {isMobile ? (
        <SwipeableDrawer
          anchor={isSmall ? 'right' : 'left'}
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          onOpen={() => setDrawerOpen(true)}
          SwipeAreaProps={{
            sx: {
              display: isSmall ? 'none' : 'auto'
            }
          }}
        >
          {renderDrawer}
        </SwipeableDrawer>
      ) : (
        <Drawer
          variant="permanent"
          sx={{
            width: 250,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: 250,
              boxSizing: 'border-box',
              borderRight: '1px solid',
              borderColor: 'divider',
            },
          }}
        >
          <Toolbar />
          {renderDrawer}
        </Drawer>
      )}

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: isSmall ? 2 : 3,
          width: isMobile ? '100%' : 'calc(100% - 250px)',
          ml: isMobile ? 0 : '250px',
          mt: isSmall ? '56px' : '64px'
        }}
      >
        {children}
      </Box>
    </Box>
  );
}; 