import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { ERROR_MESSAGES } from '../utils/constants';

export const requireAuth = (req: Request, res: Response, next: NextFunction): void => {
  const tempId = req.headers['x-temp-id'] as string || req.body?.tempId;

  if (!tempId) {
    res.status(401).json({ error: ERROR_MESSAGES.UNAUTHORIZED });
    return;
  }

  const userData = authService.getCachedUserData(tempId);
  if (!userData) {
    res.status(401).json({ error: ERROR_MESSAGES.UNAUTHORIZED });
    return;
  }

  // Attach user data to request
  (req as Request & { user: typeof userData }).user = userData;
  next();
};

export const requireOwnership = (ownerParam: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const tempId = req.body?.tempId;
    const owner = req.params[ownerParam];

    if (!tempId || !owner) {
      res.status(401).json({ error: ERROR_MESSAGES.UNAUTHORIZED });
      return;
    }

    const userData = authService.getCachedUserData(tempId);
    if (!userData || userData.login !== owner) {
      res.status(403).json({
        error: 'You are not authorized to perform this action.',
      });
      return;
    }

    next();
  };
};
