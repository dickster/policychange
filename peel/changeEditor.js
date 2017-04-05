
var wtw = wtw ? wtw : {};
wtw.changeEditor = (function() {

    var defaultOptions = {
        config: {
            inputIcon: '<li class="fa fa-copy"></li>',
            open: true,
            expanded:false,
            trigger: 'click',
            cssSizes: ['sm','md','lg']
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

        // sort these by ascending order in the DOM. if you don't then the navigation will be jerky and won't make sense when you Next/Prev in the panel.
        //  note that the data has no idea where they are on the form so no order can be assumed.
        var $inputs = $('['+config.idAttr+']');
        this.options.changes.sort(function(a,b) {
            var $a = $('['+config.idAttr+'="'+a.id+'"]');
            var $b = $('['+config.idAttr+'="'+b.id+'"]');
            var result = $inputs.index($a) - $inputs.index($b);
            return result;
        });

        // create ALL the possible change inputs (they are lazy. popup won't be created unless they click on it)
        $.each(this.options.changes, function(i,change) {
            change.isModify = function() { return change.type=='modify'; }
            change.isDelete = function() { return change.type=='delete'; }
            change.isAdd = function() { return change.type=='add'; }
            if (change.type=='modify') {
                var $input = $('[' + config.idAttr + '="' + change.id + '"]');
                $input.changeInput({config: config, change: change})
                    .on('changeinputupdate', function (e, id, value) {
                        $('.change-panel').changePanel('updateChange', id, value);
                    })
                    .on('changeinputnext', function (e) {
                        self.go($input, 1);
                    })
                    .on('changeinputprev', function (e) {
                        self.go($input, -1);
                    })

                var initialValues = $input.changeInput('normalizeValues');
                $('.change-panel').changePanel('initInput', change.id, initialValues);
            }
            else if (change.type=='delete') {
                var $container = $('[' + config.idAttr + '="' + change.container + '"]');
                $container.changeDelete({config:config, change:change});
            }
            else if (change.type=='add') {
                var $container = $('[' + config.idAttr + '="' + change.container + '"]');
                $container.changeAdd({config:config, change:change});
            }
        });

        $('.change-panel').changePanel('show');

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

    };

    var formatChanges = function(options) {
        var config = options.config;
        $.each(options.changes, function(i,change) {
            change.summary = config.idLabels[change.id];
            if (!change.summary) {
                change.summary = '[change  '+change.id+']';
                console.log('no label was given for the change "' + JSON.stringify(change) + '"');
            }
            // recall : the deleted (previous) value is the [1]st element.  the current value is the [0]th.
            //  .: delete should use [1] for its display value, add should use [0].
            var sizes = config.cssSizes;
            if (change.type=='delete') {
                change.values[1].size = sizes[Math.min(2, change.values[1].text.length)];
            }
            if (change.type=='add') {
                change.values[0].size = sizes[Math.min(2, change.values[0].text.length)];
            }
            $.each(change.values, function(idx,value) {
                value.index = idx;
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
