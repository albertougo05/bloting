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

		//console.log('Obj del prod selec:', obj);

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

		//console.log('last id:', lastId, 'id tipoProducto:', idTipoProd);


		switch (idTipoProd) {
			case 1:		// Revestimiento
				obj.totalMts2Revest = this.productosSelecEnAmbiente[lastId].mts2Placas;
				break;
			case 2:		// Cielorraso
				obj.totalMts2Cielorraso = this.productosSelecEnAmbiente[lastId].mts2Placas;
				break;
			case 3:		// Molduras
				obj.totalMtsMolduras = this.productosSelecEnAmbiente[lastId].mts2Placas;
				break;
		}

		//console.log('obj con medidas prod selec:', obj);

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
		//this.productosSelecEnAmbiente = this.productosSelecEnAmbiente.filter(prod => prod.idAmbiente !== id);
		this.productosSelecEnAmbiente.map(prod => { 
			if (prod.idAmbiente == id) {
				prod.idEstadoItem = 0;
			}
		});
		this.importeAmbEliminado = COMMONS.realParseFloat(document.getElementById('importeAmbiente-' + id).value);
	}

	actualizarInputsPorElim() {		// Actualiza los inputs al eliminar ambiente
		const importePresup = COMMONS.realParseFloat(document.getElementById('importePresup').value);
		const totalMts2Revest = COMMONS.realParseFloat(document.getElementById('totalMts2Revest').value);
		const totalMts2Cielorraso = COMMONS.realParseFloat(document.getElementById('totalMts2Cielorraso').value);
		const totalMtsMolduras = COMMONS.realParseFloat(document.getElementById('totalMtsMolduras').value);

		let sumaRev = 0,
			sumaCie = 0,
			sumaMol = 0;

		this.productosSelecEnAmbiente.forEach( prod => {

			if (prod.idEstadoItem === 0) {
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
			}
		});

		document.getElementById('importePresup').value = importePresup - this.importeAmbEliminado;

		//console.log('Suma Revest:', sumaRev, ' - En productosSelecEnAmbiente:', sumaRev);

		document.getElementById('totalMts2Revest').value = totalMts2Revest - sumaRev;
		document.getElementById('totalMts2Cielorraso').value = totalMts2Cielorraso - sumaCie;
		document.getElementById('totalMtsMolduras').value = totalMtsMolduras - sumaMol;
	}

	async salvarProductosDeAmbientes(url, idcomp) {
		if (this.productosSelecEnAmbiente.length > 0) {
			let datos = {
				csrf_name: $('#form_comprob input[name=csrf_name]').val(),
				csrf_value: $('#form_comprob input[name=csrf_value]').val(),
				idComprobante: idcomp,
				productos: this.productosSelecEnAmbiente
			};
			//console.log('Productos en ambientes a salvar:', this.productosSelecEnAmbiente);
			datos = JSON.stringify(datos);
	        const options = { method: 'POST',
	        				  headers: {
	      						'Content-Type': 'application/json' },
	                          body: datos };
	        const res = await fetch(url, options);
			const data = await res.json();
	        //console.log('Status guardar ambientes:', data);
	        // Recargo la lista de productos, para actualizar los ids de registros (los nuevos son 0)
	        this.recargarProductos(PRESUP.id_registro, PRESUP.pathGetProductos);
	        // Habilito boton de imprimir
	        document.getElementById('btnImprimePresupuesto').disabled = false;
	    }
	    return null;
	}

	recargarProductos(id, url) {
		const endPoint = url + id;
		const data = fetchData.obtener(endPoint);
		this.productosSelecEnAmbiente = [];		// Vacio array de productos

		data.then(resp => {
			resp.forEach(prod => {
				delete prod.created_at;		//	Elimino propiedades no necesarias
				delete prod.updated_at;		// idem
				this.productosSelecEnAmbiente.push(prod);
			});
		});
	}

	buscarProductos(id, url) {
		const endPoint = url + id;
		const data = fetchData.obtener(endPoint);

		data.then( resp => {
			//console.log('Productos de Ambientes (GET):', resp);
			if (resp.status) {		// Si devuelve status, es que NO hay productos
				//console.log(resp);
				return null;
			} else {

				resp.forEach( (prod, idx) => {
					delete prod.created_at;		//	Elimino propiedades no necesarias
					delete prod.updated_at;		// idem
					this.productosSelecEnAmbiente.push(prod);
					// Producto a la lista de productos de pantalla

// Ver si esta const debe ir fuera del loop
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

		return { id: 0,			// Al ser nuevo el producto, no tiene id de registro en la tabla
				 idAmbiente:     this.idAmbienteSelecionado,
				 idTipoProducto: parseInt(selTipoProd.value),
				 tipoProducto:   selTipoProd.options[ selTipoProd.selectedIndex ].text,	 // Tipo Prod    -- GRILLA PRODUCTOS
				 idProducto:     parseInt(selProducts.value),										 // Código
				 producto:       selProducts.options[ selProducts.selectedIndex ].text,	 // Descripcion
				 concepTrab:     document.getElementById('conceptoTrabajo').value,		 // Concepto
				 anchoTrab:      this._stringToFloat(document.getElementById('anchoTrabajo').value),			 // Ancho        -- MEDIDAS TRABAJO
				 altoTrab:       this._stringToFloat(document.getElementById('altoTrabajo').value),			 // Alto
				 mts2Trabajo:    this._stringToFloat(document.getElementById('mts2Trabajo').value),			 // Mts2/Mts
				 anchoPlaca:     this._stringToFloat(document.getElementById('placaMedidaAncho').value),		 // Ancho        -- MEDIDAS PLACAS
				 altoPlaca:      this._stringToFloat(document.getElementById('placaMedidaAlto').value),		 // Alto
				 mts2Placas:     this._stringToFloat(document.getElementById('tdPlacasCubrenMts2').innerHTML), // CubrenMts2
				 precioXmt2:	 this._stringToFloat(document.getElementById('tdPlacaPrecioXmt2').innerHTML),  // Precio x mt2 
				 cantPlacAncho:  parseInt(document.getElementById('tdCantPlacSugAncho').innerHTML), // Cant. Ancho  -- CANTIDAD DE PLACAS
				 cantPlacAlto:   parseInt(document.getElementById('tdCantPlacSugAlto').innerHTML),  // Cant. Alto
				 cantPlacas:     parseInt(document.getElementById('tdCantPlacSugCant').innerHTML),  // Cant. Placas
				 importeTotal:   this._stringToFloat(document.getElementById('importeProd').value),			 // Importe total
				 idEstadoItem:   1  // id Estado
		};
	}

	_stringToFloat(value) {
		if (value === '' || value === 0) return 0;
		let numFloat = value.replace('.', '');
		numFloat = numFloat.replace(',', '.');

		return parseFloat(numFloat);
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

	/**
	 * Inserta producto en tabla de productos, en ambiente
	 * 
	 * @param  {object} obj [Objeto con los datos del producto]
	 * @param  {int} idx [Indice del ambiente]
	 * @return void
	 */
	insertarProd(obj, idx) {
		//console.log('idx ambiente producto:', idx, 'Objeto que recibe:', obj);
		const idElem = `idBodyTablaProds-${idx}`;
		const elem = document.getElementById(idElem);
		// Armo la linea
		const linea = this.__lineaProd(obj);
		if (elem) {
			// Inserto linea en tabla
			elem.appendChild(linea);
		}
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
