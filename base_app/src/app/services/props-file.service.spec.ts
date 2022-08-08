import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PropsFileService } from './props-file.service';

describe('PropsFileService', () => {
  let component: PropsFileService;
  let fixture: ComponentFixture<PropsFileService>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PropsFileService ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PropsFileService);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
