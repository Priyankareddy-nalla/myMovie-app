const express = require('express'),
  bodyParser = require('body-parser'),
  uuid = require('uuid'),
  morgan = require('morgan'),//import morgan module
  fs = require('fs'), // import built in node modules fs and path 
  path = require('path');


const app = express();

app.use(bodyParser.json());


app.use(express.static('public'));//routing to static files


let users = [{
  id: 1,
  name: 'priyanka',
  favoriteMovies: []
},
{
  id: 2,
  name: 'Nithya',
  favoriteMovies: ["Dangal"]

}
];
let movies = [
  {
    Title: 'Taare Zameen Par',
    Descrption: 'Ishaan is criticised by his parents for his poor academic performance and is sent away to a boarding school. Ram, an art teacher, however, realises he has dyslexia and helps him uncover his potential.',
    Genre: {
      Name: 'Chidrens film',
      Descrption: "It explores the life and imagination of Ishaan (Safary), an artistically gifted 9-year-old boy whose poor academic performance leads his parents to send him to a boarding school, where a new art teacher Nikumbh (Khan) suspects that he is dyslexic and helps him to overcome his reading disorder."
    },
    Director: {
      Name: 'Aamir Khan',
      Bio: 'Mohammed Aamir Hussain Khan is an Indian actor who works in Hindi films. Referred to in the media as "Mr. Perfectionist", through his career spanning over 30 years, Khan has established himself as one of the most notable actors of Indian cinema',
      Born: 1965
    }
  },
  {
    Title: 'Dangal',
    Descrption: 'Mahavir Singh Phogat, a former wrestler, decides to fulfil his dream of winning a gold medal for his country by training his daughters for the Commonwealth Games despite the existing social stigmas.',
    Genre: {
      Name: 'Sports',
      Description: 'The film stars Khan as Mahavir Singh Phogat, a pehlwani amateur wrestler who trains his daughters Geeta Phogat and Babita Kumari to become Indias first world-class female wrestlers.',
    },
    Director: {
      Name: 'Nitesh Tiwari',
      Bio: 'Nitesh Tiwari is an Indian film director, screenwriter, and lyricist known for his works in Bollywood. He debuted as a co-director in Chillar Party which won the National Film Award for Best Childrens Film. He also directed the supernatural political drama Bhoothnath Returns.',
      Born: 1972
    }

  }
];
// create a write stream (in append mode)
// a ‘log.txt’ file is created in root directory
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), { flags: 'a' })

// setup the logger
app.use(morgan('combined', { stream: accessLogStream }));

app.get('/', (req, res) => {
  res.send('Welcome to myMovie app!');
});

app.get('/documentation', (req, res) => {
  res.sendFile('public/documentation.html', { root: __dirname });
});

//CREATE new user
app.post('/users', (req, res) => {
  const newUser = req.body;
  if (newUser.name) {
    newUser.id = uuid.v4();
    users.push(newUser);
    res.status(201).json(newUser);
  } else {
    res.status(400).send('user needs name')
  }
})

//UPDATE update user details
app.put('/users/:id', (req, res) => {
  const { id } = req.params;
  const updateUser = req.body;

  let user = users.find(user => user.id == id);
  if (user) {
    user.name = updateUser.name;
    res.status(200).json(user);
  } else {
    res.status(400).json('no such user');
  }
})


//CREATE adding  movie to favorite movie  list
app.post('/users/:id/:movieTitle', (req, res) => {
  const { id, movieTitle } = req.params;

  let user = users.find(user => user.id == id);
  if (user) {
    user.favoriteMovies.push(movieTitle);
    res.status(200).json(`${movieTitle} has been added to user ${id} array`);
  } else {
    res.status(400).json('no movie added to user');
  }
})


//DELETE delete movie from favoriteMovie list
app.delete('/users/:id/:movieTitle', (req, res) => {
  const { id, movieTitle } = req.params;

  let user = users.find(user => user.id == id);
  if (user) {
    user.favoriteMovies = user.favoriteMovies.filter(title => title !== movieTitle);
    res.status(200).json(`${movieTitle} has been removed to user ${id} array`);
  } else {
    res.status(400).json('no movie removed from user');
  }
})


//DELETE user 
app.delete('/users/:id', (req, res) => {
  const { id } = req.params;

  let user = users.find(user => user.id == id);

  if (user) {
    users = users.filter(user => user.id != id);
    // res.json(users);
    res.status(200).json(`user ${id} has been deleted`);
  } else {
    res.status(400).json('no such user');
  }
})


//READ users  just checkup
app.get('/usersList', (req, res) => {
  res.status(200).json(users);
})


//READ  get a list of all movies
app.get('/movies', (req, res) => {
  res.status(200).json(movies);
});


//READ get moviedetils searching  title
app.get('/movies/:title', (req, res) => {
  const { title } = req.params;
  const movie = movies.find(movie => movie.Title === title);

  if (movie) {
    res.status(200).json(movie);
  } else {
    res.status(400).send('no such movie');
  }
});


//READ get movie genre 
app.get('/movies/genre/:genreName', (req, res) => {
  const { genreName } = req.params;
  const genre = movies.find(movie => movie.Genre.Name === genreName);

  if (genre) {
    res.status(200).json(genre);
  } else {
    res.status(400).send('no such genre');
  }
});

//READ get director details
app.get('/movies/directors/:directorName', (req, res) => {
  const { directorName } = req.params;
  const director = movies.find(movie => movie.Director.Name === directorName).Director;

  if (director) {
    res.status(200).json(director);
  } else {
    res.status(400).send(' no such director');
  }
});


app.listen(8080, () => {
  console.log('myMovie app is listening on port 8080.');
});


//error handler 
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went worng!');
});
