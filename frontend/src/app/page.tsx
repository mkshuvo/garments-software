'use client'

import React from 'react'
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Stack,
  Avatar,
  Chip,
} from '@mui/material'
import {
  Factory,
  Inventory,
  People,
  Analytics,
  ShoppingCart,
  AccountBalance,
  Login as LoginIcon,
  PersonAdd,
} from '@mui/icons-material'
import Link from 'next/link'
import { useAuthStore } from '@/stores/authStore'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import ShoppingCartCheckoutIcon from '@mui/icons-material/ShoppingCartCheckout';
import FactoryIcon from '@mui/icons-material/Factory';
import WorkHistoryIcon from '@mui/icons-material/WorkHistory';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import AssessmentIcon from '@mui/icons-material/Assessment';

const menuItems = [
  {
    title: 'Dashboard',
    description: 'ERP overview and quick stats',
    icon: <DashboardIcon sx={{ fontSize: 40 }} color="primary" />, 
    href: '/dashboard',
  },
  {
    title: 'User Management',
    description: 'Manage users, roles, and permissions',
    icon: <PeopleAltIcon sx={{ fontSize: 40 }} color="primary" />, 
    href: '/users',
  },
  {
    title: 'Inventory',
    description: 'Stock, warehouses, and inventory tracking',
    icon: <Inventory2Icon sx={{ fontSize: 40 }} color="primary" />, 
    href: '/inventory',
  },
  {
    title: 'Products',
    description: 'Product catalog and details',
    icon: <ShoppingBagIcon sx={{ fontSize: 40 }} color="primary" />, 
    href: '/products',
  },
  {
    title: 'Orders',
    description: 'Order management and fulfillment',
    icon: <ShoppingCartCheckoutIcon sx={{ fontSize: 40 }} color="primary" />, 
    href: '/orders',
  },
  {
    title: 'Sales',
    description: 'Sales orders and customer management',
    icon: <AssessmentIcon sx={{ fontSize: 40 }} color="primary" />, 
    href: '/sales',
  },
  {
    title: 'Purchasing',
    description: 'Purchase orders and vendor management',
    icon: <ShoppingCart sx={{ fontSize: 40 }} color="primary" />, 
    href: '/purchasing',
  },
  {
    title: 'Production',
    description: 'Work orders and production lines',
    icon: <FactoryIcon sx={{ fontSize: 40 }} color="primary" />, 
    href: '/production',
  },
  {
    title: 'HR & Payroll',
    description: 'Employee management and payroll',
    icon: <WorkHistoryIcon sx={{ fontSize: 40 }} color="primary" />, 
    href: '/hr',
  },
  {
    title: 'Accounting',
    description: 'Chart of accounts, ledgers, and finance',
    icon: <AccountBalanceIcon sx={{ fontSize: 40 }} color="primary" />, 
    href: '/accounting',
  },
  {
    title: 'Invoicing',
    description: 'Invoices, payments, and billing',
    icon: <ReceiptLongIcon sx={{ fontSize: 40 }} color="primary" />, 
    href: '/invoicing',
  },
  {
    title: 'Reports & Analytics',
    description: 'Business intelligence and reporting',
    icon: <AssessmentIcon sx={{ fontSize: 40 }} color="primary" />, 
    href: '/reports',
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
                      {user?.fullName?.charAt(0) || 'U'}
                    </Avatar>
                    <Box>
                      <Typography variant="body1" fontWeight="medium">
                        {user?.fullName}
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
                      startIcon={<PersonAdd />}
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

        {/* Menu Section */}
        <Container sx={{ py: 12 }}>
          <Stack spacing={8}>
            <Box textAlign="center">
              <Typography variant="h2" gutterBottom color="text.primary">
                Welcome to GarmentsERP
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ maxWidth: '600px', mx: 'auto' }}>
                Select a module to get started
              </Typography>
            </Box>
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 4,
                justifyContent: { xs: 'center', md: 'flex-start' },
              }}
            >
              {menuItems.map((item) => (
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
