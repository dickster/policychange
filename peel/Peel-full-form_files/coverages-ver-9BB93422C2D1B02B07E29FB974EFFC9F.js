function onCoverageValueChanged(select, coverageCd, riskId) {
var text = select.options[select.selectedIndex].text;
var value = select.value;
var form = $(select).closest('form');
switch (coverageCd) {

 case 'csio:TPBI' :

 $('#' + riskId + '_Limit_csio\\:TPPD_Label', form).text(text);
$('#' + riskId + '_Limit_csio\\:44_Label', form).text(text);
$('#' + riskId + '_Include_csio\\:UA_Label', form).text((text === '') ? exclude : include);

 $('#' + riskId + '_Limit_csio\\:TPPD', form).val(value);
$('#' + riskId + '_Limit_csio\\:44', form).val(value);
$('#' + riskId + '_Include_csio\\:UA', form).val((value === '') ? exclude : include);
break;

 case 'csio:AP' :
if (value !== '') {
$('#' + riskId + '_Deductible_csio\\:COL', form).val(null);
$('#' + riskId + '_Deductible_csio\\:CMP', form).val(null);
$('#' + riskId + '_Deductible_csio\\:SP', form).val(null);
}
break;

 case 'csio:COL' :
if (value !== '') {
$('#' + riskId + '_Deductible_csio\\:AP', form).val(null);
}
break;

 case 'csio:CMP' :
if (value !== '') {
$('#' + riskId + '_Deductible_csio\\:AP', form).val(null);
$('#' + riskId + '_Deductible_csio\\:SP', form).val(null);
}
break;

 case 'csio:SP' :
if (value !== '') {
$('#' + riskId + '_Deductible_csio\\:AP', form).val(null);
$('#' + riskId + '_Deductible_csio\\:CMP', form).val(null);
}
break; 
}
}
function getCoverageTypeListVar(formSelect, returnVarValue) {
var $parent = $(formSelect).closest('.dwell-easy-section');
var v = $('.dwellPackageType', $parent).val();
if (v !== "undefined") {
v = v.replace(':', '_');
}
if (returnVarValue && (typeof window[v] !== "undefined")) {
v = window[v];
}
return v;
}
