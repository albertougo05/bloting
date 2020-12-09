<?php 

namespace App\Models;

use Illuminate\Database\Eloquent\Model;


/**
 * Comprobante
 */
class Comprobante extends Model
{
	// Nombre de la tabla
	protected $table = 'blo_Comprobantes';

	// Lista de campos modificables:
	protected $fillable = [
		'fecha',
		'fechaAnulaoElimina',
		'fechaUltimoCambio',
		'idTipoComprobante',
		'idEstadoComp',
		'idSucursal',
		'nroComprobante',
		// Datos cliente
		'id_cliente',
		'nombre',
		'domicilio',
		'localidad',
		'provincia',
		'codPostal',
		'pais',
		'cuitdni',
		'telefono',
		'celular',
		'contacto',
		'e-mail',
		'observaciones',
		'importe',
	];

}
