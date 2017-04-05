$.widget( "wtw.changeInput", {
    // CHANGE INPUT.


    // -----------------------------------------
    // i should have default options specific to input here so editor doesn't have to know about them.

    _create: function() {
        //this.options = $.extend(defaultOptions, this.options);
        var self = this;

        var hooks = wtw.changeInputValHooks(this.element);
        this.val = hooks.val;
        this.getTextForCode = hooks.text;

        // the actual visible input element.  (recall, there could be a hidden input that has the actual value but we need reference to the actual
        // element the user interacts with.
        this.input = hooks.input;


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
            var value = self.val();
            self._updateState(value);
            self._trigger('update', null, [self.options.change.id, value]);
        });

        // TODO: fix this so change is triggered after creation (because the listener isn't attached yet so this
        // event will not be handled.
        // the editor could do a $allInputs.triggerInitialBlahBlahBlah().

        // this is crap.  i should do this in parent editor.  i need the timeout because it has to be done after
        // everything is created and all listeners attached.
        // only do this if a popup is attached (ie. it is associated with a change).
        setTimeout(function() {
            // trigger a change that will in effect broadcast the current value to the mediator.
            // ** maybe i should trigger using a custom event like 'initState'?? instead of 'change'
            // to avoid possible side effects?
            self.element.trigger('change');
        },300);

        // add data list if it's a text input.  handy so user can see both options directly in form widget.
        // see #https://www.w3schools.com/tags/tag_datalist.asp
        if (this.input.is('input:text')) {
            var id = 'chg'+this.options.change.id;
            this.input.attr('list',id);
            var $datalist = $('<datalist id="'+id+'"></datalist>');
            $.each(this.options.change.values, function(i,value) {
                $datalist.append($('<option>'+value.text+'</option>').attr('value',value.code));
            });
            $datalist.insertAfter(this.input);
        }
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


        // TODO : do i need this anymore???  delete.  should be handled by normalizing process at startup.
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

    _updateState: function(value) {
        var content = this._getPopoverContent();
        if (!content) {
            return;   // if no popup showing then nothing to do.
        }

        content.find('.change-value').removeClass('accepted');

        if (Number.isInteger(value.index)) {
            content.find('.change-value').eq(value.index).addClass('accepted');
        }
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
                var template = Handlebars.compile($(self.options.config.template.inputTitle).html());
                return template(self.options.change);
            },
            content: function() {
                var template = Handlebars.compile($(self.options.config.template.inputContent).html());
                return template(self.options.change);
            }
        })

        this._getPopoverContent().addClass('change-input-popover');

        this.icon.popover('show');

        this.icon.on('shown.bs.popover', function() {
            self._initState();
        });
    },

    set: function(value)  {
        if (!value.code) {
            throw ' you must pass a full change value object to changeInput:set.   e.g. value : { code:"ON", text:"Ontario"}';
        }
        this.val(value);
        this.element.trigger('change');
    },

    activate: function() {
        // TODO : this doesn't work with easy JS combo.
        $('['+this.options.config.idAttr+']').removeClass('active-change');
        var $input = this.input;

        // NOTE: this currently doesn't take into account hidden elements.
        if (!this._isInViewport($input)) {
            $('html, body').animate({
                    scrollTop: $input.offset().top - 75
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

    // gets the display values and calculates size of text required for styling purposes.
    // e.g. for a select, the value might be "M" but the display value (text) will be "Male".
    normalizeValues : function() {
        var self = this;
        var sizes = this.options.config.cssSizes;
            $.each(this.options.change.values, function(i,value) {
                value.text = self.getTextForCode(value.code);
                value.size = sizes[Math.min(2, value.text.length)];
        });
        return this.options.change.values;
    }

});
