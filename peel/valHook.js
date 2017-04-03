var wtw = wtw ? wtw : {};

// google jquery valHook to see an example of the pattern.   i am piggybacking on their approach to handling 'val()' method.
wtw.changeInputValHooks = function(element) {

    var _val = function(changeInput, text) {
        var code = changeInput.input.val();
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

    var selectText = function(code) {
        return this.input.find('option[value="'+code+'"]').text();
    };

    var selectVal = function(value) {
        var changeInput = this;
        if(value) {
            changeInput.input.val(value.code);
        }
        else {
            var text = changeInput.input.find('option:selected').text();
            return _val(changeInput,text);
        }
    };

    var easyJsCombo = function(value) {
        var changeInput = this;
        if(value) {
            changeInput.input.val(value.code);
        }
        else {
            var v = this.input.val();
            return {
                value:v,
                index:'?',
                displayValue:v
            }
        }
    };

    var select = {val:selectVal, text:selectText};
    var dflt = {val:defaultVal, text:defaultText};
    var easyJsCombo = {val:defaultVal, text:defaultText};

    if (element.is('select')) {
        return select;
    }
    return dflt;

};