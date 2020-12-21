<?php 

namespace App\Models;

use Illuminate\Database\Eloquent\Model;


/**
 * Extra
 */
class Extra extends Model
{
	// Nombre de la tabla
	protected $table = 'blo_Extras';

	// Lista de campos modificables:
	protected $fillable = [
		'idComprobante',
		'descripcion',
		'importe'
	];
}