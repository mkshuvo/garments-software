'use client'

import React from 'react'
import { Drawer, List, ListItemButton, ListItemIcon, ListItemText, Box, Toolbar } from '@mui/material'
import DashboardIcon from '@mui/icons-material/Dashboard'
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong'
import TableViewIcon from '@mui/icons-material/TableView'
import ListAltIcon from '@mui/icons-material/ListAlt'
import CategoryIcon from '@mui/icons-material/Category'
import AccountBalanceIcon from '@mui/icons-material/AccountBalance'
import BusinessIcon from '@mui/icons-material/Business'
import SettingsIcon from '@mui/icons-material/Settings'
import PeopleIcon from '@mui/icons-material/People'
import Inventory2Icon from '@mui/icons-material/Inventory2'
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn'
import Link from 'next/link'

const drawerWidth = 260

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: <DashboardIcon /> },
  { href: '/admin/accounting/journal-entries', label: 'Journal Entries', icon: <TableViewIcon /> },
  { href: '/admin/accounting/journal-entries-simple', label: 'Simple Entries', icon: <ListAltIcon /> },
  { href: '/admin/accounting/cash-book-entry', label: 'Cash Book Entry', icon: <ReceiptLongIcon /> },
  { href: '/admin/accounting/trial-balance', label: 'Trial Balance', icon: <AccountBalanceIcon /> },
  { href: '/admin/accounting/categories', label: 'Categories', icon: <CategoryIcon /> },
  { href: '/admin/permissions', label: 'Permissions', icon: <PeopleIcon /> },
  { href: '/admin/companies', label: 'Companies', icon: <BusinessIcon /> },
  { href: '/admin/product-categories', label: 'Product Categories', icon: <Inventory2Icon /> },
  { href: '/admin/tax-rates', label: 'Tax Rates', icon: <MonetizationOnIcon /> },
  { href: '/admin/business-settings', label: 'Settings', icon: <SettingsIcon /> },
]

export default function Sidebar() {
  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: drawerWidth,
          boxSizing: 'border-box',
          borderRight: '1px solid rgba(0,0,0,0.08)'
        },
      }}
    >
      <Toolbar />
      <Box sx={{ overflow: 'auto' }}>
        <List>
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} style={{ textDecoration: 'none', color: 'inherit' }}>
              <ListItemButton>
                <ListItemIcon>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            </Link>
          ))}
        </List>
      </Box>
    </Drawer>
  )
}

