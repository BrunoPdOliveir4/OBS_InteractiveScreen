import { Router } from 'express';
import { authController } from '../controllers/auth.controller';

const router = Router();

// OAuth callback - handles Twitch redirect
router.get('/profile', (req, res) => authController.handleOAuthCallback(req, res));

// Get OAuth configuration for client
router.get('/get-oauth-info', (req, res) => authController.getOAuthInfo(req, res));

// Get cached profile data
router.get('/api/profile/:id', (req, res) => authController.getProfile(req, res));

// Exchange code for token
router.post('/get-token', (req, res) => authController.getToken(req, res));

export default router;
