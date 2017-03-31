$.widget( "wtw.changeInput", {
    // CHANGE INPUT.

    // pass an object/map that has a function factory to return method --> element ? {displayValue&value}


    // -----------------------------------------
    // i should have default options specific to input here so editor doesn't have to know about them.

    _create: function() {
        //this.options = $.extend(defaultOptions, this.options);
        var self = this;

        this.val = wtw.changeInputValHooks.init(this.element);

        this.input = this.getInput(this.element);
        this.icon = $(this.options.config.inputIcon)
            .attr('data-change-ref',this.options.change.id).insertAfter(this.input);

        this.icon.addClass('change-input-icon');

        //blargh : this is a dangerous hack.  if i can't be sure that the parent of this icon is relative, then i'll never be able
        // to style its position.  i'm going to have to do an "absolute/top:0/right:0" kinda thing to maybe get it to work
        // which means i need to have a relative parent to attach to.
        // maybe i should make this an option for each change....forceParentRelative?
        // or i could just hijack the .css and fix it there but i might not have access.
        this.icon.parent().css('position','relative');
        // end of hack.

        this.icon.click(function() {
            self._toggle();
        });

        this.element.on('change', function(e) {
            var $this = $(this);
            var val = self.val().value;
            // do i really need index??? take this out. let change panel deal with it as needed.
            var index = self._getValueIndex();  // index may be null if it isn't one of the proposed change values.
            var displayValue = val;        //getDisplayValue($(this));
            self.onChange(e,index,val,displayValue);
        });

        // TODO: fix this so change is triggered after creation (because the listener isn't attached yet so this
        // event will not be handled.
        // the editor could do a $allInputs.triggerInitialBlahBlahBlah().

        // only do this if a popup is attached (ie. it is associated with a change).
        setTimeout(function() {
            // trigger a change that will in effect broadcast the current value to the mediator.
            // ** maybe i should trigger using a custom event like 'initState'?? to avoid possible side effects?
            self.element.trigger('change');
        },300);

        // add data list if it's a text input.  handy so user can see both options directly in form widget.
        if (this.input.is('input:text')) {
            var id = 'chg'+this.options.change.id;
            this.input.attr('list',id);
            var $datalist = $('<datalist id="'+id+'"></datalist>');
            $.each(this.options.change.values, function(i,value) {
                $datalist.append($('<option>'+value+'</option>'));
            });
            $datalist.insertAfter(this.input);
        }
    },

    getInput: function (element) {
        if (element.is('.easy-combo-box-value')) {
            return element.siblings('.easy-combo-box-input');
        }
        // TODO : add logic for complex widgets...i.e. jsComboBox will look for adjacent, non hidden input.
        return element;
    },

    // in order to deal with hidden fields, each input will have a controller (which may be itself).
    // scrolling, setting, getting is done using this controller input.
    // onChange listener added to this.element. (not controller - it will indirectly set the value of this.element)
    // icon is next to controller

    // controller.changeVal() returns change:{id, index/*nullable*/, value, displayValue }
    // controller = { $visibleInput (may be self) }
    // need to add latent inputs (no popups, but change listener) to all <input>'s with data-change-id.
    // .: need to refactor method that gets all inputs.  it must filter out ones that aren't associated with
    // a options.change value.

    _getValueIndex: function () {
        var result = null;
        var values = this.options.change.values;
        var value = this.val().value;
        $.each(values, function(i,v) {
            if (value == v) {   // TODO : need a proper comparator..not just equality check.
                result = i;
            }
        });
        return result;  // @Nullable!
    },

    onChange: function (e,index,value,displayValue) {
        var id = this.options.change.id;
        // TODO : just send entire change object in event.
        // change "{id:'', values:[a,b], type:'modify', displayValues:{a:'apple',b:'orange'}]
        // this._trigger('update', null, [change, value, displayValue, index]
        this._trigger('update', null, [id, index, value, displayValue]);
        this._updateState(value,index);
    },

    _compareChangeValue : function(current, $value) {
        // need to deal with trim & data conversions later.
        return current == $value.find('.change-input-value').text();
    },

    _initState: function () {
        var self = this;
        var currentValue = this.val().value;

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
                self.val(value);
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
        this.val(value);
        // this.input.val(value,index);
        this.input.trigger('change');
    },

    activate: function() {
        $('['+this.options.config.idAttr+']').removeClass('active-change');
        var $input = this.input;

        // NOTE: this currently doesn't take into account hidden elements.
        if (!this._isInViewport($input)) {
            $('html, body').animate({
                    scrollTop: $input.offset().top
                },
                350,
                function() {
                    $input.addClass('active-change');
                });
        }
        else {
            $input.addClass('active-change');
        }
    },

    // TODO : move this to utility object.
    _isInViewport : function($el) {
        var win = $(window);
        var viewTop = win.scrollTop();
        var viewBottom = viewTop + win.height();
        var top = $el.offset().top;
        var bottom = top + $el.height();
        return (viewTop<=top && viewBottom >= bottom);
    },

    activateAndShowPopup: function() {
        this.activate();
        this.show();
    },

});
