<?php 

namespace App\Models;

use Illuminate\Database\Eloquent\Model;


/**
 * Usuario
 */
class Usuario extends Model
{
	// Nombre de la tabla
	protected $table = 'blo_Usuarios';

	// Lista de campos modificables:
	protected $fillable = ['Usuario', 'Contrasena', 'Nivel', 'Estado'];

}