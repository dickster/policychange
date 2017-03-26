$( function() {

    // TODO : refactor this into a proper changeEditor module pattern.
    // it creates changePanel & changeInput widgets and mediates events.

    var options = {

        // widgetEventPrefix: 'wtw',

        changes:[
            // add/delete/modify.   instead of acord xpath    broker, carrier values.       ignore. don't include this.
            //                       use an id.
            {type:'modify',         uid: 937,               values: ['apple','orange'],     summary:'{to-be-generated}' },
            {type:'delete',         uid: 840,               values: ['Ford','Toyota'],      summary:'{to-be-generated}' }
        ],

        // all view customization data goes here.
        config: {
            rejectIcon: '<i class="fa fa-circle-o"/>',
            acceptIcon: '<i class="fa fa-check-circle"/>',
            inputIcon: '<li class="fa fa-asterisk change-input-icon"></li>',
            onChangeAdded:null,
            uidSelectorTemplate: '[data-change-id="${uid}"]',
            itemChangeRefAttr: 'data-change-ref',
            open: true,
            expanded:false,
            trigger: 'click',
            title:'#changePanelTitle',
            content:'#changePanelContent',
            inputTitle:'#changeInputTitle',
            inputContent:'#changeInputContent',
            header: 'Changes',
            valueLabels: ['Broker', 'Carrier'],
            uidLabels:{840:'Vehicle Manufacturer?',937:'Fruit'},
        },
    };

    $('.change-editor').changeEditor(options)
        .on('changeeditorselect', function(e,id) {
            alert(id + ' selected');
        })
        .on('changeeditoraccept', function(e,id,value) {
            alert(id + ' set to ' + value);
        });

    // create ALL the possible change inputs (they are lazy. popup won't be created unless they click on it)
    var $inputs = [];
    $.each(options.changes, function(i,change) {
        var $input = $('[data-change-id="'+change.uid+'"]');
        $input.changeInput({config:options.config, change:change})
            .on('changeinputupdate', function(e, id, value) {
                alert('input ' + id + ' changed to ' + value);
            })
            // .on('changeinputselect', function(e, delta) {
            //     alert('input popup selected' + delta);
            // })
            .on('changeinputnext', function(e) {
                alert('next');
            })
            .on('changeinputprev', function(e) {
                alert('prev');
            });
        $inputs.push($input);
    });


    // _activatePrevInput: function ($input) {
    //     var $inputs = this._getAllChangeInputs();
    //     var i = $inputs.index($input);
    //     var $prev = $inputs.eq( (i - 1 + $inputs.length) % $inputs.length );
    //     this.icon.popover('hide');
    //     this._activateInput($prev,true);
    // },
    //
    // _activateNextInput: function () {
    //     // TODO :
    //     var $inputs = this._getAllChangeInputs();
    //     var i = $inputs.index();
    //     var $next = $inputs.eq( (i + 1) % $inputs.length );
    //     this.icon.popover('hide');
    //     this._activateInput($next,true);
    // },



});
