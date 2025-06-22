"use client";

import React, { useState } from "react";
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Stack,
  Alert,
  MenuItem,
  CircularProgress,
} from "@mui/material";
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
      setSuccess("User created successfully.");
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
        setError("Failed to create user.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Only allow admins
  if (!user?.roles?.includes("Admin")) {
    return (
      <Container maxWidth="sm">
        <Paper sx={{ p: 4, mt: 8 }}>
          <Typography variant="h5" color="error">
            Access denied. Admins only.
          </Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", background: "#f5f6fa" }}>
      <Container maxWidth="sm">
        <Paper elevation={8} sx={{ p: 4, borderRadius: 3 }}>
          <Typography variant="h4" fontWeight={700} mb={3}>
            Create New User
          </Typography>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
          <form onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={3}>
              <Controller
                name="username"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Username" fullWidth error={!!errors.username} helperText={errors.username?.message} />
                )}
              />
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Email" fullWidth error={!!errors.email} helperText={errors.email?.message} />
                )}
              />
              <Controller
                name="password"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Password" type="password" fullWidth error={!!errors.password} helperText={errors.password?.message} />
                )}
              />
              <Controller
                name="confirmPassword"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Confirm Password" type="password" fullWidth error={!!errors.confirmPassword} helperText={errors.confirmPassword?.message} />
                )}
              />
              <Controller
                name="fullName"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Full Name" fullWidth error={!!errors.fullName} helperText={errors.fullName?.message} />
                )}
              />
              <Controller
                name="contactNumber"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Contact Number" fullWidth error={!!errors.contactNumber} helperText={errors.contactNumber?.message} />
                )}
              />
              <Controller
                name="role"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Role" select fullWidth error={!!errors.role} helperText={errors.role?.message}>
                    <MenuItem value="Admin">Admin</MenuItem>
                    <MenuItem value="Manager">Manager</MenuItem>
                    <MenuItem value="Employee">Employee</MenuItem>
                  </TextField>
                )}
              />
              <Button type="submit" variant="contained" color="primary" size="large" fullWidth disabled={loading}>
                {loading ? <CircularProgress size={24} /> : "Create User"}
              </Button>
            </Stack>
          </form>
        </Paper>
      </Container>
    </Box>
  );
}
