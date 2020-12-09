//
// Funciones de guardar imagenes de fotos
// 

//wrap your emojis in a span with these properties to remove a warning <span role="img" aria-label="star"> ⭐ </span>

var FOTOS = {

	// Fotos de la lista de la BD al contenedor
	fotosAlContenedor: (listado, ismobile) => {
//		let path = './uploads/';

//		if (ismobile) {
//			path = '/bloting/public';		// Para server tridimjm.xyz
//		} else {
//			path = 'http://' + window.location.host;
//		}

// Cagar las fotos que están en el disco. Los nombres vienen de la base de datos (listado)

		listado.forEach( nombreImg => {
			FOTOS.crearDivConFoto(nombreImg, ismobile);
			//console.log('Path img: ' + path + img);
		});
	},

	crearDivConFoto: function (nombreimg, ismobile, image='') {
		let url = '';

		if (image == '') {
			url = './uploads/' + nombreimg;
		} else {
			url = image.src;
		}

	    let div = document.createElement('div'), 	    // Creo elemento div
	    	imagen = document.createElement('img'),	    // Creo elemento imagen
	    	texto = document.createElement('p');

	    imagen.className = "img-fluid";
	    imagen.dataset.nombre = nombreimg;

	    if (ismobile) {
	    	div.className = "row mb-3";
	    	texto.textContent = nombreimg;
	    	div.appendChild(texto);
	    } else {
	    	//imagen.className = "img-thumbnail w-80";
	    	div.className = "col-2 img-fluid";	// thumbnail-image-container
	    }

	    imagen.src = url;
	    div.appendChild(imagen);	    // Agrego img al div
	    // Agrego div al container
	    let fotosContainer = document.getElementById('fotosContainer');
	    fotosContainer.appendChild(div);
	},

	agregaNombreImagenAlInput: () => {
		document.querySelector('.custom-file-input')
			.addEventListener('change', function (e) {
				const fileName = document.getElementById("inputFoto").files[0].name;
				const extension = fileName.substring(fileName.lastIndexOf('.') + 1);
				const extFiles = ['png', 'jpg', 'jpeg'];
				let nextSibling = e.target.nextElementSibling;

				if ( extFiles.includes(extension) ) {		// Si no tiene ext de imagen se rechaza
					nextSibling.innerText = fileName;
					// Habilito boton de subir foto
					document.getElementById("btnAgregarFoto").disabled = false;
				} else {
					toastr.error("Error Tipo de Archivo", "Debe seleccionar una imagen !!");
				}
		});
		return null;
	},

	// Evento click de las imagenes
	eventoClickEnImagen: () => {
		$('img.img-fluid').click(function (e) {
			const urlImg = e.target.src;
			const nombreImg = $(this).attr('data-nombre');

	        $(".tituloModal").text(nombreImg);
        	$("#imgMod").attr("src", urlImg);
        	//$("a#btnBorrar").prop("href", varHref);
		 	$('#verImagen').modal('show');
		});
	},

	agregarFoto: function (ismobile) {
		this.guardarFoto(ismobile);

		if (FileReader) {
			var reader = new FileReader();

			const inputElem = document.getElementById('inputFoto');
			const archivo = inputElem.files[0];
			reader.readAsDataURL(inputElem.files[0]);

			reader.onload = function (e) {
				let image = new Image();
				image.src = e.target.result;

				image.onload = function () {
					FOTOS.agregarFotoADisplay(ismobile, image);
				};
			}
		} else {
		    console.log('Error al cargar la foto !!');
		}
	},

	guardarFoto: function (ismobile) {
		const formElem = document.getElementById("form_foto"); //document.querySelector("form_foto");
		const formData = new FormData(formElem);
		formData.append('idPresup', PRESUP.id_presup);

		const options  = {
			method: 'POST',
			body: formData
		}
		const req = new Request(PRESUP.pathGuardarFoto, options);

		fetch(req)
			.then((response) => {
				if (response.ok) {
					return response.json();
				} else {
					throw  new Error('Error de escritura !!')
				}
			})
			.then( (data) => {
				// Si todo está Ok, data es un json
				console.log('Data foto:', data);
			})
			.catch( (err) => {
				console.log('ERROR: ', err.message);
				toastr.error("Error al guardar foto", "Error al guardar datos !!");
		});
	},

	agregarFotoADisplay: function (ismobile, image) {
		const inputElem = document.getElementById('inputFoto');    // Input de foto
		//const file = inputElem.files[0];	// Create a new URL that references to the file
	    //const url = URL.createObjectURL(file);
	    const nombreImg = this.getNombreImagen(inputElem.value);
	    this.crearDivConFoto(nombreImg, ismobile, image);
	    // Desabilito boton de agregar
	    document.getElementById("btnAgregarFoto").disabled = true; 
	    // Borro nombre de la foto del input
	    let inputFoto = document.querySelector('.custom-file-input');
	    let nextSibling = inputFoto.nextElementSibling;
		nextSibling.innerText = 'Seleccionar Archivo';
		this.eventoClickEnImagen();
		// Nuevas fotos ven en otro array por si no guarda el documento
		PRESUP.nuevasFotos.push(nombreImg);

		return null;
	},

	getNombreImagen: name => {
		const lastBar = name.lastIndexOf('\\');
		const imagen = name.substring(lastBar + 1);

		return imagen;
	},

	borrar: async (fotos, url) => {
		const files = { files: fotos };
		// OJO - Va a faltar el csrf !!
		const options = {
			method: 'POST',
			body: JSON.stringify(files),
			headers: {
				'Content-Type': 'application/json'
			}
		};

		const res = await fetch(url, options);
		const data = await res.json();

console.log('Borrando...');

		return data;
	},

}

export { FOTOS };
