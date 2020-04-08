// ~/control/testRunFilteringSelect
// wrapper around FilteringSelect specialized for handling test run summaries
// REST API: https://docs.google.com/a/premiumpower.com/spreadsheet/ccc?key=0Ary3LPbE9ib5dEY4NUM5cXlfMkdVZ0VtWFRuMElwUmc&usp=sharing
// REST resource - ref obj list:
//  ~/test-run-summary  -  ~\trunk\web\Server\ppcJs\tests\getTestRunSummaries.json

define(['dojo/_base/declare', 'dojo/_base/lang', 'dojo/_base/array',
        'dojo/store/Memory', 'dijit/form/FilteringSelect', '../utilities/DateString',
        './_Control', 'dojo/text!./testRunFilteringSelect/template/testRunFilteringSelect.html'],
function (declare, lang, array,
        Memory, FilteringSelect, DateString,
        _Control, template) {
    return declare([_Control],
    {
        // dijit variables
        name: 'Test Run Filtering Select',
        templateString: template,
        baseClass: 'testRunFilteringSelect',


        // Control API overrides
        configure: function (/*ref: getTestRunSummaries.json*/items, /*Dictionary*/testRunMap) {
            var testRunInMemStore = this._createTestRunInMemStoreAndMap(items, testRunMap);

            this.testRunSelect.set('store', testRunInMemStore);
            this.testRunSelect.set('queryExpr', '*${0}*');
        },

        // returns selected test run ID from items in configure()
        getValue: function () {
            return this.testRunSelect.get('value');
        },


        // private methods
        // returns an in-memory story for real-time filtered queries
        _createTestRunInMemStoreAndMap: function (/*jsonobject[]*/items, /*Dictionary*/testRunMap) {
            var data = new Array();
            array.forEach(items, function (item) {
                var dateTime = DateString.toDateTime(item.timeStamp * 1000);
                lang.mixin(item, { dateTime: dateTime });
                var description = dateTime + ', ' + item.systemName + ' : ' + item.subsystemName;
                data.push({ name: description, id: item.testRunId });

                testRunMap.add(item.testRunId, item);
            }, this);

            var testRunInMemStore = new Memory({
                data: data
            });

            return testRunInMemStore;
        },


        // event handlers
        _onSelectChange: function (testRunId) {
            this.onChange(testRunId);
        },


        // public events
        onChange: function (testRunId) {
        }
    });
});