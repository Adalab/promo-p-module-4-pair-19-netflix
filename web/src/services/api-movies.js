// Login
const getMoviesFromApi = (params) => {
  console.log(params);
  console.log('Se están pidiendo las películas de la app');
  // CAMBIA ESTE FETCH PARA QUE APUNTE A UN ENDPOINT DE TU SERVIDOR, PIENSA SI DEBE SER GET O POST, PIENSA QUÉ DATOS DEBES ENVIAR, ETC
  return fetch(
    // Cambiamos '//beta.adalab.es/curso-intensivo-fullstack-recursos/apis/netflix-v1/empty.json' por:
    `//localhost:4001/movies?gender=${params.gender}&sort=${params.sort}`,
    {
      method: 'GET',
    }
  )
    .then((response) => response.json())
    .then((data) => {
      // CAMBIA EL CONTENIDO DE ESTE THEN PARA GESTIONAR LA RESPUESTA DEL SERVIDOR Y RETORNAR AL COMPONENTE APP LO QUE NECESITA
      return data;
      /* Este contenido está pegado en el fichero src/data/movies.json */
    });
};

const objToExport = {
  getMoviesFromApi: getMoviesFromApi,
};

export default objToExport;
