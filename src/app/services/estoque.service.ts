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
    //return this.db.list('clinicas/'+this.authService.get_clinica_id + '/uns');
    return this.db.list('uns/'+this.authService.get_clinica_id + '/');
  }

  //Cadastra unidades de medida
  createUN(un: UnidadeMedida){
    //return this.db.list('clinicas/'+this.authService.get_clinica_id + '/uns').push(un);
    return this.db.list('uns/'+this.authService.get_clinica_id + '/').push(un);
  }

  //Retorna a lista de depositos
  getDepositos() {
    //return this.db.list('clinicas/'+this.authService.get_clinica_id + '/depositos');
    return this.db.list('depositos/'+this.authService.get_clinica_id + '/');
  }

  //Cadastra depositos
  createDeposito(dp: Deposito){
    //return this.db.list('clinicas/'+this.authService.get_clinica_id + '/depositos').push(dp);
    return this.db.list('depositos/'+this.authService.get_clinica_id + '/').push(dp);
  }

  //Retorna de medicamentos
  getMedicamentos() {
    //return this.db.list('clinicas/'+this.authService.get_clinica_id + '/medicamentos');
    return this.db.list('medicamentos/'+this.authService.get_clinica_id + '/');
  }

  //Cadastra medicamentos
  createMedicamento(md: Medicamento){
    //return this.db.list('clinicas/'+this.authService.get_clinica_id + '/medicamentos').push(md);
    return this.db.list('medicamentos/'+this.authService.get_clinica_id + '/').push(md);
  }

  //Retorna de categorias de medicamentos
  getCategoriasMedicamento() {
    return this.db.list('clinicas/'+this.authService.get_clinica_id + '/categoriasmedicamentos');
  }

  //Cadastra medicamento no deposito
  addMedicamentoDeposito(mvt: MovimentoEstoque){
    //return this.db.list('clinicas/'+this.authService.get_clinica_id + '/depositos/'+mvt.deposito.id+'/medicamentos/').update(mvt.medicamento.id, mvt.medicamento);
    return this.db.list('depositos/'+this.authService.get_clinica_id + '/'+mvt.deposito.id+'/medicamentos/').update(mvt.medicamento.id, mvt.medicamento);
  }

  //Cadastra movimento no medicamento
  addMovimentoItem(mvt: MovimentoEstoque){
    //return this.db.list('clinicas/'+this.authService.get_clinica_id + '/medicamentos/'+mvt.medicamento.id+'/movimentos/').push(mvt);
    return this.db.list('medicamentos/'+this.authService.get_clinica_id + '/'+mvt.medicamento.id+'/movimentos/').push(mvt);
  }

  //Cadastra movimentos na tbl de movimentos
  addMovimento(mvt: MovimentoEstoque){
    //return this.db.list('clinicas/'+this.authService.get_clinica_id + '/estoquesmovimentos/').push(mvt);
    return this.db.list('estoquesmovimentos/'+this.authService.get_clinica_id + '/').push(mvt);
  }

  getMovimentos() {
    //return this.db.list('clinicas/'+this.authService.get_clinica_id + '/estoquesmovimentos');
    return this.db.list('estoquesmovimentos/'+this.authService.get_clinica_id + '/');
  }

}
