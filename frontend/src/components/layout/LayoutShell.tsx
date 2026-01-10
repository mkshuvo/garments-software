'use client'

import React from 'react'
import { Box, Toolbar } from '@mui/material'
import Sidebar from './Sidebar'
import Topbar from './Topbar'

const drawerWidth = 280

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: '#F4F7FE',
      }}
    >
      <Topbar />
      <Sidebar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          ml: `${drawerWidth}px`,
          backgroundColor: '#F4F7FE',
          minHeight: '100vh',
        }}
      >
        <Toolbar sx={{ minHeight: '80px !important' }} />
        {children}
      </Box>
    </Box>
  )
}
