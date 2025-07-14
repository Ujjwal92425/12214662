const { v4: uuidv4 } = require('uuid');
const config = require('../config');

class UrlModel {
  constructor() {
    this.urls = new Map(); 
    this.clicks = new Map(); 
  }

  generateShortcode() {
    let result = '';
    const characters = config.allowedShortcodeChars;
    for (let i = 0; i < config.shortcodeLength; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  }

  isValidShortcode(shortcode) {
    const regex = new RegExp(`^[${config.allowedShortcodeChars}]{1,${config.maxCustomShortcodeLength}}$`);
    return regex.test(shortcode);
  }

  createShortUrl(longUrl, validity = config.defaultValidity, customShortcode = null) {
    const now = new Date();
    const expiry = new Date(now.getTime() + validity * 60000);
    
    let shortcode = customShortcode;
    if (!shortcode) {
      shortcode = this.generateShortcode();
    } else if (!this.isValidShortcode(shortcode)) {
      throw new Error('Invalid shortcode format');
    }
    
    if (this.urls.has(shortcode)) {
      throw new Error('Shortcode already exists');
    }
    
    const urlData = {
      shortcode,
      longUrl,
      createdAt: now.toISOString(),
      expiry: expiry.toISOString(),
      clicks: 0
    };
    
    this.urls.set(shortcode, urlData);
    this.clicks.set(shortcode, []);
    
    return urlData;
  }

  getUrl(shortcode) {
    const urlData = this.urls.get(shortcode);
    if (!urlData) {
      throw new Error('Shortcode not found');
    }
    
    if (new Date(urlData.expiry) < new Date()) {
      throw new Error('Shortcode has expired');
    }
    
    return urlData;
  }

  recordClick(shortcode, referrer, ip) {
    const urlData = this.urls.get(shortcode);
    if (!urlData) return;
    
    urlData.clicks += 1;
    const clickData = {
      timestamp: new Date().toISOString(),
      referrer: referrer || 'direct',
      ip,
      
      location: this.getCoarseLocation(ip)
    };
    
    this.clicks.get(shortcode).push(clickData);
  }

  getCoarseLocation(ip) {
    // Simplified - in a real app you'd use a geoip service
    return ip.startsWith('192.168.') ? 'local' : 'unknown';
  }

  getStats(shortcode) {
    const urlData = this.urls.get(shortcode);
    if (!urlData) {
      throw new Error('Shortcode not found');
    }
    
    return {
      ...urlData,
      clickData: this.clicks.get(shortcode) || []
    };
  }
}

module.exports = new UrlModel();