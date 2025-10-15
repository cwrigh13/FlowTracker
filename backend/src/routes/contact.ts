import express, { Request, Response } from 'express';
import Joi from 'joi';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../database/connection';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { sendContactConfirmationEmail, sendContactNotificationEmail } from '../services/emailService';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/contact-attachments/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${uuidv4()}`;
        cb(null, `contact-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

const fileFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedMimeTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only JPG, PNG, PDF, DOC, and DOCX are allowed.'));
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    }
});

// Validation schema
const contactSchema = Joi.object({
    name: Joi.string().min(2).max(100).required().trim(),
    email: Joi.string().email().required().trim(),
    phone: Joi.string().max(50).optional().allow('').trim(),
    subject: Joi.string().required().trim(),
    message: Joi.string().min(10).max(2000).required().trim(),
    preferredContact: Joi.string().valid('email', 'phone', 'either').optional().default('email'),
});

// Rate limiting map for contact form submissions
const submissionMap = new Map<string, { count: number; resetTime: number }>();

const checkRateLimit = (email: string): boolean => {
    const now = Date.now();
    const hourInMs = 60 * 60 * 1000;
    
    const existing = submissionMap.get(email);
    
    if (existing) {
        if (now > existing.resetTime) {
            // Reset the counter
            submissionMap.set(email, { count: 1, resetTime: now + hourInMs });
            return true;
        } else if (existing.count >= 3) {
            // Limit reached
            return false;
        } else {
            // Increment counter
            existing.count++;
            return true;
        }
    } else {
        // First submission
        submissionMap.set(email, { count: 1, resetTime: now + hourInMs });
        return true;
    }
};

// Clean up old entries every hour
setInterval(() => {
    const now = Date.now();
    for (const [email, data] of submissionMap.entries()) {
        if (now > data.resetTime) {
            submissionMap.delete(email);
        }
    }
}, 60 * 60 * 1000);

/**
 * POST /api/contact
 * Submit a contact form
 */
router.post('/', upload.single('attachment'), asyncHandler(async (req: Request, res: Response) => {
    // Validate request body
    const { error, value } = contactSchema.validate(req.body);
    if (error) {
        throw createError(error.details[0]?.message || 'Validation error', 400);
    }

    const { name, email, phone, subject, message, preferredContact } = value;

    // Check rate limit
    if (!checkRateLimit(email)) {
        throw createError('Too many submissions. Please try again in an hour.', 429);
    }

    // Generate confirmation number
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    const confirmationNumber = `FT-${timestamp}-${random}`;

    // Get attachment info if present
    const attachmentPath = req.file ? req.file.path : null;
    const attachmentName = req.file ? req.file.originalname : null;

    try {
        // Store contact submission in database
        const result = await db.query(
            `INSERT INTO contact_submissions 
            (confirmation_number, name, email, phone, subject, message, preferred_contact, attachment_path, attachment_name, status, created_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'new', NOW())
            RETURNING id, confirmation_number, created_at`,
            [confirmationNumber, name, email, phone, subject, message, preferredContact, attachmentPath, attachmentName]
        );

        const submission = result.rows[0];

        // Send confirmation email to user
        try {
            await sendContactConfirmationEmail({
                to: email,
                name: name,
                confirmationNumber: confirmationNumber,
                subject: subject,
                message: message
            });
        } catch (emailError) {
            console.error('Failed to send confirmation email:', emailError);
            // Don't fail the request if email fails
        }

        // Send notification email to support team
        try {
            await sendContactNotificationEmail({
                name: name,
                email: email,
                phone: phone,
                subject: subject,
                message: message,
                preferredContact: preferredContact,
                confirmationNumber: confirmationNumber,
                attachmentName: attachmentName
            });
        } catch (emailError) {
            console.error('Failed to send notification email:', emailError);
            // Don't fail the request if email fails
        }

        res.status(201).json({
            success: true,
            message: 'Contact form submitted successfully',
            data: {
                confirmationNumber: submission.confirmation_number,
                submittedAt: submission.created_at
            }
        });

    } catch (dbError) {
        console.error('Database error:', dbError);
        throw createError('Failed to submit contact form. Please try again.', 500);
    }
}));

/**
 * GET /api/contact/:confirmationNumber
 * Get contact submission status by confirmation number
 */
router.get('/:confirmationNumber', asyncHandler(async (req: Request, res: Response) => {
    const { confirmationNumber } = req.params;

    const result = await db.query(
        `SELECT confirmation_number, subject, status, created_at, updated_at, response_message
         FROM contact_submissions
         WHERE confirmation_number = $1`,
        [confirmationNumber]
    );

    if (result.rows.length === 0) {
        throw createError('Contact submission not found', 404);
    }

    res.json({
        success: true,
        data: result.rows[0]
    });
}));

/**
 * GET /api/contact/admin/submissions
 * Get all contact submissions (admin only)
 * Requires authentication and admin role
 */
router.get('/admin/submissions', asyncHandler(async (req: Request, res: Response) => {
    // Note: Add authentication middleware here
    // Example: router.get('/admin/submissions', authenticateToken, requireAdmin, asyncHandler(async...

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;
    const status = req.query.status as string;

    let query = `
        SELECT id, confirmation_number, name, email, phone, subject, 
               message, preferred_contact, attachment_name, status, 
               created_at, updated_at, responded_at, response_message
        FROM contact_submissions
    `;

    const params: any[] = [];
    
    if (status) {
        query += ` WHERE status = $1`;
        params.push(status);
        query += ` ORDER BY created_at DESC LIMIT $2 OFFSET $3`;
        params.push(limit, offset);
    } else {
        query += ` ORDER BY created_at DESC LIMIT $1 OFFSET $2`;
        params.push(limit, offset);
    }

    const result = await db.query(query, params);

    // Get total count
    const countQuery = status 
        ? `SELECT COUNT(*) FROM contact_submissions WHERE status = $1`
        : `SELECT COUNT(*) FROM contact_submissions`;
    const countParams = status ? [status] : [];
    const countResult = await db.query(countQuery, countParams);
    const totalCount = parseInt(countResult.rows[0].count);

    res.json({
        success: true,
        data: result.rows,
        pagination: {
            page,
            limit,
            total: totalCount,
            totalPages: Math.ceil(totalCount / limit)
        }
    });
}));

/**
 * PATCH /api/contact/admin/:id/status
 * Update contact submission status (admin only)
 */
router.patch('/admin/:id/status', asyncHandler(async (req: Request, res: Response) => {
    // Note: Add authentication middleware here

    const { id } = req.params;
    const { status, responseMessage } = req.body;

    const validStatuses = ['new', 'in_progress', 'responded', 'closed'];
    if (!validStatuses.includes(status)) {
        throw createError('Invalid status', 400);
    }

    const result = await db.query(
        `UPDATE contact_submissions
         SET status = $1, 
             response_message = $2,
             responded_at = CASE WHEN $1 = 'responded' THEN NOW() ELSE responded_at END,
             updated_at = NOW()
         WHERE id = $3
         RETURNING id, confirmation_number, status`,
        [status, responseMessage, id]
    );

    if (result.rows.length === 0) {
        throw createError('Contact submission not found', 404);
    }

    res.json({
        success: true,
        message: 'Status updated successfully',
        data: result.rows[0]
    });
}));

export default router;

