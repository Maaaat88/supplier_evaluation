import { Router } from 'express';
import { loginSchema } from 'shared';
import { requireAuth } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { setAuthCookie, clearAuthCookie } from '../../lib/cookies.js';
import { getCurrentUser, login } from './auth.service.js';

export const authRouter = Router();

authRouter.post('/login', validate(loginSchema), async (req, res, next) => {
  try {
    const { token, user } = await login(req.body);
    setAuthCookie(res, token);
    res.json(user);
  } catch (err) {
    next(err);
  }
});

authRouter.post('/logout', (_req, res) => {
  clearAuthCookie(res);
  res.status(204).send();
});

authRouter.get('/me', requireAuth, async (req, res, next) => {
  try {
    const user = await getCurrentUser(req.user!.id);
    res.json(user);
  } catch (err) {
    next(err);
  }
});
