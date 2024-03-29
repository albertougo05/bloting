<?php

use Slim\Http\Request;
use Slim\Http\Response;
use App\Middleware\AuthMiddleware;

## RUTAS INICIO

	# Index -  Inicio
	$app->get('/', 'HomeController:index')->setName('index');
	# Login - Ingreso datos del usuario
	$app->get('/login', 'HomeController:login')->setName('login');
	# Post Login para validar ingreso
	$app->post('/postlogin', 'HomeController:postLogin')->setName('postlogin');
	# Home. Pagina con menus y usuario
	$app->get('/home', 'HomeController:home')->setName('home');


##
##  OTRAS RUTAS
##  


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
	# Presupuesto / imprimir
	$app->get('/imprimir', 'PresupuestoController:imprimir')->setName('presupuesto.imprimir');

	# Presupuesto / guardarfoto
	$app->post('/guardarfoto', 'FotosController:guardarFoto')->setName('presupuesto.guardarfoto');
	# Presupuesto / borrarfoto
	$app->post('/borrarfoto', 'FotosController:borrarFoto')->setName('presupuesto.borrarfoto');
	# Presupuesto / guardarlistafotos
	$app->post('/guardarlistafotos', 'FotosController:guardarListaFotos')->setName('presupuesto.guardarlistafotos');
	# Presupuesto / getfotos
	$app->get('/getfotos/{id}', 'FotosController:getFotos')->setName('presupuesto.getfotos');

	# Presupuesto / guardarregistro
	$app->post('/guardarregistro', 'PresupuestoController:guardarRegistro')->setName('presupuesto.guardarregistro');

	# Presupuesto / guardarpresupuesto
	$app->post('/guardarpresupuesto', 'TabPresupuestoController:guardarPresupuesto')->setName('presupuesto.guardarpresupuesto');
	# Presupuesto / guardarambiente
	$app->post('/guardarambiente', 'TabPresupuestoController:guardarAmbiente')->setName('presupuesto.guardarambiente');
	# Presupuesto / getambientes
	$app->get('/getambientes/{id}', 'TabPresupuestoController:getAmbientes')->setName('presupuesto.getambientes');
	# Presupuesto / eliminaambiente
	$app->get('/eliminaambiente', 'TabPresupuestoController:eliminaAmbiente')->setName('presupuesto.eliminaambiente');
	# Presupuesto / guardarproductos
	$app->post('/guardarproductos', 'TabPresupuestoController:guardarProductos')->setName('presupuesto.guardarproductos');
	# Presupuesto / getproductos
	$app->get('/getproductos/{id}', 'TabPresupuestoController:getProductos')->setName('presupuesto.getproductos');

	# Presupuesto / guardarordentrab
	$app->post('/guardarordentrab', 'PresupuestoController:guardarOrdenTrab')->setName('presupuesto.guardarordentrab');

	# Presupuesto / guardarextras
	$app->post('/guardarextras', 'PresupuestoController:guardarExtras')->setName('presupuesto.guardarextras');
	# Presupuesto / getextras
	$app->get('/getextras/{id}', 'PresupuestoController:getExtras')->setName('presupuesto.getextras');

	# Presupuesto / getidcomprobante
	$app->get('/getidcomprobante/{id}', 'PresupuestoController:getIdComprobante')->setName('presupuesto.getidcomprobante');

})->add(new AuthMiddleware($container));