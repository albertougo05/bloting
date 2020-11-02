//
// Clase con funciones para ingreso de productos
//

class IngresoProds {

	constructor(productos) {

		this.productos = productos;
		this.prodSelecEnModal = {};
		this.productosSelecEnAmbiente = [];		// {idAmb: x, idTipoProd: x, idProd: x, ... }
		this.ancho = 0;
		this.alto = 0;
	}

	resetForm() {
		document.getElementById("selTipoProd").options[0].selected = "true";
		this.changeSelecTipoProd(1);
		//document.getElementById("selProductos").options[0].selected = "true";
		document.getElementById("placaMedidaAncho").value = '';
		document.getElementById("placaMedidaAlto").value  = '';
		document.getElementById("conceptoTrabajo").value = '';
		document.getElementById("anchoTrabajo").value = '';
		document.getElementById("altoTrabajo").value = '';
		document.getElementById("mts2Trabajo").value = '';
		document.getElementById("tdCantPlacSugAncho").innerHTML = 0;
		document.getElementById("tdCantPlacSugAlto").innerHTML = 0;
		document.getElementById("tdCantPlacSugCant").innerHTML = 0;
		document.getElementById("tdPlacasCubrenMts2").innerHTML = 0;
		document.getElementById("selEstado").options[0].selected="true";
		this.prodSelecEnModal = {};
	}

	changeSelecTipoProd(id) {		// Al cambiar select Tipo de producto
		let prods = this.productos.filter(function(elem) {		// Busco productos del tipo selecionado...
			return elem.idTipoProd == id;
		});

		this._rellenarSelProds(prods);
	}

	changeSelecProd(id) {
		// Buscar index del producto  -  let obj = arr.find(o => o.name === 'string 1');
		const prod = this.productos.find(o => o.id == id);
		const mts2 = parseFloat(prod.ancho) * parseFloat(prod.ancho);

		this.prodSelecEnModal = prod;		// Producto seleccionado

		document.getElementById("placaMedidaAncho").value = this._numberFormat(prod.ancho);
		document.getElementById("placaMedidaAlto").value  = this._numberFormat(prod.alto);
		document.getElementById("tdPlacasCubrenMts2").innerHTML = this._numberFormat(mts2);
	}

	calculoMedidas() {
		const ancho = this._cambiarComasPorPuntos(document.getElementById("anchoTrabajo").value);
		const alto  = this._cambiarComasPorPuntos(document.getElementById("altoTrabajo").value);

		if ( this.prodSelecEnModal.id ) {
			const trabAncho = parseFloat( ancho );
			const trabAlto  = parseFloat( alto );
			const mts2Trabajo = trabAncho * trabAlto;

			let cantAncho = trabAncho / parseFloat(this.prodSelecEnModal.ancho);
			cantAncho = Math.ceil(cantAncho);		// Convierte float a próximo entero
			let cantAlto = trabAlto / parseFloat(this.prodSelecEnModal.alto);
			cantAlto = Math.ceil(cantAlto);
			const cantPlacas = cantAlto === 0 ? cantAncho : cantAncho * cantAlto;
			const cantMts2 = cantPlacas * (parseFloat(this.prodSelecEnModal.ancho) * parseFloat(this.prodSelecEnModal.alto));

			this._actualizoTablas(mts2Trabajo, cantMts2, cantAlto, cantAncho, cantPlacas);
		}
	}

	setIdAmbienteSelec(id) {
		this.idAmbienteSelecionado = id;
	}

	setProductoSeleccionado() {		// Cuando se selecciona un producto en el modal
		// Armar objeto del producto
		const obj = this._armarObjProducto();

console.log('Objeto producto:', obj.idAmb, obj.idTipoProd, obj.mts2Trabajo, obj.estadoItem);

		// Agregar objeto al array de productos en ambientes
		this.productosSelecEnAmbiente.push(obj);
		// Producto a la lista de productos de pantalla
		const uiTabProds = new UiTablaProductos();
		uiTabProds.insertarProd(obj, this.idAmbienteSelecionado);
	}

	_armarObjProducto() {
		const selTipoProd = document.getElementById('selTipoProd');
		const selProducts = document.getElementById('selProductos');
		const selEstado   = document.getElementById('selEstado');

		return { idAmb:         this.idAmbienteSelecionado,
				 idTipoProd:    selTipoProd.value,
				 tipoProduc:    selTipoProd.options[ selTipoProd.selectedIndex ].text,	 // Tipo Prod    -- GRILLA PRODUCTOS
				 idProducto:    selProducts.value,										 // Código
				 producto:      selProducts.options[ selProducts.selectedIndex ].text,	 // Descripcion
				 concepTrab:    document.getElementById('conceptoTrabajo').value,		 // Concepto
				 anchoTrab:     document.getElementById('anchoTrabajo').value,			 // Ancho        -- MEDIDAS TRABAJO
				 altoTrab:      document.getElementById('altoTrabajo').value,			 // Alto
				 mts2Trabajo:   document.getElementById('mts2Trabajo').value,			 // Mts2/Mts
				 anchoPlaca:    document.getElementById('placaMedidaAncho').value,		 // Ancho        -- MEDIDAS PLACAS
				 altoPlaca:     document.getElementById('placaMedidaAlto').value,		 // Alto
				 mts2Placas:    document.getElementById('tdPlacasCubrenMts2').innerHTML, // CubrenMts2
				 cantPlacAncho: document.getElementById('tdCantPlacSugAncho').innerHTML, // Cant. Ancho  -- CANTIDAD DE PLACAS
				 cantPlacAlto:  document.getElementById('tdCantPlacSugAlto').innerHTML,  // Cant. Alto
				 cantPlacas:    document.getElementById('tdCantPlacSugCant').innerHTML,  // Cant. Placas
				 idEstadoItem:  selEstado.value,										 // id Estado
				 estadoItem:    selEstado.options[ selEstado.selectedIndex ].text
		};
	}

	_cambiarComasPorPuntos(value) {
		if (value === '') return 0;
		return value.replace(',', '.');
	}

	_numberFormat(num) {
	  return (
	    num
	      .toFixed(2) // always two decimal digits
	      .replace('.', ',') // replace decimal point character with ,
	      .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.')
	  ) // use . as a separator
	}

	_itemASelect(selectBox, value, text) {
		const newOption  = document.createElement('option');
		const optionText = document.createTextNode(text);  //document.createTextNode(prod.descripcion);

		newOption.appendChild(optionText);			// set option text
		newOption.setAttribute('value', value);	// and option value  -->> prod.id
		selectBox.appendChild(newOption);			// add the option to the select box
	}

	_rellenarSelProds(prods) {
		let selProds = document.getElementById("selProductos");
		selProds.options.length = 0;		// Vacio select Productos

		this._itemASelect(selProds, 0, 'Selecione producto');

		prods.forEach(function (prod) {		// Llenar select Productos
			this._itemASelect(selProds, prod.id, prod.descripcion);
		}, this);
	}

	_actualizoTablas(mtsTrab, mts2, alto, ancho, cant) {
		document.getElementById("mts2Trabajo").value = this._numberFormat(mtsTrab);
		document.getElementById("tdCantPlacSugAncho").innerHTML = ancho;
		document.getElementById("tdCantPlacSugAlto").innerHTML  = alto;	
		document.getElementById("tdCantPlacSugCant").innerHTML  = cant;
		document.getElementById("tdPlacasCubrenMts2").innerHTML = this._numberFormat(mts2);
	}

}


/**
 * Manejo de la tabla de productos
 */
class UiTablaProductos {

	insertarProd(obj, idx) {
		const idElem = `idBodyTablaProds-${idx}`;
		const body = document.getElementById(idElem);
		// Armo la linea
		const linea = this.__lineaProd(obj);
		// Inserto linea en tabla
		body.appendChild(linea);
	}

	__lineaProd(objProd) {
		const idxsNot = [];		// Indices del obj que no van a la tabla
		let tr = document.createElement('tr'),
			td = {};
		const arrIndexs = this.__varsProdsVanATabla();

		arrIndexs.forEach( (elem, idx) => {
			td = document.createElement('td');
			td.textContent = objProd[elem];
			if (idx == 1 || idx > 3) {
  				td.classList.add('cell-right');
  			}
  			tr.appendChild(td);
		});

		return tr;
	}

	__varsProdsVanATabla() {	// Lista de indices del objeto de producto seleccionado
		return ['tipoProduc', 'idProducto', 'producto', 'concepTrab', 'anchoTrab', 'altoTrab', 
				'mts2Trabajo', 'anchoPlaca', 'altoPlaca', 'mts2Placas', 'cantPlacAncho',
				'cantPlacAlto', 'cantPlacas', 'estadoItem'];
	}


}


export default IngresoProds;
