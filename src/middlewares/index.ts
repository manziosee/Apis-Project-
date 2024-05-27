import express from 'express';
import { get, merge} from 'lodash';

import { getUserByToken } from '../db/users';

export const isAuthenticated = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
    const token = get(req, 'cookies.OSE-AUTH');
    
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    const user = await getUserByToken(token);
    if (!user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    merge(req, { user });

    return next();
}catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Internal server error' });
}
}
