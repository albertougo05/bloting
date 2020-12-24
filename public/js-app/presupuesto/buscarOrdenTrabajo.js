import fetchData from './fetchData.js';

//
// Buscar datos de orden de trabajo
//

function buscarOrdenTrabajo(id, url) {
	const endPoint = url + id;

	const data = fetchData.obtener(endPoint);

	data.then( resp => {
		if (resp.status) {
			//console.log(resp);
			return null;
		} else {
			_datosAlTabOrden(resp);	
			PRESUP.guardadoDeTabs.ordenTrabajo = false;		
		}
	});
}

export default buscarOrdenTrabajo;


const _datosAlTabOrden = resp => {

	$('#form_ordenTrab input[name=fechaTentativa]').val(resp.fechaTentativa);
	$('#form_ordenTrab input[name=fechaEjecucion]').val(resp.fechaEjecucion);
	$('#form_ordenTrab textarea[name=detalle]').val(resp.detalle);
	$('#form_ordenTrab select[name=idEmpleado]').val(resp.idEmpleado).change();
}