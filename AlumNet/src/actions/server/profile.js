'use server';

import { dbConnect } from '@/lib/dbConnect';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';

// Transporter configuration for SMTP
let transporter;
if (process.env.SMTP_HOST) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_PORT === '465',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
} else {
  console.warn("WARNING: SMTP_HOST is not defined in environment variables. Email service is disabled.");
}

export const updateProfile = async (payload) => {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.email) {
      return { success: false, message: 'Unauthorized' };
    }

    const currentEmail = session.user.email;
    const { name, email, image, currentPassword, newPassword } = payload;

    // Find the current user in DB
    const user = await dbConnect('users').findOne({ email: currentEmail });
    if (!user) {
      return { success: false, message: 'User not found' };
    }

    // Check if new email is already taken by another user
    if (email && email !== currentEmail) {
      const emailExists = await dbConnect('users').findOne({ email });
      if (emailExists) {
        return { success: false, message: 'Email already in use by another account' };
      }
    }

    const updates = {};
    if (name) updates.name = name;
    if (email) updates.email = email;
    if (image !== undefined) updates.image = image;

    // Password change logic (using current and new password)
    if (newPassword) {
      if (!currentPassword) {
        return { success: false, message: 'Current password is required to change password' };
      }
      // Validate current password
      const isPasswordCorrect = await bcrypt.compare(currentPassword, user.password);
      if (!isPasswordCorrect) {
        return { success: false, message: 'Current password is incorrect' };
      }

      // Hash new password
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);
      updates.password = hashedNewPassword;
    }

    const result = await dbConnect('users').updateOne(
      { email: currentEmail },
      { $set: updates }
    );

    if (result.modifiedCount > 0 || result.matchedCount > 0) {
      return { 
        success: true, 
        message: 'Profile updated successfully',
        user: { 
          name: name || user.name, 
          email: email || user.email, 
          image: image !== undefined ? image : user.image 
        }
      };
    }

    return { success: true, message: 'No changes made' };
  } catch (error) {
    console.error('Update profile error:', error);
    return { success: false, message: error.message || 'An error occurred during update' };
  }
};

import crypto from 'crypto';

export const sendForgotPasswordCode = async () => {
  try {
    if (!transporter) {
      return { success: false, message: 'Email service is not configured (SMTP settings missing).' };
    }

    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.email) {
      return { success: false, message: 'Unauthorized' };
    }

    const email = session.user.email;
    const name = session.user.name || 'User';

    // Generate 6-digit random code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 2 * 60 * 1000; // 2 minutes from now

    // Generate stateless cryptographic signature
    const secret = process.env.NEXTAUTH_SECRET || 'fallback-secret-key';
    const payloadData = JSON.stringify({ email, code, expiresAt });
    const hash = crypto
      .createHmac('sha256', secret)
      .update(payloadData)
      .digest('hex');
    
    // Combine data and hash into a base64 string
    const resetToken = Buffer.from(
      JSON.stringify({ data: payloadData, hash })
    ).toString('base64');

    // Send email
    const mailOptions = {
      from: `"Next Template Support" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Password Reset Verification Code',
      text: `Hello ${name},\n\nYour password reset verification code is: ${code}\n\nThis code will expire in 2 minutes.`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; max-width: 600px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h2 style="color: #1e293b;">Password Reset Code</h2>
          <p>Hello ${name},</p>
          <p>We received a request to reset your password. Use the verification code below to proceed:</p>
          <div style="background-color: #f1f5f9; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 4px; border-radius: 6px; margin: 20px 0; color: #0f172a;">
            ${code}
          </div>
          <p style="font-size: 14px; color: #ef4444; font-weight: bold;">This code is valid for exactly 2 minutes.</p>
          <p style="font-size: 14px; color: #64748b;">If you did not make this request, you can ignore this email.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return { 
      success: true, 
      message: 'Verification code sent to your email (valid for 2 minutes)', 
      resetToken 
    };
  } catch (error) {
    console.error('Send forgot password code error:', error);
    return { success: false, message: error.message || 'Failed to send verification code' };
  }
};

export const resetPasswordWithCode = async (payload) => {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.email) {
      return { success: false, message: 'Unauthorized' };
    }

    const email = session.user.email;
    const { code, newPassword, resetToken } = payload;

    if (!code || !newPassword || !resetToken) {
      return { success: false, message: 'Verification code, new password, and reset token are required' };
    }

    // Decode and parse the token
    let decoded;
    try {
      decoded = JSON.parse(Buffer.from(resetToken, 'base64').toString('utf-8'));
    } catch (e) {
      return { success: false, message: 'Invalid or corrupt reset token' };
    }

    const { data: rawPayload, hash } = decoded;
    const secret = process.env.NEXTAUTH_SECRET || 'fallback-secret-key';
    
    // Verify signature
    const expectedHash = crypto
      .createHmac('sha256', secret)
      .update(rawPayload)
      .digest('hex');

    if (hash !== expectedHash) {
      return { success: false, message: 'Security validation failed (token signature is invalid)' };
    }

    // Parse token payload details
    const parsedPayload = JSON.parse(rawPayload);
    const { email: emailInToken, code: codeInToken, expiresAt } = parsedPayload;

    // Check expiration (2 minutes limit)
    if (Date.now() > expiresAt) {
      return { success: false, message: 'Verification code has expired (2 minutes limit reached)' };
    }

    // Verify ownership and code matching
    if (emailInToken !== email) {
      return { success: false, message: 'Verification token email mismatch' };
    }

    if (code !== codeInToken) {
      return { success: false, message: 'Invalid verification code' };
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update user password in database
    await dbConnect('users').updateOne(
      { email },
      { $set: { password: hashedNewPassword } }
    );

    return { success: true, message: 'Password updated successfully with verification code' };
  } catch (error) {
    console.error('Reset password with code error:', error);
    return { success: false, message: error.message || 'Failed to reset password' };
  }
};
