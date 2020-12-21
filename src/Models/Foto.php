<?php 

namespace App\Models;

use Illuminate\Database\Eloquent\Model;


/**
 * Foto
 */
class Foto extends Model
{
	// Nombre de la tabla
	protected $table = 'blo_Fotos';

	// Lista de campos modificables:
	protected $fillable = [
		'idComprobante',
		'nombreFoto'
	];
}