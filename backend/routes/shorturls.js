const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const urlDatabase = {}; // Simple in-memory storage

// POST /shorturls
router.post('/', (req, res, next) => {
  try {
    // Validate input
    if (!req.body.url) {
      const error = new Error('URL is required');
      error.status = 400;
      throw error;
    }

    // Validate URL format
    try {
      new URL(req.body.url);
    } catch (err) {
      const error = new Error('Invalid URL format');
      error.status = 400;
      throw error;
    }

    // Create short URL
    const shortCode = req.body.shortcode || uuidv4().substr(0, 6);
    const validity = req.body.validity || 30; // minutes
    
    if (urlDatabase[shortCode]) {
      const error = new Error('Shortcode already exists');
      error.status = 409;
      throw error;
    }

    const expiry = new Date(Date.now() + validity * 60000);
    
    urlDatabase[shortCode] = {
      originalUrl: req.body.url,
      createdAt: new Date(),
      expiry,
      clicks: 0,
      clickData: []
    };

    res.status(201).json({
      shortLink: `http://localhost:3000/${shortCode}`,
      expiry: expiry.toISOString()
    });

  } catch (err) {
    next(err); // Pass to error handler
  }
});

// GET /:shortcode
router.get('/:shortcode', (req, res, next) => {
  try {
    const { shortcode } = req.params;
    const urlEntry = urlDatabase[shortcode];

    if (!urlEntry) {
      const error = new Error('Short URL not found');
      error.status = 404;
      throw error;
    }

    if (new Date(urlEntry.expiry) < new Date()) {
      const error = new Error('Short URL expired');
      error.status = 410;
      throw error;
    }

    // Update stats
    urlEntry.clicks++;
    urlEntry.clickData.push({
      timestamp: new Date(),
      ip: req.ip,
      referrer: req.get('Referrer') || 'direct'
    });

    res.redirect(301, urlEntry.originalUrl);

  } catch (err) {
    next(err);
  }
});

// GET /:shortcode/stats
router.get('/:shortcode/stats', (req, res, next) => {
  try {
    const { shortcode } = req.params;
    const urlEntry = urlDatabase[shortcode];

    if (!urlEntry) {
      const error = new Error('Short URL not found');
      error.status = 404;
      throw error;
    }

    res.json({
      shortcode,
      longUrl: urlEntry.originalUrl,
      createdAt: urlEntry.createdAt.toISOString(),
      expiry: urlEntry.expiry.toISOString(),
      clicks: urlEntry.clicks,
      clickData: urlEntry.clickData
    });

  } catch (err) {
    next(err);
  }
});

module.exports = router;