'use client'

import React from 'react'
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Stack,
  Avatar,
  Chip,
} from '@mui/material'
import Link from 'next/link'
import { useAuthStore } from '@/stores/authStore'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import BusinessIcon from '@mui/icons-material/Business';
import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange';
import CategoryIcon from '@mui/icons-material/Category';
import PercentIcon from '@mui/icons-material/Percent';
import WarehouseIcon from '@mui/icons-material/Warehouse';
import DescriptionIcon from '@mui/icons-material/Description';
import SettingsIcon from '@mui/icons-material/Settings';
import LoginIcon from '@mui/icons-material/Login';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import ReceiptIcon from '@mui/icons-material/Receipt';

const menuItems = [
  // Admin & User Management
  {
    title: 'Permissions',
    description: 'Manage user and role permissions',
    icon: <AdminPanelSettingsIcon sx={{ fontSize: 40 }} color="primary" />,
    href: '/admin/permissions',
    category: 'Administration'
  },

  // Company & Business Settings
  {
    title: 'Companies',
    description: 'Manage company information',
    icon: <BusinessIcon sx={{ fontSize: 40 }} color="primary" />,
    href: '/admin/companies',
    category: 'Business'
  },
  {
    title: 'Business Settings',
    description: 'Configure business settings',
    icon: <SettingsIcon sx={{ fontSize: 40 }} color="primary" />,
    href: '/admin/business-settings',
    category: 'Business'
  },

  // Financial Configuration
  {
    title: 'Accounting & Cash Book',
    description: 'Manage cash book entries, journal entries, and financial reports',
    icon: <AccountBalanceIcon sx={{ fontSize: 40 }} color="primary" />,
    href: '/admin/accounting',
    category: 'Financial'
  },
  {
    title: 'Cash Book Entry',
    description: 'Manual cash book entry in MM Fashion format',
    icon: <ReceiptIcon sx={{ fontSize: 40 }} color="primary" />,
    href: '/admin/accounting/cash-book-entry',
    category: 'Financial'
  },
  {
    title: 'Currencies',
    description: 'Manage currencies and exchange rates',
    icon: <CurrencyExchangeIcon sx={{ fontSize: 40 }} color="primary" />,
    href: '/admin/currencies',
    category: 'Financial'
  },
  {
    title: 'Tax Rates',
    description: 'Configure tax rates and types',
    icon: <PercentIcon sx={{ fontSize: 40 }} color="primary" />,
    href: '/admin/tax-rates',
    category: 'Financial'
  },

  // Inventory & Products
  {
    title: 'Product Categories',
    description: 'Organize products into categories',
    icon: <CategoryIcon sx={{ fontSize: 40 }} color="primary" />,
    href: '/admin/product-categories',
    category: 'Inventory'
  },
  {
    title: 'Warehouses',
    description: 'Manage warehouse locations',
    icon: <WarehouseIcon sx={{ fontSize: 40 }} color="primary" />,
    href: '/admin/warehouses',
    category: 'Inventory'
  },

  // Reports
  {
    title: 'Report Templates',
    description: 'Configure and manage report templates',
    icon: <DescriptionIcon sx={{ fontSize: 40 }} color="primary" />,
    href: '/admin/report-templates',
    category: 'Reports'
  },
];

export default function HomePage() {
  const { isAuthenticated, user, logout } = useAuthStore()

  return (
    <ProtectedRoute>
      <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
        {/* Header */}
        <Box
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            py: 2,
          }}
        >
          <Container>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography variant="h4" fontWeight="bold">
                GarmentsERP
              </Typography>

              {isAuthenticated ? (
                <Stack direction="row" spacing={3} alignItems="center">
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar sx={{ bgcolor: 'white', color: 'primary.main' }}>
                      {user?.name?.charAt(0) || 'U'}
                    </Avatar>
                    <Box>
                      <Typography variant="body1" fontWeight="medium">
                        {user?.name}
                      </Typography>
                      <Chip
                        label={user?.roles?.[0] || 'User'}
                        size="small"
                        sx={{
                          backgroundColor: 'rgba(255,255,255,0.2)',
                          color: 'white',
                          fontSize: '0.75rem'
                        }}
                      />
                    </Box>
                  </Stack>
                  <Button
                    variant="outlined"
                    color="inherit"
                    onClick={logout}
                    sx={{
                      borderColor: 'white',
                      color: 'white',
                      '&:hover': {
                        borderColor: 'white',
                        backgroundColor: 'rgba(255,255,255,0.1)',
                      },
                    }}
                  >
                    Logout
                  </Button>
                </Stack>
              ) : (
                <Stack direction="row" spacing={2}>
                  <Link href="/login" passHref>
                    <Button
                      variant="outlined"
                      color="inherit"
                      startIcon={<LoginIcon />}
                      sx={{
                        borderColor: 'white',
                        color: 'white',
                        '&:hover': {
                          borderColor: 'white',
                          backgroundColor: 'rgba(255,255,255,0.1)',
                        },
                      }}
                    >
                      Login
                    </Button>
                  </Link>
                  <Link href="/register" passHref>
                    <Button
                      variant="contained"
                      startIcon={<PersonAddIcon />}
                      sx={{
                        backgroundColor: 'white',
                        color: 'primary.main',
                        '&:hover': {
                          backgroundColor: 'grey.100',
                        },
                      }}
                    >
                      Register
                    </Button>
                  </Link>
                </Stack>
              )}
            </Stack>
          </Container>
        </Box>

        {/* Hero Section */}
        <Box
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            py: 12,
          }}
        >
          <Container>
            <Stack spacing={4} alignItems="center" textAlign="center">
              <Typography
                variant="h1"
                sx={{
                  fontSize: { xs: '2.5rem', md: '4rem' },
                  fontWeight: 800,
                  maxWidth: '800px',
                  lineHeight: 1.1,
                }}
              >
                Complete ERP Solution for Garment Industry
              </Typography>
              <Typography
                variant="h5"
                sx={{
                  maxWidth: '600px',
                  opacity: 0.9,
                  fontWeight: 400,
                  fontSize: { xs: '1.2rem', md: '1.5rem' },
                }}
              >
                Streamline your garment manufacturing, inventory, sales, and financial operations with our comprehensive ERP system.
              </Typography>

              {!isAuthenticated && (
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} sx={{ mt: 4 }}>
                  <Link href="/register" passHref>
                    <Button
                      variant="contained"
                      size="large"
                      sx={{
                        backgroundColor: 'white',
                        color: 'primary.main',
                        px: 4,
                        py: 2,
                        fontSize: '1.1rem',
                        '&:hover': {
                          backgroundColor: 'grey.100',
                        },
                      }}
                    >
                      Get Started Free
                    </Button>
                  </Link>
                  <Link href="/login" passHref>
                    <Button
                      variant="outlined"
                      size="large"
                      sx={{
                        borderColor: 'white',
                        color: 'white',
                        px: 4,
                        py: 2,
                        fontSize: '1.1rem',
                        '&:hover': {
                          borderColor: 'white',
                          backgroundColor: 'rgba(255,255,255,0.1)',
                        },
                      }}
                    >
                      Sign In
                    </Button>
                  </Link>
                </Stack>
              )}
            </Stack>
          </Container>
        </Box>

        {/* Quick Access Section for Authenticated Users */}
        {isAuthenticated && (
          <Container sx={{ py: 6 }}>
            <Card sx={{ mb: 6, background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                  🚀 Quick Access
                </Typography>
                <Typography variant="body1" sx={{ mb: 3, opacity: 0.9 }}>
                  Jump directly to commonly used features
                </Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <Button
                    variant="contained"
                    startIcon={<AccountBalanceIcon />}
                    onClick={() => window.open('/admin/accounting', '_blank')}
                    sx={{
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      color: 'white',
                      '&:hover': {
                        backgroundColor: 'rgba(255,255,255,0.3)',
                      },
                    }}
                  >
                    Accounting Dashboard
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<ReceiptIcon />}
                    onClick={() => window.open('/admin/accounting/cash-book-entry', '_blank')}
                    sx={{
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      color: 'white',
                      '&:hover': {
                        backgroundColor: 'rgba(255,255,255,0.3)',
                      },
                    }}
                  >
                    New Cash Book Entry
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<DescriptionIcon />}
                    onClick={() => window.open('/admin/accounting/balance', '_blank')}
                    sx={{
                      borderColor: 'white',
                      color: 'white',
                      '&:hover': {
                        borderColor: 'white',
                        backgroundColor: 'rgba(255,255,255,0.1)',
                      },
                    }}
                  >
                    View Balance
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Container>
        )}

        {/* Menu Section */}
        <Container sx={{ py: 12 }}>
          <Stack spacing={8}>
            <Box textAlign="center">
              <Typography variant="h2" gutterBottom color="text.primary">
                Welcome to GarmentsERP
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ maxWidth: '600px', mx: 'auto' }}>
                Select a module to get started with your ERP configuration
              </Typography>
            </Box>

            {/* Group menu items by category */}
            {['Administration', 'Business', 'Financial', 'Inventory', 'Reports'].map((category) => {
              const categoryItems = menuItems.filter(item => item.category === category);
              if (categoryItems.length === 0) return null;

              return (
                <Box key={category}>
                  <Typography variant="h4" gutterBottom color="text.primary" sx={{ mb: 4 }}>
                    {category}
                  </Typography>
                  <Box
                    sx={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: 4,
                      justifyContent: { xs: 'center', md: 'flex-start' },
                    }}
                  >
                    {categoryItems.map((item) => (
                      <Box
                        key={item.title}
                        sx={{
                          flex: { xs: '1 1 100%', sm: '1 1 45%', md: '1 1 30%', lg: '1 1 22%' },
                          minWidth: 260,
                          maxWidth: 350,
                          mb: 4,
                          display: 'flex',
                        }}
                      >
                        <Card
                          sx={{
                            width: '100%',
                            height: '100%',
                            transition: 'all 0.3s',
                            '&:hover': {
                              boxShadow: 8,
                              transform: 'translateY(-6px) scale(1.03)',
                            },
                            cursor: 'pointer',
                          }}
                          component={Link}
                          href={item.href}
                        >
                          <CardContent sx={{ p: 4, textAlign: 'center' }}>
                            <Box mb={2}>{item.icon}</Box>
                            <Typography variant="h6" fontWeight="bold" gutterBottom>
                              {item.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {item.description}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Box>
                    ))}
                  </Box>
                </Box>
              );
            })}
          </Stack>
        </Container>

        {/* Footer */}
        <Box
          sx={{
            backgroundColor: 'grey.900',
            color: 'white',
            py: 6,
            mt: 8,
          }}
        >
          <Container>
            <Stack spacing={4} textAlign="center">
              <Typography variant="h4" fontWeight="bold">
                GarmentsERP
              </Typography>
              <Typography variant="body1" color="grey.400">
                © 2025 GarmentsERP. All rights reserved.
              </Typography>
            </Stack>
          </Container>
        </Box>
      </Box>
    </ProtectedRoute>
  )
}
