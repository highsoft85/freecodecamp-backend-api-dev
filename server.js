const app = require('./app');

require('dotenv').config();

// Basic Configuration
const port = process.env.PORT || 3000;

// UncaughtException Error
process.on('uncaughtException', (err) => {
  console.log(`Error: ${err.message}`);
  process.exit(1);
});

const server = app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});

// Unhandled Promise Rejection
process.on('unhandledRejection', (err) => {
  console.log(`Error: ${err.message}`);
  server.close(() => {
      process.exit(1);
  });
});
