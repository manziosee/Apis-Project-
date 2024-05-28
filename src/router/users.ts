import express from 'express';

// Importing controllers and middleware
import { getAllUsers, deleteUser } from '../controllers/users';
import { isAuthenticated, isOwner } from '../middlewares';
import { requireAuth } from '../middlewares/authMiddleware';
import { getUsers } from '../db/users'; // Assuming this path is correct

export default (router: express.Router) => {
    // Using requireAuth middleware and custom async handler for '/users' route
    router.get('/users', requireAuth, async (req, res) => {
        const users = await getUsers(); // Using getUsers from db/users
        res.json(users);
    });

    // Keeping the existing delete route with its middleware
    router.delete('/users/:id', isAuthenticated, isOwner, deleteUser);
};