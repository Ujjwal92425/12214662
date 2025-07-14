const express = require('express');
const app = express();

// Middleware (must come first)
app.use(express.json());

// Routes
const shorturlsRouter = require('./routes/shorturls');
app.use('/shorturls', shorturlsRouter);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Endpoint not found',
    status: 404 
  });
});

// Error handler (must come last)
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    status: err.status || 500
  });
});

// Start server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});