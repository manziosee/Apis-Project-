import express from 'express';
import { get, merge} from 'lodash';


import { getUserByToken } from '../db/users';

export const isOwner = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
        const { id } = req.params;
        const currentUserId = get(req, 'identity._id') as unknown as string;

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
    
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    const existingUser = await getUserByToken(token);
    
    if (!existingUser){
        return res.status(401).json({ message: 'Unauthorized' });
    }
     
    merge(req, { identity: existingUser });

    return next();
}catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Internal server error' });
}
}