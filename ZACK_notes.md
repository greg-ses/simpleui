# ideas

- [x] Click happens during `ngIf` reload
- [ ] Click is delayed by mem leak



# Click happens during `ngIf` reload of component
- only on normal tab page
- `ngOnInit` and `ngOnChanges` happens every data request


[https://dzone.com/articles/how-to-use-change-detection-in-angular](https://dzone.com/articles/how-to-use-change-detection-in-angular)

# thoughts
1. difference between `onPush` and `default`
2. can we do change detection with `markForChange` or `detectChanges`?


# How to test?
1. get a button
   1. the id of the button element is the same as the u_id
   2. get button coordinates
   3. put mouuse over coordinates
   4. click coordinates `x` times within `y` amount of time
   5. with each click, check if HTML button is on the dom


```javascript

const get_current_mouse_coords = (event) => {
    var mouse_x = event.clientX;
    var mouse_y = event.clientY;
    console.log(mouse_x, mouse_y)
}
document.addEventListener("mousemove", get_current_mouse_coords);



const does_button_exist = (ID) => {
    return document.getElementById(ID);
}

const click_via_coords = (x, y) => {
    let event = new MouseEvent('click', {
        'view': window,
        'bubbles': true,
        'cancelable': true,
        'screenX': x,
        'screenY': y
    });
    let element = document.elementFromPoint(x, y);
    //console.log(element);
    element.dispatchEvent(event);
}

const calc_percent = (val, total) => {
    return (val / total) * 100;
}


const BUTTON_ID = "2032"; // redo btn in dev env
const TOTAL_CLICKS = 10000;
window['clicked'] = 0;
var clicked_nothing = 0;
const MOUSE_X = 117;
const MOUSE_Y = 296;


for (let iter = 0; iter < TOTAL_CLICKS; iter++) {
    // click on coords
    click_via_coords(MOUSE_X, MOUSE_Y);
    if (!does_button_exist(BUTTON_ID)) {
        clicked_nothing++;
    }
}

console.log(`clicked button: ${window['clicked']} \t ${calc_percent(window['clicked'], TOTAL_CLICKS)}%`);
console.log(`missed button: ${clicked_nothing} \t ${calc_percent(clicked_nothing, TOTAL_CLICKS)}%`);

function fail_test(BUTTON_ID="2032", MOUSE_X=117, MOUSE_Y=296, TOTAL_CLICKS=10_000) {
    const does_button_exist = (ID) => {
        return document.getElementById(ID);
    }

    const click_via_coords = (x, y) => {
        let event = new MouseEvent('click', {
            'view': window,
            'bubbles': true,
            'cancelable': true,
            'screenX': x,
            'screenY': y
        });
        let element = document.elementFromPoint(x, y);
        //console.log(element);
        element.dispatchEvent(event);
    }

    const calc_percent = (val, total) => {
        return (val / total) * 100;
    }

    let clicked_nothing = 0;
    window['clicked'] = 0;

    for (let iter = 0; iter < TOTAL_CLICKS; iter++) {
        // click on coords
        click_via_coords(MOUSE_X, MOUSE_Y);
        if (!does_button_exist(BUTTON_ID)) {
            clicked_nothing++;
        }
    }

    console.log(`clicked button: ${window['clicked']} \t ${calc_percent(window['clicked'], TOTAL_CLICKS)}%`);
    console.log(`missed button: ${clicked_nothing} \t ${calc_percent(clicked_nothing, TOTAL_CLICKS)}%`);
}

```






```bash
cd /tmp && mysql -h 0.0.0.0 -u sys_mon -pZnBr2 -e "show databases;" && time mysqldump -h0.0.0.0 --databases vnx1000sim_1mw --skip-add-locks --single-transaction  --user=sys_mon --password=ZnBr2 > dumpfile.sql && sed -i 's/vnx1000sim_1mw/junk_db/g' dumpfile.sql && grep -c junk_db dumpfile.sql && mysql -h 0.0.0.0 -u sys_mon -pZnBr2 < dumpfile.sql && mysql -h 0.0.0.0 -u sys_mon -pZnBr2 -e "show databases;"


cat dumpfile.sql | awk '{print(substr($0, 1, 80));}' | more
```








# Changes
1. added `trackby`
2. remove `detattch` from `ngOnInit`
3. remove other `changeDetectionRef` stuff like that

# Where do buttons live
- sections
- cmdsets
- dataset-table


# combos to test
- [ ] button in CmdSet
- [ ] plain data table with no buttons
- [ ] event log
- [ ] button in datatable

# What to change to test
1. non-view meta data (u_id, dest, etc)
2. view data (title, etc)
3. dynamic data (data points, etc)
4. cmds?
5. adding a attribute to an item (adding a class)


# After changes (only `trackby`)

### button in CmdSet
- [ ] constant refresh regardless of change?

| change | change detected? | specific change? |
| ------------------ | --- | --- |
| non-view meta data | yes | desc on button |
| view data          | yes | label of button |
| dynamic data       |  | not applicable |


### plain data table with no buttons
- [ ] constant refresh regardless of change?

| change | change detected? | specific change? |
| ------------------ | --- | --- |
| non-view meta data |  | not applicable |
| view data          | yes | name of dyn |
| dynamic data       | yes | right side value in table |


### event log
- [ ] constant refresh regardless of change?

| change | change detected? | specific change? |
| ------------------ | --- | --- |
| non-view meta data |  | not applicable |
| view data          | yes | changed type |
| dynamic data       |  | not applicable |


### button in datatable
- [ ] constant refresh regardless of change?

| change | change detected? | specific change? |
| ------------------ | --- | --- |
| non-view meta data | yes | tooltip in popup |
| view data          | yes | label on button |
| dynamic data       |  | not applicable |



| element combo | change | change detected? | change details |
| ------------- | ------ | ---------------- | -------------- |
| button in CmdSet |
| plain data table with no buttons |
| event log |
| button in datatable |


| change | button in CmdSet | Plain datatable with no buttons | Event Log | Button in datatable |
| ------ | ---------------- | ------------------------------- | --------- | ------------------- |





# Files / structures to delete
- [ ] DataSetChangeService
- [ ] SectionChangeList
- [ ] ?






















