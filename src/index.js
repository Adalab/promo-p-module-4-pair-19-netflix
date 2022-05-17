const express = require('express');
const cors = require('cors');
const movies = require('./data/movies.json');
const users = require('./data/users.json');

// Create and config server
const server = express();
server.use(cors());
server.use(express.json());

// Init express aplication
const serverPort = 4000;
server.listen(serverPort, () => {
  console.log(`Server listening at http://localhost:${serverPort}`);
});

// Endpoint para obtener las películas
server.get('/movies', (req, res) => {
  const genderFilterParam = req.query.gender;
  const sortFilterParam = req.query.sort;

  console.log(req.query.gender);
  const response = {
    success: true,
    movies: movies
      .filter((movie) => {
        if (genderFilterParam === '') {
          return true;
        } else {
          return movie.gender === genderFilterParam ? true : false;
        }
      })
      .sort(function (a, b) {
        const result = a.title.localeCompare(b.title);
        // Por defecto está asc
        if (sortFilterParam === 'desc') {
          return result * -1;
        }
        return result;
      }),
  };
  res.json(response);
});

// Endpoint usuarios
server.post('/login', (req, res) => {
  console.log(req.body);

  const loggedUser = users.find((user) => {
    if (
      // Recordar que nuestros bodyParams son userEmail y userPass (línea 4 api-user.js)
      user.email === req.body.userEmail &&
      user.password === req.body.userPass
    ) {
      return user;
    }
  });
  if (loggedUser !== undefined) {
    return res.json({
      success: true,
      userId: loggedUser.id,
    });
  } else {
    // Es decir, si es undefined. No lo encuentra en nuestro json de users
    return res.json({
      success: false,
      errorMessage: 'Usuaria/o no encontrada/o',
    });
  }
});

// Endpoint para las películas individuales
server.get('/movie/:movieId', (req, res) => {
  console.log(req.params);

  const foundMovie = movies.find((movie) => movie.id === req.params.movieId);
  console.log(foundMovie);
});

// Servidor de estáticos de Express
const staticServerPathWeb = './src/public-react'; // En esta carpeta ponemos los ficheros estáticos
server.use(express.static(staticServerPathWeb));

// Servidor de estáticos para las fotos
const staticServerPathImages = './src/public-movies-images';
server.use(express.static(staticServerPathImages));
// http://localhost:4000/gambita-de-dama.jpg Se ve el póster de la serie
