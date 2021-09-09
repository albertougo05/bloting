<?php 

namespace App\Controllers\Presupuesto;

use App\Models\Foto;


use App\Controllers\Controller;


/**
 * 
 * Clase FotosController
 * 
 */
class FotosController extends Controller
{
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
		if (count($registro) > 0) {
			$registro = $registro->toArray();
		} else {
			$registro = ['status' => 'No hay fotos'];
		}

		return json_encode($registro);
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

		Foto::where('id', $request->getParam('idComprobante'))
			->delete();

		foreach ($data as $value) {
			$foto = Foto::create($value);
		}

		if ($foto) {
			$result['status'] = 'ok';
			$this->PresupuestoController->setFechaUltimoCambioYTipoComp($request->getParam('idComprobante'));
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



}
