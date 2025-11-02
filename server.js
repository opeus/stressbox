const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Simple in-memory data storage
let stressBoxes = [
  {
    id: 1,
    heading: 'Work Projects',
    items: ['Finish report', 'Team meeting prep'],
    temperature: 50,
    size: 30
  },
  {
    id: 2,
    heading: 'Personal Tasks',
    items: ['Grocery shopping', 'Call mom'],
    temperature: 30,
    size: 20
  }
];

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  secret: 'stress-box-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 } // 24 hours
}));

// Serve static files
app.use(express.static('public'));

// Simple password check middleware
function requireAuth(req, res, next) {
  if (req.session.authenticated) {
    next();
  } else {
    res.status(401).json({ error: 'Not authenticated' });
  }
}

// Login endpoint
app.post('/api/login', (req, res) => {
  const { password } = req.body;
  if (password === 'dandan') {
    req.session.authenticated = true;
    res.json({ success: true });
  } else {
    res.status(401).json({ error: 'Invalid password' });
  }
});

// Check auth status
app.get('/api/auth-status', (req, res) => {
  res.json({ authenticated: !!req.session.authenticated });
});

// Logout endpoint
app.post('/api/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

// Get all boxes
app.get('/api/boxes', requireAuth, (req, res) => {
  res.json(stressBoxes);
});

// Add new box
app.post('/api/boxes', requireAuth, (req, res) => {
  const newBox = {
    id: Date.now(),
    heading: req.body.heading || 'New Box',
    items: req.body.items || [],
    temperature: req.body.temperature || 50,
    size: req.body.size || 20
  };
  stressBoxes.push(newBox);
  res.json(newBox);
});

// Update box
app.put('/api/boxes/:id', requireAuth, (req, res) => {
  const id = parseInt(req.params.id);
  const boxIndex = stressBoxes.findIndex(b => b.id === id);

  if (boxIndex !== -1) {
    stressBoxes[boxIndex] = {
      ...stressBoxes[boxIndex],
      ...req.body,
      id // Preserve the ID
    };
    res.json(stressBoxes[boxIndex]);
  } else {
    res.status(404).json({ error: 'Box not found' });
  }
});

// Delete box
app.delete('/api/boxes/:id', requireAuth, (req, res) => {
  const id = parseInt(req.params.id);
  stressBoxes = stressBoxes.filter(b => b.id !== id);
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`Stress Box app running on port ${PORT}`);
});
