const express = require('express');
const multer = require('multer');
const session = require('express-session');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3000;

// Set storage engine for file uploads
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: function(req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

// Init upload
const upload = multer({
  storage: storage
}).single('myFile'); // Field name for uploaded file

// Serve static files from 'public' directory
app.use(express.static('public'));

// Setup session middleware
app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true
}));

// Body parser middleware to parse form data
app.use(express.urlencoded({ extended: true }));

// Login endpoint
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'admin' && password === 'admin') {
    req.session.loggedin = true;
    res.redirect('/dashboard.html');
  } else {
    res.send('Incorrect Username and/or Password!');
  }
});

// Dashboard access control
app.use('/dashboard.html', (req, res, next) => {
  if (req.session.loggedin) {
    next();
  } else {
    res.send('Please login to view this page!');
  }
});

// File upload endpoint
app.post('/upload', (req, res) => {
  upload(req, res, (err) => {
    if(err) {
      res.send('Error occurred during file upload');
    } else {
      if(req.file == undefined) {
        res.send('No file selected');
      } else {
        res.send('File uploaded successfully');
      }
    }
  });
});

// File download endpoint
app.get('/download/:filename', (req, res) => {
  const filename = req.params.filename;
  const filepath = path.join(__dirname, 'uploads', filename);
  if (fs.existsSync(filepath)) {
    res.download(filepath); // Set disposition and send it.
  } else {
    res.send('File does not exist.');
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
