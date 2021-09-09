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
		const obj = { id: PRESUP.id_registro,
					  idComprobante: PRESUP.nroComprobante,
					  idAmbiente: this.ambientes.length + 1,
					  titulo: 'Ambiente ' + idTituloAmb,
					  concepto: '',
					  importe: 0,
					  eliminado: false }
		this.ambientes.push(obj);
	}

	mostrarNuevoAmbiente() {	// Muestra ambiente en pantalla
		const uiAmbiente = new UiAmbiente(this.ambientes);

		uiAmbiente.pintarAmbiente();
	}

	eliminar(id) {
		const indice = parseInt(id);
		//this.ambientes.splice(indice, 1);		// Eliminar del array
		this.ambientes[indice - 1].eliminado = true;
		const uiAmbiente = new UiAmbiente([]);
		uiAmbiente.eliminarAcordionChild(id);
	}

	setImporte(id, importe) {
		//console.log('Id amb:', id, 'Importe:', importe);
		const floatImp = COMMONS.realParseFloat(importe);
		//this.ambientes[id-1].importe = this.ambientes[id-1].importe + floatImp;
		this.ambientes.map(function(elem) {
			if (elem.idAmbiente == id) {
				elem.importe = importe;
			}
		});

		const uiAmbiente = new UiAmbiente(this.ambientes);
		uiAmbiente.updateInputsImportes(id, importe);
	}

	setAmbiente(idx, obj) {
		this.ambientes[idx].id = obj.id;
		this.ambientes[idx].idComprobante = obj.idComprobante;
		this.ambientes[idx].idAmbiente = obj.idAmbiente;
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

	async salvarAmbientes(url) {
		if (this.ambientes.length > 0) {

			this.ambientes = this.ambientes.map( amb => {		// Cargar concepto e importe de cada ambiente
				if (!amb.eliminado) {
					amb.concepto = document.getElementById('conceptoAmbiente-' + amb.idAmbiente).value;
					amb.importe  = COMMONS.realParseFloat(document.getElementById('importeAmbiente-' + amb.idAmbiente).value);
				} 

				return amb;
			});
			//console.log('Ambientes a guardar (salvarAmbientes):', this.ambientes);
			let datos = {
				csrf_name: $('#form_comprob input[name=csrf_name]').val(),
				csrf_value: $('#form_comprob input[name=csrf_value]').val(),
				//idComprobante: idpresup,
				ambientes: this.ambientes
			}

			datos = JSON.stringify(datos);
	        const options = { method: 'POST',
	        				  headers: {
	      						'Content-Type': 'application/json' },
	                          body: datos };
	        const res = await fetch(url, options);
			const data = await res.json();
		}
		return null;
	}

	buscarAmbientes(id, url) {
		const endPoint = url + id;
		const data = fetchData.obtener(endPoint);

		data.then( resp => {

			if (resp.status) {
				return null;
			} else {
				resp.forEach( (amb, idx) => {
					//console.log('Carga ambiente: ', amb, 'Idx:', idx);
					if ( idx > 0 ) {
						this.crearAmbiente();
						this.setAmbiente(idx, amb);
					} else {
						const uiAmbiente = new UiAmbiente([]);
						uiAmbiente.eliminarAcordionChild(1);	// Elimina el Ambiente 1
						this.setAmbiente(idx, amb);
					}

					this.mostrarNuevoAmbiente();
					document.getElementById('btnTituloAmb-' + amb.idAmbiente).innerHTML = amb.titulo;
					document.getElementById('conceptoAmbiente-' + amb.idAmbiente).value = amb.concepto;
					document.getElementById('importeAmbiente-' + amb.idAmbiente).value = amb.importe;
				});

				PRESUP._ingresoProds.buscarProductos(id, PRESUP.pathGetProductos);
			}
		});
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

	pintarAmbiente() {
		//const htmlCardHeader = this.__htmlHeader(this.ambientes[idx], idx);
		const idx = this.ambientes.length - 1;
		const htmlCreator = new CreaHtml();
		const htmlCardHeader = htmlCreator.htmlHeader(this.ambientes[idx]);
		const cardAmb = document.getElementById('accordionAmbientes');
		//const idColapse = 'collapseAmb-1';		// collapse tab 1
		//const divColapse = document.getElementById(idColapse);

		cardAmb.insertAdjacentHTML('beforeend', htmlCardHeader);		// Inserta el card del ambiente
		//if (divColapse) divColapse.classList.remove("show");		//	lo esconde, si lo encuentra
		this.__setInputMask('importeAmbiente-' + (this.ambientes[idx].idAmbiente));		// Set inputMask para el importe del ambiente
		//console.log('Indice importe nuevo ambiente:', this.ambientes[idx].idAmbiente);

	}

	eliminarAcordionChild(id) {
		const acordion = document.getElementById('accordionAmbientes');		// Eliminar de la pantalla

		acordion.childNodes.forEach((elem, idx) => {		// Elimina falsos nodos
			if (elem.id === undefined) {
				acordion.removeChild(acordion.childNodes[idx]);
				//console.log('Encontró udefined...');
			}
		});

		const divCard = document.getElementById('idCardAmb-' + id);
		acordion.removeChild(divCard);
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
 * 
 * Clase crea el html 
 *
 */
class CreaHtml {

	htmlHeader(elem) {		// Quito el parametro idx
		//console.log('Indice nuevo amb:', idx);
		const idCollap   = 'collapseAmb-' + elem.idAmbiente;
		const cardHeader = 'cardHeader-' +  elem.idAmbiente;
		const card1 = this.__card1( elem.idAmbiente, elem.titulo, idCollap, cardHeader );
		const card2 = this.__card2( elem.idAmbiente, elem, idCollap, cardHeader );
		const card3 = this.__card3( elem.idAmbiente );
		const card4 = this.__card4( elem.idAmbiente );
		const card5 = this.__card5( elem.idAmbiente );

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
	      						<textarea id="conceptoAmbiente-${idx}" class="form-control form-control-sm concepto" placeholder="Ingrese conceptos ambiente ${idx}" rows="1"></textarea>
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
						<div class="d-flex justify-content-end mb-2">
							<label class="lblPresup mr-2" for="importeAmbiente-${idx}">Importe Ambiente ${idx}</label>
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

