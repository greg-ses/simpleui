/**
 * Created by jscarsdale on 6/2/16.
 */

// The common page layout with id tags for js
import { AfterViewInit, Component, Input } from '@angular/core';
import { PopupDialogProps } from '../interfaces/popup-dialog-props';

@Component({
    selector: 'error-popup',
    styleUrls: ['./popup-dialog.css'],
    template: `
<div id='error_popup-container-{{_tabId}}' hidden='_props["hidden"]' class='popup-dialog-modal'>
  <div class='popup-dialog-modal-content'>

    <header>
      <span class='titleBar'>&nbsp;{{ _props["title"] }}</span>
      <span (click)='close()' class='closeBtn'>&nbsp;&times;&nbsp;</span>
    </header>
    
    <div id='error-popup-text-{{_tabId}}' class='popup-dialog-text'>{{ _props["text"] }}</div>
    <div id='error-popup-cmd-{{_tabId}}' class='popup-dialog-text'><pre>{{ _lastCommandXmlSent }}</pre></div>
    <div id='error-popup-controls-{{_tabId}}'>
    </div> 
    
    <footer class='error-popup-container'>
      <button (click)='close()'>Close</button>
    </footer>
  </div>
</div>
`
})

export class ErrorPopupComponent implements AfterViewInit {
    @Input() _tabId: string;
    @Input() _PROPS: any;
    _props: PopupDialogProps = new PopupDialogProps(
        '', // callback_source
        true, // this.isPopupHidden(), // hidden
        'Error Message', // title
        'An error occurred.', // text
        [], // controls
        ['Close']  // buttons
    );
    _lastCommandXmlSent: string;
    _savedParentHeight = -1;

    registerLastCommandXmlSent(xml: string) {
        this._lastCommandXmlSent = xml;
    }

    setMinParentHeight() {
        let o = document.getElementById('error-popup');
        if (o) {
            this._savedParentHeight = parseFloat(getComputedStyle(o.parentElement.parentElement, null)['height']);
            if (this._savedParentHeight < 300) {
                o.parentElement.parentElement.style.height = '300px';
            }
        }
    }

    restoreMinParentHeight() {
        let o = document.getElementById('error-popup');
        if (o && this._savedParentHeight > -1) {
            o.parentElement.parentElement.style.height = this._savedParentHeight + 'px';
            this._savedParentHeight = -1;
        }
    }

    show(title: string, msg: string) {
        this._props.title = title;
        this._props.text = msg;
        this.setMinParentHeight();
        this._props.hidden = false;
    }

    close() {
        this._props.hidden = true;
        this.restoreMinParentHeight();
    }

    ngAfterViewInit() {
        if (this._tabId && this._tabId.length
        && this._PROPS && this._PROPS['GLOBAL']
        && this._PROPS['GLOBAL']['registerGlobal'] ) {
           this._PROPS['GLOBAL']['registerGlobal']('error-popup', this._tabId, this);
        }
    }
}
