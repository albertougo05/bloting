//
// Guardar Presupuesto (Revealing Module Pattern)
//

var guardarPresup = (function() {
    let dataPresup = {};

    let _privateMethod = function() {
    	console.log('Inside a private method!');
    	//privateVariable++;
    }

    const _datosComprob = () => {		// Datos comprobante
    	dataPresup.id                 = $('#id_presup').val();
    	dataPresup.fecha              = $('#fecha').val();
    	dataPresup.fechaAnulaOElimina = $('#fechaAnulac').val();
    	dataPresup.fechaUltCambio     = $('#fechaUltModif').val();
    	dataPresup.idTipoComp         = $('#idTipoComprobante').val();
    	dataPresup.idEstado           = $('#estado').val();    	
    	dataPresup.idSucursal         = $('#sucursal').val();
    	dataPresup.nroComprobante     = $('#id_presup').val();
        dataPresup.observaciones      = $('#observaciones').val();
    }

    const _datosClie = () => {		// Datos cliente
    	dataPresup.idCliente          = $('#id_cliente').val();
    	dataPresup.nombreCli          = $('#nombre').val();
    	dataPresup.cuitdni            = $('#cuitdni').val();
    	dataPresup.domiciio           = $('#domicilio').val();
    	dataPresup.localidad          = $('#localidad').val();
    	dataPresup.provincia          = $('#provincia').val();
    	dataPresup.codPostal          = $('#codPostal').val();
    	dataPresup.pais               = $('#pais').val();
    	dataPresup.telefono           = $('#telefono').val();
    	dataPresup.celular            = $('#celular').val();
    	dataPresup.email              = $('#email').val();
    	dataPresup.contacto           = $('#contacto').val();    	
    }

    const _datosRegVisita = () => {    	// Registro visita
	    dataPresup.idEmplHaceRegistro   = $('#empleadoHaceRegistro').val();
	    dataPresup.detalleRegistro      = $('#detalleRegistro').val();
	    dataPresup.fechaTentativaVisita = $('#fechaTentativa').val();
	    dataPresup.fechaVisita          = $('#fechaVisita').val();    	
    }

    const _datosPresupuesto = () => {       // Presupuesto
        dataPresup.fechaPresupuesto = $('#fechaPresupuesto').val();
        dataPresup.fechaVencimiento = $('#fechaVencPresup').val();
        dataPresup.idEmplHacePresup = $('#emplRealizaPresup').val();

/*      dataPresup.           = $('#').val();
        dataPresup.           = $('#').val();
        dataPresup.           = $('#').val();
*/        
    }


    /**
     * 
     * FUNCIONES PUBLICAS
     * 
     */

    let recolectData = function() {		// Recolectar los datos de TODO el presupuesto
    	_datosComprob();
    	_datosClie();
    	_datosRegVisita();
        // _datosPresupuesto();


    	return dataPresup;
    }

    let otherMethodIWantToExpose = function() {
    	_privateMethod();
    }

    return {
        recolectarData: recolectData,
        second: otherMethodIWantToExpose
    };

})();


export default guardarPresup;

/** 
 *	Ejemplos de Revealing Module Pattern
 *
 * Exposer.first();        // Output: This is a method I want to expose!
 * Exposer.second();       // Output: Inside a private method!
 * Exposer.methodToExpose; // undefined
 * 
 */



