import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

const JWT_SECRET = 'your_secret_key'; // Use a secure key, possibly from environment variables

// User Config
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true },
  username: { type: String, required: true },
  authentication: {
    password: { type: String, required: true, select: false },
    salt: { type: String, select: false }
  },
});

export const UserModel = mongoose.model('User', UserSchema);

// User Actions
export const getUsers = () => UserModel.find();
export const getUserByEmail = (email: string) => UserModel.findOne({ email });
export const getUserById = (id: string) => UserModel.findById(id);
export const getUserByToken = async (token: string) => {
  const decoded = verifyToken(token) as { userId: string }; // Type assertion added here
  if (decoded && decoded.userId) {
    return getUserById(decoded.userId);
  }
  return null;
};
export const createUser = (values: Record<string, any>) => new UserModel(values).save().then((user) => {
  const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });
  return { user: user.toObject(), token };
});
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