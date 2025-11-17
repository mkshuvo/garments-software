'use client'

import React from 'react'
import { Box, Toolbar } from '@mui/material'
import Sidebar from './Sidebar'
import Topbar from './Topbar'

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  return (
    <Box sx={{ display: 'flex' }}>
      <Topbar />
      <Sidebar />
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        {children}
      </Box>
    </Box>
  )
}

