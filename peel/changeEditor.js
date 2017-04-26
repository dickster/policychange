/**
 * this is the controller/mediator of the panel & input widgets.
 *
 * it is responsible for the creation of these widgets and passing of information between the two via events.
 * a changeInput is created IFF there is an <input> element with a "data-change-id" that matches one of the given
 * "changes" given in the options.   if there isn't a matching one, then an event listener is attached that will create a
 * new "change" (and at that time a new changeInput is created).
 *
 * the changePanel is created on the assumption that there is a <div class="change-panel"> element in the DOM.
 *
 * note that this is NOT a juery ui widget but that changeInput & changePanel are.
 * this may lead to confusion & the understanding of the "this" javascript context.
 * google "javascript module pattern" to understand the fundamental concepts going on here.
 *
 * TODO : this should be integrated into a wicket widget.
 */

var wtw = wtw ? wtw : {};
wtw.changeEditor = (function() {

    var options;

    var defaultOptions = {
        // changes:[],  always passed in from server.  we'll only override the config part.
        config: {
            header:'Changes',
            idAttr:'data-change-id',
            refAttr:'data-change-ref',
            inputIcon: '<li class="fa fa-asterisk"></li>',
            open: true,
            expanded:false,
            trigger: 'click',
            changePanelClass:'change-panel',
            changeInputClass:'change-input',
            cssSizes: ['sm','md','lg'],
            valueLabels: [
                'Broker',
                'Carrier'
            ],
        }
    };

    var init = function(opts) {
        var self = this;
        options = $.extend(true,defaultOptions,opts);

      //  var config = options.config;

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
                if (!$(this).is(e.target) &&
                    $(this).has(e.target).length === 0 &&
                    $('.popover,.change-editor').has(e.target).length === 0) {
                        $(this).popover('hide');
                }
            });
        });

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

    function createChangeInput($input, change) {
        change.foo = 'before';
        var x = {config: options.config, change: change};
        x.change.foo = 'in x';
        $input.changeInput(x)
            .on('changeinputupdate', function (e, id, value) {
                $('.change-editor').changePanel('updateChange', change, value);
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
            var change = changes[i];
            changesById[changes[i].id] = change;
        }
        $.each($('[' + options.config.idAttr+']'), function(i,input) {
            // if they are associated with a change, then createChangeInput else bindUnchangedInput.
            var $this= $(this);
            var id = $this.attr(options.config.idAttr);
            if (changesById[id]) {
                createChangeInput($this, changesById[id]);
            }
            else {
                bindUnchangedInput($this, id);
            }
        });
    }

    function resize(resizeType) {
        // does nothing right now but later on you may want to react to these notifications.
        console.log('panel resized ' + resizeType);
    }

    function createChangePanel() {
        $('.change-editor').changePanel(options)
            .on('changepanelselect', function(e,change,showPopup) {
                activate(change,showPopup);
            })
            .on('changepanelresize', function(e,resizeType) {
                resize(resizeType);
            })
            .on('changepanelset', function(e, id, value) {
                changeInput(id,'set',value.index);
            });

        $('.change-editor').changePanel('show');
    }

    function changeInput(id, method, args) {
        var $input = $('[' + options.config.idAttr + '="' + id + '"]');
        if (method) {
            $input.changeInput(method, args);
        }
        return $input;
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
        changeInput(changes[current].id, 'hide');
        // ...calculate next one and show it.
        var to = current + delta;
        if (to>=changes.length) to = 0;
        if (to<0) to = changes.length-1;
        changeInput(changes[to].id,'activateAndShowPopup');
    }

    function activate(change, showPopup) {
        var self = this;

        var oldActive = self.activeChange;
        if (oldActive) {   // de-activate old if any...
            oldActive.changeInput('deactivate');
        }

        // update the new active change input.
        self.activeChange = changeInput(change.id);

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
        // because handlebars templates need boolean, we create these (redundant) properties.
        change.isModify = change.type=='modify';
        change.isDelete = change.type=='delete';
        change.isAdd = change.type=='add';
        $.each(change.values, function(idx,value) {
            value.index = idx;
            value.label = options.config.valueLabels[idx];
            if (!value.text) {
                value.text = value.code;
            }
        });
    }


    return {
        init: init,
    }

})();
