import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContaReceberComponent } from './conta-receber.component';

describe('ContaReceberComponent', () => {
  let component: ContaReceberComponent;
  let fixture: ComponentFixture<ContaReceberComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContaReceberComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContaReceberComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
