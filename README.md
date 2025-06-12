# Sunvoy API Challenge

This project is a solution to the Full Stack Engineer Challenge provided by Sunvoy. It aims to programmatically interact with the Sunvoy legacy application to fetch a list of users and the currently authenticated user's details.

# Requirements

Node.js (LTS Version 24.2.0): Make sure to have Node.js installed on your system.
npm: Used to install dependencies.

# Run the Project

To run the script, use the following command:
npm run start

# The script will:

Fetch the CSRF token (nonce) from the login page.

Perform a login using the provided credentials.

Fetch the users from the API (users and setting) and append the authenticated user's details.

Save the result in a users.json file in the project directory.

# Video Demo

You can view the demo of the script in action [here](https://www.loom.com/share/8bc0b054029349f4a67c643540fb3305?sid=06968f14-b6b3-4810-a6fc-d74a90a4e9b6).
