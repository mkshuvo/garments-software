'use client'

import React, { useState } from 'react'
import { usePathname } from 'next/navigation'
import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  Collapse,
  Divider,
} from '@mui/material'
import Link from 'next/link'

// Icons
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
import ExpandLess from '@mui/icons-material/ExpandLess'
import ExpandMore from '@mui/icons-material/ExpandMore'
import AssessmentIcon from '@mui/icons-material/Assessment'
import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange'
import WarehouseIcon from '@mui/icons-material/Warehouse'

const drawerWidth = 280

// Navigation structure with groups
const navGroups = [
  {
    id: 'main',
    label: 'MAIN',
    items: [
      { href: '/admin', label: 'Dashboard', icon: <DashboardIcon /> },
    ]
  },
  {
    id: 'accounting',
    label: 'ACCOUNTING',
    items: [
      { href: '/admin/accounting/journal-entries', label: 'Journal Entries', icon: <TableViewIcon /> },
      { href: '/admin/accounting/journal-entries-simple', label: 'Simple Entries', icon: <ListAltIcon /> },
      { href: '/admin/accounting/cash-book-entry', label: 'Cash Book Entry', icon: <ReceiptLongIcon /> },
      { href: '/admin/accounting/trial-balance', label: 'Trial Balance', icon: <AccountBalanceIcon /> },
      { href: '/admin/accounting/categories', label: 'Categories', icon: <CategoryIcon /> },
    ]
  },
  {
    id: 'reports',
    label: 'REPORTS',
    items: [
      { href: '/admin/accounting/balance', label: 'Balance Overview', icon: <AssessmentIcon /> },
      { href: '/admin/report-templates', label: 'Report Templates', icon: <AssessmentIcon /> },
    ]
  },
  {
    id: 'administration',
    label: 'ADMINISTRATION',
    items: [
      { href: '/admin/permissions', label: 'Permissions', icon: <PeopleIcon /> },
      { href: '/admin/companies', label: 'Companies', icon: <BusinessIcon /> },
      { href: '/admin/currencies', label: 'Currencies', icon: <CurrencyExchangeIcon /> },
      { href: '/admin/tax-rates', label: 'Tax Rates', icon: <MonetizationOnIcon /> },
    ]
  },
  {
    id: 'inventory',
    label: 'INVENTORY',
    items: [
      { href: '/admin/product-categories', label: 'Product Categories', icon: <Inventory2Icon /> },
      { href: '/admin/warehouses', label: 'Warehouses', icon: <WarehouseIcon /> },
    ]
  },
  {
    id: 'settings',
    label: 'SETTINGS',
    items: [
      { href: '/admin/business-settings', label: 'Business Settings', icon: <SettingsIcon /> },
    ]
  },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    main: true,
    accounting: true,
    reports: true,
    administration: true,
    inventory: true,
    settings: true,
  })

  const toggleGroup = (groupId: string) => {
    setOpenGroups(prev => ({ ...prev, [groupId]: !prev[groupId] }))
  }

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin'
    }
    return pathname?.startsWith(href)
  }

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          backgroundColor: '#ffffff',
          borderRight: 'none',
          boxShadow: '0px 4px 20px rgba(112, 144, 176, 0.08)',
        },
      }}
    >
      {/* Logo Section */}
      <Box
        sx={{
          height: 80,
          display: 'flex',
          alignItems: 'center',
          px: 3,
          gap: 1.5,
        }}
      >
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 2,
            background: 'linear-gradient(135deg, #4318FF 0%, #7551FF 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 700,
            fontSize: '1.25rem',
          }}
        >
          G
        </Box>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            color: '#2B3674',
            letterSpacing: '-0.5px',
          }}
        >
          GarmentsERP
        </Typography>
      </Box>

      <Divider sx={{ mx: 2, borderColor: '#F4F7FE' }} />

      {/* Navigation */}
      <Box sx={{ overflowY: 'auto', flex: 1, py: 2 }}>
        {navGroups.map((group) => (
          <Box key={group.id} sx={{ mb: 1 }}>
            {/* Group Header */}
            <Box
              onClick={() => toggleGroup(group.id)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                px: 3,
                py: 1,
                cursor: 'pointer',
                '&:hover': {
                  backgroundColor: '#F4F7FE',
                },
              }}
            >
              <Typography
                variant="overline"
                sx={{
                  fontSize: '0.6875rem',
                  fontWeight: 600,
                  color: '#A3AED0',
                  letterSpacing: '1px',
                }}
              >
                {group.label}
              </Typography>
              {openGroups[group.id] ? (
                <ExpandLess sx={{ fontSize: 16, color: '#A3AED0' }} />
              ) : (
                <ExpandMore sx={{ fontSize: 16, color: '#A3AED0' }} />
              )}
            </Box>

            {/* Group Items */}
            <Collapse in={openGroups[group.id]} timeout="auto" unmountOnExit>
              <List disablePadding>
                {group.items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    style={{ textDecoration: 'none', color: 'inherit' }}
                  >
                    <ListItemButton
                      selected={isActive(item.href)}
                      sx={{
                        borderRadius: 2,
                        mx: 1.5,
                        mb: 0.5,
                        py: 1.25,
                        px: 2,
                        position: 'relative',
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                          backgroundColor: '#F4F7FE',
                        },
                        '&.Mui-selected': {
                          backgroundColor: 'rgba(67, 24, 255, 0.08)',
                          color: '#4318FF',
                          '& .MuiListItemIcon-root': {
                            color: '#4318FF',
                          },
                          '&:hover': {
                            backgroundColor: 'rgba(67, 24, 255, 0.12)',
                          },
                          '&::after': {
                            content: '""',
                            position: 'absolute',
                            right: 0,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            width: 4,
                            height: 24,
                            backgroundColor: '#4318FF',
                            borderRadius: '4px 0 0 4px',
                          },
                        },
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          minWidth: 36,
                          color: isActive(item.href) ? '#4318FF' : '#A3AED0',
                        }}
                      >
                        {item.icon}
                      </ListItemIcon>
                      <ListItemText
                        primary={item.label}
                        primaryTypographyProps={{
                          fontSize: '0.875rem',
                          fontWeight: isActive(item.href) ? 600 : 500,
                          color: isActive(item.href) ? '#4318FF' : '#2B3674',
                        }}
                      />
                    </ListItemButton>
                  </Link>
                ))}
              </List>
            </Collapse>
          </Box>
        ))}
      </Box>

      {/* Footer */}
      <Box sx={{ p: 2 }}>
        <Box
          sx={{
            p: 2.5,
            borderRadius: 3,
            background: 'linear-gradient(135deg, #4318FF 0%, #7551FF 100%)',
            color: 'white',
            textAlign: 'center',
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5, color: 'white' }}>
            Need Help?
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.8, color: 'white' }}>
            Check our documentation
          </Typography>
        </Box>
      </Box>
    </Drawer>
  )
}
