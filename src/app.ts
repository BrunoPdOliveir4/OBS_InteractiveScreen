import express, { Application } from 'express';
import path from 'path';
import routes from './routes';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware';

export const createApp = (): Application => {
  const app = express();

  // Body parsing middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Static files
  app.use(express.static(path.join(__dirname, '../public')));

  // API routes
  app.use('/', routes);

  // Error handling
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
