<?php 

namespace App\Controllers\Presupuesto;

use App\Models\Presupuesto;
use App\Models\Ambiente;
use App\Models\ProductoAmbiente;
use App\Models\Comprobante;

use App\Controllers\Controller;


/**
 * 
 * Clase TabPresupuestoController
 * 
 */
class TabPresupuestoController extends Controller
{
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
							->where('eliminado', '=', 0)
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
		$registros = ProductoAmbiente::where('idComprobante', $id)
									->where('idEstadoItem', '>', 0)
									->orderBy('idAmbiente')
									->get()
									->toArray();
		if ($registros == []) {
			$registros = ['status' => 'No hay productos'];
		}

		return json_encode($registros);
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
			$this->_setImporteComprobante($request);
			$this->PresupuestoController->setFechaUltimoCambioYTipoComp($request->getParam('idComprobante'), 2);
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
							->updateOrInsert(['id' => $value['id']], 
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
			if ($value['id'] === 0 && $value['idEstadoItem'] === 0) {
				continue;	// No tiene id de registro y ha sido eliminado el ambiente (idEstadoItem == 0)
			}

			$prod = ProductoAmbiente::lockForUpdate()
						->updateOrInsert([ 'id' => $value['id'] ],
									    $value );
		}

		if ($prod) {
			$result['status'] = 'ok';
		}

		return json_encode($result);
	}

	private function _setImporteComprobante($req)
	{
		$comprob = Comprobante::find( (int)$req->getParam('idComprobante') );
		$comprob->importe = $this->utils->convStrToFloat( $req->getParam('importePresup') );
		$comprob->save();
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
		$temp = $retorno = [];
		$ambientes = $req->getParam('ambientes');

		foreach ($ambientes as $value) {
			$temp['id']            = (int) $value['id'];
			$temp['idComprobante'] = (int) $value['idComprobante'];
			$temp['idAmbiente']    = (int) $value['idAmbiente'];
			$temp['titulo']        = $value['titulo'];
			$temp['concepto']      = $value['concepto'];
			$temp['importe']       = $value['importe'];		//$this->utils->convStrToFloat($value['importe']);
			$temp['eliminado']     = $value['eliminado'];

			$retorno[] = $temp;
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
			$temp['id']             = $value['id'];
			$temp['idComprobante']  = $req->getParam('idComprobante');
			$temp['idAmbiente']     = $value['idAmbiente'];
			$temp['idProducto']     = $value['idProducto'];
			$temp['idTipoProducto'] = $value['idTipoProducto'];
			$temp['producto']       = $value['producto'];
			$temp['tipoProducto']   = $value['tipoProducto'];
			$temp['concepTrab']     = $value['concepTrab'];
			$temp['altoTrab']       = $value['altoTrab'];		// $this->utils->convStrToFloat($value['altoTrab']);
			$temp['anchoTrab']      = $value['anchoTrab'];		// $this->utils->convStrToFloat($value['anchoTrab']);
			$temp['mts2Trabajo']    = $value['mts2Trabajo'];	// $this->utils->convStrToFloat($value['mts2Trabajo']);
			$temp['altoPlaca']      = $value['altoPlaca'];		// $this->utils->convStrToFloat($value['altoPlaca']);
			$temp['anchoPlaca']     = $value['anchoPlaca'];		// $this->utils->convStrToFloat($value['anchoPlaca']);
			$temp['cantPlacAlto']   = $value['cantPlacAlto'];
			$temp['cantPlacAncho']  = $value['cantPlacAncho'];
			$temp['cantPlacas']     = $value['cantPlacas'];
			$temp['mts2Placas']     = $value['mts2Placas'];		// $this->utils->convStrToFloat($value['mts2Placas']);
			$temp['precioXmt2']     = $value['precioXmt2'];		// $this->utils->convStrToFloat($value['precioXmt2']);
			$temp['importeTotal']   = $value['importeTotal'];	// $this->utils->convStrToFloat($value['importeTotal']);
			$temp['idEstadoItem']   = $value['idEstadoItem'];	// $this->utils->convStrToFloat($value['idEstadoItem']);

			$retorno[] = $temp;
		}

		return $retorno;
	}

}
