import express from 'express';
import { get } from 'lodash';
import { getUserByEmail, createUser, UserModel } from '../db/users';
import { random, authentication } from '../helpers';
import jwt from 'jsonwebtoken';

const JWT_SECRET = 'your_secret_key'; // Use a secure key, possibly from environment variables

const generateJWTToken = (user: any) => {
    return jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });
};

export const login = async (req: express.Request, res: express.Response) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.sendStatus(400);
        }

        const user = await getUserByEmail(email).select('+authentication.salt +authentication.password');
        if (!user || !user.authentication) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (!user.authentication.salt || !user.authentication.password) {
            return res.status(500).json({ message: 'Authentication data missing' });
        }

        const hashedPassword = authentication(user.authentication.salt, password);
        if (hashedPassword !== user.authentication.password) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = generateJWTToken(user);

        res.cookie('OSE-AUTH', token, {
            domain: 'localhost',
            path: '/',
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
        });

        return res.status(200).json({ message: 'Login successful' });
    } catch (error) {
        console.log(error);
        return res.sendStatus(500);
    }
};

export const register = async (req: express.Request, res: express.Response) => {
    try {
        const { email, username, password } = req.body;

        if (!email || !username || !password) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const existingUser = await getUserByEmail(email);

        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const salt = random();
        const user = await createUser({
            email,
            username,
            authentication: {
                salt,
                password: authentication(salt, password),
            },
        });

        const token = generateJWTToken(user);

        res.cookie('OSE-AUTH', token, {
            domain: 'localhost',
            path: '/',
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
        });

        return res.status(201).json({ message: 'User registered successfully', user: user.toObject() });
    } catch (error) {
        console.log(error);
        return res.sendStatus(500);
    }
};
