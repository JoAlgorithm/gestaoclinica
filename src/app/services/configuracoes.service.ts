import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import { AuthService } from './auth.service';
import { DiagnosticoAuxiliar } from '../classes/diagnostico_aux';
import { Clinica } from '../classes/clinica';
import { User } from '../classes/user';

@Injectable()
export class ConfiguracoesService {

  constructor(private firestore: AngularFirestore, private authService: AuthService) { }

  //Retorna a lista de DIAGNOSTICOS AUXILIARES
  getDiagnosticos() {
    return this.firestore.collection('clinicas/'+this.authService.get_clinica_id + '/diagnosticos').snapshotChanges();
  }

  //Cadastra o DIAGNOSTICO AUXILIAR
  createDiagnostico(diagnostico: DiagnosticoAuxiliar){
    return this.firestore.collection('clinicas/'+this.authService.get_clinica_id + '/diagnosticos').add(diagnostico);
  }

  //Atualizar dados da CLINICA
  updateClinica(clinica: Clinica){
    //delete estudante.id;
    return this.firestore.doc('clinicas/'+this.authService.get_clinica_id).update(clinica);
  }

  getClinica(){
    return this.firestore.doc<Clinica>('clinicas/'+this.authService.get_clinica_id);
    //return this.firestore.collection('clinicas/'+this.authService.get_clinica_id);
  }

  //Regista o usuario no firestore mas o usuario e registado na lista de users no service auth
  createUser(user: User){
    return this.firestore.doc('users/'+user.uid).update(user);
  }

  //Retorna a lista de usuarios do firestore
  // ao chamar essa funcao deve-se filtrar todos os usuarios da clinica em questao porque nessa tabela
  // ficam todos os usuarios de todas as clinicas cadastradas
  getUsers() {
    return this.firestore.collection('users/').snapshotChanges();
  }

}
