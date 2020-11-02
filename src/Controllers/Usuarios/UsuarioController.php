<?php 

namespace App\Controllers\Usuarios;

use App\Models\Usuario;

use App\Controllers\Controller;


/**
 * 
 * Clase UsuariosController
 * 
 */
class UsuarioController extends Controller
{
	/**
	 * GET /usuario
	 * Name: usuario
	 * 
	 * @param  Request  $request
	 * @param  Response $response
	 * @return View - Vista datos usuario
	 */
	public function usuario($request, $response)
	{
		$usuarios = Usuario::where('Estado', 'Activo')->orderBy('Usuario')->get();

		$datos = array(
			'titulo'  => 'Usuarios',
			'usuarios' => $usuarios,
			'accesos' => ['admin' => 'Administrador', 'user1' => 'Usuario 1', 'user2' => 'Usuario 2'],
			'estados' => ['Activo', 'Baja']
	    );

		return $this->view->render($response, 'usuarios/usuario.twig', $datos);
	}

	/**
	 * Guardar datos del usuario
	 * POST /usuario/guardar
	 * Name: usuario.guardar
	 * 
	 * @param  Request  $request
	 * @param  Response $response
	 * @return Redirect View usuario
	 */
	public function guardar($request, $response)
	{
		//var_dump($request->getParams()); die();

		// Verificar contraseña - Si es mas corta (no está cifrada)
		if (strlen($request->getParam('contrasena')) < 59) {
			$newPass = password_hash($req->getParam('contrasena'), PASSWORD_DEFAULT);
		} else {
			$newPass = $request->getParam('contrasena');
		}

		$user_data = ['Usuario'    => $request->getParam('usuario'),
					  'Contrasena' => $newPass,
					  'Nivel'      => $request->getParam('nivel'),
					  'Estado'     => $request->getParam('estado')];

		Usuario::lockForUpdate()
			   ->updateOrInsert([ 'id' => (integer) $request->getParam('iduser') ], $user_data );

		return json_encode(['Status' => 'Ok']);
	}

	/**
	 * Verifica si el nombre de usuario existe en la base de datos
	 * Name: usuario.existe
	 * 
	 * @param $request 
	 * @param $response
	 */
	public function existe($request, $response, $args)
	{
		//var_dump($args['user']);

		# Retorna true si existe 
		return json_encode( [ 'existe' => Usuario::where('Usuario', $args['user'])->count() === 1] );
	}

	/**
	 * Buscar datos del usuario
	 * GET usuario/buscar/{id}
	 * Name: usuario/buscar/{id}
	 * 
	 * @param  Request  $request
	 * @param  Response $response
	 * @param  array    $args
	 * @return json 
	 */
	public function buscar($request, $response, $args)
	{
		$user = Usuario::find( (integer)$args['id']);

		if ($user) {
			$resp =  $user->toArray();
		} else {
			$resp = ['status' => 'Usuario no encontrado'];
		}

		return json_encode( $resp );
	}

}
