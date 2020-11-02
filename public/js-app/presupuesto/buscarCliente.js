//
// Funcion para buscar cliente y llenar formulario de presupuesto
// 

export function buscarCliente( id, url ) {

	//console.log('Class BF - Id: ' + id);
	$.ajax(
    {
        url : url,
        type: "GET",
        data: { id: id },
        success: function(data, textStatus, jqXHR) 
        {
			let dataObj = $.parseJSON(data);
			//console.log('Id: ' + dataObj.id + 'Nombre: ' + dataObj.Nombre);
			_datosAlFormulario(dataObj);		//	Llenar lo campos del from  -- NO SE PUEDE LLAMAR A FUNCIONES INTERNAS ?
        },
        error: function(jqXHR, textStatus, errorThrown) 
        {
            console.log('Status de error: ' + textStatus);
            toastr.error("Error al buscar datos !!", "Cliente");
        }
    });

	return null;
}

//
// Funciones privadas
//

// Llenar los campos del formulario...    --  SERIA UNA FUNCION INTERNA Y NO LA LLAMA (??)
let _datosAlFormulario = function (data) { 
	$('input#cliente_id').val(data.id);
	$('input#nombre').val(data.Nombre);
	$('input#domicilio').val(data.Direccion);
	$('input#localidad').val(data.Localidad);
	$('input#telefono').val(data.Telefono);
	$('input#celular').val(data.Celular);
	$('input#cuitdni').val(data.CUIT);
	$('input#email').val(data.Email);

	return null;
}
