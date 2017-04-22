var Utils = (function() {

    return {
        ensureVisible : function($el,$container,scroll) {
            if (!$container) {   // assume it's the immediate parent.
                $container = $el.parent();
            }
            if ( !($el.position().top + $el.height() > 0 && $el.position().top < $container.height()) ) {
                console.log('scrolling container/$el ' + $container.scrollTop());
                if (scroll) {
                    scroll($el, $container);
                }
                else {
                    console.log('----> ' + JSON.stringify($el.position().top));
                    $container.scrollTop($el.position().top);
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
