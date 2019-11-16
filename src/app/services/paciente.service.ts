import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Paciente } from '../classes/paciente';
import { FormsModule } from "@angular/forms";
import { AuthService } from './auth.service';
import { Consulta } from '../classes/consulta';
import { Subject, Observable } from 'rxjs';
import { Faturacao } from '../classes/faturacao';
import * as _ from 'lodash';
import 'rxjs/add/operator/map'
import { AngularFireDatabase } from '@angular/fire/database';

@Injectable()
export class PacienteService {

  constructor(private db: AngularFireDatabase,
    private firestore: AngularFirestore, private authService: AuthService) {
    /*let a = "";
    authService.user.map(user => {
      /// Set an array of user roles, ie ['admin', 'author', ...]
      //return this.userRoles = _.keys(_.get(user, 'roles'))
      return _.keys(_.get(user, 'perfil'));
      //console.log("Perfil "+a);
      //console.log("User "+user)
    })
    .subscribe()*/
  }
/*
  pacientes: Paciente[];
  limparConsultas(){

    this.db.list('clinicas/1/tiposcondutaclinica').remove();
    this.db.list('clinicas/1/tiposdiagnosticoaux').remove();
    console.log('removido com sucesso');

  }*/

  //METODOS RELACIONADOS A ENTIDADE ESTUDANTE

  //Retorna a lista de estudantes
  getPacientes() {
    //return this.firestore.collection('clinicas/'+this.authService.get_clinica_id + '/pacientes').snapshotChanges();
    //return this.db.list('clinicas/'+this.authService.get_clinica_id + '/pacientes');
    return this.db.list('pacientes/'+this.authService.get_clinica_id + '/');
  }

  //Cadastra o estudante
  createPaciente(paciente: Paciente){
    //return this.firestore.collection('clinicas/'+this.authService.get_clinica_id + '/pacientes').add(paciente);
    //return this.db.list('clinicas/'+this.authService.get_clinica_id + '/pacientes').push(paciente);
    return this.db.list('pacientes/'+this.authService.get_clinica_id + '/').update(paciente.nid+"", paciente);
  }

  updatePaciente(paciente: Paciente){
    //return this.firestore.doc('clinicas/'+this.authService.get_clinica_id + '/pacientes/' + paciente.id).update(paciente);
    //return this.db.list('clinicas/'+this.authService.get_clinica_id + '/pacientes/').update(paciente.id, paciente)
    return this.db.list('pacientes/'+this.authService.get_clinica_id + '/').update(paciente.id, paciente)
  }

  deletePaciente(id){
    //this.firestore.doc('clinicas/'+this.authService.get_clinica_id + '/pacientes/' + paciente.id).delete();
    //return this.db.object('clinicas/'+this.authService.get_clinica_id + '/pacientes/' + paciente.id).remove();
    return this.db.object('pacientes/'+this.authService.get_clinica_id + '/' + id).remove();
  }

  //CONSULTAS
  marcarConsulta(consulta:Consulta){
    //return this.firestore.collection('clinicas/'+this.authService.get_clinica_id + '/consultas').add(consulta);
    //return this.db.list('clinicas/'+this.authService.get_clinica_id + '/consultas').push(consulta);

    let key = this.db.list('consultas/'+this.authService.get_clinica_id + '/lista_completa/').push('').key;
    consulta.id = key;

    var updatedUserData = {};
    updatedUserData['/lista_completa/'+consulta.id] = consulta;
  
    if(consulta.status == 'Encerrada' || consulta.status == 'Cancelada'){
      if(consulta.diagnosticos_aux){ //eliminando informacoes desnecessarias dos diagnosticos
        consulta.diagnosticos_aux.forEach(element => {
          element.tipo = null;
          element.subtipo = null;
          element.faturado = null;
        });
      }

      if(consulta.movimentosestoque){ //eliminando informacoes desnecessarias dos movimentosestoque
        consulta.movimentosestoque.forEach(element => {
          element.deposito_nome = element.deposito.nome;
          element.deposito = null;

          element.medicamento_nome = element.medicamento.nome_comercial;
          element.medicamento = null;
        });
      }

      if(consulta.condutas_clinicas){ //eliminando informacoes desnecessarias das condutasclinicas
        consulta.condutas_clinicas.forEach(element => {
          element.tipo = null;
        });
      }

      consulta.paciente = null;
      updatedUserData['/lista_relatorio/'+ consulta.ano + '/'+consulta.id] = consulta;
    }
    
    return this.db.object('consultas/'+this.authService.get_clinica_id).update(updatedUserData);
    //return this.db.list('consultas/'+this.authService.get_clinica_id + '/lista_completa/').push(consulta);
  }

  //Get consultas Lista Completa
  getConsultas(){
    //return this.firestore.collection('clinicas/'+this.authService.get_clinica_id + '/consultas').snapshotChanges();
    //return this.db.list('clinicas/'+this.authService.get_clinica_id + '/consultas');
    return this.db.list('consultas/'+this.authService.get_clinica_id + '/lista_completa');
  }

  //Get consultas Lista Completa
  getConsultasRelatorio(ano){
    //return this.firestore.collection('clinicas/'+this.authService.get_clinica_id + '/consultas').snapshotChanges();
    //return this.db.list('clinicas/'+this.authService.get_clinica_id + '/consultas');
    return this.db.list('consultas/'+this.authService.get_clinica_id + '/lista_relatorio/'+ano);
  }

  updateConsulta(consulta:Consulta){
    //return this.firestore.doc('clinicas/'+this.authService.get_clinica_id + '/consultas/' + consulta.id).update(consulta);
    //return this.db.list('clinicas/'+this.authService.get_clinica_id + '/consultas/').update(consulta.id+"", consulta);
    var updatedUserData = {};
    updatedUserData['/lista_completa/' +consulta.id] = consulta;
  

    if(consulta.status == 'Encerrada' || consulta.status == 'Cancelada'){
      consulta.paciente = null;
      updatedUserData['/lista_relatorio/'+ consulta.ano + '/' +consulta.id] = consulta;
    }

    return this.db.object('consultas/'+this.authService.get_clinica_id).update(updatedUserData);

    //return this.db.list('consultas/'+this.authService.get_clinica_id + '/').update(consulta.id+"", consulta);
  }

  //FATURACOES
  faturar(faturacao:Faturacao){
    //return this.firestore.collection('clinicas/'+this.authService.get_clinica_id + '/faturacao').add(faturacao);
    //return this.db.list('clinicas/'+this.authService.get_clinica_id + '/faturacao').push(faturacao);
    //return this.db.list('faturacao/'+this.authService.get_clinica_id + '/').push(faturacao);
    return this.db.list('faturacao/'+this.authService.get_clinica_id + '/'+faturacao.ano).update(faturacao.id ,faturacao);
  }

  getFaturacoes(ano){
    //return this.firestore.collection('clinicas/'+this.authService.get_clinica_id + '/faturacao').snapshotChanges();
    //return this.db.list('clinicas/'+this.authService.get_clinica_id + '/faturacao');
    return this.db.list('faturacao/'+this.authService.get_clinica_id + '/'+ ano);
  }


  //ENVIAR CONSULTAS DE UM COMPONENT PARA O OUTRO
  /*private subject = new Subject<Consulta>();

  sendConsulta(texto: Consulta) {
    this.subject.next({consulta: consulta} as Consulta)
  }

  clearConsulta() {
      this.subject.next();
  }

  getConsulta(): Observable<Consulta> {
      return this.subject.asObservable();
  }*/

}
