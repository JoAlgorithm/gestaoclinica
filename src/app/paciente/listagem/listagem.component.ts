import { Component, OnInit, ViewChild } from '@angular/core';
//import { MatTableDataSource } from '@angular/material';
import { Paciente } from '../../classes/paciente';
import { PacienteService } from '../../services/paciente.service';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { MatTableDataSource, MatPaginator, MatSort, MatSnackBar } from '@angular/material';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-listagem',
  templateUrl: './listagem.component.html',
  styleUrls: ['./listagem.component.scss']
})
export class ListagemComponent implements OnInit {

  pacientes: Paciente[];
  dataSourse: MatTableDataSource<Paciente>;
  displayedColumns = ['nome', 'apelido', 'sexo', 'documento_identificacao', 'referencia_telefone', 'detalhe','editar'];
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(public dialog: MatDialog,
    private pacienteService: PacienteService,public snackBar: MatSnackBar) { 
 }

  ngOnInit() {
    this.pacienteService.getPacientes().subscribe(data => {
      this.pacientes = data.map(e => {
        return {
          id: e.payload.doc.id,
          ...e.payload.doc.data(),
        } as Paciente;
      })
     // this.estudantesfilter=this.estudantes;
      this.dataSourse=new MatTableDataSource(this.pacientes);
      this.dataSourse.paginator = this.paginator;
      this.dataSourse.sort = this.sort;
      
      //console.log("ESTUDANTES: "+JSON.stringify(this.estudantes))
     // console.log("Encarregadao: "+this.estudantes[0].encarregado.nome)
    })
  }

}
