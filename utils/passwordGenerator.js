const generatePassword = require('generate-password');

const generateRandomPassword = (length = 12) => {
  return generatePassword.generate({
    length: length,
    numbers: true,
    symbols: true,
    uppercase: true,
    excludeSimilarCharacters: true,
  });
};
module.exports = generateRandomPassword;