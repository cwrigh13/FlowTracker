import nodemailer from 'nodemailer';

interface ContactConfirmationEmailData {
    to: string;
    name: string;
    confirmationNumber: string;
    subject: string;
    message: string;
}

interface ContactNotificationEmailData {
    name: string;
    email: string;
    phone: string;
    subject: string;
    message: string;
    preferredContact: string;
    confirmationNumber: string;
    attachmentName: string | null;
}

class ContactEmailService {
    private transporter: nodemailer.Transporter | null = null;
    private config: {
        host: string;
        port: number;
        user: string;
        pass: string;
        from: string;
        supportEmail: string;
    } | null = null;

    constructor() {
        this.initializeTransporter();
    }

    private initializeTransporter() {
        const host = process.env.SMTP_HOST;
        const port = process.env.SMTP_PORT;
        const user = process.env.SMTP_USER;
        const pass = process.env.SMTP_PASS;
        const from = process.env.FROM_EMAIL || process.env.SMTP_USER;
        const supportEmail = process.env.SUPPORT_EMAIL || 'support@flowtracker.com';

        if (!host || !port || !user || !pass) {
            console.warn('Email configuration incomplete. Contact email service will not be available.');
            return;
        }

        this.config = {
            host,
            port: parseInt(port),
            user,
            pass,
            from: from!,
            supportEmail
        };

        this.transporter = nodemailer.createTransport({
            host: this.config.host,
            port: this.config.port,
            secure: this.config.port === 465,
            auth: {
                user: this.config.user,
                pass: this.config.pass,
            },
        });

        this.transporter?.verify((error, success) => {
            if (error) {
                console.error('Contact email service verification failed:', error);
                this.transporter = null;
            } else {
                console.log('Contact email service is ready');
            }
        });
    }

    private isAvailable(): boolean {
        return this.transporter !== null && this.config !== null;
    }

    async sendContactConfirmationEmail(data: ContactConfirmationEmailData): Promise<boolean> {
        if (!this.isAvailable()) {
            console.error('Contact email service is not available');
            return false;
        }

        const mailOptions = {
            from: this.config!.from,
            to: data.to,
            subject: `Your Message Has Been Received - FlowTracker [${data.confirmationNumber}]`,
            html: this.generateConfirmationEmailHTML(data),
            text: this.generateConfirmationEmailText(data)
        };

        try {
            const info = await this.transporter!.sendMail(mailOptions);
            console.log('Contact confirmation email sent:', info.messageId);
            return true;
        } catch (error) {
            console.error('Failed to send contact confirmation email:', error);
            return false;
        }
    }

    async sendContactNotificationEmail(data: ContactNotificationEmailData): Promise<boolean> {
        if (!this.isAvailable()) {
            console.error('Contact email service is not available');
            return false;
        }

        const mailOptions = {
            from: this.config!.from,
            to: this.config!.supportEmail,
            subject: `New Contact Form Submission: ${data.subject} [${data.confirmationNumber}]`,
            html: this.generateNotificationEmailHTML(data),
            text: this.generateNotificationEmailText(data),
            replyTo: data.email
        };

        try {
            const info = await this.transporter!.sendMail(mailOptions);
            console.log('Contact notification email sent to support:', info.messageId);
            return true;
        } catch (error) {
            console.error('Failed to send contact notification email:', error);
            return false;
        }
    }

    private generateConfirmationEmailHTML(data: ContactConfirmationEmailData): string {
        return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Message Received - FlowTracker</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f7fafc;
        }
        .container {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 12px;
            padding: 2px;
            margin: 20px 0;
        }
        .inner-container {
            background-color: white;
            border-radius: 10px;
            padding: 40px;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .logo {
            font-size: 32px;
            font-weight: bold;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 10px;
        }
        .confirmation-box {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            margin: 30px 0;
        }
        .confirmation-number {
            font-size: 24px;
            font-weight: bold;
            letter-spacing: 2px;
            margin: 10px 0;
        }
        .message-box {
            background-color: #f7fafc;
            border-left: 4px solid #667eea;
            padding: 20px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .info-section {
            margin: 25px 0;
        }
        .info-section h3 {
            color: #667eea;
            font-size: 16px;
            margin-bottom: 10px;
        }
        .info-list {
            list-style: none;
            padding: 0;
        }
        .info-list li {
            padding: 8px 0;
            border-bottom: 1px solid #e2e8f0;
        }
        .info-list li:last-child {
            border-bottom: none;
        }
        .check-icon {
            color: #48bb78;
            font-size: 20px;
            margin-right: 8px;
        }
        .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #e2e8f0;
            color: #718096;
            font-size: 14px;
        }
        .button {
            display: inline-block;
            padding: 12px 30px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            margin: 20px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="inner-container">
            <div class="header">
                <div class="logo">FlowTracker</div>
                <h1 style="color: #2d3748; margin: 0; font-size: 28px;">Message Received!</h1>
            </div>

            <p>Hi ${data.name},</p>

            <p>Thank you for contacting FlowTracker. We've successfully received your message and our support team will review it shortly.</p>

            <div class="confirmation-box">
                <div style="font-size: 14px; opacity: 0.9;">Your Confirmation Number</div>
                <div class="confirmation-number">${data.confirmationNumber}</div>
                <div style="font-size: 13px; opacity: 0.9; margin-top: 10px;">Please save this for your records</div>
            </div>

            <div class="info-section">
                <h3>What You Submitted:</h3>
                <div style="padding: 15px; background-color: #f7fafc; border-radius: 6px;">
                    <div style="margin-bottom: 10px;">
                        <strong style="color: #4a5568;">Subject:</strong><br/>
                        ${data.subject}
                    </div>
                    <div>
                        <strong style="color: #4a5568;">Message:</strong><br/>
                        ${data.message}
                    </div>
                </div>
            </div>

            <div class="info-section">
                <h3>What Happens Next?</h3>
                <ul class="info-list">
                    <li><span class="check-icon">✓</span> Your message is now in our support queue</li>
                    <li><span class="check-icon">✓</span> Our team will review and respond within 24 business hours</li>
                    <li><span class="check-icon">✓</span> You'll receive our response via your preferred contact method</li>
                    <li><span class="check-icon">✓</span> You can reference your confirmation number in any follow-up</li>
                </ul>
            </div>

            <div style="text-align: center; margin: 30px 0;">
                <p style="color: #4a5568;">Need to add more information?</p>
                <a href="https://flowtracker.com/contact" class="button">Send Another Message</a>
            </div>

            <div class="footer">
                <p><strong>FlowTracker Support</strong></p>
                <p>📧 support@flowtracker.com | 📞 +61 2 8000 4000</p>
                <p style="margin-top: 15px; font-size: 12px;">
                    Business Hours: Monday-Friday, 9:00 AM - 5:00 PM AEST<br/>
                    This is an automated confirmation email. Please do not reply directly to this message.
                </p>
            </div>
        </div>
    </div>
</body>
</html>
        `;
    }

    private generateConfirmationEmailText(data: ContactConfirmationEmailData): string {
        return `
FlowTracker - Message Received

Hi ${data.name},

Thank you for contacting FlowTracker. We've successfully received your message and our support team will review it shortly.

YOUR CONFIRMATION NUMBER: ${data.confirmationNumber}
(Please save this for your records)

WHAT YOU SUBMITTED:
Subject: ${data.subject}
Message: ${data.message}

WHAT HAPPENS NEXT:
✓ Your message is now in our support queue
✓ Our team will review and respond within 24 business hours
✓ You'll receive our response via your preferred contact method
✓ You can reference your confirmation number in any follow-up

CONTACT US:
Email: support@flowtracker.com
Phone: +61 2 8000 4000
Business Hours: Monday-Friday, 9:00 AM - 5:00 PM AEST

This is an automated confirmation email. Please do not reply directly to this message.

---
© 2025 FlowTracker. All rights reserved.
        `;
    }

    private generateNotificationEmailHTML(data: ContactNotificationEmailData): string {
        return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Contact Form Submission</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 700px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f7fafc;
        }
        .container {
            background-color: white;
            border-radius: 12px;
            padding: 40px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
            background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%);
            color: white;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 30px;
        }
        .badge {
            display: inline-block;
            padding: 6px 12px;
            background-color: rgba(255, 255, 255, 0.2);
            border-radius: 4px;
            font-size: 12px;
            font-weight: 600;
            margin-bottom: 10px;
        }
        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin: 25px 0;
        }
        .info-item {
            background-color: #f7fafc;
            padding: 15px;
            border-radius: 6px;
            border-left: 3px solid #667eea;
        }
        .info-label {
            font-size: 12px;
            color: #718096;
            text-transform: uppercase;
            font-weight: 600;
            margin-bottom: 5px;
        }
        .info-value {
            color: #2d3748;
            font-size: 15px;
        }
        .message-section {
            background-color: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 20px;
            margin: 25px 0;
            border-radius: 4px;
        }
        .action-buttons {
            margin: 30px 0;
            text-align: center;
        }
        .button {
            display: inline-block;
            padding: 12px 24px;
            margin: 0 10px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
        }
        .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #e2e8f0;
            color: #718096;
            font-size: 13px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="badge">NEW SUBMISSION</div>
            <h1 style="margin: 10px 0; font-size: 24px;">Contact Form Submission</h1>
            <div style="font-size: 14px; opacity: 0.9;">Ref: ${data.confirmationNumber}</div>
        </div>

        <div class="info-grid">
            <div class="info-item">
                <div class="info-label">Name</div>
                <div class="info-value">${data.name}</div>
            </div>
            <div class="info-item">
                <div class="info-label">Email</div>
                <div class="info-value"><a href="mailto:${data.email}" style="color: #667eea;">${data.email}</a></div>
            </div>
            <div class="info-item">
                <div class="info-label">Phone</div>
                <div class="info-value">${data.phone || 'Not provided'}</div>
            </div>
            <div class="info-item">
                <div class="info-label">Preferred Contact</div>
                <div class="info-value" style="text-transform: capitalize;">${data.preferredContact}</div>
            </div>
            <div class="info-item" style="grid-column: 1 / -1;">
                <div class="info-label">Subject</div>
                <div class="info-value" style="font-weight: 600; color: #1a202c;">${data.subject}</div>
            </div>
            ${data.attachmentName ? `
            <div class="info-item" style="grid-column: 1 / -1; border-left-color: #10b981;">
                <div class="info-label">Attachment</div>
                <div class="info-value">📎 ${data.attachmentName}</div>
            </div>
            ` : ''}
        </div>

        <div class="message-section">
            <div class="info-label" style="color: #92400e;">Message Content</div>
            <div style="margin-top: 10px; color: #78350f; white-space: pre-wrap;">${data.message}</div>
        </div>

        <div class="action-buttons">
            <a href="mailto:${data.email}?subject=Re: ${encodeURIComponent(data.subject)} [${data.confirmationNumber}]" class="button">Reply to Sender</a>
            <a href="https://flowtracker.com/admin/contact-submissions" class="button" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%);">View in Admin</a>
        </div>

        <div class="footer">
            <p><strong>FlowTracker Support System</strong></p>
            <p>This email was automatically generated from the FlowTracker contact form.</p>
            <p style="margin-top: 15px; font-size: 12px;">
                Submission time: ${new Date().toLocaleString('en-AU', { timeZone: 'Australia/Sydney' })} AEST
            </p>
        </div>
    </div>
</body>
</html>
        `;
    }

    private generateNotificationEmailText(data: ContactNotificationEmailData): string {
        return `
NEW CONTACT FORM SUBMISSION
Confirmation Number: ${data.confirmationNumber}

CONTACT INFORMATION:
Name: ${data.name}
Email: ${data.email}
Phone: ${data.phone || 'Not provided'}
Preferred Contact: ${data.preferredContact}

SUBJECT: ${data.subject}

MESSAGE:
${data.message}

${data.attachmentName ? `ATTACHMENT: ${data.attachmentName}\n` : ''}

Reply to: ${data.email}

---
Submission time: ${new Date().toLocaleString('en-AU', { timeZone: 'Australia/Sydney' })} AEST
This email was automatically generated from the FlowTracker contact form.
        `;
    }
}

// Export singleton instance
export const contactEmailService = new ContactEmailService();

// Export functions for easy import
export const sendContactConfirmationEmail = (data: ContactConfirmationEmailData) => 
    contactEmailService.sendContactConfirmationEmail(data);

export const sendContactNotificationEmail = (data: ContactNotificationEmailData) => 
    contactEmailService.sendContactNotificationEmail(data);

