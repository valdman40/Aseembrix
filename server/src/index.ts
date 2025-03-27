import express, { Request, Response } from 'express';
import https from 'https';
import fs from 'fs';
import path from 'path';
import bodyParser from 'body-parser';
import cors from 'cors';

import authRoutes from './routes/auth';
import tasksRoutes from './routes/tasks';

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Mount the auth routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', tasksRoutes);

// A simple test route
app.get('/', (req: Request, res: Response) => {
  res.send('Hello from Assembrix backend!');
});

// Define SSL certificate options (in order to use HTTPS)
// The certificates are stored in the certs folder
const certsPath = path.join(__dirname, 'certs');
const options = {
  key: fs.readFileSync(path.join(certsPath, 'server.key')),
  cert: fs.readFileSync(path.join(certsPath, 'server.cert'))
};

// Create and start HTTPS server on port 3001
https.createServer(options, app).listen(3001, '0.0.0.0',() => {
  console.log(`HTTP Server running at http://0.0.0.0:3001`);
});