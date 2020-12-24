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

        // Actualizar fecha de último cambio
        dataComp.append('fechaUltimoCambio', COMMONS.fechaActual());

        // si el estado es Anulado o Eliminado...
        const idEstado = document.getElementById('idEstado').value;
        if (idEstado == 7 || idEstado == 8) {
            dataComp.append('fechaAnulaoElimina', COMMONS.fechaActual());
        }

        dataComp.append('observaciones', observac);

        return dataComp;
    }

    const _idsSelects = () => {
        return { idEmpRegistro: $('#form_registro select[name=idEmpleado]').val(),
                 idEmpPresup:   $('#form_presup1 select[name=idEmpleado]').val(),
                 idEmpOrdenT:   $('#form_ordenTrab select[name=idEmpleado]').val() };
    }

    // Verifica si los tabs tienen seteado empleado para que se guarden 
    const _checkTabsParaGuardar = (guardadoDeTabs) => {
        const { idEmpRegistro, idEmpPresup, idEmpOrdenT } = _idsSelects();

        if (idEmpRegistro > 0 && !guardadoDeTabs.ordenTrabajo) {
            toastr.error("Atención !", "Debe guardar Registro Visita !!");
        }
        if (idEmpPresup > 0 && !guardadoDeTabs.presupuesto) {
            toastr.error("Atención !", "Debe guardar Presupuesto !!");
        }
        if (idEmpOrdenT > 0 && !guardadoDeTabs.ordenTrabajo) {
            toastr.error("Atención !", "Debe guardar Orden de Trabajo !!");
        }
        if (!guardadoDeTabs.fotos) {
            toastr.error("Atención !", "Debe guardar Fotos !!");
        }
        if (!guardadoDeTabs.extras) {
            toastr.error("Atención !", "Debe guardar Extras !!");
        }
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

    const _validarOrdenTrabajo = () => {
        // idEmplHaceOrden
        if ( $('#form_ordenTrab select[name=idEmpleado] :selected').val() == 0 ) {
            toastr.error("Error en Orden de Trabajo", "Debe ingresar empleado hace la orden !!");
            $('#form_ordenTrab select[name=idEmpleado]').focus();
            return false;
        }
        // Detalle de la orden
        if ( COMMONS.isEmpty( $('#form_ordenTrab textarea[name=detalle]').val() ) ) {
            toastr.error("Error en Orden de Trabajo", "Debe ingresar un detalle !!");
            $('#form_ordenTrab textarea[name=detalle]').focus();
            return false;
        }
        // Fecha tentativa visita
        if ( COMMONS.isEmpty( $('#form_ordenTrab input[name=fechaTentativa]').val() ) ) {
            toastr.error("Error en Orden de Trabajo", "Debe ingresar fecha tentativa !!");
            $('#form_ordenTrab input#fechaTentativa').focus();
            return false;
        }

        return true;
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
        //console.log('Status registro:', data);
        toastr.options = PRESUP.toastrSuccessOptions;
            toastr.success("Perfecto !", "Registro guardado con éxito !!");
        toastr.options = PRESUP.toastrErrorOptions;
        PRESUP.guardadoDeTabs.registro = true;
    }

    const _salvandoOrdenTrabajo = async (endpoint, idPresup) => {
        const form = document.getElementById('form_ordenTrab');
        let dataOT = new FormData(form);
        const id = $('#form_comprob input[name=id]').val(); // Add id del comprobante
        dataOT.append('idComprobante', id);

        const options = { method: 'POST',
                          body: dataOT };
        try {
            const res = await fetch(endpoint, options);
            let data = await res.json();
            console.log('Status orden trabajo:', data);
            toastr.options = PRESUP.toastrSuccessOptions;
                toastr.success("Perfecto !", "Orden Trabajo guardada con éxito !!");
            toastr.options = PRESUP.toastrErrorOptions;
            PRESUP.guardadoDeTabs.ordenTrabajo = true;
        } catch (error) {
            toastr.error("Error !", "La Orden Trabajo no pudo ser guardada !!");
        }
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
        //console.log('Status presup:', data);
        toastr.options = PRESUP.toastrSuccessOptions;
            toastr.success("Perfecto !", "Presupuesto guardado con éxito !!");
        toastr.options = PRESUP.toastrErrorOptions;
        PRESUP.guardadoDeTabs.presupuesto = true;
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

    const _salvandoFotos = async (lista, url, idcomp) => {
        let datos = {
            csrf_name: $('#form_comprob input[name=csrf_name]').val(),
            csrf_value: $('#form_comprob input[name=csrf_value]').val(),
            idComprobante: idcomp,
            fotos: lista
        };

        datos = JSON.stringify(datos);

        const options = { method: 'POST',
                            headers: {
                                'Content-Type': 'application/json' },
                            body: datos };
        const res = await fetch(url, options);

        return await res.json();
    }

    const _salvandoExtras = async (lista, url, idPresu) => {
        let datos = {
            csrf_name: $('#form_comprob input[name=csrf_name]').val(),
            csrf_value: $('#form_comprob input[name=csrf_value]').val(),
            idComprobante: idPresu,
            extras: lista
        };

        datos = JSON.stringify(datos);
        const options = { method: 'POST',
                            headers: {
                                'Content-Type': 'application/json' },
                            body: datos };
        const res = await fetch(url, options);
        PRESUP.guardadoDeTabs.extras = true;

        return await res.json();
    }

    // Si el tab tiene puesto el empleado, ese es el estado
    const _establecerEstadoComprob = () => {
        const { idEmpRegistro, idEmpPresup, idEmpOrdenT } = _idsSelects();
        const elemTipoComp = document.getElementById('idTipoComprobante');
        const idTipoComprobante = elemTipoComp.value;
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



    /**
     * 
     * FUNCIONES PUBLICAS
     * 
     */

    const salvarComprob = async (url, guardadoDeTabs) => {
        _establecerEstadoComprob();
        const data = _recolectData();
        const options = {
            method: 'POST',
            //mode: 'cors',
            body: data
        }
        const req = new Request(url, options);

        try {
            const resp = await fetch(req);

            const data = await resp.json();  // Si todo está Ok, data es un json
            _exitoEnGuardar(data);
            //_checkTabsParaGuardar(guardadoDeTabs);

        } catch (err) {
            console.log('ERROR: ', err.message);
            toastr.error("Error en Presupuesto", "Error al guardar datos !!");
        }
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
            _establecerEstadoComprob();
        } else {
            toastr.error("Error al salvar registro", "Debe Confirmar el comprobante !!");
        }
    }

    let salvarPresup = function (url) {
        // Verificar campos necesarios...
        if ( PRESUP.guardado && _validarPresupuesto() ) {
            _salvandoPresupuesto(url);
            _establecerEstadoComprob();
            return true;
        } else {
            toastr.error("Error al salvar presupuesto", "Debe Confirmar el comprobante !!");
            return false;
        }
    }

    let salvarOrdenTrab = function (url, idPresup) {

        if ( PRESUP.guardado ) {
            if ( _validarOrdenTrabajo() ) {
                _salvandoOrdenTrabajo(url, idPresup);
                _establecerEstadoComprob();
            }
        } else {
            toastr.error("Error al salvar Orden de trabajo", "Debe Confirmar el comprobante !!");
        }
    }

    let salvarFotos = function (listaDeFotos, endPoint, idPresup) {
        // Verificar si idComprobante > 0
        if ( PRESUP.guardado ) {
            _salvandoFotos(listaDeFotos, endPoint, idPresup)
                .then(data => {
                    toastr.options = PRESUP.toastrSuccessOptions;
                        toastr.success("Perfecto !", "Fotos guardadas con éxito !!");
                    toastr.options = PRESUP.toastrErrorOptions;
                })
                .catch(error => {
                    toastr.error("Error !", "Las fotos no pudieron guardar !!");
                }
            );

        } else {
            toastr.error("Error al salvar Fotos", "Debe Confirmar el comprobante !!");
        }
    }

    let salvarExtras = function (listaExtras, url, idPresup) {
        
        if ( PRESUP.guardado ) {    // Si está guardado el comprobante

            const dataExt = _salvandoExtras(listaExtras, url, idPresup);
            dataExt.then( res => {
                    toastr.options = PRESUP.toastrSuccessOptions;
                        toastr.success("Perfecto !", "Extras guardadas con éxito !!");
                    toastr.options = PRESUP.toastrErrorOptions;
                    return null;
            }, err => {
                toastr.error("Error al salvar Extras", "Debe intentar luego !!");
            });

        } else {
            toastr.error("Error al salvar presupuesto", "Debe Confirmar el comprobante !!");
            return null;
        }
    }


    // Aqui se retornan la funciones públicas
    return {
        validarComprob: validarComprob,
        salvarComprob: salvarComprob,
        salvarRegistro: salvarRegistro,
        salvarPresup: salvarPresup,
        salvarOrdenTrab: salvarOrdenTrab,
        salvarFotos: salvarFotos,
        salvarExtras: salvarExtras,
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



