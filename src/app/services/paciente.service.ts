import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Paciente } from '../classes/paciente';
import { FormsModule } from "@angular/forms";
import { AuthService } from './auth.service';
import { Consulta } from '../classes/consulta';


@Injectable()
export class PacienteService {

  constructor(private firestore: AngularFirestore, private authService: AuthService) { }


  //METODOS RELACIONADOS A ENTIDADE ESTUDANTE

  //Retorna a lista de estudantes
  getPacientes() {
    return this.firestore.collection('clinicas/'+this.authService.get_clinica_id + '/pacientes').snapshotChanges();
    //return this.firestore.collection('clinicas/OCLHdnLLuQa9AbYJaDrw/pacientes').snapshotChanges();
  }

  //Cadastra o estudante
  createPaciente(paciente: Paciente){
    return this.firestore.collection('clinicas/'+this.authService.get_clinica_id + '/pacientes').add(paciente);
    //return this.firestore.collection('clinicas/OCLHdnLLuQa9AbYJaDrw/pacientes').add(paciente);
  }

  updatePaciente(paciente: Paciente){
    //delete estudante.id;
    this.firestore.doc('clinicas/'+this.authService.get_clinica_id + '/pacientes/' + paciente.id).update(paciente);
  }

  deletePaciente(paciente: Paciente){
    this.firestore.doc('clinicas/'+this.authService.get_clinica_id + '/pacientes/' + paciente.id).delete();
  }

  marcarConsulta(consulta:Consulta){
    return this.firestore.collection('clinicas/'+this.authService.get_clinica_id + '/consultas').add(consulta);
  }

}
