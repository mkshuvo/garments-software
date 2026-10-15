'use client'

import React from 'react'
import { Box, Typography, Paper, Chip, Avatar } from '@mui/material'

interface Transaction {
    id: string
    client: {
        name: string
        email: string
        avatar?: string
    }
    amount: number
    paymentMethod: string
    status: 'Confirmed' | 'Pending' | 'Cancelled'
}

interface RecentTransactionsProps {
    transactions?: Transaction[]
    title?: string
}

const getStatusColor = (status: string) => {
    switch (status) {
        case 'Confirmed':
            return { bg: 'rgba(5, 205, 153, 0.1)', color: '#05CD99' }
        case 'Pending':
            return { bg: 'rgba(255, 206, 32, 0.1)', color: '#E5B600' }
        case 'Cancelled':
            return { bg: 'rgba(238, 93, 80, 0.1)', color: '#EE5D50' }
        default:
            return { bg: 'rgba(163, 174, 208, 0.1)', color: '#A3AED0' }
    }
}

// Sample transactions if none provided
const sampleTransactions: Transaction[] = [
    {
        id: '#001',
        client: { name: 'Joshina Lorin', email: 'joshina@gmail.com' },
        amount: 6240,
        paymentMethod: 'Paypal',
        status: 'Confirmed',
    },
    {
        id: '#002',
        client: { name: 'Sylor White', email: 'sylor@gmail.com' },
        amount: 5155,
        paymentMethod: 'Wise',
        status: 'Pending',
    },
    {
        id: '#003',
        client: { name: 'Jonathon Watson', email: 'jwatson@gmail.com' },
        amount: 4321,
        paymentMethod: 'Bank',
        status: 'Cancelled',
    },
    {
        id: '#004',
        client: { name: 'Walter White', email: 'walter@gmail.com' },
        amount: 3324,
        paymentMethod: 'Skrill',
        status: 'Confirmed',
    },
    {
        id: '#005',
        client: { name: 'David Carter', email: 'david@gmail.com' },
        amount: 2137,
        paymentMethod: 'Paypal',
        status: 'Pending',
    },
]

export default function RecentTransactions({
    transactions = sampleTransactions,
    title = 'Latest Transaction',
}: RecentTransactionsProps) {
    return (
        <Paper
            sx={{
                p: 3,
                borderRadius: '20px',
                boxShadow: '0px 18px 40px rgba(112, 144, 176, 0.12)',
                backgroundColor: '#ffffff',
                height: '100%',
            }}
        >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography
                    variant="h6"
                    sx={{
                        fontWeight: 700,
                        color: '#2B3674',
                        fontSize: '1rem',
                    }}
                >
                    {title}
                </Typography>
                <Typography
                    variant="body2"
                    sx={{
                        color: '#4318FF',
                        fontWeight: 500,
                        cursor: 'pointer',
                        '&:hover': { textDecoration: 'underline' },
                    }}
                >
                    Today →
                </Typography>
            </Box>

            {/* Table Header */}
            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: '60px 1.5fr 1fr 1fr 100px',
                    gap: 2,
                    py: 1.5,
                    borderBottom: '1px solid #F4F7FE',
                }}
            >
                {['ID', 'Client', 'Amount', 'Payment Method', 'Status'].map((header) => (
                    <Typography
                        key={header}
                        variant="caption"
                        sx={{
                            color: '#A3AED0',
                            fontWeight: 600,
                            fontSize: '0.6875rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                        }}
                    >
                        {header}
                    </Typography>
                ))}
            </Box>

            {/* Table Body */}
            {transactions.map((tx) => {
                const statusColors = getStatusColor(tx.status)
                return (
                    <Box
                        key={tx.id}
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: '60px 1.5fr 1fr 1fr 100px',
                            gap: 2,
                            py: 2,
                            borderBottom: '1px solid #F4F7FE',
                            alignItems: 'center',
                            transition: 'background-color 0.2s',
                            '&:hover': {
                                backgroundColor: '#FAFCFF',
                            },
                        }}
                    >
                        <Typography
                            variant="body2"
                            sx={{ color: '#A3AED0', fontWeight: 500 }}
                        >
                            {tx.id}
                        </Typography>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Avatar
                                sx={{
                                    width: 36,
                                    height: 36,
                                    fontSize: '0.875rem',
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                }}
                            >
                                {tx.client.name.split(' ').map(n => n[0]).join('')}
                            </Avatar>
                            <Box>
                                <Typography
                                    variant="body2"
                                    sx={{ color: '#2B3674', fontWeight: 600, fontSize: '0.875rem' }}
                                >
                                    {tx.client.name}
                                </Typography>
                                <Typography
                                    variant="caption"
                                    sx={{ color: '#A3AED0', fontSize: '0.75rem' }}
                                >
                                    {tx.client.email}
                                </Typography>
                            </Box>
                        </Box>

                        <Typography
                            variant="body2"
                            sx={{ color: '#2B3674', fontWeight: 600 }}
                        >
                            ${tx.amount.toLocaleString()}
                        </Typography>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box
                                sx={{
                                    width: 8,
                                    height: 8,
                                    borderRadius: '50%',
                                    backgroundColor: tx.paymentMethod === 'Paypal' ? '#4318FF' :
                                        tx.paymentMethod === 'Wise' ? '#05CD99' :
                                            tx.paymentMethod === 'Bank' ? '#2196f3' : '#764ba2',
                                }}
                            />
                            <Typography variant="body2" sx={{ color: '#2B3674' }}>
                                {tx.paymentMethod}
                            </Typography>
                        </Box>

                        <Chip
                            label={tx.status}
                            size="small"
                            sx={{
                                backgroundColor: statusColors.bg,
                                color: statusColors.color,
                                fontWeight: 600,
                                fontSize: '0.75rem',
                                borderRadius: '8px',
                                height: 28,
                            }}
                        />
                    </Box>
                )
            })}

            {/* Pagination */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
                <Typography variant="caption" sx={{ color: '#A3AED0' }}>
                    Showing 1 to 5 of 10 entries
                </Typography>
            </Box>
        </Paper>
    )
}
