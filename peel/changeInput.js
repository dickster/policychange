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
            $this._toggleInputPopup();
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
        $.fn.changeVal = function(value) {
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
                // TODO : refactor the hard coded attribute...should be an option.
                $this._trigger('update', null, [$this.options.change.uid, value]);
            }
            return result;
        }

    },

    // _getChangeValue: function (acceptIcon) {
    //     // assumes that the value is a sibling.
    //     // TODO : maybe i should use a hidden field in conjuction with a user friendly readable span.
    //     // that way i can have any format of data in hidden input.
    //     return $(acceptIcon).siblings('.change-input-value').text();
    // },

    _compareChangeValue : function(current, $value) {
        // need to deal with trim & data conversions later.
        return current == $value.find('.change-input-value').text();
    },

    _initState: function () {
        var $this = this;
        var currentValue = this.element.changeVal();

        // create handy alias for popover content after it's created.
        this.popover = this.icon.data('bs.popover').tip();

        this.popover.addClass('change-input-popover');

        this.popover.find('.change-value').each(function(i, value) {
            // TODO : make a compareChangeValue method. this may get tricky for non-string values (boolean, dates, etc...)
            if ($this._compareChangeValue(currentValue,$(value))) {
                $(this).addClass('accepted');
            }
            else {
                $(this).removeClass('accepted');
            }
        });

        this.popover.find('.next-change').click(function () {
            $this._trigger('next');
        });
        this.popover.find('.prev-change').click(function () {
            $this._trigger('prev');
        });
        this.popover.find('.change-input-accept').click(function () {
            var value = $(this).attr('data-change-value');
            $this.element.changeVal(value);
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
                return template($this.options.change);
            },
            content: function() {
                var template = Handlebars.compile($($this.options.config.inputContent).html());
                return template($this.options.change);
            }
        })

        this.icon.data('bs.popover').tip().addClass('change-input-popover');

        this.icon.popover('show');

        this.icon.on('shown.bs.popover', function() {
            // argh...i can't find a hook that is called on creation after the content is set.
            // show will be called multiple times and we have to guard against that.
            if (!this.popover);
            $this._initState();
        });
    },

    // _setActiveChangeValue : function($action, change, index) {
    //     var value = this.options.change.values[index];
    //     this.element.changeVal(value);
    // },


    accept: function(id, index, value)  {
        var change = this.options.change;
        alert('change ' + id + ' --> ' + value + '['+index+']');
    },

    activate: function() {
       // this._getAllChangeInputs().removeClass('active');
        var $this = this;
        $('html, body').animate({
            scrollTop: $input.offset().top}, 350, function() {
            $this.element.addClass('active');
        });
    },

    activateAndShowPopup: function() {
        this._activate();
        this._toggleInputPopup(this.element);
    },

});
