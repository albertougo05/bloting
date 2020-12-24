<?php 

namespace App\Controllers\Presupuesto;

use App\Models\Cliente;
use App\Models\Comprobante;
use App\Models\Sucursal;
use App\Models\TipoComprobante;
use App\Models\EstadoComprobante;
use App\Models\Empleado;
use App\Models\Producto;
use App\Models\TipoProducto;
use App\Models\EstadoItem;
use App\Models\Provincia;
use App\Models\RegistroVisita;
use App\Models\OrdenTrabajo;
use App\Models\Extra;

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
		if ($request->getParam('idComp')) {
			$idComprobante = $request->getParam('idComp');
		} else {
			$idComprobante = 0;
		}

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

		$id_presup = Comprobante::max('id') + 1;
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
						'isMobile'     => $esMobile,
						'idComprobante'=> $idComprobante
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
		$resp = ['status' => 'error'];
		$dataForm = $this->_extractData($request);

		$comp = Comprobante::lockForUpdate()
							->updateOrInsert([ 'id' => $request->getParam('id') ], $dataForm );
		if ($comp) {
			$compr = Comprobante::latest()->first();
			$resp = [ 'status' => 'ok', 
					  'id' => $compr->id ];
		}

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
		$presup = Comprobante::orderBy('fecha')->get();

		$datos = array( 'titulo'       => 'Buscar Presupuesto',
						'presupuestos' => $presup,
		);

		return $this->view->render($response, 'presupuesto/presup_buscar.twig', $datos);
	}

	/**
	 * Devuelva json con datos de un presupuesto
	 * Name: presupuesto.getcomprobante
	 * 
	 * @param  Request $request
	 * @param  Response $response
	 * @param  array $args
	 * @return json
	 */
	public function getComprobante($request, $response, $args)
	{
		$id = $args['id'];
		$id = filter_var( $id, FILTER_SANITIZE_NUMBER_INT );
		$presup = Comprobante::find( $id );

		return json_encode($presup->toArray());
	}

	/**
	 * Devuelva json con datos de registro de visita
	 * Name: presupuesto.getregistro/{id}
	 * 
	 * @param  Request $request
	 * @param  Response $response
	 * @param  array $args
	 * @return json
	 */
	public function getRegistro($request, $response, $args)
	{
		$id = $args['id'];
		$id = filter_var( $id, FILTER_SANITIZE_NUMBER_INT );
		$registro = RegistroVisita::where( 'idComprobante', $id )
									->first();
		if ($registro) {
			$registro = $registro->toArray();
		} else {
			$registro = ['status' => 'No hay registro'];
		}

		return json_encode($registro);
	}

	/**
	 * Devuelve json con datos de orden de trabajo
	 * Name: presupuesto.getordentrabajo/{id}
	 * 
	 * @param  Request $request
	 * @param  Response $response
	 * @param  array $args
	 * @return json
	 */
	public function getOrdenTrabajo($request, $response, $args)
	{
		$id = $args['id'];
		$id = filter_var( $id, FILTER_SANITIZE_NUMBER_INT );
		$registro = OrdenTrabajo::where( 'idComprobante', $id )
								->first();
		if ($registro) {
			$registro = $registro->toArray();
		} else {
			$registro = ['status' => 'No hay orden de trabajo'];
		}

		return json_encode($registro);
	}

	/**
	 * Devuelve json con datos extras
	 * Name: presupuesto.getextras/{id}
	 * 
	 * @param  Request $request
	 * @param  Response $response
	 * @param  array $args
	 * @return json
	 */
	public function getExtras($request, $response, $args)
	{
		$id = $args['id'];
		$id = filter_var( $id, FILTER_SANITIZE_NUMBER_INT );
		$registro = Extra::where( 'idComprobante', $id )
						->get();
		if ($registro) {
			$registro = $registro->toArray();
		} else {
			$registro = ['status' => 'No hay extras'];
		}

		return json_encode($registro);
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
		$presup = Comprobante::find($request->getParam('id'));

		$datos = [ 'titulo'   => 'Imprimir',
				   'presupuesto'  => $presup ];

		return $this->view->render($response, 'presupuesto/imprime_presup.twig', $datos);
	}

	/**
	 * Guardar Tab Registro (POST)
	 * Name: presupuesto.guardarregistro
	 *
	 * @param  Request $request
	 * @param  Response $response
	 * @return json
	 */
	public function guardarRegistro($request, $response)
	{
		$result = ['status' => 'error'];
		$dataForm = $this->_dataRegVisitas($request);

		$reg = RegistroVisita::lockForUpdate()
							 ->updateOrInsert([ 'idComprobante' => $request->getParam('idComprobante') ], $dataForm );
		if ($reg) {
			$result['status'] = 'ok';
			$this->setFechaUltimoCambio($request->getParam('idComprobante'));
		}
		return json_encode($result);
	}

	/**
	 * Guardar Tab Orden de Trabajo (POST)
	 * Name: presupuesto.guardarordentrab
	 *
	 * @param  Request $request
	 * @param  Response $response
	 * @return json
	 */
	public function guardarOrdenTrab($request, $response)
	{
		$result = ['status' => 'error'];
		$data = $this->_dataOrdenTrab($request);

		$reg = OrdenTrabajo::lockForUpdate()
							->updateOrInsert(['idComprobante' => $request->getParam('idComprobante')], 
								$data );
		if ($reg) {
			$result['status'] = 'ok';
			$this->setFechaUltimoCambio($request->getParam('idComprobante'));
		}

		return json_encode($result);
	}

	/**
	 * Guardar Tab Extras (POST)
	 * Name: presupuesto.guardarextras
	 *
	 * @param  Request $request
	 * @param  Response $response
	 * @return json
	 */
	public function guardarExtras($request, $response)
	{
		$result = ['status' => 'error'];
		$data = $this->_dataExtras($request);

		Extra::where('idComprobante', $request->getParam('idComprobante'))
			  ->delete();

		foreach ($data as $value) {
			$extra = Extra::create($value);
		}

		if ($extra) {
			$result['status'] = 'ok';
			$this->setFechaUltimoCambio($request->getParam('idComprobante'));
		}

		return json_encode($result);
	}

	/**
	 * Actualiza fecha en cada modificación del comprobante
	 * 
	 * @param integer $id [Id de comprobante]
	 */
	public function setFechaUltimoCambio($id)
	{
		$comprob = Comprobante::where('nroComprobante', $id)->first();
		date_default_timezone_set("America/Buenos_Aires");
		$comprob->fechaUltimoCambio = date('Y-m-d');
		$comprob->save();
	}

	/**
	 * Extrae datos del request para enviar al archivo
	 * 
	 * @param  Request $reqData
	 * @return array
	 */
	private function _extractData($reqData)
	{
		date_default_timezone_set("America/Buenos_Aires");
		$fecha = date('Y-m-d');

		return [ 'id'                 => (int)$reqData->getParam('id'),
				 'fecha'              => $reqData->getParam('fecha'),
				 'fechaAnulaoElimina' => $reqData->getParam('fechaAnulaoElimina'),
				 'fechaUltimoCambio'  => $fecha,
				 'idTipoComprobante'  => (int)$reqData->getParam('idTipoComprobante'),
				 'idEstado'           => (int)$reqData->getParam('idEstado'),
				 'idSucursal'         => (int)$reqData->getParam('idSucursal'),
				 'nroComprobante'     => (int)$reqData->getParam('nroComprobante'),
				 'id_cliente'         => (int)$reqData->getParam('id_cliente'),
				 'nombre'             => $reqData->getParam('nombre'),
				 'domicilio'          => $reqData->getParam('domicilio'),
				 'localidad'          => $reqData->getParam('localidad'),
				 'codPostal'          => $reqData->getParam('codPostal'),
				 'provincia'          => $reqData->getParam('provincia'),
				 'pais'               => $reqData->getParam('pais'),
				 'cuitdni'            => $reqData->getParam('cuitdni'),
				 'telefono'           => $reqData->getParam('telefono'),
				 'celular'            => $reqData->getParam('celular'),
				 'contacto'           => $reqData->getParam('contacto'),
				 'email'              => $reqData->getParam('email'),
				 'observaciones'      => $reqData->getParam('observaciones'),
				 'importe'            => $this->utils->convStrToFloat( $reqData->getParam('importe') ) ];
	}

	/**
	 * Extrae datos del request para tab registro de visitas
	 * 
	 * @param  Request $req
	 * @return array
	 */
	private function _dataRegVisitas($req)
	{
		return [ 'idComprobante'  => (int)$req->getParam('idComprobante'),
				 'idEmpleado'     => (int)$req->getParam('idEmpleado'),
				 'detalle'        => $req->getParam('detalle'),
				 'fechaTentativa' => $req->getParam('fechaTentativa'),
				 'fechaVisita'    => $req->getParam('fechaVisita') === '' ? null : $req->getParam('fechaVisita') ];
	}

	/**
	 * Extrae datos del request para tab registro de visitas
	 * 
	 * @param  Request $req
	 * @return array
	 */
	private function _dataOrdenTrab($req)
	{
		return [ 'idComprobante'  => (int)$req->getParam('idComprobante'),
				 'idEmpleado'     => (int)$req->getParam('idEmpleado'),
				 'detalle'        => $req->getParam('detalle'),
				 'fechaTentativa' => $req->getParam('fechaTentativa'),
				 'fechaEjecucion' => $req->getParam('fechaEjecucion') === '' ? null : $req->getParam('fechaEjecucion') ];
	}

	/**
	 * Extrae datos del request para extras
	 * 
	 * @param  Request $req
	 * @return array
	 */
	private function _dataExtras($req)
	{
		$extras = $req->getParam('extras');
		$temp = $retorno = [];

		foreach ($extras as $value) {
			$temp['idComprobante'] = $req->getParam('idComprobante');
			$temp['descripcion'] = $value['descripcion'];
			$temp['importe'] = $value['importe'];
			$retorno[] = $temp;
		}

		return $retorno;
	}

}
