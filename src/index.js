const express = require('express');
const cors = require('cors');
// importar el módulo better-sqlite3
const Database = require('better-sqlite3');

//Importar datos
const movies = require('./data/movies.json');
const users = require('./data/users.json');

// Create and config server
const server = express();
server.use(cors());
server.use(express.json());

// Init express aplication
const serverPort = 4001;
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
  // Recogemos los query params, si no llegan le damos valores por defecto
  const genderFilterParam = req.query.gender || '';
  const sortFilterParam = req.query.sort || 'ASC';

  let movieList = [];

  if (genderFilterParam === '') {
    // preparamos la query
    const query = db.prepare(
      `SELECT * FROM movies ORDER BY name ${sortFilterParam}`
    );
    // ejecutamos la query
    movieList = query.all();
  } else {
    // preparamos la query
    const query = db.prepare(
      `SELECT * FROM movies WHERE gender=? ORDER BY name ${sortFilterParam}`
    );
    // ejecutamos la query
    movieList = query.all(genderFilterParam);
  }

  // respondemos a la petición con los datos que ha devuelto la base de datos
  const response = {
    success: true,
    movies: movieList,
  };
  res.json(response);
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
  ///// const movieData = movies.find((movie) => movie.id === req.params.movieId);

  //Recoger el parametro Id de la película a detallar
  const movieIdParam = req.params.movieId;

  // preparamos la query
  const query = db.prepare(`SELECT * FROM movies WHERE id=?`);
  // ejecutamos la query
  const foundMovie = query.get(movieIdParam);

  // Responder con el template renderizado
  if (foundMovie) {
    // Asegurar los datos
    foundMovie.name = foundMovie.name || '';
    foundMovie.gender = foundMovie.gender || '';
    foundMovie.image = foundMovie.image || '';

    res.render('movie', foundMovie);
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
