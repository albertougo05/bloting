import fetchData from './fetchData.js';

//
// Funcion para buscar comprobante y llenar TODO el formulario
// 

async function buscarComprobante(id, url) {
	const endPoint = url + id;
	const data = fetchData.obtener(endPoint);

	await data.then( resp => {
		_datosAlFormulario(resp);
	});
}

export default buscarComprobante;


let _datosAlFormulario = function (data) { 

	$('input#id').val(data.id);
	$('input#fecha').val(data.fecha);
	$('input#fechaAnulaoElimina').val(data.fechaAnulaoElimina);
	$('input#fechaUltimoCambio').val(data.fechaUltimoCambio);
	$('select#idEstado').val(data.idEstado).change();;
	$('select#idSucursal').val(data.idSucursal).change();;
	$('input#nroComprobante').val(data.nroComprobante);
	$('input#idComprobPant').val(data.nroComprobante);
	$('input#id_cliente').val(data.id);
	$('input#nombre').val(data.nombre);
	$('input#domicilio').val(data.domicilio);
	$('input#localidad').val(data.localidad);
	$('input#codPostal').val(data.codPostal);
	$('select#provincia').val(data.provincia).change();;
	$('select#pais').val(data.pais).change();;
	$('input#telefono').val(data.telefono);
	$('input#celular').val(data.celular);
	$('input#cuitdni').val(data.cuitdni);
	$('input#contacto').val(data.contacto);
	$('input#email').val(data.email);
	$('input#importe').val(data.importe);
	$('form#form_presup2 input[name=importePresup]').val(data.importe);
	$('textarea#observaciones').val(data.observaciones);

	$('#btnImprime').prop('disabled', false);

	return null;
}
