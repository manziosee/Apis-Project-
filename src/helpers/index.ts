import crypto from 'crypto';

const JWT_SECRET = 'your_secret_key'; // Use a secure key, possibly from environment variables

export const random = () => crypto.randomBytes(128).toString('base64');
export const authentication = (salt: string, password: string) => {
    return crypto.createHmac('sha256', [salt, password].join('/')).update(JWT_SECRET).digest('hex');
};




export const generateOTP = (length = 6) => {
    let otp = '';
    for (let i = 0; i < length; i++) {
        otp += Math.floor(Math.random() * 10); // Generates a random digit from 0 to 9
    }
    return otp;
};