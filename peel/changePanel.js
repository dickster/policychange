(function($) {

    // variable scoped to changePanel widgets only.   think of it as a java class' private static var.
    var templateCache = {};

    $.widget( "wtw.changePanel", {

        _create: function() {
            var self = this;
            var config = this.options.config;

            this.element.addClass('change-editor');

            this.sortChanges();

            // create lookup so i can find changes by id.
            this.changesById = {};
            var changes = this.options.changes;
            for (var i = 0, len = changes.length; i < len; i++) {
                this.changesById[changes[i].id] = changes[i];
            }

            this.buildPanel();
        },

        buildPanel: function () {
            var config = this.options.config;
            // TODO : make this html snippet/css class a configurable option.
            var $panel = $('<div class="change-panel panel panel-default"/>');

            var template = this.getTemplate('changePanelTitle');
            $panel.append($(template(this.options)));

            template = this.getTemplate('changePanelContent');
            var $content = $('<div/>')
                .addClass(config.template.changeContainerClass)  // TODO : do i really need this now that it's not in a popover?
                .addClass('change-items');
            $.each(this.options.changes, function(i,change) {
                var $change = $(template(change));
                $change.attr(config.refAttr,change.id);
                $content.append($change);
            });
            $panel.append($content);
            this.element.empty().append($panel);
        },

        getTemplate: function (type) {
            var selector = this.options.config.template[type];
            if (!templateCache[type]) {
                templateCache[type]= Handlebars.compile($(selector).html());
            }
            return templateCache[type];
        },

        _activateChangeValue: function ($changeItem, change, index) {
            // remove all other (if any) active items, and highlight this one.
            // TODO : chain these two lines together after debugging...
            $changeItem.find('.change-value').removeClass('active');
            $changeItem.find('.change-value').eq(index).addClass('active');
        },

        _activate : function($changeItem, showPopup) {
            // highlight the proper row....
            $changeItem.siblings().removeClass('active');
            $changeItem.addClass('active');
            Utils.ensureVisible($changeItem);
            // ...then notify the world that we want to focus on this change. parent mediator will dispatch as needed.
            var changeId = $changeItem.attr(this.options.config.refAttr);
            this._trigger('select', null, [this.changesById[changeId], showPopup]);
        },

        _addListeners : function() {
            var self = this;
            var $changePanel = this.element;

            $changePanel.on('click', '.change-item', function(e) {
                // if you click on the 'summary' element then open up associated change input popup.
                var showPopup = $(e.target).is('.summary');
                self._activate($(this).closest('.change-item'), showPopup);
            });
            // assumes there are two toggle buttons that "on" means use first value = value[0]
            $changePanel.on('click', '.fa-toggle-off', function(e) {
                self._set($(this), 0);
            });
            $changePanel.on('click', '.fa-toggle-on', function(e) {
                self._set($(this), 1);
            });
            $changePanel.on('click', '.next-change', function() {
                self._advance(1);
            });
            $changePanel.on('click', '.prev-change', function() {
                self._advance(-1);
            });
            $changePanel.on('click', '.maximize', function() {
                self._resize(true);
            });
            $changePanel.on('click', '.minimize', function() {
                self._resize(false);
            });
        },

        _resize : function(mode) {
            var self = this;
            if (mode) {
                self.element.addClass('maximized');
            } else {
                self.element.removeClass('maximized');
            }
            self._trigger('resize', null, [mode?'maximized':'minimized']);
        },

        _set : function($toggle,index) {
            var $item = $toggle.parents('.change-item');
            var id = $item.attr(this.options.config.refAttr);
            var change = this.changesById[id];
            this._trigger('set', null, [id, change.values[index]]);
            this.updateChange(change, change.values[index]);
        },

        _advance: function (delta) {
            var $content = this._getPanelContent();
            var $items = $content.find('.change-item');
            var $active = $content.find('.change-item.active');
            var index = ($active.length!=0) ? $items.index($active)+delta : 0;
            var count = $items.length;
            index = (index<0) ? count - 1 :
                (index>=count) ? 0 : index;
            this._activate($items.eq(index));
        },

        _getPanelContent: function () {
            return this.element;
        },

        updateChange:function(change, value) {
            change.currentValue = value;
            // NOTE : only modify's will be ever be updated.  deletes & adds are just static text displays.
            var changeItemSelector = '.change-item[' + this.options.config.refAttr + '="'+change.id+'"]';
            var $toggles = this._getPanelContent().find(changeItemSelector + ' .toggle');

            // CAVEAt : index can null/undefined.
            // if one of the change values isn't set. .: it's overridden by user to be something else.
            // in this case, the toggle button doesn't make sense so we'll show the "override state"
            var $changeItem;
            if (value && Number.isInteger(value.index)) {
                $changeItem = $toggles.eq(value.index);
            }
            else {
                $changeItem = this._getPanelContent().find(changeItemSelector + ' .toggle-override');
            }
            $toggles.removeClass('accepted');
            $changeItem.addClass('accepted');
            $changeItem.find('.change-value')
                .text(value.text)
                .removeClass(this.options.config.allCssSizes)
                .addClass(change.size);
        },

        changeAdded : function(id, change, value) {

            this.changesById[change.id] = change;
            var config = this.options.config;
            var template = this.getTemplate('changePanelContent');
            var $change = $(template(change));

            this.sortChanges();
            var index = this.options.changes.indexOf(change);
            // TODO : make this class a constant.
            $change.insertBefore($('.change-items .change-item').eq(index));

            $change.attr(config.refAttr,change.id);
            this.updateChange(change,value);

            // update the title.
            template = this.getTemplate('changePanelTitle');
            var $title = $(template(this.options));
            this._getPanelContent().find('.panel-heading').replaceWith($title);

        },

        sortChanges: function() {
            // sort these by ascending order in the DOM. if you don't then the navigation will be jerky and won't make sense when you Next/Prev in the panel.
            //  note that the data has no idea where they are on the form so no order can be assumed.
            var idAttr = this.options.config.idAttr;
            var $inputs = $('[' + idAttr + ']');
            this.options.changes.sort(function (a, b) {
                var $a = $('[' + idAttr + '="' + a.id + '"]');
                var $b = $('[' + idAttr + '="' + b.id + '"]');
                var result = $inputs.index($a) - $inputs.index($b);
                return result;
            });
        },

        _updateChanges : function(index) {
            var self = this;
            $.each(self.options.changes, function(i,change) {
                var value;
                if (Number.isInteger(index)) {
                    self.updateChange(change, change.values[index]);
                } else {
                    self.updateChange(change, change.currentValue);
                }
            });
        },

        show: function() {
            var self = this;
            this._addListeners();
            this._updateChanges(0);
        }

    });
})(jQuery);

