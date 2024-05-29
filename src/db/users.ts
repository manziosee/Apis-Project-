import mongoose, { Schema, Document, model } from 'mongoose';
import jwt from 'jsonwebtoken';

const JWT_SECRET = 'your_secret_key'; // Use a secure key, possibly from environment variables

interface User extends Document {
    email: string;
    username: string;
    authentication: {
      salt: string;
      password: string;
    };
    otp?: {
      code: string;
      expires: Date;
    };
}

// User Config
const UserSchema = new Schema({
    email: { type: String, required: true },
    username: { type: String, required: true },
    authentication: {
        salt: { type: String, required: true },
        password: { type: String, required: true, select: false }
    },
    otp: {
        code: { type: String },
        expires: { type: Date }
    }
});

export const UserModel = model<User>('User', UserSchema);

// User Actions
export const getUsers = () => UserModel.find();
export const getUserByEmail = (email: string) => UserModel.findOne({ email });
export const getUserById = (id: string) => UserModel.findById(id);
export const getUserByToken = async (token: string) => {
    const decoded = verifyToken(token) as { userId: string };
    if (decoded && decoded.userId) {
        return getUserById(decoded.userId);
    }
    return null;
};
export const createUser = (values: Record<string, any>) => new UserModel(values).save();
export const deleteUserById = (id: string) => UserModel.findOneAndDelete({ _id: id });
export const updateUserById = (id: string, values: Record<string, any>) => UserModel.findByIdAndUpdate(id, values);

// JWT Verification
export const verifyToken = (token: string) => {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        return null;
    }
};