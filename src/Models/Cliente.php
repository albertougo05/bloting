<?php 

namespace App\Models;

use Illuminate\Database\Eloquent\Model;


/**
 * Clientes
 */
class Cliente extends Model
{
	// Nombre de la tabla
	protected $table = 'blo_Clientes';

	// Lista de campos modificables:
	protected $fillable = [
		'Nombre', 
		'Alias',
		'Direccion', 
		'Localidad',
		'CodLoc',
		'Provincia',
		'CodProv',
		'CodPostal',
		'Telefono',
		'Celular',
		'CUIT',
		'CondicionFiscal',
		'Email',
		'Estado'
	];

}