import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Users, Search, Edit, Trash2, Eye, Download,
    Plus, X, Check, AlertCircle, LogOut, Menu, FileText,
    Mail, Phone, GraduationCap, BookOpen, Calendar, Filter,
    ChevronDown, MoreVertical, User, Building2
} from 'lucide-react';
import Alert from '@mui/material/Alert';
import axios from 'axios';
import useStore from "../store";

const AdminDashboard = () => {
    const { hostServer } = useStore();
    const navigate = useNavigate();
    const [students, setStudents] = useState([]);
    const [filteredStudents, setFilteredStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState('view');
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [editFormData, setEditFormData] = useState({
        fullname: '',
        email: '',
        countryCode: '+91',
        phone: '',
        college: '',
        course: '',
        current_year: '',
        area_of_interest: [],
        status: ''
    });
    const [editErrors, setEditErrors] = useState({
        fullname: '',
        email: '',
        phone: '',
        college: '',
        general: ''
    });
    const [collegeSearch, setCollegeSearch] = useState('');
    const [collegeDropdownOpen, setCollegeDropdownOpen] = useState(false);
    const [courseSearch, setCourseSearch] = useState('');
    const [courseDropdownOpen, setCourseDropdownOpen] = useState(false);
    const [yearSearch, setYearSearch] = useState('');
    const [yearDropdownOpen, setYearDropdownOpen] = useState(false);
    const [statusSearch, setStatusSearch] = useState('');
    const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
    const [countryCodeSearch, setCountryCodeSearch] = useState('');
    const [countryCodeDropdownOpen, setCountryCodeDropdownOpen] = useState(false);

    // College options for dropdown
    const collegeOptions = [
        'IIT Delhi', 'IIT Bombay', 'IIT Madras', 'IIT Kanpur', 'IIT Kharagpur',
        'IIT Roorkee', 'IIT Guwahati', 'NIT Trichy', 'NIT Warangal', 'NIT Surathkal',
        'BITS Pilani', 'Delhi University', 'Mumbai University', 'Anna University',
        'VIT Vellore', 'SRM University', 'Amity University', 'Manipal University',
        'Jadavpur University', 'Pune University', 'Other'
    ];

    const courseOptions = ['B.Tech', 'BCA', 'MCA', 'M.Tech', 'BSc Computer Science', 'MSc Computer Science', 'Other'];
    const yearOptions = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
    const interestOptions = ['AWS', 'Azure', 'DevOps', 'Cloud Computing'];
    const statusOptions = ['pending', 'approved', 'rejected'];

    // Country codes list
    const countryCodes = [
        { code: '+1', country: 'United States' },
        { code: '+44', country: 'United Kingdom' },
        { code: '+91', country: 'India' },
        { code: '+92', country: 'Pakistan' },
        { code: '+880', country: 'Bangladesh' },
        { code: '+977', country: 'Nepal' },
        { code: '+975', country: 'Bhutan' },
        { code: '+94', country: 'Sri Lanka' },
        { code: '+95', country: 'Myanmar' },
        { code: '+55', country: 'Brazil' },
        { code: '+27', country: 'South Africa' }
    ];

    // Filter options based on search
    const filteredColleges = collegeOptions.filter(college =>
        college.toLowerCase().includes(collegeSearch.toLowerCase())
    );
    const filteredCourses = courseOptions.filter(course =>
        course.toLowerCase().includes(courseSearch.toLowerCase())
    );
    const filteredYears = yearOptions.filter(year =>
        year.toLowerCase().includes(yearSearch.toLowerCase())
    );
    const filteredStatuses = statusOptions.filter(status =>
        status.toLowerCase().includes(statusSearch.toLowerCase())
    );
    const filteredCountryCodes = countryCodes.filter(cc =>
        cc.code.toLowerCase().includes(countryCodeSearch.toLowerCase()) ||
        cc.country.toLowerCase().includes(countryCodeSearch.toLowerCase())
    );


    useEffect(() => {
        const token = localStorage.getItem("adminToken");
        
        if (!token) {
            navigate('/admin/login');
            return;
        }

        // Check token expiry
        try {
            const tokenParts = token.split('.');
            if (tokenParts.length === 3) {
                const payload = JSON.parse(atob(tokenParts[1]));
                const expiryTime = payload.exp * 1000; // Convert to milliseconds
                const currentTime = Date.now();

                if (currentTime >= expiryTime) {
                    localStorage.removeItem("adminToken");
                    navigate('/admin/login');
                    return;
                }
            }
        } catch (error) {
            console.error('Error validating token:', error);
            localStorage.removeItem("adminToken");
            navigate('/admin/login');
        }
    }, [navigate]);




    const [showEditError, setShowEditError] = useState(false);

    const showNotification = useCallback((message, type) => {
        setNotification({ show: true, message, type });
        const timer = setTimeout(() => {
            setNotification({ show: false, message: '', type: '' });
        }, 3000);
        return () => clearTimeout(timer);
    }, []);

    const fetchStudents = useCallback(async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("adminToken");
            const response = await axios.get(`${hostServer}/api/students`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setStudents(response.data);
            setFilteredStudents(response.data);
        } catch (error) {
            showNotification('Failed to fetch students', 'error');
            console.error('Error fetching students:', error);
        } finally {
            setLoading(false);
        }
    }, [hostServer, showNotification]);

    useEffect(() => {
        fetchStudents();
    }, [fetchStudents]);

    // Debounce search term to improve performance
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    useEffect(() => {
        let filtered = students;

        if (debouncedSearchTerm) {
            filtered = filtered.filter(student =>
                student.fullname?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
                student.email?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
                student.college?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
                student._id?.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
            );
        }

        if (filterStatus !== 'all') {
            filtered = filtered.filter(student => student.status === filterStatus);
        }

        setFilteredStudents(filtered);
    }, [debouncedSearchTerm, filterStatus, students]);

    // Validation Functions - Memoized
    const isValidFullName = useCallback((name) => {
        const nameRegex = /^[a-zA-Z\s]*$/;
        return nameRegex.test(name);
    }, []);

    const isValidEmail = useCallback((email) => {
        // More strict email validation
        // Check basic format first
        const basicFormat = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!basicFormat.test(email)) {
            return false;
        }

        // Split email into local and domain parts
        const parts = email.split('@');
        if (parts.length !== 2) {
            return false;
        }

        const [localPart, domain] = parts;

        // Validate local part (before @)
        // - Must be 1-64 characters
        // - Can contain: letters, numbers, and special chars: . _ % + -
        // - Cannot start or end with a dot
        // - Cannot have consecutive dots
        const localRegex = /^[a-zA-Z0-9]([a-zA-Z0-9._%-]*[a-zA-Z0-9])?$/;
        if (!localRegex.test(localPart) || localPart.length > 64) {
            return false;
        }

        // Check for consecutive dots in local part
        if (localPart.includes('..')) {
            return false;
        }

        // Validate domain part (after @)
        // - Must have at least one dot
        // - Domain name part must be 1-63 characters
        // - TLD must be 2-63 characters (letters ONLY, no numbers or special chars)
        // - Cannot start or end with hyphen or dot
        const domainParts = domain.split('.');
        if (domainParts.length < 2) {
            return false;
        }

        // Check each domain part
        for (let i = 0; i < domainParts.length; i++) {
            const part = domainParts[i];
            
            // Each part must be 1-63 characters
            if (part.length === 0 || part.length > 63) {
                return false;
            }

            // Last part (TLD) should ONLY contain letters (a-z, A-Z), no numbers or special chars
            if (i === domainParts.length - 1) {
                // TLD must be 2+ characters and letters only
                const tldRegex = /^[a-zA-Z]{2,}$/;
                if (!tldRegex.test(part)) {
                    return false;
                }
            } else {
                // Other domain parts can contain letters, numbers, and hyphens
                // But cannot start or end with hyphen
                const domainPartRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?$/;
                if (!domainPartRegex.test(part)) {
                    return false;
                }
            }
        }

        return true;
    }, []);

    const isValidPhone = useCallback((phone) => {
        const phoneRegex = /^[0-9]*$/;
        return phoneRegex.test(phone);
    }, []);

    const parsePhoneNumber = useCallback((fullPhone) => {
        if (!fullPhone) return { countryCode: '+91', phone: '' };
        
        // Remove any whitespace
        const cleanPhone = fullPhone.trim();
        
        // Check if phone starts with +
        if (!cleanPhone.startsWith('+')) {
            return { countryCode: '+91', phone: cleanPhone };
        }
        
        // Count from backward: last 10 digits are phone number, rest is country code
        // Format is always: countryCode + 10 digit number
        const phoneLength = cleanPhone.length;
        if (phoneLength > 10) {
            const phone = cleanPhone.slice(-10); // Last 10 digits
            const countryCode = cleanPhone.slice(0, phoneLength - 10); // Everything before last 10 digits
            return {
                countryCode: countryCode,
                phone: phone
            };
        }
        
        // If less than 10 digits total, default to +91
        return { countryCode: '+91', phone: cleanPhone.replace(/^\+/, '') };
    }, []);

    const isValidCollege = useCallback((college) => {
        const collegeRegex = /^[a-zA-Z\s]*$/;
        return collegeRegex.test(college);
    }, []);

    const handleViewStudent = useCallback((student) => {
        setSelectedStudent(student);
        setModalType('view');
        setShowModal(true);
    }, []);

    const toggleInterestInEdit = useCallback((interest) => {
        setEditFormData(prev => {
            const currentInterests = Array.isArray(prev.area_of_interest) ? prev.area_of_interest : [];
            const isSelected = currentInterests.includes(interest);
            const updatedInterests = isSelected
                ? currentInterests.filter(item => item !== interest)
                : [...currentInterests, interest];
            return { ...prev, area_of_interest: updatedInterests };
        });
    }, []);

    const removeInterestFromEdit = useCallback((interest) => {
        setEditFormData(prev => ({
            ...prev,
            area_of_interest: Array.isArray(prev.area_of_interest)
                ? prev.area_of_interest.filter(item => item !== interest)
                : []
        }));
    }, []);

    const handleEditStudent = useCallback((student) => {
        setSelectedStudent(student);
        const { countryCode, phone } = parsePhoneNumber(student.phone_number);
        setEditFormData({
            fullname: student.fullname || '',
            email: student.email || '',
            countryCode: countryCode,
            phone: phone,
            college: student.college || '',
            course: student.course || '',
            current_year: student.current_year || '',
            area_of_interest: Array.isArray(student.area_of_interest) ? student.area_of_interest : [],
            status: student.status || 'pending'
        });
        setEditErrors({
            fullname: '',
            email: '',
            phone: '',
            college: '',
            general: ''
        });
        setModalType('edit');
        setShowModal(true);

    }, [parsePhoneNumber]);

    const handleDeleteStudent = useCallback((student) => {
        setSelectedStudent(student);
        setModalType('delete');
        setShowModal(true);
    }, []);

    const handleEditFormChange = useCallback((field, value) => {
        // Clear general error when user starts typing
        setEditErrors(prev => ({ ...prev, general: '' }));
        setShowEditError(false);
        setShowEditError(false);

        if (field === 'fullname') {
            if (isValidFullName(value)) {
                setEditFormData({ ...editFormData, [field]: value });
                setEditErrors(prev => ({ ...prev, fullname: '' }));
            } else {
                setEditErrors(prev => ({ 
                    ...prev, 
                    fullname: 'Name can only contain alphabets and spaces' 
                }));
            }
        } else if (field === 'email') {
            setEditFormData({ ...editFormData, [field]: value });
            if (value.trim() === '') {
                setEditErrors(prev => ({ ...prev, email: '' }));
            } else if (!isValidEmail(value.trim())) {
                setEditErrors(prev => ({ 
                    ...prev, 
                    email: 'Please enter a valid email address (e.g., example@domain.com)' 
                }));
            } else {
                setEditErrors(prev => ({ ...prev, email: '' }));
            }
        } else if (field === 'phone') {
            // Limit to 10 digits only
            if (value.length <= 10 && isValidPhone(value)) {
                setEditFormData({ ...editFormData, [field]: value });
                if (value.trim() === '') {
                    setEditErrors(prev => ({ ...prev, phone: '' }));
                } else if (value.length < 10) {
                    setEditErrors(prev => ({ 
                        ...prev, 
                        phone: 'Phone number must be exactly 10 digits' 
                    }));
                } else {
                    setEditErrors(prev => ({ ...prev, phone: '' }));
                }
            } else if (value.length > 10) {
                // Silently reject if more than 10 digits
                setEditErrors(prev => ({ 
                    ...prev, 
                    phone: 'Phone number cannot exceed 10 digits' 
                }));
            } else {
                setEditErrors(prev => ({ 
                    ...prev, 
                    phone: 'Phone number can only contain numbers' 
                }));
            }
        } else if (field === 'college') {
            if (isValidCollege(value)) {
                setEditFormData({ ...editFormData, [field]: value });
                setEditErrors(prev => ({ ...prev, college: '' }));
            } else {
                setEditErrors(prev => ({ 
                    ...prev, 
                    college: 'College name can only contain alphabets and spaces' 
                }));
            }
        } else {
            setEditFormData({ ...editFormData, [field]: value });
        }
    }, [editFormData, isValidFullName, isValidEmail, isValidPhone, isValidCollege]);

    const validateEditForm = useCallback(() => {
        setShowEditError(false); // Reset before validation
        
        // Validate full name
        if (!editFormData.fullname.trim()) {
            setEditErrors(prev => ({ ...prev, general: 'Please enter full name' }));
            setShowEditError(true);
            return false;
        }
        if (!isValidFullName(editFormData.fullname)) {
            setEditErrors(prev => ({ 
                ...prev, 
                general: 'Full name can only contain alphabets and spaces' 
            }));
            setShowEditError(true);
            return false;
        }

        // Validate email
        if (!editFormData.email.trim()) {
            setEditErrors(prev => ({ ...prev, general: 'Please enter email address' }));
            setShowEditError(true);
            return false;
        }
        if (!isValidEmail(editFormData.email.trim())) {
            setEditErrors(prev => ({ 
                ...prev, 
                general: 'Please enter a valid email address (e.g., example@domain.com)' 
            }));
            setShowEditError(true);
            return false;
        }

        // Validate phone
        if (!editFormData.phone.trim()) {
            setEditErrors(prev => ({ ...prev, general: 'Please enter phone number' }));
            setShowEditError(true);
            return false;
        }
        if (!isValidPhone(editFormData.phone)) {
            setEditErrors(prev => ({ 
                ...prev, 
                general: 'Phone number can only contain numbers' 
            }));
            setShowEditError(true);
            return false;
        }
        if (editFormData.phone.length !== 10) {
            setEditErrors(prev => ({ 
                ...prev, 
                general: 'Phone number must be exactly 10 digits' 
            }));
            setShowEditError(true);
            return false;
        }

        // Validate college
        if (!editFormData.college.trim()) {
            setEditErrors(prev => ({ ...prev, general: 'Please enter college name' }));
            setShowEditError(true);
            return false;
        }
        if (!isValidCollege(editFormData.college)) {
            setEditErrors(prev => ({ 
                ...prev, 
                general: 'College name can only contain alphabets and spaces' 
            }));
            setShowEditError(true);
            return false;
        }

        // Validate course
        if (!editFormData.course.trim()) {
            setEditErrors(prev => ({ ...prev, general: 'Please select course' }));
            setShowEditError(true);
            return false;
        }

        // Validate year
        if (!editFormData.current_year) {
            setEditErrors(prev => ({ ...prev, general: 'Please select current year' }));
            setShowEditError(true);
            return false;
        }

        // Validate area of interest
        if (!Array.isArray(editFormData.area_of_interest) || editFormData.area_of_interest.length === 0) {
            setEditErrors(prev => ({ ...prev, general: 'Please select at least one area of interest' }));
            setShowEditError(true);
            return false;
        }

        // Validate status
        if (!editFormData.status) {
            setEditErrors(prev => ({ ...prev, general: 'Please select application status' }));
            setShowEditError(true);
            return false;
        }

        return true;
    }, [editFormData, isValidFullName, isValidEmail, isValidPhone, isValidCollege]);

    const confirmEdit = useCallback(async () => {
        // Validate form before submitting
        if (!validateEditForm()) {
            return;
        }

        try {
            // Prepare data to send - combine country code and phone
            const dataToSend = {
                fullname: editFormData.fullname.trim(),
                email: editFormData.email.trim(),
                phone_number: editFormData.countryCode + editFormData.phone.trim(),
                college: editFormData.college.trim(),
                course: editFormData.course,
                current_year: editFormData.current_year,
                area_of_interest: editFormData.area_of_interest,
                status: editFormData.status
            };

            const token = localStorage.getItem('adminToken');
            await axios.put(
                `${hostServer}/api/edit/student/${selectedStudent._id}`,
                dataToSend,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            showNotification('Student updated successfully', 'success');
            fetchStudents();
            setShowModal(false);
            setEditErrors({
                fullname: '',
                email: '',
                phone: '',
                college: '',
                general: ''
            });
        } catch (error) {
            if (error.response && error.response.data && error.response.data.error) {
                setEditErrors(prev => ({ ...prev, general: error.response.data.error }));
                setShowEditError(true);
            } else {
                showNotification('Failed to update student', 'error');
            }
            console.error('Error updating student:', error);
        }
    }, [validateEditForm, editFormData, selectedStudent, hostServer, showNotification, fetchStudents]);

    const confirmDelete = useCallback(async () => {
        try {
            const token = localStorage.getItem('adminToken');
            await axios.delete(`${hostServer}/api/student/${selectedStudent._id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            showNotification('Student deleted successfully', 'success');
            fetchStudents();
            setShowModal(false);
        } catch (error) {
            showNotification('Failed to delete student', 'error');
            console.error('Error deleting student:', error);
        }
    }, [selectedStudent, hostServer, showNotification, fetchStudents]);


    const handleDownloadResume = useCallback(async (student) => {
        try {
            if (!student.resume_url) {
                showNotification('No resume available for this student', 'error');
                return;
            }

            // If resume_url is a full URL or file path from server
            const url = student.resume_url.startsWith('http')
                ? student.resume_url
                : `${hostServer}${student.resume_url}`;

            const response = await axios.get(url, {
                responseType: 'blob',
                timeout: 10000 // 10 second timeout
            });

            // Create blob and download
            const blob = new Blob([response.data], { type: response.data.type || 'application/octet-stream' });
            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            // Extract filename from URL or use student name
            let filename = student.resume_url.split('/').pop() || `${student.fullname}_resume`;
            // Remove query parameters if present
            filename = filename.split('?')[0];
            // Remove duplicate extensions (e.g., .pdf.pdf -> .pdf)
            const match = filename.match(/(.+?)(\.\w+)\2+$/);
            if (match) {
                filename = match[1] + match[2];
            }
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();

            // Cleanup
            setTimeout(() => {
                document.body.removeChild(link);
                window.URL.revokeObjectURL(downloadUrl);
            }, 100);

            showNotification('Resume downloaded successfully', 'success');
        } catch (error) {
            console.error('Error downloading resume:', error);
            showNotification('Failed to download resume. Please try again.', 'error');
        }
    }, [hostServer, showNotification]);

    const handleViewResume = useCallback((resumeUrl) => {
        if (!resumeUrl) {
            showNotification('Resume not available', 'error');
            return;
        }

        const url = resumeUrl.startsWith('http')
            ? resumeUrl
            : `${hostServer}${resumeUrl}`;

        const viewerUrl = `https://docs.google.com/gview?url=${encodeURIComponent(
            url
        )}&embedded=true`;
        window.open(viewerUrl, '_blank', 'noopener,noreferrer');
    }, [hostServer, showNotification]);

    const exportToCSV = React.useCallback(() => {
        const headers = [
            'Application ID',
            'Student Name',
            'Email',
            'Phone Number',
            'College',
            'Course',
            'Year',
            'Area of Interest',
            'Status',
            'Date'
        ];

        const csvData = filteredStudents.map(student => [
            student._id || '',
            student.fullname || '',
            student.email || '',
            `\t${student.phone_number || ''}`, // PREVENTS SCIENTIFIC NOTATION
            student.college || '',
            student.course || '',
            student.current_year || '',
            Array.isArray(student.area_of_interest) ? student.area_of_interest.join(', ') : (student.area_of_interest || ''),
            student.status || 'pending',
            new Date(student.createdAt).toLocaleDateString()
        ]);

        const csv = [headers, ...csvData].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `students_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
    }, [filteredStudents]);

    const handleLogout = useCallback(() => {
        localStorage.removeItem('adminToken');
        navigate('/admin/login' , {replace:true});
    }, [navigate]);

    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <header className="bg-white border-b border-blue-100 sticky top-0 z-40 shadow-sm overflow-x-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        {/* Logo */}
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                                {/* <Users className="text-white" size={20} /> */}
                                  <img src="/logo.png" alt="Cloud Krishna" className="w-10 h-10" onError={(e) => e.target.src = 'https://cdn-icons-png.flaticon.com/512/6104/6104523.png'} />
                            </div>
                            <div>
                                <h1 className="text-lg font-semibold text-gray-800">Cloud Krishna</h1>
                                <p className="text-xs text-gray-500">Admin Dashboard</p>
                            </div>
                        </div>

                        {/* Desktop Actions */}
                        <div className="hidden md:flex items-center gap-3">
                            <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-lg border border-blue-100">
                                <Users size={16} className="text-blue-600" />
                                <span className="text-sm font-semibold text-gray-800">{filteredStudents.length}</span>
                                <span className="text-sm text-gray-600">Students</span>
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
                    <div className="md:hidden bg-white border-t border-blue-100 px-4 py-3 space-y-2">
                        <div className="flex items-center gap-2 px-4 py-3 bg-blue-50 rounded-lg border border-blue-100">
                            <Users size={18} className="text-blue-600" />
                            <span className="font-semibold text-gray-800">{filteredStudents.length}</span>
                            <span className="text-sm text-gray-600">Students</span>
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

            {/* Notification Alert - Material UI Style Below Navbar Center */}
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
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-semibold text-gray-800">Student Management</h2>
                        <p className="text-sm text-gray-600 mt-1">Manage and view all student applications</p>
                    </div>
                    <button
                        onClick={exportToCSV}
                        className="flex items-center justify-center gap-2 px-5 py-2.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all font-medium text-sm shadow-sm"
                    >
                        <Download size={18} />
                        Export to CSV
                    </button>
                </div>

                {/* Filters Card */}
                <div className="bg-white rounded-lg shadow-sm border border-blue-100 p-4 sm:p-5">
                    <div className="flex flex-col lg:flex-row gap-4">
                        {/* Search */}
                        <div className="relative flex-1">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-blue-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search by name, email, college, or ID..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-11 pr-4 py-2.5 bg-blue-50/50 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all text-sm"
                            />
                        </div>

                        {/* Filter Dropdown */}
                        <div className="relative">
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="w-full sm:w-48 px-4 py-2.5 bg-blue-50/50 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 appearance-none cursor-pointer text-sm font-medium text-gray-700"
                            >
                                <option value="all">All Students</option>
                                <option value="pending">Pending</option>
                                <option value="approved">Approved</option>
                                <option value="rejected">Rejected</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-400 pointer-events-none" size={18} />
                        </div>
                    </div>
                </div>

                {/* Students List */}
                <div className="bg-white rounded-lg shadow-sm border border-blue-100 overflow-hidden">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-24">
                            <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-500 rounded-full animate-spin"></div>
                            <p className="mt-4 text-sm text-gray-600">Loading students...</p>
                        </div>
                    ) : filteredStudents.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-24">
                            <div className="w-16 h-16 bg-blue-50 rounded-lg flex items-center justify-center mb-4">
                                <Users size={32} className="text-blue-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">No students found</h3>
                            <p className="text-sm text-gray-500">Try adjusting your search or filters</p>
                        </div>
                    ) : (
                        <>
                            {/* Desktop Table */}
                            <div className="hidden xl:block overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-blue-50 border-b border-blue-100">
                                            <th className="px-6 py-4 text-left">
                                                <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Student</span>
                                            </th>
                                            <th className="px-6 py-4 text-left">
                                                <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Contact</span>
                                            </th>
                                            <th className="px-6 py-4 text-left">
                                                <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Education</span>
                                            </th>
                                            <th className="px-6 py-4 text-left">
                                                <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Interest</span>
                                            </th>
                                            <th className="px-6 py-4 text-left">
                                                <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</span>
                                            </th>
                                            <th className="px-6 py-4 text-left">
                                                <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Date</span>
                                            </th>
                                            <th className="px-6 py-4 text-right">
                                                <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</span>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-blue-50">
                                        {filteredStudents.map((student, index) => (
                                            <tr key={student._id || index} className="hover:bg-blue-50/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                                                            <span className="text-white font-semibold text-sm">
                                                                {student.fullname?.charAt(0).toUpperCase()}
                                                            </span>
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="font-semibold text-gray-800 truncate">{student.fullname}</p>
                                                            <p className="text-xs text-gray-500 font-mono">{student._id}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2 text-sm text-gray-700">
                                                            <Mail size={14} className="text-blue-400 flex-shrink-0" />
                                                            <span className="truncate">{student.email}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-sm text-gray-700">
                                                            <Phone size={14} className="text-green-400 flex-shrink-0" />
                                                            <span>{student.phone_number}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="space-y-1">
                                                        <p className="text-sm font-medium text-gray-800 truncate">{student.college}</p>
                                                        <p className="text-xs text-gray-600">{student.course} • Year {student.current_year}</p>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 max-w-xs">
                                                    <div className="flex flex-wrap gap-1">
                                                        {Array.isArray(student.area_of_interest) && student.area_of_interest.length > 0 ? (
                                                            student.area_of_interest.map((interest, idx) => (
                                                                <span key={idx} className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-50 text-green-700 border border-green-200 whitespace-nowrap">
                                                                    {interest}
                                                                </span>
                                                            ))
                                                        ) : (
                                                            <span className="text-xs text-gray-400">-</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-lg border ${
                                                        student.status === 'approved'
                                                            ? 'bg-green-50 text-green-700 border-green-200'
                                                            : student.status === 'rejected'
                                                            ? 'bg-red-50 text-red-700 border-red-200'
                                                            : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                                                        }`}>
                                                        {student.status || 'pending'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-sm text-gray-600">
                                                        {new Date(student.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <button
                                                            onClick={() => handleViewStudent(student)}
                                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                            title="View Details"
                                                        >
                                                            <Eye size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleEditStudent(student)}
                                                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                            title="Edit"
                                                        >
                                                            <Edit size={18} />
                                                        </button>
                                                        {student.resume_url && (
                                                            <button
                                                                onClick={() => handleDownloadResume(student)}
                                                                className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                                                title="Download Resume"
                                                            >
                                                                <Download size={18} />
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => handleDeleteStudent(student)}
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

                            {/* Tablet & Mobile Cards */}
                            <div className="xl:hidden divide-y divide-blue-50">
                                {filteredStudents.map((student, index) => (
                                    <div key={student._id || index} className="p-4 hover:bg-blue-50/50 transition-colors">
                                        {/* Card Header */}
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                                <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                                                    <span className="text-white font-semibold">
                                                        {student.fullname?.charAt(0).toUpperCase()}
                                                    </span>
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <h3 className="font-semibold text-gray-800 truncate">{student.fullname}</h3>
                                                    <p className="text-xs text-gray-500 font-mono break-all">{student._id}</p>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end gap-2 flex-shrink-0 ml-2">
                                                <div className="flex flex-wrap gap-1 justify-end max-w-xs">
                                                    {Array.isArray(student.area_of_interest) && student.area_of_interest.length > 0 ? (
                                                        student.area_of_interest.map((interest, idx) => (
                                                            <span key={idx} className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-50 text-green-700 border border-green-200 whitespace-nowrap">
                                                                {interest}
                                                            </span>
                                                        ))
                                                    ) : (
                                                        <span className="text-xs text-gray-400">-</span>
                                                    )}
                                                </div>
                                                <span className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-lg border ${
                                                    student.status === 'approved'
                                                        ? 'bg-green-50 text-green-700 border-green-200'
                                                        : student.status === 'rejected'
                                                        ? 'bg-red-50 text-red-700 border-red-200'
                                                        : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                                                    }`}>
                                                    {student.status || 'pending'}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Card Details */}
                                        <div className="space-y-2 mb-4">
                                            <div className="flex items-center gap-2 text-sm text-gray-700">
                                                <Mail size={14} className="text-blue-400 flex-shrink-0" />
                                                <span className="truncate">{student.email}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-gray-700">
                                                <Phone size={14} className="text-green-400 flex-shrink-0" />
                                                <span>{student.phone_number}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-gray-700">
                                                <GraduationCap size={14} className="text-purple-400 flex-shrink-0" />
                                                <span className="truncate">{student.college}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-gray-700">
                                                <BookOpen size={14} className="text-blue-400 flex-shrink-0" />
                                                <span>{student.course} • Year {student.current_year}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                                <Calendar size={14} className="text-gray-400 flex-shrink-0" />
                                                <span>{new Date(student.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                            </div>
                                        </div>

                                        {/* Card Actions */}
                                        <div className="grid grid-cols-2 gap-2">
                                            <button
                                                onClick={() => handleViewStudent(student)}
                                                className="flex items-center justify-center gap-2 px-3 py-2.5 text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                                            >
                                                <Eye size={16} />
                                                View
                                            </button>
                                            <button
                                                onClick={() => handleEditStudent(student)}
                                                className="flex items-center justify-center gap-2 px-3 py-2.5 text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium"
                                            >
                                                <Edit size={16} />
                                                Edit
                                            </button>
                                            {student.resume_url && (
                                                <button
                                                    onClick={() => handleViewResume(student.resume_url)}
                                                    className="flex items-center justify-center gap-2 px-3 py-2.5 text-purple-700 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors text-sm font-medium"
                                                >
                                                    <FileText size={16} />
                                                    Resume
                                                </button>
                                            )}

                                            <button
                                                onClick={() => handleDeleteStudent(student)}
                                                className={`flex items-center justify-center gap-2 px-3 py-2.5 text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium ${!student.resumeUrl ? 'col-span-2' : ''}`}
                                            >
                                                <Trash2 size={16} />
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>

                {/* Results Summary */}
                {!loading && filteredStudents.length > 0 && (
                    <div className="text-center text-sm text-gray-500">
                        Showing {filteredStudents.length} of {students.length} student{students.length !== 1 ? 's' : ''}
                    </div>
                )}
            </main>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-gray-900/40 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-blue-100">
                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b border-blue-100 bg-blue-50">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-800">
                                        {modalType === 'view' && 'Student Information'}
                                        {modalType === 'edit' && 'Edit Student Record'}
                                        {modalType === 'delete' && 'Delete Student'}
                                    </h2>
                                    {selectedStudent && modalType !== 'delete' && (
                                        <p className="text-sm text-gray-600 mt-1 font-mono">{selectedStudent._id}</p>
                                    )}
                                </div>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
                                >
                                    <X size={20} className="text-gray-600" />
                                </button>
                            </div>
                        </div>

                        {/* Modal Content */}
                        <div className="overflow-y-auto flex-1 bg-white">
                            {modalType === 'view' && selectedStudent && (
                                <div className="p-6">
                                    {/* Student Header */}
                                    <div className="mb-6 pb-6 border-b border-blue-100">
                                        <div className="flex items-center gap-4">
                                            <div className="w-16 h-16 bg-blue-500 rounded-lg flex items-center justify-center">
                                                <span className="text-white font-semibold text-2xl">
                                                    {selectedStudent.fullname?.charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                            <div>
                                                <h3 className="text-2xl font-semibold text-gray-800">{selectedStudent.fullname}</h3>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    Registered: {new Date(selectedStudent.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Information Grid */}
                                    <div className="space-y-6">
                                        <div>
                                            <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">Contact Information</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                                                    <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Email Address</label>
                                                    <p className="text-sm text-gray-800 mt-1 break-all">{selectedStudent.email}</p>
                                                </div>
                                                <div className="bg-green-50 border border-green-100 rounded-lg p-4">
                                                    <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Phone Number</label>
                                                    <p className="text-sm text-gray-800 mt-1">{selectedStudent.phone_number}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">Academic Information</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="bg-purple-50 border border-purple-100 rounded-lg p-4">
                                                    <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Institution</label>
                                                    <p className="text-sm text-gray-800 mt-1">{selectedStudent.college}</p>
                                                </div>
                                                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                                                    <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Course</label>
                                                    <p className="text-sm text-gray-800 mt-1">{selectedStudent.course}</p>
                                                </div>
                                                <div className="bg-green-50 border border-green-100 rounded-lg p-4">
                                                    <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Current Year</label>
                                                    <p className="text-sm text-gray-800 mt-1">{selectedStudent.current_year}</p>
                                                </div>
                                                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                                                    <label className="text-xs font-medium text-gray-600 uppercase tracking-wide block mb-2">Area of Interest</label>
                                                    <div className="flex flex-wrap gap-2">
                                                        {Array.isArray(selectedStudent.area_of_interest) && selectedStudent.area_of_interest.length > 0 ? (
                                                            selectedStudent.area_of_interest.map((interest, idx) => (
                                                                <span key={idx} className="inline-flex px-2.5 py-1 text-xs font-medium rounded-full bg-green-50 text-green-700 border border-green-200 whitespace-nowrap">
                                                                    {interest}
                                                                </span>
                                                            ))
                                                        ) : (
                                                            <span className="text-sm text-gray-400">-</span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4">
                                                    <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Application Status</label>
                                                    <div className="mt-2">
                                                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-lg border ${
                                                            selectedStudent.status === 'approved'
                                                                ? 'bg-green-50 text-green-700 border-green-200'
                                                                : selectedStudent.status === 'rejected'
                                                                ? 'bg-red-50 text-red-700 border-red-200'
                                                                : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                                                            }`}>
                                                            {selectedStudent.status || 'pending'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Resume Download */}
                                    {selectedStudent?.resume_url ? (
                                        <div className="mt-6 pt-6 border-t border-blue-100 space-y-4">
                                            <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                                                Resume
                                            </h4>

                                            <div className="flex flex-col sm:flex-row gap-3">
                                                <button
                                                    onClick={() => handleViewResume(selectedStudent.resume_url)}
                                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                                                >
                                                    <Eye size={18} />
                                                    View Resume
                                                </button>

                                                <button
                                                    onClick={() => handleDownloadResume(selectedStudent)}
                                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
                                                >
                                                    <Download size={18} />
                                                    Download Resume
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="mt-6 pt-6 border-t border-blue-100">
                                            <p className="text-sm text-gray-500 italic">
                                                No resume uploaded
                                            </p>
                                        </div>
                                    )}

                                </div>
                            )}

                            {modalType === 'edit' && (
                                <div className="p-6">
                                    {/* Material UI Style Error Alert - Below Navbar Center */}
                                    {showEditError && editErrors.general && (
                                        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md px-4 sm:px-6">
                                            <Alert severity="error" onClose={() => setShowEditError(false)}>
                                                {editErrors.general}
                                            </Alert>
                                        </div>
                                    )}

                                    <div className="space-y-6">
                                        <div>
                                            <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">Personal Information</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Full Name <span className="text-red-500">*</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={editFormData.fullname}
                                                        onChange={(e) => handleEditFormChange('fullname', e.target.value)}
                                                        className={`w-full px-3 py-2 bg-blue-50/50 border ${
                                                            editErrors.fullname ? 'border-red-300' : 'border-blue-200'
                                                        } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent`}
                                                        placeholder="Enter full name (alphabets and spaces only)"
                                                    />
                                                    {editErrors.fullname && (
                                                        <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                                                            <AlertCircle size={12} />
                                                            {editErrors.fullname}
                                                        </p>
                                                    )}
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Email Address <span className="text-red-500">*</span>
                                                    </label>
                                                    <input
                                                        type="email"
                                                        value={editFormData.email}
                                                        onChange={(e) => handleEditFormChange('email', e.target.value)}
                                                        className={`w-full px-3 py-2 bg-blue-50/50 border ${
                                                            editErrors.email ? 'border-red-300' : 'border-blue-200'
                                                        } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent`}
                                                        placeholder="example@domain.com"
                                                    />
                                                    {editErrors.email && (
                                                        <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                                                            <AlertCircle size={12} />
                                                            {editErrors.email}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="md:col-span-2">
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Mobile Number <span className="text-red-500">*</span>
                                                    </label>
                                                    <div className="flex flex-col sm:flex-row gap-2">
                                                        <div className="relative w-full sm:w-[220px]">
                                                            <input
                                                                type="text"
                                                                value={countryCodeDropdownOpen ? countryCodeSearch : `${editFormData.countryCode} ${countryCodes.find(cc => cc.code === editFormData.countryCode)?.country || ''}`}
                                                                onChange={(e) => {
                                                                    setCountryCodeSearch(e.target.value);
                                                                    setCountryCodeDropdownOpen(true);
                                                                }}
                                                                onFocus={() => {
                                                                    setCountryCodeSearch('');
                                                                    setCountryCodeDropdownOpen(true);
                                                                }}
                                                                placeholder="Search country..."
                                                                className="w-full px-3 py-2 bg-blue-50/50 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-sm"
                                                            />
                                                            {countryCodeDropdownOpen && (
                                                                <>
                                                                    <div 
                                                                        className="fixed inset-0 z-10" 
                                                                        onClick={() => setCountryCodeDropdownOpen(false)}
                                                                    />
                                                                    <div className="absolute z-20 w-[300px] mt-1 max-h-60 overflow-auto bg-white border border-blue-200 rounded-lg shadow-lg">
                                                                        {filteredCountryCodes.length > 0 ? (
                                                                            filteredCountryCodes.map((cc, idx) => (
                                                                                <div
                                                                                    key={idx}
                                                                                    onClick={() => {
                                                                                        handleEditFormChange('countryCode', cc.code);
                                                                                        setCountryCodeDropdownOpen(false);
                                                                                        setCountryCodeSearch('');
                                                                                    }}
                                                                                    className="px-3 py-2 hover:bg-blue-50 cursor-pointer transition-colors text-sm"
                                                                                >
                                                                                    <span className="font-semibold">{cc.code}</span> {cc.country}
                                                                                </div>
                                                                            ))
                                                                        ) : (
                                                                            <div className="px-3 py-2 text-sm text-gray-500">
                                                                                No country codes found
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </>
                                                            )}
                                                        </div>
                                                        <input
                                                            type="tel"
                                                            value={editFormData.phone}
                                                            onChange={(e) => handleEditFormChange('phone', e.target.value)}
                                                            maxLength={10}
                                                            className={`w-full sm:flex-1 px-3 py-2 bg-blue-50/50 border ${
                                                                editErrors.phone ? 'border-red-300' : 'border-blue-200'
                                                            } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-sm`}
                                                            placeholder="9876543210 (10 digits)"
                                                        />
                                                    </div>
                                                    {editErrors.phone && (
                                                        <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                                                            <AlertCircle size={12} />
                                                            {editErrors.phone}
                                                        </p>
                                                    )}
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        Select country code and enter exactly 10 digits
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">Academic Details</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Institution <span className="text-red-500">*</span>
                                                    </label>
                                                    <div className="relative">
                                                        <input
                                                            type="text"
                                                            value={collegeDropdownOpen ? collegeSearch : editFormData.college}
                                                            onChange={(e) => {
                                                                setCollegeSearch(e.target.value);
                                                                setCollegeDropdownOpen(true);
                                                            }}
                                                            onFocus={() => {
                                                                setCollegeSearch('');
                                                                setCollegeDropdownOpen(true);
                                                            }}
                                                            placeholder="Search or select institution..."
                                                            className={`w-full px-3 py-2 bg-green-50/50 border ${
                                                                editErrors.college ? 'border-red-300' : 'border-green-200'
                                                            } rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent`}
                                                        />
                                                        {collegeDropdownOpen && (
                                                            <>
                                                                <div 
                                                                    className="fixed inset-0 z-10" 
                                                                    onClick={() => setCollegeDropdownOpen(false)}
                                                                />
                                                                <div className="absolute z-20 w-full mt-1 max-h-60 overflow-auto bg-white border border-green-200 rounded-lg shadow-lg">
                                                                    {filteredColleges.length > 0 ? (
                                                                        filteredColleges.map((college, idx) => (
                                                                            <div
                                                                                key={idx}
                                                                                onClick={() => {
                                                                                    handleEditFormChange('college', college);
                                                                                    setCollegeDropdownOpen(false);
                                                                                    setCollegeSearch('');
                                                                                }}
                                                                                className="px-3 py-2 hover:bg-green-50 cursor-pointer transition-colors text-sm"
                                                                            >
                                                                                {college}
                                                                            </div>
                                                                        ))
                                                                    ) : (
                                                                        <div className="px-3 py-2 text-sm text-gray-500">
                                                                            No institutions found
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                    {editErrors.college && (
                                                        <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                                                            <AlertCircle size={12} />
                                                            {editErrors.college}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="relative">
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Course <span className="text-red-500">*</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={courseDropdownOpen ? courseSearch : editFormData.course}
                                                        onChange={(e) => {
                                                            setCourseSearch(e.target.value);
                                                            setCourseDropdownOpen(true);
                                                        }}
                                                        onFocus={() => {
                                                            setCourseSearch('');
                                                            setCourseDropdownOpen(true);
                                                        }}
                                                        placeholder="Search or select course..."
                                                        className="w-full px-3 py-2 bg-green-50/50 border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
                                                    />
                                                    {courseDropdownOpen && (
                                                        <>
                                                            <div 
                                                                className="fixed inset-0 z-10" 
                                                                onClick={() => setCourseDropdownOpen(false)}
                                                            />
                                                            <div className="absolute z-20 w-full mt-1 max-h-60 overflow-auto bg-white border border-green-200 rounded-lg shadow-lg">
                                                                {filteredCourses.length > 0 ? (
                                                                    filteredCourses.map((course, idx) => (
                                                                        <div
                                                                            key={idx}
                                                                            onClick={() => {
                                                                                handleEditFormChange('course', course);
                                                                                setCourseDropdownOpen(false);
                                                                                setCourseSearch('');
                                                                            }}
                                                                            className="px-3 py-2 hover:bg-green-50 cursor-pointer transition-colors text-sm"
                                                                        >
                                                                            {course}
                                                                        </div>
                                                                    ))
                                                                ) : (
                                                                    <div className="px-3 py-2 text-sm text-gray-500">
                                                                        No courses found
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                                <div className="relative">
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Current Year <span className="text-red-500">*</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={yearDropdownOpen ? yearSearch : editFormData.current_year}
                                                        onChange={(e) => {
                                                            setYearSearch(e.target.value);
                                                            setYearDropdownOpen(true);
                                                        }}
                                                        onFocus={() => {
                                                            setYearSearch('');
                                                            setYearDropdownOpen(true);
                                                        }}
                                                        placeholder="Search or select year..."
                                                        className="w-full px-3 py-2 bg-green-50/50 border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
                                                    />
                                                    {yearDropdownOpen && (
                                                        <>
                                                            <div 
                                                                className="fixed inset-0 z-10" 
                                                                onClick={() => setYearDropdownOpen(false)}
                                                            />
                                                            <div className="absolute z-20 w-full mt-1 max-h-60 overflow-auto bg-white border border-green-200 rounded-lg shadow-lg">
                                                                {filteredYears.length > 0 ? (
                                                                    filteredYears.map((year, idx) => (
                                                                        <div
                                                                            key={idx}
                                                                            onClick={() => {
                                                                                handleEditFormChange('current_year', year);
                                                                                setYearDropdownOpen(false);
                                                                                setYearSearch('');
                                                                            }}
                                                                            className="px-3 py-2 hover:bg-green-50 cursor-pointer transition-colors text-sm"
                                                                        >
                                                                            {year}
                                                                        </div>
                                                                    ))
                                                                ) : (
                                                                    <div className="px-3 py-2 text-sm text-gray-500">
                                                                        No years found
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Area of Interest <span className="text-red-500">*</span>
                                                    </label>
                                                    <div className="w-full px-3 py-2.5 bg-green-50/50 border border-green-200 rounded-lg">
                                                        <div className="flex flex-wrap gap-2">
                                                            {Array.isArray(editFormData.area_of_interest) && editFormData.area_of_interest.length > 0 ? (
                                                                editFormData.area_of_interest.map((interest) => (
                                                                    <span
                                                                        key={interest}
                                                                        className="inline-flex items-center gap-1.5 rounded-full bg-green-50 text-green-700 border border-green-200 px-2.5 py-1 text-xs sm:text-sm font-medium"
                                                                    >
                                                                        {interest}
                                                                        <button
                                                                            type="button"
                                                                            aria-label={`Remove ${interest}`}
                                                                            onClick={() => removeInterestFromEdit(interest)}
                                                                            className="inline-flex h-4 w-4 items-center justify-center rounded-full text-green-700 hover:text-green-900 hover:bg-green-100 transition-colors"
                                                                        >
                                                                            <X size={12} />
                                                                        </button>
                                                                    </span>
                                                                ))
                                                            ) : (
                                                                <span className="text-gray-400 text-xs">Select one or more interests...</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="mt-3 flex flex-wrap gap-2">
                                                        {interestOptions.map((interest) => {
                                                            const isSelected = Array.isArray(editFormData.area_of_interest) && editFormData.area_of_interest.includes(interest);
                                                            return (
                                                                <button
                                                                    key={interest}
                                                                    type="button"
                                                                    onClick={() => toggleInterestInEdit(interest)}
                                                                    className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs sm:text-sm font-medium border transition-all ${
                                                                        isSelected
                                                                            ? 'bg-green-50 text-green-700 border-green-200 shadow-sm'
                                                                            : 'bg-white text-slate-600 border-slate-200 hover:border-green-300 hover:text-green-600'
                                                                    }`}
                                                                >
                                                                    {interest}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                                <div className="relative">
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Application Status <span className="text-red-500">*</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={statusDropdownOpen ? statusSearch : editFormData.status}
                                                        onChange={(e) => {
                                                            setStatusSearch(e.target.value);
                                                            setStatusDropdownOpen(true);
                                                        }}
                                                        onFocus={() => {
                                                            setStatusSearch('');
                                                            setStatusDropdownOpen(true);
                                                        }}
                                                        placeholder="Search or select status..."
                                                        className="w-full px-3 py-2 bg-green-50/50 border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
                                                    />
                                                    {statusDropdownOpen && (
                                                        <>
                                                            <div 
                                                                className="fixed inset-0 z-10" 
                                                                onClick={() => setStatusDropdownOpen(false)}
                                                            />
                                                            <div className="absolute z-20 w-full mt-1 max-h-60 overflow-auto bg-white border border-green-200 rounded-lg shadow-lg">
                                                                {filteredStatuses.length > 0 ? (
                                                                    filteredStatuses.map((status, idx) => (
                                                                        <div
                                                                            key={idx}
                                                                            onClick={() => {
                                                                                handleEditFormChange('status', status);
                                                                                setStatusDropdownOpen(false);
                                                                                setStatusSearch('');
                                                                            }}
                                                                            className="px-3 py-2 hover:bg-green-50 cursor-pointer transition-colors text-sm capitalize"
                                                                        >
                                                                            {status}
                                                                        </div>
                                                                    ))
                                                                ) : (
                                                                    <div className="px-3 py-2 text-sm text-gray-500">
                                                                        No statuses found
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Info Box */}
                                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                            <div className="flex items-start gap-3">
                                                <AlertCircle size={18} className="text-blue-600 mt-0.5 flex-shrink-0" />
                                                <div className="text-sm text-blue-800">
                                                    <p className="font-semibold mb-1">Validation Rules:</p>
                                                    <ul className="text-xs space-y-1 list-disc list-inside">
                                                        <li>Name and College: Only alphabets and spaces allowed</li>
                                                        <li>Email: Must be a valid email format</li>
                                                        <li>Phone: Select country code, exactly 10 digits (numbers only)</li>
                                                        <li>Status: Select pending, approved, or rejected</li>
                                                        <li>All fields marked with * are required</li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-3 mt-6 pt-6 border-t border-blue-100">
                                        <button
                                            onClick={() => {
                                                setShowModal(false);
                                                setShowEditError(false);
                                            }}
                                            className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={confirmEdit}
                                            className="flex-1 px-4 py-2.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium flex items-center justify-center gap-2"
                                        >
                                            <Check size={18} />
                                            Save Changes
                                        </button>
                                    </div>
                                </div>
                            )}

                            {modalType === 'delete' && selectedStudent && (
                                <div className="p-6">
                                    {/* Student Header */}
                                    <div className="mb-6 pb-6 border-b border-blue-100">
                                        <div className="flex items-center gap-4">
                                            <div className="w-16 h-16 bg-red-500 rounded-lg flex items-center justify-center">
                                                <span className="text-white font-semibold text-2xl">
                                                    {selectedStudent.fullname?.charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                            <div>
                                                <h3 className="text-2xl font-semibold text-gray-800">
                                                    Delete Student Record
                                                </h3>
                                                <p className="text-sm text-gray-600 mt-1 font-mono">
                                                    {selectedStudent._id}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Warning Box */}
                                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                                        <div className="flex items-start gap-3">
                                            <AlertCircle size={22} className="text-red-600 mt-0.5" />
                                            <div>
                                                <p className="text-sm font-semibold text-red-800">
                                                    This action is permanent
                                                </p>
                                                <p className="text-sm text-red-700 mt-1">
                                                    You are about to permanently delete the following student:
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Student Info */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                                            <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                                                Student Name
                                            </label>
                                            <p className="text-sm text-gray-800 mt-1">
                                                {selectedStudent.fullname}
                                            </p>
                                        </div>

                                        <div className="bg-green-50 border border-green-100 rounded-lg p-4">
                                            <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                                                Email
                                            </label>
                                            <p className="text-sm text-gray-800 mt-1 break-all">
                                                {selectedStudent.email}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Footer Actions (same as edit modal style) */}
                                    <div className="flex gap-3 pt-6 border-t border-blue-100">
                                        <button
                                            onClick={() => setShowModal(false)}
                                            className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={confirmDelete}
                                            className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-normal"
                                        >
                                            Delete Permanently
                                        </button>
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default AdminDashboard;