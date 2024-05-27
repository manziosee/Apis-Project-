import express from 'express';
import http from 'http';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';   
import compression from 'compression';
import cors from 'cors';
import mongoose from 'mongoose';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

import router from './router'; // Ensure this import is correct

const app = express();

// Swagger setup
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Express API with Swagger',
      version: '1.0.0',
      description: 'This is a simple CRUD API application made with Express and documented with Swagger',
    },
    servers: [
      {
        url: 'http://localhost:8080',
      },
    ],
  },
  apis: ['./src/router/*.ts'], // files containing annotations for the Swagger docs
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(cors({
    credentials: true,
}));

app.use(compression());
app.use(cookieParser());
app.use(bodyParser.json());

// Use the router
app.use('/', router()); // Make sure this line is correct

const server = http.createServer(app);

server.listen(8080, () => {
    console.log(`Server is running on http://localhost:8080/`);
});

// MongoDB setup
const MONGO_URI = "mongodb+srv://manzi:2001@cluster0.9lfamjo.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
mongoose.Promise = Promise;
mongoose.connect(MONGO_URI);
mongoose.connection.on('error', (error: Error) => console.log(error));
mongoose.connection.on('connected', () => {
    console.log('Connected to MongoDB successfully');
});