import { buscarCliente } from './buscarCliente.js';
import { FOTOS } from './manejoFotos.js';
import ManejoAmbientes from './ManejoAmbientes.js';
import IngresoProds from './IngresoProds.js';
import guardarComprob from './guardarComprob.js';
import uiDeExtras from './uiDeExtras.js';


//
// presupuesto.js
// 

(function init() {

	if (PRESUP.id_registro == 0) {

		moment.locale('es');
		const proximoDiaHabil = () => {
			const diaSem = moment().format('dddd');
			let diaHabil = moment().add(1, 'days').format('YYYY-MM-DD');

			if (diaSem == 'sábado') {
				diaHabil = moment().add(3, 'days').format('YYYY-MM-DD');
			} 
			if (diaSem == 'domingo') {
				diaHabil = moment().add(2, 'days').format('YYYY-MM-DD');
			} 

			return diaHabil;
		};

		$('#fecha').val(PRESUP.fecha);	// Inicializo las fechas
		$('#fechaTentativa').val(proximoDiaHabil);
		$('#fechaPresupuesto').val(PRESUP.fecha);

		$('#id').val(PRESUP.id_registro);
		$('#nroComprobante').val(PRESUP.nroComprobante);

		$('#btnMasDatos').html('Más datos...');
		$('#provincia').val('Córdoba'); 

		if (PRESUP.isMobile)
			console.log("Es mobile !");
		else console.log("NO es mobile !");
	}

})();


// Set toastr ERROR options
PRESUP.toastrErrorOptions = {
  "closeButton": true,
  "debug": false,
  "newestOnTop": false,
  "progressBar": false,
  "positionClass": "toast-bottom-full-width",
  "preventDuplicates": false,
  "onclick": null,
  "showDuration": "300",
  "hideDuration": "1000",
  "timeOut": "5000",
  "extendedTimeOut": "1000",
  "showEasing": "swing",
  "hideEasing": "linear",
  "showMethod": "fadeIn",
  "hideMethod": "fadeOut"
};

// Set to error options
toastr.options = PRESUP.toastrErrorOptions;

// Set toastr SUCCESS and timeOver options
PRESUP.toastrSuccessOptions = {
  "closeButton": false,
  "debug": false,
  "newestOnTop": false,
  "progressBar": true,
  "positionClass": "toast-bottom-full-width",
  "preventDuplicates": false,
  "onclick": null,
  "showDuration": "300",
  "hideDuration": "1000",
  "timeOut": "5000",
  "extendedTimeOut": "1000",
  "showEasing": "swing",
  "hideEasing": "linear",
  "showMethod": "fadeIn",
  "hideMethod": "fadeOut"
}



PRESUP.winBuscar = false;    // Variable para saber que está abierta la ventana de búsqueda
PRESUP.objWinBuscar = {};    // Ventana de búsqueda

/**
 * Agrega un cero a la izquierda
 * 
 * @param  {[int]} num [numero]
 * @return {[string]}     [numero con cero a la izquierda]
 */
PRESUP.padCero = (num) => {
	let str = String(num);

	if (str.length === 1) { 
		str = "0" + str; 
	}

	return str;
}

/**
 * 
 * MANEJO AMBIENTES EN TAB PRESUPUESTO
 * 
 */
PRESUP._ambientes = new ManejoAmbientes(PRESUP.isMobile);		// Clase para carga de ambientes
PRESUP._ambientes.crearAmbiente();

PRESUP.onClickBtnEliminaAmb = (id) => {
	const nombreAmb = PRESUP._ambientes.getTitulo(id);
//console.log('Elimino Ambiente id:', id);
	$.confirm({
	    title: '<h3><strong>Confirmar !</strong></h3>',
	    content: 'Va a <strong>eliminar</strong>: ' + nombreAmb,
		type: 'red',
		typeAnimated: true,
	    buttons: {
	        confirm: {
            	text: 'Eliminar',
            	btnClass: 'btn-red',
            	action: function () {
            		PRESUP._ingresoProds.eliminarProdsAmbiente(id);
            		PRESUP._ingresoProds.actualizarInputsPorElim();
					PRESUP._ambientes.eliminar(id);
				}
	        },
	        cancel: {
            	text: 'Cancelar',	// Nada pasa...
	        }
	    }
	});
}




/**
 * 
 * MANEJO PRODUCTOS EN TAB PRESUPUESTO
 * 
 */
PRESUP._ingresoProds = new IngresoProds(PRESUP.productos, PRESUP.estadosItem);

PRESUP.onClickBtnAgregarProd = id => {
		PRESUP._ingresoProds.resetFormModal();
		PRESUP._ingresoProds.setIdAmbienteSelec(id);
		$('#modIngresoProd').modal('show');
}

PRESUP.onChangeSelectEstadoItem = objSelect => {
	PRESUP._ingresoProds.setCambioEstado(objSelect.value, 
										 objSelect.dataset.idamb, 
										 objSelect.dataset.idprod, 
										 objSelect.dataset.idtipoprod);
};

PRESUP._updateMedidas = function (medidas) {		// medidas = {totalMts2Revest, totalMts2Cielorraso, totalMtsMolduras}

console.log('Medidas pasadas:', medidas);

	const input_totalMts2Revest     = document.getElementById('totalMts2Revest');
	const input_totalMts2Cielorraso = document.getElementById('totalMts2Cielorraso');
	const input_totalMtsMolduras    = document.getElementById('totalMtsMolduras');

	const totalMts2Revest     = COMMONS.realParseFloat( input_totalMts2Revest.value );
	const totalMts2Cielorraso = COMMONS.realParseFloat( input_totalMts2Cielorraso.value );
	const totalMtsMolduras    = COMMONS.realParseFloat( input_totalMtsMolduras.value );

	input_totalMts2Revest.value     = totalMts2Revest + medidas.totalMts2Revest;
	input_totalMts2Cielorraso.value = totalMts2Cielorraso + medidas.totalMts2Cielorraso; 
	input_totalMtsMolduras.value    = totalMtsMolduras + medidas.totalMtsMolduras;
}



/**
 * CLICK GUARDAR TAB REGISTRO VISITAS
 */
PRESUP.onClickBtnGuardarRegistro = function () {
	guardarComprob.salvarRegistro(PRESUP.pathGuardarRegist);
	PRESUP.guardadoDeTabs.registro = true;
}

/**
 * CLICK GUARDAR TAB PRESUPUESTO
 */
PRESUP.onClickBtnSalvarPresup = function () {
	const guardaOk = guardarComprob.salvarPresup(PRESUP.pathGuardarPresup);

	if (guardaOk) {		// Salvar ambientes y sus productos
		PRESUP._ambientes.salvarAmbientes(PRESUP.pathGuardarAmbien, PRESUP.id_registro);
		PRESUP._ingresoProds.salvarProductosDeAmbientes(PRESUP.pathGuardarProduc, PRESUP.id_registro);

	} else { 
		toastr.error('No se guardó presupuesto !', "ERROR, intente cerrar la aplicación !"); 
	}
}

/**
 * CLICK GUARDAR TAB ORDEN DE TRABAJO
 */
PRESUP.onClickBtnGuardarOrdenT = function () {
	guardarComprob.salvarOrdenTrab( 
		PRESUP.pathGuardarOrdTrab, 
		PRESUP.id_registro
	);
	PRESUP.guardadoDeTabs.ordenTrabajo = true;
}


/**
 * CLICK GUARDAR TAB FOTOS
 */
PRESUP.onClickBtnGuardarFotos = function () {
	guardarComprob.salvarFotos(
		PRESUP.listaDeFotos, 
		PRESUP.pathGuardarListaFotos,
		PRESUP.id_registro
	);
	PRESUP.guardadoDeTabs.fotos = true;
}


/**
 * CLICK GUARDAR TAB EXTRAS
 */
PRESUP.onClickBtnGuardarExtras = function () {
	guardarComprob.salvarExtras(
		PRESUP.listaDeExtras, 
		PRESUP.pathGuardarExtras,
		PRESUP.id_registro
	);
	PRESUP.guardadoDeTabs.extras = true;
}


/**
 * CLICK BOTON AGREGAR EXTRA
 */
PRESUP.onClickBtnAgregarExtra = function () {
	const desc = document.getElementById('descripcionExtras').value;
	const impo = COMMONS.realParseFloat(document.getElementById('importeExtra').value);

	if (desc.trim() != '') {
		const obj  = { descripcion: desc, importe: impo };
		this.listaDeExtras.push(obj);
		uiDeExtras.ingresoTabla(obj, this.listaDeExtras.length);
	}
}


/**
 * CLICK BOTON BORRAR EXTRA
 */
PRESUP.onClickBtnBorrarExtra = function (btn) {
	const btnIndex = btn.parentNode.parentNode.rowIndex;
    document.getElementById('tablaExtras').deleteRow(btnIndex);
    const idx = parseInt( btn.getAttribute('data-idx') );
    this.listaDeExtras.splice(idx, 1);
    document.getElementById('descripcionExtras').focus();
}


/**
 * 
 * BUSCAR CLIENTE
 *
 */
PRESUP.winBuscarCliente = function (elem) {		// Crea ventana para buscar Cliente  top=500,left=500,
	const left   = (screen.width/2)-450,    // (width/2)
          top    = (screen.height/2)-350;   //  (height/2);
	const params = "toolbar=no,localtion=no,menubar=no,scrollbars=yes,resizable=no,top=" + top + ",left=" + left + ",width=900,height=700";

	if ( !this.winBuscar ) {		// Abrir la ventana para buscar cliente...

		this.objWinBuscar = window.open(this.pathBuscarCliente, '_blank', params);
		this.winBuscar = true;		// Variable para saber que está abierta la ventana de búsqueda

		this.objWinBuscar.addEventListener("click", function(){		// Agego evento click a la ventana de Buscar
			let cerrar = this._cerrar;   // En ventana buscar cliente
			let dato = '';
			//console.log("click en ventana buscar...");
			if (cerrar) {
				dato = this._idFirma;
				// console.log("Se cierra la ventana buscar... (" + dato + ")");
				this.close();
				PRESUP.winBuscar = false;
				//document.getElementById("form_comprob").reset();   // Reset del form
				buscarCliente( dato, PRESUP.pathGetCliente ); 	// En archivo importado buscarCliente.js gestiona la busqueda del cliente (dato = id cliente)
			}
		});
		this.objWinBuscar.addEventListener("beforeunload", function (e) {
			PRESUP.winBuscar = false;
		});
	}
	return null;
};


/**
 * 
 * BUSCAR COMPROBANTE COMPLETO
 * 
 */
PRESUP.winBuscarPresup = function () {		// Crea ventana para buscar presupuesto  top=500,left=500,
	const left   = (screen.width/2)-450,    // (width/2)
          top    = (screen.height/2)-350;   //  (height/2);
	const params = "toolbar=no,localtion=no,menubar=no,scrollbars=yes,resizable=no,top=" + top + ",left=" + left + ",width=900,height=700";

	if ( !this.winBuscar ) {		// Abrir la ventana para buscar cliente...

		this.objWinBuscar = window.open(this.pathPresupBuscar, '_blank', params);
		this.winBuscar = true;		// Variable para saber que está abierta la ventana de búsqueda

		this.objWinBuscar.addEventListener("click", function(){		// Agego evento click a la ventana de Buscar
			let cerrar = this._cerrar;   // En ventana buscar presupuesto
			let idPresup = '';

			if (cerrar) {
				//console.log("Se cierra la ventana buscar... (" + this._idPresup + ")");
				this.close();
				location.assign( PRESUP.pathPresup + "?idComp=" + this._idPresup );
			}
		});
		this.objWinBuscar.addEventListener("beforeunload", function (e) {
			PRESUP.winBuscar = false;
		});
	}
	return null;
};

/**
 * 
 * BOTON IMPRIMIR EN TABS
 * (Común a todos los tabs)
 *
 * @param string nombre del tab
 */
PRESUP.onClickBtnImprimir = function (tab) {
	const id = document.getElementById('id').value;
    let paramString = '?id=' + id;
    paramString += '&tab=' + tab;
	window.open( PRESUP.pathImprimir + paramString, '_blank');
}




/*
 *
 * CODIGO jQUERY (EVENTOS) ********************************************************************************
 *
 */
$( function () {
	const inputs1 = 'input#anchoTrabajo, input#altoTrabajo, input#totalMts2Revest, input#totalMts2Cielorraso, ',
		  inputs2 = 'input#totalMtsMolduras, input#importeProd, input#importePresup, input#importeAmbiente-1';

	// Input Mask para inputs con ids
    $(inputs1 + inputs2).inputmask("numeric", {
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

	// Inicializa input importe de extras y entrega en tab presupuesto
    $('input#importeExtra, input#entrega').inputmask("numeric", {
        radixPoint: ",",
        groupSeparator: ".",
        digits: 2,
        autoGroup: true,
        rightAlign: false,
        unmaskAsNumber: true, 
        oncleared: function () { self.value = ''; }
    });

    // Click select idSucursal (busca id comprobante disponible de sucursal seleccionada)
    $('#idSucursal').change( async function (e) {

    	console.log('Id sucursal:', e.target.value);
    	// Buscar id de comprobante de la sucursal...
        const res = await fetch(PRESUP.pathGetIdComprob + e.target.value);
        const data = await res.json();
		//console.log('Nuevo id comprobante:', data.id);
		PRESUP.nroComprobante = data.id;
		$('#id').val(0);
		$('#nroComprobante').val(PRESUP.nroComprobante);

    });

    // Click boton mas datos mobile
    $('#btnMasDatos').click(function (e) {
    	//const titulo = e.target.innerHTML;
    	const titulo = $(this).html();

    	if (titulo == 'Más datos...') {
	   		e.target.innerHTML = 'Menos datos...';
    	} else {
    		e.target.innerHTML = 'Más datos...';
    	}
    });

    // Click boton mas datos cliente
    $('#btnMasDatosClie').click(function (e) {
    	//const titulo = e.target.innerHTML;
    	const titulo = $(this).html();

    	$('.masDatosClie').toggle();

    	if (titulo == 'Más datos cliente...') {
	   		e.target.innerHTML = 'Menos datos cliente...';
    	} else {
    		e.target.innerHTML = 'Más datos cliente...';
    	}
    });

    // Click boton btnOtrasFechas
    $('#btnOtrasFechas').click(function (e) {
    	// Despliega divOtrasFechas
    	$('#rowOtrasFechas').toggle();
		//console.log("Despliega otras fechas...");
    });

    // Inicializo input fotos
    FOTOS.agregaNombreImagenAlInput();
    // Click en fotos
    FOTOS.eventoClickEnImagen();

	$('#btnAgregarFoto').click(function () {
		FOTOS.agregarFoto(PRESUP.isMobile);
	});

    // Al iniciar el Modal Agregar Producto
	$('#modIngresoProd').on('shown.bs.modal', function () {
		$('#selTipoProd').trigger('focus');
	});

	// Click boton Agregar Ambiente
	$('button#btnAgregarAmbiente').click(function (e) {
		PRESUP._ambientes.crearAmbiente();
		PRESUP._ambientes.mostrarNuevoAmbiente();
	});

	// Focus on Fecha
	$('#fecha').focus();

	// Inicializa tooltips
	$('[data-toggle="tooltip"]').tooltip();

	// Click en botones Confirma y Guardar
	$('#btnConfirma, a#guardar').click( function(e) {

		if ( guardarComprob.validarComprob() ) {
			$('#spinnerGuardar').show();
			guardarComprob.salvarComprob(PRESUP.pathGuardar, PRESUP.guardadoDeTabs);
		}

		return null;
	});

	// Al cambiar fecha de tab presupuesto, cambia la de vencimiento a 8 dias mas
	$('input#fechaPresup').change(function(event) {
		const fecha = $(this).val();
		const date = new Date(fecha);
		const copy = new Date(Number(date));
		copy.setDate(date.getDate() + 8);
		const mes = copy.getMonth() + 1;
		const dia = copy.getDate();
		const fechaVenc = copy.getFullYear() + '-' + PRESUP.padCero(mes) + '-' + PRESUP.padCero(dia);

		$('#fechaVencimiento').val(fechaVenc);
	});

	// Click link Buscar cliente
	$('#btnBuscarCli').click(function (e) {
		PRESUP.winBuscarCliente( $(this) );
	});

	// Click link Buscar presupuesto
	$('#a_buscar').click(function (e) {
		PRESUP.winBuscarPresup();
	});

	// Change select Comprobante
	$('select#idTipoComprobante').change(function(e) {
		const valor = parseInt($(this).val());

		switch (valor) {
			case 1:
				$('a#pills-registro-tab').tab('show');
				break;
			case 2:
				$('a#pills-presupuesto-tab').tab('show');
				break;
			case 3:
				$('a#pills-orden-tab').tab('show');
				break;
		}
	});

	// Al desplegar la etiqueta (en mobile)...
	$('#acordionTipoComprobante').on('show.bs.collapse', function () {
		const element = document.getElementById("tabPresupMobile");		// Scroll hasta las etiquetas
		element.scrollIntoView();
	});

	// Al desplegar la etiqueta (en desktop)...
	$('a[data-toggle="pill"]').on('shown.bs.tab', function (e) {
	  //e.target // newly activated tab // e.relatedTarget // previous active tab
		const element = document.getElementById("etiquetas");		// Scroll hasta las etiquetas
		element.scrollIntoView();
	});

	// Change select TipoProducto en Modal
	$('select#selTipoProd').change(function (e) {
		const idsel = e.target.value;
		PRESUP._ingresoProds.changeSelecTipoProd(idsel);
	});

	// Change select Producto en Modal
	$('select#selProductos').change(function (e) {
		const idsel = e.target.value;
		PRESUP._ingresoProds.changeSelecProd(idsel);
	});

	// Calculos de placas - Modal ingreso productos
	$('button#btnCalculaModal').click(function (e) {
		const ancho = parseFloat( document.getElementById("anchoTrabajo").value ) || 0;
		const alto  = parseFloat( document.getElementById("altoTrabajo").value ) || 0;

		if ( ancho > 0 ) {
			PRESUP._ingresoProds.calculoMedidas();
			document.getElementById('importeProd').focus();
		} else {
			toastr.error('Debe ingresar Ancho del trabajo', "ERROR, faltan datos !");
		}
	});

	// Click en boton Confirma Modal Ingreso de Productos
	$('button#btnConfirmaModalProds').click(function (e) {
		const validModalProd = PRESUP._ingresoProds.validarModalProd();

		if ( validModalProd.notPass ) {
			toastr.error(validModalProd.message, "ERROR, faltan datos !");
			$(validModalProd.elem).focus();
		} else {
			PRESUP._ingresoProds.setProductoSeleccionado();
			const idAmbSel = PRESUP._ingresoProds.getIdAmbienteSelec(),
				  importeProd = PRESUP._ingresoProds.getImporteProdSelec();

			PRESUP._ambientes.setImporte( idAmbSel, importeProd);
			PRESUP._updateMedidas(PRESUP._ingresoProds.getMedidasProdSelec())

			$('#modIngresoProd').modal('hide');

			const idConceptAmb = 'conceptoAmbiente-' + idAmbSel;
			const textoConceptoAmb = $('#' + idConceptAmb).val();
			if (textoConceptoAmb.trim() === '') {
				toastr.error('Debe ingresar concepto ambiente', "ERROR, faltan datos !");
				$('#' + idConceptAmb).focus();
			}
		}
	});

	/**
	 * Si viene el id de comprobante carga datos de Ambientes y productos
	 * Tambien Fotos y extras
	 */
	if (PRESUP.id_registro > 0) {
		PRESUP.guardado = true;		// Para permitir guardar Tabs

		// Bloquea las opciones de cambiar sucursal
		$('#idSucursal option:not(:selected)').prop('disabled', true);
		// Readonly la fecha de creación del comprobante
		document.getElementById("fecha").readOnly = true; 

		PRESUP._ambientes.buscarAmbientes(PRESUP.id_registro, PRESUP.pathGetAmbientes);
		PRESUP.guardadoDeTabs.registro = false;
		PRESUP.guardadoDeTabs.presupuesto = false;
		PRESUP.guardadoDeTabs.ordenTrabajo = false;		
		FOTOS.buscarFotos(PRESUP.id_registro, PRESUP.pathGetFotos, PRESUP.isMobile);
		uiDeExtras.buscarExtras(PRESUP.id_registro, PRESUP.pathGetExtras);
	}

	// Evento antes de cerrar la ventana
	$(window).on("beforeunload", function(e)
	{
		if (PRESUP.winBuscar) {		// Si está abierta la ventana de buscar presupuesto
			PRESUP.objWinBuscar.close();    // ... la cierra
		}
	});


});
