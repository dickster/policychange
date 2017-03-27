
// TODO : make this into module pattern and invoke it.
// wtw.changeEditor.init({options});

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


    $('.change-panel').changePanel(options)
        .on('changepanelselect', function(e,id) {
            getInput(id).changeInput('select', id);
        })
        .on('changepanelaccept', function(e,id,index,value) {
            getInput(id).changeInput('accept',id,index,value);
        });


    // create ALL the possible change inputs (they are lazy. popup won't be created unless they click on it)
    $.each(options.changes, function(i,change) {
        var $input = $('[data-change-id="'+change.uid+'"]');
        $input.changeInput({config:options.config, change:change})
            .on('changeinputupdate', function(e, id, index, value) {
                alert('input ' + id + ' changed to ' + value + ' ['+index+']');
            })
            .on('changeinputnext', function(e) {
                next($input);
            })
            .on('changeinputprev', function(e) {
                prev($input);
            });
    });


    function getInput(id) {
        return $('[data-change-id="'+id+'"]');
    }

    function go($input, delta) {
        var $inputs = $('[data-change-id]:visible');
        var from  = $inputs.index($input);
        var to = from + delta;
        // TODO :assert from is defined >=0.
        if (to>=$inputs.length) to = 0;
        if (to<0) to = $inputs.length-1;
        $input.changeInput('hide');
        $inputs.eq(to).changeInput('activateAndShowPopup');
    }

    function next($input) {
        go($input, 1);
    }

    function prev($input) {
        go($input,1);
    }

});
