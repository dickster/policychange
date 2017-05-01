var Utils = (function() {

    var param = function(name, defaultValue) {
        var p = (window.location.search.split(name + '=')[1] || '').split('&')[0];
        return p ? p : defaultValue;
    };

    var getJson = function(parameter, dflt, callback) {
        // if specified in URL, that wins otherwise we'll use default.
        var file = param(parameter,dflt);
        file = 'data/' + file;
        if (file.indexOf('.json')==-1) {
            file = file + '.json';
        }
        console.log('loading data from ' + file);
        return $.getJSON(file, callback);
    };

    //  methods returned by Utils object here....

    return {

        // only use this for debugging.  in production you just want to do....
        //    wtw.changeEditor.init(opts);
        // this method just allows you to easily override config & changes data via url params & external .json files.

        debugChangeEditor: function(changes,config,template) {
            var options = {};

            if (!changes) changes = 'changes';   //use default file name if none provided.
            if (!config) config = 'config';

            var assignChanges = function(json) { options.changes=json;};
            var assignConfig = function(json) { options.config=json;};

            $.when( getJson('changes', changes, assignChanges),
                    getJson('config', config, assignConfig) )
                .then( function() {
                    // this is the only line you need to start editor.
                    // the rest is there to facilitate loading test data based on url parameters (QA use case only).
                    wtw.changeEditor.init(options);
                }, function() {
                    alert('cant load config/changes test data');
                } );

        },

        ensureVisible : function($el,$container,scroll) {
            if (!$container) {   // assume it's the immediate parent.
                $container = $el.parent();
            }
            if ( !($el.position().top + $el.height() > 0 && $el.position().top < $container.height()) ) {
                if (scroll) {
                    scroll($el, $container);
                }
                else {
                    $container.scrollTop($container.scrollTop() + $el.position().top);
                }
            }
        },

        isInViewport: function($el) {
            var win = $(window);
            var viewTop = win.scrollTop();
            var viewBottom = viewTop + win.height();
            var top = $el.offset().top;
            var bottom = top + $el.height();
            return (viewTop<=top && viewBottom >= bottom);
        },

    };

}());
