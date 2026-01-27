import { Router, Request, Response } from 'express';
import path from 'path';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import whitelistRoutes from './whitelist.routes';

const router = Router();

// Mount route modules
router.use('/', authRoutes);
router.use('/user', userRoutes);
router.use('/whitelist', whitelistRoutes);

// Static page routes
router.get('/', (_req: Request, res: Response) => {
  res.redirect('/login');
});

router.get('/login', (_req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '../../public', 'login.html'));
});

router.get('/editor', (_req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '../../public', 'index.html'));
});

router.get('/show', (_req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '../../public', 'show.html'));
});

export default router;
