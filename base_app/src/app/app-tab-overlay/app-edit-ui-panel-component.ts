import {
    Component
} from '@angular/core';
import {HttpClientModule} from "@angular/common/http";

@Component({
    selector: 'app-edit-ui-panel',
    styleUrls: [],
    templateUrl: './app-edit-ui-panel-components.html',
    providers: [
        HttpClientModule
    ]
})

export
class AppEditUiPanelComponent {
    constructor() {
        AppEditUiPanelComponent.registerEventHandlers();
    }

    static registerEventHandlers() {
        window['onUpdateControl'] = (controlId) => {
            // console.log(`Update ${controlId}...`);
            const top = document.getElementById(`${controlId}-top`);
            const left = document.getElementById(`${controlId}-left`);
            // console.log(`window['onUpdateControl']('${controlId}', ${top['value']}, ${left['value']});`);
            window['updateControl'](controlId, top['value'], left['value']);
        };

        window['onMoveControl'] = (controlId, upPixels, leftPixels) => {
            // console.log(`Update ${controlId}...`);
            const top = document.getElementById(`${controlId}-top`);
            const left = document.getElementById(`${controlId}-left`);
            top['value'] = parseInt(top['value']) - upPixels;
            left['value'] = parseInt(left['value']) - leftPixels;
            // console.log(`window['updateControl']('${controlId}', ${top['value']}, ${left['value']});`);
            window['updateControl'](controlId, top['value'], left['value']);
        };

        window['onMoveArrow'] = (event) => {
            const direction = event.srcElement.id.replace(/(up|down|left|right)___(.*)___.*/g, '$1');
            const controlId = event.srcElement.id.replace(/(up|down|left|right)___(.*)___(.*)/g, '≪$2≫$3');
            let upPixels = 0, leftPixels = 0;
            switch (direction) {
                case 'up': upPixels = 1; break;
                case 'down': upPixels = -1; break;
                case 'left': leftPixels = 1; break;
                case 'right': leftPixels = -1; break;
            }
            if (event.ctrlKey) {
                upPixels *= 5;
                leftPixels *= 5;
            }
            if (event.shiftKey) {
                upPixels *= 2;
                leftPixels *= 2;
            }
            setTimeout( () => window['onMoveControl'](controlId, upPixels, leftPixels), 1);
        };

        window['updateControl'] = (id, top, left) => {
            const qs: HTMLElement = document.querySelector(`#${id}`);
            qs.style.top = `${top}px`;
            qs.style.left = `${left}px`;
            const styles = getComputedStyle(qs);
            let width = parseInt(`${styles.width.replace('px', '')}`, 10);
            width = Math.round(width);
            console.log(`#${id} \
                {position: ${styles.position}; \
                top: ${top}px; \
                left: ${left}px; \
                width: ${width}px; \
                font-size: ${styles.fontSize};}`);
        };
    }

    static getControlList() {
        const tagNames = ['button', 'div', 'img', 'input', 'span'];
        const controlList = [];
        for (const tagName of tagNames) {
            const controls: any = document.getElementsByTagName(tagName);
            for (const control of controls) {
                if ((typeof control.id === 'string') && (control.id.indexOf('≪') > -1)) {
                    controlList.push({'tagName': tagName, 'section': control.id.replace(/≫.*/, '≫'), 'id': control.id, 'element': control});
                }
            }
        }
        return controlList;
    }

    static getSectionNames() {
        // create list of sections. Example section: ≪SystemData≫
        const section = '';
        const sections = [];
        const controlList = AppEditUiPanelComponent.getControlList();
        console.log(`controlList.length: ${controlList.length}`)
        for (const control of controlList) {
            if (sections.indexOf(control.section) === -1) {
                sections.push(control.section);
            }
        }
        return sections.sort();
    }

    create() {
        let sectionOptions = '';
        let selectedAttr = ' selected';
        const sections = AppEditUiPanelComponent.getSectionNames();
        for (const section of sections) {
            sectionOptions += `<option value='${section}'${selectedAttr}>${section}</option>\n`;
            selectedAttr = '';
        }

        let updatePanel = document.getElementById('updatePanel');
        const isNewElement = (updatePanel === null);
        if (isNewElement) {
            updatePanel = document.createElement('div');
        }

        const panelHTML =
`<div id='updatePanel'>
<div id='updatePanelSections' style='background-color: lightgreen'>
<label for='sections'>Sections:</label>
<select id='sections' onchange='AppEditUiPanelComponent.onViewSection(event)'>
${sectionOptions}
</select>
</div>
<div id='controlsInSection'></div>
</div>
`;
        if (isNewElement) {
            document.body.appendChild(updatePanel);
        }

        updatePanel.innerHTML = `${panelHTML}`;
        updatePanel.id = 'updatePanel';
        updatePanel.style.backgroundColor = 'lightgreen';
        updatePanel.style.height = '400px';
        updatePanel.style.left = '1470px';
        updatePanel.style.overflowY = 'scroll';
        updatePanel.style.position = 'absolute';
        updatePanel.style.scrollBehavior = 'smooth';
        updatePanel.style.top = '530px';
        updatePanel.style.zIndex = '100';

        AppEditUiPanelComponent.viewSection(sections[0]);
    } // create()

    static onViewSection(event) {
        const section = event.target.options[event.target.selectedIndex].value;
        setTimeout((newSection = section) => AppEditUiPanelComponent.viewSection(newSection), 1);
    }

    static viewSection(section) {
        const eControlsInSection = document.getElementById('controlsInSection');
        let newHTML =
`<table>
<tr style='background-color: goldenrod'><th>i</th>
<th>tagName</th>
<th>id</th>
<th>top (px)</th>
<th>left (px)</th>
<th>Action</th>
</tr>`;
        const controls = AppEditUiPanelComponent.getControlList();
        let i = 0;
        for (const control of controls) {
            if (control.id.indexOf(section) > -1) {
                const styles = getComputedStyle(control.element);
                const stub = control.id.replace(/[≪≫]/g, '___');
                newHTML +=
`
<tr class=${(i % 2 === 1) ? 'odd' : 'even'}>
  <td>${i}</td>
  <td>${control.tagName}</td>
  <td>${control.id}</td>
  <td>
    <input type='text' id='${control.id}-top' value="${styles['top'].replace("px", '')}">
    <button id="up${control.id.replace(/[≪≫]/g, '___')}" title="Move ${control.id} up." onclick="window.onMoveArrow(event)">↑</button>
    <button id="down${control.id.replace(/[≪≫]/g, '___')}" title="Move ${control.id} down." onclick="window.onMoveArrow(event)">↓</button>
  </td>
  <td>
    <button id="left${control.id.replace(/[≪≫]/g, '___')}" title="Move ${control.id} left." onclick="window.onMoveArrow(event)">←</button>
    <button id="right${control.id.replace(/[≪≫]/g, '___')}" title="Move ${control.id} right." onclick="window.onMoveArrow(event)">→</button>
    <input type="text" id="${control.id}-left" value="${styles['left'].replace('px', '')}">
  </td>
  <td><button id="apply-${control.id.replace(/[≪≫]/g, '___')}"
 name="apply-${control.id}"
 title="Apply top and left changes to ${control.id}"
 onclick="setTimeout(window.onUpdateControl('${control.id}'), 1)">Apply</button>
  </td>
</tr>
`;
            }
            i++;
        }
        newHTML += '</table>';
        eControlsInSection.innerHTML = newHTML;
    }
}
