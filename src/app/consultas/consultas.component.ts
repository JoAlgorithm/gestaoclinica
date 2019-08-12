import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { Consulta } from './../classes/consulta';
import { MatTableDataSource, MatPaginator, MatSort, MatSnackBar, MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material';
import { PacienteService } from './../services/paciente.service';
import { Paciente } from '../classes/paciente';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-consultas',
  templateUrl: './consultas.component.html',
  styleUrls: ['./consultas.component.scss']
})
export class ConsultasComponent implements OnInit {

  consultas: Consulta[];
  dataSourse: MatTableDataSource<Consulta>;
  displayedColumns = ['data','nid','apelido', 'nome', , 'cancelar', 'atender'];
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  justificativa:String = ""; //variavel usada para pegar justificativa caso a consulta seja cancelada

  constructor(private pacienteService: PacienteService, public authService: AuthService,
    public dialog: MatDialog) {
   }

  ngOnInit() {
    this.pacienteService.getConsultas().subscribe(data => {
      this.consultas = data.map(e => {
        return {
          id: e.payload.doc.id,
          paciente: e.payload.doc.data()['paciente'] as Paciente,
          ...e.payload.doc.data(),
        } as Consulta;
      })
      this.dataSourse=new MatTableDataSource(this.consultas.sort((a, b) => a.data > b.data ? 1 : -1));
      this.dataSourse.paginator = this.paginator;
      this.dataSourse.sort = this.sort;
    })
  }

  openDialog(row: Consulta): void {
    let dialogRef = this.dialog.open(CancelarConsultaDialog, {
    width: '400px',
    data: { consulta: row }
    });
    dialogRef.afterClosed().subscribe(result => {
    //console.log('The dialog was closed');
    //this.animal = result;
    });
  }

  cancelarConsulta(consulta:Consulta){
    consulta.cancelador = this.authService.get_perfil + ' - ' + this.authService.get_user_displayName;
    let data = Object.assign({}, consulta);
  }

}


@Component({
  selector: 'cancelar-consulta-dialog',
  templateUrl: 'cancelar-consulta.html',
  })
  export class CancelarConsultaDialog {

  constructor(  public dialogRef: MatDialogRef<CancelarConsultaDialog>,
  @Inject(MAT_DIALOG_DATA) public data: any) { }

  onNoClick(): void {

    this.dialogRef.close();
  }

  }