"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompareHash = exports.HashPassword = exports.GenerateRandom = exports.generatePassword = void 0;
const bcrypt_1 = require("bcrypt");
const otp_generator_1 = require("otp-generator");
const crypto_1 = __importDefault(require("crypto"));
// Function to generate a random password
function generatePassword(length) {
    // Define the character sets
    const upperCase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowerCase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    // Combine all character sets
    const allChars = upperCase + lowerCase + numbers;
    // Function to get a random character from a string
    const getRandomChar = (str) => str[Math.floor(crypto_1.default.randomInt(0, str.length))];
    // Ensure password contains at least one character from each set
    let password = '';
    password += getRandomChar(upperCase);
    password += getRandomChar(lowerCase);
    password += getRandomChar(numbers);
    // Fill the rest of the password with random characters from all sets
    for (let i = password.length; i < length; i++) {
        password += getRandomChar(allChars);
    }
    // Shuffle the password to ensure randomness
    password = password.split('').sort(() => 0.5 - Math.random()).join('');
    return password;
}
exports.generatePassword = generatePassword;
function GenerateRandom(length) {
    return (0, otp_generator_1.generate)(length, {
        lowerCaseAlphabets: false,
        digits: false,
        upperCaseAlphabets: true,
        specialChars: false,
    });
}
exports.GenerateRandom = GenerateRandom;
function HashPassword(password) {
    const salt = (0, bcrypt_1.genSaltSync)(16);
    const hash = (0, bcrypt_1.hashSync)(password, salt);
    return hash;
}
exports.HashPassword = HashPassword;
function CompareHash(password, hashed) {
    const salt = (0, bcrypt_1.genSaltSync)(16);
    const matched = (0, bcrypt_1.compareSync)(password, hashed);
    return matched;
}
exports.CompareHash = CompareHash;
