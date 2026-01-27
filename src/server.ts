import http from 'http';
import { createApp } from './app';
import { config, validateConfig } from './config';
import { connectDatabase } from './config/database';
import { initializeSocket } from './socket';

const startServer = async (): Promise<void> => {
  try {
    // Validate environment configuration
    validateConfig();

    // Connect to database
    await connectDatabase();

    // Create Express app
    const app = createApp();

    // Create HTTP server
    const server = http.createServer(app);

    // Initialize Socket.io
    initializeSocket(server);

    // Start listening
    server.listen(config.port, () => {
      console.log(`Server running at http://localhost:${config.port}`);
    });

    // Graceful shutdown
    const shutdown = async (signal: string): Promise<void> => {
      console.log(`\nReceived ${signal}. Shutting down gracefully...`);
      server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
