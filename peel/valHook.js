var wtw = wtw ? wtw : {};

// google jquery valHook to see an example of the pattern.   i am piggybacking on their approach to handling 'val()' method.
wtw.changeInputValHooks = (function() {

    var init = function (element) {
        return plain;
    };

    var plain = function(value) {
        var changeInput = this;
        if(value) {
            changeInput.input.val(value);
        }
        else {
            var v = this.input.val();
            return {
                index:this.options.change.values.indexOf(v),
                value:v,
                displayValue:v
            }
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