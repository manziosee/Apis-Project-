import express from 'express';
import http from 'http';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';   
import compression from 'compression';
import cors from 'cors';
import mongoose from 'mongoose';

const app = express();

app.use(cors({
    credentials: true,
}));

app.use(compression());
app.use(cookieParser());
app.use(bodyParser.json());

const server = http.createServer(app);

server.listen(5000, () => {
    console.log(`Server is running on http://localhost:5000`);
});

const MONGO_URI = "mongodb+srv://ose:2001@cluster0.hetayxw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"

mongoose.Promise = Promise;
mongoose.connect(MONGO_URI);
mongoose.connection.on('error', (error: Error) => console.log(error));
mongoose.connection.on('connected', () => {
    console.log('Connected to MongoDB successfully');
});