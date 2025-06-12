import dotenv from "dotenv";
// Load environment variables from .env file
dotenv.config();
export const config = {
    LOGIN_URL: process.env.LOGIN_URL || "https://challenge.sunvoy.com/login",
    API_URL: process.env.API_URL || "https://challenge.sunvoy.com/api/users",
    TOKENS_URL: process.env.TOKENS_URL || "https://challenge.sunvoy.com/settings/tokens",
    SETTINGS_URL: process.env.SETTINGS_URL || "https://api.challenge.sunvoy.com/api/settings",
    SECRET_KEY: process.env.SECRET_KEY || "mys3cr3t",
    USERNAME: process.env.USERNAME || "demo@example.org",
    PASSWORD: process.env.PASSWORD || "test",
};
