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


  //METODOS RELACIONADOS A ENTIDADE ESTUDANTE

  //Retorna a lista de estudantes
  getPacientes() {
    //return this.firestore.collection('clinicas/'+this.authService.get_clinica_id + '/pacientes').snapshotChanges();
    return this.db.list('clinicas/'+this.authService.get_clinica_id + '/pacientes');
  }

  //Cadastra o estudante
  createPaciente(paciente: Paciente){
    //return this.firestore.collection('clinicas/'+this.authService.get_clinica_id + '/pacientes').add(paciente);
    return this.db.list('clinicas/'+this.authService.get_clinica_id + '/pacientes').push(paciente);
  }

  updatePaciente(paciente: Paciente){
    //return this.firestore.doc('clinicas/'+this.authService.get_clinica_id + '/pacientes/' + paciente.id).update(paciente);
    return this.db.list('clinicas/'+this.authService.get_clinica_id + '/pacientes/').update(paciente.id, paciente)
  }

  deletePaciente(paciente: Paciente){
    //this.firestore.doc('clinicas/'+this.authService.get_clinica_id + '/pacientes/' + paciente.id).delete();
    return this.db.object('clinicas/'+this.authService.get_clinica_id + '/pacientes/' + paciente.id).remove();
  }

  //CONSULTAS
  marcarConsulta(consulta:Consulta){
    //return this.firestore.collection('clinicas/'+this.authService.get_clinica_id + '/consultas').add(consulta);
    return this.db.list('clinicas/'+this.authService.get_clinica_id + '/consultas').push(consulta);
  }

  getConsultas(){
    //return this.firestore.collection('clinicas/'+this.authService.get_clinica_id + '/consultas').snapshotChanges();
    return this.db.list('clinicas/'+this.authService.get_clinica_id + '/consultas');
  }

  updateConsulta(consulta:Consulta){
    //return this.firestore.doc('clinicas/'+this.authService.get_clinica_id + '/consultas/' + consulta.id).update(consulta);
    return this.db.list('clinicas/'+this.authService.get_clinica_id + '/consultas/').update(consulta.id+"", consulta);
  }

  //FATURACOES
  faturar(faturacao:Faturacao){
    //return this.firestore.collection('clinicas/'+this.authService.get_clinica_id + '/faturacao').add(faturacao);
    return this.db.list('clinicas/'+this.authService.get_clinica_id + '/faturacao').push(faturacao);
  }

  getFaturacoes(){
    //return this.firestore.collection('clinicas/'+this.authService.get_clinica_id + '/faturacao').snapshotChanges();
    return this.db.list('clinicas/'+this.authService.get_clinica_id + '/faturacao');
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
