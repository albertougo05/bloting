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
use App\Models\Presupuesto;
use App\Models\Ambiente;
use App\Models\ProductoAmbiente;
use App\Models\OrdenTrabajo;
use App\Models\Foto;
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
	 * Devuelva json con datos para tab presupuesto
	 * Name: presupuesto.getpresupuesto/{id}
	 * 
	 * @param  Request $request
	 * @param  Response $response
	 * @param  array $args
	 * @return json
	 */
	public function getPresupuesto($request, $response, $args)
	{
		$id = $args['id'];
		$id = filter_var( $id, FILTER_SANITIZE_NUMBER_INT );
		$registro = Presupuesto::where( 'idComprobante', $id )
								->first();
		if ($registro) {
			$registro = $registro->toArray();
		} else {
			$registro = ['status' => 'No hay registro'];
		}

		return json_encode($registro);
	}

	/**
	 * Devuelva json con datos de ambientes
	 * Name: presupuesto.getambientes/{id}
	 * 
	 * @param  Request $request
	 * @param  Response $response
	 * @param  array $args
	 * @return json
	 */
	public function getAmbientes($request, $response, $args)
	{
		$id = $args['id'];
		$id = filter_var( $id, FILTER_SANITIZE_NUMBER_INT );
		$registros = Ambiente::where( 'idComprobante', $id )
							->get();
		if ($registros) {
			$registros = $registros->toArray();
		} else {
			$registros = ['status' => 'No hay registros'];
		}

		return json_encode($registros);
	}

	/**
	 * Devuelva json con datos productos de ambientes
	 * Name: presupuesto.getproductos/{id}
	 * 
	 * @param  Request $request
	 * @param  Response $response
	 * @param  array $args
	 * @return json
	 */
	public function getProductos($request, $response, $args)
	{
		$id = $args['id'];
		$id = filter_var( $id, FILTER_SANITIZE_NUMBER_INT );
		$registros = ProductoAmbiente::where( 'idComprobante', $id )
									->orderBy('idAmbiente')
									->get()
									->toArray();
		if ($registros == []) {
			$registros = ['status' => 'No hay productos'];
		}

		return json_encode($registros);
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
	 * Devuelve json con nombres de fotos
	 * Name: presupuesto.getfotos/{id}
	 * 
	 * @param  Request $request
	 * @param  Response $response
	 * @param  array $args
	 * @return json
	 */
	public function getFotos($request, $response, $args)
	{
		$id = $args['id'];
		$id = filter_var( $id, FILTER_SANITIZE_NUMBER_INT );
		$registro = Foto::where( 'idComprobante', $id )
						->get();
		if ($registro) {
			$registro = $registro->toArray();
		} else {
			$registro = ['status' => 'No hay fotos'];
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
	 * Guardar foto en disco (POST)
	 * Name: presupuesto.guardarfoto
	 *
	 * Nota:
	 * Las fotos se guardan SIEMPRE. Si no salva el presupuesto la fotos van a quedar en el disco igual.
	 * (En algún momento habrá que hacer un script que verifique las fotos en la BD y las que están en el disco para borrar)
	 * 
	 * @param  Request $request
	 * @param  Response $response
	 * @return json
	 */
	public function guardarFoto($request, $response)
	{
		$result = ['status' => 'error'];
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
	 * Guardar lista de fotos (POST)
	 * Name: presupuesto.guardarlistafotos
	 *
	 * @param  Request $request
	 * @param  Response $response
	 * @return json
	 */
	public function guardarListaFotos($request, $response)
	{
		$result = ['status' => 'error'];
		$data = $this->_dataFotos($request);

		Foto::where('idComprobante', $request->getParam('idComprobante'))->delete();

		foreach ($data as $value) {
			$foto = Foto::create($value);
		}

		if ($foto) {
			$result['status'] = 'ok';
		}

		return json_encode($result);
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
		}
		return json_encode($result);
	}

	/**
	 * Guardar Tab Presupuesto (POST)
	 * Name: presupuesto.guardarpresupuesto
	 *
	 * @param  Request $request
	 * @param  Response $response
	 * @return json
	 */
	public function guardarPresupuesto($request, $response)
	{
		$result = ['status' => 'error'];
		$dataForm = $this->_dataPresup($request);

		$prep = Presupuesto::lockForUpdate()
							->updateOrInsert(['idComprobante' => $request->getParam('idComprobante') ], $dataForm );
		if ($prep) {
			$result['status'] = 'ok';
		}
		return json_encode($result);
	}

	/**
	 * Guardar Ambientes de Tab Presupuesto (POST)
	 * Name: presupuesto.guardarambiente
	 *
	 * @param  Request $request
	 * @param  Response $response
	 * @return json
	 */
	public function guardarAmbiente($request, $response)
	{
		$result = ['status' => 'error'];
		$data = $this->_dataAmbientes($request);

		foreach ($data as $value) {
			$amb = Ambiente::lockForUpdate()
							->updateOrInsert([ 'idComprobante' => $request->getParam('idComprobante'),
											   'idAmbiente' => $value['idAmbiente'] ], 
											   $value );
		}

		if ($amb) {
			$result['status'] = 'ok';
		}

		return json_encode($result);
	}

	/**
	 * Guardar productos de ambientes (POST)
	 * Name: presupuesto.guardarproductos
	 *
	 * @param  Request $request
	 * @param  Response $response
	 * @return json
	 */
	public function guardarProductos($request, $response)
	{
		$result = ['status' => 'error'];
		$data = $this->_dataProductos($request);

		foreach ($data as $value) {
			$prod = ProductoAmbiente::lockForUpdate()
					->updateOrInsert([ 'idComprobante' => $request->getParam('idComprobante'),
									   'idAmbiente' => $value['idAmbiente'],
									   'idProducto' => $value['idProducto'],
									   'idTipoProducto' => $value['idTipoProducto'] ],
									    $value );
		}

		if ($prod) {
			$result['status'] = 'ok';
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
		}

		return json_encode($result);
	}


	/**
	 * Elimina ambiente y sus productos
	 * Name: presupuesto.eliminaambiente
	 * 
	 * @param  Request $request
	 * @param  Response $response
	 * @return json
	 */
	public function eliminaAmbiente($request, $response)
	{
		$result = ['status' => 'error'];

		$cantAmbDel = Ambiente::where('idComprobante', '=', $request->getParam('idComprobante'))
								->where('idAmbiente', '=',  $request->getParam('idAmbiente'))
								->delete();
		$cantProdsDel = ProductoAmbiente::where('idComprobante', '=', $request->getParam('idComprobante')) 
										->where('idAmbiente', '=',  $request->getParam('idAmbiente'))
										->delete();
		if ($cantAmbDel > 0 || $cantProdsDel > 0) {
			$result = ['status' => 'ok'];
		}

		return json_encode($result);
	}


	/**
	 * Borra uno o mas archivos de fotos
	 * Name: presupuesto.borrarfoto (POST)
	 * 
	 * @param  Request $request
	 * @param  Response $response
	 * @return json
	 */
	public function borrarFoto($request, $response)
	{
		$result = ['status' => 'error'];
		$archivos = $request->getParam('files');

		$result['files'] = $archivos[0];

		foreach ($archivos as $value) {
			unlink("./uploads/" . $value);
			$result['status'] = 'success';
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
		return [ 'id'                 => (int)$reqData->getParam('id'),
				 'fecha'              => $reqData->getParam('fecha'),
				 'fechaAnulaoElimina' => $reqData->getParam('fechaAnulaoElimina'),
				 'fechaUltimoCambio'  => $reqData->getParam('fechaUltimoCambio'),
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
	 * Extrae datos del request para tab presupuesto
	 * 
	 * @param  Request $req
	 * @return array
	 */
	private function _dataPresup($req)
	{
		return [ 'idComprobante'       => (int)$req->getParam('idComprobante'),
				 'idEmpleado'          => (int)$req->getParam('idEmpleado'),
				 'fechaPresup'         => $req->getParam('fechaPresup'),
				 'fechaVencimiento'    => $req->getParam('fechaVencimiento') === '' ? null : $req->getParam('fechaVencimiento'),
				 'totalMts2Revest'     => $this->utils->convStrToFloat($req->getParam('totalMts2Revest')),
				 'totalMts2Cielorraso' => $this->utils->convStrToFloat($req->getParam('totalMts2Cielorraso')),
				 'totalMtsMolduras'    => $this->utils->convStrToFloat($req->getParam('totalMtsMolduras')),
				 'formaDePago'         => $req->getParam('formaDePago'),
				 'entrega'             => $this->utils->convStrToFloat($req->getParam('entrega')),
				 'importePresup'       => $this->utils->convStrToFloat($req->getParam('importePresup')) ];
	}

	/**
	 * Extrae datos del request para ambientes
	 * 
	 * @param  Request $req
	 * @return array
	 */
	private function _dataAmbientes($req)
	{
		$datos = $req->getParams();
		$temp = $retorno = [];
		$cont = 1;

		foreach ($datos as $key => $value) {

			switch ($key) {
				case 'idAmb_'.$cont:
					$temp['idAmbiente'] = $value;
					break;
				case 'titulo_'.$cont:
					$temp['titulo'] = $value;
					break;
				case 'concepto_'.$cont:
					$temp['concepto'] = $value;
					break;
				case 'importe_'.$cont:
					$temp['importe'] = $value;
					$temp['idComprobante'] = $req->getParam('idComprobante');
					$cont++;
					$retorno[] = $temp;
					$temp = [];
					break;
			}
		}
		return $retorno;
	}

	/**
	 * Extrae datos del request para productos
	 * 
	 * @param  Request $req
	 * @return array
	 */
	private function _dataProductos($req)
	{
		$prods = $req->getParam('productos');
		$temp = $retorno = [];

		foreach ($prods as $value) {
			$temp['idComprobante']  = $req->getParam('idComprobante');
			$temp['idAmbiente']     = (int)$value['idAmbiente'];
			$temp['idProducto']     = (int)$value['idProducto'];
			$temp['idTipoProducto'] = (int)$value['idTipoProducto'];
			$temp['producto']       = $value['producto'];
			$temp['tipoProducto']   = $value['tipoProducto'];
			$temp['concepTrab']     = $value['concepTrab'];
			$temp['altoTrab']       = $this->utils->convStrToFloat($value['altoTrab']);
			$temp['anchoTrab']      = $this->utils->convStrToFloat($value['anchoTrab']);
			$temp['mts2Trabajo']    = $this->utils->convStrToFloat($value['mts2Trabajo']);
			$temp['altoPlaca']      = $this->utils->convStrToFloat($value['altoPlaca']);
			$temp['anchoPlaca']     = $this->utils->convStrToFloat($value['anchoPlaca']);
			$temp['cantPlacAlto']   = (int)$value['cantPlacAlto'];
			$temp['cantPlacAncho']  = (int)$value['cantPlacAncho'];
			$temp['cantPlacas']     = (int)$value['cantPlacas'];
			$temp['mts2Placas']     = $this->utils->convStrToFloat($value['mts2Placas']);
			$temp['precioXmt2']     = $this->utils->convStrToFloat($value['precioXmt2']);
			$temp['importeTotal']   = $this->utils->convStrToFloat($value['importeTotal']);
			$temp['idEstadoItem']   = $this->utils->convStrToFloat($value['idEstadoItem']);
			//$temp['estadoItem']     = $value['estadoItem'];

			$retorno[] = $temp;
		}

		return $retorno;
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
	 * Extrae datos del request para fotos
	 * 
	 * @param  Request $req
	 * @return array
	 */
	private function _dataFotos($req)
	{
		$fotos = $req->getParam('fotos');
		$temp = $retorno = [];

		foreach ($fotos as $value) {
			$temp['idComprobante'] = $req->getParam('idComprobante');
			$temp['nombreFoto'] = $value;
			$retorno[] = $temp;
		}

		return $retorno;
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
