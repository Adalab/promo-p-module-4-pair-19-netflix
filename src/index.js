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
    movies,
  };
  res.json(response);
  console.log(response);
});
