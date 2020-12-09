//
// Guardar Comprobante (Revealing Module Pattern)
//

var guardarComprob = (function() {

    /**
     * 
     * FUNCIONES PRIVADAS
     * 
     */

    // Pasa importe de tab presupuesto a input hidden del comprobante
    const _pasarImporte = function () {
        const inputImporte = document.getElementById('importePresup');
        const inputHidden = document.getElementById('importe');

        inputHidden.value = inputImporte.value;
    }

    // Si el tab tiene puesto el empleado, ese es el estado
    const _establecerEstadoComprob = () => {
        const { idEmpRegistro, idEmpPresup, idEmpOrdenT } = _idsSelects();
        const elemTipoComp = document.getElementById('idTipoComprobante');
        let idTipoComp = 0;

        if (idEmpRegistro > 0) {
            idTipoComp = 1;
        }
        if (idEmpPresup > 0) {
            idTipoComp = 2;
        }
        if (idEmpOrdenT > 0) {
            idTipoComp = 3;
        }

        elemTipoComp.value = idTipoComp;
    }

    const _exitoEnGuardar = (data) => {
        $('#form_comprob input[name=id]').val(parseInt(data.id));
        $('#spinnerGuardar').hide();
        toastr.options = PRESUP.toastrSuccessOptions;
            toastr.success("Perfecto !", "Presupuesto guardado con éxito !!");
        toastr.options = PRESUP.toastrErrorOptions;
        $('#btnImprime').prop( 'disabled', false );
        $('#btnConfirma').prop( 'disabled', true );
        PRESUP.guardado = true;
    }

    const _recolectData = function() {     // Recolectar los datos
        _pasarImporte();
        const form = document.getElementById('form_comprob');
        const observac = document.getElementById('observaciones').value;
        let dataComp = new FormData(form);

        dataComp.append('observaciones', observac);

        return dataComp;
    }

    const _idsSelects = () => {
        return { idEmpRegistro: $('#form_registro select[name=idEmpleado]').val(),
                 idEmpPresup:  $('#form_presup1 select[name=idEmpleado]').val(),
                 idEmpOrdenT: $('#form_ordenTrab select[name=idEmpleado]').val() };
    }

    // Verifica si los tabs tienen seteado empleado para que se guarden 
    const _checkTabsParaGuardar = () => {
        const { idEmpRegistro, idEmpPresup, idEmpOrdenT } = _idsSelects();

        if (idEmpRegistro > 0) {
            toastr.error("Atención !", "Debe guardar Registro Visita !!");
        }
        if (idEmpPresup > 0) {
            toastr.error("Atención !", "Debe guardar Presupuesto !!");
        }
        if (idEmpOrdenT > 0) {
            toastr.error("Atención !", "Debe guardar Orden de Trabajp !!");
        }        
    }

    const _salvandoRegistro = async (endpoint) => {
        const form = document.getElementById('form_registro');
        let dataReg = new FormData(form);
        const id = $('#form_comprob input[name=id]').val(); // Add id del comprobante
        dataReg.append('idComprobante', id);

        const options = { method: 'POST',
                          body: dataReg };
        const res = await fetch(endpoint, options);
        let data = await res.json();
        //data = JSON.parse(data);
        console.log('Status registro:', data);
    }

    const _validarRegistroVisita = () => {
        // idEmplHaceRegistro
        if ( $('#form_registro select[name=idEmpleado] :selected').val() == 0 ) {
            toastr.error("Error en Registro Visita", "Debe ingresar empleado hace el registro !!");
            $('#form_registro select[name=idEmpleado]').focus();
            return false;
        }
        // Detalle del registro
        if ( COMMONS.isEmpty( $('#form_registro textarea[name=detalle]').val() ) ) {
            toastr.error("Error en Presupuesto", "Debe ingresar un detalle de visita !!");
            $('#detalleRegistro').focus();
            return false;
        }
        // Fecha tentativa visita
        if ( COMMONS.isEmpty( $('#form_registro input[name=fechaTentativa]').val() ) ) {
            toastr.error("Error en Presupuesto", "Debe ingresar fecha tentativa de visita !!");
            $('input#fechaTentativa').focus();
            return false;
        }

        return true;
    }

    const _salvandoPresupuesto = async (endpoint) => {
        const form1 = document.getElementById('form_presup1');
        const form2 = document.getElementById('form_presup2');
        const dataForm2 = new FormData(form2); 
        let dataPresup = new FormData(form1);

        // paso los valores del form2 a form1
        for(let value of dataForm2.entries()) {
           //console.log(value[0]+ ', '+ value[1]);
           dataPresup.append(value[0], value[1])
        }

        const id = $('#form_comprob input[name=id]').val(); // Add id del comprobante
        dataPresup.append('idComprobante', id);

        const options = { method: 'POST',
                          body: dataPresup };
        const res = await fetch(endpoint, options);
        let data = await res.json();
        console.log('Status presup:', data);
    }

    const _validarPresupuesto = () => {
        // idEmpleado
        if ( $('#form_presup1 select[name=idEmpleado] :selected').val() == 0 ) {
            toastr.error("Error en Presupuesto", "Debe ingresar empleado hace el presupuesto !!");
            $('#form_presup1 select[name=idEmpleado]').focus();
            return false;
        }
        // Fecha presupuesto
        if ( COMMONS.isEmpty( $('#form_presup1 input[name=fechaPresup]').val() ) ) {
            toastr.error("Error en Presupuesto", "Debe ingresar fecha de presupuesto !!");
            $('input#fechaPresup').focus();
            return false;
        }

        return true;
    }






    /**
     * 
     * FUNCIONES PUBLICAS
     * 
     */

    let salvarComprob = function(url) {
        const data = _recolectData();

        _establecerEstadoComprob();

        const options = {
            method: 'POST',
            //mode: 'cors',
            body: data
        }
        const req = new Request(url, options);

        fetch(req)
            .then((response) => {
                if (response.ok) {
                    return response.json();
                } else {
                    throw new Error('Error de escritura !!')
                }
            })
            .then( (data) => {      // Si todo está Ok, data es un json
                console.log(data);
                _exitoEnGuardar(data);
                _checkTabsParaGuardar();
            })
            .catch( (err) => {
                console.log('ERROR: ', err.message);
                toastr.error("Error en Presupuesto", "Error al guardar datos !!");
            });
    }

    let validarComprob = () => {
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
        // Registro de visita
        if (!_validarRegistroVisita()) {
            return false;
        }
        // Fecha tentativa de visita
        if ( COMMONS.isEmpty( $('#fechaTentativa').val() ) ) {
            toastr.error("Error en Presupuesto", "Debe ingresar fecha tentativa de visita !!");
            $('#fechaTentativa').focus();
            return false;
        }

        return true;
    }

    let salvarRegistro = function (url) {
        // Verificar si está guardado el comprobante
        if ( PRESUP.guardado && _validarRegistroVisita() ) {
            _salvandoRegistro(url);
        } else {
            toastr.error("Error al salvar registro", "Debe Confirmar el comprobante !!");
        }
    }

    let salvarPresup = function (url) {
        // Verificar campos necesarios...
        if ( PRESUP.guardado && _validarPresupuesto() ) {
            _salvandoPresupuesto(url);
            return true;
        } else {
            toastr.error("Error al salvar presupuesto", "Debe Confirmar el comprobante !!");
            return false;
        }
    }

    let salvarOrdenT = function () {
        const form = document.getElementById('form_ordenTrab');
        let dataOrd = new FormData(form);

        // Verificar si idComprobante > 0
        // Add idComprobante


    }

    let salvarFotos = function (listaDeFotos) {
        let dataFotos = new FormData();

        // Verificar si idComprobante > 0
        // Add idComprobante


    }


    return {
        validarComprob: validarComprob,
        salvarComprob: salvarComprob,
        salvarRegistro: salvarRegistro,
        salvarPresup: salvarPresup,
        salvarOrdenT: salvarOrdenT,

    };

})();


export default guardarComprob;

/** 
 *	Ejemplos de Revealing Module Pattern
 *
 * Exposer.first();        // Output: This is a method I want to expose!
 * Exposer.second();       // Output: Inside a private method!
 * Exposer.methodToExpose; // undefined
 * 
 */



