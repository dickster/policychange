
function addShortcutKeys() {
$("div[accesskey]").each(function(index) {
var key = this.attributes['accesskey'].value;
var $input = $("input:visible:first", this);
if ($input.length > 0) {
$input.attr('accesskey', key);
}
});
}
function showCompany(v) {
var p = $(v).parent();

p.nextAll('.Company').show();
$(v).prevAll('.EntityRadio').removeAttr('checked');

var i = p.nextAll('.Individual');
i.hide();

i.find('.partyInfoFirstName-easy-input').val("");
i.find('.partyInfoMiddleName-easy-input').val("");
i.find('.partyInfoLastName-easy-input').val("");
}
function showPerson(v) {
var p = $(v).parent();

p.nextAll('.Individual').show();
$(v).nextAll('.EntityRadio').removeAttr('checked');

var c = p.nextAll('.Company');
c.hide();

c.find('.partyInfoCommercialName-easy-input').val("");
}
