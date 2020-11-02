//
// Funciones de guardar imagenes de fotos
// 

//wrap your emojis in a span with these properties to remove a warning <span role="img" aria-label="star"> ⭐ </span>

var FOTOS = {
	// 
	// Agrega el nombre del archivo de imagen al label
	// 
	fotosAlContenedor: (listado, ismobile) => {
		const path = 'http://' + window.location.host;
		const pathTemp = '/bloting/public';		// Para server tridimjm.xyz

		listado.forEach( img => {
			FOTOS.crearDivConFoto(path + img, ismobile);
			// FOTOS.crearDivConFoto(path + pathTem + img);
			//console.log('Path img: ' + path + img);
		});
	},

	crearDivConFoto: function (url, ismobile) {
	    // Creo elemento div
	    let div = document.createElement('div'); 
	    // Creo elemento imagen
	    let imagen = document.createElement('img');

	    if (ismobile) {
	    	div.className = "col mb-3 thumbnail-image-container img-fluid";
	    	imagen.className = "img-thumbnail w-100";	    	
	    } else {
	    	imagen.className = "img-thumbnail w-80";
	    	div.className = "col-2 thumbnail-image-container img-fluid";  	
	    }

	    imagen.src = url;
	    // Agrego img al div
	    div.appendChild(imagen);
	    // Agrego div al container
	    let fotosContainer = document.getElementById('fotosContainer');
	    fotosContainer.appendChild(div);
	},

	agregaNombreImagenAlInput: () => {
		document.querySelector('.custom-file-input')
			.addEventListener('change',function (e) {
				const fileName = document.getElementById("inputFoto").files[0].name;
				const extension = fileName.substring(fileName.lastIndexOf('.')+1);
				const extFiles = ['png', 'jpg', 'jpeg'];
				let nextSibling = e.target.nextElementSibling;

				if ( extFiles.includes(extension) ) {		// Si no tiene ext de imagen se rechaza
					nextSibling.innerText = fileName;
					// Habilito boton de subir foto
					document.getElementById("btnAgregarFoto").disabled = false;
				} else {
					toastr.error("Error Tipo de Archivo", "Debe subir una imagen !!");
				}
		});
		return null;
	},

	// Evento click de las imagenes
	clickEnImagen: () => {
		$('img.img-thumbnail').click(function (e) {
			const urlImg = e.target.src;
			const nombreImg = FOTOS.getNombreImagen(e.target.src);

			//const varHref = "borrarImg.php?img=" + $(this).next("span").attr("data-nom");

	        $(".tituloModal").text(nombreImg);
        	$("#imgMod").attr("src", urlImg);
        	//$("a#btnBorrar").prop("href", varHref);
		 	$('#verImagen').modal('show');

			//console.log('Imagen: ' + nombreImg);

		});
	},

	guardarFoto: function () {
		const formElem = document.getElementById("form_foto"); //document.querySelector("form_foto");
		const formData = new FormData(formElem);
		const options  = {
			method: 'POST',
			//mode: 'cors',
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
				console.log(data);
				FOTOS.agregarFotoADisplay();
			})
			.catch( (err) => {
				console.log('ERROR: ', err.message);
				toastr.error("Error al guardar foto", "Error al guardar datos !!");
			});
	},

	agregarFotoADisplay: function () {

		const inputElem = document.getElementById('inputFoto');
		// Obtengo nombre del archivo del input
		const file = inputElem.files[0];
	    // Create a new URL that references to the file
	    const url = URL.createObjectURL(file);

	    this.crearDivConFoto(url);
	    // Desabilito boton de agregar
	    document.getElementById("btnAgregarFoto").disabled = true; 
	    // Borro nombre de la foto del input
	    let inputFoto = document.querySelector('.custom-file-input');
	    let nextSibling = inputFoto.nextElementSibling;
		nextSibling.innerText = 'Seleccionar Archivo';
		this.clickEnImagen();

		return null;
	},

	getNombreImagen: name => {
		const lastBar = name.lastIndexOf('/');
		const imagen = name.substring(lastBar + 1);

		return imagen;
	},

};

export { FOTOS };
