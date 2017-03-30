var VEHICLE_ID_SELECTOR = "input[name='popupPanel:hiddenId']";
var LAST_SEARCHED_VIN = "input[name='popupPanel:searchPanel:hiddenLastSearchedVIN']";
var PERS_VEH_SYMBOL_CD = "input[name$='persVehSection:persVehSectionContent:vehicleForm:persVehSymbolCd']";
var PERS_VEH_BODYTYPE_CD = "input[name$='persVehSection:persVehSectionContent:vehicleForm:persVehBodyTypeCd']";

var $activeDialog = null;

var onSelect = function(sectionId, selectedRowId) {
};

function closeActiveDialog() {
    if ($activeDialog !== null) {
        $activeDialog.searchDialog("close");
    }
}

// hook into page ready event
$(document).ready(function() {

    initVehicle();

    $.widget("custom.searchDialog", $.ui.dialog, {
        options : {
            resizable : false,
            dialogClass : 'toolbar-dialog',
            modal : true,
            width : 1024
        },
        open : function() {
            $activeDialog = $(this.element[0]);            
            this._super();
        },
        close : function() {
            this._super();
        }
    });
});

$(document).ajaxSend(function(event, xhr, settings) {
    triggerElm = event.target.activeElement;
});

$(document).ajaxComplete(function(event, xhr, settings) {
    if (triggerElm.title == 'Remove item') {
        if ($(triggerElm.parentNode.parentNode).hasClass('persVehSection-easy-section-heading')) {
            initVehicle();
        }
    }
});

function initVehicle(jQuery) {
    $(".easy-toolbar", ".persVehSection-easy-section-heading").each(
        function(i, obj) {
            var $easySection = $(this).closest(".easy-section");
            var sectionId = $easySection.attr('id');
			var type = $("#" + sectionId).find(PERS_VEH_BODYTYPE_CD).val();
			
			if (type != "csio:UT" && type != "csio:TT" && type != "csio:SM" && type != "csio:SS") {
				var $icon = $(this).find('.search-panel-button');
                if($icon.length === 0) {
                    $icon = $('<a class="search-panel-button" onclick="openVehiclePopup(&quot;' + sectionId + '&quot;);"/>');
                    $(this).append($icon);
                }
			}            
        });
}

function openVehiclePopup(sectionId) {
    $(".search-panel h3:contains('Vehicle')").closest('form').searchDialog({
        open : function() {
            onSelect = onVehicleSelect;
            onVehicleSearchOpen(sectionId);
        },
        close : function() {
            onVehicleSearchClose(sectionId);
            callWicketVEHICLE();
        }
    });
}

function onVehicleSearchOpen(sectionId) {
    $(VEHICLE_ID_SELECTOR, $activeDialog).val(sectionId);
    // copy things from the underlying panel to the popup
    var vin = $("#" + sectionId).find(".persVehIdentificationNumber-easy-data-label").text();
    $('.vehIdentificationNumber-easy-text-field-input').val(vin);
    $(LAST_SEARCHED_VIN, $activeDialog).val(vin);

    $(".search-submit", $activeDialog).click(function(){
        var vin = $('.vehIdentificationNumber-easy-text-field-input').val();
        if (vin) {
            $(LAST_SEARCHED_VIN, $activeDialog).val(vin);
        }
    });
}

/**
 * Called before the "onVehicleSelect()" function that finally closes the active dialog.
 *
 * @param sectionId - main form section id
 * @param vehicleId - selected vehicle id
 */
function onSelectVehicle(sectionId, vehicleId) {
    // update the "persVehSymbolCd" hidden field on Vehicle panel
    if (vehicleId) {
        $("#" + sectionId).find(PERS_VEH_SYMBOL_CD).val(vehicleId);
    }
}

function onVehicleSelect(sectionId, rowSelectionId) {
    var $popupPanel = $("h3:contains('Vehicle')").closest('.popup-panel');

    var vin = $(LAST_SEARCHED_VIN, $activeDialog).val();
    if (vin) {
        var $persVehIdentificationNumberLabel = $("#" + sectionId).find(".persVehIdentificationNumber-easy-data-label");
        if ($persVehIdentificationNumberLabel.length) {
            $persVehIdentificationNumberLabel.text(vin);
        }
        else {
            var $persVehIdentificationNumberInput = $("#" + sectionId).find(".persVehIdentificationNumber-easy-text-field-input");
            if ($persVehIdentificationNumberInput.length) {
                $persVehIdentificationNumberInput.val(vin);
            }
        }
    }

    // copy popup selected row values to Vehicle panel
    var tradeName = $("#" + rowSelectionId + " .tradeName div", $activeDialog).text();
    if (tradeName) {
        var $persVehManufacturerLabel = $("#" + sectionId).find(".persVehManufacturer-easy-data-label");
        if ($persVehManufacturerLabel.length) {
            $persVehManufacturerLabel.text(tradeName);
        }
        else {
            var $persVehManufacturerInput = $("#" + sectionId).find(".persVehManufacturer-easy-text-field-input");
            if ($persVehManufacturerInput.length) {
                $persVehManufacturerInput.val(tradeName);
            }
        }
    }
    var modelName = $("#" + rowSelectionId + " .modelName div", $activeDialog).text();
    if (modelName) {
        var $persVehModelLabel = $("#" + sectionId).find(".persVehModel-easy-data-label");
        if ($persVehModelLabel.length) {
            $persVehModelLabel.text(modelName);
        }
        else {
            var $persVehModelInput = $("#" + sectionId).find(".persVehModel-easy-text-field-input");
            if ($persVehModelInput.length) {
                $persVehModelInput.val(modelName);
            }
        }
    }
    var modelYear = $("#" + rowSelectionId + " .modelYear div", $activeDialog).text();
    if (modelYear) {
        var $persVehModelYearLabel = $("#" + sectionId).find(".persVehModelYear-easy-data-label");
        if ($persVehModelYearLabel.length) {
            $persVehModelYearLabel.text(modelYear);
        }
        else {
            var $persVehModelYearInput = $("#" + sectionId).find(".persVehModelYear-easy-text-field-input");
            if ($persVehModelYearInput.length) {
                $persVehModelYearInput.val(modelYear);
            }
        }
    }

    // update the collapsed panel summary
    $("div[class='collapsible easy-section-summary']", $("#" + sectionId)).children('div:first-child').text(modelYear + ' ' + tradeName + ' ' + modelName);

    closeActiveDialog();
}

function onVehicleSearchClose() {
    $('.vehIdentificationNumber-easy-text-field-input').val('');
}

function readOnlyField($inputId ,sectionId){
	$('#'+sectionId).find($inputId).prop("readonly", true);
}

function editableField($inputId, sectionId){
	$('#'+sectionId).find($inputId).prop("readonly", false);
}
