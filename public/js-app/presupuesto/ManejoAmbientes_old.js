//
// Clase para ingreso y manejo de ambientes
//


class ManejoAmbientes {

	constructor() {
		this.ambientes = [];
		this.productos = [];
	}

	resetForm() {
		document.getElementById("tituloAmbiente").value = '';
		document.getElementById("anchoTrabajo").value = '';
		document.getElementById("altoTrabajo").value = '';
		document.getElementById("conceptoAmbiente").value = '';
	}

	cargarAmbiente(obj) {
		obj.id = this.ambientes.length;

		console.log(obj.id, obj.titulo, obj.ancho, obj.alto, obj.concepto);

		this.ambientes.push(obj);
	}

	mostrarAmbientes() {	// Muestra todos los ambientes en pantalla
		// Vacio accordionAmbientes
		document.getElementById('accordionAmbientes').innerHTML = '';

		this.ambientes.forEach((e, idx) => {
			this.__uiAmbiente(e, idx, this);
		}, this);
	}

	__uiAmbiente(elem, idx, that) {
		const htmlCardHeader = that.__htmlHeader(elem, idx, that);

		const cardAmb = document.getElementById('accordionAmbientes');
		//cardAmb.appendChild(cardHeader);
		//cardAmb.innerHTML = cardHeader;
		cardAmb.insertAdjacentHTML('beforeend', htmlCardHeader);
	}

	__htmlHeader(elem, idx, that) {
		const card1 = that.__card1(idx, elem.titulo);
		const card2 = that.__card2(idx, elem.concepto);
		const card3 = that.__card3(idx);

		return card1 + card2 + card3;
	}

	__card1(idx, titulo) {
		const idCollap = 'collapseAmb-' + idx;
		const cardNro    = 'cardNro-' + idx;

		return `<div class="card">
					<div class="card-header" id="${cardNro}">
						<h2 class="mb-0">
						<button type="button" 
								class="btn btn-link btn-sm" 
								data-toggle="collapse" 
								data-target="#${idCollap}" 
								aria-expanded="true" 
								aria-controls="${idCollap}">
							${titulo}
						</button>
						</h2>
					</div>`;
	}

	__card2(idx, concept) {
		const idCollap = 'collapseAmb-' + idx;
		const cardNro    = 'cardNro-' + idx;
		const showCard = (this.)

		return `<div id="${idCollap}" 
					 class="collapse" 
					 aria-labelledby="${cardNro}" 
					 data-parent="#accordionAmbientes">
		      		<div class="card-body">
		      			<p class="p-modal ml-4 mr-4">${concept}</p>
		      			<div id="divTablaProductosAmbiente-${idx}">
	      				</div>`;
	}

	__card3(idx) {
		const idBtn = 'btnEliminaAmbiente-' + idx;

		return `</div>
					<div class="card-footer p-4 d-flex justify-content-end">
						<button id="${idBtn}" 
								onclick="PRESUP.onClickBtnEliminaAmb(${idx})"
								data-idAmbiente="${idx}"
								type="button" 
								class="btn btn-sm btn-danger">
							Eliminar ambiente
						</button>
					</div>
				</div>
			</div>`;
	}

}


export default ManejoAmbientes;