
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

    function createChange($input) {
        var id = $input.attr(options.config.idAttr);
        var change = {id: id, type:'modify', values:[{code:$input.val()}, {code:''}]};
        // TODO : maybe put something in summary about this being an override.
        formatChange(change);
        change.isNew = true;   // any changes that are created after initial server data is sent will be flagged as such.
        change.values[0].label = 'Overridden Value';// make these a configurable string;
        change.values[1].label = 'Incoming Value';
        change.index = null;
        options.changes.push(change);
        return change;
    }

    function bindUnchangedInput($input) {
        // will this technique work for tricky components like easyJSCombo.
        var id = 100;
        $input.data('orig',$input.val());
        $input.on('change.wtw', function(e) {
            $(this).off('.wtw');   // ok, we're done with this event listener.  lets dispose of it.
            var change = createChange($input);
           createChangeInput($(this), change);
           var v = $input.val();
           var value = {code:v, index:null, text:v};
            $('.change-editor').changePanel('changeAdded', id, change, value);
        });
    }

    function createChangeInput($input, change) {
        // do these have to be functions for Handlebars? or can i just use a bool property?
        change.isModify = function() { return change.type=='modify'; }
        change.isDelete = function() { return change.type=='delete'; }
        change.isAdd = function() { return change.type=='add'; }

        $input.changeInput({config: options.config, change: change})
            .on('changeinputupdate', function (e, id, value) {
                $('.change-editor').changePanel('updateChange', id, value);
            })
            .on('changeinputnext', function (e) {
                advanceInput(i, 1);
            })
            .on('changeinputprev', function (e) {
                advanceInput(i, -1);
            })
    }

    var init = function(opts) {
        var self = this;
        options = $.extend(true,{},opts,defaultOptions);
        var config = options.config;

        formatChanges(options);

        bindUnchangedInput($('[data-change-id="100"]'));

        $.each(options.changes, function(i,change) {
            var $input = $('[' + config.idAttr + '="' + change.id + '"]');
            createChangeInput($input, change);
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
