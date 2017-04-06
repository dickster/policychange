
var wtw = wtw ? wtw : {};
wtw.changeEditor = (function() {

    var options;

    var defaultOptions = {
        config: {
            inputIcon: '<li class="fa fa-copy"></li>',
            open: true,
            expanded:false,
            trigger: 'click',
            changePanelClass:'change-panel',
            changeInputClass:'change-input',
            cssSizes: ['sm','md','lg']
        }
    };




    // look for all elements with [data-change-id] and then see if they are in the current changes list.
    //  if not, and they are input/select/textarea add a change listener?  onChange = {
    //  change = {id, values:[{before},{after}]
    //  }
    // how to refresh the changePanel popup?   refresh/destroy?  direct HTML manipulation? blargh....

    var init = function(opts) {
        var self = this;
        options = $.extend(true,{},opts,defaultOptions);
        var config = options.config;

        formatChanges(options);

        // sort these by ascending order in the DOM. if you don't then the navigation will be jerky and won't make sense when you Next/Prev in the panel.
        //  note that the data has no idea where they are on the form so no order can be assumed.
        var $inputs = $('['+config.idAttr+']');
        options.changes.sort(function(a,b) {
            var $a = $('['+config.idAttr+'="'+a.id+'"]');
            var $b = $('['+config.idAttr+'="'+b.id+'"]');
            var result = $inputs.index($a) - $inputs.index($b);
            return result;
        });

        $.each(options.changes, function(i,change) {

            change.isModify = function() { return change.type=='modify'; }
            change.isDelete = function() { return change.type=='delete'; }
            change.isAdd = function() { return change.type=='add'; }

            var $input = $('[' + config.idAttr + '="' + change.id + '"]');

            $input.changeInput({config: config, change: change})
                .on('changeinputupdate', function (e, id, value) {
                    $('.change-editor').changePanel('updateChange', id, value);
                })
                .on('changeinputnext', function (e) {
                    advanceInput(i, 1);
                })
                .on('changeinputprev', function (e) {
                    advanceInput(i, -1);
                })
        });

        $('.change-editor').changePanel(options)
            .on('changepanelselect', function(e,change,showPopup) {
                activate(change,showPopup);
            })
            .on('changepanelset', function(e, id, value) {
                getInput(id).changeInput('set',value.index);
            });

        $('.change-editor').changePanel('show');

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

    function getInput(id) {
        return $('[' + options.config.idAttr + '="' + id + '"]');
    }

    function advanceInput(current, delta) {
        var changes = options.changes;
        // hide current popup...
        getInput(changes[current].id).changeInput('hide');
        // ...calculate next one and show it.
        var to = current + delta;
        if (to>=changes.length) to = 0;
        if (to<0) to = changes.length-1;
        getInput(changes[to].id).changeInput('activateAndShowPopup');
    }

    function activate(change, showPopup) {
        var self = this;

        var oldActive = self.activeChange;
        if (oldActive) {   // de-activate old if any...
            oldActive.changeInput('deactivate');
        }

        // update the new active change input.
        self.activeChange = getInput(change.id);
        // ...and activate it.
        if (showPopup) {
            self.activeChange.changeInput('activateAndShowPopup');
        }
        else {
            self.activeChange.changeInput('activate');
        }
    }


    function formatChanges(options) {
        $.each(options.changes, function(i,change) {
            formatChange(change);
        });
    }

    function formatChange(change) {
        var config = options.config;
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
    }


    return {
        init: init,
        // add other public methods you want to expose here...
    }

})();
