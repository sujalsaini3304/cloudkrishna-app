import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Mail, Check, AlertCircle,
    Shield, Users
} from 'lucide-react';
import Alert from '@mui/material/Alert';
import axios from 'axios';
import useStore from "../store";

const SuperAdminLogin = () => {
    const { hostServer } = useStore();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [step, setStep] = useState('email'); // 'email' or 'code'
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });
    const [resendCooldown, setResendCooldown] = useState(0);

    useEffect(() => {
        const exist = localStorage.getItem("superAdminToken");
        if (exist) {
            navigate('/super/admin/dashboard' , {replace:true});
        }
    }, [navigate]);

    useEffect(() => {
        if (resendCooldown <= 0) return;
        const timer = setInterval(() => {
            setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(timer);
    }, [resendCooldown]);

    const validateEmail = () => {
        const newErrors = {};

        // Email validation
        if (!email) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = 'Please enter a valid email';
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

    const handleEmailAuth = async (e) => {
        e.preventDefault();

        if (!validateEmail()) {
            return;
        }

        setLoading(true);

        try {
            const response = await axios.post(`${hostServer}/api/super/admin/login`, { email });

            showNotification(response.data?.message || 'Verification code sent to your email', 'success');
            setStep('code');
            setResendCooldown(120);

        } catch (error) {
            console.error('Login error:', error);

            let errorMessage = 'Failed to send verification code. Please try again.';
            if (error.response?.data) {
                if (typeof error.response.data === 'string') {
                    errorMessage = error.response.data;
                } else if (error.response.data?.message) {
                    errorMessage = error.response.data.message;
                } else if (error.response.data?.error) {
                    errorMessage = error.response.data.error;
                }
            } else if (error.message) {
                errorMessage = error.message;
            }

            showNotification(errorMessage, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleCodeVerification = async (e) => {
        e.preventDefault();

        // Validate code
        if (!verificationCode || verificationCode.length !== 6) {
            setErrors({ code: 'Please enter a valid 6-digit code' });
            return;
        }

        setLoading(true);

        try {
            const response = await axios.post(`${hostServer}/api/verify/super/admin`, {
                code: verificationCode
            });

            // Store token
            localStorage.setItem('superAdminToken', response.data.token);

            showNotification(response.data?.message || 'Login successful! Redirecting...', 'success');

            // Redirect to dashboard after 1 second
            setTimeout(() => {
                navigate('/super/admin/dashboard', { replace: true });
            }, 1000);

        } catch (error) {
            console.error('Verification error:', error);

            let errorMessage = 'Verification failed. Please try again.';
            if (error.response?.data) {
                if (typeof error.response.data === 'string') {
                    errorMessage = error.response.data;
                } else if (error.response.data?.message) {
                    errorMessage = error.response.data.message;
                } else if (error.response.data?.error) {
                    errorMessage = error.response.data.error;
                }
            } else if (error.message) {
                errorMessage = error.message;
            }

            showNotification(errorMessage, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleResendCode = async () => {
        if (resendCooldown > 0) {
            return;
        }

        setLoading(true);

        try {
            const response = await axios.post(`${hostServer}/api/super/admin/login`, { email });

            showNotification(response.data?.message || 'New verification code sent', 'success');
            setVerificationCode('');
            setResendCooldown(120);

        } catch (error) {
            console.error('Resend error:', error);

            let errorMessage = 'Failed to resend code. Please try again.';
            if (error.response?.data) {
                if (typeof error.response.data === 'string') {
                    errorMessage = error.response.data;
                } else if (error.response.data?.message) {
                    errorMessage = error.response.data.message;
                } else if (error.response.data?.error) {
                    errorMessage = error.response.data.error;
                }
            } else if (error.message) {
                errorMessage = error.message;
            }

            showNotification(errorMessage, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        setEmail(e.target.value);
        // Clear error when user starts typing
        if (errors.email) {
            setErrors({});
        }
    };

    const handleCodeInputChange = (e) => {
        const value = e.target.value;
        // Only allow digits and limit to 6 characters
        if (/^\d{0,6}$/.test(value)) {
            setVerificationCode(value);
            if (errors.code) {
                setErrors({});
            }
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
                                    <img src="/logo.png" alt="Cloud Krishna" className="w-10 h-10" onError={(e) => e.target.src = 'https://cdn-icons-png.flaticon.com/512/6104/6104523.png'} />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold text-white">Cloud Krishna</h1>
                                    <p className="text-blue-100 text-sm">Super Admin Portal</p>
                                </div>
                            </div>

                            {/* Welcome Message */}
                            <div className="space-y-4">
                                <h2 className="text-4xl font-bold text-white leading-tight">
                                    Welcome,<br />Super Admin
                                </h2>
                                <p className="text-blue-100 text-lg">
                                    Sign in to access your dashboard and manage the platform.
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
                                        <p className="text-white font-semibold">Admin Management</p>
                                        <p className="text-blue-100 text-sm">Control roles & access</p>
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
                                    <img src="/logo.png" alt="Cloud Krishna" className="w-10 h-10" onError={(e) => e.target.src = 'https://cdn-icons-png.flaticon.com/512/6104/6104523.png'} />
                                </div>
                                <div className="text-left">
                                    <h1 className="text-2xl font-bold text-gray-800">Cloud Krishna</h1>
                                    <p className="text-sm text-gray-500">Super Admin Portal</p>
                                </div>
                            </div>
                        </div>

                        {/* Form Header */}
                        <div className="mb-8">
                            <h2 className="text-3xl font-bold text-gray-800 mb-2">Super Admin Sign In</h2>
                            <p className="text-gray-600">
                                {step === 'email'
                                    ? 'Enter your email to receive a verification code'
                                    : 'Enter the 6-digit code sent to your email'}
                            </p>
                        </div>

                        {/* Login Form */}
                        <form onSubmit={step === 'email' ? handleEmailAuth : handleCodeVerification} className="space-y-6">
                            {notification.show && (
                                <Alert
                                    severity={notification.type === 'success' ? 'success' : 'error'}
                                    onClose={() => setNotification({ show: false, message: '', type: '' })}
                                >
                                    {notification.message}
                                </Alert>
                            )}

                            {step === 'email' ? (
                                <>
                                    {/* Email Input */}
                                    <div>
                                        <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                                            Email Address
                                        </label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-3.5 text-blue-400" size={20} />
                                            <input
                                                type="email"
                                                id="email"
                                                value={email}
                                                onChange={handleInputChange}
                                                placeholder="Enter your email"
                                                className={`w-full pl-10 pr-4 py-2.5 bg-blue-50/50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition ${errors.email ? 'border-red-500' : 'border-blue-200'
                                                    }`}
                                                disabled={loading}
                                            />
                                        </div>
                                        {errors.email && (
                                            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                                                <AlertCircle size={16} />
                                                {errors.email}
                                            </p>
                                        )}
                                    </div>

                                    {/* Submit Button */}
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg transition duration-200 flex items-center justify-center gap-2"
                                    >
                                        {loading ? (
                                            <>
                                                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                                Sending code...
                                            </>
                                        ) : (
                                            <>
                                                <Mail size={20} />
                                                Send Verification Code
                                            </>
                                        )}
                                    </button>
                                </>
                            ) : (
                                <>
                                    {/* Verification Code Input */}
                                    <div>
                                        <label htmlFor="code" className="block text-sm font-semibold text-gray-700 mb-2">
                                            Verification Code
                                        </label>
                                        <input
                                            type="text"
                                            id="code"
                                            value={verificationCode}
                                            onChange={handleCodeInputChange}
                                            placeholder="000000"
                                            maxLength="6"
                                            className={`w-full px-4 py-2.5 bg-blue-50/50 border rounded-lg text-center text-2xl tracking-widest font-semibold focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition ${errors.code ? 'border-red-500' : 'border-blue-200'
                                                }`}
                                            disabled={loading}
                                        />
                                        {errors.code && (
                                            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                                                <AlertCircle size={16} />
                                                {errors.code}
                                            </p>
                                        )}
                                    </div>

                                    {/* Verify Button */}
                                    <button
                                        type="submit"
                                        disabled={loading || verificationCode.length !== 6}
                                        className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg transition duration-200 flex items-center justify-center gap-2"
                                    >
                                        {loading ? (
                                            <>
                                                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                                Verifying...
                                            </>
                                        ) : (
                                            <>
                                                <Check size={20} />
                                                Verify Code
                                            </>
                                        )}
                                    </button>

                                    {/* Resend and Back Buttons */}
                                    <div className="flex gap-3">
                                        <button
                                            type="button"
                                            onClick={handleResendCode}
                                            disabled={loading || resendCooldown > 0}
                                            className="flex-1 border-2 border-blue-300 hover:border-blue-500 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed text-blue-600 font-semibold py-2.5 rounded-lg transition duration-200"
                                        >
                                            {resendCooldown > 0 ? `Resend in ${String(Math.floor(resendCooldown / 60)).padStart(2, '0')}:${String(resendCooldown % 60).padStart(2, '0')}` : 'Resend Code'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setStep('email');
                                                setVerificationCode('');
                                                setErrors({});
                                            }}
                                            disabled={loading}
                                            className="flex-1 border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 font-semibold py-2.5 rounded-lg transition duration-200"
                                        >
                                            Back
                                        </button>
                                    </div>
                                </>
                            )}
                        </form>

                        {/* Footer */}
                        {/* <p className="mt-6 text-center text-sm text-gray-600">
                            Need help? <a href="#" className="text-blue-600 hover:text-blue-700 font-semibold">Contact support</a>
                        </p> */}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SuperAdminLogin;
