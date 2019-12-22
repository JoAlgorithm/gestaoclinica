import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContaRecebidaComponent } from './conta-recebida.component';

describe('ContaRecebidaComponent', () => {
  let component: ContaRecebidaComponent;
  let fixture: ComponentFixture<ContaRecebidaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContaRecebidaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContaRecebidaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
