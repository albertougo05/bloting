//
/** Funcionamiento boton UpScroll  **/
// 
const _botonUp = document.getElementById("scrollUp");

_botonUp.addEventListener("click", function () {
    document.body.scrollTop = 0; // For Safari
    document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
});
// When the user scrolls down 300px from the top of the document, show the button
window.onscroll = function() {
    if (document.body.scrollTop > 280 || document.documentElement.scrollTop > 280) {
        //$('#scrollUp').show();
         _botonUp.style.display = "block";
    } else {
        //$('#scrollUp').hide();
         _botonUp.style.display = "none";
    }    
};
/** end **/


// Map [Enter] key to work like the [Tab] key
// Daniel P. Clark 2014
// https://snipplr.com/view/145654/enter-key-press-behaves-like-a-tab-in-javascript/
// 
// Catch the keydown for the entire document
$(document).keydown(function(e) {
 
  // Set self as the current item in focus
  var self = $(':focus'),
      // Set the form by the current item in focus
      form = self.parents('form:eq(0)'),
      focusable;
 
  // Array of Indexable/Tab-able items
  focusable = form.find('input,a,select,button,textarea,div[contenteditable=true]').filter(':visible');
 
  function enterKey(){
    if (e.which === 13 && !self.is('textarea,div[contenteditable=true]')) { // [Enter] key
 
      // If not a regular hyperlink/button/textarea
      if ($.inArray(self, focusable) && (!self.is('a,button'))){
        // Then prevent the default [Enter] key behaviour from submitting the form
        e.preventDefault();
      } // Otherwise follow the link/button as by design, or put new line in textarea
 
      // Focus on the next item (either previous or next depending on shift)
      focusable.eq(focusable.index(self) + (e.shiftKey ? -1 : 1)).focus();
 
      return false;
    }
  }
  // We need to capture the [Shift] key and check the [Enter] key either way.
  if (e.shiftKey) { enterKey() } else { enterKey() }
});


//
// Funciones Utiles Comunes a todos
// 
var COMMONS = {

  // Devuelve verdadero si el string está vacio
  isEmpty: function(str) {    // Verifica string vacios
    if ( !str ) return true;

    return (str.length === 0 || !str.trim());
  },

  realParseFloat: function (s)
  {
      if (typeof s === 'number') {
        return s;
      }

      if (typeof s == 'undefined' || !s || s.length === 0 || s === "" || !/[^\s]/.test(s) || /^\s*$/.test(s) || s.replace(/\s/g,"") === "")
        return 0;
      //if ( s === '') return 0;

      s = s.replace(/[^\d,.-]/g, ''); // strip everything except numbers, dots, commas and negative sign
      if (navigator.language.substring(0, 2) !== "es" && /^-?(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d+)?$/.test(s)) // if not in German locale and matches #,###.######
      {
          s = s.replace(/,/g, ''); // strip out commas
          return parseFloat(s); // convert to number
      }
      else if (/^-?(?:\d+|\d{1,3}(?:\.\d{3})+)(?:,\d+)?$/.test(s)) // either in German locale or not match #,###.###### and now matches #.###,########
      {
          s = s.replace(/\./g, ''); // strip out dots
          s = s.replace(/,/g, '.'); // replace comma with dot
          return parseFloat(s);
      }
      else // try #,###.###### anyway
      {
          s = s.replace(/,/g, ''); // strip out commas
          return parseFloat(s); // convert to number
      }
  },

  currencyFormat: function (num) {
    return (
        num
          .toFixed(2) // always two decimal digits
          .replace('.', ',') // replace decimal point character with ,
          .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.')
    ) // use . as a separator
  }


};
