import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import { AuthService } from './auth.service';
import { DiagnosticoAuxiliar } from '../classes/diagnostico_aux';
import { Clinica } from '../classes/clinica';
import { User } from '../classes/user';
import { AngularFireDatabase } from '@angular/fire/database';

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

}
