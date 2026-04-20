
// import express from 'express';
// import pool from '../db.js'; 
// import bcrypt from 'bcryptjs';
// import jwt from 'jsonwebtoken';
// import dotenv from 'dotenv';
// import crypto from 'crypto';
// import { validate } from 'uuid';
// import { signupSchema } from '../validator/validator.js';
// // import { signupSchema,signinSchema,forgotPasswordSchema,resetPasswordSchema } from '../validator/validator.js';

// dotenv.config();


// // const validate = (schema,data,res) =>{
// //     const {error} = schema.validate(data)
// //     if(error){
// //         return res.status(400).json({message:error.details[0].message})
// //     }
// // }


// // Signup
// export const signup = async (req, res) => {

//     // const validationError = validate(signupSchema,req.body,res)
//     // if(validationError) return;

//     const { name, email, password } = req.body;

//     try {

//         const [user] = await pool.execute("SELECT * FROM users WHERE email = ?", [email]);
//         if (user.length) return res.status(400).json({ message: "Email already exists" });

    
//         const hashedPassword = await bcrypt.hash(password, 10);

      
//         await pool.execute(
//             "INSERT INTO users (name, email, password, role_id) VALUES (?,?,?,?)",
//             [name, email, hashedPassword, 3] 
//         );

//         res.json({ message: "User registered successfully" });
//     } catch (err) {
//         res.status(500).json({ message: err.message });
//     } 
// };




// // Signin

// export const signin = async (req, res) => {
//     const { email, password } = req.body;

//     try {
        
//         const [user] = await pool.execute(`
//             SELECT 
//                 u.id, 
//                 u.name, 
//                 u.email, 
//                 u.password, 
//                 u.role_id,
//                 u.warehouse_id,
//                 u.status,
//                 r.name as role_name,
//                 r.permissions,
//                 w.title as warehouse_name
//             FROM users u
//             LEFT JOIN roles r ON u.role_id = r.id
//             LEFT JOIN warehouse w ON u.warehouse_id = w.id
//             WHERE u.email = ?
//         `, [email]);
        
//         if (!user.length) {
//             return res.status(404).json({ message: "User not found" });
//         }

//         console.log("User from DB:", {
//             id: user[0].id,
//             email: user[0].email,
//             warehouse_id: user[0].warehouse_id,
//             warehouse_name: user[0].warehouse_name
//         });

//         // Check if user is inactive
//         if (user[0].status && user[0].status.trim().toLowerCase() === 'inactive') {
//             return res.status(403).json({ 
//                 message: "Your account is inactive. Please contact support." 
//             });
//         }

//         // Validate password
//         const validPassword = await bcrypt.compare(password, user[0].password);
//         if (!validPassword) {
//             return res.status(400).json({ message: "Invalid password" });
//         }

    
//         let permissions = {};
//         try {
//             if (user[0].permissions) {
//                 permissions = typeof user[0].permissions === 'string' 
//                     ? JSON.parse(user[0].permissions) 
//                     : user[0].permissions;
//             }
//         } catch (e) {
//             console.error('Error parsing permissions:', e);
//             permissions = {};
//         }

        
//         const token = jwt.sign(
//             { 
//                 id: user[0].id,
//                 email: user[0].email,
//                 role_id: user[0].role_id,
//                 role: user[0].role_name,
//                 status: user[0].status,
//                 warehouse_id: user[0].warehouse_id 
//             }, 
//             process.env.JWT_SECRET, 
//             { expiresIn: "1d" }
//         );

    
//         res.json({
//             token, 
//             user: { 
//                 id: user[0].id, 
//                 name: user[0].name,
//                 email: user[0].email,
//                 role_id: user[0].role_id,
//                 role: user[0].role_name,
//                 roleName: user[0].role_name,
//                 status: user[0].status,
//                 warehouse_id: user[0].warehouse_id,  
//                 warehouse_name: user[0].warehouse_name,
//                 permissions: permissions
//             }
//         });

//         console.log("✅ Login successful. Warehouse:", user[0].warehouse_name);

//     } catch (err) {
//         console.error('❌ Login error:', err);
//         res.status(500).json({ message: "Internal server error" });
//     }
// };


// // Forgot Password
// export const forgotPassword = async (req, res) => {

//     // const validationError = validate(forgotPasswordSchema,req.body,res)
//     // if (validationError) return;

//     const { email } = req.body;
//     try {
//         const [user] = await pool.execute("SELECT * FROM users WHERE email = ?", [email]);
//         if (!user.length) return res.status(404).json({ message: "User not found" });

//         const resetToken = crypto.randomBytes(32).toString("hex");
//         await pool.execute("UPDATE users SET reset_token = ? WHERE email = ?", [resetToken, email]);

//         res.json({ message: "Password reset token generated", resetToken });
//     } catch (err) {
//         res.status(500).json({ message: err.message });
//     }
// };


// // Reset Password
// export const resetPassword = async (req, res) => {

//     // const validationError = validate(resetPasswordSchema,req.body,res)
//     // if(validationError) return;

//     const { resetToken, newPassword } = req.body;

//     try {
//         const [user] = await pool.execute("SELECT * FROM users WHERE reset_token = ?", [resetToken]);
//         if (!user.length) return res.status(400).json({ message: "Invalid token" });

//         const hashedPassword = await bcrypt.hash(newPassword, 10);
//         await pool.execute("UPDATE users SET password = ?, reset_token = NULL WHERE reset_token = ?", [hashedPassword, resetToken]);

//         res.json({ message: "Password reset successfully" });
//     } catch (err) {
//         res.status(500).json({ message: err.message });
//     }
// };



import express from 'express';
import pool from '../db.js'; 
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import crypto from 'crypto';
// import { validate } from 'uuid';
// import { signupSchema } from '../validator/validator.js';
// // import { signupSchema,signinSchema,forgotPasswordSchema,resetPasswordSchema } from '../validator/validator.js';
import { sendVerificationEmail } from '../services/emailService.js';


dotenv.config();


// // const validate = (schema,data,res) =>{
// //     const {error} = schema.validate(data)
// //     if(error){
// //         return res.status(400).json({message:error.details[0].message})
// //     }
// // }




// Signup
export const signup = async (req, res) => {
    
// const validationError = validate(signupSchema,req.body,res)
// if(validationError) return;


    const { name, email, password } = req.body;

    try {
        // Check if user already exists
        const [existingUser] = await pool.execute(
            "SELECT * FROM users WHERE email = ?", 
            [email]
        );
        
        if (existingUser.length) {
            return res.status(400).json({ message: "Email already exists" });
        }

      
        const hashedPassword = await bcrypt.hash(password, 10);

        
        const verificationToken = crypto.randomBytes(32).toString("hex");
        const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

        // Insert user with email_verified = false
        await pool.execute(
            `INSERT INTO users (name, email, password, role_id, email_verified, 
             verification_token, verification_token_expiry, status) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [name, email, hashedPassword, 3, false, verificationToken, tokenExpiry, 'inactive']
        );

        // Send verification email
        try {
            await sendVerificationEmail(email, name, verificationToken);
            res.json({ 
                message: "Registration successful! Please check your email to verify your account.",
                email: email
            });
        } catch (emailError) {
            console.error('Email sending failed:', emailError);
            res.status(201).json({ 
                message: "User registered but email verification failed. Please contact support.",
                email: email
            });
        }

    } catch (err) {
        console.error('Signup error:', err);
        res.status(500).json({ message: err.message });
    } 
};

// Verify Email
export const verifyEmail = async (req, res) => {
    const { token } = req.params;

    try {
        const [user] = await pool.execute(
            `SELECT * FROM users 
             WHERE verification_token = ? 
             AND verification_token_expiry > NOW()`,
            [token]
        );

        if (!user.length) {
            return res.status(400).json({ 
                message: "Invalid or expired verification token" 
            });
        }

        // Update user as verified and active
        await pool.execute(
            `UPDATE users 
             SET email_verified = true, 
                 status = 'active',
                 verification_token = NULL, 
                 verification_token_expiry = NULL 
             WHERE id = ?`,
            [user[0].id]
        );

        res.json({ 
            message: "Email verified successfully! You can now sign in.",
            verified: true
        });

    } catch (err) {
        console.error('Email verification error:', err);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Resend Verification Email
export const resendVerification = async (req, res) => {
    const { email } = req.body;

    try {
        const [user] = await pool.execute(
            "SELECT * FROM users WHERE email = ?", 
            [email]
        );

        if (!user.length) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user[0].email_verified) {
            return res.status(400).json({ message: "Email already verified" });
        }

        // Generate new verification token
        const verificationToken = crypto.randomBytes(32).toString("hex");
        const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

        await pool.execute(
            `UPDATE users 
             SET verification_token = ?, 
                 verification_token_expiry = ? 
             WHERE email = ?`,
            [verificationToken, tokenExpiry, email]
        );

        // Send verification email
        await sendVerificationEmail(email, user[0].name, verificationToken);

        res.json({ 
            message: "Verification email sent successfully! Please check your inbox." 
        });

    } catch (err) {
        console.error('Resend verification error:', err);
        res.status(500).json({ message: "Failed to resend verification email" });
    }
};

// Signin (Updated)
export const signin = async (req, res) => {
    const { email, password } = req.body;

    try {
        const [user] = await pool.execute(`
            SELECT 
                u.id, 
                u.name, 
                u.email, 
                u.password, 
                u.role_id,
                u.warehouse_id,
                u.status,
                u.email_verified,
                r.name as role_name,
                r.permissions,
                w.title as warehouse_name
            FROM users u
            LEFT JOIN roles r ON u.role_id = r.id
            LEFT JOIN warehouse w ON u.warehouse_id = w.id
            WHERE u.email = ?
        `, [email]);
        
        if (!user.length) {
            return res.status(404).json({ message: "User not found" });
        }

        // Validate password first
        const validPassword = await bcrypt.compare(password, user[0].password);
        if (!validPassword) {
            return res.status(400).json({ message: "Invalid password" });
        }

        // Check if email is verified
        if (!user[0].email_verified) {
            return res.status(403).json({ 
                message: "Please verify your email before signing in",
                emailVerified: false,
                email: user[0].email
            });
        }

        // Check if user is inactive
        if (user[0].status && user[0].status.trim().toLowerCase() === 'inactive') {
            return res.status(403).json({ 
                message: "Your account is inactive. Please contact support." 
            });
        }

        // Parse permissions
        let permissions = {};
        try {
            if (user[0].permissions) {
                permissions = typeof user[0].permissions === 'string' 
                    ? JSON.parse(user[0].permissions) 
                    : user[0].permissions;
            }
        } catch (e) {
            console.error('Error parsing permissions:', e);
            permissions = {};
        }

    
        const token = jwt.sign(
            { 
                id: user[0].id,
                email: user[0].email,
                role_id: user[0].role_id,
                role: user[0].role_name,
                status: user[0].status,
                warehouse_id: user[0].warehouse_id 
            }, 
            process.env.JWT_SECRET, 
            { expiresIn: "1d" }
        );

        res.json({
            token, 
            user: { 
                id: user[0].id, 
                name: user[0].name,
                email: user[0].email,
                role_id: user[0].role_id,
                role: user[0].role_name,
                roleName: user[0].role_name,
                status: user[0].status,
                warehouse_id: user[0].warehouse_id,  
                warehouse_name: user[0].warehouse_name,
                permissions: permissions,
                emailVerified: user[0].email_verified
            }
        });

    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Forgot Password
export const forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const [user] = await pool.execute("SELECT * FROM users WHERE email = ?", [email]);
        if (!user.length) return res.status(404).json({ message: "User not found" });

        const resetToken = crypto.randomBytes(32).toString("hex");
        await pool.execute("UPDATE users SET reset_token = ? WHERE email = ?", [resetToken, email]);

        res.json({ message: "Password reset token generated", resetToken });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Reset Password
export const resetPassword = async (req, res) => {
    const { resetToken, newPassword } = req.body;

    try {
        const [user] = await pool.execute("SELECT * FROM users WHERE reset_token = ?", [resetToken]);
        if (!user.length) return res.status(400).json({ message: "Invalid token" });

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await pool.execute("UPDATE users SET password = ?, reset_token = NULL WHERE reset_token = ?", [hashedPassword, resetToken]);

        res.json({ message: "Password reset successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};