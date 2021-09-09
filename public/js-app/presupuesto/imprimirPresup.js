const { jsPDF } = window.jspdf;

// Para boton volver
const btnVolver = document.querySelector('#btnVolver');
btnVolver.addEventListener( "click", () => window.close() );

// Boton Imprimir
const btnImprimir = document.querySelector('#btnImprimir');
btnImprimir.addEventListener( "click", () => window.print() );

// Boton PDF
const btnPdf = document.querySelector('#btnPdf');
btnPdf.addEventListener( "click", convertir_a_pdf );

function convertir_a_pdf() {

	let page = document.getElementById('contenido');

	html2PDF(page, {
		jsPDF: {
		  format: 'a4',
		},
		logging: false,
		imageType: 'image/jpeg',
		output: _nombrePdf //'comprobante.pdf'
	});
}
