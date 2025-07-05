'use client';

import React from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Stack,
  Chip,
} from '@mui/material';
import Link from 'next/link';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import BusinessIcon from '@mui/icons-material/Business';
import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange';
import CategoryIcon from '@mui/icons-material/Category';
import PercentIcon from '@mui/icons-material/Percent';
import WarehouseIcon from '@mui/icons-material/Warehouse';
import DescriptionIcon from '@mui/icons-material/Description';
import SettingsIcon from '@mui/icons-material/Settings';

const adminMenuItems = [
  // User Management - Permissions
  {
    title: 'Permissions',
    description: 'Manage user and role permissions',
    icon: <AdminPanelSettingsIcon sx={{ fontSize: 48 }} color="primary" />, 
    href: '/admin/permissions',
    category: 'Administration',
    color: 'primary.main'
  },
  
  // Company & Business Settings
  {
    title: 'Companies',
    description: 'Manage company information',
    icon: <BusinessIcon sx={{ fontSize: 48 }} color="secondary" />, 
    href: '/admin/companies',
    category: 'Business',
    color: 'secondary.main'
  },
  {
    title: 'Business Settings',
    description: 'Configure business settings',
    icon: <SettingsIcon sx={{ fontSize: 48 }} color="secondary" />, 
    href: '/admin/business-settings',
    category: 'Business',
    color: 'secondary.main'
  },
  
  // Financial Configuration
  {
    title: 'Currencies',
    description: 'Manage currencies and exchange rates',
    icon: <CurrencyExchangeIcon sx={{ fontSize: 48 }} color="success" />, 
    href: '/admin/currencies',
    category: 'Financial',
    color: 'success.main'
  },
  {
    title: 'Tax Rates',
    description: 'Configure tax rates and types',
    icon: <PercentIcon sx={{ fontSize: 48 }} color="success" />, 
    href: '/admin/tax-rates',
    category: 'Financial',
    color: 'success.main'
  },
  
  // Inventory & Products
  {
    title: 'Product Categories',
    description: 'Organize products into categories',
    icon: <CategoryIcon sx={{ fontSize: 48 }} color="warning" />, 
    href: '/admin/product-categories',
    category: 'Inventory',
    color: 'warning.main'
  },
  {
    title: 'Warehouses',
    description: 'Manage warehouse locations',
    icon: <WarehouseIcon sx={{ fontSize: 48 }} color="warning" />, 
    href: '/admin/warehouses',
    category: 'Inventory',
    color: 'warning.main'
  },
  
  // Reports
  {
    title: 'Report Templates',
    description: 'Configure and manage report templates',
    icon: <DescriptionIcon sx={{ fontSize: 48 }} color="info" />, 
    href: '/admin/report-templates',
    category: 'Reports',
    color: 'info.main'
  },
];

const AdminPage = () => {
  const categories = ['Administration', 'Business', 'Financial', 'Inventory', 'Reports'];

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
      {/* Header */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          py: 8,
        }}
      >
        <Container>
          <Stack spacing={2} alignItems="center" textAlign="center">
            <AdminPanelSettingsIcon sx={{ fontSize: 64 }} />
            <Typography variant="h2" fontWeight="bold">
              Admin Panel
            </Typography>
            <Typography variant="h5" sx={{ opacity: 0.9, maxWidth: '600px' }}>
              Manage your ERP system configuration and settings
            </Typography>
          </Stack>
        </Container>
      </Box>

      {/* Menu Section */}
      <Container sx={{ py: 8 }}>
        <Stack spacing={6}>
          {categories.map((category) => {
            const categoryItems = adminMenuItems.filter(item => item.category === category);
            if (categoryItems.length === 0) return null;
            
            return (
              <Box key={category}>
                <Typography variant="h4" gutterBottom color="text.primary" sx={{ mb: 3 }}>
                  {category}
                </Typography>
                <Box
                  sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 3,
                    justifyContent: { xs: 'center', md: 'flex-start' },
                  }}
                >
                  {categoryItems.map((item) => (
                    <Box
                      key={item.title}
                      sx={{
                        flex: { xs: '1 1 100%', sm: '1 1 45%', md: '1 1 30%', lg: '1 1 22%' },
                        minWidth: 280,
                        maxWidth: 350,
                        display: 'flex',
                      }}
                    >
                      <Card
                        sx={{
                          width: '100%',
                          height: '100%',
                          transition: 'all 0.3s',
                          '&:hover': {
                            boxShadow: 12,
                            transform: 'translateY(-8px)',
                          },
                          cursor: 'pointer',
                          borderTop: `4px solid`,
                          borderTopColor: item.color,
                        }}
                        component={Link}
                        href={item.href}
                      >
                        <CardContent sx={{ p: 3, textAlign: 'center', height: '100%' }}>
                          <Stack spacing={2} alignItems="center" sx={{ height: '100%' }}>
                            <Box>{item.icon}</Box>
                            <Typography variant="h6" fontWeight="bold">
                              {item.title}
                            </Typography>
                            <Typography 
                              variant="body2" 
                              color="text.secondary" 
                              sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}
                            >
                              {item.description}
                            </Typography>
                            <Chip 
                              label={item.category} 
                              size="small" 
                              sx={{ 
                                backgroundColor: item.color,
                                color: 'white',
                                fontSize: '0.75rem'
                              }} 
                            />
                          </Stack>
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
    </Box>
  );
};

export default AdminPage;
