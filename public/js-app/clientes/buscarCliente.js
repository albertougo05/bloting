//
// Funcion para buscar Cliente y llenar formulario
// 

export function buscarCliente ( id ) {

	//console.log('Class BF - Id: ' + id);
	$.ajax(
    {
        url : CLIENTE._pathGetFirma,
        type: "GET",
        data: { id: id },
        success: function(data, textStatus, jqXHR) 
        {
			let dataObj = $.parseJSON(data);
			//console.log('Id: ' + dataObj.id + 'Nombre: ' + dataObj.Nombre);
			_datosAlFormulario(dataObj);	//	Llenar lo campos del form  -- NO SE PUEDE LLAMAR A FUNCIONES INTERNAS ?
        },
        error: function(jqXHR, textStatus, errorThrown) 
        {
            console.log('Status de error: ' + textStatus);
            toastr["error"]("Error al buscar datos !!", "Cliente");
        }
    });

	return null;
}

//
// Funciones privadas
//

// Llenar los campos del formulario...    --  SERIA UNA FUNCION INTERNA Y NO LA LLAMA (??)
let _datosAlFormulario = function (data) { 
	$('input#id').val(data.id);
	$('input#Nombre').val(data.Nombre);
	$('input#Alias').val(data.Alias);
	$('input#Direccion').val(data.Direccion);
	$('input#Localidad').val(data.Localidad);
	$('input#CodLoc').val(data.CodLoc);
	$('select#Provincia').val(data.Provincia).change();
	$('input#CodProv').val(data.CodProv);
	$('input#CodPostal').val(data.CodPostal);
	$('input#Telefono').val(data.Telefono);
	$('input#Celular').val(data.Celular);
	$('input#CUIT').val(data.CUIT);
	$('input#CondicionFiscal').val(data.CondicionFiscal);
	$('input#Email').val(data.Email);
	$('input#Estado').val(data.Estado);

	return null;
}
