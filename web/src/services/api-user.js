// Login
const sendLoginToApi = (data) => {
  console.log('Se están enviando datos al login:', data);
  const bodyParams = {
    userEmail: data.email,
    userPass: data.password,
  };
  console.log(data);
  // Fetch cambiado con la ruta correcta para el login
  return fetch('http://localhost:4001/login', {
    // Método POST
    method: 'POST',
    // Header
    headers: {
      'Content-Type': 'application/json',
    },
    // Body (declaramos bodyParams en la línea 4)
    body: JSON.stringify(bodyParams),
  })
    .then((response) => response.json())
    .then((data) => {
      return data;
    });
};

// Signup
const sendSingUpToApi = (data) => {
  console.log('Se están enviando datos al signup:', data);
  const bodyParams = {
    userEmail: data.email,
    userPass: data.password,
  };
  return fetch('http://localhost:4001/sign-up', {
    // Método POST
    method: 'POST',
    // Header
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(bodyParams),
  })
    .then((response) => response.json())
    .then((data) => {
      return data;
    });
};

// Profile
const sendProfileToApi = (userId, data) => {
  console.log('Se están enviando datos al profile:', userId, data);
  const bodyParams = {
    userEmail: data.email,
    userPass: data.password,
  };
  return fetch('http://localhost:4001/user/profile', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'user-id': userId,
    },
    body: JSON.stringify(bodyParams),
  })
    .then((response) => response.json())
    .then((data) => {
      return data;
    });
};

const getProfileFromApi = (userId) => {
  console.log('Se están pidiendo datos del profile del usuario:', userId);
  return fetch('http://localhost:4001/user/profile', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'user-id': userId,
    },
  })
    .then((response) => response.json())
    .then((data) => {
      return data;
    });
};

// User movies
const getUserMoviesFromApi = (userId) => {
  console.log(
    'Se están pidiendo datos de las películas de la usuaria:',
    userId
  );
  // CAMBIA ESTE FETCH PARA QUE APUNTE A UN ENDPOINT DE TU SERVIDOR, PIENSA SI DEBE SER GET O POST, PIENSA QUÉ DATOS DEBES ENVIAR, ETC
  return fetch('http://localhost:4001/user/movies', {
    // Método GET
    method: 'GET',
    // Header params
    headers: {
      'Content-Type': 'application/json',
      'user-id': userId,
    },
  })
    .then((response) => response.json())
    .then((data) => {
      return data;
    });
};

const objToExport = {
  sendLoginToApi: sendLoginToApi,
  sendSingUpToApi: sendSingUpToApi,
  sendProfileToApi: sendProfileToApi,
  getProfileFromApi: getProfileFromApi,
  getUserMoviesFromApi: getUserMoviesFromApi,
};

export default objToExport;
