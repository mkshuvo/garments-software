'use client'

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/stores/authStore"
import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  Card, 
  CardContent,
  Stack
} from "@mui/material"
import Link from "next/link"

export default function Home() {
  const router = useRouter()
  const { isAuthenticated, user, logout } = useAuthStore()

  // Check authentication on mount
  useEffect(() => {
    useAuthStore.getState().checkAuth()
  }, [])

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  if (isAuthenticated && user) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h3" component="h1" color="primary">
            GarmentsERP Dashboard
          </Typography>
          <Button variant="outlined" onClick={handleLogout}>
            Logout
          </Button>
        </Box>
        
        <Card>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              Welcome back, {user.fullName}!
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Email: {user.email}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Role: {user.roles?.join(', ') || 'No roles assigned'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Account created: {new Date(user.createdAt).toLocaleDateString()}
            </Typography>
          </CardContent>
        </Card>
      </Container>
    )
  }

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h2" component="h1" gutterBottom color="primary">
          GarmentsERP
        </Typography>
        <Typography variant="h5" component="h2" gutterBottom color="text.secondary">
          Enterprise Resource Planning for Garment Manufacturing
        </Typography>
        <Typography variant="body1" paragraph sx={{ mt: 3, mb: 4 }}>
          Streamline your garment manufacturing operations with our comprehensive ERP solution.
          Manage inventory, track orders, handle purchasing, and optimize your workflow.
        </Typography>
        
        <Stack direction="row" spacing={2} justifyContent="center">
          <Link href="/login" passHref>
            <Button variant="contained" size="large">
              Sign In
            </Button>
          </Link>
          <Link href="/register" passHref>
            <Button variant="outlined" size="large">
              Create Account
            </Button>
          </Link>
        </Stack>
      </Box>
    </Container>
  )
}
