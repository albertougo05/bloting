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
use App\Models\Presupuesto;
use App\Models\Extra;
use App\Models\Ambiente;
use App\Models\ProductoAmbiente;

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
		// Si es llamado (GET) con idComp (viene de ventana Buscar), 
		// va a cargar los datos del Comprobante con id == idComp
		if ($request->getParam('idComp')) {

			$data = $this->_dataDelComprobante( $request->getParam('idComp') );
			$nroComprobante = $data['comprobante']['nroComprobante'];
			$id_registro = $data['comprobante']['id'];

		} else {

			$nroComprobante = Comprobante::where('idSucursal', 1)->max('id') + 1;
			$id_registro = 0;
		}

		$condFiscal = array( 'Consumidor final', 'Monotributo', 'Responsable Inscripto', 'Exento');
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

		$datos = array( 'titulo'        => 'Presupuesto',
						'condFiscal'    => $condFiscal,
						'clientes'      => $clientes,
						'fecha'         => $fechas['hoy'],
						'id_registro'   => $id_registro,		// 'id_presup'    => $id_presup,
						'sucursales'    => $sucursales,
						'tiposCompr'    => $tiposCompr,
						'estadosCompr'  => $estadosCom,
						'empleados'     => $empleados,
						'tiposprod'     => $tiposProductos,
						'productos'     => $productos,
						'estadosItem'   => $estadosItem,
						'provincias'    => $provincias,
						'isMobile'      => $esMobile,
						'nroComprobante'=> $nroComprobante,
						'data'          => $data
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
			
			if ( $request->getParam('id') == 0 ) {
				// Para sacar el último registro insertado (porque el id es 0)
				$comprob = Comprobante::latest()->first();
				$id = $comprob->id;
			} else {
				// Si el parametro id es distinto de 0 (cero)
				$id = $request->getParam('id');
			}
			$resp = [ 'status' => 'ok', 
					  'id' => $id ];
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
		$sql = "SELECT com.id, com.fecha, com.nombre, com.domicilio, com.localidad, ";
		$sql = $sql . "com.idSucursal, suc.localidad AS sucursal ";
		$sql = $sql . "FROM blo_Comprobantes AS com ";
		$sql = $sql . "LEFT JOIN blo_Sucursales AS suc ON com.idSucursal = suc.id ";
		$sql = $sql . "ORDER BY com.fecha DESC";

		$comprobante = $this->pdo->pdoQuery($sql);

		$datos = array( 'titulo'       => 'Buscar Presupuesto',
						'presupuestos' => $comprobante,
		);

		return $this->view->render($response, 'presupuesto/presup_buscar.twig', $datos);
	}

	/**
	 * Devuelva json con id disponible de comprobante de la sucursal
	 * Name: presupuesto.getidcomprobante (GET)
	 * 
	 * @param  Request $request
	 * @param  Response $response
	 * @param  array $args
	 * @return json
	 */
	public function getIdComprobante($request, $response, $args)
	{
		$idComp = Comprobante::where('idSucursal', $args['id'])->max('nroComprobante') + 1;

		return json_encode(['id' => $idComp]);
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
		$titulo = "Imprime ";

		switch ($request->getParam('tab')) {
			case 'registro':
				$titulo = $titulo . "Registro Visita";
				break;
			case 'presupuesto':
				$titulo = $titulo . "Presupuesto";
				break;
			case 'orden':
				$titulo = $titulo . "Orden Trabajo";
				break;
		}

		$dataTab = $this->_dataTabDelComprob( $request->getParam('id'), 
											  $request->getParam('tab') );
		$datos = [ 'titulo'       => $titulo,
				   'presupuesto'  => $presup,
				   'tabSelec'     => $request->getParam('tab'),
				   'dataTab'      => $dataTab ];

		return $this->view->render($response, 'presupuesto/imprimir/imprime_presup.twig', $datos);
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
			$this->setFechaUltimoCambioYTipoComp($request->getParam('idComprobante'), 1);
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
			$this->setFechaUltimoCambioYTipoComp($request->getParam('idComprobante'), 3);
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
			$this->setFechaUltimoCambioYTipoComp($request->getParam('idComprobante'));
		}

		return json_encode($result);
	}

	/**
	 * Actualiza fecha en cada modificación del comprobante
	 * 
	 * @param integer $id [Id de comprobante]
	 * @param integer $idTipoComp [Cambia el tipo de comprob si es mayor al actual]
	 */
	public function setFechaUltimoCambioYTipoComp($id, $idTipoComp = 0)
	{
		$comprob = Comprobante::find($id);
		date_default_timezone_set("America/Buenos_Aires");
		$comprob->fechaUltimoCambio = date('Y-m-d');

		if ($comprob->idTipoComprobante < $idTipoComp) {
			$comprob->idTipoComprobante = $idTipoComp;
		}

		$comprob->save();
	}

	/**
	 * Datos solo del tab del comprobante
	 * 
	 * @param  [int] $idComp [id del comprobante]
	 * @return [array] $data [array con array de datos de cada tab]
	 */
	private function _dataTabDelComprob($idComp, $tab)
	{
		$data = [];

		switch ( $tab ) {
			case 'registro':
				$sql = $this->_sqlTabRegistro($idComp);
				break;

			case 'presupuesto':
				$sql = $this->_sqlTabPresup($idComp);
				$data['ambientes'] = $this->_datosAmbientes($idComp);
				$data['productos'] = $this->_datosProductos($idComp);
				break;

			case 'orden':
				$sql = $this->_sqlTabOrden($idComp);
				break;
		}

/*echo "<pre>";
print_r($data['productos']);
echo "</pre><br>";
die('Ver...');*/

/*		$datosExtras = Extra::where( 'idComprobante', $idComp )
							->get();
		$data['extras'] = $datosExtras;*/

		$datos = $this->pdo->pdoQuery($sql);

		$data[$tab] = $datos[0];

		return $data;
	}

	private function _sqlTabRegistro($idComp)
	{
		$sql = "SELECT reg.idEmpleado, emp.apellidoNombre, reg.detalle, ";
		$sql = $sql . "reg.fechaTentativa, reg.fechaVisita, reg.queSolicita, ";
		$sql = $sql . "reg.comoContacto, reg.comoConocio, reg.conoceSistema, ";
		$sql = $sql . "reg.comoNosComunic, reg.queUrgencia FROM blo_RegistroVisitas AS reg ";
		$sql = $sql . "LEFT JOIN blo_Empleados AS emp ON reg.idEmpleado = emp.id ";
		$sql = $sql . "WHERE reg.idComprobante = $idComp";

		return $sql;
	}

	private function _sqlTabPresup($idComp)
	{
		$sql = "SELECT pre.idEmpleado, emp.apellidoNombre, pre.fechaPresup, ";
		$sql = $sql . "pre.fechaVencimiento, pre.totalMts2Revest, pre.totalMts2Cielorraso, ";
		$sql = $sql . "pre.totalMtsMolduras, pre.formaDePago, pre.entrega, pre.importePresup ";
		$sql = $sql . "FROM blo_Presupuestos AS pre ";
		$sql = $sql . "LEFT JOIN blo_Empleados AS emp ON pre.idEmpleado = emp.id ";
		$sql = $sql . "WHERE pre.idComprobante = $idComp";

		return $sql;
	}

	private function _sqlTabOrden($idComp)
	{
		$sql = "SELECT ord.idEmpleado, emp.apellidoNombre, ord.detalle, ";
		$sql = $sql . "ord.fechaTentativa, ord.fechaEjecucion ";
		$sql = $sql . "FROM blo_OrdenesDeTrabajo AS ord ";
		$sql = $sql . "LEFT JOIN blo_Empleados AS emp ON ord.idEmpleado = emp.id ";
		$sql = $sql . "WHERE ord.idComprobante = $idComp";

		return $sql;
	}

	private function _datosAmbientes($idComp)
	{
		$registros = Ambiente::where( 'idComprobante', $idComp )
							->where('eliminado', '=', 0)
							->get();
		if ($registros) {
			$registros = $registros->toArray();
		} else {
			$registros = [];
		}

		return $registros;
	}

	private function _datosProductos($idComp)
	{
		$productos = ProductoAmbiente::leftJoin('blo_EstadosItem', 'idEstadoItem', '=', 'blo_EstadosItem.id')
									->select('blo_ProductosAmbiente.*', 'blo_EstadosItem.descripcion')
									->where('idComprobante', $idComp)
									->where('idEstadoItem', '>', 0)
									->orderBy('idAmbiente')
									->get()
									->toArray();
		return $productos;
	}

	/**
	 * Datos del comprobante y de los tabs.
	 * 
	 * @param  [int] $idComp [id del comprobante]
	 * @return [array] $data [array con array de datos de cada tab]
	 */
	private function _dataDelComprobante($idComp)
	{
		$data = [];
		$comprob = Comprobante::find($idComp)->toArray();

		$registro = RegistroVisita::where( 'idComprobante', $idComp )
									->first();
		if ($registro) {
			$registro = $registro->toArray();
		} else {
			$registro = [];
		}

		$presupuesto = Presupuesto::where( 'idComprobante', $idComp )
								->first();
		if ($presupuesto) {
			$presupuesto = $presupuesto->toArray();
		} else {
			$presupuesto = [];
		}

		$orden = OrdenTrabajo::where( 'idComprobante', $idComp )
							->first();
		if ($orden) {
			$orden = $orden->toArray();
		} else {
			$orden = [];
		}

		$data['comprobante'] = $comprob;
		$data['registro'] = $registro;
		$data['presupuesto'] = $presupuesto;
		$data['orden'] = $orden;

		return $data;
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
				 'fechaAnulaoElimina' => $reqData->getParam('fechaAnulaoElimina') === '' ? null : $req->getParam('fechaAnulaoElimina'),
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
				 'condicionFiscal'    => $reqData->getParam('condicionFiscal'),
				 'telefono'           => $reqData->getParam('telefono'),
				 'celular'            => $reqData->getParam('celular'),
				 'contacto'           => $reqData->getParam('contacto'),
				 'email'              => $reqData->getParam('email'),
				 'observaciones'      => $reqData->getParam('observaciones'),
				 'importe'            => $this->utils->convStrToFloat( $reqData->getParam('importe')) ];
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
				 'fechaVisita'    => $req->getParam('fechaVisita') === '' ? null : $req->getParam('fechaVisita'),
				 'queSolicita'    => $req->getParam('queSolicita') === '' ? null : $req->getParam('queSolicita'),
				 'comoContacto'   => $req->getParam('comoContacto') === '' ? null : $req->getParam('comoContacto'),
				 'comoConocio'    => $req->getParam('comoConocio') === '' ? null : $req->getParam('comoConocio'),
				 'conoceSistema'  => $req->getParam('conoceSistema') === '' ? null : $req->getParam('conoceSistema'),
				 'comoNosComunic' => $req->getParam('comoNosComunic') === '' ? null : $req->getParam('comoNosComunic'),
				 'queUrgencia'    => $req->getParam('queUrgencia') === '' ? null : $req->getParam('queUrgencia')
				];
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
