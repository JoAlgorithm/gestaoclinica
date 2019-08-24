import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PendentesComponent } from './pendentes.component';

describe('PendentesComponent', () => {
  let component: PendentesComponent;
  let fixture: ComponentFixture<PendentesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PendentesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PendentesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
