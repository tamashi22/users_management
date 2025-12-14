const app = require('./app');
const { initializeDatabase } = require('./utils/initializeDatabase');

const port = process.env.PORT || 3000;

/**
 * Start server with database initialization
 */
const startServer = async () => {
  try {
    // Initialize database connection and sync models
    const isInitialized = await initializeDatabase();

    if (!isInitialized) {
      console.error('Failed to initialize database. Exiting...');
      process.exit(1);
    }

    // Start the server
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
};

startServer();
