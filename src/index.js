const express = require('express');
const cors = require('cors');
// importar el módulo better-sqlite3
const Database = require('better-sqlite3');

//importar datos
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

// Motor de plantillas
server.set('view engine', 'ejs');

// Configuración base de datos
const db = new Database('./src/db/database.db', {
  verbose: console.log,
});

// Endpoint para obtener las películas
server.get('/movies', (req, res) => {
  // preparamos la query
  const query = db.prepare('SELECT * FROM movies');
  // ejecutamos la query
  const movies = query.all();

  console.log(movies);

  // const genderFilterParam = req.query.gender;
  // const sortFilterParam = req.query.sort;

  // const response = {
  //   success: true,
  //   movies: movies
  //     .filter((movie) => {
  //       if (genderFilterParam === '') {
  //         return true;
  //       } else {
  //         return movie.gender === genderFilterParam ? true : false;
  //       }
  //     })
  //     .sort(function (a, b) {
  //       const result = a.title.localeCompare(b.title);
  //       // Por defecto está asc
  //       if (sortFilterParam === 'desc') {
  //         return result * -1;
  //       }
  //       return result;
  //     }),
  // };

  // respondemos a la petición con los datos que ha devuelto la base de datos
  res.json(movies);
});

// Endpoint usuarios
server.post('/login', (req, res) => {
  const loggedUser = users.find((user) => {
    if (
      // Recordar que nuestros bodyParams son userEmail y userPass (línea 4 api-user.js)
      user.email === req.body.userEmail &&
      user.password === req.body.userPass
    ) {
      return user;
    }
    /* O simplemente 
    users.find((user) => user.email === req.body.userEmail &&
    user.password === req.body.userPass) */
  });
  if (loggedUser !== undefined) {
    return res.json({
      success: true,
      userId: loggedUser.id,
    });
    /* Otra forma de hacerlo
      if (loggedUser) {
    res.json({
      success: true,
      userId: 'id_de_la_usuaria_encontrada',
    });
    */
  } else {
    // Es decir, si es undefined, o sea, si no lo encuentra en nuestro json de users, salta el mensaje Not Found:
    return res.json({
      success: false,
      errorMessage: 'Usuaria/o no encontrada/o',
    });
  }
});

// Endpoint para escuchar las peticiones
/* server.get('/movie/:movieId', (req, res) => {
  const foundMovie = movies.find((movie) => movie.id === req.params.movieId);
  res.render('movie', foundMovie);
}); */
server.get('/movie/:movieId', (req, res) => {
  // Obtener los datos de las películas
  const movieData = movies.find((movie) => movie.id === req.params.movieId);
  console.log(movieData);

  // Responder con el template renderizado
  if (movieData) {
    // Asegurar los datos
    movieData.title = movieData.title || '';
    movieData.gender = movieData.gender || '';
    movieData.image = movieData.image || '';

    res.render('movie', movieData);
  } else {
    res.render('movie-not-found');
  }
});

// Servidor de estáticos de Express
const staticServerPathWeb = './src/public-react'; // En esta carpeta ponemos los ficheros estáticos
server.use(express.static(staticServerPathWeb));

// Servidor de estáticos para las fotos
const staticServerPathImages = './src/public-movies-images';
server.use(express.static(staticServerPathImages));
// http://localhost:4000/gambita-de-dama.jpg Se ve el póster de la serie

// Servidor de estáticos para los estilos
// const staticServerPathStyles =
