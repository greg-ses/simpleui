import { AppComponent } from '../app.component';
import { AppTabNormalComponent } from '../app-tab-normal/app-tab-normal.component'
import { AppTabOverlayComponent } from '../app-tab-overlay/app-tab-overlay.component'
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommandButtonComponent } from '../command-button/command-button';
import { CUSTOM_ELEMENTS_SCHEMA, DebugElement } from '@angular/core';
import { ImageOverlaysComponent } from '../app-tab-overlay/image-overlays';
import { OverlayCmdBarComponent } from '../app-tab-overlay/overlay-cmd-bar';
import { OverlayPageComponent } from '../app-tab-overlay/overlay-page';
import { DatasetTableComponent } from './dataset-table';
import { PortalModule } from '@angular/cdk/portal';
import { MatTabsModule } from '@angular/material/tabs';
import { PropDefinedTableComponent } from '../prop-defined-table/prop-defined-table';
import { CommonModule } from '@angular/common';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

/** Button events to pass to `DebugElement.triggerEventHandler` for RouterLink event handler */
export const ButtonClickEvents = {
    left:  { button: 0 },
    right: { button: 2 }
};

/** Simulate element click. Defaults to mouse left-button click event. */
export function click(el: DebugElement | HTMLElement, eventObj: any = ButtonClickEvents.left): void {
    if (el instanceof HTMLElement || el instanceof HTMLInputElement) {
        el.click();
    } else {
        el.triggerEventHandler('click', eventObj);
    }
}

/**
 * Polls an escape function. Once the escape function returns true, executes a run function.
 * @param {Function} escapeFunction A function that will be repeatedly executed and should return
 * true when the run function should be called.
 * @param {number} checkDelay Number of milliseconds to wait before checking the escape function
 * again.
 * @returns {{then: Function}} The run function should be registered via the then method.
 *
 * Usage:
 * waitUntil(function() { return true }).then(function() { // do my thing });
 */
function waitUntil (escapeFunction, checkDelay = 100) {
    let _runFunction;

    const interval = setInterval(function() {
        if (escapeFunction()) {
            clearInterval(interval);

            if (_runFunction) {
                _runFunction();
            }
        }
    }, checkDelay || 1);

    return {
        then: function(runFunction) {
            _runFunction = runFunction;
        }
    };
}

function findInputElementByName(name: string) {
    const inputs = document.getElementsByTagName('input');
    for (let i = 0; i < inputs.length; i++) {
        if (inputs[i].name === name) {
            return inputs[i];
        }
    }
    return null;
}


class Page {
    fixture: ComponentFixture<AppComponent>;

    // getter properties wait to query the DOM until called.
    get inputs()       { return <HTMLInputElement[]> this.fixture.nativeElement.getElementsByTagName('input'); }
    get dbPulseButton() {
        return this.getElementByName<HTMLInputElement>('input', 'dbPulse');
    }
    get remoteButton()  {
        return this.getElementByName<HTMLInputElement>('input', 'Remote');
    }

    get divs()          {
        return this.queryAll<HTMLElement>('div');
    }

    get appTitleDiv()   {
        return this.getElementByName<HTMLInputElement>('div', 'appTitle');
    }

    get activeTab()     {
        return this.fixture.nativeElement.querySelector('.mat-tab-label-active');
    }

    // gotoListSpy: jasmine.Spy;
    // navigateSpy:  jasmine.Spy;

    constructor(fixture: ComponentFixture<AppComponent>) {
        this.fixture = fixture;
        // get the navigate spy from the injected router spy object
        // const routerSpy = <any> fixture.debugElement.injector.get(Router);
        // this.navigateSpy = routerSpy.navigate;

        // spy on component's `gotoList()` method
        // const component = fixture.componentInstance;
        // this.gotoListSpy = spyOn(component, 'gotoList').and.callThrough();
    }

    //// query helpers ////
    private query<T>(selector: string): T {
        return this.fixture.nativeElement.querySelector(selector);
    }

    private queryAll<T>(selector: string): T[] {
        return this.fixture.nativeElement.querySelectorAll(selector);
    }

    private getElementByName<T>(tagName: string, name: string) {

        const elementArray: Array<T> = this.fixture.nativeElement.querySelectorAll(tagName);

        for (let i = 0; i < elementArray.length; i++) {
            if (typeof elementArray[i]['name'] === 'string' && elementArray[i]['name'] === name) {
                return <T>elementArray[i];
            }
        }
        return null;
    }
}

describe('TitleBarTest', () => {
    let component: AppComponent = null;
    let fixture: ComponentFixture<AppComponent> = null;;
    let page: Page = null;
    let httpMockBackend: HttpTestingController;

    beforeEach(() => {

        TestBed.configureTestingModule({
            declarations: [
                AppComponent,
                AppTabNormalComponent,
                AppTabOverlayComponent,
                CommandButtonComponent,
                ImageOverlaysComponent,
                DatasetTableComponent,
                OverlayCmdBarComponent,
                OverlayPageComponent,
                PropDefinedTableComponent
            ],
            imports: [
                CommonModule,
                MatTabsModule,
                PortalModule,
                NoopAnimationsModule,
                HttpClientTestingModule
            ],
            schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
        }).compileComponents();
        const commonModule = new CommonModule();
        httpMockBackend = TestBed.inject(HttpTestingController);

        if (fixture === null) {
            fixture = TestBed.createComponent(AppComponent);
            component = fixture.componentInstance;
            page = new Page(fixture);

            // 1st change detection triggers noOnInit which starts the update cycle
            fixture.detectChanges();
            fixture.whenStable().then(() => {
                // 2nd change detection
                fixture.detectChanges();
            });
        }
    });




    it('should have created the AppComponent', () => {
        expect(component).toBeDefined();
    });



    it('should have  _refreshState set to "indicatorOn"', (done) => {
        waitUntil(function() {
            return (component._tBarProps && (component._tBarProps._refreshState === 'indicatorOn'));
        }).then(function() {
            done();
        });
    });


    it('should check that dbPulse element has className "indicatorOn"', () => {
        const dbPulseBtnElement = fixture.debugElement.nativeElement.querySelector('#dbPulse'); // document.getElementById('dbPulse');
        expect(document).toBeDefined();
        expect(page.dbPulseButton).toBeDefined();
        expect(dbPulseBtnElement.className).toEqual('indicatorOn');
    });



    // it ('should receive async result from getProps()', (done) => {
    //     expect(component._propsSubscriptionState).not.toEqual(SubscriptionState.ErrorFromAsyncResponse);

    //     waitUntil( function () {
    //         return component._propsSubscriptionState === SubscriptionState.Idle;
    //     }).then( function() {
    //         done();
    //     });
    // });


//     it('should fill first tab from ajax data', () => {
// //        fixture.whenRenderingDone().then(() => {

//             expect(page.activeTab).toBeDefined();
//             // expect(activeTab.getAttribute('innerText')).toEqual('IO 1');
//             // expect(activeTab.getAttribute('tabindex')).toEqual('0');
// //        });
//     });



    // it('should click dbPulseButton to call onToggleAutoRefresh() to turn updates off', (done) => {
    //     // Turn off auto-refresh
    //     // component.onToggleAutoRefresh();

    //     // fixture.whenStable().then(() => {
    //     //     click(page.dbPulseButton);
    //     // // });

    //     // waitUntil(function() {
    //     //     return ( (component?._tBarProps?._refreshState === 'indicatorOff'));
    //     // }).then(function() {
    //     //     done();
    //     // });

    // });

});
