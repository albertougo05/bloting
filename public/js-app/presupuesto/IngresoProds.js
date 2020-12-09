import fetchData from './fetchData.js';

//
// Clase con funciones para ingreso de productos
//

class IngresoProds {

	constructor(productos, estadosItem) {

		this.productos = productos;
		this.estadosItem = estadosItem;
		this.prodSelecEnModal = {};
		this.productosSelecEnAmbiente = [];		// {idAmbiente: x, idTipoProd: x, idProd: x, ... }
		this.ancho = 0;
		this.alto = 0;
		this.importeAmbEliminado = 0;
	}

	resetFormModal() {
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
		document.getElementById("tdPlacaPrecioXmt2").innerHTML = 0;
		//document.getElementById("selEstado").options[0].selected="true";
		document.getElementById("importeProd").value = '';
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
		const precio = parseFloat(prod.precio);

		this.prodSelecEnModal = prod;		// Producto seleccionado

		document.getElementById("placaMedidaAncho").value = this._numberFormat(prod.ancho);
		document.getElementById("placaMedidaAlto").value  = this._numberFormat(prod.alto);
		document.getElementById("tdPlacasCubrenMts2").innerHTML = this._numberFormat(mts2);
		document.getElementById("tdPlacaPrecioXmt2").innerHTML = this._numberFormat(precio);
	}

	calculoMedidas() {
		const ancho = this._cambiarComasPorPuntos(document.getElementById("anchoTrabajo").value);
		const alto  = this._cambiarComasPorPuntos(document.getElementById("altoTrabajo").value);
		const precio = this._cambiarComasPorPuntos(document.getElementById("tdPlacaPrecioXmt2").innerHTML);
		let cantAlto = 0,
			cantPlacas = 0,
			cantMts2 = 0;

		if ( this.prodSelecEnModal.id ) {
			const trabAncho = parseFloat( ancho );
			const trabAlto  = parseFloat( alto );
			const mts2Trabajo = trabAncho * trabAlto;

			let cantAncho = trabAncho / parseFloat(this.prodSelecEnModal.ancho);
			cantAncho = Math.ceil(cantAncho);		// Convierte float a próximo entero

			if (this.prodSelecEnModal.alto > 0) {
				cantAlto = trabAlto / parseFloat(this.prodSelecEnModal.alto);
				cantAlto = Math.ceil(cantAlto);		
				cantPlacas = cantAncho * cantAlto;
				cantMts2 = cantPlacas * (parseFloat(this.prodSelecEnModal.ancho) * parseFloat(this.prodSelecEnModal.alto));
			} else {
				cantPlacas = cantAncho;
				cantMts2   = cantPlacas * parseFloat(this.prodSelecEnModal.ancho);
			}

			const totPrecioMt2 = parseFloat( precio ) * cantMts2;

			this._actualizoTablas(mts2Trabajo, cantMts2, cantAlto, cantAncho, cantPlacas, totPrecioMt2);
		}
	}

	setIdAmbienteSelec(id) {
		this.idAmbienteSelecionado = id;
	}

	getIdAmbienteSelec() {
		return this.idAmbienteSelecionado;
	}

	setProductoSeleccionado() {		// Cuando se selecciona un producto en el modal
		const obj = this._armarObjProducto();		// Armar objeto del producto
		// Agregar objeto al array de productos en ambientes
		this.productosSelecEnAmbiente.push(obj);
		// Producto a la lista de productos de pantalla
		const uiTabProds = new UiTablaProductos(this.estadosItem);
		uiTabProds.insertarProd( obj, this.idAmbienteSelecionado );
	}

	getMedidasProdSelec(id) {
		const lastId = this.productosSelecEnAmbiente.length - 1,
			idTipoProd = this.productosSelecEnAmbiente[lastId].idTipoProducto,
			obj = { totalMts2Revest: 0,
					totalMts2Cielorraso: 0,
					totalMtsMolduras: 0 };

		switch (idTipoProd) {
			case '1':		// Revestimiento
				obj.totalMts2Revest = COMMONS.realParseFloat( this.productosSelecEnAmbiente[lastId].mts2Placas );
				break;
			case '2':		// Cielorraso
				obj.totalMts2Cielorraso = COMMONS.realParseFloat( this.productosSelecEnAmbiente[lastId].mts2Placas );
				break;
			case '3':		// Molduras
				obj.totalMtsMolduras = COMMONS.realParseFloat( this.productosSelecEnAmbiente[lastId].mts2Placas );
				break;
		}

		return obj;
	}

	validarModalProd() {
		let retorno = { notPass: false };
		const concepto = document.getElementById("conceptoTrabajo").value;
		const ancho    = this._cambiarComasPorPuntos(document.getElementById("anchoTrabajo").value);
		// EL ALTO PUEDE SER CERO, POR SI ES MOLDURA
		//const alto     = document.getElementById("altoTrabajo").value;
		//const importe  = COMMONS.realParseFloat(document.getElementById("importeProd").value);

		if (concepto.trim() === '') {
			retorno.notPass = true;
			retorno.message = 'Ingrese concepto !';
			retorno.elem = '#conceptoTrabajo';
		} else if ( parseFloat(ancho) === 0 ) {
			retorno.notPass = true;
			retorno.message = 'Ingrese Ancho del trabajo !';
			retorno.elem = '#anchoTrabajo';
		} // else if (importe === 0) {
		//	retorno.notPass = true;
		//	retorno.message = 'Ingrese importe !';
		//	retorno.elem = '#importeProd';
		//}

		// OPCIONAL: EL IMPORTE PUEDE SER CERO

		return retorno;
	}

	getImporteProdSelec() {
		const lastId = this.productosSelecEnAmbiente.length - 1;
		return this.productosSelecEnAmbiente[lastId].importeTotal;
	}



	eliminarProdsAmbiente(id) {
		this.productosSelecEnAmbiente = this.productosSelecEnAmbiente.filter(prod => prod.idAmbiente !== id);
		this.importeAmbEliminado = COMMONS.realParseFloat(document.getElementById('importeAmbiente-' + id).value);
	}

	actualizarInputsPorElim() {		// Actualiza los inputs al eliminar ambiente
		const importePresup = COMMONS.realParseFloat(document.getElementById('importePresup').value);
		let sumaRev = 0,
			sumaCie = 0,
			sumaMol = 0;

		this.productosSelecEnAmbiente.forEach( prod => {

			switch (prod.tipoProducto) {
				case 'Revestimiento':
					sumaRev += COMMONS.realParseFloat(prod.mts2Placas);
					break;
				case 'Cielorraso':
					sumaCie += COMMONS.realParseFloat(prod.mts2Placas);
					break;
				case 'Molduras':
					sumaMol += COMMONS.realParseFloat(prod.mts2Placas);
					break;
			}
		});

		document.getElementById('importePresup').value = importePresup - this.importeAmbEliminado;
		document.getElementById('totalMts2Revest').value = sumaRev;
		document.getElementById('totalMts2Cielorraso').value = sumaCie;
		document.getElementById('totalMtsMolduras').value = sumaMol;
	}

	async salvarProductosDeAmbientes(url, idcomp) {
		if (this.productosSelecEnAmbiente.length > 0) {
			let datos = {
				csrf_name: $('#form_comprob input[name=csrf_name]').val(),
				csrf_value: $('#form_comprob input[name=csrf_value]').val(),
				idComprobante: idcomp,
				productos: this.productosSelecEnAmbiente
			};
			console.log(this.productosSelecEnAmbiente);
			datos = JSON.stringify(datos);

	        const options = { method: 'POST',
	        				  headers: {
	      						'Content-Type': 'application/json' },
	                          body: datos };

	        const res = await fetch(url, options);
			const data = await res.json();
	        console.log('Status guardar ambientes:', data);
	    }
	    return null;
	}

	async buscarProductos(id, url) {
		const endPoint = url + id;
		const data = fetchData.obtener(endPoint);

		await data.then( resp => {

			if (resp && resp.status) {
				console.log(resp.status);
			} else {

//console.log('Productos:', resp);

				resp.forEach( (prod, idx) => {
					delete prod.created_at;		//	Elimino propiedades no necesarias
					delete prod.updated_at;		// idem
					this.productosSelecEnAmbiente.push(prod);
					// Producto a la lista de productos de pantalla
					const uiTabProds = new UiTablaProductos(this.estadosItem);
					uiTabProds.insertarProd( prod, prod.idAmbiente );
				});
			}
		});
	}

	setCambioEstado(value, idAmb, idProd, idTipoProd) {
		this.productosSelecEnAmbiente.map( prod => {
			if (prod.idAmbiente == idAmb && 
				prod.idProducto == idProd &&
				prod.idTipoProducto == idTipoProd) {
				prod.idEstadoItem = parseInt(value);
			}
			return prod;
		});
	}



	/**
	 * 
	 * FUNCIONES PRIVADAS...
	 * 
	 */

	_armarObjProducto() {
		const selTipoProd = document.getElementById('selTipoProd');
		const selProducts = document.getElementById('selProductos');
		//const selEstado   = document.getElementById('selEstado');

		return { idAmbiente:     this.idAmbienteSelecionado,
				 idTipoProducto: selTipoProd.value,
				 tipoProducto:   selTipoProd.options[ selTipoProd.selectedIndex ].text,	 // Tipo Prod    -- GRILLA PRODUCTOS
				 idProducto:     selProducts.value,										 // Código
				 producto:       selProducts.options[ selProducts.selectedIndex ].text,	 // Descripcion
				 concepTrab:     document.getElementById('conceptoTrabajo').value,		 // Concepto
				 anchoTrab:      document.getElementById('anchoTrabajo').value,			 // Ancho        -- MEDIDAS TRABAJO
				 altoTrab:       document.getElementById('altoTrabajo').value,			 // Alto
				 mts2Trabajo:    document.getElementById('mts2Trabajo').value,			 // Mts2/Mts
				 anchoPlaca:     document.getElementById('placaMedidaAncho').value,		 // Ancho        -- MEDIDAS PLACAS
				 altoPlaca:      document.getElementById('placaMedidaAlto').value,		 // Alto
				 mts2Placas:     document.getElementById('tdPlacasCubrenMts2').innerHTML, // CubrenMts2
				 precioXmt2:	 document.getElementById('tdPlacaPrecioXmt2').innerHTML,  // Precio x mt2 
				 cantPlacAncho:  document.getElementById('tdCantPlacSugAncho').innerHTML, // Cant. Ancho  -- CANTIDAD DE PLACAS
				 cantPlacAlto:   document.getElementById('tdCantPlacSugAlto').innerHTML,  // Cant. Alto
				 cantPlacas:     document.getElementById('tdCantPlacSugCant').innerHTML,  // Cant. Placas
				 importeTotal:   document.getElementById('importeProd').value,			 // Importe total				 
				 idEstadoItem:   1 //selEstado.value,								     // id Estado
				 //estadoItem:    selEstado.options[ selEstado.selectedIndex ].text
		};
	}

	_cambiarComasPorPuntos(value) {
		if (value === '' || value === 0) return 0;
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

		this._itemASelect(selProds, 0, 'Selec. producto');

		prods.forEach(function (prod) {		// Llenar select Productos
			this._itemASelect(selProds, prod.id, prod.descripcion);
		}, this);
	}

	_actualizoTablas(mtsTrab, mts2, alto, ancho, cant, precio) {
		document.getElementById("mts2Trabajo").value = this._numberFormat(mtsTrab);
		document.getElementById("tdCantPlacSugAncho").innerHTML = ancho;
		document.getElementById("tdCantPlacSugAlto").innerHTML  = alto;	
		document.getElementById("tdCantPlacSugCant").innerHTML  = cant;
		document.getElementById("tdPlacasCubrenMts2").innerHTML = this._numberFormat(mts2);
		document.getElementById("importeProd").value = precio;
	}

}


export default IngresoProds;



/**
 * Manejo de la tabla de productos
 */
class UiTablaProductos {

	constructor(estados) {
		this.estadosItem = estados;
	}

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
  			if (idx === 15) {
  				td.innerHTML = this.__selectEstadoItem(objProd[elem], objProd);
  			}
  			tr.appendChild(td);
		});

		return tr;
	}

	__varsProdsVanATabla() {	// Lista de indices del objeto de producto seleccionado
		return ['tipoProducto', 'idProducto', 'producto', 'concepTrab', 'anchoTrab', 'altoTrab', 
				'mts2Trabajo', 'anchoPlaca', 'altoPlaca', 'mts2Placas', 'precioXmt2', 
				'cantPlacAncho', 'cantPlacAlto', 'cantPlacas', 'importeTotal', 'idEstadoItem'];
	}

	__selectEstadoItem(idEstado, objProd) {
		// El id del select es: idAmbiente_idProducto_idTipoProducto
		const idSel = 'idSelectEst_' + objProd.idAmbiente + '_' + objProd.idProducto + '_' + objProd.idTipoProducto;
		let htmlSelect = `<select id="${idSel}" data-idamb="${objProd.idAmbiente}" `;
		htmlSelect += `data-idprod="${objProd.idProducto}" data-idtipoprod="${objProd.idTipoProducto}" `;
		htmlSelect += ' onchange="PRESUP.onChangeSelectEstadoItem(this);" ';
		htmlSelect += 'class="custom-select custom-select-sm">';

		this.estadosItem.forEach( (estado, idx) => {
			let select = '';
			const indice = idx + 1;

			if (indice === idEstado) {
				select = ' selected';
			}
			htmlSelect += `<option value="${estado.id}"${select}>${estado.descripcion}</option>`;
		});
		htmlSelect += '</select>';

		return htmlSelect;
	}


}
