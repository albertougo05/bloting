import fetchData from './fetchData.js';

/**
 * Clase para ingreso y manejo de ambientes
 *
 * @param void
 */
class ManejoAmbientes {

	constructor(isMobile) {
		this.ambientes = [];
		this.isMobile = isMobile;
	}

	crearAmbiente() {
		const idTituloAmb = this.ambientes.length + 1;
		const obj = { idAmb: this.ambientes.length + 1,
					  titulo: 'Ambiente ' + idTituloAmb,
					  concepto: '',
					  importe: 0,
					  eliminado: false }
		this.ambientes.push(obj);
	}

	mostrarNuevoAmbiente() {	// Muestra ambiente en pantalla
		const index = this.ambientes.length;
		const uiAmbiente = new UiAmbiente(this.ambientes);

		uiAmbiente.pintarAmbiente(index);
	}

	eliminar(id) {
		const indice = parseInt(id);
		//this.ambientes.splice(indice, 1);		// Eliminar del array
		this.ambientes[indice-1].eliminado = true;
		const acordion = document.getElementById('accordionAmbientes');		// Eliminar de la pantalla
		acordion.childNodes.forEach((elem, idx) => {		// Elimina falsos nodos
			if (elem.id === undefined) {
				acordion.removeChild(acordion.childNodes[idx]);
				console.log('Encontró udefined...');
			}
		});

		const divCard = document.getElementById('idCardAmb-' + id);
		acordion.removeChild(divCard);
		//divCard.style.display = 'none';
		//acordion.removeChild(acordion.childNodes[indice]);
	}

	setImporte(id, importe) {
		const floatImp = COMMONS.realParseFloat(importe);
		this.ambientes[id-1].importe = this.ambientes[id-1].importe + floatImp;
		const uiAmbiente = new UiAmbiente(this.ambientes);
		uiAmbiente.updateInputsImportes(id, importe);
	}

	setAmbiente(idx, obj) {
		this.ambientes[idx].titulo = obj.titulo;
		this.ambientes[idx].concepto = obj.concepto;
		this.ambientes[idx].importe = obj.importe;
		this.ambientes[idx].eliminado = false;
	}

	getTitulo(id) {
		return this.ambientes[id-1].titulo;
	}

	getAmbientes() {
		return this.ambientes;
	}

	setConceptos() {
		this.ambientes;
	}

	eliminarAmbienteYProdsDelDisco(url, idpresup) {
		const ambsEliminados =  this.ambientes.filter(amb => {		// Filtrar ambientes borrados
			return amb.eliminado === true;
		});

		// Si no hay ambientes eliminados, retorna
		if (ambsEliminados.length === 0) {
			//console.log('NO hay ambientes eliminados.');
			return null;
		}

		ambsEliminados.forEach( amb => {
			const idamb = amb.idAmb;
			const endPoint = `${url}?idComprobante=${idpresup}&idAmbiente=${idamb}`;

			this.enviarPeticion(endPoint)
	            .then( data => {      // Si todo está Ok, data es un json
	                console.log('Resultado eliminar ambiente en disco:', data);
	            })
	            .catch( err => {
	                console.log('ERROR: ', err.message);
	                toastr.error("Error en Presupuesto", "Error al eliminar ambiente !!");
	            });

		});
	}

	async salvarAmbientes(url, idpresup) {
		this.ambientes = this.ambientes.filter(amb => {		// Filtrar ambientes borrados
			return amb.eliminado === false;
		});
		this.ambientes = this.ambientes.map( amb => {		// Cargar concepto e importe de cada ambiente
			amb.concepto = document.getElementById('conceptoAmbiente-' + amb.idAmb).value;
			amb.importe = COMMONS.realParseFloat(document.getElementById('importeAmbiente-' + amb.idAmb).value);
			return amb;
		});

		let formData = new FormData();
		formData.append('csrf_name', $('#form_comprob input[name=csrf_name]').val());
		formData.append('csrf_value', $('#form_comprob input[name=csrf_value]').val());
		formData.append('idComprobante', idpresup);

		this.ambientes.forEach((amb, idx) => {
			let indice = idx + 1;
			formData.append( 'idAmb_' + indice, indice );
			formData.append( 'titulo_' + indice, amb.titulo );
			formData.append( 'concepto_' + indice, amb.concepto );
			formData.append( 'importe_' + indice, amb.importe );
		});

        const options = { method: 'POST',
                          body: formData };

		const res = await fetch(url, options);
		const data = await res.json();
        //console.log('Status guardar ambientes:', data);
	}

	buscarAmbientes(id, url) {
		const endPoint = url + id;
		const data = fetchData.obtener(endPoint);

		data.then( resp => {
			if (resp.status) {
				//console.log(resp);
				return null;
			} else {
				resp.forEach( (amb, idx) => {
					if(idx > 0) {
						this.crearAmbiente();
						this.mostrarNuevoAmbiente();
					}
					this.setAmbiente(idx, amb);
					this.cargarDataEnAmb(amb);
				});
			}
		});
	}

	cargarDataEnAmb(amb) {
		document.getElementById('btnTituloAmb-' + amb.idAmbiente).innerHTML = amb.titulo;
		document.getElementById('conceptoAmbiente-' + amb.idAmbiente).value = amb.concepto;
		document.getElementById('importeAmbiente-' + amb.idAmbiente).value = amb.importe;
	}

	async enviarPeticion(url) {
		const response = await fetch(url);
		if (!response.ok) {    
			const message = `Un error ha occurrido: ${response.status}`;    
			throw new Error(message);  
		}
		const data = await response.json();

		return data;
	}

}


export default ManejoAmbientes;



/**
 * Clase para mostrar ambiente en la pantalla
 *
 * @param array ambientes
 */
class UiAmbiente {

	constructor(ambientes) {
		this.ambientes = ambientes;
	}



	pintarAmbiente(idx) {
		//const htmlCardHeader = this.__htmlHeader(this.ambientes[idx], idx);
		const htmlCreator = new CreaHtml();
		const htmlCardHeader = htmlCreator.htmlHeader(this.ambientes[idx-1], idx);
		const cardAmb = document.getElementById('accordionAmbientes');
		const idColapse = 'collapseAmb-1';		// collapse tab 1
		const divColapse = document.getElementById(idColapse);

		cardAmb.insertAdjacentHTML('beforeend', htmlCardHeader);		// Inserta el card del ambiente
		divColapse.classList.remove("show");		//	lo esconde
		this.__setInputMask('importeAmbiente-' + (idx));		// Set inputMask para el importe del ambiente
	}

	/**
	 * Actualiza inputs importes del ambiente y del presupuesto
	 * 
	 * @param  {integer} id
	 * @param  {float} importe
	 * @return null
	 */
	updateInputsImportes(id, importe) {
		const inputAmb      = document.getElementById('importeAmbiente-' + id);
		const inputPresup   = document.getElementById('importePresup');
		const importeAmb    = COMMONS.realParseFloat(inputAmb.value);
		const importePresup = COMMONS.realParseFloat(inputPresup.value);
		importe = COMMONS.realParseFloat(importe);

		inputAmb.value = importeAmb + importe;
		inputPresup.value = importePresup + importe;
	}

	__setInputMask(idElem) {

	    $('input#' + idElem).inputmask("numeric", {
	        radixPoint: ",",
	        groupSeparator: ".",
	        digits: 2,
	        autoGroup: true,
	        rightAlign: false,
	        unmaskAsNumber: true, 
	        allowPlus: false,
	    	allowMinus: false,
	        oncleared: function () { self.value = ''; }
	    });
	}

}

/**
 * Clase crea el html 
 *
 */
class CreaHtml {

	htmlHeader(elem, idx) {
		//console.log('Indice nuevo amb:', idx);
		const idCollap   = 'collapseAmb-' + idx;
		const cardHeader = 'cardHeader-' + idx;
		const card1 = this.__card1(idx, elem.titulo, idCollap, cardHeader);
		const card2 = this.__card2(idx, elem, idCollap, cardHeader);
		const card3 = this.__card3(idx);
		const card4 = this.__card4(idx);
		const card5 = this.__card5(idx);

		return card1 + card2 + card3 + card4 + card5;
	}
	__card1(idx, titulo, idCollap, cardHeader) {
		return `<div class="card" id="idCardAmb-${idx}">
					<div class="card-header" id="${cardHeader}">
						<h2 class="mb-0">
						<button id="btnTituloAmb-${idx}"
								type="button" 
								class="btn btn-link btn-sm font-weight-bold" 
								data-toggle="collapse" 
								data-target="#${idCollap}" 
								aria-expanded="true" 
								aria-controls="${idCollap}">
							${titulo}
						</button>
						</h2>
					</div>`;
	}

	__card2(idx, elem, idCollap, cardHeader) {
		return `<div id="${idCollap}" 
					 class="collapse show" 
					 aria-labelledby="${cardHeader}" 
					 data-parent="#accordionAmbientes">
		      		<div class="card-body">
	      				<div class="row">
	      					<div class="col ml-1 mr-1 mb-2">
	      						<label class="lblPresup mt-0 mb-0" for="conceptoAmbiente-${idx}">Concepto</label>
	      						<textarea id="conceptoAmbiente-${idx}" class="form-control form-control-sm concepto" placeholder="Conceptos ambiente ${idx}" rows="1"></textarea>
	      					</div>
	      				</div>`;
	}

	__card3(idx) {
		return `<div id="divTablaProductosAmbiente-${idx}">
					<div class="row">
						<div class="col ml-1 mr-1 mb-2">
							<div class="table-responsive-sm">
								<table id="table-productos" class="table table-bordered table-hover table-sm mb-1">
									<thead>
										<tr>
											<th colspan="4" class="text-center">Grilla Productos</th>
											<th colspan="3" class="text-center">Medidas Trabajo</th>
											<th colspan="4" class="text-center">Medidas Placas</th>
											<th colspan="4" class="text-center">Cantidad Placas</th>
											<th></th>
										</tr>
										<tr>
											<th scope="col" class="head2">Tipo Prod.</th>
											<th scope="col" class="head2">Id</th>
											<th scope="col" class="head2">Descripción</th>
											<th scope="col" class="head2">Concepto</th>
											<th scope="col" class="head2 cell-right">Ancho</th>
											<th scope="col" class="head2 cell-right">Alto</th>
											<th scope="col" class="head2 cell-right">Mts/2</th>
											<th scope="col" class="head2 cell-right">Ancho</th>
											<th scope="col" class="head2 cell-right">Alto</th>
											<th scope="col" class="head2 cell-right">Mts/2</th>
											<th scope="col" class="head2 cell-right">Precio</th>
											<th scope="col" class="head2 cell-right">En Ancho</th>
											<th scope="col" class="head2 cell-right">En Alto</th>
											<th scope="col" class="head2 cell-right">Total</th>
											<th scope="col" class="head2 cell-right">$ Total</th>
											<th scope="col" class="head2 cell-right">Estado Item</th>
										</tr>
									</thead>
									<tbody id="idBodyTablaProds-${idx}">

									</tbody>
								</table>
							</div>
						</div>
					</div>
				</div>`;
	}

	__card4(idx) {
		let lin = `<button id="btnAgregarProdsAmbiente"
	      				onclick="PRESUP.onClickBtnAgregarProd(${idx})"
	      				type="button" 
	      				class="btn btn-sm btn-primary ml-1">
	      			Agregar producto
	      		</button>`;

		if (this.isMobile) {
			lin = '<div>' + lin + '</div>';
		}

	    return lin;
	}

	__card5(idx) {
		return `</div>
					<div class="card-footer">
						<div class="d-flex justify-content-end mb-3">
							<label class="lblPresup" for="importeAmbiente-${idx}">Importe Ambiente ${idx}</label>
							<div>
								<div class="input-group input-group-sm">
									<div class="input-group-prepend input-group-sm">
										<span class="input-group-text">$</span>
									</div>
									<input id="importeAmbiente-${idx}" class="form-control form-control-sm cell-right" type="text">
								</div>
							</div>
						</div>
						<div class="d-flex justify-content-end">
							<button id="btnEliminaAmbiente-${idx}" 
									onclick="PRESUP.onClickBtnEliminaAmb(${idx})"
									type="button" 
									class="btn btn-sm btn-danger">
								Eliminar ambiente ${idx}
							</button>
						</div>
					</div>
				</div>
			</div>`;
	}


}

