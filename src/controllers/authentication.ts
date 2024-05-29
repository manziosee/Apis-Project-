import express from 'express';
import jwt from 'jsonwebtoken';
import { getUserByEmail, createUser, UserModel } from '../db/users';
import { random, authentication, validateEmail, validatePassword, generateOTP } from '../helpers';

// Use environment variable for JWT secret
const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';

const generateJWTToken = (user: any) => {
    return jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });
};

export const register = async (req: express.Request, res: express.Response) => {
    const { email, username, password, phoneNumber } = req.body;

    // Debugging logs
    console.log('Email:', email, 'Email valid:', validateEmail(email));
console.log('Password:', password, 'Password valid:', validatePassword(password));
console.log('Phone number:', phoneNumber, 'Phone number type:', typeof phoneNumber);

    if (!validateEmail(email) || !validatePassword(password) || typeof phoneNumber !== 'string') {
        return res.status(400).json({ message: 'Validation failed or phone number is required' });
    }

    const existingUser = await getUserByEmail(email);
    if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
    }

    const salt = random();
    const hashedPassword = authentication(salt, password);
    const otp = generateOTP();
    const otpExpires = new Date(new Date().getTime() + 300000); // OTP expires in 5 minutes

    const user = await createUser({
        email,
        username,
        phoneNumber,
        authentication: { salt, password: hashedPassword },
        otp: { code: otp, expires: otpExpires }
    });

    const token = generateJWTToken(user);

    res.cookie('OSE-AUTH', token, {
        domain: 'localhost',
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
    });

    return res.status(201).json({ message: 'User registered successfully', user: user.toObject(), otp });
};

export const login = async (req: express.Request, res: express.Response) => {
    const { email, password, phoneNumber } = req.body;

    if (!email || !password || typeof phoneNumber !== 'string') {
        return res.status(400).json({ message: 'Missing required fields or invalid phone number' });
    }
    
    // Fetch user by email and select the otp field along with authentication details
    const user = await getUserByEmail(email).select('+authentication.salt +authentication.password +otp.code +otp.expires +otp');

    if (!user || !user.authentication || authentication(user.authentication.salt as string, password) !== user.authentication.password) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (!user.otp || new Date() > new Date(user.otp.expires)) {
        return res.status(400).json({ message: 'OTP expired' });
    }

    const otp = generateOTP();
    user.otp.code = otp;
    user.otp.expires = new Date(new Date().getTime() + 300000); // Reset OTP expiration
    await user.save();

    const token = generateJWTToken(user);

    res.cookie('OSE-AUTH', token, {
        domain: 'localhost',
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
    });

    return res.status(200).json({ message: 'Login successful', otp });
};