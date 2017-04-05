$.widget( "wtw.changeDelete", {
    // CHANGE Delete.

    _create: function() {
        var self = this;
        var template = Handlebars.compile($(self.options.config.template.delete).html());
        var $delete = $(template(self.options.change));
        $delete.insertBefore(this.element);
    },


});
