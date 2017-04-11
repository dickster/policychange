
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



    function createChange($input, id) {
        var change = {  id: id,
                        type:'modify',
                        new:true,
                        index: null,
                        values:[{code:$input.val(), label:'Overriden Value'}, {code:'', label:'Original Value'}]
                    };
        formatChange(change);
        options.changes.push(change);
        return change;
    }

    function bindUnchangedInput($input, id) {
        // store the current value just in case i need it later.
        $input.data('orig',$input.val());
        $input.on('change.wtw', function(e) {
            $(this).off('.wtw');   // ok, we're done with this event listener.  lets dispose of it.
            var change = createChange($input, id);
            createChangeInput($input, change);
            var v = $input.val();
            $('.change-editor').changePanel('changeAdded', id, change, {code:v, index:null, text:v});
        });
    }

    function createChangeInput($input, change, index) {
        // do these have to be functions for Handlebars? or can i just use a bool property?
        change.isModify = function() { return change.type=='modify'; }
        change.isDelete = function() { return change.type=='delete'; }
        change.isAdd = function() { return change.type=='add'; }

        $input.changeInput({config: options.config, change: change})
            .on('changeinputupdate', function (e, id, value) {
                $('.change-editor').changePanel('updateChange', id, value);
            })
            .on('changeinputnext', function (e,id) {
                advanceInput(id, 1);
            })
            .on('changeinputprev', function (e,id) {
                advanceInput(id, -1);
            })
    }

    function createChangeInputs() {
        // create lookup so i can find changes by id.
        var changesById = {};
        var changes = options.changes;
        for (var i = 0, len = changes.length; i < len; i++) {
            changesById[changes[i].id] = changes[i];
        }
        $.each($('[' + options.config.idAttr+']'), function(i,input) {
            // if they are associated with a change, then createChangeInput else bindUnchangedInput.
            var $this= $(this);
            var id = $this.attr(options.config.idAttr);
            if (changesById[id]) {
                createChangeInput($this, changesById[id] );
            }
            else {
                bindUnchangedInput($this, id);
            }
        });
    }

    function createChangePanel() {
        $('.change-editor').changePanel(options)
            .on('changepanelselect', function(e,change,showPopup) {
                activate(change,showPopup);
            })
            .on('changepanelset', function(e, id, value) {
                getInput(id).changeInput('set',value.index);
            });

        $('.change-editor').changePanel('show');
    }

    var init = function(opts) {
        var self = this;
        options = $.extend(true,{},opts,defaultOptions);
        var config = options.config;

        formatChanges();

        createChangeInputs();

        createChangePanel();

        // this will create a handy string containing all sizes.
        // e.g. ['sm', 'md', 'lg']  -->   "sm md lg"
        options.config.allCssSizes = options.config.cssSizes.join(' ');

        // if you click somewhere outside of input popup, then hide any visible input popups.
        // (you must check to make sure the click didn't happen inside a visible popup - in that case just leave it).
        $('body').on('click', function (e) {
            $('.change-input-icon, .change-add-icon, .change-delete-icon').each(function () {
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

    function advanceInput(id, delta) {
        var changes = options.changes;
        var current = 0;
        for (i = 0; i<changes.length; i++) {
            if (changes[i].id===id) {
                current = i;
                break;
            }
        }
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


    function formatChanges() {
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
    }

})();
