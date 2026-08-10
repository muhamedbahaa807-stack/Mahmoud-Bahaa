import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import mainRouter from './routes/mainRoutes.js';
import cookieParser from 'cookie-parser';
import { errorHandler, notFound } from './utils/middlewares.js';
const app = express();
app.use(
  cors({
    origin: ['http://localhost:5173', 'https://eleman2.vercel.app'],
    credentials: true,
  }),
);
const PORT = process.env.PORT || 5000;
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log('connected'))
  .catch((err) => console.log(`Error ${err}`));
app.use(express.json());
app.use(cookieParser());

app.use(mainRouter);
app.use(notFound);
app.use(errorHandler);
app.listen(PORT, () => {
  console.log(`Running on ${PORT}`);
});
