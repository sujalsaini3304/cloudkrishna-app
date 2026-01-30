import React from 'react'
import { Menu, X, Terminal, Video, Users, Rocket, Shield, ChevronRight, ArrowRight, CheckCircle2, Upload, FileText } from 'lucide-react';
import axios from 'axios';
import useStore from "../store"
import Alert from '@mui/material/Alert';
import { useNavigate } from 'react-router-dom';
import imagekit from '../utils/imagekit';

const RegistrationForm = () => {
  const { hostServer } = useStore()
  const navigate = useNavigate();
  const [applicationId, setApplicationId] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [errors, setErrors] = React.useState([]);
  const [emailError, setEmailError] = React.useState('');
  const [phoneError, setPhoneError] = React.useState('');
  const [collegeError, setCollegeError] = React.useState('');
  const [formData, setFormData] = React.useState({
    fullName: '',
    email: '',
    countryCode: '+91',
    phone: '',
    college: '',
    course: '',
    currentYear: '',
    interest: '',
    resume: null
  });

  React.useEffect(() => {
    const id = localStorage.getItem("application-id");
    if (id) {
      setApplicationId(id);
    }
  }, []);


  const [fileName, setFileName] = React.useState('');

  // Strict validation for username (fullName) - only alphabets and spaces
  const isValidFullName = (name) => {
    const nameRegex = /^[a-zA-Z\s]*$/;
    return nameRegex.test(name);
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
    { code: '+27', country: 'South Africa' },
    // { code: '+960', country: 'Maldives' },
    // { code: '+61', country: 'Australia' },
    // { code: '+33', country: 'France' },
    // { code: '+49', country: 'Germany' },
    // { code: '+39', country: 'Italy' },
    // { code: '+81', country: 'Japan' },
    // { code: '+86', country: 'China' },
    // { code: '+65', country: 'Singapore' },
    // { code: '+60', country: 'Malaysia' },
    // { code: '+66', country: 'Thailand' },
    // { code: '+62', country: 'Indonesia' }
  ];

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
        } else if (value.length < 10) {
          setPhoneError('Phone number must be at least 10 digits');
        } else {
          setPhoneError('');
        }
      }
      // If invalid, don't update the state (silently reject non-numeric characters)
    } else if (name === 'college') {
      // Only allow alphabets and spaces for college field
      if (isValidCollege(value)) {
        setFormData({ ...formData, [name]: value });
        // Real-time college validation feedback
        if (value.trim() === '') {
          setCollegeError('');
        } else {
          setCollegeError('');
        }
      }
      // If invalid, don't update the state (silently reject invalid characters)
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, resume: file });
      setFileName(file.name);
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
    if (!formData.email.trim()) return setErrorsAndStop('Please enter your email address');
    if (!isValidEmail(formData.email.trim())) return setErrorsAndStop('Please enter a valid email address (e.g., example@domain.com)');
    if (!formData.phone.trim()) return setErrorsAndStop('Please enter your phone number');
    if (!isValidPhone(formData.phone)) return setErrorsAndStop('Phone number can only contain numbers');
    if (formData.phone.length < 10) return setErrorsAndStop('Phone number must be at least 10 digits');
    if (!formData.college.trim()) return setErrorsAndStop('Please enter your college name');
    if (!isValidCollege(formData.college)) return setErrorsAndStop('College name can only contain alphabets and spaces. No numbers or special characters allowed.');
    if (!formData.course) return setErrorsAndStop('Please select your course');
    if (!formData.currentYear) return setErrorsAndStop('Please select your current year');
    if (!formData.interest) return setErrorsAndStop('Please select your area of interest');

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
      // REGISTER STUDENT (JSON ✔️)
      // -------------------------
      const payload = {
        fullname: formData.fullName.trim(),
        email: formData.email.trim(),
        phone_number: formData.countryCode + formData.phone.trim(),
        college: formData.college.trim(),
        course: formData.course,
        current_year: formData.currentYear,
        area_of_interest: formData.interest
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
          tags: ['resume', 'student', formData.course.toLowerCase()], // Searchable tags
          customMetadata: {
            studentId: studentId,
            studentName: formData.fullName,
            uploadDate: new Date().toISOString()
          }
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
        interest: '',
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
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="flex -space-x-2 sm:-space-x-3">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="w-6 sm:w-8 h-6 sm:h-8 rounded-full border-2 border-white bg-slate-200"></div>
                    ))}
                  </div>
                  <div className="text-xs text-slate-500 font-medium">
                    Join 2,000+ others
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
                  <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-2">Full Name</label>
                  <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} required className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm" placeholder="John Doe" />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-2">Email Address</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm" placeholder="john@example.com" />
                </div>

                {/* Mobile & College */}
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-2">Mobile Number</label>
                  <div className="flex gap-1 sm:gap-2">
                    <select name="countryCode" value={formData.countryCode} onChange={handleChange} className="px-1 sm:px-2 md:px-3 py-2 sm:py-3 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-slate-600 text-xs sm:text-sm max-w-[100px] sm:max-w-none">
                      {countryCodes.map(cc => {
                        // Show short format on mobile, full on desktop
                        const displayText = typeof window !== 'undefined' && window.innerWidth < 640 ? cc.code : `${cc.code} ${cc.country}`;
                        return (
                          <option key={cc.code} value={cc.code} title={`${cc.code} ${cc.country}`}>
                            {cc.code} {cc.country}
                          </option>
                        );
                      })}
                    </select>
                    <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="flex-1 px-2 sm:px-3 md:px-4 py-2 sm:py-3 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-xs sm:text-sm" placeholder="9876543210" />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Select country code and enter number</p>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-2">College/University</label>
                  <input type="text" name="college" value={formData.college} onChange={handleChange} className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm" placeholder="University Name" />
                </div>

                {/* Course & Year */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-2">Course / Degree</label>
                    <select name="course" value={formData.course} onChange={handleChange} required className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-slate-600 text-sm">
                      <option value="">Select Course</option>
                      {['B.Tech', 'B.E.', 'BCA', 'MCA', 'B.Sc', 'M.Tech', 'Other'].map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-2">Current Year</label>
                    <select name="currentYear" value={formData.currentYear} onChange={handleChange} required className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-slate-600 text-sm">
                      <option value="">Select Year</option>
                      {['1st Year', '2nd Year', '3rd Year', '4th Year', 'Graduated'].map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                </div>

                {/* Area of Interest */}
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-2">Area of Interest</label>
                  <select name="interest" value={formData.interest} onChange={handleChange} required className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-slate-600 text-sm">
                    <option value="">Select Interest</option>
                    {['Cloud Computing', 'DevOps', 'Data Engineering', 'Security', 'Need Guidance'].map(i => <option key={i} value={i}>{i}</option>)}
                  </select>
                </div>

                {/* Resume Upload */}
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-2">Upload Resume ( Optional ) </label>
                  <div className="relative">
                    <input type="file" id="resume-upload" onChange={handleFileChange} className="hidden" accept=".pdf,.doc,.docx" />
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
                  </div>
                </div>

                <div className="pt-2 sm:pt-4">
                  <button disabled={(applicationId != null) || isLoading} onClick={handleSubmit} className={`w-full flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base transition-all duration-300 ${(applicationId == null && !isLoading) ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl active:scale-95" : "bg-gray-400 text-gray-100 cursor-not-allowed"}`}>
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
                  <Shield size={12} /> Your data is secure and encrypted
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
