var wtw = wtw ? wtw : {};

// google jquery valHook to see an example of the pattern.   i am piggybacking on their approach to handling 'val()' method.
wtw.changeInputValHooks = (function() {

    var init = function (element) {
        if (element.is('select')) {
            return selectVal;
        }
        return defaultVal;
    };

    var _val = function(changeInput,displayValue) {
        var value = changeInput.input.val();
        var index = changeInput.options.change.values.indexOf(value);
        return {
            value:value,
            index:index==-1?null:index,
            displayValue:displayValue ? displayValue : value
        }
    };

    var defaultVal = function(value) {
        var changeInput = this;
        if(value) {
            changeInput.input.val(value);
        }
        else {
            return _val(changeInput);
        }
    };


    var selectVal = function(value) {
        var changeInput = this;
        if(value) {
            changeInput.input.val(value);
        }
        else {
            var displayValue = changeInput.input.find('option:selected').text();
            return _val(changeInput,displayValue);
        }
    };

    var easyJsCombo = function(value) {
        var changeInput = this;
        if(value) {
            changeInput.input.val(value);
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