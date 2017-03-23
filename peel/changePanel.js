
function ChangePanel() {

    var initChangePanel = function() {
//    var shown = this._editorShown.bind(this);
        var options = this.options;
        var config = options.config;
        var title = config.title;
        var content = config.content;

        this.element.popover({
            placement: 'bottom',
            trigger: 'click',
            container: 'body',
            html: true,
            title: function () {
                var template = Handlebars.compile($(title).html());
                return template(options);
            },
            content: function () {
                var template = Handlebars.compile($(content).html());
                return template(options);
            }
        })
            .data('bs.popover')
            .tip()
            .addClass('change-panel-popover');

        // element.on('shown.bs.popover', function () {
        //     shown($(this));
        // });
        element.popover('show');

        // // hide any change input popovers when you click somewhere else on screen.
        // // i could probably do this in a better way by triggering an event in the on show ofa
        // // change input popover.  each popover would register itself (prototyped) that would hide itself
        // // unless it was the source of the target?  whatevs....
        // $('body').on('click', function (e) {
        //     $('.change-input-icon').each(function () {
        //         //the 'is' for buttons that trigger popups
        //         //the 'has' for icons within a button that triggers a popup
        //         if (!$(this).is(e.target) && $(this).has(e.target).length === 0 && $('.popover').has(e.target).length === 0) {
        //             $(this).popover('hide');
        //         }
        //     });
        // });
    }
}


//
//     _valHook : function ($elem) {
//         // override if you want to set a specific get/set method for change input values.
//         // they will just default to jquery's val().
//         // for example, a EasyJSCombo box might require a special method to find an underlying hidden elements value.
//     }
// ,
//
//     _setValHooks: function () {
//         var $this = this;
//         $.fn.changeVal = function (value) {
//             var hook = $this._valHook(this);
//             if (!hook) {
//                 var type = this.prop('tagName').toLowerCase();
//                 type = (type == 'input' && this.prop('type')) ? this.prop('type') : type;
//                 // use jquery's val method as the default hook.
//                 hook = this.val;
//             }
//             var result = hook.apply(this, arguments);
//             if (arguments.length) {
//                 this.trigger('change.wtw', [
//                     this.attr('data-change-id'), value
//                 ]);
//             }
//             return result;
//         }
//
//     }
// ,
//
//
//     // TODO : refactor all these methods to be prototyped on input jquery objects.
//     // that way i don't have to muck around with context all the time.
//     // also i should make 2 extensions of popover - changePanelPopover & changeInputPopover
//     // each class would contain a reference to the popover & it's associated element (icon or link).
//
//     _getInputIcon: function ($input) {
//         // icon is assumed to be the next element in DOM.
//         return $input.next();
//     }
// ,
//
//     _activatePrevInput: function ($input) {
//         var $inputs = this._getAllChangeInputs();
//         var i = $inputs.index($input);
//         var $prev = $inputs.eq((i - 1 + $inputs.length) % $inputs.length);
//         this._getInputIcon($input).popover('hide');
//         this._activateInput($prev, true);
//     }
// ,
//
//     _activateNextInput: function ($input) {
//         var $inputs = this._getAllChangeInputs();
//         var i = $inputs.index($input);
//         var $next = $inputs.eq((i + 1) % $inputs.length);
//         this._getInputIcon($input).popover('hide');
//         this._activateInput($next, true);
//     }
// ,
//
//     _getInputChangeValue: function (acceptIcon) {
//         // assumes that the value is a sibling.
//         // TODO : maybe i should use a hidden field in conjuction with a user friendly readable span.
//         // that way i can have any format of data in hidden input.
//         return $(acceptIcon).siblings('.change-input-value').text();
//     }
// ,
//
//     _updateChangeInputState: function ($input) {
//         var $this = this;
//         var currentValue = $input.changeVal();
//         var pop = $this._getInputIcon($input).data('bs.popover');
//         if (!pop) return;
//         var $popover = pop.tip();
//
//         $popover.find('.change-value').each(function (i, value) {
//             // TODO : make a compareChangeValue method. this may get tricky for non-string values (boolean, dates, etc...)
//             if (currentValue === $(value).find('.change-input-value').text()) {
//                 $(this).addClass('accepted');
//             }
//             else {
//                 $(this).removeClass('accepted');
//             }
//         });
//     }
// ,
//
//     _toggleInputPopup: function ($input) {
//         var $this = this;
//         var $icon = this._getInputIcon($input);
//         var change = this._getInputChange($input);
//         // show lazily instantiated popover.
//         if ($icon.data('bs.popover')) {
//             $icon.popover('toggle');
//             return;
//         }
//
//         // create if doesn't exist.
//         $icon.popover({
//             placement: 'bottom',
//             trigger: 'manual',
//             html: true,
//             title: function () {
//                 var template = Handlebars.compile($('#dialogTitle').html());
//                 return template(change);
//             },
//             content: function () {
//                 var template = Handlebars.compile($('#dialogContent').html());
//                 return template(change);
//             }
//         })
//             .data('bs.popover')
//             .tip()
//             .addClass('change-input-popover');
//
//         $icon.popover('show');
//
//         $icon.on('shown.bs.popover', function () {
//             var $popover = $icon.data('bs.popover').tip();
//             $this._updateChangeInputState($input);
//             $popover.find('.next-change').click(function () {
//                 $this._activateNextInput($input);
//             });
//             $popover.find('.prev-change').click(function () {
//                 $this._activatePrevInput($input);
//             });
//             $popover.find('.change-input-accept').click(function () {
//                 $input.changeVal($this._getInputChangeValue(this));
//             });
//         });
//     }
// ,
//
//     getInputChangeId: function ($input) {
//         return $input.attr('data-change-id');
//     }
// ,
//
//     _getInputChange: function ($input) {
//         var uid = this.getInputChangeId($input);
//         var changes = this.options.changes;
//         for (var i = 0, len = changes.length; i < len; i++) {
//             if (changes[i] && changes[i].uid == uid)
//                 return changes[i];
//         }
//         throw 'cant find change with id ' + uid;
//     }
// ,
//
//     _createInputPopups: function () {
//         var $this = this;
//         $.each(this.options.changes, function (i, change) {
//             var $input = $this._getChangeInput(change.uid);
//             $input.on('change.wtw', function (e, uid, value) {
//                 console.log(value + ' - ' + uid);
//                 // e.currentTarget will be the input that changed.
//                 $this._updateChangeInputState($input);
//                 $this._updateState($this._getInputChange($input));
//             });
//             var $icon = $($this.options.config.inputIcon);
//             $icon.insertAfter($input);
//
//             $icon.click(function () {
//                 $this._toggleInputPopup($input);
//             });
//         });
//     }
// ,
//
// ,
//
//     _updateState : function (change) {
//         // instead of doing this, the plugin should take responsibility of setting the values initially
//         //  that way it doesn't have to inspect and compare.  it can just set it and forget it?
//         var $this = this;
//         var currentValue = $this._getChangeInput(change.uid).changeVal();
//         $.each(change.values, function (idx, value) {
//             if (currentValue === value) {     // TODO : ignore case and/or whitespace?
//                 $this._updateActiveValue($this._getChangeItem(change.uid), change, idx);
//             }
//         });
//     }
// ,
//
//     _initState : function () {
//         var $this = this;
//         $.each(this.options.changes, function (i, change) {
//             $this._updateState.call($this, change);
//         });
//     }
// ,
//
//     _formatData : function () {
//         var config = this.options.config;
//         $.each(this.options.changes, function (i, change) {
//             console.log('change' + change);
//             change.summary = config.uidLabels[change.uid];
//             if (!change.summary) {
//                 change.summary = '[' + change.uid + ']';
//                 console.log('no label was given for the change with id ' + change.uid + '  (using id as default label)');
//             }
//             change.formattedValues = [];
//             $.each(change.values, function (i, value) {
//                 console.log('value' + value);
//                 change.formattedValues.push(
//                     {
//                         value: value,
//                         label: config.valueLabels[i]
//                     }
//                 );
//             });
//         });
//     }
// ,
//
//     _getChangeInput : function (uid) {
//         var selector = this.options.config.uidSelectorTemplate.replace('${uid}', uid);
//         var $result = $(selector);
//         if ($result.length == 0) {
//             throw 'can not find element matching "' + selector + '" when trying to view change  (there should be a form input that matches this)';
//         }
//         return $result;
//     }
// ,
//
//     _getAllChangeInputs : function (uid) {
//         var selector = this.options.config.uidSelectorTemplate.replace('="${uid}"', '');
//         if ($(selector).length == 0) {
//             throw 'can not find any change form inputs "' + selector;
//         }
//         return $(selector);
//     }
// ,
//
//     _getChangeItem : function (uid) {
//         var selector = '[' + this.options.config.itemChangeRefAttr + '="' + uid + '"]';
//         if ($(selector).length == 0) {
//             throw 'can not find element matching "' + selector + '" when trying to view change  (there should be a form input that matches this)';
//         }
//         return $(selector);
//     }
// ,
//
//     _updateActiveValue: function ($changeItem, change, index) {
//         // remove all other (if any) active items, and highlight this one.
//         // TODO : chain these two lines together after debugging...
//         $changeItem.find('.change-value').removeClass('active');
//         $changeItem.find('.change-value').eq(index).addClass('active');
//     }
// ,
//
//     _setActiveChangeValue : function ($action, change, index) {
//         var value = change.values[index];
//         var $input = this._getChangeInput(change.uid);
//         $input.changeVal(value);
//     }
// ,
//
//     _activateInput: function ($input, showPopup) {
//         if ($input.length == 0) return;
//         this._getAllChangeInputs().removeClass('active');
//         $('html, body').animate({
//             scrollTop: $input.offset().top
//         }, 350, function () {
//             $input.addClass('active');
//         });
//         if (showPopup) {
//             this._toggleInputPopup($input);
//         }
//     }
// ,
//
//     viewChange : function ($changeItem) {
//         // select the item in the main panel
//         var uid = $changeItem.attr(this.options.config.itemChangeRefAttr);
//         $('.change-input').popover('hide');
//         $changeItem.siblings().removeClass('active');
//         $changeItem.addClass('active');
//         // ..now deal with the form input itself
//         this._activateInput(this._getChangeInput(uid));
//     }
// ,
//
//     onChangeAdded : function ($changeItem, change) {
//         var $this = this;
//         $changeItem.attr('data-change-ref', change.uid);
//         var $changeValues = $changeItem.find('.change-value');
//         var viewChange = this.viewChange.bind(this);
//
//         // if you click on the *unselected* icon, it will accept the change (set its value and update status).
//         $.each($changeValues, function (i, changeValue) {
//             $(changeValue).find('.change-reject').click(function (e) {
//                 var value = change.values[i];
//                 var $input = $this._getChangeInput(change.uid);
//                 $input.changeVal(value);
//             });
//         });
//
//         // if you click on item row, it will scroll the window and highlight the change in the form.
//         $changeItem.click(function (e) {
//             // TODO : add highlight change animation.
//             viewChange($changeItem);
//         });
//     }
// ,
//
//     _advanceActiveChange: function ($content, delta) {
//         var $items = $content.find('.change-item');
//         var $active = $content.find('.change-item.active');
//         var index = ($active.length != 0) ? $items.index($active) + delta : 0;
//         var count = $items.length;
//         index = (index < 0) ? count - 1 :
//             (index >= count) ? 0 :
//                 index;
//         $active.removeClass('active');
//         this.viewChange($items.eq(index));
//     }
// ,
//
//     _initPrevNextButtons: function ($popover) {
//         var advance = this._advanceActiveChange.bind(this);
//         $popover.find('.next-change').click(function () {
//             advance($popover, 1);
//         });
//         $popover.find('.prev-change').click(function () {
//             advance($popover, -1);
//         });
//     }
// ,
//
//     _editorShown : function ($popoverTrigger) {
//         // the trigger is the element that the popover is attached to.  we need the actual popover itself.
//         var $this = this;
//         var $popover = $popoverTrigger.data('bs.popover').tip();
//         var callback = this.options.config.onChangeAdded ? this.options.config.onChangeAdded.bind(this) : this.onChangeAdded.bind(this);
//
//         this._initPrevNextButtons($popover);
//
//         $popover.find('.change-item').each(function (i) {
//             callback($(this), $this.options.changes[i]);
//         });
//
//         this._initState();
//     }
