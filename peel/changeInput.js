$.widget( "wtw.changeInput", {
    // CHANGE INPUT.


    // this variable for reference only...delete this later!
    sampleOptions: {

        change: {
            type: 'modify',
            uid: 937,
            values: ['apple', 'orange'],
            formattedValues:{label:'', value:'', index:1},
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

        this.icon = $(this.options.config.inputIcon);
        this.icon.insertAfter(this.element);

        this.icon.click(function() {
            $this._toggle();
        });

        // set val hooks.
        // put this at higher level...both widgets depend on this??...hmmm...maybe not.
        this._setValHooks();
    },


    // google jquery valHook to see an example of the pattern.   i am piggybacking on their approach to handling 'val()' method.
    _valHook : function($input) {
        // override if you want to set a specific get/set method for change input values.
        // they will just default to jquery's val().
        // for example, a EasyJSCombo box might require a special method to find an underlying hidden elements value.
    },

    _setValHooks: function () {
        // only do this once!
        if ($.fn.changeVal) return;
        var $this = this;
        $.fn.changeVal = function(value,index) {
            var hook = $this._valHook(this);
            if (!hook) {
                var type = this.prop('tagName').toLowerCase();
                // for inputs, we use the type as the key (e.g. 'text', 'radio' etc...)
                // if not, we just use the tag (textarea, select, etc...)
                type = (type == 'input' && this.prop('type')) ? this.prop('type') : type;
                hook = this.val;   // use jquery's val method as the default hook.
            }
            var result = hook.apply(this,arguments);
            // if a value was passed (i.e. a set, not a get) then trigger updated.
            if (arguments.length) {
                $this._trigger('update', null, [$this.options.change.uid, index, value]);
                $this._updateState(value,index);
            }
            return result;
        }
    },

    _compareChangeValue : function(current, $value) {
        // need to deal with trim & data conversions later.
        return current == $value.find('.change-input-value').text();
    },

    _initState: function () {
        var $this = this;
        var currentValue = this.element.changeVal();

        // create handy alias for popover content after it's created.
        var content = this._getPopoverContent();

        content.addClass('change-input-popover');

        content.find('.change-value').each(function(i, value) {
            // TODO : make a compareChangeValue method. this may get tricky for non-string values (boolean, dates, etc...)
            if ($this._compareChangeValue(currentValue,$(value))) {
                $(this).addClass('accepted');
            }
            else {
                $(this).removeClass('accepted');
            }
            $(value).find('.change-input-accept').click(function () {
                var value = $(this).attr('data-change-value');
                $this.element.changeVal(value,i);
            });
        });

        content.find('.next-change').click(function () {
            $this._trigger('next');
        });
        content.find('.prev-change').click(function () {
            $this._trigger('prev');
        });
    },

    _updateState: function(value,index) {
        var content = this._getPopoverContent();
        if (!content) return;
        this._getPopoverContent().find('.change-value').each(function(i, value) {
            if (i==index) {
                $(this).addClass('accepted');
            }
            else {
                $(this).removeClass('accepted');
            }
        });
    },

    hide: function() {
        if (this.icon.data('bs.popover')) {
            this.icon.popover('hide');
        }
    },

    show: function() {
        if (this.icon.data('bs.popover')) {
            this.icon.popover('show');
        }
        else {
            this._toggle();
        }
    },

    _getPopoverContent: function () {
        var pop = this.icon.data('bs.popover');
        return (pop) ? pop.tip() : null;
    },

    _toggle: function () {
        var $this = this;   // TODO : change $this to self.

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
                return template($this.options.change);
            },
            content: function() {
                var template = Handlebars.compile($($this.options.config.inputContent).html());
                return template($this.options.change);
            }
        })

        this._getPopoverContent().addClass('change-input-popover');

        this.icon.popover('show');

        this.icon.on('shown.bs.popover', function() {
            $this._initState();
        });
    },

    accept: function(id, index, value)  {
        var change = this.options.change;
        this.element.changeVal(value,index);
    },

    activate: function() {
        // TODO : don't hard code attribute.
        $('[data-change-id]').removeClass('active');
        var $input = this.element;
        $('html, body').animate({
            scrollTop: $input.offset().top}, 350, function() {
            $input.addClass('active');
        });
    },

    activateAndShowPopup: function() {
        this.activate();
        this.show();
    },

});
