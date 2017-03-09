/**
 * Easy Combo- jQuery plugin.
 * @param {type} $
 * @returns {undefined}
 */
(function($) {
    var KEY = {
        UP: 38,
        DOWN: 40,
        DEL: 46,
        TAB: 9,
        RETURN: 13,
        ESC: 27,
        COMMA: 188,
        PAGEUP: 33,
        PAGEDOWN: 34,
        BACKSPACE: 8,
        SHIFT: 16
    };
    
    /**
     * 
     * @param {type} optSel
     * @param {type} butSel
     * @param {type} hidSel
     * @param {type} showFilter
     * @param String prompt
     * @returns {undefined}
     */
    $.fn.combo = function(optSel, butSel, hidSel, showFilter, prompt) {
        var keyboard = {
            active: false,
            timer: 0,
            buffer: ''
        };

        var controls = {
            $textBox: $(this),
            $filter: $('input.easy-combo-box-options-filter', $(optSel)),
            $options: $('div.easy-combo-box-options-list', $(optSel)),
            $button: $(butSel),
            $hidden: $(hidSel),
            showFilter: showFilter,
            isFiltered: false,
            prompt: prompt
        };
        
        // have the filter field match the width of the $textBox
//        controls.$filter.css('width', controls.$textBox.css('width'));
//         controls.$filter.css('max-width', controls.$textBox.css('max-width'));
        controls.$filter.css('width', controls.$textBox.outerWidth());
        controls.$filter.css('max-width', controls.$textBox.outerWidth());
        controls.$filter.css('height', controls.$textBox.outerHeight());
        controls.$filter.css('max-height', controls.$textBox.outerHeight());
            
        $(controls.$options).unbind('mousemove').mousemove(
                function() {
                    keyboard.active = false;
                }
        );

        $('div', controls.$options).unbind('hover').hover(
                function(event) {
                    if (!keyboard.active) {
                        $('div', controls.$options).removeClass("highlight");
                        $(this).addClass("highlight");
                    }
                },
                function(event) {
                    if (!keyboard.active) {
                        $(this).removeClass("highlight");
                    }
                }
        );

        $('div', controls.$options).unbind('mousedown').mousedown(function(event) {
            event.preventDefault();       
            controls.$textBox.focus();
            updateTextBox(controls.$textBox, controls.$hidden, $(this));       
            hideOptions(controls); 
            
            if (keyboard.timer !== 0) {
                window.clearTimeout(keyboard.timer);
                keyboard.timer = 0;
            }
            
        });

        controls.$textBox.unbind('click').click(function(event) {
            showOptions(controls);
            
            if (controls.showFilter) {
                controls.$filter.mousedown();
                controls.$filter.focus();
                controls.$filter.val(controls.$textBox.val());
                controls.$filter.select();
            }
        });

        controls.$button.unbind('click').click(function(event) {
            controls.$options.toggle();

            if (controls.$options.is(":visible")) {
                highlightByText(controls.$options, controls.$textBox.val());
            }
        });
        
        // this if statement was added to avoid the options from  hiding when the scrollbar is clicked and the filter is not set.
        if (controls.$filter.length !== 0) {
            controls.$textBox.unbind('blur').blur(function(event) {
                if ($.lastClicked !== null && !$.lastClicked.is(controls.$filter)) {
                    hideOptions(controls);
                }
            });
        }
        else {
            controls.$textBox.unbind('blur').blur(function(event) {
                if ($.lastClicked !== null && !$.lastClicked.is(controls.$options)) {
                    hideOptions(controls);
                }
            });
        }
        
        if (controls.showFilter) {
            controls.$filter.unbind('blur').blur(function(event) {
                // The wrapping if statement was added to get around the following issue:
                // The blur event of the $filter textbox should not fire just by clicking the scrollbar
                // of the options list, but in IE, it does.  So we get around this by only hiding the
                // options list if the user clicked something other than the list (such as one of the items in it).
                if ($.lastClicked !== null && !$.lastClicked.hasClass("easy-combo-box-options-list")) {
                    hideOptions(controls);
                }
            });

            controls.$filter.unbind('keyup').keyup(function(event) {

                if ($(this).val() === '') {
                    resetFilter(controls);
                }
                else {
                    filter(controls, $(this).val());
                    controls.isFiltered = true;
                }

                switch (event.keyCode) {
                    case KEY.TAB:
                        hideOptions(controls);
                        break;

                    default:
                        event.preventDefault();
                        break;
                }

            });

            controls.$filter.unbind('keydown').keydown(function(event) {
                if (!handleListNav(event, controls, keyboard)) {
                    switch (event.keyCode) {
                        case KEY.TAB:
                            hideOptions(controls);
                            controls.$textBox.focus();
                            break;

                        case KEY.RETURN:
                            event.preventDefault();
                            if (controls.prompt !== "") {
                                var $h = $('.highlight', controls.$options);
                                
                                if ($h.size() === 1) {
                                    updateTextBox(controls.$textBox, controls.$hidden, $h);
                                }
                            }
                            controls.$textBox.focus();
                            controls.$textBox.scrollLeft(0);
                            hideOptions(controls);
                            break;

                        case KEY.ESC:
                            hideOptions(controls);
                            controls.$textBox.focus();
                            break;
                    }
                }
            });
        }

        controls.$textBox.unbind('keydown').keydown(function(event) {
            // if this is a filterable dropdown, keypresses should be forwarded
            // to the filter box
            if (controls.showFilter) {
                switch (event.keyCode) {
                    case KEY.TAB:
                        hideOptions(controls);
                        break;
                        
                    default:
                        
                        showOptions(controls);
                        controls.$filter.mousedown();
                        controls.$filter.keyup(event);
                        controls.$filter.focus();
                        break;
                }
            }
            else {
            
                // if the options are about to pop up then select the appropriate 
                // option
                if (controls.$options.is(":visible") === false) {
                    highlightByText(controls.$options, controls.$textBox.val());
                }

                if (!handleListNav(event, controls, keyboard, false)) {
                    switch (event.keyCode) {
                        case KEY.TAB:
                            hideOptions(controls);
                            break;

                        case KEY.SHIFT:
                            event.preventDefault();
                            break;

                            // matches also semicolon
                        case KEY.RETURN:
                            event.preventDefault();
                            hideOptions(controls);
                            break;

                        case KEY.ESC:
                            hideOptions(controls);
                            break;

                        default:
                            event.preventDefault();
                            handleKeys(event, controls, keyboard);
                            break;
                    }
                }
            }
            
            return this;
        });

        if (findOptionByCode(controls.$options, controls.$hidden.val()).length === 0) {
            controls.$hidden.val('');
        }
    };

    /**
     * 
     * @param {type} event
     * @param {type} controls
     * @param {type} keyboard
     * @returns {undefined}
     */
    function handleListNav(event, controls, keyboard) {
        var wasHandled = true;
        
        switch (event.keyCode) {
            case KEY.UP:
                event.preventDefault();
                keyboard.active = true;
                var $m = moveHighlight(controls.$options, -1, controls.isFiltered);
                
                if (controls.prompt === "") {
                    updateTextBox(controls.$textBox, controls.$hidden, $m);
                }
                break;

            case KEY.DOWN:
                event.preventDefault();
                keyboard.active = true;
                var $m = moveHighlight(controls.$options, 1, controls.isFiltered);
                        
                if (controls.prompt === "") {
                    updateTextBox(controls.$textBox, controls.$hidden, $m);
                }
                break;

            case KEY.PAGEUP:
                event.preventDefault();
                keyboard.active = true;
                var $m = moveHighlight(controls.$options, -8, controls.isFiltered);
                
                if (controls.prompt === "") {
                    updateTextBox(controls.$textBox, controls.$hidden, $m);
                }
                break;

            case KEY.PAGEDOWN:
                event.preventDefault();
                keyboard.active = true;
                var $m = moveHighlight(controls.$options, 8, controls.isFiltered);
                        
                if (controls.prompt === "") {
                    updateTextBox(controls.$textBox, controls.$hidden, $m);
                }
                break;
                
            default:
                wasHandled = false;
                break;
        }

        if (wasHandled && !controls.isFiltered && controls.$filter.val() !== '') {
            controls.$filter.val('');
        }
        
        return wasHandled;
    }
    
    /**
     * 
     * @param {type} controls
     * @returns {undefined}
     */
    function showOptions(controls) {
        if (controls.$options.is(":visible") === false) {
            highlightByText(controls.$options, controls.$textBox.val());
            
            // position the options
            // show the options div just below the text box    
            var tbOffset = findOptionsPosition(controls);   
            var fOffset = controls.$textBox.offset();

            // show the options before moving into position.
            // It doesn't work in reverse.
            controls.$options.show();
            
            if (controls.showFilter) {
                controls.$filter.show();
                controls.$filter.offset(fOffset);
            }
        
            controls.$options.offset(tbOffset);
        }
        else {
            hideOptions(controls);            
        }
    }
    
    /**
     * 
     * @param {type} controls
     * @returns {undefined}
     */
    function findOptionsPosition(controls) {
        var tbOffset = controls.$textBox.offset();
        
        var bottom = tbOffset.top + controls.$textBox.outerHeight() 
                    + controls.$options.outerHeight();
        var right = tbOffset.left + controls.$options.outerWidth();
        
        if (bottom > ($(window).scrollTop() + window.innerHeight)) {
            // show above
            tbOffset.top -= controls.$options.outerHeight();
        }
        else {
            // show below
            tbOffset.top += controls.$textBox.outerHeight();
        }

        if (right > ($(window).scrollLeft() + window.innerWidth)) {
            // show above
            tbOffset.left = ($(window).scrollLeft() + window.innerWidth) - controls.$options.outerWidth();
        }
        
        return tbOffset;
    }

    /**
     * 
     * @param {type} controls
     * @returns {undefined}
     */
    function hideOptions(controls) {
        controls.$options.hide();
            
        if (controls.showFilter) {
            controls.$filter.val('');
            resetFilter(controls);
            controls.$filter.hide();
        }
        
        resetPrompt(controls);
    }
    
    /**
     * 
     * @param {type} controls
     * @returns {undefined}
     */
    function resetPrompt(controls) {
        if (controls.prompt !== "") {
            controls.$textBox.val(controls.prompt);
            controls.$hidden.val('');
        }
    }

    /**
     * 
     * @param {type} $options
     * @param {type} text
     * @returns {Array|$}
     */
    function findOptionByValue($options, text) {
        var $opt = [];

        $('div', $options).each(
                function() {
                    if ($(this).text() === text) {
                        $opt = $(this);
                        return false;
                    }

                    return true;
                }
        );

        return $opt;
    }

    /**
     * 
     * @param {type} $options
     * @param {type} code
     * @returns {Array|$}
     */
    function findOptionByCode($options, code) {
        var $opt = [];

        $('div', $options).each(
                function() {
                    if ($(this).attr('value') === code) {
                        $opt = $(this);
                        return false;
                    }

                    return true;
                }
        );

        return $opt;
    }

    /**
     * 
     * @param {type} $options
     * @param {type} text
     * @returns {Array|$|type}
     */
    function highlightByText($options, text) {
        var $h = findOptionByValue($options, text);

        $('div', $options).removeClass('highlight');

        if ($h.length > 0) {
            $h.addClass('highlight');
        }

        positionScroll($options, $h);
        return $h;
    }

    /**
     * 
     * @param {type} $options
     * @param {type} option
     * @returns {$}
     */
    function highlightByOption($options, option) {
        var $h = $(option);

        $('div', $options).removeClass('highlight');

        if ($h.length > 0) {
            $h.addClass('highlight');
        }

        positionScroll($options, $h);
        return $h;
    }

    /**
     * 
     * @param {type} $options
     * @param {type} n
     * @param {type} isFiltered
     * @returns {$t|$}
     */
    function moveHighlight($options, n, isFiltered) {
        var $h = $('.highlight', $options);
        var $m;
        var allOptions = $('div:visible', $options);

        if ($h.length === 0) {
            // highlight the first entry
            var ft = allOptions[0];
            $m = $(ft);
        }
        else {
            // If this is not a filtered dropdown, do things the cheap way
            if (!isFiltered) {
                if (n > 0) {
                    $m = next($h, n);
                }
                else if (n < 0) {
                    $m = previous($h, n * -1);
                }
            }
            // Otherwise we need to be a bit more clever
            else {
                var i = Math.max(0, allOptions.index($h) + n);
                i = Math.min(allOptions.size() - 1, i);

                $m = $(allOptions[i]);
            }
        }

        $h.removeClass('highlight');
        $m.addClass('highlight');
        positionScroll($options, $m);
        return $m;
    }

    /**
     * 
     * @param {type} $textBox
     * @param {type} $hidden
     * @param {type} option
     * @returns {undefined}
     */
    function updateTextBox($textBox, $hidden, option) {
        var $h = $(option);

        if ($h.length > 0) {
            var oldTxt = $textBox.val();
            var oldHid = $hidden.val();            
            
            $textBox.val(stripCode($h.html()));
            $hidden.val($h.attr('value'));
            
            // Fire the onchange events so programmers know when the 
            // values have changed.
            if ($textBox.val() !== oldTxt) {
                $textBox.change();
                
                // scroll to beginning
                // commented out this line because IE8 compatibility - 23-Jan-15
                //$textBox[0].setSelectionRange(0, 0);
            }

            if ($hidden.val() !== oldHid) {
                $hidden.change();
            }
        }
        
        $textBox.scrollLeft(0);
    }

    /**
     * 
     * @param {type} event
     * @param {type} controls
     * @param {type} keyboard
     * @returns {undefined}
     */
    function handleKeys(event, controls, keyboard) {
        if ((event.keyCode >= 48 && event.keyCode <= 57) ||
                (event.keyCode >= 65 && event.keyCode <= 90)) {
            keyboard.buffer += String.fromCharCode(event.keyCode);

            window.clearTimeout(keyboard.timer);

            keyboard.timer = window.setTimeout(
                    function() {
                        keyboard.buffer = "";
                    }, 2000);

            //console.log("Keyboard buffer -> " + keyboard.buffer)
            var option = search(controls.$options, keyboard.buffer);

            if (typeof option !== 'undefined') {
                highlightByOption(controls.$options, option);
                if (controls.prompt === "") {
                    updateTextBox(controls.$textBox, controls.$hidden, option);
                }
            }
            else {
                keyboard.buffer = '';
            }
        }
    }

    /**
     * 
     * @param {type} $options
     * @param {type} $active
     * @returns {undefined}
     */
    function positionScroll($options, $active) {
        var offset = 0;

        if ($active.length === 0) {
            return;
        }
        var activeIndex = $active.index();

        $('div', $options).slice(0, activeIndex).each(
                function(idx) {
                    offset += this.offsetHeight;
                }
        );

        if ((offset + $active[0].offsetHeight - $options.scrollTop()) > $options[0].clientHeight) {
            $options.scrollTop(offset + $active[0].offsetHeight - $options.innerHeight());
        }
        else if (offset < $options.scrollTop()) {
            $options.scrollTop(offset);
        }
    }

    /**
     * 
     * @param {type} $i
     * @param {type} n
     * @returns {$t}
     */
    function previous($i, n) {
        var $p = $i;
        var i = 0;

        if ($p.length > 0) {
            for (i = 0; i < n; i++) {
                $t = $p.prev();

                if ($t.length > 0) {
                    $p = $t;
                }
                else {
                    break;
                }
            }
        }

        return $p;
    }

    /**
     * 
     * @param {type} $i
     * @param {type} n
     * @returns {$t}
     */
    function next($i, n) {
        var $x = $i;
        var i = 0;

        if ($x.length > 0) {
            for (i = 0; i < n; i++) {
                $t = $x.next();

                if ($t.length > 0) {
                    $x = $t;
                }
                else {
                    break;
                }
            }
        }

        return $x;
    }

    /**
     * 
     * @param {type} $options
     * @param {type} text
     * @returns {_L6.search}
     */
    function search($options, text) {
        var o;

        $('div', $options).each(
                function() {
                    var txt = $(this).text();
                    //console.log("Compare -> " + txt + " = " + text);

                    if (txt.indexOf(text) === 0) {
                        o = this;
                        return false;
                    }

                    return true;
                }
        );

        return o;
    }

    /**
     * 
     * @param {type} controls
     * @param {type} text
     */
    function filter(controls, text) {
        var foundRows = new Array();
        var foundExact = false;
        
        text = text.toLowerCase();
        $('div', controls.$options).each(
            function() {
                if (!foundExact) {
                    var strings = new Array();
                    var txt = $(this).text().toLowerCase();

                    if (txt.indexOf('</span>') > 0) {
                        txt = txt.slice(txt.indexOf('>') + 1);
                        strings = txt.split('</span>');
                    }
                    else {
                        strings[0] = txt;
                    }

                    if (strings[0] === text) {
                        //Hide the rows we've already processed
                        for (var i = 0; i < foundRows.length; i++) {
                            foundRows[i].hide();
                        }

                        // Clear foundRows and add this row
                        foundRows.length = 0;
                        foundRows.push($(this));
                        
                        // Set foundExact so we can cheaply hide future rows
                        foundExact = true;
                    }
                    // Else there are still
                    else {
                        var arrayLength = strings.length;
                        for (var i = 0; i < arrayLength; i++) {
                            if (strings[i].indexOf(text) >= 0) {
                                foundRows.push($(this));
                                break;
                            }
                            else {
                                $(this).hide();
                            }
                        }
                    }
                }
                else {
                    $(this).hide();
                }
            }
        );
        
        if (foundRows.length === 1) {
            controls.$filter.removeClass('error');
            foundRows[0].show();
            highlightByOption(controls.$options, foundRows[0]);
            
            if (controls.prompt === "") {
                updateTextBox(controls.$textBox, controls.$hidden, foundRows[0]);
            }
            
        }
        else if (foundRows.length > 0) {
            controls.$filter.removeClass('error');
            
            for (var i = 0; i < foundRows.length; i++) {
                foundRows[i].show();
            }
        }
        else {
            controls.$filter.addClass('error');
        }
        
        var $h = $('.highlight', controls.$options);
        
        if ($h.length > 0) {
            positionScroll(controls.$options, $h);
        }
        else {
            controls.$options.scrollTop(0);
        }
           
        controls.$options.offset(findOptionsPosition(controls));
    }

    /**
     * 
     * @param {type} controls
     */
    function resetFilter(controls) {
        $('div', controls.$options).each(
                function() {
                    $(this).show();
                }
        );

        var $h = $('.highlight', controls.$options);

        if ($h.length > 0) {
            positionScroll(controls.$options, $h);
        }
        controls.isFiltered = false;
        controls.$filter.removeClass('error');
    }
    
    /**
     * 
     * @param {String} html
     */
    function stripCode(html) {
        if (html.indexOf('>') >= 0) {
            html = html.substr(html.lastIndexOf('>') + 1, html.length);
        }
        
        return html;
    }
}(jQuery));