const express = require('express'),
  morgan = require('morgan'),//import morgan module
  fs = require('fs'), // import built in node modules fs and path 
  path = require('path');


const app = express();


app.use(express.static('public'));//routing to static files


let topMovies = [
  {
    Name: 'Taare Zameen Par',
    director: 'Aamir Khan'
  },
  {
    Name: 'Dangal',
    director: 'Nitesh Tiwari'
  },
  {
    Name: 'F2: Fun and Frustration',
    director: 'Anil Ravipudi'
  },
  {
    Name: 'Tagore',
    director: 'V.V.Vinayak'
  },
  {
    Name: 'Moana',
    director: 'John Musker, Ron Clements'
  },
  {
    Name: 'Avatar',
    director: 'James Cameron'
  },
  {
    Name: 'Avatar: The Way of Water',
    director: 'James Cameron'
  },
  {
    Name: 'RRR',
    director: 'S. S. Rajamouli'
  },
  {
    Name: 'Happy Days',
    director: ' Sekhar Kammula'
  },
  {
    Name: '3 Idiots',
    director: 'Rajkumar Hirani'
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

app.get('/movies', (req, res) => {
  res.json(topMovies);
});

app.listen(8080, () => {
  console.log('myMovie app is listening on port 8080.');
});


//error handler 
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went worng!');
});
