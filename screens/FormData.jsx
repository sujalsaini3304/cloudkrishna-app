import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Plus, Trash2, Edit2, Save, X, Search,
    GraduationCap, BookOpen, Calendar, Lightbulb, Check, Loader2, Globe
} from 'lucide-react';
import Alert from '@mui/material/Alert';
import axios from 'axios';
import useStore from '../store';

const FormData = () => {
    const navigate = useNavigate();
    const hostServer = useStore((state) => state.hostServer);
    const [activeTab, setActiveTab] = useState('colleges');
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });

    // Add style to hide scrollbar
    React.useEffect(() => {
        const style = document.createElement('style');
        style.textContent = `
            .hide-scrollbar::-webkit-scrollbar {
                display: none;
            }
        `;
        document.head.appendChild(style);
        return () => document.head.removeChild(style);
    }, []);

    // Form data states
    const [colleges, setColleges] = useState([]);
    const [courses, setCourses] = useState([]);
    const [years, setYears] = useState([]);
    const [interests, setInterests] = useState([]);
    const [countryCodes, setCountryCodes] = useState([]);

    // UI states
    const [searchTerm, setSearchTerm] = useState('');
    const [newItem, setNewItem] = useState('');
    const [editingIndex, setEditingIndex] = useState(null);
    const [editingValue, setEditingValue] = useState('');
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);

    // Fetch data on mount and tab change
    useEffect(() => {
        fetchFormFields(activeTab);
    }, [activeTab]);

    const getTypeMapping = (tab) => {
        const mapping = {
            'colleges': 'colleges',
            'courses': 'courses',
            'years': 'years',
            'interests': 'interests',
            'countryCodes': 'countryCodes'
        };
        return mapping[tab];
    };

    const fetchFormFields = async (tab) => {
        try {
            setInitialLoading(true);
            const type = getTypeMapping(tab);
            const token = localStorage.getItem('adminToken');

            const response = await axios.get(`${hostServer}/api/form-fields/${type}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (response.data.success) {
                setCurrentData(response.data.data);
            }
        } catch (error) {
            console.error('Fetch error:', error);
            if (error.response?.status === 401) {
                showNotification('Session expired. Please login again.', 'error');
                setTimeout(() => navigate('/admin/login'), 2000);
            } else {
                showNotification('Failed to fetch data', 'error');
            }
        } finally {
            setInitialLoading(false);
        }
    };

    const showNotification = (message, type) => {
        setNotification({ show: true, message, type });
        setTimeout(() => {
            setNotification({ show: false, message: '', type: '' });
        }, 3000);
    };

    const getCurrentData = () => {
        switch (activeTab) {
            case 'colleges': return colleges;
            case 'courses': return courses;
            case 'years': return years;
            case 'interests': return interests;
            case 'countryCodes': return countryCodes;
            default: return [];
        }
    };

    const setCurrentData = (data) => {
        switch (activeTab) {
            case 'colleges': setColleges(data); break;
            case 'courses': setCourses(data); break;
            case 'years': setYears(data); break;
            case 'interests': setInterests(data); break;
            case 'countryCodes': setCountryCodes(data); break;
        }
    };

    const handleAdd = async () => {
        if (!newItem.trim()) {
            showNotification('Please enter a value', 'error');
            return;
        }

        try {
            setLoading(true);
            const type = getTypeMapping(activeTab);
            const token = localStorage.getItem('adminToken');

            // Split by comma and trim each value
            const values = newItem.split(',').map(v => v.trim()).filter(v => v.length > 0);

            if (values.length === 0) {
                showNotification('Please enter valid values', 'error');
                setLoading(false);
                return;
            }

            // Validate Country Code format
            if (activeTab === 'countryCodes') {
                const invalidFormats = values.filter(v => !v.includes(' - ') || v.split(' - ').length < 2);
                if (invalidFormats.length > 0) {
                    showNotification('Invalid format! Please use "Code - Country" (e.g. +91 - India)', 'error');
                    setLoading(false);
                    return;
                }
            }

            // Track results
            let successCount = 0;
            let duplicateCount = 0;
            let errorCount = 0;

            // Add each value
            for (const value of values) {
                try {
                    const response = await axios.post(
                        `${hostServer}/api/form-fields/${type}`,
                        { value: value },
                        {
                            headers: {
                                Authorization: `Bearer ${token}`
                            }
                        }
                    );

                    if (response.data.success) {
                        successCount++;
                    }
                } catch (error) {
                    if (error.response?.status === 409) {
                        duplicateCount++;
                    } else if (error.response?.status === 401) {
                        showNotification('Session expired. Please login again.', 'error');
                        setTimeout(() => navigate('/admin/login'), 2000);
                        setLoading(false);
                        return;
                    } else {
                        errorCount++;
                    }
                }
            }

            // Refresh data after all additions
            await fetchFormFields(activeTab);
            setNewItem('');

            // Show summary notification
            let message = '';
            if (successCount > 0) {
                message += `${successCount} item${successCount > 1 ? 's' : ''} added successfully`;
            }
            if (duplicateCount > 0) {
                message += `${message ? ', ' : ''}${duplicateCount} duplicate${duplicateCount > 1 ? 's' : ''} skipped`;
            }
            if (errorCount > 0) {
                message += `${message ? ', ' : ''}${errorCount} error${errorCount > 1 ? 's' : ''}`;
            }

            showNotification(message || 'Operation completed', successCount > 0 ? 'success' : 'error');



        } catch (error) {
            console.error('Add error:', error);
            showNotification('Failed to add items', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (index) => {
        try {
            setLoading(true);
            const type = getTypeMapping(activeTab);
            const token = localStorage.getItem('adminToken');
            const currentData = getCurrentData();
            const itemName = currentData[index];

            const response = await axios.delete(
                `${hostServer}/api/form-fields/${type}/${index}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (response.data.success) {
                setCurrentData(response.data.data);
                showNotification(`"${itemName}" deleted successfully`, 'success');
            }
        } catch (error) {
            console.error('Delete error:', error);
            if (error.response?.status === 401) {
                showNotification('Session expired. Please login again.', 'error');
                setTimeout(() => navigate('/admin/login'), 2000);
            } else {
                showNotification('Failed to delete item', 'error');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (index) => {
        const currentData = getCurrentData();
        setEditingIndex(index);
        setEditingValue(currentData[index]);
    };

    const handleSaveEdit = async () => {
        if (!editingValue.trim()) {
            showNotification('Value cannot be empty', 'error');
            return;
        }

        try {
            setLoading(true);
            const type = getTypeMapping(activeTab);
            const token = localStorage.getItem('adminToken');

            const response = await axios.put(
                `${hostServer}/api/form-fields/${type}/${editingIndex}`,
                { value: editingValue.trim() },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (response.data.success) {
                setCurrentData(response.data.data);
                setEditingIndex(null);
                setEditingValue('');
                showNotification('Item updated successfully', 'success');
            }
        } catch (error) {
            console.error('Update error:', error);
            if (error.response?.status === 409) {
                showNotification('This item already exists', 'error');
            } else if (error.response?.status === 401) {
                showNotification('Session expired. Please login again.', 'error');
                setTimeout(() => navigate('/admin/login'), 2000);
            } else {
                showNotification('Failed to update item', 'error');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleCancelEdit = () => {
        setEditingIndex(null);
        setEditingValue('');
    };

    const filteredData = getCurrentData().filter(item =>
        item.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const tabs = [
        { id: 'colleges', label: 'Colleges', icon: GraduationCap, color: 'purple' },
        { id: 'courses', label: 'Courses', icon: BookOpen, color: 'blue' },
        { id: 'years', label: 'Years', icon: Calendar, color: 'green' },
        { id: 'interests', label: 'Areas of Interest', icon: Lightbulb, color: 'orange' },
        { id: 'countryCodes', label: 'Country Codes', icon: Globe, color: 'teal' }
    ];

    const getTabColor = (color) => {
        const colors = {
            purple: {
                active: 'bg-purple-500 text-white',
                inactive: 'text-purple-600 hover:bg-purple-50',
                badge: 'bg-purple-100 text-purple-700',
                button: 'bg-purple-500 hover:bg-purple-600',
                icon: 'text-purple-500'
            },
            blue: {
                active: 'bg-blue-500 text-white',
                inactive: 'text-blue-600 hover:bg-blue-50',
                badge: 'bg-blue-100 text-blue-700',
                button: 'bg-blue-500 hover:bg-blue-600',
                icon: 'text-blue-500'
            },
            green: {
                active: 'bg-green-500 text-white',
                inactive: 'text-green-600 hover:bg-green-50',
                badge: 'bg-green-100 text-green-700',
                button: 'bg-green-500 hover:bg-green-600',
                icon: 'text-green-500'
            },
            orange: {
                active: 'bg-orange-500 text-white',
                inactive: 'text-orange-600 hover:bg-orange-50',
                badge: 'bg-orange-100 text-orange-700',
                button: 'bg-orange-500 hover:bg-orange-600',
                icon: 'text-orange-500'
            },
            teal: {
                active: 'bg-teal-500 text-white',
                inactive: 'text-teal-600 hover:bg-teal-50',
                badge: 'bg-teal-100 text-teal-700',
                button: 'bg-teal-500 hover:bg-teal-600',
                icon: 'text-teal-500'
            }
        };
        return colors[color];
    };

    const currentTab = tabs.find(t => t.id === activeTab);
    const colorScheme = getTabColor(currentTab.color);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate('/admin/dashboard' , {replace: true} )}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <ArrowLeft size={20} className="text-gray-600" />
                            </button>
                            <div>
                                <h1 className="text-lg sm:text-xl font-semibold text-gray-800">Form Data Management</h1>
                                <p className="text-xs sm:text-sm text-gray-600">Manage registration form fields</p>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Notification */}
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
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Tabs */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="border-b border-gray-200 overflow-x-auto hide-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                        <div className="flex min-w-max sm:min-w-0">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                const isActive = activeTab === tab.id;
                                const colors = getTabColor(tab.color);

                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => {
                                            setActiveTab(tab.id);
                                            setSearchTerm('');
                                            setNewItem('');
                                            setEditingIndex(null);
                                        }}
                                        className={`flex items-center gap-2 px-4 sm:px-6 py-4 font-medium transition-colors flex-1 sm:flex-initial ${isActive ? colors.active : colors.inactive
                                            }`}
                                    >
                                        <Icon size={18} />
                                        <span className="text-sm sm:text-base whitespace-nowrap">{tab.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Tab Content */}
                    <div className="p-4 sm:p-6">
                        {initialLoading ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="animate-spin text-blue-500" size={32} />
                            </div>
                        ) : (
                            <>
                                {/* Add New Item */}
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Add New {currentTab.label.slice(0, -1)} (comma-separated for multiple)
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={newItem}
                                            onChange={(e) => setNewItem(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && !loading && handleAdd()}
                                            placeholder={activeTab === 'countryCodes'
                                                ? "Format: +91 - India (use commas for multiple)..."
                                                : `Enter ${currentTab.label.toLowerCase().slice(0, -1)} (use commas for multiple)...`
                                            }
                                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                                            disabled={loading}
                                        />
                                        <button
                                            onClick={handleAdd}
                                            disabled={loading}
                                            className={`flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-colors ${colorScheme.button} disabled:opacity-50 disabled:cursor-not-allowed`}
                                        >
                                            {loading ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
                                            <span className="hidden sm:inline">Add</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Search */}
                                <div className="mb-4">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                        <input
                                            type="text"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            placeholder={`Search ${currentTab.label.toLowerCase()}...`}
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                                        />
                                    </div>
                                </div>

                                {/* Items List */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                                            {currentTab.label} ({filteredData.length})
                                        </h3>
                                    </div>

                                    {filteredData.length === 0 ? (
                                        <div className="text-center py-12">
                                            <div className={`inline-flex p-4 rounded-full ${colorScheme.badge} mb-4`}>
                                                {React.createElement(currentTab.icon, { size: 32, className: colorScheme.icon })}
                                            </div>
                                            <p className="text-gray-500">
                                                {searchTerm ? 'No items found matching your search' : `No ${currentTab.label.toLowerCase()} found in database`}
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                            {filteredData.map((item, index) => {
                                                const actualIndex = getCurrentData().indexOf(item);
                                                const isEditing = editingIndex === actualIndex;

                                                return (
                                                    <div
                                                        key={actualIndex}
                                                        className={`p-4 border rounded-lg transition-all ${isEditing ? 'border-blue-400 bg-blue-50' : 'border-gray-200 bg-white hover:border-gray-300'
                                                            }`}
                                                    >
                                                        {isEditing ? (
                                                            <div className="space-y-2">
                                                                <input
                                                                    type="text"
                                                                    value={editingValue}
                                                                    onChange={(e) => setEditingValue(e.target.value)}
                                                                    className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                                                                    autoFocus
                                                                    disabled={loading}
                                                                />
                                                                <div className="flex gap-2">
                                                                    <button
                                                                        onClick={handleSaveEdit}
                                                                        disabled={loading}
                                                                        className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm disabled:opacity-50"
                                                                    >
                                                                        {loading ? <Loader2 className="animate-spin" size={14} /> : <Check size={14} />}
                                                                        Save
                                                                    </button>
                                                                    <button
                                                                        onClick={handleCancelEdit}
                                                                        disabled={loading}
                                                                        className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm disabled:opacity-50"
                                                                    >
                                                                        <X size={14} />
                                                                        Cancel
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-sm font-medium text-gray-800 break-words flex-1 mr-2">
                                                                    {item}
                                                                </span>
                                                                <div className="flex gap-1 flex-shrink-0">
                                                                    <button
                                                                        onClick={() => handleEdit(actualIndex)}
                                                                        disabled={loading}
                                                                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors disabled:opacity-50"
                                                                        title="Edit"
                                                                    >
                                                                        <Edit2 size={14} />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleDelete(actualIndex)}
                                                                        disabled={loading}
                                                                        className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                                                                        title="Delete"
                                                                    >
                                                                        <Trash2 size={14} />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default FormData;
