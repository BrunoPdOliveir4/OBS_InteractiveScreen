import { Request, Response } from 'express';
import { whitelistService } from '../services/whitelist.service';
import { authService } from '../services/auth.service';
import { ERROR_MESSAGES } from '../utils/constants';

export class WhitelistController {
  async addToWhitelist(req: Request, res: Response): Promise<void> {
    const { usernameToAdd, tempId } = req.body;
    const { owner } = req.params;

    if (!owner || !usernameToAdd) {
      res.status(400).json({
        error: 'Both ownerUsername and usernameToAdd are required.',
      });
      return;
    }

    // Verify ownership
    const cachedUser = authService.getCachedUserData(tempId);
    if (!cachedUser || cachedUser.login !== owner) {
      res.status(403).json({
        error: 'You are not authorized to add users to this whitelist.',
      });
      return;
    }

    try {
      const result = await whitelistService.addToWhitelist(owner, usernameToAdd);

      if (!result.success) {
        res.status(400).json({ error: result.error });
        return;
      }

      res.status(200).json(result.data);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  async removeFromWhitelist(req: Request, res: Response): Promise<void> {
    const { usernameToRemove, tempId } = req.body;
    const { owner } = req.params;

    if (!owner || !usernameToRemove) {
      res.status(400).json({
        error: 'Both ownerUsername and usernameToRemove are required.',
      });
      return;
    }

    // Verify ownership
    const cachedUser = authService.getCachedUserData(tempId);
    if (!cachedUser || cachedUser.login !== owner) {
      res.status(403).json({
        error: 'You are not authorized to remove users from this whitelist.',
      });
      return;
    }

    try {
      const result = await whitelistService.removeFromWhitelist(owner, usernameToRemove);

      if (!result.success) {
        const statusCode = result.error === ERROR_MESSAGES.CANNOT_REMOVE_SELF ? 400 : 404;
        res.status(statusCode).json({ error: result.error });
        return;
      }

      res.status(200).json(result.data);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  async checkWhitelist(req: Request, res: Response): Promise<void> {
    const { username, check } = req.query;

    if (!username || !check || typeof username !== 'string' || typeof check !== 'string') {
      res.status(400).json({ error: ERROR_MESSAGES.WHITELIST_PARAMS_REQUIRED });
      return;
    }

    try {
      const isWhitelisted = await whitelistService.checkWhitelist(check, username);
      res.status(200).json({ whitelisted: isWhitelisted });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }
}

export const whitelistController = new WhitelistController();
