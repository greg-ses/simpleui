// ~/utilities/Json
// value/object agnostic JSON conversion wrappers

define(['dojo/json', './Identity'],
function (json, Identity) {
    return {
        deserialize: function(item) {
            try {
                item = json.parse(item);
            }
            catch (err) { }

            return item;
        },

        serialize: function (item) {
            return (Identity.isObject(item)) ? json.stringify(item) : item;
        }
    };
});