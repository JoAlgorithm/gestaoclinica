import { Component, OnInit, ViewChild, Inject } from '@angular/core';
//import { MatTableDataSource } from '@angular/material';
import { Paciente } from '../../classes/paciente';
import { PacienteService } from '../../services/paciente.service';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { MatTableDataSource, MatPaginator, MatSort, MatSnackBar } from '@angular/material';
import { Consulta } from '../../classes/consulta';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { ConfiguracoesService } from '../../services/configuracoes.service';
import { Clinica } from '../../classes/clinica';
import 'rxjs/add/operator/take';
import { DiagnosticoAuxiliar } from '../../classes/diagnostico_aux';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

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

  clinica: Clinica;

  diagnosticos:DiagnosticoAuxiliar[];

  constructor(public dialog: MatDialog, public authService: AuthService, public configServices:ConfiguracoesService,
    private pacienteService: PacienteService,public snackBar: MatSnackBar, private router: Router){ 
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

    this.configServices.getClinica().valueChanges()
    .take(1)
    .subscribe(c => {
      this.clinica = c;
    })

    this.configServices.getDiagnosticos().subscribe(data => {
      this.diagnosticos = data.map(e => {
        return {
          id: e.payload.doc.id,
          ...e.payload.doc.data(),
        } as DiagnosticoAuxiliar;
      })
    })
  }

  
  marcarConsulta(paciente, tipo){
    this.consulta.data = new Date();
    this.consulta.marcador = this.authService.get_perfil + ' - ' + this.authService.get_user_displayName;
    this.consulta.paciente = paciente;
    this.consulta.status = "Aberta";
    this.consulta.tipo = tipo;
    this.consulta.preco_consulta_medica = this.clinica.preco_consulta;
    console.log("tipo "+tipo)
    let data = Object.assign({}, this.consulta);

    this.pacienteService.marcarConsulta(data)
    .then( res => {
      this.openSnackBar("Consulta agendada com sucesso");
      this.router.navigateByUrl("/consultas")
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

  openDialog(row: Paciente): void {
    let dialogRef = this.dialog.open(DiagnosticosDialog, {
    width: '700px',
    data: { paciente: row, diagnosticos: this.diagnosticos }
    });
    dialogRef.afterClosed().subscribe(result => {
    console.log("result "+result);
    });
  }

  applyFilter(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // Datasource defaults to lowercase matches
    this.dataSourse.filter = filterValue;
  }

}



@Component({
  selector: 'diagnosticos-dialog',
  templateUrl: 'diagnosticos.component.html',
  })
  export class DiagnosticosDialog {

  diagnosticoFormGroup: FormGroup;
  diagnosticos: DiagnosticoAuxiliar[] = [];
  diagnostico:DiagnosticoAuxiliar;

  dataSourse: MatTableDataSource<DiagnosticoAuxiliar>;
  displayedColumns = ['nome','preco', 'remover'];

  consulta?: Consulta;
  preco_total:Number = 0;

  constructor(  public dialogRef: MatDialogRef<DiagnosticosDialog>, private router: Router,
  @Inject(MAT_DIALOG_DATA) public data: any, public authService:AuthService,
  public pacienteService: PacienteService,  public snackBar: MatSnackBar, private _formBuilder: FormBuilder) {
    this.diagnostico = new DiagnosticoAuxiliar();

    this.diagnosticoFormGroup = this._formBuilder.group({
      diagnostico_nome: ['', Validators.required],
      diagnostico_preco: ['', Validators.required]
    });
    this.diagnosticoFormGroup.controls['diagnostico_preco'].disable();

    this.dataSourse=new MatTableDataSource(this.diagnosticos);
  }
  
  addDiognostico(diagnostico:DiagnosticoAuxiliar){
    this.diagnosticos.push(diagnostico);

    this.preco_total = +this.preco_total + +diagnostico.preco;

    this.dataSourse=new MatTableDataSource(this.diagnosticos);
    this.diagnostico = new DiagnosticoAuxiliar();
  }

  removeDiagostico(diagnostico:DiagnosticoAuxiliar){
    this.diagnosticos.splice(this.diagnosticos.indexOf(diagnostico), 1);
    this.dataSourse=new MatTableDataSource(this.diagnosticos);
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  marcarConsulta(paciente:Paciente){
    this.consulta.data = new Date();
    this.consulta.marcador = this.authService.get_perfil + ' - ' + this.authService.get_user_displayName;
    this.consulta.paciente = paciente;
    this.consulta.status = "Aberta";
    this.consulta.tipo = "DIAGNOSTICO AUX";
    //this.preco_total

    ///this.consulta.preco_consulta_medica = this.clinica.preco_consulta;

    let data = Object.assign({}, this.consulta);

    this.pacienteService.marcarConsulta(data)
    .then( res => {
      this.openSnackBar("Consulta agendada com sucesso");
      this.router.navigateByUrl("/consultas")
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