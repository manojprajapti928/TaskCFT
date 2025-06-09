const User = require('../models/user');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
dotenv = require('dotenv');
dotenv.config();

const registerUser = async(req,res)=>{
    try {
        const {firstName,lastName,email,password} = req.body;

       
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password,10);
        const newUser = await User.create({
            firstName,
            lastName,
            email,
            password: hashedPassword
        });

        const token = jwt.sign ({userId:newUser.UserId} , process.env.JWT_SECRET, {
            expiresIn: '1h'
        });
        res.status(201).json({
            message: 'User registered successfully',
            user: {
                id: newUser.UserId,
                firstName: newUser.firstName,
                lastName: newUser.lastName,
                email: newUser.email
            },
            token
        });

    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }


}

const LoginUser = async(req,res)=>{
    try {
        const {email,password} = req.body;

        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const token = jwt.sign({ userId: user.UserId }, process.env.JWT_SECRET, {
            expiresIn: '1h'
        });

        res.status(200).json({
            message: 'Login successful',
            user: {
                id: user.UserId,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email
            },
            token
        });
    } catch (error) {
        console.error('Error logging in user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}


const getUsers = async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: ['UserId', 'firstName', 'lastName', 'email']
        });
        res.status(200).json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}




const forgetPassword = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        // Create a short-lived JWT token (5 min)
        const token = jwt.sign({ userId: user.UserId }, process.env.JWT_SECRET, {
            expiresIn: '5m'
        });

        // Generate reset URL (Frontend must handle this route)
const resetUrl = `http://localhost:3000/reset-password.html?token=${token}`;


        // Send email
        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Password Reset Request',
html: `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; background-color: #f9f9f9; border: 1px solid #e0e0e0; border-radius: 8px;">
    <h2 style="color: #333;">Password Reset Request</h2>
    <p style="font-size: 16px; color: #555;">
      You recently requested to reset your password. Click the button below to reset it. 
      <strong>This link will expire in 5 minutes.</strong>
    </p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="${resetUrl}" style="background-color: #007bff; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">
        Reset Password
      </a>
    </div>
    <p style="font-size: 14px; color: #888;">
      If you didn’t request a password reset, you can ignore this email. Your password will remain unchanged.
    </p>
    <hr style="margin-top: 40px; border: none; border-top: 1px solid #ddd;">
    <p style="font-size: 12px; color: #aaa; text-align: center;">
      &copy; ${new Date().getFullYear()} YourAppName. All rights reserved.
    </p>
  </div>
`
        });

        res.status(200).json({ message: 'Password reset link sent to your email' });

    } catch (error) {
        console.error('Error in forget password:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};


const resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId;

        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        res.status(200).json({ message: 'Password reset successfully' });
        

    } catch (error) {
        console.error('Error in reset password:', error);
        res.status(400).json({ message: 'Invalid or expired token' });
    }
};





 

module.exports ={
    registerUser,
    LoginUser,
    getUsers,
    forgetPassword,
    resetPassword

}