import express from 'express';
const app = express();
import sqlite3 from 'sqlite3';
import axios from 'axios';



app.set('view engine', 'pug'); // Set the view engine to Pug
app.use(express.urlencoded({ extended: true })); // Set up middleware for parsing POST requests
app.use(express.static('public')); // Serve static files from the 'public' directory


// Initialize a new database object to a file called `mydatabase.db`
const db = new sqlite3.Database('./model/list.db');

// Create the table if it doesn't exist
db.serialize(() => {
  db.run("CREATE TABLE IF NOT EXISTS list (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT)");
});

app.get('/', function (req, res) {
  res.render('index'); // Render the 'index' Pug template instead of sending raw HTML
});

app.get('/steve', function (req, res) {
  res.send('Hello Steve'); // Send a string to the page.
});

//AB added this
app.get('/weather', function (req, res) {
  res.send('The weather is cloudy Today'); // Send a string to the page.
});

app.get('/chuck-norris', async function(req, res) {
  try {
    const response = await axios.get('https://api.chucknorris.io/jokes/random');
    const joke = response.data.value;
    res.render('chuck-norris', { joke }); // Pass the joke and the icon URL to the Pug template
  } catch (error) {
    res.status(500).send("Error fetching Chuck Norris joke");
  }
});



// Route for rendering the list of names in descending order
app.get('/list', (req, res) => {
  db.all("SELECT id, name FROM list ORDER BY name DESC", [], (err, rows) => { // ORDER BY name DESC to get names in descending order
    if (err) {
      return console.error(err.message);
    }
    res.render('list', { items: rows });
  });
});



app.get('/add-name', function(req, res) {
  res.render('add-name');
});

app.post('/add-name', function(req, res) {
  const name = req.body.name.trim(); // Trim whitespace from both ends of the string
  if (name) { // Check if 'name' is not empty after trimming
    // Proceed with inserting the name into the database
    const stmt = db.prepare("INSERT INTO list (name) VALUES (?)");
    stmt.run(name, function(err) {
      if (err) {
        return console.error(err.message);
      }
      res.redirect('/list'); // Redirect to the list of names after insertion
    });
    stmt.finalize();
  } else {
    res.render('add-name');
  }
});



app.get('/delete-name/:id', function(req, res) {
  const id = req.params.id;
  db.run("DELETE FROM list WHERE id = ?", id, function(err) {
    if (err) {
      return console.error(err.message);
    }
    res.redirect('/list'); // Redirect to the list of names after deletion
  });
});



app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});