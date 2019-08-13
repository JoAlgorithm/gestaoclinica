import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import { AuthService } from './auth.service';
import { DiagnosticoAuxiliar } from '../classes/diagnostico_aux';
import { Clinica } from '../classes/clinica';

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

}
