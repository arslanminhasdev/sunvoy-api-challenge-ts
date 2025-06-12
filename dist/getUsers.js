import fs from "fs";
import fetch from "node-fetch";
import crypto from "crypto";
const { config } = await import("./config.js");
let cookies = "";
// Fetch nonce value
async function fetchNonce() {
  try {
    const response = await fetch(config.LOGIN_URL, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      throw new Error("Failed to fetch login page");
    }
    const html = await response.text();
    const nonceMatch = html.match(/name="nonce" value="([^"]+)"/);
    if (nonceMatch && nonceMatch[1]) {
      const nonce = nonceMatch[1];
      cookies = response.headers.get("set-cookie") || "";
      return nonce;
    } else {
      throw new Error("Nonce not found on login page");
    }
  } catch (error) {
    console.error("Error while fetching nonce:", error);
    throw error;
  }
}
// Login the user
async function loginUser(nonce) {
  try {
    const loginPayload = new URLSearchParams({
      username: config.USERNAME,
      password: config.PASSWORD,
      nonce: nonce,
    });
    const loginResponse = await fetch(config.LOGIN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent":
          "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        Referer: config.LOGIN_URL,
        Origin: config.LOGIN_URL,
        Cookie: cookies,
      },
      body: loginPayload,
      redirect: "manual", // Prevent auto-follow
    });
    if (loginResponse.status !== 302) {
      throw new Error("Login failed, status: " + loginResponse.status);
    }
    cookies += loginResponse.headers.get("set-cookie") || "";
  } catch (error) {
    console.error("Error during login:", error);
    throw error;
  }
}
// Fetch access token
async function fetchAccessToken() {
  try {
    const response = await fetch(config.TOKENS_URL, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookies,
      },
    });
    if (!response.ok) {
      throw new Error("Failed to fetch access token");
    }
    const html = await response.text();
    const accessTokenMatch = html.match(
      /<input[^>]*id="access_token"[^>]*value="([^"]+)"/
    );
    if (accessTokenMatch && accessTokenMatch[1]) {
      return accessTokenMatch[1];
    } else {
      throw new Error("Access token not found");
    }
  } catch (error) {
    console.error("Error while fetching access token:", error);
    throw error;
  }
}
// Generate checkcode
function generateCheckcode(params) {
  const sortedParams = Object.keys(params)
    .sort()
    .map((key) => `${key}=${encodeURIComponent(params[key] || "")}`)
    .join("&");
  const hmac = crypto.createHmac("sha1", config.SECRET_KEY);
  hmac.update(sortedParams);
  return hmac.digest("hex").toUpperCase();
}
// Fetch users data
async function fetchUsers() {
  try {
    const accessToken = await fetchAccessToken();
    const timestamp = Math.floor(Date.now() / 1000);
    const payload = {
      access_token: accessToken,
      apiuser: config.USERNAME,
      language: "en_US",
      openId: "openid456",
      operateId: "op789",
      timestamp: timestamp.toString(),
      userId: "0000f32e-f62b-4f04-9ccf-fc0b8d32a033",
    };
    payload.checkcode = generateCheckcode(payload);
    const usersResponse = await fetch(config.API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Cookie: cookies,
      },
    });
    if (!usersResponse.ok) {
      throw new Error("Failed to fetch users data");
    }
    // Explicitly type users as User[]
    const users = await usersResponse.json(); // Type assertion here
    const settingsResponse = await fetch(config.SETTINGS_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Cookie: cookies,
      },
      body: new URLSearchParams(
        Object.fromEntries(
          Object.entries(payload).map(([key, value]) => [key, String(value)])
        )
      ).toString(),
    });
    if (!settingsResponse.ok) {
      throw new Error("Failed to fetch authenticated user's info");
    }
    // Explicitly type the authenticated user response
    const authenticatedUser = await settingsResponse.json(); // Type assertion here
    users.push(authenticatedUser);
    fs.writeFileSync("users.json", JSON.stringify(users, null, 2));
    console.log("Users data saved to users.json");
  } catch (error) {
    console.error("Error while fetching data:", error);
  }
}
// Main execution
async function main() {
  const nonce = await fetchNonce();
  await loginUser(nonce);
  await fetchUsers();
}
main();
