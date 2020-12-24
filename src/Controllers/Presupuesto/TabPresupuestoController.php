<?php 

namespace App\Controllers\Presupuesto;

use App\Models\Presupuesto;
use App\Models\Ambiente;
use App\Models\ProductoAmbiente;

use App\Controllers\Controller;


/**
 * 
 * Clase TabPresupuestoController
 * 
 */
class TabPresupuestoController extends Controller
{
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
			$this->PresupuestoController->setFechaUltimoCambio($request->getParam('idComprobante'));
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

}
