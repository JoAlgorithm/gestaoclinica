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

  consultas: Consulta[]; //Lista de todas as consultas da base de dados

  //Atributos da tabela de consultas PENDENTES
  dataSoursePendentes: MatTableDataSource<Consulta>; //Tabela de consultas pendentes
  displayedColumnsPendentes = ['data','tipo','nid','apelido', 'nome', 'preco' , 'cancelar', 'atender'];
  @ViewChild(MatPaginator) paginatorPendentes: MatPaginator;
  @ViewChild(MatSort) sortPendentes: MatSort;

  //Atributos da tabela de consultas CANCELADAS
  dataSourseCanceladas: MatTableDataSource<Consulta>; //Tabela de consultas canceladas
  displayedColumnsCanceladas = ['data','nid','apelido', 'nome', 'justificativa', 'cancelador'];
  @ViewChild(MatPaginator) paginatorCanceladas: MatPaginator;
  @ViewChild(MatSort) sortCanceladas: MatSort;

  

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

      //Consultas PENDENTES
      this.dataSoursePendentes=new MatTableDataSource(
        this.consultas.filter(c =>c.status === "Aberta").sort((a, b) => a.data > b.data ? 1 : -1)
      );
      this.dataSoursePendentes.paginator = this.paginatorPendentes;
      this.dataSoursePendentes.sort = this.sortPendentes;

      //Consultas CANCELADAS
      this.dataSourseCanceladas=new MatTableDataSource(
        this.consultas.filter(c =>c.status === "Cancelada").sort((a, b) => a.data > b.data ? 1 : -1)
      );
      this.dataSourseCanceladas.paginator = this.paginatorCanceladas;
      this.dataSourseCanceladas.sort = this.sortCanceladas;
    })
  }

  openDialog(row: Consulta): void {
    let dialogRef = this.dialog.open(CancelarConsultaDialog, {
    width: '400px',
    data: { consulta: row }
    });
    dialogRef.afterClosed().subscribe(result => {
    console.log("result "+result);
    });
  }

  

}


@Component({
  selector: 'cancelar-consulta-dialog',
  templateUrl: 'cancelar-consulta.html',
  })
  export class CancelarConsultaDialog {

  constructor(  public dialogRef: MatDialogRef<CancelarConsultaDialog>,
  @Inject(MAT_DIALOG_DATA) public data: any, public authService:AuthService,
  public pacienteService: PacienteService,  public snackBar: MatSnackBar) { }

  onNoClick(): void {
    this.dialogRef.close();
  }

  cancelarConsulta(consulta:Consulta){
    this.dialogRef.close();
    consulta.cancelador = this.authService.get_perfil + ' - ' + this.authService.get_user_displayName;
    consulta.status = "Cancelada";
    consulta.data_cancelamento = new Date();
    let data = Object.assign({}, consulta);
    
    this.pacienteService.updateConsulta(data)
    .then( res => {
      this.openSnackBar("Consulta cancelada com sucesso");
    }).catch( err => {
      console.log("ERRO: " + err.message)
    });
  }

  openSnackBar(mensagem) {
    this.snackBar.open(mensagem, null,{
      duration: 2000
    })
  }

  }