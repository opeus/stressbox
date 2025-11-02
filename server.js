const express = require('express');
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data.json');

// Default initial data
const defaultBoxes = [
  {
    id: 1,
    heading: 'Work Projects',
    items: ['Finish report', 'Team meeting prep', 'Update documentation'],
    temperature: 65,
    gridCols: 2,
    gridRows: 2,
    backgroundImage: ''
  },
  {
    id: 2,
    heading: 'Personal',
    items: ['Grocery shopping', 'Call mom', 'Exercise'],
    temperature: 30,
    gridCols: 1,
    gridRows: 1,
    backgroundImage: ''
  },
  {
    id: 3,
    heading: 'House',
    items: ['Fix leak', 'Clean garage'],
    temperature: 85,
    gridCols: 2,
    gridRows: 1,
    backgroundImage: ''
  },
  {
    id: 4,
    heading: 'Health',
    items: ['Doctor appointment', 'Gym routine', 'Meal prep'],
    temperature: 45,
    gridCols: 1,
    gridRows: 2,
    backgroundImage: ''
  }
];

// Load data from file or use defaults
let stressBoxes = [];
function loadData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf8');
      stressBoxes = JSON.parse(data);
      console.log('Loaded existing data from file');
    } else {
      stressBoxes = [...defaultBoxes];
      saveData();
      console.log('Created new data file with defaults');
    }
  } catch (error) {
    console.error('Error loading data, using defaults:', error);
    stressBoxes = [...defaultBoxes];
  }
}

// Save data to file
function saveData() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(stressBoxes, null, 2), 'utf8');
  } catch (error) {
    console.error('Error saving data:', error);
  }
}

// Load data on startup
loadData();

// Middleware
app.use(bodyParser.json({ limit: '50mb' })); // Increased limit for base64 images
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
app.use(session({
  store: new FileStore({
    path: path.join(__dirname, 'sessions'),
    retries: 0,
    ttl: 86400 // 24 hours in seconds
  }),
  secret: 'stress-box-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    httpOnly: true,
    secure: false // Set to true if using HTTPS in production
  }
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
    gridCols: req.body.gridCols || 1,
    gridRows: req.body.gridRows || 1,
    backgroundImage: req.body.backgroundImage || ''
  };
  stressBoxes.push(newBox);
  saveData();
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
    saveData();
    res.json(stressBoxes[boxIndex]);
  } else {
    res.status(404).json({ error: 'Box not found' });
  }
});

// Delete box
app.delete('/api/boxes/:id', requireAuth, (req, res) => {
  const id = parseInt(req.params.id);
  stressBoxes = stressBoxes.filter(b => b.id !== id);
  saveData();
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`Stress Box app running on port ${PORT}`);
});
