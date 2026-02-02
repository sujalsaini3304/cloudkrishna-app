import React from 'react'
import { Menu, X, Terminal, Video, Users, Rocket, ChevronRight, ArrowRight, CheckCircle2, Upload, FileText } from 'lucide-react';
import axios from 'axios';
import useStore from "../store"
import Alert from '@mui/material/Alert';
import { useNavigate } from 'react-router-dom';
import imagekit from '../utils/imagekit';
import Lottie from 'lottie-react';
import birdAnimation from '../src/animations/features/bird.json';

const RegistrationForm = () => {
  const { hostServer } = useStore()
  const navigate = useNavigate();
  const [applicationId, setApplicationId] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [errors, setErrors] = React.useState([]);
  const [emailError, setEmailError] = React.useState('');
  const [phoneError, setPhoneError] = React.useState('');
  const [collegeError, setCollegeError] = React.useState('');
  const [collegeSearch, setCollegeSearch] = React.useState('');
  const [collegeDropdownOpen, setCollegeDropdownOpen] = React.useState(false);
  const [courseSearch, setCourseSearch] = React.useState('');
  const [courseDropdownOpen, setCourseDropdownOpen] = React.useState(false);
  const [yearSearch, setYearSearch] = React.useState('');
  const [yearDropdownOpen, setYearDropdownOpen] = React.useState(false);

  const [countryCodeSearch, setCountryCodeSearch] = React.useState('');
  const [countryCodeDropdownOpen, setCountryCodeDropdownOpen] = React.useState(false);
  const [agreeToTerms, setAgreeToTerms] = React.useState(false);
  const [formData, setFormData] = React.useState({
    fullName: '',
    email: '',
    countryCode: '+91',
    phone: '',
    college: '',
    course: '',
    currentYear: '',
    interests: [],
    resume: null
  });

  const resumeInputRef = React.useRef(null);

  // Dynamic form field options (fetched from MongoDB)
  const [collegeOptions, setCollegeOptions] = React.useState([]);
  const [courseOptions, setCourseOptions] = React.useState([]);
  const [yearOptions, setYearOptions] = React.useState([]);
  const [interestOptions, setInterestOptions] = React.useState([]);
  const [countryCodesOptions, setCountryCodesOptions] = React.useState([]);



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

  const filteredCountryCodes = countryCodesOptions.filter(cc =>
    cc.code.toLowerCase().includes(countryCodeSearch.toLowerCase()) ||
    cc.country.toLowerCase().includes(countryCodeSearch.toLowerCase())
  );

  React.useEffect(() => {
    const id = localStorage.getItem("application-id");
    if (id) {
      setApplicationId(id);
    }

    // Fetch form fields from MongoDB
    const fetchFormFields = async () => {
      try {
        const response = await axios.get(`${hostServer}/api/form-fields/public/all`);
        if (response.data.success) {
          const { colleges, courses, years, interests, countryCodes } = response.data.data;

          // Set fetched data or use fallback defaults
          setCollegeOptions(colleges.length > 0 ? [...colleges, 'Other'] : [
            'IIT Delhi', 'IIT Bombay', 'IIT Madras', 'IIT Kanpur', 'IIT Kharagpur',
            'IIT Roorkee', 'IIT Guwahati', 'NIT Trichy', 'NIT Warangal', 'NIT Surathkal',
            'BITS Pilani', 'Delhi University', 'Mumbai University', 'Anna University',
            'VIT Vellore', 'SRM University', 'Amity University', 'Manipal University',
            'Jadavpur University', 'Pune University', 'Rungta International Skills University', 'Other'
          ]);

          setCourseOptions(courses.length > 0 ? [...courses, 'Other'] : [
            'B.Tech.', 'B.E.', 'BCA', 'MCA', 'B.Sc', 'M.Tech', 'Other'
          ]);

          setYearOptions(years.length > 0 ? years : [
            '1st Year', '2nd Year', '3rd Year', '4th Year', 'Graduated', 'Other'
          ]);

          setInterestOptions(interests.length > 0 ? interests : [
            'Cloud Computing', 'DevOps', 'Data Engineering', 'Data Science',
            'Data Analyst', 'A.I. / M.L. Engineering', 'Security', 'Need Guidance'
          ]);

          // Set country codes - parse format "code - country" or use fallback
          if (countryCodes && countryCodes.length > 0) {
            const parsedCodes = countryCodes.map(item => {
              // Expected format: "+91 - India" or just "+91"
              const parts = item.split(' - ');
              if (parts.length === 2) {
                return { code: parts[0].trim(), country: parts[1].trim() };
              }
              // Fallback if format is just the code
              return { code: item.trim(), country: '' };
            });
            setCountryCodesOptions(parsedCodes);
          } else {
            // Use fallback defaults
            setCountryCodesOptions([
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
            ]);
          }
        }
      } catch (error) {
        console.error('Error fetching form fields:', error);
        // Use fallback defaults on error
        setCollegeOptions([
          'IIT Delhi', 'IIT Bombay', 'IIT Madras', 'IIT Kanpur', 'IIT Kharagpur',
          'IIT Roorkee', 'IIT Guwahati', 'NIT Trichy', 'NIT Warangal', 'NIT Surathkal',
          'BITS Pilani', 'Delhi University', 'Mumbai University', 'Anna University',
          'VIT Vellore', 'SRM University', 'Amity University', 'Manipal University',
          'Jadavpur University', 'Pune University', 'Rungta International Skills University', 'Other'
        ]);
        setCourseOptions(['B.Tech.', 'B.E.', 'BCA', 'MCA', 'B.Sc', 'M.Tech', 'Other']);
        setYearOptions(['1st Year', '2nd Year', '3rd Year', '4th Year', 'Graduated', 'Other']);
        setInterestOptions([
          'Cloud Computing', 'DevOps', 'Data Engineering', 'Data Science',
          'Data Analyst', 'A.I. / M.L. Engineering', 'Security', 'Need Guidance'
        ]);
        setCountryCodesOptions([
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
        ]);
      }
    };

    fetchFormFields();
  }, [hostServer]);


  const [fileName, setFileName] = React.useState('');

  // Strict validation for username (fullName) - only alphabets and spaces
  const isValidFullName = (name) => {
    const nameRegex = /^[a-zA-Z\s]*$/;
    return nameRegex.test(name) && name.length <= 50;
  };

  // Strict validation for email - proper email format
  const isValidEmail = (email) => {
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
  };

  // Strict validation for phone - only numbers
  const isValidPhone = (phone) => {
    const phoneRegex = /^[0-9]*$/;
    return phoneRegex.test(phone);
  };

  // Strict validation for college - only alphabets and spaces
  const isValidCollege = (college) => {
    const collegeRegex = /^[a-zA-Z\s]*$/;
    return collegeRegex.test(college);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Apply strict validation for fullName field
    if (name === 'fullName') {
      if (isValidFullName(value)) {
        setFormData({ ...formData, [name]: value });
      }
      // If invalid, don't update the state (silently reject invalid characters)
    } else if (name === 'email') {
      setFormData({ ...formData, [name]: value });
      // Real-time email validation feedback
      if (value.trim() === '') {
        setEmailError('');
      } else if (!isValidEmail(value.trim())) {
        setEmailError('Please enter a valid email address (e.g., example@domain.com)');
      } else {
        setEmailError('');
      }
    } else if (name === 'phone') {
      // Only allow numbers for phone field
      if (isValidPhone(value)) {
        setFormData({ ...formData, [name]: value });
        // Real-time phone validation feedback
        if (value.trim() === '') {
          setPhoneError('');
        } else if (value.length !== 10) {
          setPhoneError('Phone number must be exactly 10 digits');
        } else {
          setPhoneError('');
        }
      }
      // If invalid, don't update the state (silently reject non-numeric characters)
    } else if (name === 'college') {
      // Update college field from dropdown selection
      setFormData({ ...formData, [name]: value });
      setCollegeError(''); // Clear any college errors
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const toggleInterest = (interest) => {
    const alreadySelected = formData.interests.includes(interest);
    const updatedInterests = alreadySelected
      ? formData.interests.filter((item) => item !== interest)
      : [...formData.interests, interest];

    setFormData({ ...formData, interests: updatedInterests });
  };

  const removeInterest = (interest) => {
    setFormData({
      ...formData,
      interests: formData.interests.filter((item) => item !== interest)
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (max 2MB)
      const maxSize = 2 * 1024 * 1024; // 2MB in bytes
      if (file.size > maxSize) {
        setErrors(['Resume file size must be 2MB or less. Please choose a smaller file.']);
        e.target.value = ''; // Clear the file input
        setFileName('');
        return;
      }

      setFormData({ ...formData, resume: file });
      setFileName(file.name);
      setErrors([]); // Clear any previous errors
    }
  };

  const handleRemoveResume = () => {
    setFormData({ ...formData, resume: null });
    setFileName('');
    setErrors([]);
    if (resumeInputRef.current) {
      resumeInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors([]);

    // -------------------------
    // VALIDATION
    // -------------------------
    if (!formData.fullName.trim()) return setErrorsAndStop('Please enter your full name');
    if (!isValidFullName(formData.fullName)) return setErrorsAndStop('Full name can only contain alphabets and spaces. No numbers or special characters allowed.');
    if (formData.fullName.trim().length < 3) return setErrorsAndStop('Full name must be at least 3 characters');
    if (formData.fullName.trim().length > 50) return setErrorsAndStop('Full name must not exceed 50 characters');
    if (!formData.email.trim()) return setErrorsAndStop('Please enter your email address');
    if (!isValidEmail(formData.email.trim())) return setErrorsAndStop('Please enter a valid email address (e.g., example@domain.com)');
    if (!formData.phone.trim()) return setErrorsAndStop('Please enter your phone number');
    if (!isValidPhone(formData.phone)) return setErrorsAndStop('Phone number can only contain numbers');
    if (formData.phone.length !== 10) return setErrorsAndStop('Phone number must be exactly 10 digits');
    if (!formData.college.trim()) return setErrorsAndStop('Please select your college/university');
    if (!formData.course) return setErrorsAndStop('Please select your course');
    if (!formData.currentYear) return setErrorsAndStop('Please select your current year');
    if (!formData.interests.length) return setErrorsAndStop('Please select at least one area of interest');

    if (!agreeToTerms) return setErrorsAndStop('Please accept the terms and conditions to proceed');

    // -------------------------
    // RESUME SIZE CHECK
    // -------------------------
    if (formData.resume && formData.resume.size > 2 * 1024 * 1024) {
      setErrors(['Resume file size must be 2MB or less']);
      setIsLoading(false);
      return;
    }

    function setErrorsAndStop(msg) {
      setErrors([msg]);
      setIsLoading(false);
      return true;
    }

    try {
      // -------------------------
      // REGISTER STUDENT (JSON)
      // -------------------------
      const payload = {
        fullname: formData.fullName.trim(),
        email: formData.email.trim(),
        phone_number: formData.countryCode.trim() + formData.phone.trim(),
        college: formData.college.trim(),
        course: formData.course,
        current_year: formData.currentYear,
        area_of_interest: formData.interests
      };

      const registerResponse = await axios.post(
        `${hostServer}/api/register/student`,
        payload,
        {
          headers: { "Content-Type": "application/json" }
        }
      );

      const studentId = registerResponse.data.data._id;

      // -------------------------
      // UPLOAD RESUME → IMAGEKIT
      // -------------------------
      if (formData.resume) {
        // Fetch authentication parameters from backend
        const authResponse = await axios.get(`${hostServer}/api/imagekit/auth`);
        const { token, expire, signature } = authResponse.data;

        // Convert file to base64 for ImageKit upload
        const fileReader = new FileReader();
        const fileBase64 = await new Promise((resolve, reject) => {
          fileReader.onload = () => resolve(fileReader.result);
          fileReader.onerror = reject;
          fileReader.readAsDataURL(formData.resume);
        });

        const uploadResponse = await imagekit.upload({
          file: fileBase64,
          fileName: `${studentId}_${formData.resume.name}`,
          folder: "cloudkrishna/student_resumes",
          signature: signature,
          token: token,
          expire: expire,
          useUniqueFileName: false,  // Use exact filename
          overwriteFile: true,       // Replace if exists
          overwriteTags: true,       // Update tags on overwrite
          tags: ['resume', studentId, formData.fullName, new Date().toISOString(), 'student', formData.course.toLowerCase()], // Searchable tags
          // customMetadata: {
          //   studentId: studentId,
          //   studentName: formData.fullName,
          //   uploadDate: new Date().toISOString()
          // }
        });

        // -------------------------
        // UPDATE RESUME INFO
        // -------------------------
        await axios.patch(`${hostServer}/api/student/${studentId}/resume`, {
          resume_url: uploadResponse.url,
          resume_public_id: uploadResponse.fileId
        });
      }

      // -------------------------
      // SUCCESS CLEANUP
      // -------------------------
      localStorage.setItem("application-id", studentId);

      setFormData({
        fullName: '',
        email: '',
        countryCode: '+91',
        phone: '',
        college: '',
        course: '',
        currentYear: '',
        interests: [],
        resume: null
      });

      setFileName('');
      setErrors([]);
      setIsLoading(false);
      navigate('/status');

    } catch (error) {
      console.error('Error:', error);
      setIsLoading(false);

      if (error.response?.data?.message) {
        setErrors([error.response.data.message]);
      } else if (error.request) {
        setErrors(['Network error. Please check your connection and try again.']);
      } else {
        setErrors(['Failed to submit registration. Please try again.']);
      }
    }
  };


  return (
    <section id="register" className="py-12 sm:py-16 md:py-24 bg-slate-50 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px] opacity-40"></div>
      <div className="relative z-10 max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 mb-3 sm:mb-6">Ready to Transform Your Career?</h2>
            <p className="text-base sm:text-lg md:text-xl text-slate-600">Join thousands of students launching their cloud careers</p>
          </div>
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl border border-slate-200 overflow-hidden flex flex-col lg:flex-row">

            {/* Left Info Panel */}
            <div className="lg:w-2/5 bg-blue-50/80 p-6 sm:p-8 md:p-10 lg:p-12 border-b lg:border-b-0 lg:border-r border-slate-100 flex flex-col justify-between">
              <div>
                <div className="inline-flex items-center justify-center w-10 sm:w-12 h-10 sm:h-12 rounded-lg sm:rounded-xl bg-blue-100 text-blue-600 mb-4 sm:mb-6">
                  <Rocket size={20} />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">Program Benefits</h3>
                <p className="text-slate-600 mb-6 sm:mb-8 text-xs sm:text-sm">Everything included in your free enrollment.</p>
                <div className="space-y-3 sm:space-y-4">
                  {['50+ hands-on labs', 'Live weekend sessions', 'Expert mentorship', 'Placement support', 'Lifetime Community Access', 'Course Completion Certificate'].map((b, i) => (
                    <div key={i} className="flex items-start gap-2 sm:gap-3 text-xs sm:text-sm font-medium text-slate-700">
                      <CheckCircle2 size={16} className="mt-0.5 flex-shrink-0 text-blue-600" />
                      <span>{b}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-slate-200/60">
                <div className="flex items-center justify-center gap-4 sm:gap-6 md:gap-8">
                  <Lottie
                    animationData={birdAnimation}
                    loop={true}
                    className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 flex-shrink-0"
                  />
                  <div className="flex flex-col items-start">
                    <h3 className="text-lg sm:text-2xl md:text-3xl lg:text-4xl font-extrabold text-slate-900 leading-tight">
                      Join Us Now
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 mt-2 font-medium">Be part of our thriving community</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Form Panel */}
            <div className="lg:w-3/5 p-6 sm:p-8 md:p-10 lg:p-12 bg-white">
              {/* Error Message (single at a time) */}
              {errors.length > 0 && (
                <div className="mb-4">
                  <Alert severity="error">{errors[0]}</Alert>
                </div>
              )}

              {/* Email Validation Error - Show only if no other errors */}
              {emailError && errors.length === 0 && (
                <div className="mb-4">
                  <Alert severity="warning">{emailError}</Alert>
                </div>
              )}

              {/* Phone Validation Error - Show only if no other errors or email errors */}
              {phoneError && errors.length === 0 && !emailError && (
                <div className="mb-4">
                  <Alert severity="warning">{phoneError}</Alert>
                </div>
              )}

              {/* College Validation Error - Show only if no other errors */}
              {collegeError && errors.length === 0 && !emailError && !phoneError && (
                <div className="mb-4">
                  <Alert severity="warning">{collegeError}</Alert>
                </div>
              )}

              {/* Info/Success Alerts - Show only if no errors or warnings */}
              {errors.length === 0 && !emailError && !phoneError && !collegeError && (
                <>
                  {(applicationId == null) && <Alert severity="info" className='mb-4'>Maximum resume file upload limit is 2 MB.</Alert>}
                  {(applicationId != null) && <Alert severity="success" className='mb-4' >You already submitted the registration form. <span className='underline cursor-pointer ' onClick={() => {
                    localStorage.clear();
                    window.location.reload();
                  }} > Click here </span> to submit another form.</Alert>}
                </>
              )}
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-6 sm:mb-8">Start Your Journey</h3>
              <div className="space-y-4 sm:space-y-5">

                {/* Full Name & Email */}
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-2">Full Name <span className="text-red-500">*</span></label>
                  <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} required maxLength={50} className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm" placeholder="Enter your name" />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-2">Email Address <span className="text-red-500">*</span></label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm" placeholder="Enter your email" />
                </div>

                {/* Mobile & College */}
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-2">Mobile Number <span className="text-red-500">*</span></label>
                  <div className="flex gap-1 sm:gap-2">
                    <div className="relative w-[140px] sm:w-[200px]">
                      <input
                        type="text"
                        value={countryCodeDropdownOpen ? countryCodeSearch : `${formData.countryCode} ${countryCodesOptions.find(cc => cc.code === formData.countryCode)?.country || ''}`}
                        onChange={(e) => {
                          setCountryCodeSearch(e.target.value);
                          setCountryCodeDropdownOpen(true);
                        }}
                        onFocus={() => {
                          setCountryCodeSearch('');
                          setCountryCodeDropdownOpen(true);
                        }}
                        placeholder="Search country..."
                        className="w-full px-1 sm:px-2 md:px-3 py-2 sm:py-3 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-slate-600 text-xs sm:text-sm"
                      />
                      {countryCodeDropdownOpen && (
                        <>
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => setCountryCodeDropdownOpen(false)}
                          />
                          <div className="absolute z-20 w-[250px] sm:w-[300px] mt-1 max-h-60 overflow-auto bg-white border border-slate-300 rounded-lg shadow-lg">
                            {filteredCountryCodes.length > 0 ? (
                              filteredCountryCodes.map((cc, idx) => (
                                <div
                                  key={idx}
                                  onClick={() => {
                                    setFormData({ ...formData, countryCode: cc.code });
                                    setCountryCodeDropdownOpen(false);
                                    setCountryCodeSearch('');
                                  }}
                                  className="px-3 sm:px-4 py-2 sm:py-3 hover:bg-blue-50 cursor-pointer transition-colors text-xs sm:text-sm"
                                >
                                  <span className="font-semibold">{cc.code}</span> {cc.country}
                                </div>
                              ))
                            ) : (
                              <div className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-slate-500">
                                No country codes found
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                    <input type="text" name="phone" value={formData.phone} onChange={handleChange} maxLength={10} className="flex-1 px-2 sm:px-3 md:px-4 py-2 sm:py-3 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-xs sm:text-sm" placeholder="Enter your phone number" />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Select country code and enter number</p>
                </div>

                <div className="relative">
                  <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-2">College/University <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={collegeDropdownOpen ? collegeSearch : formData.college}
                    onChange={(e) => {
                      setCollegeSearch(e.target.value);
                      setCollegeDropdownOpen(true);
                    }}
                    onFocus={() => {
                      setCollegeSearch('');
                      setCollegeDropdownOpen(true);
                    }}
                    placeholder="Search or select institution..."
                    required
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
                  />
                  {collegeDropdownOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setCollegeDropdownOpen(false)}
                      />
                      <div className="absolute z-20 w-full mt-1 max-h-60 overflow-auto bg-white border border-slate-300 rounded-lg shadow-lg">
                        {filteredColleges.length > 0 ? (
                          filteredColleges.map((college, idx) => (
                            <div
                              key={idx}
                              onClick={() => {
                                setFormData({ ...formData, college });
                                setCollegeDropdownOpen(false);
                                setCollegeSearch('');
                              }}
                              className="px-3 sm:px-4 py-2 sm:py-3 hover:bg-blue-50 cursor-pointer transition-colors text-sm"
                            >
                              {college}
                            </div>
                          ))
                        ) : (
                          <div className="px-3 sm:px-4 py-2 sm:py-3 text-sm text-slate-500">
                            No institutions found
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>

                {/* Course & Year */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                  <div className="relative">
                    <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-2">Course / Degree <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={courseDropdownOpen ? courseSearch : formData.course}
                      onChange={(e) => {
                        setCourseSearch(e.target.value);
                        setCourseDropdownOpen(true);
                      }}
                      onFocus={() => {
                        setCourseSearch('');
                        setCourseDropdownOpen(true);
                      }}
                      placeholder="Search or select course..."
                      required
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
                    />
                    {courseDropdownOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setCourseDropdownOpen(false)}
                        />
                        <div className="absolute z-20 w-full mt-1 max-h-60 overflow-auto bg-white border border-slate-300 rounded-lg shadow-lg">
                          {filteredCourses.length > 0 ? (
                            filteredCourses.map((course, idx) => (
                              <div
                                key={idx}
                                onClick={() => {
                                  setFormData({ ...formData, course });
                                  setCourseDropdownOpen(false);
                                  setCourseSearch('');
                                }}
                                className="px-3 sm:px-4 py-2 sm:py-3 hover:bg-blue-50 cursor-pointer transition-colors text-sm"
                              >
                                {course}
                              </div>
                            ))
                          ) : (
                            <div className="px-3 sm:px-4 py-2 sm:py-3 text-sm text-slate-500">
                              No courses found
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                  <div className="relative">
                    <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-2">Current Year <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={yearDropdownOpen ? yearSearch : formData.currentYear}
                      onChange={(e) => {
                        setYearSearch(e.target.value);
                        setYearDropdownOpen(true);
                      }}
                      onFocus={() => {
                        setYearSearch('');
                        setYearDropdownOpen(true);
                      }}
                      placeholder="Search or select year..."
                      required
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
                    />
                    {yearDropdownOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setYearDropdownOpen(false)}
                        />
                        <div className="absolute z-20 w-full mt-1 max-h-60 overflow-auto bg-white border border-slate-300 rounded-lg shadow-lg">
                          {filteredYears.length > 0 ? (
                            filteredYears.map((year, idx) => (
                              <div
                                key={idx}
                                onClick={() => {
                                  setFormData({ ...formData, currentYear: year });
                                  setYearDropdownOpen(false);
                                  setYearSearch('');
                                }}
                                className="px-3 sm:px-4 py-2 sm:py-3 hover:bg-blue-50 cursor-pointer transition-colors text-sm"
                              >
                                {year}
                              </div>
                            ))
                          ) : (
                            <div className="px-3 sm:px-4 py-2 sm:py-3 text-sm text-slate-500">
                              No years found
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Area of Interest */}
                <div className="relative">
                  <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-2">Area of Interest <span className="text-red-500">*</span></label>
                  <div className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white border border-slate-300 rounded-lg transition-all text-sm">
                    <div className="flex flex-wrap gap-2">
                      {formData.interests.length > 0 ? (
                        formData.interests.map((interest) => (
                          <span
                            key={interest}
                            className="inline-flex items-center gap-1.5 rounded-full bg-green-50 text-green-700 border border-green-200 px-2.5 py-1 text-xs sm:text-sm font-medium"
                          >
                            {interest}
                            <button
                              type="button"
                              aria-label={`Remove ${interest}`}
                              onClick={() => removeInterest(interest)}
                              className=" cursor-pointer inline-flex h-4 w-4 items-center justify-center rounded-full text-green-700 hover:text-green-900 hover:bg-green-100 transition-colors"
                            >
                              <X size={12} />
                            </button>
                          </span>
                        ))
                      ) : (
                        <span className="text-slate-400 text-xs sm:text-sm">Select one or more interests...</span>
                      )}
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {interestOptions.map((interest) => {
                      const isSelected = formData.interests.includes(interest);
                      return (
                        <button
                          key={interest}
                          type="button"
                          onClick={() => toggleInterest(interest)}
                          className={` cursor-pointer inline-flex items-center rounded-full px-3 py-1.5 text-xs sm:text-sm font-medium border transition-all ${isSelected
                            ? 'bg-green-50 text-green-700 border-green-200 shadow-sm'
                            : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-600'
                            }`}
                        >
                          {interest}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Resume Upload */}
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-2">Upload Resume ( Optional ) </label>
                  <div className="relative">
                    <input ref={resumeInputRef} type="file" id="resume-upload" onChange={handleFileChange} className="hidden" accept=".pdf,.doc,.docx" />
                    <label htmlFor="resume-upload" className="flex flex-col items-center justify-center w-full h-20 sm:h-24 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50 hover:border-blue-400 transition-all">
                      <div className="flex flex-col items-center justify-center pt-4 sm:pt-5 pb-4 sm:pb-6">
                        {fileName ? (
                          <div className="flex items-center gap-2 text-blue-600">
                            <FileText size={18} />
                            <p className="text-xs sm:text-sm font-medium">{fileName}</p>
                          </div>
                        ) : (
                          <>
                            <Upload size={18} className="text-slate-400 mb-1 sm:mb-2" />
                            <p className="text-xs sm:text-sm text-slate-500"><span className="font-semibold text-blue-600">Click to upload</span> or drag and drop</p>
                            <p className="text-xs text-slate-400 mt-1">PDF, DOC (Max 2 MB)</p>
                          </>
                        )}
                      </div>
                    </label>
                    {fileName && (
                      <button
                        type="button"
                        title="Remove resume"
                        aria-label="Remove resume"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleRemoveResume();
                        }}
                        className=" cursor-pointer  absolute -top-2 -right-2 inline-flex items-center justify-center h-7 w-7 rounded-full bg-white border border-slate-200 text-slate-500 shadow-sm hover:text-blue-600 hover:border-blue-300 hover:shadow-md transition-all"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                </div>

                <div className="pt-2 sm:pt-4">
                  <div className="mb-4">
                    <label className="flex items-start gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={agreeToTerms}
                        onChange={(e) => setAgreeToTerms(e.target.checked)}
                        className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-0 focus:outline-none cursor-pointer"
                      />
                      <span className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                        I agree to the
                        <span className="font-semibold text-slate-700"> Terms and Conditions</span>
                        <span className="text-red-500 ml-1">*</span>
                      </span>
                    </label>
                  </div>
                  <button disabled={(applicationId != null) || isLoading || !agreeToTerms} onClick={handleSubmit} className={`w-full flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base transition-all duration-300 ${(applicationId == null && !isLoading && agreeToTerms) ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl active:scale-95" : "bg-gray-400 text-gray-100 cursor-not-allowed"}`}>
                    {isLoading ? (
                      <>
                        <svg className="animate-spin h-4 sm:h-5 w-4 sm:w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <span>Enroll Now - It's Free</span>
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                </div>
                <p className="text-center text-slate-400 text-xs sm:text-xs flex items-center justify-center gap-2 mt-3 sm:mt-4">
                  <img src="/handshake.png" alt="Secure" className="w-4 h-4 sm:w-5 sm:h-5 object-contain" />
                  Your data is secure and encrypted
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};


export default RegistrationForm
