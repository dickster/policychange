var wtw = wtw ? wtw : {};

// google jquery valHook to see an example of the pattern.   i am piggybacking on their approach to handling 'val()' method.
wtw.changeInputValHooks = (function() {


    var init = function (element) {
        if (element.is('select')) {
            return selectVal;
        }
        return defaultVal;
    };

    var _val = function(changeInput) {
        var value = changeInput.input.val();
        var values = changeInput.options.change.values;
        var index = null;
        for (var i = 0; i<values.length; i++) {
            if (values[i].code == value) {
                values[i].text = value;
                return values[i];
            }
        }
        // otherwise return an object representing "overriden" (i.e. not one of the given, expected change values)
        return {
            value:value,
            index:null,
            text:value
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

    var selectVal = function(value) {
        var changeInput = this;
        if(value) {
            changeInput.input.val(value.code);
        }
        else {
            var displayValue = changeInput.input.find('option:selected').text();
            return _val(changeInput,displayValue);
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

    return {
        init:init
    }

})();