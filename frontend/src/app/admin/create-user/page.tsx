"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  TextField,
  Button,
  Typography,
  Stack,
  Alert,
  MenuItem,
  CircularProgress,
  Card,
  CardContent,
  Avatar,
  Chip,
  Divider,
  InputAdornment,
  IconButton,
} from "@mui/material";
import {
  PersonAdd as PersonAddIcon,
  Email as EmailIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
  AdminPanelSettings as AdminIcon,
} from "@mui/icons-material";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useAuthStore } from "@/stores/authStore";
import { registerUser } from "@/services/authService";

const schema = yup.object({
  username: yup.string().required("Username is required").min(3),
  email: yup.string().required("Email is required").email(),
  password: yup.string().required("Password is required").min(6),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords must match")
    .required("Confirm password is required"),
  fullName: yup.string().required("Full name is required"),
  contactNumber: yup.string().required("Contact number is required").max(15),
  role: yup.string().required("Role is required"),
});

type FormData = yup.InferType<typeof schema>;

type ErrorWithResponse = {
  response?: {
    data?: {
      message?: string;
    };
  };
};

export default function CreateUserPage() {
  const { user } = useAuthStore();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);  const [isAuthLoading, setIsAuthLoading] = useState(true);
  // Wait for auth to load
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAuthLoading(false);
    }, 100); // Small delay to allow auth store to initialize

    return () => clearTimeout(timer);
  }, []);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      fullName: "",
      contactNumber: "",
      role: "Employee",
    },
  });

  const onSubmit = async (data: FormData) => {
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      await registerUser(data);
      setSuccess("User created successfully!");
      reset();
    } catch (err) {
      const errorObj = err as ErrorWithResponse;
      if (
        errorObj &&
        typeof errorObj === "object" &&
        errorObj.response?.data?.message
      ) {
        setError(errorObj.response.data.message);
      } else {
        setError("Failed to create user. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };
  const handleTogglePassword = () => setShowPassword(!showPassword);
  const handleToggleConfirmPassword = () => setShowConfirmPassword(!showConfirmPassword);
  // Show loading spinner while authentication is being determined
  if (isAuthLoading) {
    return (
      <Box 
        sx={{ 
          minHeight: "calc(100vh - 64px)", // Account for navbar height
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" 
        }}
      >
        <Card elevation={24} sx={{ borderRadius: 4, overflow: "hidden" }}>
          <CardContent sx={{ p: 6, textAlign: "center" }}>
            <CircularProgress size={60} sx={{ color: "primary.main", mb: 3 }} />
            <Typography variant="h6" color="text.secondary">
              Verifying access permissions...
            </Typography>
          </CardContent>
        </Card>
      </Box>
    );
  }

  // Only allow admins
  if (!user?.roles?.includes("Admin")) {
    return (
      <Box 
        sx={{ 
          minHeight: "calc(100vh - 64px)", // Account for navbar height
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" 
        }}
      >
        <Container maxWidth="sm">
          <Card elevation={24} sx={{ borderRadius: 4, overflow: "hidden" }}>
            <CardContent sx={{ p: 6, textAlign: "center" }}>
              <Avatar sx={{ 
                width: 80, 
                height: 80, 
                mx: "auto", 
                mb: 3,
                bgcolor: "error.main",
                fontSize: "2rem"
              }}>
                <AdminIcon sx={{ fontSize: "3rem" }} />
              </Avatar>
              <Typography variant="h4" fontWeight={700} color="error.main" gutterBottom>
                Access Denied
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                This area is restricted to administrators only. Please contact your system administrator if you believe this is an error.
              </Typography>              <Chip 
                label="Admin Access Required" 
                color="error" 
                variant="outlined"
              />
            </CardContent>
          </Card>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      minHeight: "calc(100vh - 64px)", // Account for navbar height
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      py: 4
    }}>
      <Container maxWidth="md">
        {/* Header Section */}
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <Avatar sx={{ 
            width: 100, 
            height: 100, 
            mx: "auto", 
            mb: 2,
            bgcolor: "white",
            color: "primary.main",
            boxShadow: "0 8px 32px rgba(0,0,0,0.1)"
          }}>
            <PersonAddIcon sx={{ fontSize: "3rem" }} />
          </Avatar>
          <Typography 
            variant="h3" 
            fontWeight={800} 
            color="white" 
            gutterBottom
            sx={{ textShadow: "0 2px 4px rgba(0,0,0,0.3)" }}
          >
            Create New User
          </Typography>
          <Typography 
            variant="h6" 
            color="rgba(255,255,255,0.9)" 
            sx={{ maxWidth: 600, mx: "auto" }}
          >
            Add a new team member to your organization with role-based access control
          </Typography>
        </Box>

        {/* Main Form Card */}
        <Card elevation={24} sx={{ 
          borderRadius: 4, 
          overflow: "hidden",
          backdropFilter: "blur(10px)",
          background: "rgba(255,255,255,0.95)"
        }}>
          <CardContent sx={{ p: 0 }}>
            {/* Alert Messages */}
            {(error || success) && (
              <Box sx={{ p: 3, pb: 0 }}>
                {error && (
                  <Alert 
                    severity="error" 
                    sx={{ 
                      mb: 2,
                      borderRadius: 2,
                      "& .MuiAlert-icon": { fontSize: "1.5rem" }
                    }}
                  >
                    {error}
                  </Alert>
                )}
                {success && (
                  <Alert 
                    severity="success" 
                    sx={{ 
                      mb: 2,
                      borderRadius: 2,
                      "& .MuiAlert-icon": { fontSize: "1.5rem" }
                    }}
                  >
                    {success}
                  </Alert>
                )}
              </Box>
            )}            <form onSubmit={handleSubmit(onSubmit)}>
              <Box sx={{ p: 4 }}>
                <Stack spacing={4}>
                  {/* Personal Information Section */}
                  <Box>
                    <Typography 
                      variant="h5" 
                      fontWeight={600} 
                      color="primary.main"
                      sx={{ display: "flex", alignItems: "center", mb: 2 }}
                    >
                      <PersonIcon sx={{ mr: 1 }} />
                      Personal Information
                    </Typography>
                    <Divider sx={{ mb: 3 }} />
                    
                    <Stack spacing={3}>
                      <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 2 }}>
                        <Controller
                          name="fullName"
                          control={control}
                          render={({ field }) => (
                            <TextField 
                              {...field} 
                              label="Full Name" 
                              fullWidth 
                              variant="outlined"
                              error={!!errors.fullName} 
                              helperText={errors.fullName?.message}
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <PersonIcon color="action" />
                                  </InputAdornment>
                                ),
                              }}
                              sx={{
                                "& .MuiOutlinedInput-root": {
                                  borderRadius: 2,
                                }
                              }}
                            />
                          )}
                        />

                        <Controller
                          name="email"
                          control={control}
                          render={({ field }) => (
                            <TextField 
                              {...field} 
                              label="Email Address" 
                              fullWidth 
                              variant="outlined"
                              error={!!errors.email} 
                              helperText={errors.email?.message}
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <EmailIcon color="action" />
                                  </InputAdornment>
                                ),
                              }}
                              sx={{
                                "& .MuiOutlinedInput-root": {
                                  borderRadius: 2,
                                }
                              }}
                            />
                          )}
                        />
                      </Box>

                      <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 2 }}>
                        <Controller
                          name="username"
                          control={control}
                          render={({ field }) => (
                            <TextField 
                              {...field} 
                              label="Username" 
                              fullWidth 
                              variant="outlined"
                              error={!!errors.username} 
                              helperText={errors.username?.message || "Minimum 3 characters"}
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    @
                                  </InputAdornment>
                                ),
                              }}
                              sx={{
                                "& .MuiOutlinedInput-root": {
                                  borderRadius: 2,
                                }
                              }}
                            />
                          )}
                        />

                        <Controller
                          name="contactNumber"
                          control={control}
                          render={({ field }) => (
                            <TextField 
                              {...field} 
                              label="Contact Number" 
                              fullWidth 
                              variant="outlined"
                              error={!!errors.contactNumber} 
                              helperText={errors.contactNumber?.message}
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <PhoneIcon color="action" />
                                  </InputAdornment>
                                ),
                              }}
                              sx={{
                                "& .MuiOutlinedInput-root": {
                                  borderRadius: 2,
                                }
                              }}
                            />
                          )}
                        />
                      </Box>
                    </Stack>
                  </Box>

                  {/* Security Section */}
                  <Box>
                    <Typography 
                      variant="h5" 
                      fontWeight={600} 
                      color="primary.main"
                      sx={{ display: "flex", alignItems: "center", mb: 2 }}
                    >
                      <LockIcon sx={{ mr: 1 }} />
                      Security & Access
                    </Typography>
                    <Divider sx={{ mb: 3 }} />
                    
                    <Stack spacing={3}>
                      <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 2 }}>
                        <Controller
                          name="password"
                          control={control}
                          render={({ field }) => (
                            <TextField 
                              {...field} 
                              label="Password" 
                              type={showPassword ? "text" : "password"}
                              fullWidth 
                              variant="outlined"
                              error={!!errors.password} 
                              helperText={errors.password?.message || "Minimum 6 characters"}
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <LockIcon color="action" />
                                  </InputAdornment>
                                ),
                                endAdornment: (
                                  <InputAdornment position="end">
                                    <IconButton onClick={handleTogglePassword} edge="end">
                                      {showPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                  </InputAdornment>
                                ),
                              }}
                              sx={{
                                "& .MuiOutlinedInput-root": {
                                  borderRadius: 2,
                                }
                              }}
                            />
                          )}
                        />

                        <Controller
                          name="confirmPassword"
                          control={control}
                          render={({ field }) => (
                            <TextField 
                              {...field} 
                              label="Confirm Password" 
                              type={showConfirmPassword ? "text" : "password"}
                              fullWidth 
                              variant="outlined"
                              error={!!errors.confirmPassword} 
                              helperText={errors.confirmPassword?.message}
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <LockIcon color="action" />
                                  </InputAdornment>
                                ),
                                endAdornment: (
                                  <InputAdornment position="end">
                                    <IconButton onClick={handleToggleConfirmPassword} edge="end">
                                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                  </InputAdornment>
                                ),
                              }}
                              sx={{
                                "& .MuiOutlinedInput-root": {
                                  borderRadius: 2,
                                }
                              }}
                            />
                          )}
                        />
                      </Box>

                      <Box sx={{ maxWidth: { xs: "100%", md: "50%" } }}>
                        <Controller
                          name="role"
                          control={control}
                          render={({ field }) => (
                            <TextField 
                              {...field} 
                              label="User Role" 
                              select 
                              fullWidth 
                              variant="outlined"
                              error={!!errors.role} 
                              helperText={errors.role?.message || "Select the appropriate role for this user"}
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <AdminIcon color="action" />
                                  </InputAdornment>
                                ),
                              }}
                              sx={{
                                "& .MuiOutlinedInput-root": {
                                  borderRadius: 2,
                                }
                              }}                            >
                              <MenuItem value="Admin">
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                  <Chip label="Admin" color="error" size="small" />
                                  <Typography>Full system access</Typography>
                                </Box>
                              </MenuItem>
                              <MenuItem value="Employee">
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                  <Chip label="Employee" color="primary" size="small" />
                                  <Typography>Standard employee access</Typography>
                                </Box>
                              </MenuItem>
                              <MenuItem value="Customer">
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                  <Chip label="Customer" color="info" size="small" />
                                  <Typography>Customer portal access</Typography>
                                </Box>
                              </MenuItem>
                              <MenuItem value="Vendor">
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                  <Chip label="Vendor" color="success" size="small" />
                                  <Typography>Vendor portal access</Typography>
                                </Box>
                              </MenuItem>
                            </TextField>
                          )}
                        />
                      </Box>
                    </Stack>
                  </Box>

                  {/* Action Buttons */}
                  <Box sx={{ pt: 2 }}>
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={2} justifyContent="center">
                      <Button 
                        type="submit" 
                        variant="contained" 
                        size="large" 
                        disabled={loading}
                        startIcon={loading ? <CircularProgress size={20} /> : <PersonAddIcon />}
                        sx={{ 
                          px: 4,
                          py: 1.5,
                          borderRadius: 2,
                          background: "linear-gradient(45deg, #667eea 30%, #764ba2 90%)",
                          boxShadow: "0 4px 20px rgba(102, 126, 234, 0.4)",
                          "&:hover": {
                            boxShadow: "0 6px 25px rgba(102, 126, 234, 0.6)",
                          }
                        }}
                      >
                        {loading ? "Creating User..." : "Create User"}
                      </Button>
                      
                      <Button 
                        variant="outlined" 
                        size="large" 
                        onClick={() => reset()}
                        disabled={loading}
                        sx={{ 
                          px: 4,
                          py: 1.5,
                          borderRadius: 2,
                          borderColor: "primary.main",
                          color: "primary.main",
                          "&:hover": {
                            backgroundColor: "primary.main",
                            color: "white",
                          }
                        }}
                      >
                        Reset Form
                      </Button>
                    </Stack>
                  </Box>
                </Stack>
              </Box>
            </form>
          </CardContent>
        </Card>

        {/* Footer Info */}
        <Box sx={{ textAlign: "center", mt: 4 }}>
          <Typography variant="body2" color="rgba(255,255,255,0.8)">
            Users will receive their login credentials and can change their password on first login
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
