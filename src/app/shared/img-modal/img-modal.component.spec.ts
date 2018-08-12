import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImgmodalComponent } from './imgmodal.component';

describe('ImgmodalComponent', () => {
  let component: ImgmodalComponent;
  let fixture: ComponentFixture<ImgmodalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ImgmodalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImgmodalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
