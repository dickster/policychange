
$( document ).ready(function() {initAUTOCoverages();});

if (typeof E_LOADED !== 'undefined') {
$(document).on(E_LOADED, initAUTOCoverages);
}
function initAUTOCoverages() {

 
 
 $('div.coverage-row div.coverage-col-limit select[name$="_Deductible_csio:SP"]').each(
function() {
this.onchange();
}
);
$('div.coverage-row div.coverage-col-limit select[name$="_Deductible_csio:AP"]').each(
function() {
this.onchange();
}
);
}