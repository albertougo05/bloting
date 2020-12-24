import fetchData from './fetchData.js';


//
// Buscar datos del Registro de Visitas
//

function buscarRegistro(id, url) {
	const endPoint = url + id;
	const data = fetchData.obtener(endPoint);

	data.then( resp => {
		if (resp.status) {
			//console.log(resp);
			return null;
		} else {
			_mostrarRegistro(resp);
			PRESUP.guardadoDeTabs.registro = false;
		}
	});
}

export default buscarRegistro;


const _mostrarRegistro = data => {
	const form = document.getElementById('form_registro');
	form.querySelector('select#idEmpleado').value = data.idEmpleado;
	form.querySelector('textarea#detalle').value = data.detalle || '';
	form.querySelector('input#fechaTentativa').value = data.fechaTentativa;
	form.querySelector('input#fechaVisita').value = data.fechaVisita;
}
