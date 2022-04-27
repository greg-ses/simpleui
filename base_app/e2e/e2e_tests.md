---
Title: **SimpleUI base_app (client) end-to-end Tests**

Updated: 2022-04-27

Author: Jim Scarsdale

*To update:* Modify the file under source control at 
```
https://github.com/greg-ses/simpleui/blob/Incremental-improvements/base_app/e2e/e2e-tests.md
```
---

[[_TOC_]]

# Manual Tests
This set of tests is complicated or expensive to automate, and hence are done manually.
<table>
<tbody>
    <tr>
        <th>Test Name</th>
        <th>Test Steps</th>
        <th>Last Validation</th>
        <th>Tested by</th>
        <th>Result / Notes</th>                                  |
    </tr>
    <tr>
        <td>Memory Leak</td>
        <td>
            <ol>
                <li>Open app page in <code>Edge</code> or <code>Chrome</code>.
                <li>`CTRL-SHIFT-I` to start debugger
                <li>Click `Memory` tab
                <li>Take 1st snapshot<li>Tank additional snapshot every 10 sec
                <li>Is memory growing?</ol></td>
            </ol>
        <td>2022-04-27</td>
        <td>Jim Scarsdale</td>
        <td>FAILED</td><br/>Tested with `purification` derived app</td>
    </tr>
    <tr>
        <td> Override of <code>minutesBeforeAutoPageReload</code></td>
        <td>
            <ol>
                <li>edit <code>/var/www/appname/ui.properties</code>
                <br/>Uncomment and change the value of <code>minutesBeforeAutoPageReload</code> to <code>1</code>
                <li>Open app page in <code>Edge</code> or <code>Chrome</code>.
                <li>Do you seen an automatic refresh (page flash) after about 1 minute?
            </ol>
        </td>
        <td>2022-04-27</td>
        <td>Jim Scarsdale</td>
        <td>SUCCESS<br/>Note that <code>minutesBeforeAutoPageReload</code> was renamed from <code>autoRefreshTimeout</code> and will appear with the old name in <code>ui.properties</code>files until they are updated.</td>
    </tr>                                                                                                     
</tbody>
</table>

# Automated Tests
`TODO`
