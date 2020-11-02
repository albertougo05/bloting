<?php 

namespace App\Controllers\Clientes;

use App\Models\Cliente;
use App\Models\Provincia;


use App\Controllers\Controller;

/**
 * 
 * Clase ClientesController
 * 
 */
class ClienteController extends Controller
{
	/**
	 * Cliente (inicio)
	 * Name: cliente
	 * 
	 * @param  Request  $request
	 * @param  Response $response
	 * @return View 
	 */
	public function cliente($request, $response)
	{
		$datos = array( 'titulo'     => 'Cliente',
						'condFiscal' => ['Consumidor final', 'Exento', 'Monotributo', 'Responsable Inscripto'],
						'provincias' => Provincia::orderBy('nombre')->get()
		);

		return $this->view->render($response, 'clientes/cliente.twig', $datos);
	}

	/**
	 * Guardar datos de cliente en BD
	 * 
	 * @param  Request $request 
	 * @param  Response $response 
	 * @return json
	 */
	public function clienteGuardar($request, $response)
	{
		$data = $request->getParsedBody();
    	$cliente_data = [];
    	$cliente_id   = filter_var($data['id'], FILTER_SANITIZE_NUMBER_INT);

    	$cliente_data['Nombre']    = filter_var($data['Nombre'], FILTER_SANITIZE_STRING);
    	$cliente_data['Alias']    = filter_var($data['Alias'], FILTER_SANITIZE_STRING);
    	$cliente_data['Direccion'] = filter_var($data['Direccion'], FILTER_SANITIZE_STRING);
    	$cliente_data['Localidad'] = filter_var($data['Localidad'], FILTER_SANITIZE_STRING);
 		$cliente_data['Provincia'] = filter_var($data['Provincia'], FILTER_SANITIZE_STRING);
    	$cliente_data['CodPostal'] = filter_var($data['CodPostal'], FILTER_SANITIZE_STRING);
    	$cliente_data['Telefono']  = filter_var($data['Telefono'], FILTER_SANITIZE_STRING);
    	$cliente_data['Celular']   = filter_var($data['Celular'], FILTER_SANITIZE_STRING);
    	$cliente_data['CUIT']      = filter_var($data['CUIT'], FILTER_SANITIZE_STRING);

    	$email = filter_var($data['Email'], FILTER_VALIDATE_EMAIL);
    	$cliente_data['Email'] = ($email) ? $email : '';     // Valida email. Si es falso va string vacio

    	$cliente_data['CondicionFiscal'] = filter_var($data['CondicionFiscal'], FILTER_SANITIZE_STRING);
    	$cliente_data['Estado']          = filter_var($data['Estado'], FILTER_SANITIZE_STRING);

#echo "<pre>"; print_r($data); echo "<pre><br><br>";
#echo "Valor email: $email - Tipo: ". gettype($email) ."<br><br>";
#echo "<pre>"; print_r($cliente_data); echo "<pre><br>"; die('Ver...');

		$cliente = Cliente::lockForUpdate()
					   ->updateOrInsert([ 'id' => $cliente_id ], $cliente_data );

		return json_encode(['Status' => 'Ok']);
	}

	/**
	 * Popup para buscar cliente
	 * Name: cliente.buscar
	 * 
	 * @param  Request  $request
	 * @param  Response $response
	 * @return View 
	 */
	public function clienteBuscar($request, $response)
	{
		$clientes = Cliente::where('Estado', 'Activo')
							->orderBy('Nombre')
							->get();

		$datos = array( 'titulo'   => 'Buscar Cliente',
						'clientes'  => $clientes,
		);

		return $this->view->render($response, 'clientes/clientebuscar.twig', $datos);
	}

	/**
	 * Devuelva json con datos de un cliente
	 * Name: cliente.getcliente
	 * 
	 * @param  Request $request
	 * @param  Response $response
	 * @param  array $args
	 * @return json
	 */
	public function getCliente($request, $response, $args)
	{
		$id = $request->getParam('id');
		$id = filter_var( $id, FILTER_SANITIZE_NUMBER_INT );
		$cliente = Cliente::find( $id );

		return json_encode($cliente->toArray());
	}

}
