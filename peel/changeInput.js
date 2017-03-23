$.widget( "wtw.changeInput", {
    // CHANGE INPUT.


    // this variable for reference only...delete this later!
    sampleOptions: {

        change: {
            type: 'modify',
            uid: 937,
            values: ['apple', 'orange'],
            summary: 'to-be-generated'
        },

        // all view customization data goes here.
        config: {
            rejectIcon: '<i class="fa fa-circle-o"/>',
            acceptIcon: '<i class="fa fa-check-circle"/>',
            inputIcon: '<li class="fa fa-asterisk change-input-icon"></li>',
            onChangeAdded:null,
            uidSelectorTemplate: '[data-change-id="${uid}"]',
            itemChangeRefAttr: 'data-change-ref',
            open: true,
            expanded:false,
            trigger: 'click',
            title:'#title',
            content:'#content',
            header: 'Changes',
            valueLabels: ['Broker', 'Carrier'],
            uidLabels:{840:'Vehicle Manufacturer?',937:'Fruit'},
        },
    },

    // -----------------------------------------

    _create: function() {
        //this.options = $.extend(defaultOptions, this.options);
        var $this = this;

        this.element.on('change.wtw', function(e,uid, value) {
            alert('changed');
            //$this._updateChangeInputState($input);
            // TODO : dispatch event here so change panel can listen to it.
            $this._trigger('wtw:changed');
        });
        this.icon = $(this.options.config.inputIcon);
        this.icon.insertAfter(this.element);

        this.icon.click(function() {
            $this._toggleInputPopup();
        });

        // create a handy alias/shortcut.
        this.change = this.options.change;

        // set val hooks.
        this._setValHooks();
    },

    _valHook : function($elem) {    
        // override if you want to set a specific get/set method for change input values.
        // they will just default to jquery's val().
        // for example, a EasyJSCombo box might require a special method to find an underlying hidden elements value.
    },

    // i should only do this once!
    _setValHooks: function () {
        if ($.fn.changeVal) return;
        var $this = this;
        $.fn.changeVal = function(value) {
            var hook = $this._valHook(this);
            if (!hook) {
                var type = this.prop('tagName').toLowerCase();
                type = (type == 'input' && this.prop('type')) ? this.prop('type') : type;
                // use jquery's val method as the default hook.
                hook = this.val;
            }
            var result = hook.apply(this,arguments);
            if (arguments.length) {
                // TODO : refactor the hard coded attribute...should be an option.
                this.trigger('change.wtw', [
                    this.attr('data-change-id'),
                    value
                ]);
            }
            return result;
        }

    },


    // _activatePrevInput: function ($input) {
    //     var $inputs = this._getAllChangeInputs();
    //     var i = $inputs.index($input);
    //     var $prev = $inputs.eq( (i - 1 + $inputs.length) % $inputs.length );
    //     this.icon.popover('hide');
    //     this._activateInput($prev,true);
    // },
    //
    // _activateNextInput: function () {
    //     // TODO :
    //     var $inputs = this._getAllChangeInputs();
    //     var i = $inputs.index();
    //     var $next = $inputs.eq( (i + 1) % $inputs.length );
    //     this.icon.popover('hide');
    //     this._activateInput($next,true);
    // },

    _getChangeValue: function (acceptIcon) {
        // assumes that the value is a sibling.
        // TODO : maybe i should use a hidden field in conjuction with a user friendly readable span.
        // that way i can have any format of data in hidden input.
        return $(acceptIcon).siblings('.change-input-value').text();
    },

    _update: function () {
        var $this = this;
        var currentValue = this.element.changeVal();
        if (this.popover) return;

        this.popover.find('.change-value').each(function(i, value) {
            // TODO : make a compareChangeValue method. this may get tricky for non-string values (boolean, dates, etc...)
            if (currentValue===$(value).find('.change-input-value').text()) {
                $(this).addClass('accepted');
            }
            else {
                $(this).removeClass('accepted');
            }
        });
    },

    _toggleInputPopup: function () {
        var $this = this;
        // show lazily instantiated popover.
        if (this.icon.data('bs.popover')) {
            this.icon.popover('toggle');
            return;
        }

        // create if doesn't exist.
        this.icon.popover({
            placement: 'bottom',
            trigger: 'manual',
            html : true,
            title: function() {
                var template = Handlebars.compile($($this.options.config.inputTitle).html());
                return template($this.change);
            },
            content: function() {
                var template = Handlebars.compile($($this.options.config.inputContent).html());
                return template($this.change);
            }
        })

        // create handy alias for popover content.
        this.popover = this.icon.data('bs.popover').tip();
        this.popover.addClass('change-input-popover');

        this.icon.popover('show');

        this.icon.on('shown.bs.popover', function() {
            $this._update();
            $this.popover.find('.next-change').click(function() {
                $this._activateNextInput($input);
            });
            $this.popover.find('.prev-change').click(function() {
                $this._activatePrevInput($input);
            });
            $this.popover.find('.change-input-accept').click(function() {
                $input.changeVal($this._getChangeValue(this));
            });
        });
    },

    _getInputChange: function ($input) {
        var uid = this.getInputChangeId($input);
        var changes = this.options.changes;
        for (var i = 0, len = changes.length; i < len; i++) {
            if (changes[i] && changes[i].uid == uid)
                return changes[i];
        }
        throw 'cant find change with id ' + uid;
    },

    _getAllChangeInputs : function(uid) {
        var selector = this.options.config.uidSelectorTemplate.replace('="${uid}"', '');
        if ($(selector).length==0) {
            throw 'can not find any change form inputs "' + selector;
        }
        return $(selector);
    },

    _setActiveChangeValue : function($action, change, index) {
        var value = change.values[index];
        var $input = this._getChangeInput(change.uid);
        $input.changeVal(value);
    },

    _activate: function (showPopup) {
        if ($input.length==0) return;
        this._getAllChangeInputs().removeClass('active');
        $('html, body').animate({
            scrollTop: $input.offset().top}, 350, function() {
            $input.addClass('active');
        });
        if (showPopup) {
            this._toggleInputPopup($input);
        }
    },

});
