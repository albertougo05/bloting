import fetchData from './fetchData.js';

//
// Buscar datos de Ambientes
//

function buscarAmbientes(id, url) {
	const endPoint = url + id;
	const data = fetchData.obtener(endPoint);
	let dataAmbs = [];

	data.then( resp => {
		dataAmbs = resp;
	});

	return dataAmbs;
}

export default buscarAmbientes;
