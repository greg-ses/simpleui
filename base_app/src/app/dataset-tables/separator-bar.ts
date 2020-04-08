import { Component } from '@angular/core';

@Component({
    selector: 'separator-bar',
    template: `
<table border="2" cellpadding="0" cellspacing="0" width="100%">
  <tr>
    <td bgcolor="#000099" align="center" valign="bottom">
      <table border="0" cellpadding="0" cellspacing="3" width="100%">
        <tr>
          <td>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
`
})

// The common page layout with id tags for js
export class SeparatorBarComponent {
}
