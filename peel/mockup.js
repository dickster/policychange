$( function() {

    var options = {

        // widgetEventPrefix: 'wtw',

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
        .on('changeeditorupdate', function(e,id,value) {
            alert(id + ' set to ' + value);
        });

    // create ALL the possible change inputs (they are lazy. popup won't be created unless they click on it)
    $.each(options.changes, function(i,change) {
        $('[data-change-id="'+change.uid+'"]')
            .changeInput({config:options.config, change:change})
    });

});
