# FlowTracker Contact Page Documentation

## Overview

A comprehensive, industry best practice contact page with an advanced contact form, complete with backend API, email notifications, and database storage.

## Features

### Frontend Features

#### 🎨 User Experience
- **Modern, Responsive Design**: Beautiful gradient design that works seamlessly on all devices (mobile, tablet, desktop)
- **Progressive Web Form**: Smart form that remembers data (sessionStorage) to prevent loss on accidental navigation
- **Accessibility (WCAG 2.1 AA Compliant)**:
  - Semantic HTML5 elements
  - Proper ARIA labels and roles
  - Screen reader announcements
  - Keyboard navigation support
  - Skip-to-content link
  - High contrast ratios

#### ✅ Form Validation
- **Real-time Inline Validation**: Validates fields as users type (after first touch)
- **Visual Feedback**: 
  - Red borders and error icons for invalid fields
  - Green borders and success indicators for valid fields
  - Character counter for message field
- **Comprehensive Field Validation**:
  - Name: 2-100 characters
  - Email: Proper email format validation
  - Phone: Optional, validates international phone format (10+ digits)
  - Subject: Required selection from dropdown
  - Message: 10-2000 characters
  - Privacy consent: Required checkbox

#### 📎 File Attachments
- **Supported Formats**: JPG, PNG, PDF, DOC, DOCX
- **File Size Limit**: 5MB per file
- **Client-side Validation**: Validates file type and size before upload
- **Visual Preview**: Shows selected filename with file icon

#### 🔒 Security Features
- **Honeypot Field**: Hidden field to catch bots
- **Rate Limiting**: Max 3 submissions per email per hour (backend)
- **CSRF Protection**: Anti-CSRF tokens (to be configured)
- **Input Sanitization**: Server-side validation and sanitization

#### 📧 User Feedback
- **Success State**:
  - Unique confirmation number (format: FT-TIMESTAMP-RANDOM)
  - Clear next steps information
  - Copy of submitted message
  - Options to submit another inquiry or return home
- **Error State**:
  - User-friendly error messages
  - Alternative contact methods
  - All form data preserved
- **Loading State**:
  - Disabled submit button with spinner
  - "Sending your message..." text

### Backend Features

#### 🛡️ API Endpoints

##### POST `/api/contact`
Submit a contact form with optional file attachment.

**Request Body (multipart/form-data)**:
```json
{
  "name": "John Smith",
  "email": "john@example.com",
  "phone": "+61 2 1234 5678",
  "subject": "Technical Support",
  "message": "I need help with...",
  "preferredContact": "email",
  "attachment": File (optional)
}
```

**Response (201 Created)**:
```json
{
  "success": true,
  "message": "Contact form submitted successfully",
  "data": {
    "confirmationNumber": "FT-123ABC-XYZ789",
    "submittedAt": "2025-01-15T10:30:00.000Z"
  }
}
```

##### GET `/api/contact/:confirmationNumber`
Check the status of a contact submission.

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "confirmation_number": "FT-123ABC-XYZ789",
    "subject": "Technical Support",
    "status": "responded",
    "created_at": "2025-01-15T10:30:00.000Z",
    "updated_at": "2025-01-15T14:20:00.000Z",
    "response_message": "Thank you for contacting us..."
  }
}
```

##### GET `/api/contact/admin/submissions` (Admin Only)
Get all contact submissions with pagination and filtering.

**Query Parameters**:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
- `status`: Filter by status (new, in_progress, responded, closed)

**Response (200 OK)**:
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

##### PATCH `/api/contact/admin/:id/status` (Admin Only)
Update the status of a contact submission.

**Request Body**:
```json
{
  "status": "responded",
  "responseMessage": "Thank you for your inquiry..."
}
```

#### 📊 Database Schema

**Table: `contact_submissions`**

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| confirmation_number | VARCHAR(50) | Unique confirmation number |
| name | VARCHAR(100) | Contact name |
| email | VARCHAR(255) | Contact email |
| phone | VARCHAR(50) | Contact phone (optional) |
| subject | VARCHAR(255) | Message subject |
| message | TEXT | Message content |
| preferred_contact | VARCHAR(20) | Preferred contact method |
| attachment_path | VARCHAR(500) | File path to attachment |
| attachment_name | VARCHAR(255) | Original filename |
| status | VARCHAR(20) | Submission status |
| response_message | TEXT | Admin response |
| responded_at | TIMESTAMP | Response timestamp |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |

**Indexes**:
- `idx_contact_submissions_email`
- `idx_contact_submissions_status`
- `idx_contact_submissions_created_at`
- `idx_contact_submissions_confirmation`

#### 📨 Email Notifications

##### User Confirmation Email
Beautiful HTML email sent to the user with:
- Confirmation number prominently displayed
- Copy of their submitted message
- Clear next steps
- Expected response time
- Contact information

##### Support Team Notification Email
Detailed HTML email sent to support team with:
- All contact information
- Message content
- Attachment information
- Quick reply button (mailto link)
- Admin panel link

### Contact Information

The contact page displays:
- **Email**: support@flowtracker.com
- **Phone**: +61 2 8000 4000
- **Business Hours**: Mon-Fri, 9:00 AM - 5:00 PM AEST
- **Response Time**: Within 24 business hours

## Installation & Setup

### 1. Database Migration

Run the database migration to create the contact_submissions table:

```bash
cd backend
npm run migrate
```

Or manually apply the SQL:

```bash
psql -U your_user -d flowtracker < database/migrations/add_contact_submissions.sql
```

### 2. Environment Variables

Add the following to your backend `.env` file:

```env
# Email Configuration
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASS=your-password
FROM_EMAIL=noreply@flowtracker.com
SUPPORT_EMAIL=support@flowtracker.com

# Server Configuration
PORT=5000
CORS_ORIGIN=http://localhost:5173
```

### 3. Create Upload Directory

The server will automatically create the uploads directory, but you can also create it manually:

```bash
mkdir -p backend/uploads/contact-attachments
```

### 4. Build Backend

```bash
cd backend
npm run build
```

### 5. Start Services

Development:
```bash
# Backend
cd backend
npm run dev

# Frontend
npm run dev
```

Production:
```bash
# Backend
cd backend
npm start

# Frontend
npm run build
npm run preview
```

## Usage

### Accessing the Contact Page

Users can access the contact page through:
1. Direct URL: `http://localhost:5173/contact`
2. Footer link: "Contact Us" in the application footer
3. Manual navigation: Any page with a link to `/contact`

### For Users

1. Navigate to the contact page
2. Fill out the required fields (name, email, subject, message)
3. Optionally add phone number and file attachment
4. Accept the privacy policy
5. Click "Send Message"
6. Save the confirmation number for tracking
7. Check email for confirmation

### For Administrators

**Viewing Submissions** (to be implemented in admin panel):
```javascript
// GET /api/contact/admin/submissions?status=new&page=1&limit=20
```

**Updating Status**:
```javascript
// PATCH /api/contact/admin/:id/status
{
  "status": "responded",
  "responseMessage": "Thank you for contacting us..."
}
```

## Testing

### Manual Testing Checklist

#### Frontend
- [ ] Form displays correctly on desktop, tablet, and mobile
- [ ] All validation messages appear for invalid inputs
- [ ] Valid inputs show green checkmarks
- [ ] Character counter updates in real time
- [ ] File upload validates file type and size
- [ ] Privacy consent is required
- [ ] Form data persists on page refresh (before submission)
- [ ] Success page displays with confirmation number
- [ ] Error page displays with helpful message
- [ ] Screen reader compatibility (test with NVDA/JAWS)
- [ ] Keyboard navigation works throughout form
- [ ] Tab order is logical

#### Backend
- [ ] API accepts valid contact form submissions
- [ ] API rejects invalid submissions with appropriate errors
- [ ] File uploads are stored correctly
- [ ] Database records are created properly
- [ ] Confirmation emails are sent to users
- [ ] Notification emails are sent to support team
- [ ] Rate limiting works (try 4+ submissions quickly)
- [ ] Status endpoints return correct data
- [ ] Admin endpoints require authentication (when implemented)

### Automated Testing

```bash
# Frontend tests
npm test

# Backend tests
cd backend
npm test
```

## Customization

### Styling

The contact page uses Tailwind CSS and follows the FlowTracker design system with:
- Gradient colors: `from-blue-50 via-purple-50 to-indigo-50`
- Primary button: `from-blue-600 to-indigo-600`
- Professional typography using Inter font

To customize:
1. Update colors in `src/components/ContactUs.tsx`
2. Modify Tailwind config in `tailwind.config.js`

### Email Templates

Email templates are defined in:
- `backend/src/services/contactEmailService.ts`

To customize:
1. Edit the `generateConfirmationEmailHTML()` method
2. Edit the `generateNotificationEmailHTML()` method
3. Update text versions as well for email clients without HTML support

### Subject Options

Edit the `SUBJECT_OPTIONS` array in `src/components/ContactUs.tsx`:

```typescript
const SUBJECT_OPTIONS = [
    'General Inquiry',
    'Technical Support',
    'Sales/Pricing',
    'Partnership Opportunities',
    'Bug Report',
    'Feature Request',
    'Your Custom Option', // Add your options
];
```

### Contact Information

Update contact details in `src/components/ContactUs.tsx`:

```typescript
// Email
support@flowtracker.com

// Phone
+61 2 8000 4000

// Business Hours
Mon-Fri: 9:00 AM - 5:00 PM AEST
```

## Troubleshooting

### Emails Not Sending

1. Check SMTP configuration in `.env`
2. Verify SMTP credentials are correct
3. Check server logs for email service errors
4. Test with a simple email client (Thunderbird, etc.)

### File Uploads Failing

1. Ensure uploads directory exists and is writable
2. Check file size limits in both frontend and backend
3. Verify allowed MIME types match

### Database Errors

1. Ensure migration has been run
2. Check database connection in server logs
3. Verify database user has proper permissions

### Rate Limiting Issues

1. Check IP address is being captured correctly
2. Adjust rate limits in `backend/src/routes/contact.ts`
3. Clear rate limit cache (restart server)

## Security Considerations

### Current Implementation
- ✅ Honeypot bot detection
- ✅ Rate limiting (per IP and per email)
- ✅ File type and size validation
- ✅ Input sanitization (Joi validation)
- ✅ HTTPS recommended for production

### Recommended Additions
- [ ] CAPTCHA integration (reCAPTCHA v3 or hCaptcha)
- [ ] CSRF tokens
- [ ] Email verification for first-time contacts
- [ ] IP blacklisting for repeat offenders
- [ ] Content moderation for spam keywords
- [ ] Request signing/verification

## Performance Optimization

### Current Implementation
- Session storage for form data
- Optimized file upload handling
- Indexed database queries
- Rate limiting prevents abuse

### Recommendations
- [ ] CDN for static assets
- [ ] Image optimization for email templates
- [ ] Database query caching
- [ ] Email queue system for high volume
- [ ] Load balancing for API endpoints

## Compliance

### GDPR Compliance
- ✅ Privacy policy consent required
- ✅ Clear data usage explanation
- ✅ User data stored securely
- [ ] Implement data deletion requests
- [ ] Add data export functionality

### Accessibility (WCAG 2.1 AA)
- ✅ Semantic HTML
- ✅ ARIA labels
- ✅ Keyboard navigation
- ✅ Screen reader support
- ✅ Color contrast ratios
- ✅ Focus indicators

## Future Enhancements

### Planned Features
1. **Admin Dashboard Integration**: View and manage submissions in the admin panel
2. **Status Tracking**: Allow users to check submission status with confirmation number
3. **Auto-responses**: Template-based automatic responses for common inquiries
4. **Priority Routing**: Route urgent submissions to different teams
5. **Multi-language Support**: Internationalization for global users
6. **Live Chat Integration**: Fallback to live chat if available
7. **FAQ Integration**: Suggest relevant FAQ articles before submission
8. **Attachment Preview**: Preview images before uploading
9. **Voice Messages**: Allow users to record voice messages
10. **Satisfaction Survey**: Post-resolution feedback collection

## Support

For issues or questions about the contact page:
- Email: dev@flowtracker.com
- Documentation: https://docs.flowtracker.com
- GitHub Issues: https://github.com/flowtracker/issues

## License

© 2025 FlowTracker. All rights reserved.

