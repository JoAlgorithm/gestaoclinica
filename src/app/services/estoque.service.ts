import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { AuthService } from './auth.service';
import { UnidadeMedida } from '../classes/un';
import { Deposito } from '../classes/deposito';
import { Medicamento } from '../classes/medicamento';
import { MovimentoEstoque } from '../classes/movimento_estoque';

@Injectable()
export class EstoqueService {

  constructor(private db: AngularFireDatabase, private authService: AuthService) {
  }

  //Retorna a lista de unidades de medida
  getUNs() {
    return this.db.list('clinicas/'+this.authService.get_clinica_id + '/uns');
  }

  //Cadastra unidades de medida
  createUN(un: UnidadeMedida){
    return this.db.list('clinicas/'+this.authService.get_clinica_id + '/uns').push(un);
  }
  updateUN(un: UnidadeMedida){
    return this.db.list('clinicas/'+this.authService.get_clinica_id + '/uns').update(un.id, un);
  }
  //Retorna a lista de depositos
  getDepositos() {
    return this.db.list('clinicas/'+this.authService.get_clinica_id + '/depositos');
  }

  //Cadastra depositos
  createDeposito(dp: Deposito){
    return this.db.list('clinicas/'+this.authService.get_clinica_id + '/depositos').push(dp);
  }

  updateDeposito(dp: Deposito){
    return this.db.list('clinicas/'+this.authService.get_clinica_id + '/depositos').update(dp.id, dp);
  }


  //Retorna de medicamentos
  getMedicamentos() {
    return this.db.list('clinicas/'+this.authService.get_clinica_id + '/medicamentos');
  }

  //Cadastra medicamentos
  createMedicamento(md: Medicamento){
    return this.db.list('clinicas/'+this.authService.get_clinica_id + '/medicamentos').push(md);
  }

  updateMedicamentos(md: Medicamento){
    return this.db.list('clinicas/'+this.authService.get_clinica_id + '/medicamentos').update(md.id, md);
  }

  //Retorna de categorias de medicamentos
  getCategoriasMedicamento() {
    return this.db.list('clinicas/'+this.authService.get_clinica_id + '/categoriasmedicamentos');
  }

  //Cadastra medicamento no deposito
  addMedicamentoDeposito(mvt: MovimentoEstoque){
    return this.db.list('clinicas/'+this.authService.get_clinica_id + '/depositos/'+mvt.deposito.id+'/medicamentos/').update(mvt.medicamento.id, mvt.medicamento);
  }

  //Cadastra movimento no medicamento
  addMovimentoItem(mvt: MovimentoEstoque){
    return this.db.list('clinicas/'+this.authService.get_clinica_id + '/medicamentos/'+mvt.medicamento.id+'/movimentos/').push(mvt);
  }

  //Cadastra movimentos na tbl de movimentos
  addMovimento(mvt: MovimentoEstoque){
    return this.db.list('clinicas/'+this.authService.get_clinica_id + '/estoquesmovimentos/').push(mvt);
  }

  getMovimentos() {
    return this.db.list('clinicas/'+this.authService.get_clinica_id + '/estoquesmovimentos');
  }

}
