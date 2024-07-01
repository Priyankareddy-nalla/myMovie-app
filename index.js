

const express = require('express'),
  bodyParser = require('body-parser'),
  uuid = require('uuid'),
  morgan = require('morgan'),//import morgan module
  fs = require('fs'), // import built in node modules fs and path 
  path = require('path');
const mongoose = require('mongoose');
const Models = require('./models.js');

const { check, validationResult } = require('express-validator');

const app = express();
const cors = require('cors');
//CORS in Express
// app.use(cors());

const Movies = Models.Movie;
const Users = Models.User;

//mongodb connect using mongoose
//mongoose.connect('mongodb://localhost:27017/movies', { useNewUrlParser: true, useUnifiedTopology: true });

mongoose.connect(process.env.CONNECTION_URI);



app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//allowing particular origins
let allowedOrigins = ['http://localhost:8080', 'http://testsite.com', 'http://localhost:1234', 'https://myfirstappmovie.netlify.app', 'http://localhost:4200'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      let message = 'The CORS policy for this application doesnt allow access from origin ' + origin;
      return callback(new Error(message), false);
    }
    return callback(null, true);
  }
}));


//here importing auth.js and passport.js
let auth = require('./auth.js')(app);

const passport = require('passport');
const { error } = require('console');
require('./passport');



app.use(express.static('public'));//routing to static files



// create a write stream (in append mode)
// a ‘log.txt’ file is created in root directory
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), { flags: 'a' })

// setup the logger
app.use(morgan('combined', { stream: accessLogStream }));

/**
 * READ index page
 * @function
 * @name getIndexPage
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {Object} - Sends a string response "Welcome to myMovie app!".
 */
app.get('/', (req, res) => {
  res.send('Welcome to myMovie app!');
});

app.get('/documentation', (req, res) => {
  res.sendFile('public/documentation.html', { root: __dirname });
});

/**
 * CREATE new user
 * @function
 * @name signupUser
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {Error} - If there is an error when creating the new user. 
 * @returns {Object} - Returns JSON response containing the new user.
 */
app.post('/users',
  [
    check('Username', 'Username is required').isLength({ min: 5 }),
    check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
    check('Password', 'Password is required').not().isEmpty(),
    check('Email', 'Email does not appear to be valid').isEmail()
  ], async (req, res) => {
    // check the validation object for errors
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    let hashedPassword = Users.hashPassword(req.body.Password);
    await Users.findOne({ Username: req.body.Username })
      //Search to see if a user with the requested username already exists
      .then((user) => {
        if (user) {
          //If the user is found, send a response that it already exists
          return res.status(400).send(req.body.Username + 'already exists');
        } else {
          Users
            .create({
              Username: req.body.Username,
              Password: hashedPassword,
              Email: req.body.Email,
              Birthday: req.body.Birthday
            })
            .then((user) => { res.status(201).json(user) })
            .catch((error) => {
              console.error(error);
              res.status(500).send('Error: ' + error);
            })
        }
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send('Error: ' + error);
      });
  });

/**
 * READ all users
 * @function
 * @name getAllUsers
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {Error} - If there is an error while retrieving users from the database.
 * @returns {Object} - Returns JSON response containing the all users.
 */
app.get('/users', async (req, res) => {
  await Users.find()
    .then((users) => {
      res.status(201).json(users);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

/**
 * READ a user by username
 * @function
 * @name getOneUser
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {string} req.params.Username - The username of the user to retrieve.
 * @throws {Error} - If there is an error while retrieving the user from the database.
 * @returns {Object} - Returns JSON response containing the user with this username.
 */
app.get('/users/:Username', async (req, res) => {
  await Users.findOne({ Username: req.params.Username })
    .then((user) => {
      res.json(user);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

/**
 * UPDATE user information by username
 * @function
 * @name updateUser
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {string} req.params.Username - The username of the user to update.
 * @throws {Error} - If there is an error while validating input or updating user data in the database.
 * @returns {Object} - JSON response containing the updated user.
 */
app.put('/users/:Username', passport.authenticate('jwt', { session: false }),
  [
    check('Username', 'Username is required').isLength({ min: 5 }),
    check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
    check('Password', 'Password is required'), //.not().isEmpty()
    check('Email', 'Email does not appear to be valid').isEmail()
  ], async (req, res) => {

    // check the validation object for errors
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    // gives you data already in the database
    let oldData = Users.findOne({ Username: req.params.Username });

    let hashedPassword = req.body.Password ? Users.hashPassword(req.body.Password) : Users.findOne({ Username: req.params.Username }).Password;
    await Users.findOneAndUpdate({ Username: req.params.Username }, {
      $set:
      {
        // If there is new data update the database with new data, else use old data
        Username: req.body.Username || oldData.Username,
        Password: hashedPassword, // see hashed variable above
        Email: req.body.Email || oldData.Email,
        Birthday: req.body.Birthday || oldData.Birthday
      }
    },
      { new: true }) // This line makes sure that the updated document is returned
      .then((updatedUser) => {
        res.json(updatedUser);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      })
  });


/**
 * CREATE new favorite movie for user
 * @function
 * @name addFavMovie
 * @param {Object} req - Express request object.
 * @param {Object} req.user - User object obtained from JWT authentication.
 * @param {string} req.params.Username - The username of the user.
 * @param {string} req.params.MovieID - The ID of the movie to add to the user's favorites.
 * @param {Object} res - Express response object.
 * @throws {Error} - If there is an error while updating user data in the database.
 * @returns {Object} - Returns JSON response containing the updated user's information.
 */
app.post('/users/:Username/movies/:MovieID', passport.authenticate('jwt', { session: false }), async (req, res) => {
  await Users.findOneAndUpdate({ Username: req.params.Username }, {
    $push: { FavoriteMovies: req.params.MovieID }
  },
    { new: true }) // This line makes sure that the updated document is returned
    .then((updatedUser) => {
      res.json(updatedUser);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});


/**
 * DELETE favorite movie for user
 * @function
 * @name deleteFavMovie
 * @param {Object} req - Express request object.
 * @param {Object} req.user - User object obtained from JWT authentication.
 * @param {string} req.params.Username - The username of the user.
 * @param {string} req.params.MovieID - The ID of the movie to remove from the user's favorites.
 * @param {Object} res - Express response object.
 * @throws {Error} - If there is an error while updating user data in the database.
 * @returns {Object} - Returns JSON response containing the updated user's information.
 */
app.delete('/users/:Username/movies/:MovieID', passport.authenticate('jwt', { session: false }), async (req, res) => {
  await Users.findOneAndUpdate({ Username: req.params.Username }, {
    $pull: { FavoriteMovies: req.params.MovieID }
  },
    { new: true }) // This line makes sure that the updated document is returned
    .then((updatedUser) => {
      res.json(updatedUser);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

/**
 * DELETE user by Username
 * @function
 * @name deleteUser
 * @param {Object} req - Express request object.
 * @param {Object} req.user - User object obtained from JWT authentication.
 * @param {string} req.params.Username - The username of the user to delete.
 * @param {Object} res - Express response object.
 * @throws {Error} -  If there is an error while deleting the user from the database.
 * @returns {Object} - Returns message indicating whether the user was successfully deleted or not.
 */
app.delete('/users/:Username', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOneAndDelete({ Username: req.params.Username })
    .then((user) => {
      if (!user) {
        res.status(400).send(req.params.Username + ' was not found');
      } else {
        res.status(200).send(req.params.Username + ' was deleted.');
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});



/**
 * READ movie list
 * @function
 * @name getAllMovies
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {Error} - If there is an error while retrieving movies from the database.
 * @returns {Object} - Returns JSON response containing all movies.
 */
app.get('/movies', passport.authenticate('jwt', { session: false }), async (req, res) => {
  await Movies.find()
    .then((movies) => {
      res.status(201).json(movies);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});


/**
 * READ movie by name
 * @function
 * @name getOneMovie
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {string} req.params.title - The title of the movie to retrieve.
 * @throws {Error} - If there is an error while retrieving the movie from the database.
 * @returns {Object} - Returns JSON response containing the requested movie.
 */
app.get('/movies/:Title', passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.findOne({ Title: req.params.Title })
    .then((movie) => {
      res.status(200).json(movie);
    })
    .catch((error) => {
      console.log(error);
      res.status(500).send('Error:' + error);
    });
});


/**
 * READ genre by name
 * @function
 * @name getGenre
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {string} req.params.genreName - The name of the genre to retrieve from the database.
 * @throws {Error} - If there is an error while retrieving genre from the database.
 * @returns {Object} - Returns JSON response containing the genre object of the requested movies.
 */
app.get('/movies/genre/:genreName', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const genreName = req.params.genreName;
    const movie = await Movies.findOne({ 'Genre.Name': genreName });

    if (movie) {
      res.status(200).json(movie.Genre);
    } else {
      res.status(404).send('No such genre found');
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Error: ' + err);
  }
});

/**
 * READ director by name
 * @function
 * @name getDirector
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {string} req.params.directorName - The name of the director to retrieve from the database.
 * @throws {Error} - If there is an error while retrieving director from the database.
 * @returns {Object} - Returns JSON response containing the director object of the requested movies.
 */
app.get('/movies/directors/:directorName', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const directorName = req.params.directorName;
    const movie = await Movies.findOne({ 'Director.Name': directorName });

    if (movie) {
      res.status(200).json(movie.Director);
    } else {
      res.status(404).send('No such director found');
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Error: ' + err);
  }
});

// getFavoriteMovies of user
app.get('/users/:Username/:FavoriteMovies', async (req, res) => {
  try {
    const favoriteMovieId = mongoose.Types.ObjectId(req.params.FavoriteMovies);
    const users = await Users.find({ FavoriteMovies: { $elemMatch: { $eq: favoriteMovieId } } });
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error: ' + error);
  }
});
Ex
const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
  console.log('Listening on Port ' + port);
});


