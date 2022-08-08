import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AutoRefreshManager } from './auto-refresh-manager.service';

describe('AutoRefreshManager', () => {
  let component: AutoRefreshManager;
  let fixture: ComponentFixture<AutoRefreshManager>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AutoRefreshManager ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AutoRefreshManager);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
