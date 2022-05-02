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
                <li>Take 1st snapshot<li>Take additional snapshot every 10 sec
                <li>Is memory growing?</ol></td>
            </ol>
        <td>2022-04-27</td>
        <td>Jim Scarsdale</td>
        <td>FAIL</td><br/>Tested with `purification` derived app</td>
    </tr>
    <tr>
        <td> Override of <code>refreshRate in <code>ui.properties.</code></code></td>
        <td>
            <ol>
                <li>edit <code>/var/www/appname/ui.properties</code>
                <br/>Change the value of <code>refreshRate</code> to <code>4000</code> (milliseconds)
                <li>Open app page in <code>Edge</code> or <code>Chrome</code>.
                <li>Do you see the page refresh about every 4 seconds (watch the time)?
            </ol>
        </td>
        <td>2022-04-27</td>
        <td>Jim Scarsdale</td>
        <td>SUCCESS<br/></td>
    </tr>                                                                                                     
    <tr>
        <td> Override of <code>minutesBeforeAutoPageReload</code> in <code>ui.properties.</code></td>
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
        <td>SUCCESS<br/>Note that <code>minutesBeforeAutoPageReload</code> was renamed from <code>autoRefreshTimeout</code>.
            Occurrences of the old name in <code>ui.properties</code>files will need to be updated.</td>
    </tr>                                                                                                     
    <tr>
        <td>miniConsole feature: <code>_trackClicks</code></td>
        <td>
            <ol>
                <li>[steps here...]
            </ol>
        </td>
        <td>yyyy-mm-yy</td>
        <td>[name]</td>
        <td>[FAIL | SUCCESS]<br/>[comment...]</td>
    </tr>                                                                                                     
    <tr>
        <td><code>[new test]</code></td>
        <td>
            <ol>
                <li>[steps here...]
            </ol>
        </td>
        <td>yyyy-mm-yy</td>
        <td>[name]</td>
        <td>[FAIL | SUCCESS]<br/>[comment...]</td>
    </tr>                                                                                                     
</tbody>
</table>

# Automated Tests
`TODO`
