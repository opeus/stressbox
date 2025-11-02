# Stress Box

A simple web app to help manage stress by organizing thoughts into visual boxes with a treemap layout.

## Features

- 🎨 Visual treemap layout for organizing stress items
- 🌡️ Temperature rating system (green = calm, yellow = moderate, red = high stress)
- 📝 Each box contains a heading and a simple list of items
- 🔐 Simple password protection (password: `dandan`)
- 💾 In-memory data storage (data resets on server restart)
- 📱 Responsive design

## Local Development

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm start
```

3. Open your browser to `http://localhost:3000`

4. Login with password: `dandan`

## Deploy to Railway

1. Push this code to a GitHub repository

2. Go to [Railway](https://railway.app)

3. Click "New Project" → "Deploy from GitHub repo"

4. Select your repository

5. Railway will automatically detect the Node.js app and deploy it

6. Once deployed, Railway will provide you with a URL to access your app

## Usage

- **Login**: Use password `dandan`
- **Add Box**: Click "Add New Box" button
- **Edit Box**: Click on any box to edit it
- **Delete Box**: Click the × button in the top-right corner of a box
- **Temperature Slider**: Adjust from green (calm) to red (high stress)
- **Size Slider**: Control the size of each box in the treemap
- **List Items**: Add multiple items (one per line) in each box

## Notes

- Data is stored in memory and will be lost when the server restarts
- For production use, consider adding a database (MongoDB, PostgreSQL, etc.)
- The password is hardcoded for simplicity - for real use, implement proper authentication
