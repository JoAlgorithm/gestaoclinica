import { TestBed, inject } from '@angular/core/testing';

import { EstoqueService } from './estoque.service';

describe('EstoqueService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [EstoqueService]
    });
  });

  it('should be created', inject([EstoqueService], (service: EstoqueService) => {
    expect(service).toBeTruthy();
  }));
});
