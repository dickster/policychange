(function() {

    // SHIM required because IE doesn't support jack. jeez louise.
    if (!String.prototype.endsWith) {
        String.prototype.endsWith = function(searchString, position) {
            var subjectString = this.toString();
            if (typeof position !== 'number' || !isFinite(position) || Math.floor(position) !== position || position > subjectString.length) {
                position = subjectString.length;
            }
            position -= searchString.length;
            var lastIndex = subjectString.lastIndexOf(searchString, position);
            return lastIndex !== -1 && lastIndex === position;
        };
    }

    if (!Number.isInteger) {
        Number.isInteger = Number.isInteger || function (value) {
                return typeof value === "number" &&
                    isFinite(value) &&
                    Math.floor(value) === value;
            };
    }

})();
