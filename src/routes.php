<?php

use Slim\Http\Request;
use Slim\Http\Response;
use App\Middleware\AuthMiddleware;

// RUTAS INICIO

	# Index -  Inicio
	$app->get('/', 'HomeController:index')->setName('index');
	# Login - Ingreso datos del usuario
	$app->get('/login', 'HomeController:login')->setName('login');
	# Post Login para validar ingreso
	$app->post('/postlogin', 'HomeController:postLogin')->setName('postlogin');
	# Home. Pagina con menus y usuario
	$app->get('/home', 'HomeController:home')->setName('home');

//
//  OTRAS RUTAS
//  


# CLIENTES
$app->group('/cliente', function () use ($app, $container) {

	# Cliente
	$app->get('', 'ClienteController:cliente')->setName('cliente');
	# Cliente / Guardar (POST)
	$app->post('/guardar', 'ClienteController:clienteGuardar')->setName('cliente.guardar');
	# Cliente / Buscar
	$app->get('/buscar', 'ClienteController:clienteBuscar')->setName('cliente.buscar');
	# Cliente / GetCliente
	$app->get('/getfirma', 'ClienteController:getCliente')->setName('cliente.getcliente');


})->add(new AuthMiddleware($container));

# USUARIOS
$app->group('/usuario', function () use ($app, $container) {

	# Usuario
	$app->get('', 'UsuarioController:usuario')->setName('usuario');
	# Usuario / Guardar (POST)
	$app->post('/guardar', 'UsuarioController:guardar')->setName('usuario.guardar');
	# Usuario / Existe
	$app->get('/existe/{user}', 'UsuarioController:existe')->setName('usuario.existe');
	# Usuario / buscar
	$app->get('/buscar/{id}', 'UsuarioController:buscar')->setName('usuario.buscar');


})->add(new AuthMiddleware($container));

# PRESUPUESTO
$app->group('/presupuesto', function () use ($app, $container) {

	# Presupuesto
	$app->get('', 'PresupuestoController:presupuesto')->setName('presupuesto');
	# Presupuesto / Guardar (POST)
	$app->post('/guardar', 'PresupuestoController:guardar')->setName('presupuesto.guardar');
	# Presupuesto / buscar
	$app->get('/buscar', 'PresupuestoController:buscar')->setName('presupuesto.buscar');
	# Presupuesto / Existe
	$app->get('/getpresup', 'PresupuestoController:getpresup')->setName('presupuesto.getpresup');
	# Presupuesto / imprimir
	$app->get('/imprimir', 'PresupuestoController:imprimir')->setName('presupuesto.imprimir');
	# Presupuesto / guardarfoto
	$app->post('/guardarfoto', 'PresupuestoController:guardarFoto')->setName('presupuesto.guardarfoto');

})->add(new AuthMiddleware($container));