$.widget( "wtw.changeAdd", {
    // CHANGE ADD

    _create: function() {
        var self = this;
        var template = Handlebars.compile($(self.options.config.template.add).html());
        var $add = $(template(self.options.change));
        this.element.find('.easy-section-heading:first').append($add);
    },


});
