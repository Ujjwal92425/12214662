module.exports = {
  port: process.env.PORT || 3000,
  defaultValidity: 30, // minutes
  shortcodeLength: 6,
  allowedShortcodeChars: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
  maxCustomShortcodeLength: 20
};