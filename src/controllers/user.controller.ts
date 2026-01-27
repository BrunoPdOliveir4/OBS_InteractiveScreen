import { Request, Response } from 'express';
import { userService } from '../services/user.service';
import { ERROR_MESSAGES } from '../utils/constants';

export class UserController {
  async createUser(req: Request, res: Response): Promise<void> {
    const { username } = req.body;

    if (!username) {
      res.status(400).json({ error: ERROR_MESSAGES.USERNAME_REQUIRED });
      return;
    }

    try {
      const newUser = await userService.createUser(username);
      res.status(201).json(newUser);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  async getUser(req: Request, res: Response): Promise<void> {
    const username = req.params.username as string;

    try {
      const user = await userService.findByUsername(username);
      if (!user) {
        res.status(404).json({ error: ERROR_MESSAGES.OWNER_NOT_FOUND });
        return;
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }
}

export const userController = new UserController();
