import fetchData from './fetchData.js';

//
// UI de Extras (Revealing Module Pattern)
//

var uiDeExtras = ( function() {

    /**
     * FUNCIONES PUBLICAS
     */

    // Si el tab tiene puesto el empleado, ese es el estado
    const ingresoTabla = (obj, idx) => {
    	const indice = idx - 1;

		_agregaLineaTabla(obj, indice);
		_vaciarInputs();
    }

    const buscarExtras = (id, url) => {
    	_limpiarTablaExtras();
    	const endPoint = url + id;
		const data = fetchData.obtener(endPoint);

		data.then( resp => {
			if (resp.status) {
				console.log(resp);
				return null;
			} else {
				const lista = resp.map(extra => {
					return { descripcion: extra.descripcion,
							 importe: extra.importe
					};
				});

				lista.forEach( (list, idx) => {
					_agregaLineaTabla(list, idx);
				});
				PRESUP.listaDeExtras = lista;
			}
		});
    }

	/**
     * FUNCIONES PRIVADAS
     */

    // 
    const _agregaLineaTabla = (data, idx) => {
    	const bodyTabla = document.getElementById(('bodyTablaExtras'));

    	const cols = _columnas(data, idx);

    	bodyTabla.appendChild(cols);
    }

    const _columnas = (data, idx) => {
    	const index = idx + 1;
    	const importe = COMMONS.currencyFormat(data.importe);

    	let trElem = document.createElement('tr');
    	trElem.innerHTML = `<th scope="row" class="text-center pl-0 pr-0">${index}</th>`;
		trElem.innerHTML += `<td class="text-center pl-0 pr-0">${data.descripcion}</td>`;
		trElem.innerHTML += `<td class="text-center pl-0 pr-0">$ ${importe}</td>`;
		trElem.innerHTML += `<td class="text-center pl-0 pr-0">
								<button 
									type="button" 
									id="btnBorrarExtra-${idx}" 
									onclick="PRESUP.onClickBtnBorrarExtra(this);" 
									data-idx=${idx}
									class="btn btn-danger btn-sm"
									data-toggle="tooltip"
									data-placement="right"
									title="Borrar">
									<i class="fas fa-trash-alt"></i>
								</button>
		                    </td>`;

		return trElem;
    }

	const _vaciarInputs = () => {
		const desc = document.getElementById('descripcionExtras');
		desc.value = '';
		document.getElementById('importeExtra').value = '';
		desc.focus();
	}

	const _limpiarTablaExtras = () => {
		const bodyTabla = document.getElementById('bodyTablaExtras');
		bodyTabla.innerHTML = '';
		PRESUP.listaDeExtras = [];
	}


    // Aqui se retornan la funciones públicas
    return {
        ingresoTabla: ingresoTabla,
        buscarExtras: buscarExtras,

    };

})();


export default uiDeExtras;