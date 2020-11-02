<?php 

namespace App\Models;

use Illuminate\Database\Eloquent\Model;


/**
 * Presupuesto
 */
class Presupuesto extends Model
{
	// Nombre de la tabla
	protected $table = 'blo_Presupuestos';

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
		'cliente_id',
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
		// Registro visita
		'idEmpHaceRegistro',
		'detalleRegistro',
		'fechaTentativaVisita',
		'fechaVisita',
		// Presupuesto
		'',
		// 
		'observaciones',
		'importe',
	];

}
