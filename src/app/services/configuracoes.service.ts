import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import { AuthService } from './auth.service';
import { DiagnosticoAuxiliar } from '../classes/diagnostico_aux';
import { Clinica } from '../classes/clinica';
import { User } from '../classes/user';
import { AngularFireDatabase } from '@angular/fire/database';
import { CategoriaConsulta } from '../classes/categoria_consulta';
import { CondutaClinica } from '../classes/conduta_clinica';
import { NrCotacao } from '../classes/nr_cotacao';
import { NrFatura } from '../classes/nr_fatura';

@Injectable()
export class ConfiguracoesService {

  constructor(private db: AngularFireDatabase, private firestore: AngularFirestore, private authService: AuthService) { }


  //Retorna a lista de DIAGNOSTICOS AUXILIARES
  getDiagnosticos() {
    //return this.firestore.collection('clinicas/'+this.authService.get_clinica_id + '/diagnosticos').snapshotChanges();
    //return this.db.list('clinicas/'+this.authService.get_clinica_id + '/diagnosticos');
    return this.db.list('diagnosticos/'+this.authService.get_clinica_id + '/');
  }

  //Cadastra o DIAGNOSTICO AUXILIAR
  createDiagnostico(diagnostico: DiagnosticoAuxiliar){
    //return this.firestore.collection('clinicas/'+this.authService.get_clinica_id + '/diagnosticos').add(diagnostico);
    //return this.db.list('clinicas/'+this.authService.get_clinica_id + '/diagnosticos').push(diagnostico);
    return this.db.list('diagnosticos/'+this.authService.get_clinica_id + '/').push(diagnostico);
  }
  updateDiagnostico(diagnostico: DiagnosticoAuxiliar){
    return this.db.list('diagnosticos/'+this.authService.get_clinica_id + '/').update(diagnostico.id+"", diagnostico);
  }

  removeDiagnostico(id){
    return this.db.list('diagnosticos/'+this.authService.get_clinica_id + '/').remove(id+"");
  }

  //Retorna a lista de CATEGORIAS DE CONSULTAs
  getCategoriasConsulta() {
    //return this.db.list('clinicas/'+this.authService.get_clinica_id + '/categoriasconsulta');
    return this.db.list('categoriasconsulta/'+this.authService.get_clinica_id + '/');
  }

  //Cadastra o CATEGORIAS DE CONSULTAS
  createCategoriaConsulta(categoriaConsulta: CategoriaConsulta){
    //return this.db.list('clinicas/'+this.authService.get_clinica_id + '/categoriasconsulta').push(categoriaConsulta);
    return this.db.list('categoriasconsulta/'+this.authService.get_clinica_id + '/').push(categoriaConsulta);
  }

  //Cadastra o CATEGORIAS DE CONSULTAS
  updateCategoriaConsulta(categoriaConsulta: CategoriaConsulta){
    //return this.db.list('clinicas/'+this.authService.get_clinica_id + '/categoriasconsulta').push(categoriaConsulta);
    return this.db.list('categoriasconsulta/'+this.authService.get_clinica_id + '/').update(categoriaConsulta.id+"", categoriaConsulta);
  }

  removeCategoriaConsulta(id){
    return this.db.list('categoriasconsulta/'+this.authService.get_clinica_id + '/').remove(id+"");
  }

  //Retorna a lista de CONDUTAS CLLINICAS
  getCondutasClinica() {
    //return this.db.list('clinicas/'+this.authService.get_clinica_id + '/condutasclinicas');
    return this.db.list('condutasclinicas/'+this.authService.get_clinica_id + '/');
  }

  //Retorna a lista de TIPOS CONDUTAS CLLINICAS
  getTiposCondutaClinica() {
    //return this.db.list('clinicas/'+this.authService.get_clinica_id + '/tiposcondutaclinica');
    return this.db.list('tiposcondutaclinica/'+this.authService.get_clinica_id + '/');
  }

  //Cadastra o CATEGORIAS DE CONSULTAS
  createCondutaClinica(condutaclinicas: CondutaClinica){
    return this.db.list('condutasclinicas/'+this.authService.get_clinica_id + '/').push(condutaclinicas);
  }

  updateCondutaClinica(condutaclinicas: CondutaClinica){
    return this.db.list('condutasclinicas/'+this.authService.get_clinica_id + '/').update(condutaclinicas.id, condutaclinicas);
  }

  removeConduta(id){
    return this.db.list('condutasclinicas/'+this.authService.get_clinica_id + '/').remove(id+"");
  }

  

  /*updateCondutaClinica(condutaclinicas: CondutaClinica){
    return this.db.list('clinicas/'+this.authService.get_clinica_id + '/condutasclinicas').update(condutaclinicas.id, condutaclinicas);
  }*/

  //Atualizar dados da CLINICA
  updateClinica(clinica: Clinica){
    //return this.firestore.doc('clinicas/'+this.authService.get_clinica_id).update(clinica);
    return this.db.list('clinicas/').update(clinica.id+"", clinica);
  }

  getClinica(){
    //return this.firestore.doc<Clinica>('clinicas/'+this.authService.get_clinica_id);
    return this.db.object('clinicas/'+this.authService.get_clinica_id);
  }

  //Regista o usuario no firestore mas o usuario e registado na lista de users no service auth
  createUser(user: User){
    //return this.firestore.doc('users/'+user.uid).update(user);
    return this.db.list('users/'+user.uid).push(user);
  }

  //Retorna a lista de usuarios do firestore
  // ao chamar essa funcao deve-se filtrar todos os usuarios da clinica em questao porque nessa tabela
  // ficam todos os usuarios de todas as clinicas cadastradas
  getUsers() {
    //return this.firestore.collection('users/').snapshotChanges();
    return this.db.list('users/');
  }

  //Retorna a lista de TIPOS DIAGNOSTICOS AUX
  getTiposDiagnosticos() {
    //return this.db.list('clinicas/'+this.authService.get_clinica_id + '/tiposdiagnosticoaux');
    return this.db.list('tiposdiagnosticoaux/'+this.authService.get_clinica_id + '/');
  }

  //Retorna a lista de SUBTIPOS DIAGNOSTICOS AUX
  getSubTiposDiagnosticos() {
    //return this.db.list('clinicas/'+this.authService.get_clinica_id + '/subtiposdiagnosticoaux');
    return this.db.list('subtiposdiagnosticoaux/'+this.authService.get_clinica_id + '/');
  }

  //Cadastra NRCOTACAO
  addNrCotacao(nr: NrCotacao){
    //return this.db.list('clinicas/'+this.authService.get_clinica_id +'/nrscotacoes').update(nr.id, nr);
    
    /*let chave = nr.id;
    if(nr.id !== (new Date().getFullYear()+'000001')){
      chave = (+chave - +1)+"";
    }*/

    return this.db.list('nrscotacoes/'+this.authService.get_clinica_id +'/').update('nr', nr);
  }

  //Retorna NRCOTACAO
  getNrsCotacao() {
    //return this.db.list('clinicas/'+this.authService.get_clinica_id + '/nrscotacoes');
    return this.db.list('nrscotacoes/'+this.authService.get_clinica_id + '/');
  }

  //Cadastra NRFATURA
  addNrFatura(nr: NrFatura){
    //return this.db.list('clinicas/'+this.authService.get_clinica_id +'/nrsfaturas').update(nr.id, nr);
    return this.db.list('nrsfaturas/'+this.authService.get_clinica_id +'/').update('nr', nr);
  }

  //Retorna NRCOTACAO
  getNrsFatura() {
    //return this.db.list('clinicas/'+this.authService.get_clinica_id + '/nrsfaturas');
    return this.db.list('nrsfaturas/'+this.authService.get_clinica_id + '/');
  }

  getAnos() {
    return this.db.list('anos/'+this.authService.get_clinica_id + '/');
  }

  

}
