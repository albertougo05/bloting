import { buscarCliente } from './buscarCliente.js';

//
// cliente.js
//

CLIENTE.winBuscar = false;    // Variable para saber que está abierta la ventana de búsqueda
CLIENTE.objWinBuscar = {};    // Ventana de búsqueda


// Va a common.js
CLIENTE.isEmpty = function(str) {    // Verifica string vacios
    return (str.length === 0 || !str.trim());
};

// Idem
CLIENTE.validateEmail = function (email) {   // Valida string con email
	let re = /\S+@\S+\.\S+/;
	return re.test(email);
};

CLIENTE.winBuscarCliente = function (elem) {		// Crea ventana para buscar Cliente  top=500,left=500,
	const left   = (screen.width/2)-450,    // (width/2)
          top    = (screen.height/2)-350;   //  (height/2);
	const params = "toolbar=no,localtion=no,menubar=no,scrollbars=yes,resizable=no,top=" + top + ",left=" + left + ",width=900,height=700";

	if ( !this.winBuscar ) {		// Abrir la ventana para buscar cliente...

		this.objWinBuscar = window.open(this._pathBuscarFirma, '_blank', params);
		this.winBuscar = true;		// Variable para saber que está abierta la ventana de búsqueda

		this.objWinBuscar.addEventListener("click", function(){		// Agego evento click a la ventana de Buscar
			let cerrar = this._cerrar;
			let dato = '';
			//console.log("click en ventana buscar...");
			if (cerrar) {
				dato = this._idFirma;
				// console.log("Se cierra la ventana buscar... (" + dato + ")");
				this.close();
				CLIENTE.winBuscar = false;
				document.getElementById("formCliente").reset();   // Reset del form
				buscarCliente( dato ); 	// En archivo importado buscarCliente.js gestiona la busqueda del cliente (dato = id cliente)
			}
		});
		this.objWinBuscar.addEventListener("beforeunload", function (e) {
			CLIENTE.winBuscar = false;
		});
	}
	return null;
};

CLIENTE.validaFormulario = function () {
	const email  = $('#Email').val();
	let valido = true;
	//console.log('Email: ' + email);
	if ( this.isEmpty( $('#Nombre').val() ) ) {
		valido = false;
		toastr["error"]("Debe ingresar un Nombre !!", "Error en Cliente");
		$('#Nombre').focus();

	} else if ( this.isEmpty( $('#Direccion').val() ) ) {
		valido = false;
		toastr["error"]("Debe ingresar una Dirección !!", "Error en Cliente");
		$('#Direccion').focus();

	} else if ( this.isEmpty($('#Localidad').val()) ) {
		valido = false;
		toastr["error"]("Debe ingresar una Localidad !!", "Error en Cliente");
		$('#Localidad').focus();

	} else if ( this.isEmpty( $('#Provincia').val() ) ) {
		valido = false;
		toastr["error"]("Debe ingresar una Provincia !!", "Error en Cliente");
		$('#Provincia').focus();

	} else if ( !this.isEmpty(email) ) {    // Si no está vacio en email
		if ( !this.validateEmail(email) ) {
			valido = false;
			toastr["error"]("Ingrese dirección mail correcta !!", "Error en Cliente");
			$('#Email').focus();
		}
	}
	//console.log('CodLoc es: ' + valido);

	return valido;
};

CLIENTE.enviarForm = function () {
	let retorno = true;
	const dataclie  = $('#formCliente').serialize();
	event.preventDefault(); 
	event.stopPropagation();

	$.ajax(
    {
        url : CLIENTE._pathGuardarFirma,
        type: "POST",
        data: dataclie,
        //dataType: 'json',
        success: function(data, textStatus, jqXHR) 
        {
			let dataObj = $.parseJSON(data);
			//console.log('Status: ' + textStatus + 'Data enviada: ' + data);
			toastr["success"]("Cliente guardado con éxito !!", "Cliente a salvo");

			// Recarga la página
			setTimeout( function () {
	    		location.assign( CLIENTE._pathCliente );
	    	}, 4000 );

			retorno = true;
        },
        error: function(jqXHR, textStatus, errorThrown) 
        {
            // if fails
            console.log('Status de error: ' + textStatus);
            toastr["error"]("Error al guardar datos !!", "Cliente ERROR");
            retorno = false;
        }
    });
    return retorno;
};





// Set toastr options
toastr.options = {
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



// Codigo jQuery:
// 
$(document).ready( function () {

	// Click link Buscar
	$('#a_buscar').click(function (e) {

		CLIENTE.winBuscarCliente($(this));
	});

	// Seleccionar provincia en el select
	$('#Provincia').val('Córdoba').change();

	// Evento Click boton SUBMIT y link Guardar
	$('#btnConfirma, a#guardar').click(function (event) {
		let guardaOk = true;

		// Validaciones
		if ( CLIENTE.validaFormulario() ) {

			$('#spinnerGuardar').show();		// Muestra el spinner...
			guardaOk = CLIENTE.enviarForm();		// envio form por ajax...
			$('#spinnerGuardar').hide();		// Oculta el spinner...

		} else {
			// Retorna al form con mesaje de error (en validadForm)
			return false;			
		}
	});

	// Evento antes de cerrar la ventana
	$(window).on("beforeunload", function()
	{
		if (CLIENTE.winBuscar) {		// Si está abierta la ventana de buscar firma..
			CLIENTE.objWinBuscar.close();    // ... la cierra
		}
		
	});

});  // Fin código jQuery
