const User = require('../models/user');
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

    
        res.status(200).json({ message: 'Password reset link sent to your email' });
        
    } catch (error) {
        console.error('Error in forget password:', error);
        res.status(500).json({ message: 'Internal server error' });
        
    }
}



 

module.exports ={
    registerUser,
    LoginUser,
    getUsers

}