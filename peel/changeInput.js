$.widget( "wtw.changeInput", {
    // CHANGE INPUT.

    // -----------------------------------------

    _create: function() {
        //this.options = $.extend(defaultOptions, this.options);
        var self = this;

        this.icon = $(this.options.config.inputIcon);
        this.icon.insertAfter(this.element);

        this.icon.click(function() {
            self._toggle();
        });

        // set val hooks.
        // put this at higher level...both widgets depend on this??...hmmm...maybe not.
        this._setValHooks();

        this.element.on('change', function(e) {
            var val = $(this).val();  // get the current value in the input  (NOT necessarily one of the values in the change values array).
            var index = self._getValueIndex();  // maybe null if it isn't one of the proposed change values.
            self.onChange(e,index,val);
        });

        // TODO: fix this so change is triggered after creation (because the listener isn't attached yet so this
        // event will not be handled.
        // the editor could do a $allInputs.triggerInitialBlahBlahBlah().

        setTimeout(function() {
            // trigger a change that will in effect broadcast the current value to the mediator.
            // ** maybe i should trigger using a custom event like 'initState'?? to avoid possible side effects?
            self.element.trigger('change');
        },300);


        // add data list if it's a text input.  handy so user can see both options directly in form widget.
        if (this.element.is('input:text')) {
            var id = 'chg'+this.options.change.id;
            this.element.attr('list',id);
            var $datalist = $('<datalist id="'+id+'"></datalist>');
            $.each(this.options.change.values, function(i,value) {
                $datalist.append($('<option>'+value+'</option>'));
            });
            $datalist.insertAfter(this.element);
        }

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
        var self = this;
        $.fn.changeVal = function(value,index) {
            var hook = self._valHook(this);
            self.changeIndex = index;
            console.log('change index = ' + self.changeIndex);
            if (!hook) {
                var type = this.prop('tagName').toLowerCase();
                // for inputs, we use the type as the key (e.g. 'text', 'radio' etc...)
                // if not, we just use the tag (textarea, select, etc...)
                type = (type == 'input' && this.prop('type')) ? this.prop('type') : type;
                hook = this.val;   // use jquery's val method as the default hook.
            }
            var result = hook.apply(this,arguments);
            this.trigger("change");
            return result;
        }
    },

    _getValueIndex: function () {
        var result = null;
        var values = this.options.change.values;
        var value = this.element.val();
        $.each(values, function(i,v) {
            if (value == v) {   // TODO : need a proper comparator..not just equality check.
                result = i;
            }
        });
        return result;  // @Nullable!
    },

    onChange: function (e,index,value) {
        var id = this.options.change.id;
        this._trigger('update', null, [id, index, value]);
        this._updateState(value,index);
    },

    _compareChangeValue : function(current, $value) {
        // need to deal with trim & data conversions later.
        return current == $value.find('.change-input-value').text();
    },

    _initState: function () {
        var self = this;
        var currentValue = this.element.changeVal();

        // create handy alias for popover content after it's created.
        var content = this._getPopoverContent();

        content.addClass('change-input-popover');

        content.find('.change-value').each(function(i, value) {
            // TODO : make a compareChangeValue method. this may get tricky for non-string values (boolean, dates, etc...)
            if (self._compareChangeValue(currentValue,$(value))) {
                $(this).addClass('accepted');
            }
            else {
                $(this).removeClass('accepted');
            }
            $(value).find('.change-input-accept').click(function () {
                var value = self.options.change.values[i];
                self.element.changeVal(value,i);
            });
        });

        content.find('.next-change').click(function () {
            self._trigger('next');
        });
        content.find('.prev-change').click(function () {
            self._trigger('prev');
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
        var self = this;
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
                var template = Handlebars.compile($(self.options.config.inputTitle).html());
                return template(self.options.change);
            },
            content: function() {
                var template = Handlebars.compile($(self.options.config.inputContent).html());
                return template(self.options.change);
            }
        })

        this._getPopoverContent().addClass('change-input-popover');

        this.icon.popover('show');

        this.icon.on('shown.bs.popover', function() {
            self._initState();
        });
    },

    set: function(id, index, value)  {
        this.element.changeVal(value,index);
    },

    activate: function() {
        // TODO : don't hard code attribute.
        $('[data-change-id]').removeClass('active');
        var $input = this.element;

        if (this._isInViewport()) {
            console.log('scrolling viewport');
            $('html, body').animate({
                scrollTop: $input.offset().top}, 350, function() {
                $input.addClass('active');
            });
        }
        else {
            console.log('already in viewport');
            $input.addClass('active');
        }

    },

    _isInViewport : function() {
        var win = $(window);
        var scrollPosition = win.scrollTop();
        var visibleArea = win.scrollTop() + win.height();
        var objEndPos = (this.element.offset().top + win.height());
        return (visibleArea >= objEndPos && scrollPosition <= objEndPos ? true : false);
    },



    activateAndShowPopup: function() {
        this.activate();
        this.show();
    },

});
