# Contact Page Quick Start Guide

## 🚀 Get Your Contact Page Running in 5 Minutes

### Step 1: Set Up Database (1 minute)

```bash
cd backend
psql -U postgres -d flowtracker -f database/migrations/add_contact_submissions.sql
```

### Step 2: Configure Email (1 minute)

Add to `backend/.env`:

```env
# Email Settings
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=noreply@flowtracker.com
SUPPORT_EMAIL=support@flowtracker.com
```

**Gmail Users**: Use [App Passwords](https://myaccount.google.com/apppasswords) instead of your regular password.

### Step 3: Install Dependencies & Build (2 minutes)

```bash
# Backend
cd backend
npm install
npm run build

# Frontend (in root directory)
cd ..
npm install
```

### Step 4: Start Services (1 minute)

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

### Step 5: Test It! (30 seconds)

1. Open http://localhost:5173/contact
2. Fill out the form
3. Submit and get your confirmation number!

---

## 📝 Quick Test Checklist

- [ ] Page loads without errors
- [ ] Form validation works (try submitting with invalid email)
- [ ] File upload accepts PDF/images
- [ ] Success page shows confirmation number
- [ ] Check your email for confirmation

---

## 🔧 Troubleshooting

### "Database error"
Run the migration: `psql -U postgres -d flowtracker -f backend/database/migrations/add_contact_submissions.sql`

### "Email not sent"
Check your SMTP settings in `.env` and verify credentials

### "Cannot upload files"
Create directory: `mkdir -p backend/uploads/contact-attachments`

### Port already in use
Change port in `backend/.env`: `PORT=5001`

---

## 🎨 Customize

### Change Contact Info
Edit `src/components/ContactUs.tsx`:
- Line ~720: Email address
- Line ~737: Phone number
- Line ~752: Business hours

### Add/Remove Subject Options
Edit `src/components/ContactUs.tsx` line ~23:
```typescript
const SUBJECT_OPTIONS = [
    'Your Custom Option',
    // ... more options
];
```

### Change Colors
Edit Tailwind classes in `src/components/ContactUs.tsx`:
- Search for `from-blue-600 to-indigo-600` (primary gradient)
- Search for `bg-blue-50` (background colors)

---

## 📧 Email Configuration Examples

### Gmail
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### Outlook/Office365
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
```

### SendGrid
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
```

### AWS SES
```env
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_USER=your-ses-smtp-username
SMTP_PASS=your-ses-smtp-password
```

---

## 🎯 What's Included

✅ **Frontend (React/TypeScript)**
- Beautiful responsive design
- Real-time form validation
- File upload support
- Accessibility compliant (WCAG 2.1 AA)

✅ **Backend (Node.js/Express)**
- RESTful API endpoints
- Rate limiting (3 submissions/hour per email)
- Database storage
- File handling

✅ **Email System**
- User confirmation emails (beautiful HTML)
- Support team notifications
- Automatic confirmation numbers

✅ **Security**
- Honeypot bot detection
- Rate limiting
- Input validation & sanitization
- File type/size validation

---

## 📚 Full Documentation

For detailed documentation, see [CONTACT_PAGE_DOCUMENTATION.md](./CONTACT_PAGE_DOCUMENTATION.md)

---

## 🆘 Need Help?

- Check the troubleshooting section above
- Read the full documentation
- Contact: dev@flowtracker.com

---

**Happy Contacting! 📬**

