//
// usuario.js
//

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


USER.validaFormulario = function () {
	let valido = true,
	    hayPass = false,
	    hayConf = false;

	if ( COMMONS.isEmpty( $('#usuario').val() ) ) {
		valido = false;
		//toastr["error"]("Debe ingresar un Nombre !!", "Error en Usuario");
		toastr.error("Debe ingresar un Nombre !!", "Error en Usuario");

		return valido;		// Retorna falso y sale
	} 
	if ( COMMONS.isEmpty( $('#contrasena').val() ) ) {
		valido = false;
		toastr.error("Debe ingresar una Contraseña !!", "Error en Usuario");
	} else {
		hayPass = true;
	}
	if (COMMONS.isEmpty( $('#confirma').val() )) {
		valido = false;
		toastr.error("Debe confirmar la contraseña !!", "Error en Usuario");
	} else {
		hayConf = true;
	}

	if (hayPass && hayConf) {
		valido = $('#contrasena').val() === $('#confirma').val();
		if ( !valido ) {
			toastr.error("Las contraseñas NO coniciden !!", "Error en Usuario");
		}
	}

	return valido;
};

USER.enviarForm = function () {
	let retorno = false;
	const datauser  = $('form#formUser').serialize();
	event.preventDefault(); 
	event.stopPropagation();

	$.ajax(
    {
        url : USER._pathGuardar,
        type: "POST",
        data: datauser,

        success: function(data, textStatus, jqXHR) 
        {
			//const dataObj = $.parseJSON(data);
			//console.log('Result: ' + dataObj + 'Data enviada: ' + datauser);
			toastr.success("Usuario guardado con éxito !!", "Usuario");
			retorno = true;
        },
        error: function(jqXHR, textStatus, errorThrown)         // if fails
        {
            //console.log('Status de error: ' + textStatus);
            toastr.error("Error al guardar datos !!", "Usuario");
            retorno = false;
        }
    });

    return retorno;
};

USER.existeUsuario = async function (url) {
	const res = await fetch(url);
  	const data = await res.json();
 	
  	return data.existe;
};

USER.buscarUsuario = async function (url) {
	let data = await (await fetch(url)
		.catch( USER.handleErr ))
		.json();

	if (data.code && data.code == 400) {
		//problem error
		return data;
	}
	//console.log('En buscarUsuario: ' + data);

	return data;		// Retorna una Promesa
};

USER.handleErr = function(err) {
    console.warn(err);
    let resp = new Response (
	    JSON.stringify({
			code: 400,
			message: "Error al traer datos !"
	    })
    );

	return resp;
};

// Lllenar formulario con datos de usuario
USER.llenarForm = function ( dat ) {
	$('#iduser').val(dat.Id);
	$('#usuario').val(dat.Usuario);
	$('#contrasena').val(dat.Contrasena);
	$('#confirma').val(dat.Contrasena);
	$('#nivel').val(dat.Nivel);
	$('#estado').val(dat.Estado);
};


/*
 * Codigo jQuery
 */
$(function () {
	// Focus on Nombre
	$('#usuario').focus();

	// Verificar si el usuario ya existe en la BD
	$('input#usuario').focusout( function () {
		const usuario = $(this).val();

		if ( !USER.statusEdit ) {

			if ( !COMMONS.isEmpty( usuario.trim() ) ) {
				const usuario = $(this).val();
				const existe = USER.existeUsuario( USER._pathExiste + usuario.trim() );
				existe
					.then( (data) => {

						//console.log('Data: ' + data);
						if (data) {
							toastr.error("El nombre YA EXISTE !!", "ERROR en Usuario");
							$('#usuario').val('').focus();
						}
					})
					.catch( (err) => {
						toastr.error("Error (" + err + ") al buscar nombre usuario!!", "Usuario");
					}
				);
				//console.log('Existe...' + existe);
			}
		}
	});

	// Al perder el foco la confirmacion de contraseña
	$('input#confirma').focusout( function () {
		const valido = $('#contrasena').val() === $('#confirma').val();
		
		if ( !valido ) {
			toastr.error("Las contraseñas NO coniciden !!", "Error en Usuario");
			$('#confirma').focus();
		}
	});

	// Para boton menú Buscar lanza el Modal para buscar usuario
	$('button#btnSelecUser').click(function(){
		const url = USER._pathBuscar + $('select#selectUser').val();

		$('#modalUsers').modal('hide');
		//console.log('Url buscar: ' + url );
		const dataUser = USER.buscarUsuario(url);		// Buscar Usuario 

		dataUser.then( (data) => {
			if ( data.code || data.status) {
				toastr.error("Error al buscar usuario", "Error en Usuario");

			} else {
				//console.log('Cargar datos de: ' + data.Usuario);
				USER.llenarForm(data);		// Cargar datos en form
			}
		});

		return null;
    });				

	// Evento Click boton SUBMIT y link Guardar
	$('#btnConfirma, a#guardar').click(function (event) {
		let guardaOk = true,
		    timeWait = 4000;

		event.preventDefault(); 
		event.stopPropagation();

		// Validaciones
		if ( USER.validaFormulario() ) {

			$('#spinnerGuardar').show();		// Muestra el spinner...
			guardaOk = USER.enviarForm();		// envio form por ajax...
			$('#spinnerGuardar').hide();		// Oculta el spinner...
			// Salir y recargar la página. Espera 5 segundos
			// si hay error espera mas tiempo
			if ( !guardaOk ) { timeWait = 5000; }

	    	setTimeout( function () {
	    		location.assign( USER._pathUsuario );
	    		//console.log('Saliendo...');
	    	}, timeWait );

		} else {
			// Retorna al form con mesaje de error (en validadForm)
			$('#usuario').focus();
			return false;			
		}
	});


});
