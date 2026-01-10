'use client'

import React from 'react'
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  InputBase,
  Avatar,
  Menu,
  MenuItem,
  Badge,
  Tooltip,
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone'
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined'
import { useAuthStore } from '@/stores/authStore'
import { useRouter } from 'next/navigation'

const drawerWidth = 280

export default function Topbar() {
  const router = useRouter()
  const { user, logout } = useAuthStore()
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget)
  const handleClose = () => setAnchorEl(null)

  const handleLogout = () => {
    handleClose()
    logout()
    router.push('/login')
  }

  const getInitials = () => {
    if (user?.name) {
      const parts = user.name.split(' ')
      if (parts.length >= 2) {
        return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
      }
      return user.name.slice(0, 2).toUpperCase()
    }
    if (user?.email) {
      return user.email.slice(0, 2).toUpperCase()
    }
    return 'SA'
  }

  return (
    <AppBar
      position="fixed"
      sx={{
        width: `calc(100% - ${drawerWidth}px)`,
        ml: `${drawerWidth}px`,
        backgroundColor: 'transparent',
        boxShadow: 'none',
        borderBottom: 'none',
      }}
    >
      <Toolbar
        sx={{
          minHeight: '80px !important',
          px: 3,
          gap: 2,
        }}
      >
        {/* Page Title / Breadcrumb area */}
        <Box sx={{ flex: 1 }}>
          <Typography
            variant="body2"
            sx={{ color: '#A3AED0', mb: 0.5 }}
          >
            Pages / Dashboard
          </Typography>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              color: '#2B3674',
            }}
          >
            Main Dashboard
          </Typography>
        </Box>

        {/* Search Bar - Pill shaped */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            backgroundColor: '#ffffff',
            borderRadius: '30px',
            px: 2,
            py: 1,
            width: 280,
            boxShadow: '0px 4px 12px rgba(112, 144, 176, 0.08)',
          }}
        >
          <SearchIcon sx={{ color: '#A3AED0', fontSize: 20 }} />
          <InputBase
            placeholder="Search..."
            sx={{
              flex: 1,
              fontSize: '0.875rem',
              color: '#2B3674',
              '& input::placeholder': {
                color: '#A3AED0',
                opacity: 1,
              },
            }}
            inputProps={{ 'aria-label': 'search' }}
          />
        </Box>

        {/* Action Icons */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            backgroundColor: '#ffffff',
            borderRadius: '30px',
            px: 1.5,
            py: 0.75,
            boxShadow: '0px 4px 12px rgba(112, 144, 176, 0.08)',
          }}
        >
          <Tooltip title="Notifications">
            <IconButton size="small" sx={{ color: '#A3AED0' }}>
              <Badge badgeContent={3} color="error" sx={{ '& .MuiBadge-badge': { fontSize: 10, minWidth: 16, height: 16 } }}>
                <NotificationsNoneIcon sx={{ fontSize: 20 }} />
              </Badge>
            </IconButton>
          </Tooltip>

          <Tooltip title="Dark Mode">
            <IconButton size="small" sx={{ color: '#A3AED0' }}>
              <DarkModeOutlinedIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Info">
            <IconButton size="small" sx={{ color: '#A3AED0' }}>
              <InfoOutlinedIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Settings">
            <IconButton size="small" sx={{ color: '#A3AED0' }}>
              <SettingsOutlinedIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Tooltip>

          {/* Profile Avatar */}
          <Tooltip title="Profile">
            <IconButton
              onClick={handleMenu}
              sx={{ ml: 1 }}
            >
              <Avatar
                sx={{
                  width: 36,
                  height: 36,
                  background: 'linear-gradient(135deg, #4318FF 0%, #7551FF 100%)',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                }}
              >
                {getInitials()}
              </Avatar>
            </IconButton>
          </Tooltip>
        </Box>

        {/* Profile Menu */}
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          PaperProps={{
            sx: {
              mt: 1,
              minWidth: 180,
            },
          }}
        >
          <Box sx={{ px: 2, py: 1.5 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#2B3674' }}>
              {user?.name || 'Super Admin'}
            </Typography>
            <Typography variant="caption" sx={{ color: '#A3AED0' }}>
              {user?.email || 'admin@garmentserp.com'}
            </Typography>
          </Box>
          <MenuItem onClick={handleClose}>
            Profile
          </MenuItem>
          <MenuItem onClick={handleClose}>
            Settings
          </MenuItem>
          <MenuItem
            onClick={handleLogout}
            sx={{ color: '#EE5D50' }}
          >
            Logout
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  )
}
