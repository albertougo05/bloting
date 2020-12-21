import fetchData from './fetchData.js';

//
// Buscar datos del tab Presupuesto
//

function buscarPresupuesto(id, url) {
	const endPoint = url + id;
	const data = fetchData.obtener(endPoint);

	data.then( resp => {
		if (resp.status) {
			//console.log(resp);
			return null;
		} else {
			_mostrarPresupuesto(resp);
		}
	});
}

export default buscarPresupuesto;


const _mostrarPresupuesto = data => {
	const form1 = document.getElementById('form_presup1');
	form1.querySelector('input#fechaPresup').value = data.fechaPresup;
	form1.querySelector('input#fechaVencimiento').value = data.fechaVencimiento;
	form1.querySelector('select#idEmpleado').value = data.idEmpleado;

	const form2 = document.getElementById('form_presup2');
	form2.querySelector('input#totalMts2Revest').value = data.totalMts2Revest;
	form2.querySelector('input#totalMts2Cielorraso').value = data.totalMts2Cielorraso;
	form2.querySelector('input#totalMtsMolduras').value = data.totalMtsMolduras;
	form2.querySelector('input#importePresup').value = data.importePresup;
	form2.querySelector('textarea#formaDePago').value = data.formaDePago || '';
	form2.querySelector('input#entrega').value = data.entrega;
}
