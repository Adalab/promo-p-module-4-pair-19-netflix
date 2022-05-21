// Importar módulos
const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');

// Crear y configurar el servidor
const server = express();
server.use(cors());
server.use(express.json());

// Motor de plantillas (template engine)
server.set('view engine', 'ejs');

// Init express aplication
const serverPort = 4001;
server.listen(serverPort, () => {
  console.log(`Server listening at http://localhost:${serverPort}`);
});

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
    // Ejecutamos la query
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
  const loginEmail = req.body.email;
  const loginPassword = req.body.password;

  const query = db.prepare(
    `SELECT * FROM users WHERE email = ? AND password = ?`
  );

  const loggedUser = query.get(loginEmail, loginPassword);

  if (loggedUser) {
    return res.json({
      success: true,
      userId: loggedUser.id,
    });
  } else {
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

  // Recoger el parametro id de la película a detallar
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
server.post('/sign-up', (req, res) => {
  const userEmail = db.prepare(`SELECT email FROM users WHERE email=?`);
  const foundUser = userEmail.get(req.body.email);
  console.log(foundUser);
  console.log(userEmail);
  // Comprobar si el e-mail ya existe en la db
  if (foundUser === undefined) {
    const query = db.prepare(
      `INSERT INTO users (email, password) VALUES (?, ?)`
    );
    const newUser = query.run(req.body.email, req.body.password);
    console.log(newUser);
    res.json({
      success: true,
      message: '¡Bienvenida! Usuaria registrada con éxito',
      userId: newUser.lastInsertRowid,
    });
  } else {
    res.json({
      success: false,
      errorMessage: 'Ya hay una usuaria registrada con este e-mail',
    });
  }
});

// Endpoint perfil de usuaria
server.post('/user/profile', (req, res) => {
  const profileName = req.body.name;
  const profileEmail = req.body.email;
  const profilePass = req.body.password;
  const profileId = req.header('user-id');

  const query = db.prepare(
    `UPDATE users SET name=?, email=?, password=? WHERE id=?`
  );
  const updateUser = query.run(
    profileName,
    profileEmail,
    profilePass,
    profileId
  );
  // res.json({ success: true });
  if (updateUser.change !== 0) {
    res.json({
      success: true,
      message: 'Datos modificados correctamente',
      result: updateUser,
    });
  } else {
    res.json({
      success: false,
      errorMessage: 'Ha habido un error',
    });
  }
});

// Endpoint para recuperar los datos del perfil de la usuaria
server.get('/user/profile', (req, res) => {
  // Recoger el parametro id del usuario
  const userProfileId = req.header('user-id');
  // Preparamos la query
  const query = db.prepare(
    `SELECT name, email, password FROM users WHERE id=?`
  );
  // Ejecutamos la query
  const foundProfileUser = query.get(userProfileId);
  res.json(foundProfileUser);
});

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
  const moviesIdsNumbers = movieIds.map((movie) => movie.movieId); // Que nos devuelve [1.0, 2.0]
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
