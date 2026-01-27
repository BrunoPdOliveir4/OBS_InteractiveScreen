import { Request, Response } from 'express';
import { authService } from '../services/auth.service';
import { userService } from '../services/user.service';
import { ERROR_MESSAGES } from '../utils/constants';

export class AuthController {
  async handleOAuthCallback(req: Request, res: Response): Promise<void> {
    const { code } = req.query;

    if (!code || typeof code !== 'string') {
      res.status(400).json({ error: ERROR_MESSAGES.AUTH_CODE_REQUIRED });
      return;
    }

    try {
      const tokenResponse = await authService.exchangeCodeForToken(code);
      const { access_token } = tokenResponse;

      const userData = await authService.getTwitchUser(access_token);

      // Find or create user
      const user = await userService.findOrCreateUser(userData.login);

      // Cache user data with token
      const cachedData = {
        ...userData,
        access_token,
        whitelist: user.whitelist,
      };

      const tempId = authService.cacheUserData(cachedData);

      res.redirect(`/profile.html?id=${tempId}`);
    } catch (error) {
      console.error('OAuth callback error:', error);
      res.status(500).json({ error: ERROR_MESSAGES.PROFILE_ERROR });
    }
  }

  getOAuthInfo(_req: Request, res: Response): void {
    const oauthInfo = authService.getOAuthInfo();
    res.json(oauthInfo);
  }

  getProfile(req: Request, res: Response): void {
    const id = req.params.id as string;

    const userData = authService.getCachedUserData(id);
    if (!userData) {
      res.redirect('/login');
      return;
    }

    res.json(userData);
  }

  async getToken(req: Request, res: Response): Promise<void> {
    const { code } = req.body;

    if (!code) {
      res.status(400).json({ error: ERROR_MESSAGES.AUTH_CODE_REQUIRED });
      return;
    }

    try {
      const tokenResponse = await authService.exchangeCodeForToken(code);
      res.redirect(`/profile?access_token=${tokenResponse.access_token}`);
    } catch (error) {
      console.error('Token exchange error:', error);
      res.status(500).json({ error: ERROR_MESSAGES.TOKEN_ERROR });
    }
  }
}

export const authController = new AuthController();
