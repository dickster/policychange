
$.widget( "wtw.changePanel", {

    _create: function() {
        var self = this;
        var config = this.options.config;

        this.element.addClass('change-editor');

        this.element.popover({
            placement: 'bottom',
            trigger: 'manual',
            container:'body',
            html : true,
            title: function() {
                var template = Handlebars.compile($(config.template.changePanelTitle).html());
                return template(self.options);
            },
            content: function() {
                var config = self.options.config.template;
                var template = Handlebars.compile($(config.changePanelContent).html());
                var $content = $(config.changeContainer);
                $.each(self.options.changes, function(i,change) {
                    var $change = $(template(change));
                    $change.attr(self.options.config.refAttr,change.id);
                    $content.append($change);
                })
                return $content.html();
            },
        })
            .data('bs.popover')
            .tip()
            .addClass(config.changePanelClass);

        // create lookup so i can find changes by id.
        this.changesById = {};
        for (var i = 0, len = this.options.changes.length; i < len; i++) {
            this.changesById[this.options.changes[i].id] = this.options.changes[i];
        }

        this.element.on('shown.bs.popover', function() {
            self._addChangeListeners();
            $.each(self.options.changes, function(i,change) {
                self.updateChange(change.id, change);
            })
        });

    },

    // TODO : refactor this be called by mediator....activeChangeValue(id,index,value);
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
        // ...then notify the world that we want to focus on this change. parent mediator will dispatch as needed.
        var changeId = $changeItem.attr(this.options.config.refAttr);
        this._trigger('select', null, [this.changesById[changeId], showPopup]);
    },


    _addChangeListeners : function() {
        var self = this;

        // if you click on item row, it will scroll the window and highlight the change in the form.
        $('.change-panel').on('click', '.change-item', function(e) {
            self._activate($(this));
        });

        // same as click except it will also open the popup.
        $( '.change-panel').on( 'dblclick', '.change-item', function() {
            self._activate($(this), true);
        });

        // assumes there are two toggle buttons that "on" means use first value = value[0]
        $('.change-panel').on('click', '.fa-toggle-off', function(e) {
            self._set($(this), 0);
        });
        $('.change-panel').on('click', '.fa-toggle-on', function(e) {
            self._set($(this), 1);
        });

    },

    _set : function($toggle,index) {
        var $item = $toggle.parents('.change-item');
        var id = $item.attr(this.options.config.refAttr);
        var change = this.changesById[id];
        this._trigger('set', null, [id, change.values[index]]);
    },

    _select: function ($content, delta) {
        var $items = $content.find('.change-item');
        var $active = $content.find('.change-item.active');
        var index = ($active.length!=0) ? $items.index($active)+delta : 0;
        var count = $items.length;
        index = (index<0) ? count - 1 :
            (index>=count) ? 0 : index;
        this._activate($items.eq(index));
    },

    _initPrevNextButtons: function ($popover) {
        var self = this;
        $popover.find('.next-change').click(function() {
            self._select($popover, 1);
        });
        $popover.find('.prev-change').click(function() {
            self._select($popover, -1);
        });
    },

    _getPopoverContent: function () {
        var pop = this.element.data('bs.popover');
        return pop ? pop.tip() : null;
    },

    updateChange:function(id, change) {
        // NOTE : only modify's will be ever be updated.  deletes & adds are just static text displays.
        // TODO : refactor out hard coded attribute!
        var $toggles = this._getPopoverContent().find('.change-item[data-change-ref="'+id+'"]  .toggle');

        // CAVEAt : index can null/undefined.
        // if one of the change values isn't set. .: it's overridden by user to be something else.
        // in this case, the toggle button doesn't make sense so we'll show the "override state"
        var $changeItem;
        if (Number.isInteger(change.index)) {
            $changeItem = $toggles.eq(change.index);
        }
        else {
            // TODO : take out hard coded attribute usage.
            $changeItem = this._getPopoverContent().find('.change-item[data-change-ref="'+id+'"] .toggle-override');
        }
        // TODO : don't use hard code string for all sizes. 'sm md lg'.
        // instead, take the array and create this
        // removeClass(cssSizes.join(' '))
        $toggles.removeClass('accepted');
        $changeItem.addClass('accepted');
        $changeItem.find('.change-value').text(change.text).removeClass('sm md lg').addClass(change.size);
    },

    show: function() {
        this.element.popover('show');
    },

});
