const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const session = require('express-session');
const db = new sqlite3.Database('./database.sqlite');

const app = express();
const port = 3000;

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: false }));

app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: true,
}));

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'homepage.html'));
});

app.get('/user-info', (req, res) => {
  if (req.session.username) {
    res.json({ username: req.session.username });
  } else {
    res.json({ username: null });
  }
});

app.get('/register', (req, res) => {
  res.render('register');
});

app.get('/login', (req, res) => {
  res.render('login');
});

app.post('/register', (req, res) => {
  const { username, email, password } = req.body;
  db.run("INSERT INTO users (username, email, password) VALUES (?, ?, ?)", [username, email, password], function(err) {
    if (err) {
      return console.log(err.message);
    }
    req.session.username = username;
    res.send(`<script>alert("You are welcome, ${username}"); window.location.href = "/";</script>`);
  });
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;

  console.log(`Attempting login with email: ${email} and password: ${password}`);

  
  db.get("SELECT * FROM users WHERE email = ?", [email], (err, row) => {
    if (err) {
      console.error(err.message);
      return res.send(`<script>alert("An error occurred while trying to log in"); window.location.href = "/login";</script>`);
    }
   
    if (!row) {
      console.log(`User with email ${email} not found`);
      return res.send(`<script>alert("No user with this email was found"); window.location.href = "/login";</script>`);
    }
    console.log(`User found: ${row.username} with email ${row.email}`);
    
    if (row.password !== password) {
      console.log('Incorrect password');
      return res.send(`<script>alert("Wrong password"); window.location.href = "/login";</script>`);
    }

    req.session.username = row.username;
    console.log('Login successful');
    res.redirect('/');
  });
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});