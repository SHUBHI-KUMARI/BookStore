import App from './app';
import database from './config/database';

const PORT = process.env.PORT || 3000;

const application = new App(PORT);

const server = application.listen();

server.on('close', () => {
  console.log('HTTP server closed.');
});

server.on('error', (error) => {
  console.error('HTTP server error:', error);
});

const getActiveHandles = (): unknown[] => {
  const proc = process as NodeJS.Process & {
    _getActiveHandles?: () => unknown[];
  };
  return proc._getActiveHandles ? proc._getActiveHandles() : [];
};

process.on('beforeExit', (code) => {
  const handleNames = getActiveHandles().map((handle) => {
    const typedHandle = handle as { constructor?: { name?: string } };
    return typedHandle.constructor?.name ?? typeof handle;
  });
  const summary = handleNames.length ? handleNames.join(', ') : 'none';
  console.log(`Process beforeExit with code ${code}. Active handles: ${summary}`);
});

process.on('exit', (code) => {
  console.log(`Process exit with code ${code}`);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled rejection:', reason);
});

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('Received SIGINT. Shutting down...');
  await database.disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Received SIGTERM. Shutting down...');
  await database.disconnect();
  process.exit(0);
});
