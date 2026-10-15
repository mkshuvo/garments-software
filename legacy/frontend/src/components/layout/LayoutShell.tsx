'use client'

import React from 'react'
import { Box, Toolbar } from '@mui/material'
import Sidebar from './Sidebar'
import Topbar from './Topbar'

const drawerWidth = 280

export default function LayoutShell({ children, bgColor = '#F4F7FE' }: { children: React.ReactNode, bgColor?: string }) {
  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: bgColor,
      }}
    >
      <Topbar />
      <Sidebar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, md: 3 },
          ml: { lg: `${drawerWidth}px` }, // Respect drawer width on desktop
          backgroundColor: bgColor,
          minHeight: '100vh',
          width: { lg: `calc(100% - ${drawerWidth}px)` }
        }}
      >
        <Toolbar sx={{ minHeight: '80px !important' }} />
        {children}
      </Box>
    </Box>
  )
}
