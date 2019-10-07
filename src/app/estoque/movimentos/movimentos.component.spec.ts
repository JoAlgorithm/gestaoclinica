import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MovimentosComponent } from './movimentos.component';

describe('MovimentosComponent', () => {
  let component: MovimentosComponent;
  let fixture: ComponentFixture<MovimentosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MovimentosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MovimentosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
