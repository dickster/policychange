
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
                var template = Handlebars.compile($(config.template.changePanelContent).html());
                var $content = $('<div/>')
                    .addClass(config.template.changeContainerClass)
                    .addClass('change-items');
                $.each(self.options.changes, function(i,change) {
                    var $change = $(template(change));
                    $change.attr(config.refAttr,change.id);
                    $content.append($change);
                })
                return $content.prop('outerHTML');
            },
        })
            .data('bs.popover')
            .tip()
            .addClass(config.changePanelClass);

        this.element.on('shown.bs.popover', function() {
            self._addChangeListeners();
            $.each(self.options.changes, function(i,change) {
                self.updateChange(change.id, change.values[0]);
            })
        });

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
        // ...then notify the world that we want to focus on this change. parent mediator will dispatch as needed.
        var changeId = $changeItem.attr(this.options.config.refAttr);
        this._trigger('select', null, [this.changesById[changeId], showPopup]);
    },

    _addChangeListeners : function() {
        var self = this;
        var $changePanel = $('.'+self.options.config.changePanelClass);

        // if you click on item row, it will scroll the window and highlight the change in the form.
        $changePanel.on('click', '.change-item', function(e) {
            self._activate($(this));
        });

        // same as click except it will also open the popup.
        $changePanel.on( 'dblclick', '.change-item', function() {
            self._activate($(this), true);
        });

        // assumes there are two toggle buttons that "on" means use first value = value[0]
        $changePanel.on('click', '.fa-toggle-off', function(e) {
            self._set($(this), 0);
        });
        $changePanel.on('click', '.fa-toggle-on', function(e) {
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

    updateChange:function(id, value) {
        // NOTE : only modify's will be ever be updated.  deletes & adds are just static text displays.
        var changeItemSelector = '.change-item[' + this.options.config.refAttr + '="'+id+'"]';
        var $toggles = this._getPopoverContent().find(changeItemSelector + ' .toggle');

        // CAVEAt : index can null/undefined.
        // if one of the change values isn't set. .: it's overridden by user to be something else.
        // in this case, the toggle button doesn't make sense so we'll show the "override state"
        var $changeItem;
        var change = this.changesById[id];
        if (Number.isInteger(value.index)) {
            $changeItem = $toggles.eq(value.index);
        }
        else {  
            $changeItem = this._getPopoverContent().find(changeItemSelector + ' .toggle-override');
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
        // TODO : refactor this out so i'm not constantly compiling template.
        var template = Handlebars.compile($(config.template.changePanelContent).html());
        var $content = $('.change-panel .'+config.template.changeContainerClass);
        var $change = $(template(change));

        this.sortChanges();
        var index = this.options.changes.indexOf(change);
        // TODO : make this class a constant.
        $change.insertBefore($('.change-items .change-item').eq(index));

        $change.attr(config.refAttr,change.id);
        this.updateChange(id,value);
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


    show: function() {
        this.element.popover('show');
    },

});
