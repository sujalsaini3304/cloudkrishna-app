import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Shield, Search, Edit, Trash2, Eye, Plus, X, Check, AlertCircle, LogOut, Menu,
    MoreVertical, Mail, Lock, Clock, CheckCircle, XCircle, User, Building2,
    Download, Filter, ChevronDown, Eye as EyeIcon, EyeOff
} from 'lucide-react';
import Alert from '@mui/material/Alert';
import axios from 'axios';
import useStore from "../store";

const SuperAdminDashboard = () => {
    const { hostServer } = useStore();
    const navigate = useNavigate();
    
    // State Management
    const [admins, setAdmins] = useState([]);
    const [filteredAdmins, setFilteredAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterRole, setFilterRole] = useState('all');
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState('view'); // 'view', 'create', 'edit', 'delete'
    const [selectedAdmin, setSelectedAdmin] = useState(null);
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Form Data
    const [formData, setFormData] = useState({
        fullname: '',
        email: '',
        password: '',
        phone_number: '',
        role: 'admin',
        status: 'active'
    });

    const [formErrors, setFormErrors] = useState({});
    const [editErrors, setEditErrors] = useState({});

    // Token Check on Mount
    // useEffect(() => {
    //     const exist = localStorage.getItem("superAdminToken");
    //     if (!exist) {
    //         navigate('/admin/login');
    //     }
    // }, [navigate]);

    // Notification Handler
    const showNotification = useCallback((message, type) => {
        setNotification({ show: true, message, type });
        const timer = setTimeout(() => {
            setNotification({ show: false, message: '', type: '' });
        }, 3000);
        return () => clearTimeout(timer);
    }, []);

    // Fetch Admins
    const fetchAdmins = useCallback(async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("superAdminToken");
            const response = await axios.get(`${hostServer}/api/fetch/admins`, 
            //     {
            //     headers: {
            //         Authorization: `Bearer ${token}`
            //     }
            // }
        );
            setAdmins(response.data.data);
            setFilteredAdmins(response.data.data);
        } catch (error) {
            showNotification('Failed to fetch admins', 'error');
            console.error('Error fetching admins:', error);
        } finally {
            setLoading(false);
        }
    }, [hostServer, showNotification]);

    useEffect(() => {
        fetchAdmins();
    }, [fetchAdmins]);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Filter admins
    useEffect(() => {
        let filtered = admins;

        if (debouncedSearchTerm) {
            filtered = filtered.filter(admin =>
                admin.fullname?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
                admin.email?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
                admin._id?.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
            );
        }

        if (filterStatus !== 'all') {
            filtered = filtered.filter(admin => admin.status === filterStatus);
        }

        if (filterRole !== 'all') {
            filtered = filtered.filter(admin => admin.role === filterRole);
        }

        setFilteredAdmins(filtered);
    }, [debouncedSearchTerm, filterStatus, filterRole, admins]);

    // Validation Functions
    const isValidEmail = useCallback((email) => {
        const basicFormat = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!basicFormat.test(email)) return false;
        
        const parts = email.split('@');
        if (parts.length !== 2) return false;

        const [localPart, domain] = parts;
        const localRegex = /^[a-zA-Z0-9]([a-zA-Z0-9._%-]*[a-zA-Z0-9])?$/;
        
        if (!localRegex.test(localPart) || localPart.length > 64) return false;
        if (localPart.includes('..')) return false;

        const domainParts = domain.split('.');
        if (domainParts.length < 2) return false;

        for (let i = 0; i < domainParts.length; i++) {
            const part = domainParts[i];
            if (part.length === 0 || part.length > 63) return false;
            
            if (i === domainParts.length - 1) {
                const tldRegex = /^[a-zA-Z]{2,}$/;
                if (!tldRegex.test(part)) return false;
            } else {
                const domainPartRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?$/;
                if (!domainPartRegex.test(part)) return false;
            }
        }
        return true;
    }, []);

    const isValidName = useCallback((name) => {
        return /^[a-zA-Z\s]+$/.test(name) && name.length >= 3;
    }, []);

    const isValidPassword = useCallback((password) => {
        return password.length >= 6;
    }, []);

    const isValidPhone = useCallback((phone) => {
        return /^[0-9]+$/.test(phone) && phone.length >= 10;
    }, []);

    // Modal Handlers
    const handleCreateAdmin = useCallback(() => {
        setFormData({
            fullname: '',
            email: '',
            password: '',
            phone_number: '',
            role: 'admin',
            status: 'active'
        });
        setFormErrors({});
        setModalType('create');
        setShowModal(true);
    }, []);

    const handleViewAdmin = useCallback((admin) => {
        setSelectedAdmin(admin);
        setModalType('view');
        setShowModal(true);
    }, []);

    const handleEditAdmin = useCallback((admin) => {
        setSelectedAdmin(admin);
        setFormData({
            fullname: admin.fullname || '',
            email: admin.email || '',
            password: '',
            phone_number: admin.phone_number || '',
            role: admin.role || 'admin',
            status: admin.status || 'active'
        });
        setEditErrors({});
        setModalType('edit');
        setShowModal(true);
    }, []);

    const handleDeleteAdmin = useCallback((admin) => {
        setSelectedAdmin(admin);
        setModalType('delete');
        setShowModal(true);
    }, []);

    // Form Handlers
    const handleFormChange = useCallback((field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (formErrors[field]) {
            setFormErrors(prev => ({ ...prev, [field]: '' }));
        }
    }, [formErrors]);

    // Save Admin
    const handleSaveAdmin = useCallback(async () => {
        const errors = {};

        if (!isValidName(formData.fullname)) {
            errors.fullname = 'Name must contain only letters and spaces (min 3 characters)';
        }

        if (!isValidEmail(formData.email)) {
            errors.email = 'Please enter a valid email address';
        }

        if (modalType === 'create' && !isValidPassword(formData.password)) {
            errors.password = 'Password must be at least 6 characters';
        }

        if (!isValidPhone(formData.phone_number)) {
            errors.phone_number = 'Phone number must be at least 10 digits';
        }

        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }

        try {
            const token = localStorage.getItem("superAdminToken");
            const payload = {
                fullname: formData.fullname,
                email: formData.email,
                phone_number: formData.phone_number,
                role: formData.role,
                status: modalType === 'edit' ? formData.status : 'active'
            };

            if (modalType === 'create') {
                payload.password = formData.password;
                await axios.post(`${hostServer}/api/admin/register`, payload, 
                //     {
                //     headers: { Authorization: `Bearer ${token}` }
                // }
            );
                showNotification('Admin created successfully', 'success');
            } else if (modalType === 'edit') {
                if (formData.password) {
                    payload.password = formData.password;
                }
                await axios.put(`${hostServer}/api/admin/${selectedAdmin._id}`, payload, 
                //     {
                //     headers: { Authorization: `Bearer ${token}` }
                //    }
            );
                showNotification('Admin updated successfully', 'success');
            }

            setShowModal(false);
            setFormErrors({});
            fetchAdmins();
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Failed to save admin';
            showNotification(errorMsg, 'error');
            console.error('Error saving admin:', error);
        }
    }, [formData, modalType, selectedAdmin, isValidName, isValidEmail, isValidPassword, hostServer, showNotification, fetchAdmins]);

    // Delete Admin
    const handleConfirmDelete = useCallback(async () => {
        try {
            const token = localStorage.getItem("superAdminToken");
            await axios.delete(`${hostServer}/api/admin/${selectedAdmin._id}`, 
            //     {
            //     headers: { Authorization: `Bearer ${token}` }
            // }
        );
            showNotification('Admin deleted successfully', 'success');
            setShowModal(false);
            fetchAdmins();
        } catch (error) {
            showNotification('Failed to delete admin', 'error');
            console.error('Error deleting admin:', error);
        }
    }, [selectedAdmin, hostServer, showNotification, fetchAdmins]);

    // Logout
    const handleLogout = useCallback(() => {
        // localStorage.removeItem("superAdminToken");
        navigate('/admin/login');
    }, [navigate]);

    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <header className="bg-white border-b border-purple-100 sticky top-0 z-40 shadow-sm overflow-x-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        {/* Logo */}
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                                <img src="/logo.png" alt="Cloud Krishna" className="w-10 h-10" onError={(e) => e.target.src = 'https://cdn-icons-png.flaticon.com/512/6104/6104523.png'} />
                            </div>
                            <div>
                                <h1 className="text-lg font-semibold text-gray-800">Cloud Krishna</h1>
                                <p className="text-xs text-gray-500">Super Admin Dashboard</p>
                            </div>
                        </div>

                        {/* Desktop Actions */}
                        <div className="hidden md:flex items-center gap-3">
                            <div className="flex items-center gap-2 px-4 py-2 bg-purple-50 rounded-lg border border-purple-100">
                                <Shield size={16} className="text-purple-600" />
                                <span className="text-sm font-semibold text-gray-800">{filteredAdmins.length}</span>
                                <span className="text-sm text-gray-600">Admins</span>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            >
                                <LogOut size={18} />
                                <span className="font-medium text-sm">Logout</span>
                            </button>
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden bg-white border-t border-purple-100 px-4 py-3 space-y-2">
                        <div className="flex items-center gap-2 px-4 py-3 bg-purple-50 rounded-lg border border-purple-100">
                            <Shield size={18} className="text-purple-600" />
                            <span className="font-semibold text-gray-800">{filteredAdmins.length}</span>
                            <span className="text-sm text-gray-600">Admins</span>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        >
                            <LogOut size={18} />
                            <span className="font-medium">Logout</span>
                        </button>
                    </div>
                )}
            </header>

            {/* Notification Alert */}
            {notification.show && (
                <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md px-4 sm:px-6">
                    <Alert 
                        severity={notification.type === 'success' ? 'success' : 'error'}
                        onClose={() => setNotification({ show: false, message: '', type: '' })}
                    >
                        {notification.message}
                    </Alert>
                </div>
            )}

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
                {/* Page Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-800">Admin Management</h2>
                        <p className="text-gray-600 text-sm mt-1">Manage administrators and their permissions</p>
                    </div>
                    <button
                        onClick={handleCreateAdmin}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                    >
                        <Plus size={20} />
                        <span>Add Admin</span>
                    </button>
                </div>

                {/* Search and Filters */}
                <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
                    <div className="flex flex-col lg:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search by name, email, or ID..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                        </div>

                        {/* Status Filter */}
                        <div className="flex items-center gap-2">
                            <Filter size={20} className="text-gray-600" />
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                            >
                                <option value="all">All Status</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                                <option value="suspended">Suspended</option>
                            </select>
                        </div>

                        {/* Role Filter */}
                        <div className="flex items-center gap-2">
                            <select
                                value={filterRole}
                                onChange={(e) => setFilterRole(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                            >
                                <option value="all">All Roles</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Admins Table */}
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                        </div>
                    ) : filteredAdmins.length === 0 ? (
                        <div className="text-center py-12">
                            <Shield size={48} className="mx-auto text-gray-400 mb-4" />
                            <p className="text-gray-600 text-lg">No admins found</p>
                            <p className="text-gray-500 text-sm">Create your first admin to get started</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Email</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Role</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Created</th>
                                        <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {filteredAdmins.map((admin) => (
                                        <tr key={admin._id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                                        <User size={20} className="text-purple-600" />
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-gray-800">{admin.fullname}</p>
                                                        <p className="text-xs text-gray-500">{admin._id}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-gray-700">{admin.email}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                                                    {admin.role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    {admin.status === 'active' ? (
                                                        <>
                                                            <CheckCircle size={16} className="text-green-600" />
                                                            <span className="text-green-700 text-sm font-medium">Active</span>
                                                        </>
                                                    ) : admin.status === 'inactive' ? (
                                                        <>
                                                            <Clock size={16} className="text-yellow-600" />
                                                            <span className="text-yellow-700 text-sm font-medium">Inactive</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <XCircle size={16} className="text-red-600" />
                                                            <span className="text-red-700 text-sm font-medium">Suspended</span>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-gray-700 text-sm">
                                                    {new Date(admin.createdAt).toLocaleDateString()}
                                                </p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleViewAdmin(admin)}
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="View"
                                                    >
                                                        <Eye size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleEditAdmin(admin)}
                                                        className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                                                        title="Edit"
                                                    >
                                                        <Edit size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteAdmin(admin)}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Summary Stats */}
                {!loading && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-white rounded-lg border border-gray-200 p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-600 text-sm">Total Admins</p>
                                    <p className="text-3xl font-bold text-gray-800 mt-1">{admins.length}</p>
                                </div>
                                <Shield size={32} className="text-purple-600 opacity-20" />
                            </div>
                        </div>
                        <div className="bg-white rounded-lg border border-gray-200 p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-600 text-sm">Active</p>
                                    <p className="text-3xl font-bold text-green-600 mt-1">
                                        {admins.filter(a => a.status === 'active').length}
                                    </p>
                                </div>
                                <CheckCircle size={32} className="text-green-600 opacity-20" />
                            </div>
                        </div>
                        <div className="bg-white rounded-lg border border-gray-200 p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-600 text-sm">Inactive</p>
                                    <p className="text-3xl font-bold text-yellow-600 mt-1">
                                        {admins.filter(a => a.status === 'inactive').length}
                                    </p>
                                </div>
                                <Clock size={32} className="text-yellow-600 opacity-20" />
                            </div>
                        </div>
                        <div className="bg-white rounded-lg border border-gray-200 p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-600 text-sm">Suspended</p>
                                    <p className="text-3xl font-bold text-red-600 mt-1">
                                        {admins.filter(a => a.status === 'suspended').length}
                                    </p>
                                </div>
                                <XCircle size={32} className="text-red-600 opacity-20" />
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* Modal */}
            {showModal && (
                <div style={{
                    animation: 'fadeIn 0.3s ease-in-out',
                    backgroundColor: 'rgba(255, 255, 255, 0.3)',
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)'
                }} className="fixed inset-0 flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
                    <div style={{
                        animation: 'slideUp 0.3s ease-out'
                    }} className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white rounded-t-2xl">
                            <h2 className="text-2xl font-bold text-purple-600">
                                {modalType === 'view' && '👁️ View Admin'}
                                {modalType === 'create' && '➕ Create New Admin'}
                                {modalType === 'edit' && '✏️ Edit Admin'}
                                {modalType === 'delete' && '🗑️ Delete Admin'}
                            </h2>
                            <button
                                onClick={() => setShowModal(false)}
                                className="p-2 text-gray-500 hover:bg-purple-50 hover:text-purple-600 rounded-full transition-all"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6 space-y-4">
                            {modalType === 'view' && selectedAdmin && (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-semibold text-gray-700">Full Name</label>
                                            <p className="text-gray-800 mt-1">{selectedAdmin.fullname}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-semibold text-gray-700">Email</label>
                                            <p className="text-gray-800 mt-1">{selectedAdmin.email}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-semibold text-gray-700">Role</label>
                                            <p className="text-gray-800 mt-1 capitalize">{selectedAdmin.role}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-semibold text-gray-700">Status</label>
                                            <p className="text-gray-800 mt-1 capitalize">{selectedAdmin.status}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-semibold text-gray-700">Phone Number</label>
                                            <p className="text-gray-800 mt-1">{selectedAdmin.phone_number || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-semibold text-gray-700">Created</label>
                                            <p className="text-gray-800 mt-1">{new Date(selectedAdmin.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {(modalType === 'create' || modalType === 'edit') && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm font-semibold text-gray-700">Full Name *</label>
                                        <input
                                            type="text"
                                            value={formData.fullname}
                                            onChange={(e) => handleFormChange('fullname', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 mt-1"
                                            placeholder="Enter full name (min 3 characters)"
                                        />
                                        {(formErrors.fullname || editErrors.fullname) && (
                                            <p className="text-red-600 text-sm mt-1">{formErrors.fullname || editErrors.fullname}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="text-sm font-semibold text-gray-700">Email *</label>
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => handleFormChange('email', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 mt-1"
                                            placeholder="Enter admin email"
                                            disabled={modalType === 'edit'}
                                        />
                                        {(formErrors.email || editErrors.email) && (
                                            <p className="text-red-600 text-sm mt-1">{formErrors.email || editErrors.email}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="text-sm font-semibold text-gray-700">
                                            {modalType === 'create' ? 'Password *' : 'New Password (leave blank to keep current)'}
                                        </label>
                                        <div className="relative mt-1">
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                value={formData.password}
                                                onChange={(e) => handleFormChange('password', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 pr-10"
                                                placeholder={modalType === 'create' ? "Enter password (min 8 characters)" : "Leave blank to keep current"}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-gray-800"
                                            >
                                                {showPassword ? <EyeOff size={18} /> : <EyeIcon size={18} />}
                                            </button>
                                        </div>
                                        {(formErrors.password || editErrors.password) && (
                                            <p className="text-red-600 text-sm mt-1">{formErrors.password || editErrors.password}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="text-sm font-semibold text-gray-700">Phone Number *</label>
                                        <input
                                            type="tel"
                                            value={formData.phone_number}
                                            onChange={(e) => handleFormChange('phone_number', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 mt-1"
                                            placeholder="Enter phone number (min 10 digits)"
                                        />
                                        {(formErrors.phone_number || editErrors.phone_number) && (
                                            <p className="text-red-600 text-sm mt-1">{formErrors.phone_number || editErrors.phone_number}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="text-sm font-semibold text-gray-700">Role</label>
                                        <select
                                            value={formData.role}
                                            onChange={(e) => handleFormChange('role', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 mt-1"
                                        >
                                            <option value="admin">Admin</option>
                                        </select>
                                    </div>

                                    {modalType === 'edit' && (
                                        <div>
                                            <label className="text-sm font-semibold text-gray-700">Status</label>
                                            <select
                                                value={formData.status}
                                                onChange={(e) => handleFormChange('status', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 mt-1"
                                            >
                                                <option value="active">Active</option>
                                                <option value="inactive">Inactive</option>
                                            </select>
                                        </div>
                                    )}
                                </div>
                            )}


                            {modalType === 'delete' && (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4 bg-red-50 border border-red-200 rounded-lg p-4">
                                        <AlertCircle size={32} className="text-red-600 flex-shrink-0" />
                                        <div>
                                            <p className="font-semibold text-gray-800">Confirm Delete</p>
                                            <p className="text-sm text-gray-600 mt-1">
                                                Are you sure you want to delete <strong>{selectedAdmin?.name}</strong>? This action cannot be undone.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="border-t border-gray-200 p-6 flex justify-end gap-3 sticky bottom-0 bg-white">
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                            >
                                {modalType === 'delete' ? 'Cancel' : 'Close'}
                            </button>
                            {modalType === 'create' && (
                                <button
                                    onClick={handleSaveAdmin}
                                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center gap-2"
                                >
                                    <Check size={18} />
                                    Create Admin
                                </button>
                            )}
                            {modalType === 'edit' && (
                                <button
                                    onClick={handleSaveAdmin}
                                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center gap-2"
                                >
                                    <Check size={18} />
                                    Update Admin
                                </button>
                            )}
                            {modalType === 'delete' && (
                                <button
                                    onClick={handleConfirmDelete}
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center gap-2"
                                >
                                    <Trash2 size={18} />
                                    Delete Admin
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SuperAdminDashboard;
