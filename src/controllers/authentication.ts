import express from 'express';

import { getUserByEmail, createUser } from '../db/users';
import { random, authentication } from '../helpers';


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
        const salt = random();
        if (user.authentication) {
            user.authentication.salt = salt;
            user.authentication.password = authentication(salt, user._id.toString());
        }

        await user.save();

        if (user.authentication && 'jwttoken' in user.authentication) {
            const token = user.authentication.jwttoken; // Assuming the JWT token is stored here
            res.cookie('OSE-AUTH', token, { domain: 'localhost', path: '/'});
        }

        return res.status(200).json({ message: 'Login successful' });
    } catch (error) {
        console.log(error);
        return res.sendStatus(500);
    }
}


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
    const User = await createUser({
        email,
        username,
        authentication: {
            salt,
            password: authentication(salt, password), 
            
        },
    });
    return res.status(201).json({
        message: 'User registered successfully',
        user: User
    });
 
    } catch (error) {
        console.log(error);
        return res.sendStatus(500);
    }
}
       
   

