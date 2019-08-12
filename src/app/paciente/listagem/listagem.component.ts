import { Component, OnInit, ViewChild } from '@angular/core';
//import { MatTableDataSource } from '@angular/material';
import { Paciente } from '../../classes/paciente';
import { PacienteService } from '../../services/paciente.service';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { MatTableDataSource, MatPaginator, MatSort, MatSnackBar } from '@angular/material';
import { DatePipe } from '@angular/common';
import { Inject} from '@angular/core';
import { Consulta } from '../../classes/consulta';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-listagem',
  templateUrl: './listagem.component.html',
  styleUrls: ['./listagem.component.scss']
})
export class ListagemComponent implements OnInit {

  pacientes: Paciente[];
  dataSourse: MatTableDataSource<Paciente>;
  displayedColumns = ['nid','apelido', 'nome', 'sexo', 'documento_identificacao', 'referencia_telefone', 'detalhe','editar', 'consulta'];
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  consulta: Consulta;

  constructor(public dialog: MatDialog, public authService: AuthService,
    private pacienteService: PacienteService,public snackBar: MatSnackBar){ 
    this.consulta = new Consulta();
 }

  ngOnInit() {
    this.pacienteService.getPacientes().subscribe(data => {
      this.pacientes = data.map(e => {
        return {
          id: e.payload.doc.id,
          ...e.payload.doc.data(),
        } as Paciente;
      })
      this.dataSourse=new MatTableDataSource(this.pacientes.sort((a, b) => a.nid - b.nid));
      this.dataSourse.paginator = this.paginator;
      this.dataSourse.sort = this.sort;
    })
  }

  
  marcarConsulta(paciente){
    
    this.consulta.data = new Date();
    this.consulta.marcador = this.authService.get_perfil + ' - ' + this.authService.get_user_displayName;
    this.consulta.paciente = paciente;
    this.consulta.status = "Aberta";
    let data = Object.assign({}, this.consulta);

    this.pacienteService.marcarConsulta(data)
    .then( res => {
      this.openSnackBar("Consulta agendada com sucesso");
    }).catch( err => {
      console.log("ERRO: " + err.message)
      this.openSnackBar("Ocorreu um erro ao marcar a consulta. Contacte o Admin do sistema.");
    });
  }

  openSnackBar(mensagem) {
    this.snackBar.open(mensagem, null,{
      duration: 2000
    })
  }

}
