import { TestBed, inject } from '@angular/core/testing';

import { ConfiguracoesService } from './configuracoes.service';

describe('ConfiguracoesService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ConfiguracoesService]
    });
  });

  it('should be created', inject([ConfiguracoesService], (service: ConfiguracoesService) => {
    expect(service).toBeTruthy();
  }));
});
