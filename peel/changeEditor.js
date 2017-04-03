
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
            .on('changepanelset', function(e, id, value) {
                getInput(id).changeInput('set',value);
            });

        // create ALL the possible change inputs (they are lazy. popup won't be created unless they click on it)
        $.each(this.options.changes, function(i,change) {
            var $input = $('['+config.idAttr+'="'+change.id+'"]');
            $input.changeInput({config:config, change:change})
                .on('changeinputupdate', function(e, id, value) {
                    $('.change-panel').changePanel('updateChange', id, value);
                })
                .on('changeinputnext',function(e) { self.go($input,1); } )
                .on('changeinputprev',function(e) { self.go($input,-1); } )
            // this will start the ball rolling.  the inputs will get set and trigger an event.
            //  during the event, the displayValue will also be figured out.   (e.g. for select, there is the value attribute
            //  and the actual text displayed for the <option>.   this displayedValue is not passed in the server data
            // so we need to figure it out.

            // TODO : may need to get the value somehow else.  for now assuming it's the 0th element.
            // maybe the options data should have a {defaultIndex:0} property.
            var startingValue = change.values[0];
            $input.changeInput('set', startingValue );
        });

        // if you click somewhere outside of input popup, then hide any visible input popups.
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

        // create lookup so i can find changes by id.
        this.changesById = {};
        for (var i = 0, len = this.options.changes.length; i < len; i++) {
            this.changesById[this.options.changes[i].id] = this.options.changes[i];
        }

    };

    var formatChanges = function(options) {
        var config = options.config;
        $.each(options.changes, function(i,change) {
            change.summary = config.idLabels[change.id];
            if (!change.summary) {
                change.summary = '[change  '+change.id+']';
                console.log('no label was given for the change with id ' + change.id + '  (using id as default label)');
            }

            $.each(change.values, function(idx,value) {
                value.text = 'to be set via onChange listener in changeInput';
                value.index = idx;   // same as above.
                value.label = options.config.valueLabels[idx];
            });

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
