import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import { env } from './env.js';
import { errorHandler } from './middleware/errorHandler.js';
import { authRouter } from './modules/auth/auth.routes.js';
import { criteriaRouter } from './modules/criteria/criteria.routes.js';
import { evaluationsRouter } from './modules/evaluations/evaluations.routes.js';
import { suppliersRouter } from './modules/suppliers/suppliers.routes.js';

export const app = express();

app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRouter);
app.use('/api/suppliers', suppliersRouter);
app.use('/api/criteria', criteriaRouter);
app.use('/api/evaluations', evaluationsRouter);

app.use(errorHandler);
