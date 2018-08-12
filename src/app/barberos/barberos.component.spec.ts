import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BarberosComponent } from './barberos.component';

describe('BarberosComponent', () => {
  let component: BarberosComponent;
  let fixture: ComponentFixture<BarberosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BarberosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BarberosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
