// widget associated with form input that has changed.
//
//  triggers 'next', 'update', 'prev' events.
// has the concept of being "active" (which is not the same as the state of the popup being shown).
// this widget controls the showing of input popups but the parent changeEditor is responsible for closing them
//   when user clicks outside popup.
// note that what/how the widget appears depends on the type of change (add/modify/delete)

(function($) {

    // jquery ui widget wide "class variable". only changeInput widget uses this.
    var templateCache = {};

    $.widget( "wtw.changeInput", {

        defaultOptions : {
            config:{
                template: {
                    inputTitle: "#changeInputTitle",
                    inputContent: "#changeInputContent",
                    add: "#changeAdd",
                    delete: "#changeDelete"
                }
            }
        },

        _create: function() {
            var self = this;

            this.options = $.extend(true, this.options, this.defaultOptions);

            var change = this.options.change;
            var config = this.options.config;

            switch (change.type) {
                case 'modify':
                    this._createModify();
                    break;
                case 'add':
                case 'delete':
                    this._createAddOrDelete();
                    break;
                default:
                    throw 'unknown change type ' + change.type;
            }
        },

        getTemplate: function (type) {
            if (!templateCache[type]) {
                var $el = $(this.options.config.template[type]);
                var template = ($el.length==0) ?
                    '<span>cant find template in DOM :' + this.options.config.template[type] +'</span>' :
                    $el.html();
                templateCache[type]= Handlebars.compile(template);
            }
            return templateCache[type];
        },

        _createAddOrDelete : function() {
            var self = this;
            var type = this.options.change.type;
            var template = this.getTemplate(type);
            var $content = $(template(this.options.change));
            $content.insertBefore(this.element);
            this.input = $content;
            this.icon = $(this.options.config.inputIcon).addClass('change-'+type+'-icon');
            this.icon.insertAfter($content.children().first());
            this.icon.click(function() {
                self._toggle();
            });
            // recall : the deleted (previous) value is the [1]st element.  the current value is the [0]th.
            //  .: delete should use [1] for its display value, add should use [0].
            var text = '';
            if (this.options.change.type=='delete') {
                text = this.options.change.values[1].text;
            }
            else if (this.options.change.type=='add') {
                text = this.options.change.values[0].text;
            }
            this.getTextForCode = function(code) { return text; };
        },

        _createModify : function() {
            var self = this;
            var hooks = wtw.changeInputValHooks(this.element);
            this.val = hooks.val;
            this.getTextForCode = hooks.text;

            // the actual visible input element.  (recall, there could be a hidden input that has the actual value but we need reference to the actual
            // element the user interacts with.
            this.input = hooks.input;

            this.icon = $(this.options.config.inputIcon)
                .attr('data-change-ref',this.options.change.id).insertAfter(this.input);

            this.icon.addClass('change-input-icon')

            this.icon.click(function() {
                self._toggle();
            });

            this.element.on('change', function(e) {
                var value = self.val();
                self._updateState(value);
                self._trigger('update', null, [self.options.change.id, value]);
            });

            this._normalizeValues();

            // add data list if it's a text input.  handy so user can see both options directly in form widget.
            // see #https://www.w3schools.com/tags/tag_datalist.asp

            if (this.input.is('input:text') && !this.options.change.new) {
                var id = 'chg'+this.options.change.id;
                this.input.attr('list',id);
                var $datalist = $('<datalist id="'+id+'"></datalist>');
                $.each(this.options.change.values, function(i,value) {
                    $datalist.append($('<option>'+value.text+'</option>').attr('value',value.code));
                });
                $datalist.insertBefore(this.input);
            }
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
            if (this.icon && this.icon.data('bs.popover')) {
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
                    var template = self.getTemplate('inputTitle');
                    return template(self.options.change);
                },
                content: function() {
                    var template = self.getTemplate('inputContent');
                    return template(self.options.change);
                }
            })

            this._getPopoverContent().addClass('change-'+self.options.change.type);

            this.icon.popover('show');

            this.icon.on('shown.bs.popover', function() {
                var $content = self._getPopoverContent();
                // these only apply to "modify" changes.
                if (self.options.change.type=='modify') {
                    $content.find('.change-value').each(function (i, value) {
                        $(value).click(function () {
                            self.set(i);
                        });
                    });
                    self._updateState(self.val());
                }

                $content.find('.next-change').click(function () {
                    self._trigger('next',null, [self.options.change.id]);
                });
                $content.find('.prev-change').click(function () {
                    self._trigger('prev',null, [self.options.change.id]);
                });

            });
        },

        set: function(index)  {
            this.val(this.options.change.values[index]);
            this.element.trigger('change');
        },

        deactivate: function() {
            this.activate(false);
            this.hide();
        },

        activateAndShowPopup: function() {
            this.activate();
            this.show();
        },

        activate: function(on) {
            var $input = this.input;
            if (arguments.length==0 || on) {
                if (!Utils.isInViewport($input)) {
                    $('html, body').animate({ scrollTop: $input.offset().top - 75}, 350, function () {
                        $input.addClass('active-change');
                    });
                }
                else {
                    $input.addClass('active-change');
                }
            }
            else {
                $input.removeClass('active-change');
            }
        },


        // gets the display values and calculates size of text required for styling purposes.
        // e.g. for a select, the value might be "M" but the display value (text) will be "Male".
        _normalizeValues : function() {
            // this only applies to modify changes.  add & deletes have nothing to normalize!
            var self = this;
            var sizes = this.options.config.cssSizes;
                $.each(this.options.change.values, function(i,value) {
                    value.text = self.getTextForCode(value.code);
                    value.size = sizes[parseInt(Math.min(2, value.text.length/15))];
            });
            return this.options.change.values;
        }

    });

})(jQuery);
