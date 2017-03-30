var easyWicketPreHandlerKeys = new Array();
var easyWicketPreHandlers = new Array();
var easyWicketPostHandlerKeys = new Array();
var easyWicketPostHandlers = new Array();
var easyIsAjaxCall = false;
var easyAjaxIndicatorEnabled = true;
var questions = {};

/**
 * 
 */
jQuery(document).ready(function() {

    // setup pre-handlers that will run before
    // AJAX calls
    preHandler = function() {
        easyIsAjaxCall = true;

        for (idx in easyWicketPreHandlers) {
            easyWicketPreHandlers[idx]();
        }
    };

    Wicket.Event.subscribe('/ajax/call/beforeSend', preHandler);

    createRegions();
    
    // setup post handlers that will run when returning
    // from an AJAX call
    postHandler = function(jqEvent, attributes, jqXHR, errorThrown, textStatus) {
        for (idx in easyWicketPostHandlers) {
            easyWicketPostHandlers[idx]();
        }

        easyIsAjaxCall = false;
    };


    Wicket.Event.subscribe('/ajax/call/complete', postHandler);

    // disable the backspace key
    easyDisableBackspace();
    
    // Keeps track of the last clicked element
    // var lastClickedElement = $.lastClicked;
    $(document).mousedown(function(e) {
        e = e || event;
        $.lastClicked = $(e.target) || $(e.srcElement);
    });
});

function createRegions() {
    $.datepicker.regional['fr-CA'] = {
            controlType: 'select',
            timeFormat: 'hh:mm tt',        
            timeOnlyTitle: '',
            timeText: 'l\'heure',
            hourText: 'heure',
            minuteText: 'minute',
            secondText: 'seconde',
            closeText: 'Fermer',
            prevText: 'Précédent',
            nextText: 'Suivant',
            currentText: 'Aujourd\'hui',
            monthNames: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
                    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'],
            monthNamesShort: ['Janv.', 'Févr.', 'Mars', 'Avril', 'Mai', 'Juin',
                    'Juil.', 'Août', 'Sept.', 'Oct.', 'Nov.', 'Déc.'],
            dayNames: ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'],
            dayNamesShort: ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'],
            dayNamesMin: ['D', 'L', 'M', 'M', 'J', 'V', 'S'],
            weekHeader: 'Sem.',
            dateFormat: 'yy-mm-dd',
            firstDay: 0,
            isRTL: false,
            showMonthAfterYear: false,
            yearSuffix: ''
    };
    $.datepicker.regional[''] = {
            controlType: 'select',
            timeFormat: 'hh:mm tt',        
            dateFormat: 'yy-mm-dd'
    };    
}

/***
 * This is the JavaScript that displays the delete confirmation prompt for EasyListPanel.
 * Since the JQuery call to dialog() is asynchronous, we need to suppress the click the
 * first time around, by returning false, otherwise the item will get deleted before
 * the dialog even shows.  If the user clicks the ok button, we re-trigger the click event.
 * @param {String} linkId The id of the delete link to "re-click" if the user selects "yes" from the dialog prompt.
 * @param {String} extraData The extra data sent to the click event.
 * @param {String} title The confirm dialog title.
 * @param {String} message The message to display to the user on the prompt.
 * @param {String} yesText The text of the yes button on the prompt.
 * @param {String} noText The text of the no button on the prompt.
 * @returns {Boolean} true to proceed with the delete, false not to.
 */
function promptDelete(linkId, extraData, title, message, yesText, noText) {
    var doDelete = jQuery.ui && (extraData === 'OK');
    if (!doDelete) {
        easyHideAjaxIndicator('progress');
        confirmDialog(title, message, yesText, noText, 
            function() {
                $('#' + linkId).trigger('click', 'OK');
            }, 
            function() {}
        );
    }
    return doDelete;
}

/**
 * 
 * @param {type} message
 * @param {type} ok
 * @param {type} cancel
 * @param {type} okCB
 * @param {type} cancelCB
 * @returns {Boolean}
 */
function confirmDialog(title, message, ok, cancel, okCB, cancelCB) {
	var buttonsConfig = [
         {
             text: ok,
             "class": "confirm-button",
             click: function() {
                 cancel = false;
                 $(this).dialog('close');
                 okCB();             
             }
         },
         {
             text: cancel,
             "class": "confirm-button",
             click: function() {
                 cancel = true;
                 $(this).dialog('close');
                 cancelCB();            	 
             }
         }
     ];    
    
    $("<div title='" + title + "'>" + message + '</div>').dialog({
    	autoOpen: true, 
    	resizable: false, 
    	height: 'auto', 
    	modal: true,
    	buttons: buttonsConfig
    });
    
    return cancel;
}

/**
 * 
 * @param {type} context
 * @returns {undefined}
 */
function applyStriping(context) {
    var rows = $('div.row', $(context)).get(), row = null;
    for (var i = 0, length = rows.length; i < length; i++) {
        row = $(rows[i]);
        if (i % 2 === 0) {
            row.addClass('evenRow').removeClass('oddRow');
        }
        else {
            row.addClass('oddRow').removeClass('evenRow');
        }
    }
}

/**
 * 
 * @param {type} key
 * @param {type} handler
 * @returns {undefined}
 */
function easyRegisterPreHandler(key, handler) {
    if ($.inArray(key, easyWicketPreHandlerKeys) === -1) {
        easyWicketPreHandlerKeys.push(key);
        easyWicketPreHandlers.push(handler);
    }
}

/**
 * 
 * @param {type} key
 * @param {type} handler
 * @returns {undefined}
 */
function easyRegisterPostHandler(key, handler) {
    if ($.inArray(key, easyWicketPostHandlerKeys) === -1) {
        easyWicketPostHandlerKeys.push(key);
        easyWicketPostHandlers.push(handler);
    }
}

/**
 * Enable/disable the ajax indicator.
 * @param {type} enable
 * @returns {undefined}
 */
function easyEnableAjaxIndicator(enable) {
    easyAjaxIndicatorEnabled = enable;
}

/**
 * 
 * @param {type} id
 * @returns {undefined}
 */
function easyShowAjaxIndicator(id) {
    if (easyAjaxIndicatorEnabled) {
        var ind = $('#' + id);

        if (ind.length > 0) {
            
            // blockUI prevents the user from interacting with the form during an AJAX call, but sometimes the action the user takes in 
            // order to trigger the AJAX call gets lost as a result of blockUI.  For example, the user changes the Insured First Name field 
            // and then clicks on a radio button.  The click of the radio button triggers the First Name's "onchange" event before it 
            // sets focus to the radio button.  The "onchange" triggers an AJAX call, which triggers this call to blockUI.  But in order 
            // to allow the browser to first focus the radio button, we have to delay that call to blockUI by a few milliseconds,
            // otherwise blockUI will prevent the focus of the radio button.
            setTimeout(
                function() {
                    $.blockUI({
                        message: null,
                        overlayCSS: {
                            opacity: 0.0
                        }
                    });
                }, 150
            );

            $(ind).show();
            $(ind).data('progressIndicator').start();
        }
    }
}

/**
 * 
 * @param {type} id
 * @returns {undefined}
 */
function easyHideAjaxIndicator(id) {
    if (easyAjaxIndicatorEnabled) {
        var ind = $('#' + id);

        if (ind.length > 0) {
            // We delay the call to unblockUI by a few milliseconds to ensure the call will run after the call to blockUI,
            // which has been similarly delayed (see above for full description).
            setTimeout(
                function() {
                    $.unblockUI();
                    $(ind).data('progressIndicator').stop();
                    $(ind).hide();
                }, 150
            );
        }
    }
}

/**
 * 
 * @param {type} id
 * @param {type} value
 * @returns {undefined}
 */
function easyInitializeHTML(id, value) {
    $('#' + id).html(value);
}

/**
 * 
 * @param {type} str
 * @returns {undefined}
 */
function easyFormatString(str) {
    if (typeof str === 'undefined') {
        return "";
    }
    
    return str;
}

/**
 * 
 * @param {type} id
 * @param {type} value
 * @returns {undefined}
 */
function easyInitializeValue(id, value) {
    $('#' + id).val(value);
}

/**
 * 
 * @param {type} selector
 * @returns {undefined}
 */
function easyShow(selector) {
    $(selector).show();
}

/**
 * 
 * @param {type} selector
 * @returns {undefined}
 */
function easyHide(selector) {
    $(selector).hide();
}

/**
 * 
 * @param {type} entry
 * @param {type} cssClass
 * @returns {undefined}
 */
function easyAddClass(entry, cssClass) {
    $(entry).addClass(cssClass);
}

/**
 * 
 * @param {type} entry
 * @param {type} cssClass
 * @returns {undefined}
 */
function easyRemoveClass(entry, cssClass) {
    $(entry).removeClass(cssClass);
}

/**
 * 
 * @param {type} element
 * @param {type} tip
 * @param {type} position
 * @returns {undefined}
 */
function easyShowTooltip(element, tip, position) {
    $('#tooltipText').html(tip);
    var tt = $('#tooltip');
    var offset = new Object();

    if (position.left + $(tt).width() > $(window).width()) {
        offset.left = position.left - $(tt).width();
    }
    else {
        offset.left = position.left + 10;
    }

    $(tt).show();

    $(tt).css({
        height: $("#tooltipText").height()
    });

    offset.top = position.top - $(tt).height() - 10;
    $(tt).offset(offset);
}

/**
 * 
 * @returns {undefined}
 */
function easyHideTooltip() {
    $('#tooltip').hide();
}

/**
 * 
 * @param {type} sectionId
 * @param {type} checkId
 * @returns {undefined}
 */
function easySetSectionIcon(sectionId, checkId) {
    $('#' + checkId).appendTo("#" + sectionId + "_icon");
    $('#' + checkId).show();
}

/**
 * 
 * @returns {undefined}
 */
function easyDisableBackspace() {
    // Trap the Backspace (8) keypress
    // except when we're in text/textareas
    if (typeof window.event !== 'undefined') { // IE
        document.onkeydown = function() { // IE
            var elementType = event.srcElement.type;
            var keyCode = event.keyCode;
            return ((keyCode !== 8)
                    || (elementType === 'text')
                    || (elementType === 'textarea')
                    || (elementType === 'password'));
        };
    }
    else {
        document.onkeypress = function(e) {  // FireFox/Others 
            var elementType = e.target.type;
            var keyCode = e.keyCode;
            return ((keyCode !== 8)
                    || (elementType === 'text')
                    || (elementType === 'textarea')
                    || (elementType === 'password'));
        };
    }
}

/**
 * 
 * @param {type} fieldId
 * @returns {undefined}
 */
function easyHintOnFocus(fieldId) {
    var field = $('#' + fieldId);
    var v = field.val();
    field.css('color', '');

    if (v === field.attr('hint')) {
        field.val('');
    }
}

/**
 * 
 * @param {type} fieldId
 * @returns {undefined}
 */
function easyHintOnBlur(fieldId) {
    var field = $('#' + fieldId);
    var v = field.val();

    if (!field.is(':focus') && (!v || v === field.attr('hint'))) {
        field.css('color', '#aaa');
        field.val(field.attr('hint'));
    }
}

/**
 * 
 * @param {type} formId
 * @returns {undefined}
 */
function easyOnAjaxFormSubmit(formId) {
    // manually call the form submit because the JavaScript onsubmit
    // function is not called when posting with AJAX.
    easyOnFormSubmit(formId);
}

/**
 * 
 * @param {type} formId
 * @returns {undefined}
 */
function easyOnFormSubmit(formId) {
    
    var q = questions ||  {};
    
    if (q.updateJson) {
        q.updateJson();
    }
    
    // prevent hint text from being submitted
    $('#' + formId + ' *[hint]').each(function(i, el) {
        if ($(el).attr('hint') === $(el).val()) {
            $(el).val('');
        }
    });
	return true;
}

/**
 * 
 * @param {type} id
 * @param {type} errorClass
 * @returns {undefined}
 */
function easySectionInitialize(id, errorClass) {
    var section = $('#' + id);
    var errors = $('.easy-input.error, .easy-error-indicator', section);
    $('.easy-section-heading', section).removeClass(errorClass);
    
    if ($(errors).length > 0) {
        $('.easy-section-heading', section).addClass(errorClass);
    }
}

/**
 * 
 * @param {type} ctx
 * @returns {undefined}
 */
function easySectionExpandAll(ctx) {
    $('.easy-section-heading', ctx).addClass('maximized').removeClass('minimized');
    $('.easy-section-minmax', ctx).addClass('maximized').removeClass('minimized');
    $('.easy-section-summary.collapsible', ctx).slideUp('fast');
    $('.easy-section-content.collapsible', ctx).slideDown('fast');
}

/**
 * 
 * @param {type} ctx
 * @returns {undefined}
 */
function easySectionCollapseAll(ctx) {
    $('.easy-section-heading', ctx).addClass('minimized').removeClass('maximized');
    $('.easy-section-minmax', ctx).addClass('minimized').removeClass('maximized');
    $('.easy-section-content.collapsible', ctx).slideUp('fast');
    $('.easy-section-summary.collapsible', ctx).slideDown('fast');
}

/**
 * 
 * @param {type} minMax
 * @returns {undefined}
 */
function easySectionToggleMinMax(minMax) {
    var heading = $(minMax).parents('.easy-section-heading').get(0);
    $(heading).toggleClass('maximized');
    $(heading).toggleClass('minimized');
    $(minMax).toggleClass('maximized');
    $(minMax).toggleClass('minimized');
    $('.easy-section-summary', $(minMax).parents('.easy-section').get(0)).slideToggle('slow');
    $('.easy-section-content', $(minMax).parents('.easy-section').get(0)).slideToggle('slow');
    minMax.setAttribute('title', minMax.getAttribute('title') === minMax.getAttribute('titleexpand') 
                                    ? minMax.getAttribute('titlecollapse') 
                                    : minMax.getAttribute('titleexpand'));    
}

/**
 * 
 * @param {type} id
 * @returns {undefined}
 */
function easySelectInitialize(id) {
    var ctrl = $('#' + id);
    var sel = $(ctrl).find('select');

    // if there is a 'lblClass' then we need may need to turn a single
    // option into a label
    if (typeof ($(sel).attr('lblClass')) !== 'undefined') {
        var ctr = $(ctrl).find("div[name='ctr']");
        var err = $(ctr).find("div[name='err']");
        var lbl = $(ctr).find("span[name='slbl']");

        // reset the control to normal
        $(sel).show();
        $(err).show();
        $(lbl).hide();

        // only proceed if there is a single option
        if (sel.find('option').length <= 1) {
            // create the label to replace the control
            if (typeof (lbl) !== 'undefined') {
                $(ctr).append("<span name='slbl' " + "class='" + $(sel).attr('lblClass') + "'>" + $(sel).find('option').text() + "<span>");
            }
            else {
                $(lbl).show();
            }

            // hide the select
            $(sel).hide();

            // hide the error indicator
            $(err).hide();
        }
    }
}

/**
 * 
 * @param {type} refresh
 * @param {type} textBox
 * @param {type} valueId
 * @param {type} optionsId
 * @param {type} optionsJSVar
 * @param {type} theme
 * @param {type} hasFilter
 * @param {type} showCodes
 * @param {type} prompt
 * @returns {undefined}
 */
function easyComboBoxInitialize(refresh, textBox, valueId, optionsId, optionsJSVar, theme, hasFilter, showCodes, prompt) {
    // Remove any characters invalid in HTML id's.
    optionsId = optionsId.replace(/[^A-Za-z0-9_-]+/g, '') + "-Options";
    var optCtr = $('#' + optionsId);

    // If the DIV hasn't been created yet then create and add it to the document...
    if (optCtr.length === 0) {
        refresh = true;
        var optDivStr = "<div id='" + optionsId
                + "' class='" + theme + "-easy-combo-box-options easy-combo-box-options'>";
        
        if (hasFilter) {
            optDivStr += "<div><input type='text' id='" + optionsId + "-filter' class='" + theme
                + "-easy-combo-box-options-filter easy-combo-box-options-filter' style='display:none'/></div>";
        }
        
        optDivStr += "<div id='" + optionsId + "-list' class='" + theme
                + "-easy-combo-box-options-list easy-combo-box-options-list' style='display:none'/></div>";

        // we need to attach the option div to the closest scrollable parent
        var scrollParent = $(textBox).parents('.easy-scroll-parent');

        if (scrollParent.length > 0) {
            $(scrollParent[0]).append(optDivStr);
        }
        else {
            $('body').append(optDivStr);
        }

        optCtr = $('#' + optionsId);
    }

    // If we just created the DIV or the caller specified we should rebuild the list...
    if (refresh) {
        var innerHTML = "";

        if ((optionsJSVar !== 'undefined') && (optionsJSVar !== null)) {
            // Add each of the options as a sub-DIV to the parent DIV.
            $.each(optionsJSVar, function(i, item) {
                var codeSpan="";

                if (showCodes) {
                    codeSpan = "<span class='easyJSComboCodeCol'>";
                }
        
                // If options is a map then use the key as the val, otherwise use the item itself.
                var val = (typeof i === 'string') ? i : item;
                
                if (typeof item === 'string') {
                    codeSpan += showCodes ? stripNamespace(val) + "</span>" : "";
                    innerHTML += "<div value='" + val + "' class='" + theme
                            + "-easy-combo-box-option easy-combo-box-option'>"
                            + codeSpan + item + "</div>";
                }
                else if (typeof item.text !== 'undefined') {
                    codeSpan += showCodes ? stripNamespace(i) + "</span>" : "";
                    innerHTML += "<div value='" + i + "' class='"
                            + theme
                            + "-easy-combo-box-option easy-combo-box-option'>"
                            + codeSpan + item.text + "</div>";
                }
                else {
                    // If we have an array of arrays, add each item of the sub-array.
                    $.each(item, function(j, subItem) {
                        codeSpan += showCodes ? stripNamespace(val) + "</span>" : "";
                        innerHTML += "<div value='" + val + "' class='" + theme
                                + "-easy-combo-box-option easy-combo-box-option'>"
                                + codeSpan + subItem + "</div>";
                    });
                }
            });
            
            $("#" + optionsId + "-list", optCtr).html(innerHTML);
        }
    }
    
    // comboify the control with the JQuery easy combo plugin
    textBox.selectable = false;
    $(textBox).combo(optCtr, null, '#' + valueId, hasFilter, prompt);    
}

/**
 * 
 * @param {String} id The HTML id of the input component to make a date field.
 * @param {String} dateFormat The pattern to format the input and output date (Ex: YYY-dd-mm).
 * @param {String} timeFormat The pattern to format the input and output time (Ex: hh:mm tt).
 * @param {String} yearRange The range of calendar years to show in the picker.
 * @param {String} locale The locale to show the calendar in (Ex: en-CA).
 * @returns {undefined}
 */
function easyCalendarInit(id, dateFormat, timeFormat, yearRange, locale) {
    var t = $('#' + id);
    
    if ((timeFormat !== null) && (timeFormat !== '')) {
        $(t).datetimepicker({
            controlType: 'select',
            timeFormat: timeFormat,            
            changeMonth: true,
            changeYear: true,
            dateFormat: dateFormat,
            yearRange: yearRange
        });
    
        $(t).datetimepicker( $.datepicker.regional[ locale ] );
    }
    else {
        $(t).datepicker({
            changeMonth: true,
            changeYear: true,
            dateFormat: dateFormat,
            yearRange: yearRange
        });
        
        $(t).datepicker( $.datepicker.regional[ locale ] );
    }
    
}

/**
 * 
 * @param {String} code
 * @returns {undefined}
 */
function stripNamespace(code) {
    code = code.split(':');
    return code.length > 1 ? code[1] : code[0];
}

/**
 * 
 * @param {type} $context
 */
function evaluateJSExpressions($context) {
    $('span.easyJSExpression', $context).each(function(i, el) {
        $(el).text(eval($(el).attr('exp')));
    });
}

/**
 * Event handler for the onClick of the EasyDropDownButton component.
 * @param {type} inputElement The input element of the component.
 * @returns {undefined}
 */
function dropDownButtonClick(inputElement) {
    $('.easy-combo-box-options-list', $(inputElement).parent()).toggle();
}

/**
 * Event handler for the blur method of the EasyDropDownCombo component.
 * @param {type} inputElement The input element of the component.
 * @returns {undefined}
 */
function dropDownButtonOnBlur(inputElement) {
    // If the user just clicked on the button or one of the items, we allow those elements to handle the toggle of the list,
    // otherwise it interferes with the AjaxSubmitButton onSubmit().  If we clicked outside the combo control, we hide the list.
    if (($.lastClicked !== inputElement) && !$.lastClicked.is('.easy-combo-box-option')) {
       //RPB-445 when scrollbar is clicked in IE , the dropdown list closes because blur event is called. This is bug in IE. Delay is added as temporary fix.
	$('.easy-combo-box-options-list', $(inputElement).parent()).delay(10000).fadeOut() ;
    };
}

/**
 * Event handler for the onClick method of them EasyDropDownCombo list items.
 * @param {type} div The div element of the item the user clicked on.
 * @returns {undefined}
 */
function dropDownListItemClick(div) {
    $(div).closest('.easy-combo-box-options-list').hide();
}