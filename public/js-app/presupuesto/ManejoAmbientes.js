/**
 * Clase para ingreso y manejo de ambientes
 *
 * @param void
 */
class ManejoAmbientes {

	constructor() {
		this.ambientes = [];
		this.productos = [];
	}

	crearAmbiente() {
		const idTituloAmb = this.ambientes.length + 1;
		const obj = { id: this.ambientes.length,
					  titulo: 'Ambiente ' + idTituloAmb,
					  concepto: '',
					  eliminado: false }

		this.ambientes.push(obj);
	}

	mostrarNuevoAmbiente() {	// Muestra ambiente en pantalla
		const index = this.ambientes.length - 1;
		//document.getElementById('accordionAmbientes').innerHTML = '';

		const uiAmbiente = new UiAmbiente(this.ambientes);

		//this.ambientes.forEach((e, idx) => {
			//uiAmbiente.pintarAmbiente(e, idx);
		//});
		uiAmbiente.pintarAmbiente(index);
	}

	eliminar(id) {
		const indice = parseInt(id);
		//this.ambientes.splice(indice, 1);		// Eliminar del array
		this.ambientes[indice].eliminado = true;
		const acordion = document.getElementById('accordionAmbientes');		// Eliminar de la pantalla
		acordion.childNodes.forEach((elem, idx) => {		// Elimina falsos nodos
			if (elem.id === undefined) {
				acordion.removeChild(acordion.childNodes[idx]);
			}
		});

		const divCard = document.getElementById('idCardAmb-' + id);
		divCard.style.display = 'none';
		//acordion.removeChild(acordion.childNodes[indice]);
	}

	getTitulo(id) {
		return this.ambientes[id].titulo;
	}

	getAmbientes() {
		return this.ambientes;
	}

	setConcepto(id, value) {
		this.ambientes[id].concepto = value;
	}

}


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
		const htmlCardHeader = this.__htmlHeader(this.ambientes[idx], idx);
		const cardAmb = document.getElementById('accordionAmbientes');
		const idColapse = 'collapseAmb-' + (idx - 1);
		const divColapse = document.getElementById(idColapse);

		cardAmb.insertAdjacentHTML('beforeend', htmlCardHeader);		// Inserta el card del ambiente
		divColapse.classList.remove("show");
	}

	__htmlHeader(elem, idx) {
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
						<button type="button" 
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
		const nroAmb = idx + 1;

		return `<div id="${idCollap}" 
					 class="collapse show" 
					 aria-labelledby="${cardHeader}" 
					 data-parent="#accordionAmbientes">
		      		<div class="card-body">
	      				<div class="row">
	      					<div class="col ml-1 mr-1 mb-2">
	      						<textarea id="conceptoAmbiente-${idx}" class="form-control form-control-sm font-weight-bold concepto" placeholder="Conceptos del ambiente ${nroAmb}" rows="1"></textarea>
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
											<th colspan="3" class="text-center">Medidas Placas</th>
											<th colspan="3" class="text-center">Cantidad Placas</th>
											<th></th>
										</tr>
										<tr>
											<th scope="col" class="head2">Tipo Prod.</th>
											<th scope="col" class="head2">Código</th>
											<th scope="col" class="head2">Descripción</th>
											<th scope="col" class="head2">Concepto</th>
											<th scope="col" class="head2 cell-right">Ancho</th>
											<th scope="col" class="head2 cell-right">Alto</th>
											<th scope="col" class="head2 cell-right">Mts2/Mts</th>
											<th scope="col" class="head2 cell-right">Ancho</th>
											<th scope="col" class="head2 cell-right">Alto</th>
											<th scope="col" class="head2 cell-right">Mts2/Mts</th>
											<th scope="col" class="head2 cell-right">Cant. Ancho</th>
											<th scope="col" class="head2 cell-right">Cant. Alto</th>
											<th scope="col" class="head2 cell-right">Cant. Placas</th>
											<th scope="col" class="head2">Estado Item</th>
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
		return `<button id="btnAgregarProdsAmbiente"
	      				onclick="PRESUP.onClickBtnAgregarProd(${idx})"
	      				type="button" 
	      				class="btn btn-sm btn-primary ml-1">
	      			Agregar producto
	      		</button>`;
	}

	__card5(idx) {
		const nroAmb = idx + 1;

		return `</div>
					<div class="card-footer d-flex justify-content-end">
						<button id="btnEliminaAmbiente-${idx}" 
								onclick="PRESUP.onClickBtnEliminaAmb(${idx})"
								type="button" 
								class="btn btn-sm btn-danger">
							Eliminar ambiente ${nroAmb}
						</button>
					</div>
				</div>
			</div>`;
	}

	__numberFormat(num) {
	  return (
	    num
			.toFixed(2) // always two decimal digits
			.replace('.', ',') // replace decimal point character with ,
			.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.')
	  ) // use . as a separator
	}

}


export default ManejoAmbientes;