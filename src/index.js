const express = require('express');
const cors = require('cors');
// Importar el módulo better-sqlite3
const Database = require('better-sqlite3');

// Importar datos
const movies = require('./data/movies.json');
const users = require('./data/users.json');

// Crear y configurar el servidor
const server = express();
server.use(cors());
server.use(express.json());

// Init express aplication
const serverPort = 4001;
server.listen(serverPort, () => {
  console.log(`Server listening at http://localhost:${serverPort}`);
});

// Motor de plantillas (template engine)
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
    // Preparamos la query
    const query = db.prepare(
      `SELECT * FROM movies ORDER BY name ${sortFilterParam}`
    );
    // Ejecutamos la query
    movieList = query.all();
  } else {
    // Preparamos la query
    const query = db.prepare(
      `SELECT * FROM movies WHERE gender=? ORDER BY name ${sortFilterParam}`
    );
    // ejecutamos la query
    movieList = query.all(genderFilterParam);
  }

  // Respondemos a la petición con los datos que ha devuelto la base de datos
  const response = {
    success: true,
    movies: movieList,
  };
  res.json(response);
});

// Endpoint usuarios (login)
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

// Endpoint para escuchar las peticiones (obtener las películas)
/* server.get('/movie/:movieId', (req, res) => {
  const foundMovie = movies.find((movie) => movie.id === req.params.movieId);
  res.render('movie', foundMovie);
}); */
server.get('/movie/:movieId', (req, res) => {
  ///// const movieData = movies.find((movie) => movie.id === req.params.movieId);

  // Recoger el parametro Id de la película a detallar
  const movieIdParam = req.params.movieId;

  // Preparamos la query
  const query = db.prepare(`SELECT * FROM movies WHERE id=?`);
  // Ejecutamos la query
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

// Endpoint sign-up
////// REVISAR Lección 4.6 ejercicios 2 y 3 (registro nuevas usuarias y comprobar que no haya una con el mismo mail)
server.post('/sign-up', (req, res) => {
  const userEmail = db.prepare(`SELECT email FROM users WHERE email=?`);
  const foundUser = userEmail.get(req.body.userEmail);

  // Comprobar si el e-mail ya existe en la db
  if (foundUser === undefined) {
    const query = db.prepare(
      `INSERT INTO users (email, password) VALUES (?, ?)`
    );
    const result = query.run(req.body.userEmail, req.body.userPass);
    res.json({
      success: true,
      errorMessage: '¡Bienvenida! Usuaria creada con éxito',
    });
  } else {
    res.json({
      success: false,
      errorMessage: 'Ya hay una usuaria con este e-mail',
    });
  }
});
//////

// Endpoint id de las películas de una usuaria
server.get('/user/movies', (req, res) => {
  // Preparamos la query para obtener los movieIds
  const movieIdsQuery = db.prepare(
    'SELECT movieId FROM rel_movies_users WHERE userId = ?'
  );
  // Obtenemos el id de la usuaria
  const userId = req.header('user-id');
  // Ejecutamos la query
  const movieIds = movieIdsQuery.all(userId); // Que nos devuelve algo como [{ movieId: 1 }, { movieId: 2 }];

  // Obtenemos las interrogaciones separadas por comas
  const moviesIdsQuestions = movieIds.map((id) => '?').join(', '); // Que nos devuelve '?, ?'
  // Preparamos la segunda query para obtener todos los datos de las películas
  const moviesQuery = db.prepare(
    `SELECT * FROM movies WHERE id IN (${moviesIdsQuestions})`
  );

  // Convertimos el array de objetos de id anterior a un array de números
  const moviesIdsNumbers = movieIds.map((movie) => movie.movieId); // que nos devuelve [1.0, 2.0]
  // Ejecutamos segunda la query
  const movies = moviesQuery.all(moviesIdsNumbers);

  // Respondemos a la petición con
  res.json({
    success: true,
    movies: movies,
  });
});

// Servidor de estáticos de Express
const staticServerPathWeb = './src/public-react'; // En esta carpeta ponemos los ficheros estáticos
server.use(express.static(staticServerPathWeb));

// Servidor de estáticos para las fotos
const staticServerPathImages = './src/public-movies-images';
server.use(express.static(staticServerPathImages));
// http://localhost:4000/gambita-de-dama.jpg Se ve el póster de la serie

// Servidor de estáticos para los estilos
const staticServerPathStyles = './src/web/src/stylesheets';
server.use(express.static(staticServerPathStyles));
