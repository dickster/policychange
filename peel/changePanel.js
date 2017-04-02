
// note : in order to override methods for basic widget, see
// https://learn.jquery.com/jquery-ui/widget-factory/extending-widgets/

$.widget( "wtw.changePanel", {

    _create: function() {
        var $this = this;
        var shown = this._editorShown.bind(this);
        var config = this.options.config;
        var title = config.title;
        var content = config.content;

        this.element.addClass('change-editor');

        this.element.popover({
                placement: 'bottom',
                trigger: 'manual',
                container:'body',
                html : true,
                title: function() {
                    var template = Handlebars.compile($(title).html());
                    return template($this.options);
                },
                content: function() {
                    var template = Handlebars.compile($(content).html());
                    return template($this.options);
                }
            })
            .data('bs.popover')
            .tip()
            .addClass('change-panel-popover');

        this.element.on('shown.bs.popover', function() {
            shown($(this));
        });
        this.element.popover('show');
    },

    // TODO : refactor this be called by mediator....activeChangeValue(id,index,value);
    _activateChangeValue: function ($changeItem, change, index) {
        // remove all other (if any) active items, and highlight this one.
        // TODO : chain these two lines together after debugging...
        $changeItem.find('.change-value').removeClass('active');
        $changeItem.find('.change-value').eq(index).addClass('active');
    },

    _activate : function($changeItem) {
        $changeItem.siblings().removeClass('active');
        $changeItem.addClass('active');
        // notify the world that we want to focus on this change. parent mediator will dispatch as needed.
        var changeId = $changeItem.attr(this.options.config.refAttr);
        this._trigger('select', null, [changeId]);
    },

    onChangeAdded : function($changeItem, change) {
        var self = this;
        // manually set this attribute so we can use it later.
        $changeItem.attr('data-change-ref',change.id);

        var $changeValues = $changeItem.find('.change-value');
        // assumes there are two toggle buttons that "on" means use first value = value[0]
        $changeItem.find('.fa-toggle-off').click(function(e) {
            self._trigger('set', null, [change.id, change.values[0]]);
        });
        $changeItem.find('.fa-toggle-on').click(function(e) {
            self._trigger('set', null, [change.id, change.values[1]]);
        });

        // if you click on item row, it will scroll the window and highlight the change in the form.
        $changeItem.click(function(e) {
            self._activate($changeItem);
        });
    },

    _select: function ($content, delta) {
        var $items = $content.find('.change-item');
        var $active = $content.find('.change-item.active');
        var index = ($active.length!=0) ? $items.index($active)+delta : 0;
        var count = $items.length;
        index = (index<0) ? count - 1 :
            (index>=count) ? 0 :
                index;
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

    // if you need to surrounding popover DOM to exist, you have to wait till 'shown.bs.popover' event is fired.
    //  this method will be called
    // note that everytime the popover is hidden/shown the DOM is recreated.
    _editorShown : function($popoverTrigger) {
        // the trigger is the element that the popover is attached to.  we need the actual popover itself.
        var self = this;
        var $popover = $popoverTrigger.data('bs.popover').tip();
        var callback = this.options.config.onChangeAdded ? this.options.config.onChangeAdded.bind(this) : this.onChangeAdded.bind(this);

        this._initPrevNextButtons($popover);

        $popover.find('.change-item').each(function(i) {
            callback($(this), self.options.changes[i]);
        });

    },

    getPopoverContent: function () {
        var pop = this.element.data('bs.popover');
        return pop ? pop.tip() : null;
    },

    updateChange:function(id, changeValue) {
        var $sections = this.getPopoverContent().find('.change-item[data-change-ref="'+id+'"] section');
        $sections.removeClass('accepted');
        var displayValue = changeValue.displayValue;
        if (!displayValue) {
            displayValue = '<empty>';
        }

        // CAVEAt : index can null/undefined.
        // if one of the change values isn't set. .: it's overridden by user to be something else.
        // in this case, the toggle button doesn't make sense so we'll show the "override state"
        var $changeItem;
        if (Number.isInteger(changeValue.index) && changeValue.index>=0) {
            $changeItem = $sections.eq(changeValue.index);
        }
        else {
            $changeItem = this.getPopoverContent().find('.change-item[data-change-ref="'+id+'"] section.toggle-override');
        }
        $changeItem.addClass('accepted');
        $changeItem.find('.change-value').text(displayValue);
    }

});
