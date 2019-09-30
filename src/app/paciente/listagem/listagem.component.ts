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
import { CondutaClinica } from '../../classes/conduta_clinica';
import { TipoCondutaClinica } from '../../classes/tipo_conduta_clinica';
import { Faturacao } from '../../classes/faturacao';

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

  condutas:CondutaClinica[];

  tiposconduta: TipoCondutaClinica[];

  constructor(public dialog: MatDialog, public authService: AuthService, public configServices:ConfiguracoesService,
    private pacienteService: PacienteService,public snackBar: MatSnackBar, private router: Router){ 
    this.consulta = new Consulta();
 }

  ngOnInit() {
    this.pacienteService.getPacientes().snapshotChanges().subscribe(data => {
      this.pacientes = data.map(e => {
        return {
          id: e.payload.key,
          ...e.payload.val(),
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


    this.configServices.getTiposCondutaClinica().snapshotChanges().subscribe(data => {
      this.tiposconduta = data.map(e => {
        return {
          id: e.payload.key,
          ...e.payload.val(),
        } as TipoCondutaClinica;
      })
    })
    
    this.configServices.getDiagnosticos().snapshotChanges().subscribe(data => {
      this.diagnosticos = data.map(e => {
        return {
          id: e.payload.key,
          ...e.payload.val(),
        } as DiagnosticoAuxiliar;
      })
    })

    this.configServices.getCondutasClinica().snapshotChanges().subscribe(data => {
      this.condutas = data.map(e => {
        return {
          id: e.payload.key,
          ...e.payload.val(),
        } as CondutaClinica;
      })
    })
  }

  
  marcarConsulta(paciente, tipo){

    let dia = new Date().getDate();
    let mes = +(new Date().getMonth()) + +1;
    let ano = new Date().getFullYear();

    this.consulta.data = dia +"/"+mes+"/"+ano;
    console.log("Data "+this.consulta.data);


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
      //this.router.navigateByUrl("/consultas")
    }, err => {
      console.log("ERRO: " + err.message)
      this.openSnackBar("Ocorreu um erro ao marcar a consulta. Contacte o Admin do sistema.");

    })
  }

  openSnackBar(mensagem) {
    this.snackBar.open(mensagem, null,{
      duration: 2000
    })
  }

  openDiagnostico(row: Paciente): void {
    let dialogRef = this.dialog.open(DiagnosticosDialog, {
    width: '700px',
    data: { paciente: row, diagnosticos: this.diagnosticos }
    });
    dialogRef.afterClosed().subscribe(result => {
    console.log("result "+result);
    });
  }

  openConduta(row: Paciente): void {
    let dialogRef = this.dialog.open(CondutasDialog, {
    width: '800px',
    data: { paciente: row, condutas: this.condutas, tiposconduta: this.tiposconduta }
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
  selector: 'condutas-dialog',
  templateUrl: 'condutas.component.html',
  })
  export class CondutasDialog {

  condutaFormGroup: FormGroup;
  condutas: CondutaClinica[] = [];
  conduta: CondutaClinica;
  tipoconduta: TipoCondutaClinica;

  dataSourse: MatTableDataSource<CondutaClinica>;
  displayedColumns = ['tipo','nome', 'preco', 'remover'];

  consulta?: Consulta;
  preco_total:Number = 0;

  tiposcondutas_param: TipoCondutaClinica[]; //Passadas no parametro data
  condutas_param: CondutaClinica[]; //Passadas no parametro data
  condutas_alternativas: CondutaClinica[];
  
  
  constructor(public dialogRef: MatDialogRef<CondutasDialog>, private router: Router,
  @Inject(MAT_DIALOG_DATA) public data: any, public authService:AuthService,
  public pacienteService: PacienteService,  public snackBar: MatSnackBar, private _formBuilder: FormBuilder) {
    this.conduta = new CondutaClinica();
    this.tipoconduta = new TipoCondutaClinica();

    this.condutaFormGroup = this._formBuilder.group({
      conduta_tipo: ['', Validators.required],
      conduta_nome: ['', Validators.required],
      conduta_preco: ['', Validators.required]
    });
    this.condutaFormGroup.controls['conduta_preco'].disable();

    this.dataSourse=new MatTableDataSource(this.condutas);

    this.tiposcondutas_param = this.data.tiposconduta;
    this.condutas_param = this.data.condutas;
    //this.condutas_alternativas = this.condutas_param;
  }
  
  addConduta(conduta:CondutaClinica){
    if(conduta.nome){
      this.condutas.push(conduta);

      this.preco_total = +this.preco_total + +conduta.preco;
  
      this.dataSourse=new MatTableDataSource(this.condutas);
      this.conduta = new CondutaClinica();
    }else{
      this.openSnackBar("Selecione uma conduta clinica");
    }
    
  }

  removeConduta(conduta:CondutaClinica){
    this.preco_total = +this.preco_total - +conduta.preco;
    this.condutas.splice(this.condutas.indexOf(conduta), 1);
    this.dataSourse=new MatTableDataSource(this.condutas);
  }

  onSelect(tipo_conduta_clinica: TipoCondutaClinica) {
    this.conduta = new CondutaClinica();
    this.data.condutas = null;
    this.data.condutas = this.condutas_param.filter(item => item.tipo.nome == tipo_conduta_clinica.nome);
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  faturar(paciente: Paciente){
    //Abrir uma consulta CONDUTA CLINICA --------------------
    let dia = new Date().getDate();
    let mes = +(new Date().getMonth()) + +1;
    let ano = new Date().getFullYear();

    this.consulta = new Consulta();
    this.consulta.data = dia +"/"+mes+"/"+ano;
    this.consulta.marcador = this.authService.get_perfil + ' - ' + this.authService.get_user_displayName;
    this.consulta.paciente = paciente;
    this.consulta.condutas_clinicas = this.condutas;
    this.consulta.status = "Encerrada";
    this.consulta.tipo = "CONDUTA CLINICA";

    //Criar uma faturacao da consulta do tipo CONDUTA CLINICA --------------------
    let faturacao = new Faturacao();
    faturacao.categoria = "CONDUTA CLINICA";
    faturacao.valor = this.preco_total;
    faturacao.data = new Date();
    faturacao.consulta = this.consulta;
    faturacao.condutas_clinicas = this.consulta.condutas_clinicas;
    
    faturacao.mes = this.getMes(+new Date().getMonth()+ +1);
    faturacao.ano = new Date().getFullYear();

    //Persistir informacao na base de dados ----------------------------
    let data = Object.assign({}, faturacao);
    let d = Object.assign({}, this.consulta); 

    this.pacienteService.faturar(data)
    .then( res => {
      this.pacienteService.marcarConsulta(d)
      .then(r => {
        this.dialogRef.close();
        this.openSnackBar("Faturado com sucesso");
      }, er => {
        console.log("ERRO: " + er.message)
        this.openSnackBar("Ocorreu um erro. Contacte o Admin do sistema.");
      })      
    }, err=>{
      console.log("ERRO: " + err.message)
      this.openSnackBar("Ocorreu um erro. Contacte o Admin do sistema.");
    })
  }

  getMes(number): String{
    console.log("Get mes "+number)
    switch(number) { 
      case 1: { 
         return "Janeiro";
      } 
      case 2: { 
         return "Fevereiro"; 
      } 
      case 3: { 
         return "Marco"; 
      }
      case 4: { 
        return "Abril"; 
      }
      case 5: { 
        return "Maio"; 
      }
      case 6: { 
        return "Junho"; 
      }
      case 7: { 
        return "Julho"; 
      }
      case 8: { 
        return "Agosto"; 
      }  
      case 9: { 
        return "Setembro"; 
      }
      case 10: { 
        return "Outubro"; 
      }
      case 11: { 
        return "Novembro"; 
      }
      case 12: { 
        return "Dezembro"; 
      }
      default: { 
         //statements; 
         break; 
      } 
   } 
  }

  openSnackBar(mensagem) {
    this.snackBar.open(mensagem, null,{
      duration: 2000
    })
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
    if(diagnostico.nome){
      this.diagnosticos.push(diagnostico);

      this.preco_total = +this.preco_total + +diagnostico.preco;
  
      this.dataSourse=new MatTableDataSource(this.diagnosticos);
      this.diagnostico = new DiagnosticoAuxiliar();
    }else{
      this.openSnackBar("Selecione um diagnostico");
    }
    
  }

  removeDiagostico(diagnostico:DiagnosticoAuxiliar){
    this.diagnosticos.splice(this.diagnosticos.indexOf(diagnostico), 1);
    this.dataSourse=new MatTableDataSource(this.diagnosticos);
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  marcarConsulta(paciente:Paciente){
    let dia = new Date().getDate();
    let mes = +(new Date().getMonth()) + +1;
    let ano = new Date().getFullYear();
    //dia +"/"+mes+"/"+ano;

    this.consulta = new Consulta();
    this.consulta.data = dia +"/"+mes+"/"+ano;
    this.consulta.marcador = this.authService.get_perfil + ' - ' + this.authService.get_user_displayName;
    this.consulta.paciente = paciente;
    this.consulta.diagnosticos_aux = this.diagnosticos;
    this.consulta.status = "Diagnostico";
    this.consulta.tipo = "DIAGNOSTICO AUX";
    //this.preco_total

    ///this.consulta.preco_consulta_medica = this.clinica.preco_consulta;

    let data = Object.assign({}, this.consulta);

    this.pacienteService.marcarConsulta(data)
    .then( res => {
      this.dialogRef.close();
      this.openSnackBar("Consulta agendada com sucesso");
      //this.router.navigateByUrl("/consultas")
    }, err => {
      console.log("ERRO: " + err.message)
      this.openSnackBar("Ocorreu um erro ao marcar a consulta. Contacte o Admin do sistema.");
    })
  }

  openSnackBar(mensagem) {
    this.snackBar.open(mensagem, null,{
      duration: 2000
    })
  }

  }