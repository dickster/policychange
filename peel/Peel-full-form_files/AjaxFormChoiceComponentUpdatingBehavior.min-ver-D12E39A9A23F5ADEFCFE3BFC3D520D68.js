(function(a){if(typeof(Wicket.Choice)==="undefined"){Wicket.Choice={};Wicket.Choice.acceptInput=function(d,c){var b=c.event.target;return(b.name===d)};Wicket.Choice.getInputValues=function(e,d){var b=[],c=d.event.target;var h=Wicket.$(d.c).getElementsByTagName("input");for(var f=0;f<h.length;f++){var g=h[f];if(g.name!==e){continue}if(!g.checked){continue}var j=g.value;b.push({name:e,value:j})}return b}}})();