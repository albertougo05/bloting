<?php 

namespace App\Utils;

use App\Controllers\Controller;


/**
 * 
 * Clase con utilidades para todo el sistema
 * 
 */
class Utils extends Controller
{
	/**
	 * Convierte string de numero a float 
	 * (quita puntos de miles y cambia coma por punto decimal)
	 * 
	 * [ Ver en ProductosController: 
	 *   - 44 // Saco puntos de miles y cambio coma por punto decimal. Convierto a float.
     *   - 45 $datos['Precio'] = (float) preg_replace(['/\./', '/,/'],['', '.'], $datos['Precio']);
	 * ]
	 * 
	 * @param  string $cadena
	 * @return float 
	 */
	public function convStrToFloat($cadena)
	{
		$sinPuntos  = str_replace('.', '', $cadena);
  		$cambioComa = str_replace(',', '.', $sinPuntos);
  		$flotante   = floatval($cambioComa);

		return $flotante;
	}

	/**
	 * Setup de fechas
	 *
	 * @return array
	 */
	public function setFechas()
	{
		date_default_timezone_set("America/Buenos_Aires");

		$fechas = [ 'hoy'      => date('Y-m-d'), 
		            'diaantes' => date("Y-m-d",strtotime( date('Y-m-d')."+ 1 days")),
		            'mesantes' => date("Y-m-d",strtotime( date('Y-m-d')."- 1 month")) ];

		return $fechas;
	}

	/**
	 * Devuelve string con where de fechas
	 * 
	 * @param  string $desde
	 * @param  string $hasta
	 * @param  bool   $isWhere ->  
	 * @return string
	 */
	public function getWhereFechas($desde, $hasta, $campoFecha, $isWhere = true)
	{
		if ($desde == '' && $hasta == '') {
			$where = '';
		} elseif ($hasta == '') {
			$desde = date('Y-m-d', strtotime($desde));
			$where = (($isWhere) ? " AND " : "") . $campoFecha . " >= '" . $desde . "' ";
		} elseif ($desde == '') {
			$hasta = date('Y-m-d', strtotime($hasta));
			$where = (($isWhere) ? " AND " : "") . $campoFecha . " <= '" . $hasta."' ";
		} else {
			$desde = date('Y-m-d', strtotime($desde));
			$hasta = date('Y-m-d', strtotime($hasta));
			$where = (($isWhere) ? " AND " : "") . $campoFecha . " >= '" . $desde . "' AND " . $campoFecha . " <= '" . $hasta . "' ";
		}

		return $where;
	}


}
