
var wtw = wtw ? wtw : {};
wtw.changeEditor = (function() {

    var defaultOptions = {
        config: {
            inputIcon: '<li class="fa fa-exclamation"></li>',
            open: true,
            expanded:false,
            trigger: 'click',
        }
    };


    var init = function(opts) {
        var self = this;
        this.options = $.extend(true,{},opts,defaultOptions);
        var config = this.options.config;

        formatChanges(this.options);

        $('.change-panel').changePanel(this.options)
            .on('changepanelselect', function(e,id) {
                getInput(id).changeInput('activate', id);
            })
            .on('changepanelset', function(e,id,index,value) {
                getInput(id).changeInput('set',id,index,value);
            });

        // create ALL the possible change inputs (they are lazy. popup won't be created unless they click on it)
        $.each(this.options.changes, function(i,change) {
            var $input = $('['+config.idAttr+'="'+change.id+'"]');
            $input.changeInput({config:config, change:change})
                .on('changeinputupdate', function(e, id, changeValue) {
                    $('.change-panel').changePanel('updateChange', id, changeValue);
                })
                .on('changeinputnext',function(e) { self.go($input,1); } )
                .on('changeinputprev',function(e) { self.go($input,-1); } );
        });

        // if you click somewhere outside of input popup, then hide them.
        // (you must check to make sure the click didn't happen inside a visible popup - in that case just leave it).
        $('body').on('click', function (e) {
            $('.change-input-icon').each(function () {
                //the 'is' for buttons that trigger popups
                //the 'has' for icons within a button that triggers a popup
                if (!$(this).is(e.target) && $(this).has(e.target).length === 0 && $('.popover').has(e.target).length === 0) {
                    $(this).popover('hide');
                }
            });
        });
    };

    var formatChanges = function(options) {
        var config = options.config;
        $.each(options.changes, function(i,change) {
            change.summary = config.idLabels[change.id];
            if (!change.summary) {
                change.summary = '[change  '+change.id+']';
                console.log('no label was given for the change with id ' + change.id + '  (using id as default label)');
            }
            var sizes = ['sm','md','lg'];
            change.dflt = {};
            change.dflt.desc = change.values[0];  // TODO : later may need to store a key instead of text!
            change.dflt.size = sizes[Math.trunc(Math.min(change.dflt.desc.length/13,2))];
            change.dflt.label = options.config.valueLabels[0];
            change.dflt.value = '';

            change.previous = {};
            change.previous.label = options.config.valueLabels[1];
            change.previous.desc = change.values[1];
            change.previous.value = change.previous.desc;   // TODO : later may need to store a key instead of text!
            change.previous.size = sizes[Math.trunc(Math.min(change.previous.desc.length/13,2))];
        });
    };

    var getInput = function(id) {
        // TODO : refactor out hard coded attribute.
        return $('[data-change-id="'+id+'"]');
    };

    var go = function($input, delta) {
        var $inputs = $('['+this.options.config.idAttr+']:visible');
        // TODO : i need to check that this is in the change list, not just in the DOM.
        var from  = $inputs.index($input);
        var to = from + delta;
        // TODO :assert from is defined >=0.
        if (to>=$inputs.length) to = 0;
        if (to<0) to = $inputs.length-1;
        $input.changeInput('hide');
        $inputs.eq(to).changeInput('activateAndShowPopup');
    };

    return {
        init: init,
        go:go
        // add other public methods you want to expose here...
    }

})();
