import { Router } from 'express';
import { userController } from '../controllers/user.controller';

const router = Router();

// Create new user
router.post('/', (req, res) => userController.createUser(req, res));

// Get user by username
router.get('/:username', (req, res) => userController.getUser(req, res));

export default router;
