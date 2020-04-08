let L1s=document.getElementsByClassName('L1');
let L2s=document.getElementsByClassName('L2');
let L3s=document.getElementsByClassName('L3');
let L4s=document.getElementsByClassName('L4');

let L2_14_parentElement = L2s[14].parentElement;

let L2_16_parentElement = L2s[16].parentElement;

L2_14_parentElement.parentElement.tagName
L2_14_parentElement.parentElement.tagName === L2_16_parentElement.parentElement.tagName

L2_14_parentElement.parentElement === L2_16_parentElement;

L2_14_parentElement.parentElement.children[1].innerHTML.replace(/<!--bindings={/g, '').replace(/"ng-reflect-ng-if": "(true|false)"/g, '').replace(/}-->/g, '').replace(/<t/g, '\n<t').replace(/ _ngcontent-c9=""/g, '')