
// note : in order to override methods for basic widget, see
// https://learn.jquery.com/jquery-ui/widget-factory/extending-widgets/

$.widget( "wtw.changeEditor", {

    defaultOptions: {
        // TODO : refactor this to use a map id: { change  }

        // all data generated by server side comparison goes here.
        // this is temporary mock data.
        changes:[
            // add/delete/modify.   instead of acord xpath    broker, carrier values.       ignore. don't include this.
            //                       use an id.
            {type:'modify',         uid: 937,               values: ['apple','orange'],     summary:'to-be-generated' },
            {type:'delete',         uid: 840,               values: ['Ford','Toyota'],      summary:'to-be-generated' }
        ],

        // all view customization data goes here.
        config: {
            rejectIcon: '<i class="fa fa-circle-o"/>',
            acceptIcon: '<i class="fa fa-check-circle"/>',
            inputIcon: '<li class="fa fa-asterisk change-input-icon"></li>',
            onChangeAdded:null,
            idAttr:'data-change-id',
            refAttr:'data-change-ref',

            // @Deprecated.  use idAttr & refAttr instead!
            uidSelectorTemplate: '[data-change-id="${uid}"]',
            // @Deprecated.  use idAttr & refAttr instead!
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

    _create: function() {
        this.options = $.extend(this.defaultOptions,this.options);
        this.element.addClass('change-editor');
        this._formatData();
        this._createPopup(this.element);
    },



    _activatePrevInput: function ($input) {
        var $inputs = this._getAllChangeInputs();
        var i = $inputs.index($input);
        var $prev = $inputs.eq( (i - 1 + $inputs.length) % $inputs.length );
        this._getInputIcon($input).popover('hide');
        this._activateInput($prev,true);
    },

    _activateNextInput: function ($input) {
        var $inputs = this._getAllChangeInputs();
        var i = $inputs.index($input);
        var $next = $inputs.eq( (i + 1) % $inputs.length );
        this._getInputIcon($input).popover('hide');
        this._activateInput($next,true);
    },

    _getInputChangeValue: function (acceptIcon) {
        // assumes that the value is a sibling.
        // TODO : maybe i should use a hidden field in conjuction with a user friendly readable span.
        // that way i can have any format of data in hidden input.
        return $(acceptIcon).siblings('.change-input-value').text();
    },

    _updateChangeInputState: function ($input) {
        var $this = this;
        var currentValue = $input.changeVal();
        var pop = $this._getInputIcon($input).data('bs.popover');
        if (!pop) return;
        var $popover = pop.tip();

        $popover.find('.change-value').each(function(i, value) {
            // TODO : make a compareChangeValue method. this may get tricky for non-string values (boolean, dates, etc...)
            if (currentValue===$(value).find('.change-input-value').text()) {
                $(this).addClass('accepted');
            }
            else {
                $(this).removeClass('accepted');
            }
        });
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

        // hide any change input popovers when you click somewhere else on screen.
        // i could probably do this in a better way by triggering an event in the on show ofa
        // change input popover.  each popover would register itself (prototyped) that would hide itself
        // unless it was the source of the target?  whatevs....
        // $('body').on('click', function (e) {
        //     $('.change-input-icon').each(function () {
        //         //the 'is' for buttons that trigger popups
        //         //the 'has' for icons within a button that triggers a popup
        //         if (!$(this).is(e.target) && $(this).has(e.target).length === 0 && $('.popover').has(e.target).length === 0) {
        //             $(this).popover('hide');
        //         }
        //     });
        // });
    },

    _updateState : function(change) {
        // instead of doing this, the plugin should take responsibility of setting the values initially
        //  that way it doesn't have to inspect and compare.  it can just set it and forget it?
        var $this = this;
        var currentValue = 'foo';//$this._getChangeInput(change.uid).changeVal();
        $.each(change.values, function (idx, value) {
            if (currentValue === value) {     // TODO : ignore case and/or whitespace?
                $this._updateActiveValue($this._getChangeItem(change.uid), change, idx);
            }
        });
    },

    _initState : function() {
        var $this = this;
        $.each(this.options.changes, function(i,change) {
            $this._updateState.call($this, change);
        });
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
                    {   value: value,
                        label:config.valueLabels[i]
                    }
                );
            });
        });
    },


    _getChangeItem : function(uid) {
        var selector = '['+this.options.config.itemChangeRefAttr +'="'+ uid+'"]';
        if ($(selector).length==0) {
            throw 'can not find element matching "' + selector + '" when trying to view change  (there should be a form input that matches this)';
        }
        return $(selector);
    },

    _updateActiveValue: function ($changeItem, change, index) {
        // remove all other (if any) active items, and highlight this one.
        // TODO : chain these two lines together after debugging...
        $changeItem.find('.change-value').removeClass('active');
        $changeItem.find('.change-value').eq(index).addClass('active');
    },

    // _activateInput: function ($input, showPopup) {
    //     if ($input.length==0) return;
    //     this._getAllChangeInputs().removeClass('active');
    //     $('html, body').animate({
    //         scrollTop: $input.offset().top}, 350, function() {
    //         $input.addClass('active');
    //     });
    //     if (showPopup) {
    //         this._toggleInputPopup($input);
    //     }
    // },

    viewChange : function($changeItem) {
        // select the item in the main panel
        var uid = $changeItem.attr(this.options.config.itemChangeRefAttr);
        $('.change-input').popover('hide');
        $changeItem.siblings().removeClass('active');
        $changeItem.addClass('active');
        // ..now deal with the form input itself
        this._activateInput(this._getChangeInput(uid));
    },

    onChangeAdded : function($changeItem, change) {
        var $this = this;
        $changeItem.attr('data-change-ref',change.uid);
        var $changeValues = $changeItem.find('.change-value');
        var viewChange = this.viewChange.bind(this);

        // if you click on the *unselected* icon, it will accept the change (set its value and update status).
        $.each($changeValues, function(i, changeValue) {
            $(changeValue).find('.change-reject').click(function(e) {
                var value = change.values[i];
                var $input = $this._getChangeInput(change.uid);
                $input.changeVal(value);
            });
        });

        // if you click on item row, it will scroll the window and highlight the change in the form.
        $changeItem.click(function(e) {
            // TODO : add highlight change animation.
            viewChange($changeItem);
        });
    },

    _advanceActiveChange: function ($content, delta) {
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
        var advance = this._advanceActiveChange.bind(this);
        $popover.find('.next-change').click(function() {
            advance($popover, 1);
        });
        $popover.find('.prev-change').click(function() {
            advance($popover, -1);
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
    }

});
