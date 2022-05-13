const express = require('express');
const cors = require('cors');
const movies = require('./data/movies.json');

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
  const response = {
    success: true,
    // 13 de mayo FIN
    movies: [
      {
        id: '1',
        title: 'Gambito de dama',
        gender: 'Drama',
        image:
          '//beta.adalab.es/curso-intensivo-fullstack-recursos/apis/netflix-v1/images/gambito-de-dama.jpg',
      },
      {
        id: '2',
        title: 'Friends',
        gender: 'Comedia',
        image:
          '//beta.adalab.es/curso-intensivo-fullstack-recursos/apis/netflix-v1/images/friends.jpg',
      },
    ],
  };
  res.json(response);
});
