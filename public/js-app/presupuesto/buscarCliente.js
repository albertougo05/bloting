//
// Funcion para buscar cliente y llenar formulario de presupuesto
// 

export function buscarCliente(id, url) {

	//console.log('Class BF - Id: ' + id);
	$.ajax(
    {
        url : url,
        type: "GET",
        data: { id: id },
        success: function(data, textStatus, jqXHR) 
        {
			let dataObj = $.parseJSON(data);
			_clienteAlFormulario(dataObj);		//	Llenar lo campos del from  -- NO SE PUEDE LLAMAR A FUNCIONES INTERNAS ?
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

// Llenar los campos del formulario... 
let _clienteAlFormulario = function (data) {
	$('input#id_cliente').val(data.id);
	$('input#nombre').val(data.Nombre);
	$('input#domicilio').val(data.Direccion);
	$('input#localidad').val(data.Localidad);
	$('input#codPostal').val(data.CodPostal);
	$('select#provincia').val(data.Provincia).change();
	$('select#pais').val(data.Pais).change();;
	$('input#telefono').val(data.Telefono);
	$('input#celular').val(data.Celular);
	$('input#cuitdni').val(data.CUIT);
	$('input#contacto').val(data.Contacto);
	$('input#email').val(data.Email);

	return null;
}
