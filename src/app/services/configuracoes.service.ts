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
    return this.db.list('clinicas/'+this.authService.get_clinica_id + '/diagnosticos');
  }

  //Cadastra o DIAGNOSTICO AUXILIAR
  createDiagnostico(diagnostico: DiagnosticoAuxiliar){
    //return this.firestore.collection('clinicas/'+this.authService.get_clinica_id + '/diagnosticos').add(diagnostico);
    return this.db.list('clinicas/'+this.authService.get_clinica_id + '/diagnosticos').push(diagnostico);
  }

  //Retorna a lista de CATEGORIAS DE CONSULTAs
  getCategoriasConsulta() {
    return this.db.list('clinicas/'+this.authService.get_clinica_id + '/categoriasconsulta');
  }

  //Cadastra o CATEGORIAS DE CONSULTAS
  createCategoriaConsulta(categoriaConsulta: CategoriaConsulta){
    return this.db.list('clinicas/'+this.authService.get_clinica_id + '/categoriasconsulta').push(categoriaConsulta);
  }

  //Retorna a lista de CONDUTAS CLLINICAS
  getCondutasClinica() {
    return this.db.list('clinicas/'+this.authService.get_clinica_id + '/condutasclinicas');
  }

  //Retorna a lista de TIPOS CONDUTAS CLLINICAS
  getTiposCondutaClinica() {
    return this.db.list('clinicas/'+this.authService.get_clinica_id + '/tiposcondutaclinica');
  }

  //Cadastra o CATEGORIAS DE CONSULTAS
  createCondutaClinica(condutaclinicas: CondutaClinica){
    return this.db.list('clinicas/'+this.authService.get_clinica_id + '/condutasclinicas').push(condutaclinicas);
  }

  updateCondutaClinica(condutaclinicas: CondutaClinica){
    return this.db.list('clinicas/'+this.authService.get_clinica_id + '/condutasclinicas').update(condutaclinicas.id, condutaclinicas);
  }

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
    return this.db.list('clinicas/'+this.authService.get_clinica_id + '/tiposdiagnosticoaux');
  }

  //Retorna a lista de SUBTIPOS DIAGNOSTICOS AUX
  getSubTiposDiagnosticos() {
    return this.db.list('clinicas/'+this.authService.get_clinica_id + '/subtiposdiagnosticoaux');
  }

  //Cadastra NRCOTACAO
  addNrCotacao(nr: NrCotacao){
    return this.db.list('clinicas/'+this.authService.get_clinica_id +'/nrscotacoes').update(nr.id, nr);
  }

  //Retorna NRCOTACAO
  getNrsCotacao() {
    return this.db.list('clinicas/'+this.authService.get_clinica_id + '/nrscotacoes');
  }

  //Cadastra NRFATURA
  addNrFatura(nr: NrFatura){
    return this.db.list('clinicas/'+this.authService.get_clinica_id +'/nrsfaturas').update(nr.id, nr);
  }

  //Retorna NRCOTACAO
  getNrsFatura() {
    return this.db.list('clinicas/'+this.authService.get_clinica_id + '/nrsfaturas');
  }
  

  //Com base nos nrs de cotacao existentes na base de dados essa funcao gera o proximo nr de cotacao
  /*nrscotacao: NrCotacao[];
  id = 0;
  gerarNrCotacao(){
    this.getNrsCotacao().snapshotChanges().subscribe(data => {
      this.nrscotacao = data.map(e => {
        return {
          id: e.payload.key,
          ...e.payload.val(),
        } as NrCotacao;
      });

      if(typeof this.nrscotacao !== 'undefined' && this.nrscotacao.length > 0){
        this.id = Math.max.apply(Math, this.nrscotacao.map(function(o) { return o.id; }));
        this.id = this.id+1;
        console.log("id: "+this.id)
      }else{
        this.id =  +(new Date().getFullYear()+'000001');
        console.log("id: "+this.id)
      }
      return this.id;
    })
  }*/

  /*
  if(typeof this.pacientes !== 'undefined' && this.pacientes.length > 0){
        this.paciente.nid = Math.max.apply(Math, this.pacientes.map(function(o) { return o.nid; }));
        this.paciente.nid = this.paciente.nid+1;
      }else{
        this.paciente.nid =  +(new Date().getFullYear()+'001');
      }
  */


  /*tipos_diagnosticos = [
    {value: 'HEMATOLOGIA'},
    {value: 'BIOQUIMICA'},
    {value: 'IMUNOQUIMICA'},
    {value: 'HORMONAS'},
    {value: 'MARCADORES CARDIACOS'},
    {value: 'MARCADORES TUMORAIS'},
    {value: 'INFECCIOLOGIA'},
    {value: 'IONOGRAMA'},
    {value: 'URIANALISE'},
    {value: 'EXAME DE FEZES'},
    {value: 'TESTES RAPIDOS'},
    {value: 'IMAGIOLOGIA'},
    {value: 'EXAMES E ESTUDOS DIVERSOS'}
  ]

  subtipos_diagnosticos = [
    {value: 'Perfil Hepatico'},
    {value: 'Perfil Renal'},
    {value: 'Perfil Lipidico'},
    {value: 'Perfil Anemico'},
    {value: 'Perfil Glicemico'},
    {value: 'Perfil Pancreatico'},
    {value: 'Perfil Pancreatico'}
  ]*/

}
