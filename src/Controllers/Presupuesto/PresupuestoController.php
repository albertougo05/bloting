<?php 

namespace App\Controllers\Presupuesto;

use App\Models\Cliente;
use App\Models\Presupuesto;
use App\Models\Sucursal;
use App\Models\TipoComprobante;
use App\Models\EstadoComprobante;
use App\Models\Empleado;
use App\Models\Producto;
use App\Models\TipoProducto;
use App\Models\EstadoItem;
use App\Models\Provincia;


use App\Controllers\Controller;


/**
 * 
 * Clase PresupuestoController
 * 
 */
class PresupuestoController extends Controller
{
	/**
	 * Presupuesto (inicio)
	 * Name: presupuesto
	 * 
	 * @param  Request  $request
	 * @param  Response $response
	 * @return View 
	 */
	public function presupuesto($request, $response)
	{
		$condFiscal = array('Consumidor final', 'Exento', 'Monotributo', 'Responsable Inscripto');
		$clientes   = Cliente::where('Estado', 'Activo')
							 ->orderBy('Nombre')
							 ->get();
		$sucursales = Sucursal::orderBy('nroSucursal')
							  ->get();
		$tiposCompr = TipoComprobante::get();
		$estadosCom = EstadoComprobante::get();
		$empleados  = Empleado::where('Estado', 'Activo')
							  ->orderBy('apellidoNombre')
							  ->get();
		$productos  = Producto::orderBy('descripcion')
							  ->get();
		$tiposProductos = [ [ 'id' => 1, 'descripcion' => 'Revestimiento' ], 
							[ 'id' => 2, 'descripcion' => 'Cielorraso' ],
							[ 'id' => 3, 'descripcion' => 'Moldura' ] ];
		$estadosItem = EstadoItem::get();
		$provincias  = Provincia::orderBy('nombre')->get();

		$id_presup = Presupuesto::max('id') + 1;
		$fechas = $this->utils->setFechas();

		//
		// Detectar si es mobile
		//
		if ( $_SESSION['isMobile'] ) {
			$vista = 'presupuesto/presupuesto_mobile.twig';
			$esMobile = true;

		} else {
			$vista = 'presupuesto/presupuesto.twig';
			$esMobile = false;
		}

		$datos = array( 'titulo'       => 'Presupuesto',
						'condFiscal'   => $condFiscal,
						'clientes'     => $clientes,
						'fecha'        => $fechas['hoy'],
						'id_presup'    => $id_presup,
						'sucursales'   => $sucursales,
						'tiposCompr'   => $tiposCompr,
						'estadosCompr' => $estadosCom,
						'empleados'    => $empleados,
						'tiposprod'    => $tiposProductos,
						'productos'    => $productos,
						'estadosItem'  => $estadosItem,
						'provincias'   => $provincias,
						'isMobile'     => $esMobile
		);

		return $this->view->render($response, $vista, $datos);
	}

	/**
	 * Guardar presupuesto (POST)
	 * Name: presupuesto.guardar
	 * 
	 * @param  Request  $request
	 * @param  Response $response
	 * @return json 
	 */
	public function guardar($request, $response)
	{
		$resp = ['ok' => true];
		$dataForm = $this->_extractData($request);

//echo "<br><pre>"; print_r( $dataForm ); echo "</pre><br>";
//die('Ver...');

		$presup = Presupuesto::lockForUpdate()
							 ->updateOrInsert([ 'id' => $request->getParam('id') ], $dataForm );

		return json_encode($resp);
	}

	/**
	 * Popup para buscar Presupuesto
	 * Name: presupuesto.buscar
	 * 
	 * @param  Request  $request
	 * @param  Response $response
	 * @return View 
	 */
	public function buscar($request, $response)
	{
		$presup = Presupuesto::orderBy('fecha')->get();

		$datos = array( 'titulo'       => 'Buscar Presupuesto',
						'presupuestos' => $presup,
		);

		return $this->view->render($response, 'presupuesto/presup_buscar.twig', $datos);
	}

	/**
	 * Devuelva json con datos de un presupuesto
	 * Name: presupuesto.getpresup
	 * 
	 * @param  Request $request
	 * @param  Response $response
	 * @param  array $args
	 * @return json
	 */
	public function getPresup($request, $response, $args)
	{
		$id = $request->getParam('id');
		$id = filter_var( $id, FILTER_SANITIZE_NUMBER_INT );
		$presup = Presupuesto::find( $id );

		return json_encode($presup->toArray());
	}

	/**
	 * Imprime presupuesto por id
	 * Name: presupuesto.imprimir
	 * 
	 * @param  Request  $request
	 * @param  Response $response
	 * @return View
	 */
	public function imprimir($request, $response)
	{
		$presup = Presupuesto::find($request->getParam('id'));

		$datos = [ 'titulo'   => 'Imprimir',
				   'presupuesto'  => $presup ];

		return $this->view->render($response, 'presupuesto/imprime_presup.twig', $datos);
	}

	/**
	 * Guardar foto en disco (POST)
	 * Name: presupuesto.guardarfoto
	 * 
	 * @param  Request $request
	 * @param  Response $response
	 * @return json
	 */
	public function guardarFoto($request, $response)
	{
		$result = ['status' => 'error'];
		$idPresup = $request->getParam('idPresup');
		$files = $request->getUploadedFiles();

	    if (empty($files['inputFoto'])) {
    	    throw new Exception('Esperaba una foto !');
    	}

		$newfile = $files['inputFoto'];

		if ( $newfile->getError() === UPLOAD_ERR_OK ) {

		    $uploadFileName = $newfile->getClientFilename();
			# Chequear nombre de archivo si tiene espacios en blanco
			$nuevoNombreImg = preg_replace('/ /', '_', $uploadFileName);
		    $newfile->moveTo("./uploads/$uploadFileName");
		    $result = ['status' => 'ok', 'filename' => $nuevoNombreImg];
		}

		return json_encode($result);
	}


	/**
	 * Extrae datos del request para enviar al archivo
	 * 
	 * @param  Request $reqData
	 * @return array
	 */
	private function _extractData($reqData)
	{
		return [ 'fecha' 	  => $reqData->getParam('fecha'), 
				 'id_cliente' => $reqData->getParam('id_cliente'),
				 'nombre'     => $reqData->getParam('nombre'), 
				 'domicilio'  => $reqData->getParam('domicilio'),
				 'localidad'  => $reqData->getParam('localidad'),
				 'cuitdni'    => $reqData->getParam('cuitdni'),
				 'telefono'   => $reqData->getParam('telefono'),
				 'celular'    => $reqData->getParam('celular'),
				 'contacto'   => $reqData->getParam('contacto'),
				 'email'      => $reqData->getParam('email'),
				 'detalle'    => $reqData->getParam('detalle'),
				 'importe'    => $this->utils->convStrToFloat( $reqData->getParam('importe') ) ];
	}

}
