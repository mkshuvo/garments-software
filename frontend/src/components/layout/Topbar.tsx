'use client'

import React from 'react'
import { AppBar, Toolbar, Typography, Box, IconButton, InputBase, Paper, Avatar, Menu, MenuItem } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone'

export default function Topbar() {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)
  const handleMenu = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget)
  const handleClose = () => setAnchorEl(null)

  return (
    <AppBar position="fixed" elevation={1} color="inherit" sx={{ borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
      <Toolbar sx={{ gap: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          GarmentsERP Admin
        </Typography>
        <Box sx={{ flexGrow: 1 }} />
        <Paper sx={{ p: 1, display: 'flex', alignItems: 'center', gap: 1, width: 340 }}>
          <SearchIcon color="action" />
          <InputBase placeholder="Search…" sx={{ flex: 1 }} inputProps={{ 'aria-label': 'search' }} />
        </Paper>
        <IconButton aria-label="notifications">
          <NotificationsNoneIcon />
        </IconButton>
        <IconButton aria-label="account" onClick={handleMenu}>
          <Avatar sx={{ width: 32, height: 32 }}>SA</Avatar>
        </IconButton>
        <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
          <MenuItem onClick={handleClose}>Profile</MenuItem>
          <MenuItem onClick={handleClose}>Settings</MenuItem>
          <MenuItem onClick={handleClose}>Logout</MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  )
}
