var wtw = wtw ? wtw : {};

// google jquery valHook to see an example of the pattern.   i am piggybacking on their approach to handling 'val()' method.
wtw.changeInputValHooks = function(element) {

    var _val = function(changeInput) {
        var code = changeInput.element.val();
        var values = changeInput.options.change.values;
        for (var i = 0; i<values.length; i++) {
            if (values[i].code == code) {
                return values[i];
            }
        }
        // otherwise return an object representing "overriden" (i.e. not one of the given, expected change values)
        return {
            code:code,
            index:null,
            size:changeInput.options.config.cssSizes[Math.min(2, code.length)],
            text:changeInput.getTextForCode(code)
        }
    };

    var defaultVal = function(value) {
        var changeInput = this;
        if(value) {
            changeInput.input.val(value.code);
        }
        else {
            return _val(changeInput);
        }
    };

    var defaultText = function(code) {
        return code;
    };

    // TODO : doesn't work when "Choose One" is displayed in select.
    var selectText = function(code) {
        return this.input.find('option[value="'+code+'"]').text();
    };

    var selectVal = function(value) {
        var changeInput = this;
        if(value) {
            changeInput.input.val(value.code);
        }
        else {
            return _val(changeInput);
        }
    };

    // blargh: leaky abstractions here...i have to take care of setting the display value and the underlying code.
    var easyJsComboVal = function(value) {
        var changeInput = this;
        if(value) {
            changeInput.element.val(value.code);  // the HIDDEN input
            changeInput.input.val(value.text);    // the text box
        }
        else {
            var v = this.element.val();
            return _val(changeInput);
        }
    };

    var easyJsComboText = function(code) {
        // ok...here's the hoops to get at the value for the combo box.  this code is VERY brittle...any changes to html, javascript or wicket could easily crush all the assumptions
        //   and surely lead to world destruction or worse.
        // 1: remove the suffix -easy-combo-box-value from the HIDDEN input's class. that gives you some prefix.
        // 2: append -Options-list to above result
        // 3: look for that element with this ID   var list = $('#.<prefix>-Options-list')
        // 4: find the child element (DIV) with the matching value attribute.      e.g.   <div value='M' class='easy-combo-box-option'>Male</div>
        // bob's your uncle.
        var ez = '-easy-combo-box-value';
        var classes = $(this.element).attr('class').split(/\s+/);
        var result = code;
        $.each(classes, function(i, cls) {
            if (cls.endsWith('-easy-combo-box-value')) {
                var $list = $('#'+cls.replace(ez,'-Options-list'));
                result = $list.find('div[value="'+code+'"]').text();
                return false;
            }
        });
        return result;
    };

    // return the hooks for the input.

    // as new component types arise
    if (element.is('select')) {
        return {val:selectVal, text:selectText, input:element};
    }
    if (element.is('.easy-combo-box-value')) {
        return {val:easyJsComboVal, text:easyJsComboText, input:element.siblings('.easy-combo-box-input')};
    }
    if (element.is('input')) {
        return {val: defaultVal, text: defaultText, input: element};
    }
    throw 'unsupported val() method for component type ' + element.prop('tagName');


};