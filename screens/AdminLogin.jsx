import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Mail, Lock, Eye, EyeOff, LogIn, AlertCircle,
    Shield, Users, ArrowRight
} from 'lucide-react';
import Alert from '@mui/material/Alert';
import axios from 'axios';
import useStore from "../store";

const AdminLogin = () => {
    const { hostServer } = useStore();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });

    useEffect(() => {
        const exist = localStorage.getItem("adminToken")
        if (exist) {
            navigate('/admin/dashboard');
        }
    }, [navigate])


    const validateForm = () => {
        const newErrors = {};

        // Email validation
        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email';
        }

        // Password validation
        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const showNotification = (message, type) => {
        setNotification({ show: true, message, type });
        setTimeout(() => {
            setNotification({ show: false, message: '', type: '' });
        }, 4000);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            const response = await axios.post(`${hostServer}/api/admin/login`, formData);

            // Store token or session
            localStorage.setItem('adminToken', response.data.token);

            showNotification('Login successful! Redirecting...', 'success');

            // Redirect to dashboard after 1 second
            setTimeout(() => {
                navigate('/admin/dashboard', { replace: true });
            }, 1000);

        } catch (error) {
            if (error.response?.status === 401) {
                showNotification('Invalid email or password', 'error');
            } else {
                showNotification('Login failed. Please try again.', 'error');
            }
            console.error('Login error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4 relative">

            <div className="w-full max-w-6xl">
                <div className="grid lg:grid-cols-2 gap-8 lg:gap-0">
                    {/* Left Side - Branding */}
                    <div className="hidden lg:flex flex-col justify-center px-12 py-16 bg-gradient-to-br from-blue-500 to-green-500 rounded-l-2xl">
                        <div className="space-y-8">
                            {/* Logo */}
                            <div className="flex items-center gap-3">
                                <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center shadow-lg">
                                    {/* <Users className="text-blue-500" size={28} /> */}
                                    <img src="/logo.png" alt="Cloud Krishna" className="w-10 h-10" onError={(e) => e.target.src = 'https://cdn-icons-png.flaticon.com/512/6104/6104523.png'} />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold text-white">Cloud Krishna</h1>
                                    <p className="text-blue-100 text-sm">Admin Portal</p>
                                </div>
                            </div>

                            {/* Welcome Message */}
                            <div className="space-y-4">
                                <h2 className="text-4xl font-bold text-white leading-tight">
                                    Welcome Back,<br />Admin
                                </h2>
                                <p className="text-blue-100 text-lg">
                                    Sign in to access your dashboard and manage student applications efficiently.
                                </p>
                            </div>

                            {/* Features */}
                            <div className="space-y-4 pt-8">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                                        <Shield size={20} className="text-white" />
                                    </div>
                                    <div>
                                        <p className="text-white font-semibold">Secure Access</p>
                                        <p className="text-blue-100 text-sm">Protected with encryption</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                                        <Users size={20} className="text-white" />
                                    </div>
                                    <div>
                                        <p className="text-white font-semibold">Student Management</p>
                                        <p className="text-blue-100 text-sm">Manage all applications</p>
                                    </div>
                                </div>
                            </div>

                            {/* Decorative Elements */}
                            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/10 to-transparent rounded-bl-2xl"></div>
                        </div>
                    </div>

                    {/* Right Side - Login Form */}
                    <div className="bg-white p-8 sm:p-12 lg:rounded-r-2xl lg:shadow-xl rounded-2xl lg:rounded-l-none shadow-lg">
                        {/* Mobile Logo */}
                        <div className="lg:hidden mb-8 text-center">
                            <div className="flex items-center justify-center gap-3 mb-2">
                                <div className="w-12 h-12 rounded-xl flex items-center justify-center">
                                    {/* <Users className="text-white" size={24} /> */}
                                    <img src="/logo.png" alt="Cloud Krishna" className="w-10 h-10" onError={(e) => e.target.src = 'https://cdn-icons-png.flaticon.com/512/6104/6104523.png'} />

                                </div>
                                <div className="text-left">
                                    <h1 className="text-2xl font-bold text-gray-800">Cloud Krishna</h1>
                                    <p className="text-sm text-gray-500">Admin Portal</p>
                                </div>
                            </div>
                        </div>

                        {/* Form Header */}
                        <div className="mb-8">
                            <h2 className="text-3xl font-bold text-gray-800 mb-2">Admin Sign In</h2>
                            <p className="text-gray-600">Enter your credentials to access the dashboard</p>
                        </div>

                        {/* Login Form */}
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {notification.show && (
                                <Alert
                                    severity={notification.type === 'success' ? 'success' : 'error'}
                                    onClose={() => setNotification({ show: false, message: '', type: '' })}
                                >
                                    {notification.message}
                                </Alert>
                            )}
                            {/* Email Input */}
                            <div>
                                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2">
                                        <Mail size={20} className="text-blue-400" />
                                    </div>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className={`w-full pl-11 pr-4 py-3 bg-blue-50/50 border rounded-lg focus:outline-none focus:ring-2 transition-all ${errors.email
                                            ? 'border-red-300 focus:ring-red-400'
                                            : 'border-blue-200 focus:ring-blue-400'
                                            }`}
                                        placeholder="admin@cloudkrishna.com"
                                    />
                                </div>
                                {errors.email && (
                                    <div className="flex items-center gap-1 mt-2 text-red-600">
                                        <AlertCircle size={14} />
                                        <span className="text-sm">{errors.email}</span>
                                    </div>
                                )}
                            </div>

                            {/* Password Input */}
                            <div>
                                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                                    Password
                                </label>
                                <div className="relative">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2">
                                        <Lock size={20} className="text-green-400" />
                                    </div>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        id="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        className={`w-full pl-11 pr-12 py-3 bg-green-50/50 border rounded-lg focus:outline-none focus:ring-2 transition-all ${errors.password
                                            ? 'border-red-300 focus:ring-red-400'
                                            : 'border-green-200 focus:ring-green-400'
                                            }`}
                                        placeholder="Enter your password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                                {errors.password && (
                                    <div className="flex items-center gap-1 mt-2 text-red-600">
                                        <AlertCircle size={14} />
                                        <span className="text-sm">{errors.password}</span>
                                    </div>
                                )}
                            </div>

                            {/* Remember Me & Forgot Password */}
                            <div className="flex items-center justify-between">
                                {/* <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 text-blue-500 border-gray-300 rounded focus:ring-2 focus:ring-blue-400"
                                    />
                                    <span className="text-sm text-gray-600">Remember me</span>
                                </label> */}
                                <button
                                    type="button"
                                    className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                                >
                                    Forgot Password?
                                </button>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-lg hover:from-blue-600 hover:to-green-600 transition-all font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span>Signing In...</span>
                                    </>
                                ) : (
                                    <>
                                        <LogIn size={20} />
                                        <span>Sign In</span>
                                        <ArrowRight size={20} />
                                    </>
                                )}
                            </button>

                            {/* Help Text */}
                            <div className="pt-6 border-t border-gray-200">
                                <p className="text-center text-sm text-gray-600">
                                    Need help accessing your account?{' '}
                                    <button
                                        type="button"
                                        className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
                                    >
                                        Contact Support
                                    </button>
                                </p>
                            </div>
                        </form>

                        {/* Security Notice */}
                        <div className="mt-8 p-4 bg-blue-50 border border-blue-100 rounded-lg">
                            <div className="flex items-start gap-3">
                                <Shield size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-semibold text-blue-800 mb-1">Secure Login</p>
                                    <p className="text-xs text-blue-700">
                                        Your connection is encrypted and secure. We never store your password in plain text.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="mt-6 pt-6 border-t border-gray-200">
                            <p className="text-center text-sm text-gray-500">
                                © 2026 Cloud Krishna. All rights reserved.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default AdminLogin;