import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { AuthService } from './auth.service';
import { UnidadeMedida } from '../classes/un';
import { Deposito } from '../classes/deposito';
import { Medicamento } from '../classes/medicamento';
import { MovimentoEstoque } from '../classes/movimento_estoque';

@Injectable()
export class EstoqueService {

  constructor(public db: AngularFireDatabase, private authService: AuthService) {
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
  updateUN(un: UnidadeMedida){
    //return this.db.list('clinicas/'+this.authService.get_clinica_id + '/uns').update(un.id, un);
    return this.db.list('uns/'+this.authService.get_clinica_id + '/').update(un.id, un);
  }
  removeUN(id){
    return this.db.list('uns/'+this.authService.get_clinica_id + '/').remove(id);
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

  updateDeposito(dp: Deposito){
    //return this.db.list('clinicas/'+this.authService.get_clinica_id + '/depositos').update(dp.id, dp);
    return this.db.list('depositos/'+this.authService.get_clinica_id + '/').update(dp.id, dp);
  }

  removeDeposito(id){
    return this.db.list('depositos/'+this.authService.get_clinica_id + '/').remove(id);
  }

  getMedicamentoDeposito(medicamento_id, deposito_id){
    //return this.firestore.doc<Clinica>('clinicas/'+this.authService.get_clinica_id);
    return this.db.object('depositos/'+this.authService.get_clinica_id+'/'+deposito_id+'/medicamentos/'+medicamento_id);
  }


  //Retorna de medicamentos
  getMedicamentos() {
    //return this.db.list('clinicas/'+this.authService.get_clinica_id + '/medicamentos');
    return this.db.list('medicamentos/'+this.authService.get_clinica_id + '/');
  }

  //Cadastra medicamentos
  createMedicamento(md: Medicamento){
    //return this.db.list('clinicas/'+this.authService.get_clinica_id + '/medicamentos').push(md);
    //return this.db.list('medicamentos/'+this.authService.get_clinica_id + '/').push(md);
    return this.db.list('medicamentos/'+this.authService.get_clinica_id + '/').update(md.codigo+"", md);
  }

  updateMedicamentos(md: Medicamento){
    //return this.db.list('clinicas/'+this.authService.get_clinica_id + '/medicamentos').update(md.id, md);
    return this.db.list('medicamentos/'+this.authService.get_clinica_id + '/').update(md.id, md);
  }

  removeMedicamento(id){
    return this.db.list('medicamentos/'+this.authService.get_clinica_id + '/').remove(id);
  }

  //Retorna de categorias de medicamentos
  getCategoriasMedicamento() {
    //return this.db.list('clinicas/'+this.authService.get_clinica_id + '/categoriasmedicamentos');
    return this.db.list('categoriasmedicamentos/'+this.authService.get_clinica_id + '/');
  }

  //Cadastra medicamento no deposito
  addMedicamentoDeposito(mvt: MovimentoEstoque){
    //return this.db.list('clinicas/'+this.authService.get_clinica_id + '/depositos/'+mvt.deposito.id+'/medicamentos/').update(mvt.medicamento.id, mvt.medicamento);
    
    //removendo informacoes redundantes para dar eficiencia e perfomance a base de dados
    /*let id_deposito = mvt.deposito.id;
    let id_medicamento = mvt.medicamento.id;
    mvt.deposito = null;
    mvt.medicamento = null;*/
    //console.log("Deposito id "+mvt.deposito.id);

    //return this.db.list('depositos/'+this.authService.get_clinica_id + '/'+mvt.deposito.id+'/medicamentos/').update(mvt.medicamento.codigo+"", mvt.medicamento);
    return this.db.list('depositos/'+this.authService.get_clinica_id + '/'+mvt.deposito.id+'/medicamentos/').update(mvt.medicamento.id, mvt.medicamento);

  }

  //Cadastra movimento no medicamento
  addMovimentoItem(mvt: MovimentoEstoque){
    //return this.db.list('clinicas/'+this.authService.get_clinica_id + '/medicamentos/'+mvt.medicamento.id+'/movimentos/').push(mvt);
    
    //eliminar redundancia de dados para dar agilidade e perfomance a base de dados
    mvt.deposito_nome = mvt.deposito.nome;
    mvt.deposito = null;
    let medicamento_id = mvt.medicamento.id;
    mvt.medicamento_nome = mvt.medicamento.nome_comercial;
    mvt.medicamento = null;
    
    return this.db.list('medicamentos/'+this.authService.get_clinica_id + '/'+medicamento_id+'/movimentos/').push(mvt);
  }

  //Cadastra movimentos na tbl de movimentos
  addMovimento(mvt: MovimentoEstoque){
    //return this.db.list('clinicas/'+this.authService.get_clinica_id + '/estoquesmovimentos/').push(mvt);

    //Eliminar dados desnecessarios para garantir a perfomance do banco
    //mvt.deposito_nome = mvt.deposito.nome;
    //mvt.deposito = null;

    return this.db.list('estoquesmovimentos/'+this.authService.get_clinica_id + '/').push(mvt);
  }

  getMovimentos() {
    //return this.db.list('clinicas/'+this.authService.get_clinica_id + '/estoquesmovimentos');
    return this.db.list('estoquesmovimentos/'+this.authService.get_clinica_id + '/');
  }

  getTiposEstoque(){
    return this.db.list('tiposestoque/'+this.authService.get_clinica_id + '/');
  }

  getDepositoRelatorioParcial(ano, mes, deposito_id){
    return this.db.list('depositos_relatorio/'+this.authService.get_clinica_id + '/'+ deposito_id + "/" +ano +"/"+mes+"/");
  }

  getDepositoRelatorioSemiParcial(ano, deposito_id){
    return this.db.list('depositos_relatorio/'+this.authService.get_clinica_id + '/'+ deposito_id + "/" +ano +"/");
  }
  
  getDepositoRelatorioCompleto(){
    return this.db.list('depositos_relatorio/'+this.authService.get_clinica_id + '/');
  }

  //Cadastra o movimento na tabela de movimentos "estoquesmovimentos"
  //Cadastra o movimento no item "medicamentos"
  //Cadastra o movimento no deposito "depositos"
  //Elimina informacoes desnecessarias
  updateEstoque(updatedUserData){
    /*var updatedUserData = {};


    movimentos.forEach(mvt => {
    //Array.from(movimentos).forEach(mvt => {
      let key = this.db.list('estoquesmovimentos/'+this.authService.get_clinica_id).push('').key;
      
      //Gravando na tabela de depositos "depositos"
      updatedUserData['/depositos/'+this.authService.get_clinica_id + '/'+mvt.deposito.id+'/medicamentos/'+mvt.medicamento.id] = mvt.medicamento;

      //Gravando na tabela de movimentos "estoquesmovimentos"
      //eliminar redundancia de dados para dar agilidade e perfomance a base de dados
      mvt.deposito_nome = mvt.deposito.nome;
      mvt.deposito = null;
      let medicamento_id = mvt.medicamento.id;
      mvt.medicamento_nome = mvt.medicamento.nome_comercial;
      mvt.medicamento = null;
      updatedUserData['/estoquesmovimentos/'+this.authService.get_clinica_id+"/"+key] = mvt;
    });*/

    return this.db.object('/').update(updatedUserData);
  }

  

}
