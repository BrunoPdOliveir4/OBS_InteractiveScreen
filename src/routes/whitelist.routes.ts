import { Router } from 'express';
import { whitelistController } from '../controllers/whitelist.controller';

const router = Router();

// Check if user is whitelisted
router.get('/', (req, res) => whitelistController.checkWhitelist(req, res));

// Add user to whitelist
router.post('/:owner', (req, res) => whitelistController.addToWhitelist(req, res));

// Remove user from whitelist
router.delete('/:owner', (req, res) => whitelistController.removeFromWhitelist(req, res));

export default router;
