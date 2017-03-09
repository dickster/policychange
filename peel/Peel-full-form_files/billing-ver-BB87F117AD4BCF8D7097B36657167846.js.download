
$( document ).ready(function() {initBilling();});

if (typeof E_LOADED !== 'undefined') {
$(document).on(E_LOADED, initBilling);
}

function initBilling() {
$('.persPolicyBilling-easy-section').each(function() {
var $billCombo = getBillCombo(this);
var $payTextbox = getPaymentAmountTextbox(this);
var $billMethod = $('.persPolicyBillingMethodCd-easy-combo-box-value', this);
updateSummary(this, $billCombo, $payTextbox);
showHideControls(this, $billMethod);
});
}

function onPaymentAmountChanged(textbox) {
var $sectionDiv = $(textbox).closest('.persPolicyBilling-easy-section');
updateSummary($sectionDiv, getBillCombo($sectionDiv), $(textbox));
}

function onBillingMethodChanged($textTextbox, $valueTextbox) {
var $sectionDiv = $valueTextbox.closest('.persPolicyBilling-easy-section');
showHideControls($sectionDiv, $valueTextbox);
updateSummary($sectionDiv, $textTextbox, getPaymentAmountTextbox($sectionDiv)); 
}

function showHideControls($sectionDiv, $valueTextbox) {
var isAgency = ($valueTextbox.val() === 'csio:A');
$('.persPolicyPaymentPlanCd-easy-combo-box', $sectionDiv).toggle(!isAgency);
$('.persPolicyCommercialName-easy-text-field', $sectionDiv).toggle(!isAgency);
$('.persPolicyCurrentTermAmt-easy-text-field', $sectionDiv).toggle(!isAgency);
$('.persPolicyDayMonthDue-easy-text-field', $sectionDiv).toggle(!isAgency);
$('.persPolicyMethodPaymentCd-easy-combo-box', $sectionDiv).toggle(!isAgency);
$('.persPolicyAccountNumberId-easy-text-field', $sectionDiv).toggle(!isAgency);
$('.persPolicyCreditCardExpirationDt-easy-calendar', $sectionDiv).toggle(!isAgency);
$('.persPolicyBankId-easy-text-field', $sectionDiv).toggle(!isAgency);
$('.persPolicyBranchId-easy-text-field', $sectionDiv).toggle(!isAgency);
$('.persPolicyBillingDownPayment-easy-section', $sectionDiv).toggle(!isAgency);
}

function getBillCombo($sectionDiv) {
return $('.persPolicyBillingMethodCd-easy-combo-box-input', $sectionDiv);
}

function getPaymentAmountTextbox($sectionDiv) {
return $('.persPolicyCurrentTermAmt-easy-text-field-input', $sectionDiv);
}

function updateSummary($billSection, $billCombo, $amountTextbox) {
var billMethod = (($billCombo !== null) && (typeof $billCombo.val() !== 'undefined')) ? $billCombo.val() : "";
var amount = (($amountTextbox !== null) && (typeof $amountTextbox.val() !== 'undefined')) ? $amountTextbox.val() : "";
var sep = (((billMethod.length > 0) && (amount.length > 0)) ? " : " : "");
var summary = billMethod + sep + ((amount.length > 0) ? amount : "");
$('.easy-section-summary', $billSection).html(summary); 
}