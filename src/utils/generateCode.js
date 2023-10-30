function generateOTP(length) {
    return Math.floor(10 ** (length - 1) + Math.random() * (10 ** length - 10 ** (length - 1) - 1));
  }
  
  module.exports = { generateOTP };