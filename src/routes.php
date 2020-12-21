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
	# Presupuesto / getcomprobante
	$app->get('/getcomprobante/{id}', 'PresupuestoController:getComprobante')->setName('presupuesto.getcomprobante');
	# Presupuesto / imprimir
	$app->get('/imprimir', 'PresupuestoController:imprimir')->setName('presupuesto.imprimir');
	# Presupuesto / guardarfoto
	$app->post('/guardarfoto', 'PresupuestoController:guardarFoto')->setName('presupuesto.guardarfoto');
	# Presupuesto / borrarfoto
	$app->post('/borrarfoto', 'PresupuestoController:borrarFoto')->setName('presupuesto.borrarfoto');
	# Presupuesto / guardarlistafotos
	$app->post('/guardarlistafotos', 'PresupuestoController:guardarListaFotos')->setName('presupuesto.guardarlistafotos');
	# Presupuesto / getfotos
	$app->get('/getfotos/{id}', 'PresupuestoController:getFotos')->setName('presupuesto.getfotos');

	# Presupuesto / guardarregistro
	$app->post('/guardarregistro', 'PresupuestoController:guardarRegistro')->setName('presupuesto.guardarregistro');
	# Presupuesto / getregistro
	$app->get('/getregistro/{id}', 'PresupuestoController:getRegistro')->setName('presupuesto.getregistro');
	# Presupuesto / guardarpresupuesto
	$app->post('/guardarpresupuesto', 'PresupuestoController:guardarPresupuesto')->setName('presupuesto.guardarpresupuesto');
	# Presupuesto / getpresupuesto
	$app->get('/getpresupuesto/{id}', 'PresupuestoController:getPresupuesto')->setName('presupuesto.getpresupuesto');
	# Presupuesto / guardarambiente
	$app->post('/guardarambiente', 'PresupuestoController:guardarAmbiente')->setName('presupuesto.guardarambiente');
	# Presupuesto / getambientes
	$app->get('/getambientes/{id}', 'PresupuestoController:getAmbientes')->setName('presupuesto.getambientes');
	# Presupuesto / eliminaambiente
	$app->get('/eliminaambiente', 'PresupuestoController:eliminaAmbiente')->setName('presupuesto.eliminaambiente');
	# Presupuesto / guardarproductos
	$app->post('/guardarproductos', 'PresupuestoController:guardarProductos')->setName('presupuesto.guardarproductos');
	# Presupuesto / getproductos
	$app->get('/getproductos/{id}', 'PresupuestoController:getProductos')->setName('presupuesto.getproductos');
	# Presupuesto / guardarordentrab
	$app->post('/guardarordentrab', 'PresupuestoController:guardarOrdenTrab')->setName('presupuesto.guardarordentrab');
	# Presupuesto / getordentrabajo
	$app->get('/getordentrabajo/{id}', 'PresupuestoController:getOrdenTrabajo')->setName('presupuesto.getordentrabajo');
	# Presupuesto / guardarextras
	$app->post('/guardarextras', 'PresupuestoController:guardarExtras')->setName('presupuesto.guardarextras');
	# Presupuesto / getextras
	$app->get('/getextras/{id}', 'PresupuestoController:getExtras')->setName('presupuesto.getextras');

})->add(new AuthMiddleware($container));