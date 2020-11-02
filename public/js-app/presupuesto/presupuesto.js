import { buscarCliente } from './buscarCliente.js';
import { FOTOS } from './guardarFotos.js';
import ManejoAmbientes from './ManejoAmbientes.js';
import IngresoProds from './IngresoProds.js';
import guardarPresup from './guardarPresup.js';


//
// presupuesto.js
// 

(function init() {

	$('#fecha').val(PRESUP.fecha);		// Inicializo las fechas
	$('#fechaUltModif').val(PRESUP.fecha);
	$('#fechaTentativa').val(PRESUP.fecha);
	$('#fechaPresupuesto').val(PRESUP.fecha);

	$('#id_presup').val(PRESUP.id_presup); 
	$('#id_presup_pant').val(PRESUP.id_presup); 
	$('#btnMasDatos').html('Más datos...');
	$('#provincia').val('Córdoba'); 

	if (PRESUP.isMobile)
		console.log("Es mobile !");
	else console.log("NO es mobile !");

	// Set toastr options
	toastr.options = {
	  "closeButton": true,
	  "debug": false,
	  "newestOnTop": false,
	  "progressBar": false,
	  "positionClass": "toast-bottom-full-width",
	  //"positionClass": "toast-bottom-center",
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

})();


PRESUP.winBuscar = false;    // Variable para saber que está abierta la ventana de búsqueda
PRESUP.objWinBuscar = {};    // Ventana de búsqueda


/**
 * 
 * MANEJO AMBIENTES EN TAB PRESUPUESTO
 * 
 */
PRESUP._ambientes = new ManejoAmbientes();		// Clase para carga de ambientes
PRESUP._ambientes.crearAmbiente();

PRESUP.onClickBtnEliminaAmb = (id) => {
	const nombreAmb = PRESUP._ambientes.getTitulo(id);

console.log('Elimino Ambiente id:', id);

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
					PRESUP._ambientes.eliminar(id);

					// Eliminar productos....   ( FALTA !!! )

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
PRESUP._ingresoProds = new IngresoProds(PRESUP.productos);

PRESUP.onClickBtnAgregarProd = (id) => {
		PRESUP._ingresoProds.resetForm();
		PRESUP._ingresoProds.setIdAmbienteSelec(id);
		$('#modIngresoProd').modal('show');
}





PRESUP.validarForm = () => {
	// Fecha
	if ( COMMONS.isEmpty( $('#fecha').val() ) ) {
		toastr.error("Error en Presupuesto", "Debe ingresar una fecha !!");
		$('#fecha').focus();
		return false;
	}
	// Nombre
	if ( COMMONS.isEmpty( $('#nombre').val() ) ) {
		toastr.error("Error en Presupuesto", "Debe ingresar un Nombre !!");
		$('#nombre').focus();
		return false;
	}
	// Domicilio
	if ( COMMONS.isEmpty( $('#domicilio').val() ) ) {
		toastr.error("Error en Presupuesto", "Debe ingresar un Domicilio !!");
		$('#domicilio').focus();
		return false;
	}
	// Localidad
	if ( COMMONS.isEmpty( $('#localidad').val() ) ) {
		toastr.error("Error en Presupuesto", "Debe ingresar un Localidad !!");
		$('#localidad').focus();
		return false;
	}
	// idEmplHaceRegistro
	if ( $('#empleadoHaceRegistro :selected').val() == 0 ) {
		toastr.error("Error en Registro Visita", "Debe ingresar empleado hace el registro !!");
		$('#empleadoRealizaRegistro').focus();
		return false;
	}
	// Detalle del registro
	if ( COMMONS.isEmpty( $('#detalleRegistro').val() ) ) {
		toastr.error("Error en Presupuesto", "Debe ingresar un detalle de registro !!");
		$('#detalleRegistro').focus();
		return false;
	}

	// Fecha tentetiva de visita
	if ( COMMONS.isEmpty( $('#fechaTentativa').val() ) ) {
		toastr.error("Error en Presupuesto", "Debe ingresar fecha tentativa de visita !!");
		$('#fechaTentativa').focus();
		return false;
	}

	return true;
};

PRESUP.guardarForm = function () {
	//const formElement = document.querySelector("form");
	//const formData = new FormData(formElement);
	const formData = guardarPresup.recolectarData();

console.log('FormData: ', formData);

	const options = {
		method: 'POST',
		//mode: 'cors',
		body: formData
	}
	//const req = new Request(this.pathGuardar, options);


// ESTE FETCH TENDRIA QUE IR EN LA FUNCION guardarPresup() [imported]



/*
	fetch(req)
		.then((response) => {
			if (response.ok) {
				return response.json();
			} else {
				throw  new Error('Error de escritura !!')
			}
		})
		.then( (data) => {		// Si todo está Ok, data es un json
			console.log(data);
			PRESUP.exitoEnGuardar();
		})
		.catch( (err) => {
			console.log('ERROR: ', err.message);
			toastr.error("Error en Presupuesto", "Error al guardar datos !!");
		});
*/
};

PRESUP.exitoEnGuardar = () => {
	$('#spinnerGuardar').hide();
	toastr.success("Presupuesto", "Presupuesto guardado con éxito !!");
	$('#btnImprime').prop( 'disabled', false );
	$('#btnConfirma').prop( 'disabled', true );
};


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
				//document.getElementById("formPresup").reset();   // Reset del form
				buscarCliente( dato, PRESUP.pathGetCliente ); 	// En archivo importado buscarCliente.js gestiona la busqueda del cliente (dato = id cliente)
			}
		});
		this.objWinBuscar.addEventListener("beforeunload", function (e) {
			PRESUP.winBuscar = false;
		});
	}
	return null;
};

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
			//console.log("click en ventana buscar...");
			if (cerrar) {
				idPresup = this._idPresup;
				// console.log("Se cierra la ventana buscar... (" + idPresup + ")");
				this.close();
				PRESUP.winBuscar = false;
				//document.getElementById("formPresup").reset();   // Reset del form
				PRESUP.buscarPresup( idPresup ); 
			}
		});
		this.objWinBuscar.addEventListener("beforeunload", function (e) {
			PRESUP.winBuscar = false;
		});
	}
	return null;
};

PRESUP.buscarPresup = function ( id ) {
	$.ajax(
    {
        url : PRESUP.pathGetPresup,
        type: "GET",
        data: { id: id },
        success: function(data, textStatus, jqXHR) 
        {
			let dataObj = $.parseJSON(data);
			//console.log('Id: ' + dataObj.id + 'Nombre: ' + dataObj.Nombre);
			PRESUP.datosAlFormulario(dataObj);
        },
        error: function(jqXHR, textStatus, errorThrown) 
        {
            console.log('Status de error: ' + textStatus);
            toastr.error("Presupuesto", "Error al buscar Presupuesto !!");
        }
    });

	return null;
}

PRESUP.datosAlFormulario = function (data) { 
	$('input#id').val(data.id);
	$('input#id_presup').val(data.id);
	$('input#id_cliente').val(data.id_cliente);
	$('input#fecha').val(data.fecha);
	$('input#nombre').val(data.nombre);
	$('input#domicilio').val(data.domicilio);
	$('input#localidad').val(data.localidad);
	$('input#codPostal').val(data.codPostal);
	$('select#provincia').val(data.provincia).change();
	$('select#pais').val(data.pais).change();
	$('input#telefono').val(data.telefono);
	$('input#celular').val(data.celular);
	$('input#cuitdni').val(data.cuitdni);
	$('input#contacto').val(data.contacto);
	$('input#email').val(data.email);
	$('textarea#observaciones').val(data.observaciones);

	$('input#importe').val(data.importe);

	//Habilito boton Imprimir
	$('#btnImprime').prop('disabled', false);

	return null;
}



/*
 *
 *
 * CODIGO jQUERY (EVENTOS) ********************************************************************************
 *
 * 
 */
$( function () {

	// Input Mask para inputs
    $('input#anchoTrabajo, input#altoTrabajo, input#totalMts2Revest, input#totalMts2Cielorraso, input#totalMtsMolduras').inputmask("numeric", {
        radixPoint: ",",
        groupSeparator: ".",
        digits: 2,
        autoGroup: true,
        //prefix: '$ ', //Space after $, this will not truncate the first character.
        rightAlign: false,
        unmaskAsNumber: true, 
        allowPlus: false,
    	allowMinus: false,
        oncleared: function () { self.value = ''; }
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
	// Lista de fotos del presupuesto (Debe ir al traer presupuesto)
	PRESUP.listaDeFotos.push('/img/trabajo1.jpg', '/img/trabajo2.jpg', '/img/trabajo3.jpg');
	// Ingreso fotos al contenedor
	FOTOS.fotosAlContenedor(PRESUP.listaDeFotos, PRESUP.isMobile);
    // Click en fotos
    FOTOS.clickEnImagen();

    // Al iniciar el Modal Agregar Producto
	$('#modIngresoProd').on('shown.bs.modal', function () {
		$('#selTipoProd').trigger('focus');
	});

	// Click boton Agregar Ambiente
	$('button#btnAgregarAmbiente').click(function (e) {
		PRESUP._ambientes.crearAmbiente();
		PRESUP._ambientes.mostrarNuevoAmbiente();
		const element = document.getElementById("pills-tabContent");		// Scroll hasta las etiquetas
		element.scrollIntoView();
	});

	// Focus on Fecha
	$('#fecha').focus();
	// Inicializa tooltips
	$('[data-toggle="tooltip"]').tooltip();
	// Inicializa input importe
    $('input#importe, input#entrega').inputmask("numeric", {
        radixPoint: ",",
        groupSeparator: ".",
        digits: 2,
        autoGroup: true,
        //prefix: '$ ', //Space after $, this will not truncate the first character.
        rightAlign: false,
        unmaskAsNumber: true, 
        oncleared: function () { self.value(''); }
    });

	// Click en boton Guardar
	$('#btnConfirma, a#guardar').click( function(e) {

		if ( PRESUP.validarForm() ) {
			$('#spinnerGuardar').show();
			PRESUP.guardarForm();
		}

		return null;
	});

	// Click link Buscar cliente
	$('#btnBuscarCli').click(function (e) {
		PRESUP.winBuscarCliente( $(this) );
	});

	// Click link Buscar presupuesto
	$('#a_buscar').click(function (e) {
		PRESUP.winBuscarPresup();
	});

	// click en boton imprimir
	$('#btnImprime').click( function(e) {
	    const paramString = '?id=' + $('#id').val();
		window.open( PRESUP.pathImprimir + paramString, '_blank');
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

	// Atrapar el submit del form fotos
	$('form#form_foto').submit(function (e) {
		e.preventDefault();
		FOTOS.guardarFoto();

		return null;
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

		if ( ancho > 0 || alto > 0 ) {
			PRESUP._ingresoProds.calculoMedidas();
		}
	});

	// Click en boton Confirma Modal Ingreso de Productos
	$('button#btnConfirmaModalProds').click(function (e) {
		// Guardar datos de producto selecionado
		PRESUP._ingresoProds.setProductoSeleccionado();
		$('#modIngresoProd').modal('hide');
	});

	// Evento antes de cerrar la ventana
	$(window).on("beforeunload", function()
	{
		if (PRESUP.winBuscar) {		// Si está abierta la ventana de buscar firma..
			PRESUP.objWinBuscar.close();    // ... la cierra
		}
		
	});

});
