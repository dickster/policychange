
// note : in order to override methods for basic widget, see
// https://learn.jquery.com/jquery-ui/widget-factory/extending-widgets/

$.widget( "wtw.changePanel", {

    _create: function() {
        this.element.addClass('change-editor');
        this._formatData();
        this._createPopup(this.element);
    },

    _createPopup: function (element) {
        var $this = this;
        var shown = this._editorShown.bind(this);
        var config = this.options.config;
        var title = config.title;
        var content = config.content;

        element.popover({
            placement: 'bottom',
            trigger: 'click',
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

        element.on('shown.bs.popover', function() {
            shown($(this));
        });
        element.popover('show');
    },

    _initState : function() {
        // i'll just wait for the inputs to call me when they are initialized.
        // they can tell me their current state.
    },

    _formatData : function() {
        var config = this.options.config;
        $.each(this.options.changes, function(i,change) {
            console.log('change'+change);
            change.summary = config.uidLabels[change.uid];
            if (!change.summary) {
                change.summary = '['+change.uid+']';
                console.log('no label was given for the change with id ' + change.uid + '  (using id as default label)');
            }
            change.formattedValues = [];
            $.each(change.values, function(i,value) {
                console.log('value'+value);
                change.formattedValues.push(
                    {   label:config.valueLabels[i],
                        value: value,
                        displayValue: value
                        // TODO : may need to differentiate between display value and actual value.
                        // for example, selects will have key & value, dates maybe stored as long but displayed as text etc...
                    }
                );
            });
        });
    },

    // TODO : refactor this be called by mediator....activeChangeValue(id,index,value);
    _activateChangeValue: function ($changeItem, change, index) {
        // remove all other (if any) active items, and highlight this one.
        // TODO : chain these two lines together after debugging...
        $changeItem.find('.change-value').removeClass('active');
        $changeItem.find('.change-value').eq(index).addClass('active');
    },

    _activate : function($changeItem) {
        // select the item in the main panel
        var uid = $changeItem.attr(this.options.config.itemChangeRefAttr);

        $changeItem.siblings().removeClass('active');
        $changeItem.addClass('active');
    },

    onChangeAdded : function($changeItem, change) {
        var $this = this;
        // manually set this attribute so we can use it later.
        $changeItem.attr('data-change-ref',change.uid);

        // if you click on the *unselected* icon, it will accept the change (set its value and update status).
        var $changeValues = $changeItem.find('.change-value');
        $.each($changeValues, function(i, changeValue) {
            $(changeValue).find('.change-reject').click(function(e) {
                $this._trigger('accept', null, [change.uid, i, change.values[i]]);
            });
        });

        // if you click on item row, it will scroll the window and highlight the change in the form.
        $changeItem.click(function(e) {
            $this._activate($changeItem);
            // notify the world that we want to focus on this change. parent mediator will dispatch as needed.
            $this._trigger('select', null, [change.uid]);
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
        $active.removeClass('active');
        this.viewChange($items.eq(index));
    },

    _initPrevNextButtons: function ($popover) {
        var $this = this;
        $popover.find('.next-change').click(function() {
            $this.select($popover, 1);
        });
        $popover.find('.prev-change').click(function() {
            $this.select($popover, -1);
        });
    },

    _editorShown : function($popoverTrigger) {
        // the trigger is the element that the popover is attached to.  we need the actual popover itself.
        var $this = this;
        var $popover = $popoverTrigger.data('bs.popover').tip();
        var callback = this.options.config.onChangeAdded ? this.options.config.onChangeAdded.bind(this) : this.onChangeAdded.bind(this);

        this._initPrevNextButtons($popover);

        $popover.find('.change-item').each(function(i) {
            callback($(this), $this.options.changes[i]);
        });

        this._initState();
    },

    getPopoverContent: function () {
        var pop = this.element.data('bs.popover');
        return pop ? pop.tip() : null;
    },

    updateChange:function(id, index, value) {
        this.getPopoverContent().find('.change-item[data-change-ref="'+id+'"] .change-value').each(function(i, value) {
            if (i==index) {
                $(this).addClass('active');
            }
            else {
                $(this).removeClass('active');
            }
        });
    }

});
