import dotenv from "dotenv";

dotenv.config();

console.log('Testing environment variables:');
console.log('MONGODB_URI:', process.env.MONGODB_URI);