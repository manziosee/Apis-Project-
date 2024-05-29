import express from 'express';
import { get, merge} from 'lodash';


import { getUserByToken } from '../db/users';

export const isOwner = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
        const { id } = req.params;  // This is the target user ID from the URL parameter
        const currentUserId = get(req, 'identity._id') as unknown as string;  // This should be the current user ID set by previous middleware

        // Logging the IDs for debugging
        console.log("Target User ID:", id);  // Log the target user ID from params
        console.log("Current User ID:", currentUserId);  // Log the current user ID from request identity

        if (!currentUserId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        if (currentUserId.toString() !== id) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        next();
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}


export const isAuthenticated = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
        const token = get(req, 'cookies.OSE-AUTH');
        console.log("Received token:", token);  // Log the received token

        if (!token) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const existingUser = await getUserByToken(token);
        console.log("User from token:", existingUser);  // Log the user retrieved from the token

        if (!existingUser) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        (req as any).identity = existingUser;
        console.log("Request identity after merge:", (req as any).identity);  // Log the request identity after merging

        return next();
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}