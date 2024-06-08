import { compareSync, genSaltSync, hashSync } from "bcrypt";
import { generate } from "otp-generator";
import crypto from 'crypto'


// Function to generate a random password
export function generatePassword(length:number) {
  // Define the character sets
  const upperCase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowerCase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';

  // Combine all character sets
  const allChars = upperCase + lowerCase + numbers ;

  // Function to get a random character from a string
  const getRandomChar = (str:any) => str[Math.floor(crypto.randomInt(0, str.length))];

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
export function GenerateRandom(length: number | 6): string {
  return generate(length, {
    lowerCaseAlphabets: false,
    digits: false,
    upperCaseAlphabets: true,
    specialChars: false,
  });
}

export function HashPassword(password: string): string {
  const salt = genSaltSync(16);
  const hash = hashSync(password, salt);

  return hash;
}

export function CompareHash(password: string, hashed: string): boolean {
  const salt = genSaltSync(16);
  const matched = compareSync(password, hashed);
  return matched;
}
