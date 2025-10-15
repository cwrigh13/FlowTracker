import { useState, FormEvent, ChangeEvent, useRef, useEffect, FC } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface ContactFormData {
    name: string;
    email: string;
    phone: string;
    subject: string;
    message: string;
    preferredContact: 'email' | 'phone' | 'either';
    attachment: File | null;
    privacyConsent: boolean;
}

interface ValidationErrors {
    [key: string]: string;
}

const SUBJECT_OPTIONS = [
    'General Inquiry',
    'Technical Support',
    'Sales/Pricing',
    'Partnership Opportunities',
    'Bug Report',
    'Feature Request',
    'Account Issues',
    'Data & Privacy',
    'Other'
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

export const ContactUs: FC = () => {
    const { user } = useAuth();
    
    const [formData, setFormData] = useState<ContactFormData>({
        name: user ? `${user.first_name} ${user.last_name}` : '',
        email: user?.email || '',
        phone: '',
        subject: '',
        message: '',
        preferredContact: 'email',
        attachment: null,
        privacyConsent: false
    });

    const [errors, setErrors] = useState<ValidationErrors>({});
    const [touched, setTouched] = useState<Set<string>>(new Set());
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [confirmationNumber, setConfirmationNumber] = useState<string>('');
    const [honeypot, setHoneypot] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Character count for message
    const messageLength = formData.message.length;
    const messageMinLength = 10;
    const messageMaxLength = 2000;

    // Load form data from sessionStorage on mount (prevent data loss)
    useEffect(() => {
        const savedData = sessionStorage.getItem('contactFormData');
        if (savedData && !user) {
            try {
                const parsed = JSON.parse(savedData);
                setFormData(prev => ({ ...prev, ...parsed }));
            } catch (e) {
                console.error('Failed to parse saved form data');
            }
        }
    }, [user]);

    // Save form data to sessionStorage on change
    useEffect(() => {
        if (submitStatus === 'idle') {
            const dataToSave = { ...formData, attachment: null, privacyConsent: false };
            sessionStorage.setItem('contactFormData', JSON.stringify(dataToSave));
        }
    }, [formData, submitStatus]);

    // Validation functions
    const validateEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validatePhone = (phone: string): boolean => {
        if (!phone) return true; // Optional field
        const phoneRegex = /^[\d\s\-\+\(\)]+$/;
        return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
    };

    const validateField = (name: string, value: any): string => {
        switch (name) {
            case 'name':
                if (!value || value.trim().length < 2) return 'Name must be at least 2 characters';
                if (value.trim().length > 100) return 'Name must be less than 100 characters';
                return '';
            
            case 'email':
                if (!value) return 'Email is required';
                if (!validateEmail(value)) return 'Please enter a valid email address';
                return '';
            
            case 'phone':
                if (value && !validatePhone(value)) return 'Please enter a valid phone number (minimum 10 digits)';
                return '';
            
            case 'subject':
                if (!value) return 'Please select a subject';
                return '';
            
            case 'message':
                if (!value || value.trim().length < messageMinLength) {
                    return `Message must be at least ${messageMinLength} characters`;
                }
                if (value.trim().length > messageMaxLength) {
                    return `Message must not exceed ${messageMaxLength} characters`;
                }
                return '';
            
            case 'privacyConsent':
                if (!value) return 'You must agree to the privacy policy';
                return '';
            
            default:
                return '';
        }
    };

    const validateForm = (): boolean => {
        const newErrors: ValidationErrors = {};
        
        newErrors.name = validateField('name', formData.name);
        newErrors.email = validateField('email', formData.email);
        newErrors.phone = validateField('phone', formData.phone);
        newErrors.subject = validateField('subject', formData.subject);
        newErrors.message = validateField('message', formData.message);
        newErrors.privacyConsent = validateField('privacyConsent', formData.privacyConsent);

        // Remove empty errors
        Object.keys(newErrors).forEach(key => {
            if (!newErrors[key]) delete newErrors[key];
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
        
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));

        // Real-time validation for touched fields
        if (touched.has(name)) {
            const error = validateField(name, type === 'checkbox' ? checked : value);
            setErrors(prev => {
                const newErrors = { ...prev };
                if (error) {
                    newErrors[name] = error;
                } else {
                    delete newErrors[name];
                }
                return newErrors;
            });
        }
    };

    const handleBlur = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name } = e.target;
        setTouched(prev => new Set(prev).add(name));
        
        const error = validateField(name, formData[name as keyof ContactFormData]);
        if (error) {
            setErrors(prev => ({ ...prev, [name]: error }));
        }
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        
        if (!file) {
            setFormData(prev => ({ ...prev, attachment: null }));
            return;
        }

        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
            setErrors(prev => ({ 
                ...prev, 
                attachment: `File size must be less than ${MAX_FILE_SIZE / 1024 / 1024}MB` 
            }));
            if (fileInputRef.current) fileInputRef.current.value = '';
            return;
        }

        // Validate file type
        if (!ALLOWED_FILE_TYPES.includes(file.type)) {
            setErrors(prev => ({ 
                ...prev, 
                attachment: 'File type not allowed. Please use JPG, PNG, PDF, DOC, or DOCX' 
            }));
            if (fileInputRef.current) fileInputRef.current.value = '';
            return;
        }

        setFormData(prev => ({ ...prev, attachment: file }));
        setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors.attachment;
            return newErrors;
        });
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        // Check honeypot (bot detection)
        if (honeypot) {
            console.log('Bot detected via honeypot');
            return;
        }

        // Mark all fields as touched
        setTouched(new Set(['name', 'email', 'phone', 'subject', 'message', 'privacyConsent']));

        if (!validateForm()) {
            // Announce errors to screen readers
            const errorMessage = 'Please correct the errors in the form';
            announceToScreenReader(errorMessage);
            return;
        }

        setIsSubmitting(true);
        setSubmitStatus('idle');

        try {
            // Create FormData for file upload
            const submitData = new FormData();
            submitData.append('name', formData.name.trim());
            submitData.append('email', formData.email.trim());
            submitData.append('phone', formData.phone.trim());
            submitData.append('subject', formData.subject);
            submitData.append('message', formData.message.trim());
            submitData.append('preferredContact', formData.preferredContact);
            if (formData.attachment) {
                submitData.append('attachment', formData.attachment);
            }

            // Submit to backend API
            const response = await fetch('/api/contact', {
                method: 'POST',
                body: submitData,
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('Failed to submit contact form');
            }

            const result = await response.json();
            
            setConfirmationNumber(result.confirmationNumber || generateConfirmationNumber());
            setSubmitStatus('success');
            
            // Clear form and sessionStorage
            setFormData({
                name: user ? `${user.first_name} ${user.last_name}` : '',
                email: user?.email || '',
                phone: '',
                subject: '',
                message: '',
                preferredContact: 'email',
                attachment: null,
                privacyConsent: false
            });
            setErrors({});
            setTouched(new Set());
            sessionStorage.removeItem('contactFormData');
            if (fileInputRef.current) fileInputRef.current.value = '';

            // Announce success to screen readers
            announceToScreenReader('Your message has been sent successfully!');
            
            // Scroll to success message
            window.scrollTo({ top: 0, behavior: 'smooth' });

        } catch (error) {
            console.error('Contact form submission error:', error);
            setSubmitStatus('error');
            announceToScreenReader('An error occurred. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const generateConfirmationNumber = (): string => {
        const timestamp = Date.now().toString(36).toUpperCase();
        const random = Math.random().toString(36).substring(2, 8).toUpperCase();
        return `FT-${timestamp}-${random}`;
    };

    const announceToScreenReader = (message: string) => {
        const liveRegion = document.getElementById('live-region');
        if (liveRegion) {
            liveRegion.textContent = message;
            setTimeout(() => {
                liveRegion.textContent = '';
            }, 1000);
        }
    };

    const getFieldClassName = (fieldName: string, baseClasses: string) => {
        const hasError = touched.has(fieldName) && errors[fieldName];
        const isValid = touched.has(fieldName) && !errors[fieldName] && formData[fieldName as keyof ContactFormData];
        
        let classes = baseClasses;
        if (hasError) {
            classes += ' border-red-500 focus:ring-red-500 focus:border-red-500';
        } else if (isValid) {
            classes += ' border-green-500 focus:ring-green-500 focus:border-green-500';
        } else {
            classes += ' border-gray-300 focus:ring-blue-500 focus:border-blue-500';
        }
        
        return classes;
    };

    if (submitStatus === 'success') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-3xl mx-auto">
                    <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
                        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
                            <svg className="h-10 w-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Message Sent Successfully!</h2>
                        
                        <p className="text-lg text-gray-600 mb-6">
                            Thank you for contacting FlowTracker. We've received your message and will respond within 24 business hours.
                        </p>
                        
                        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mb-6">
                            <p className="text-sm text-gray-600 mb-2">Your Confirmation Number:</p>
                            <p className="text-2xl font-bold text-blue-700 tracking-wider">{confirmationNumber}</p>
                            <p className="text-sm text-gray-500 mt-2">Please save this number for your records</p>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left">
                            <h3 className="font-semibold text-gray-900 mb-3">What happens next?</h3>
                            <ul className="space-y-2 text-gray-600">
                                <li className="flex items-start">
                                    <svg className="h-5 w-5 text-blue-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    <span>You'll receive a confirmation email shortly</span>
                                </li>
                                <li className="flex items-start">
                                    <svg className="h-5 w-5 text-blue-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    <span>Our support team will review your message</span>
                                </li>
                                <li className="flex items-start">
                                    <svg className="h-5 w-5 text-blue-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    <span>We'll respond via your preferred contact method within 24 hours</span>
                                </li>
                            </ul>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button
                                onClick={() => setSubmitStatus('idle')}
                                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors shadow-md hover:shadow-lg"
                            >
                                Submit Another Inquiry
                            </button>
                            <a
                                href="/"
                                className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-semibold transition-colors shadow-md hover:shadow-lg text-center"
                            >
                                Return to Dashboard
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
            {/* Skip to main content link for accessibility */}
            <a
                href="#contact-form"
                className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded-md z-50"
            >
                Skip to contact form
            </a>

            {/* ARIA live region for screen reader announcements */}
            <div id="live-region" className="sr-only" role="status" aria-live="polite" aria-atomic="true"></div>

            <div className="max-w-7xl mx-auto">
                {/* FlowTracker Banner */}
                <div className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 p-6 rounded-xl flex justify-center items-center mb-8 shadow-lg">
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 rounded-xl"></div>
                    <div className="relative z-10 flex items-center gap-3">
                        <img 
                            src="/flowtracker-logo.svg" 
                            alt="FlowTracker Logo" 
                            className="w-10 h-10 md:w-12 md:h-12"
                        />
                        <h1 className="text-3xl md:text-4xl font-bold text-white tracking-wide">FlowTracker</h1>
                    </div>
                </div>

                {/* Error Alert */}
                {submitStatus === 'error' && (
                    <div className="max-w-3xl mx-auto mb-8 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg" role="alert">
                        <div className="flex items-start">
                            <svg className="h-6 w-6 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div>
                                <h3 className="text-red-800 font-semibold mb-1">Unable to Send Message</h3>
                                <p className="text-red-700">
                                    We're sorry, but there was an error submitting your message. Please try again or contact us directly at{' '}
                                    <a href="mailto:support@flowtracker.com" className="underline font-semibold">
                                        support@flowtracker.com
                                    </a>
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Contact Form - Left Column (2/3 width on desktop) */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Send Us a Message</h2>
                            
                            <form id="contact-form" onSubmit={handleSubmit} noValidate>
                                {/* Required fields legend */}
                                <p className="text-sm text-gray-600 mb-6">
                                    <span className="text-red-500 font-semibold">*</span> Required fields
                                </p>

                                {/* Honeypot field (hidden from users, visible to bots) */}
                                <div className="hidden" aria-hidden="true">
                                    <label htmlFor="website">Website</label>
                                    <input
                                        type="text"
                                        id="website"
                                        name="website"
                                        value={honeypot}
                                        onChange={(e) => setHoneypot(e.target.value)}
                                        tabIndex={-1}
                                        autoComplete="off"
                                    />
                                </div>

                                {/* Name Field */}
                                <div className="mb-6">
                                    <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                                        Full Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        onBlur={handleBlur}
                                        className={getFieldClassName('name', 'w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 transition-colors')}
                                        placeholder="John Smith"
                                        required
                                        aria-required="true"
                                        aria-invalid={touched.has('name') && !!errors.name}
                                        aria-describedby={errors.name ? 'name-error' : undefined}
                                        disabled={isSubmitting}
                                    />
                                    {touched.has('name') && errors.name && (
                                        <p id="name-error" className="mt-2 text-sm text-red-600 flex items-center" role="alert">
                                            <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                            {errors.name}
                                        </p>
                                    )}
                                </div>

                                {/* Email Field */}
                                <div className="mb-6">
                                    <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                                        Email Address <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        onBlur={handleBlur}
                                        className={getFieldClassName('email', 'w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 transition-colors')}
                                        placeholder="john.smith@example.com"
                                        required
                                        aria-required="true"
                                        aria-invalid={touched.has('email') && !!errors.email}
                                        aria-describedby={errors.email ? 'email-error' : undefined}
                                        disabled={isSubmitting}
                                    />
                                    {touched.has('email') && errors.email && (
                                        <p id="email-error" className="mt-2 text-sm text-red-600 flex items-center" role="alert">
                                            <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                            {errors.email}
                                        </p>
                                    )}
                                </div>

                                {/* Phone Field */}
                                <div className="mb-6">
                                    <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                                        Phone Number (Optional)
                                    </label>
                                    <input
                                        type="tel"
                                        id="phone"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        onBlur={handleBlur}
                                        className={getFieldClassName('phone', 'w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 transition-colors')}
                                        placeholder="+61 2 1234 5678"
                                        aria-invalid={touched.has('phone') && !!errors.phone}
                                        aria-describedby={errors.phone ? 'phone-error' : undefined}
                                        disabled={isSubmitting}
                                    />
                                    {touched.has('phone') && errors.phone && (
                                        <p id="phone-error" className="mt-2 text-sm text-red-600 flex items-center" role="alert">
                                            <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                            {errors.phone}
                                        </p>
                                    )}
                                </div>

                                {/* Subject Field */}
                                <div className="mb-6">
                                    <label htmlFor="subject" className="block text-sm font-semibold text-gray-700 mb-2">
                                        Subject <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        id="subject"
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleInputChange}
                                        onBlur={handleBlur}
                                        className={getFieldClassName('subject', 'w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 transition-colors')}
                                        required
                                        aria-required="true"
                                        aria-invalid={touched.has('subject') && !!errors.subject}
                                        aria-describedby={errors.subject ? 'subject-error' : undefined}
                                        disabled={isSubmitting}
                                    >
                                        <option value="">Select a topic...</option>
                                        {SUBJECT_OPTIONS.map(option => (
                                            <option key={option} value={option}>{option}</option>
                                        ))}
                                    </select>
                                    {touched.has('subject') && errors.subject && (
                                        <p id="subject-error" className="mt-2 text-sm text-red-600 flex items-center" role="alert">
                                            <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                            {errors.subject}
                                        </p>
                                    )}
                                </div>

                                {/* Message Field */}
                                <div className="mb-6">
                                    <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
                                        Message <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        id="message"
                                        name="message"
                                        value={formData.message}
                                        onChange={handleInputChange}
                                        onBlur={handleBlur}
                                        rows={6}
                                        className={getFieldClassName('message', 'w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 transition-colors resize-none')}
                                        placeholder="Please provide as much detail as possible..."
                                        required
                                        aria-required="true"
                                        aria-invalid={touched.has('message') && !!errors.message}
                                        aria-describedby={errors.message ? 'message-error' : 'message-count'}
                                        disabled={isSubmitting}
                                        minLength={messageMinLength}
                                        maxLength={messageMaxLength}
                                    />
                                    <div className="mt-2 flex justify-between items-start">
                                        <div className="flex-1">
                                            {touched.has('message') && errors.message && (
                                                <p id="message-error" className="text-sm text-red-600 flex items-center" role="alert">
                                                    <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                    </svg>
                                                    {errors.message}
                                                </p>
                                            )}
                                        </div>
                                        <p
                                            id="message-count"
                                            className={`text-sm ${
                                                messageLength < messageMinLength
                                                    ? 'text-red-600'
                                                    : messageLength > messageMaxLength * 0.9
                                                    ? 'text-orange-600'
                                                    : 'text-gray-500'
                                            }`}
                                            aria-live="polite"
                                        >
                                            {messageLength}/{messageMaxLength}
                                        </p>
                                    </div>
                                </div>

                                {/* File Attachment */}
                                <div className="mb-6">
                                    <label htmlFor="attachment" className="block text-sm font-semibold text-gray-700 mb-2">
                                        Attachment (Optional)
                                    </label>
                                    <div className="flex items-center space-x-4">
                                        <label
                                            htmlFor="attachment"
                                            className="cursor-pointer inline-flex items-center px-4 py-2 border-2 border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus-within:ring-2 focus-within:ring-blue-500 transition-colors"
                                        >
                                            <svg className="h-5 w-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                            </svg>
                                            Choose File
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                id="attachment"
                                                name="attachment"
                                                onChange={handleFileChange}
                                                className="sr-only"
                                                accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                                                disabled={isSubmitting}
                                                aria-describedby={errors.attachment ? 'attachment-error' : 'attachment-help'}
                                            />
                                        </label>
                                        {formData.attachment && (
                                            <span className="text-sm text-gray-600 flex items-center">
                                                <svg className="h-4 w-4 mr-1 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                                {formData.attachment.name}
                                            </span>
                                        )}
                                    </div>
                                    <p id="attachment-help" className="mt-2 text-xs text-gray-500">
                                        Supported formats: JPG, PNG, PDF, DOC, DOCX (Max 5MB)
                                    </p>
                                    {errors.attachment && (
                                        <p id="attachment-error" className="mt-2 text-sm text-red-600 flex items-center" role="alert">
                                            <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                            {errors.attachment}
                                        </p>
                                    )}
                                </div>

                                {/* Preferred Contact Method */}
                                <div className="mb-6">
                                    <fieldset>
                                        <legend className="block text-sm font-semibold text-gray-700 mb-3">
                                            Preferred Contact Method (Optional)
                                        </legend>
                                        <div className="space-y-3">
                                            {(['email', 'phone', 'either'] as const).map((method) => (
                                                <label key={method} className="flex items-center cursor-pointer group">
                                                    <input
                                                        type="radio"
                                                        name="preferredContact"
                                                        value={method}
                                                        checked={formData.preferredContact === method}
                                                        onChange={handleInputChange}
                                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 cursor-pointer"
                                                        disabled={isSubmitting}
                                                    />
                                                    <span className="ml-3 text-sm text-gray-700 group-hover:text-gray-900 capitalize">
                                                        {method === 'either' ? 'Either Email or Phone' : method}
                                                    </span>
                                                </label>
                                            ))}
                                        </div>
                                    </fieldset>
                                </div>

                                {/* Privacy Consent */}
                                <div className="mb-6">
                                    <label className="flex items-start cursor-pointer group">
                                        <input
                                            type="checkbox"
                                            name="privacyConsent"
                                            checked={formData.privacyConsent}
                                            onChange={handleInputChange}
                                            onBlur={handleBlur}
                                            className={`mt-1 h-5 w-5 text-blue-600 focus:ring-blue-500 border-2 rounded cursor-pointer ${
                                                touched.has('privacyConsent') && errors.privacyConsent
                                                    ? 'border-red-500'
                                                    : 'border-gray-300'
                                            }`}
                                            required
                                            aria-required="true"
                                            aria-invalid={touched.has('privacyConsent') && !!errors.privacyConsent}
                                            aria-describedby={errors.privacyConsent ? 'privacy-error' : undefined}
                                            disabled={isSubmitting}
                                        />
                                        <span className="ml-3 text-sm text-gray-700 group-hover:text-gray-900">
                                            I agree to the{' '}
                                            <a
                                                href="/privacy-policy.html"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:text-blue-800 underline font-semibold"
                                            >
                                                privacy policy
                                            </a>{' '}
                                            and consent to having FlowTracker store my submitted information{' '}
                                            <span className="text-red-500">*</span>
                                        </span>
                                    </label>
                                    {touched.has('privacyConsent') && errors.privacyConsent && (
                                        <p id="privacy-error" className="mt-2 text-sm text-red-600 flex items-center ml-8" role="alert">
                                            <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                            {errors.privacyConsent}
                                        </p>
                                    )}
                                </div>

                                {/* Privacy Notice */}
                                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                    <p className="text-sm text-gray-700">
                                        <strong>Privacy Notice:</strong> Your information will be used solely to respond to your inquiry. 
                                        We will not share your data with third parties without your consent. 
                                        View our complete{' '}
                                        <a
                                            href="/privacy-policy.html"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:text-blue-800 underline"
                                        >
                                            privacy policy
                                        </a>.
                                    </p>
                                </div>

                                {/* Submit Button */}
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 px-8 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-4 focus:ring-blue-300 flex items-center justify-center"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Sending your message...
                                            </>
                                        ) : (
                                            <>
                                                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                </svg>
                                                Send Message
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Contact Information - Right Column (1/3 width on desktop) */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">Contact Information</h3>
                            
                            <div className="space-y-4">
                                {/* Email */}
                                <div className="flex items-start">
                                    <div className="flex-shrink-0">
                                        <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                            <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm font-semibold text-gray-900">Email</p>
                                        <a
                                            href="mailto:support@flowtracker.com"
                                            className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                                        >
                                            support@flowtracker.com
                                        </a>
                                    </div>
                                </div>

                                {/* Business Hours */}
                                <div className="flex items-start">
                                    <div className="flex-shrink-0">
                                        <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                            <svg className="h-5 w-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm font-semibold text-gray-900">Business Hours</p>
                                        <p className="text-sm text-gray-600">Mon-Fri: 9:00 AM - 5:00 PM</p>
                                        <p className="text-sm text-gray-500">AEST</p>
                                    </div>
                                </div>

                                {/* Expected Response Time */}
                                <div className="flex items-start">
                                    <div className="flex-shrink-0">
                                        <div className="h-10 w-10 bg-orange-100 rounded-lg flex items-center justify-center">
                                            <svg className="h-5 w-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm font-semibold text-gray-900">Response Time</p>
                                        <p className="text-sm text-gray-600">Within 24 hours</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* FAQ Link */}
                        <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl shadow-xl p-6 text-white">
                            <h3 className="text-xl font-bold mb-3">Need Help Faster?</h3>
                            <p className="text-sm opacity-90 mb-4">
                                Check out our comprehensive FAQ and knowledge base for instant answers to common questions.
                            </p>
                            <a
                                href="http://localhost:3000/product-website#faq"
                                className="inline-block bg-white text-indigo-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors shadow-md"
                            >
                                Visit FAQ →
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactUs;

