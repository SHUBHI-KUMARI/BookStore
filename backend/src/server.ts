import App from './app';
import database from './config/database';

const PORT = process.env.PORT || 3000;

const application = new App(PORT);

application.listen();

// Handle graceful shutdown
process.on('SIGINT', async () => {
  await database.disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await database.disconnect();
  process.exit(0);
});
