import path from 'path';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import User from '../models/User.js';
import { hashing } from './helpers/hashPass.js';
import mainRouter from './routes/mainRoutes.js';
import cookieParser from 'cookie-parser';

const app = express();
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
const PORT = process.env.PORT || 5000;
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log('connected'))
  .catch((err) => console.log(`Error ${err}`));
app.use(express.json());
app.use(cookieParser());

app.use(mainRouter);
app.listen(PORT, () => {
  console.log(`Running on ${PORT}`);
});
