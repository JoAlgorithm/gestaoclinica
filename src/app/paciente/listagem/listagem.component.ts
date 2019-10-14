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
import { CategoriaConsulta } from '../../classes/categoria_consulta';
import { TipoDiagnosticoAux } from '../../classes/tipo_diagnostico';
import { SubTipoDiagnosticoAux } from '../../classes/subtipo_diagnostico';
import * as deepEqual from "deep-equal";
import * as jsPDF from 'jspdf';
import { Deposito } from '../../classes/deposito';
import { EstoqueService } from '../../services/estoque.service';
import { Medicamento } from '../../classes/medicamento';
import { CustomValidators } from 'ng2-validation';
//import { MatProgressButtonOptions } from 'mat-progress-buttons';


@Component({
  selector: 'app-listagem',
  templateUrl: './listagem.component.html',
  styleUrls: ['./listagem.component.scss']
})
export class ListagemComponent implements OnInit {

  // trigger-variable for Ladda
  isLoading: boolean = false;
    
  toggleLoading() {
      this.isLoading = !this.isLoading;
  }

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

  categorias_consulta: CategoriaConsulta[];

  tipos_diagnosticos: TipoDiagnosticoAux[];
  subtipos_diagnosticos: SubTipoDiagnosticoAux[];
  subtipos_diagnosticos_aux: SubTipoDiagnosticoAux[];

  depositos: Deposito[];

  constructor(public dialog: MatDialog, public authService: AuthService, public configServices:ConfiguracoesService,
    private pacienteService: PacienteService,public snackBar: MatSnackBar, private router: Router, public estoqueService: EstoqueService){ 
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

    this.configServices.getCategoriasConsulta().snapshotChanges().subscribe(data => {
      this.categorias_consulta = data.map(e => {
        return {
          id: e.payload.key,
          ...e.payload.val(),
        } as CategoriaConsulta;
      })
    })

    this.configServices.getTiposDiagnosticos().snapshotChanges().subscribe(data => {
      this.tipos_diagnosticos = data.map(e => {
        return {
          id: e.payload.key,
          //subtipos: e.payload.val()['subtipo'] as SubTipoDiagnosticoAux[],
          ...e.payload.val(),
        } as TipoDiagnosticoAux;
      });
    })

    this.configServices.getSubTiposDiagnosticos().snapshotChanges().subscribe(data => {
      this.subtipos_diagnosticos = data.map(e => {
        return {
          id: e.payload.key,
          tipo: e.payload.val()['tipo'] as TipoDiagnosticoAux,
          ...e.payload.val(),
        } as SubTipoDiagnosticoAux;
      });
      this.subtipos_diagnosticos_aux = this.subtipos_diagnosticos;
    })

    //DEPOSITOS
    this.estoqueService.getDepositos().snapshotChanges().subscribe(data => {
        this.depositos = data.map(e => {
          return {
            id: e.payload.key,
            ...e.payload.val(),
          } as Deposito;
        })
    })

  }
  
  detalhes(doente){
  
    const dialogRef = this.dialog.open(DialogDetalhes, {
     
      width: '1000px',
     data: { nid: doente.nid,apelido: doente.apelido, nome: doente.nome, genero:doente.sexo,datanascimento:doente.datanascimento,
       documento_identificacao: doente.documento_identificacao, nr_documento_identificacao: doente.nr_documento_identificacao,
        
      }
    });
  }




  marcarConsulta(paciente, tipo){
    let dialogRef = this.dialog.open(ConsultasDialog, {
      width: '700px',
      data: { paciente: paciente, tipo: tipo, categorias_consulta: this.categorias_consulta  }
    });
    dialogRef.afterClosed().subscribe(result => {
    console.log("result "+result);
    });
  }
  
  /*marcarConsulta(paciente, tipo){

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
  }*/

  openSnackBar(mensagem) {
    this.snackBar.open(mensagem, null,{
      duration: 2000
    })
  }

  openDiagnostico(row: Paciente): void {
    let dialogRef = this.dialog.open(DiagnosticosDialog, {
    width: '800px',
    data: { paciente: row, diagnosticos: this.diagnosticos,
      tipos_diagnosticos:this.tipos_diagnosticos, subtipos_diagnosticos:this.subtipos_diagnosticos
    }
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

  openMedicamento(row: Paciente){
    let dialogRef = this.dialog.open(MedicamentosDialog, {
      width: '800px',
      data: { paciente: row, depositos: this.depositos }
    });
    dialogRef.afterClosed().subscribe(result => {
      //console.log("result "+result);
    });
  }

  applyFilter(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // Datasource defaults to lowercase matches
    this.dataSourse.filter = filterValue;
  }

}

//MedicamentosDialog --------------------------------------------------------
@Component({
  selector: 'medicamentos-dialog',
  templateUrl: 'medicamentos.component.html',
})
export class MedicamentosDialog {

  medicamentoFormGroup: FormGroup;
  medicamentos: Medicamento[] = [];
  medicamentos_adicionados: Medicamento[] = [];
  medicamento: Medicamento;
  deposito: Deposito;
  preco_total:Number = 0;
  max: Number = 1;
  min: Number = 1;

  dataSourse: MatTableDataSource<Medicamento>;
  displayedColumns = ['medicamento','qtd_solicitada', 'preco_unit', 'preco_venda_total', 'remover'];

  consulta?: Consulta;

  constructor(public dialog: MatDialog,public dialogRef: MatDialogRef<MedicamentosDialog>, private router: Router,
  @Inject(MAT_DIALOG_DATA) public data: any, public authService:AuthService,
  public pacienteService: PacienteService,  public snackBar: MatSnackBar, private _formBuilder: FormBuilder) {
    
    this.deposito = new Deposito();
    this.medicamento = new Medicamento();

    this.medicamentoFormGroup = this._formBuilder.group({
      deposito: ['', Validators.required],
      medicamento: ['', Validators.required],
      qtd_solicitada: ['',  Validators.compose([Validators.required, CustomValidators.number({min: this.min, max: this.max})])],
      qtd_disponivel: ['', Validators.required],
      preco_venda_total: ['', Validators.required],
      preco: ['', Validators.required],
    });
    this.medicamentoFormGroup.controls['qtd_disponivel'].disable();
    this.medicamentoFormGroup.controls['preco'].disable();
    this.medicamentoFormGroup.controls['preco_venda_total'].disable();
  }

  getMedicamentos(deposito: Deposito){
    this.medicamentos = [];
    this.medicamento = new Medicamento();
    this.max = 1;
    if(deposito.medicamentos){

      Object.keys(deposito.medicamentos).forEach(key=>{
        this.medicamentos.push(deposito.medicamentos[key]);
      })

    }else{
      this.openSnackBar("Deposito sem medicamentos. Contacte o Admnistrativo");
    }
  }

  limitarQuantidade(){
    this.max = this.medicamento.qtd_disponivel;
    this.medicamentoFormGroup.controls['qtd_solicitada']
      .setValidators(CustomValidators.number({min: 1, max: this.medicamento.qtd_disponivel}));
  }

  validarQtd(qtd_solicitada){
    if(qtd_solicitada){
      this.medicamento.preco_venda_total = qtd_solicitada*this.medicamento.preco_venda;
    }else{
      this.medicamento.preco_venda_total = 0;
    }
  }

  addMedicamento(){
    if(this.medicamento.qtd_solicitada){

      let check = true;
      this.medicamentos_adicionados.forEach(md => {
        if(md.id == this.medicamento.id){
          check = false;
          return;
        }
      });

      if(check){
        if( Number(this.medicamento.qtd_solicitada) <= Number(this.medicamento.qtd_disponivel)){
          this.medicamento.preco_venda_total = this.medicamento.preco_venda*this.medicamento.qtd_solicitada;
          this.medicamento.qtd_disponivel = +this.medicamento.qtd_disponivel - +this.medicamento.qtd_solicitada;
  
          this.medicamentos_adicionados.push(this.medicamento);
    
          this.preco_total = +this.preco_total + +(this.medicamento.preco_venda*this.medicamento.qtd_solicitada);
      
          this.dataSourse=new MatTableDataSource(this.medicamentos_adicionados);
    
          this.medicamento = new Medicamento();
          this.max = 1;
        }else{
          this.openSnackBar("Qtd solicitada nao pode ser superior a quantidade disponivel");
        }
      }else{
        this.openSnackBar("Medicamento ja adicionado a lista");
      }
      

      
    }else{
      this.openSnackBar("Selecione um medicamento");
    }
  }

  removeMedicamento(md: Medicamento){
    md.qtd_disponivel = +md.qtd_disponivel + +md.qtd_solicitada;
    this.preco_total = +this.preco_total - (md.qtd_solicitada*md.preco_venda)
    this.medicamentos_adicionados.splice(this.medicamentos_adicionados.indexOf(md), 1);
    this.dataSourse=new MatTableDataSource(this.medicamentos_adicionados);
  }

  //AO FATURAR PRECISA ATUALIZAR A QTD DISPONIVEL DO ITEM NO DEPOSITO
  faturar(paciente: Paciente){
    //Abrir uma consulta CONDUTA CLINICA --------------------
    let dia = new Date().getDate();
    let mes = +(new Date().getMonth()) + +1;
    let ano = new Date().getFullYear();

    this.consulta = new Consulta();
    this.consulta.data = dia +"/"+mes+"/"+ano;
    this.consulta.marcador = this.authService.get_perfil + ' - ' + this.authService.get_user_displayName;
    this.consulta.paciente = paciente;
    this.consulta.medicamentos = this.medicamentos_adicionados;
    this.consulta.status = "Encerrada";
    this.consulta.tipo = "MEDICAMENTO";

    //Criar uma faturacao da consulta do tipo CONDUTA CLINICA --------------------
    let faturacao = new Faturacao();
    faturacao.categoria = "MEDICAMENTO";
    faturacao.valor = this.preco_total;
    faturacao.data = new Date();
    faturacao.consulta = this.consulta;
    faturacao.medicamentos = this.consulta.medicamentos;
    
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

  openSnackBar(mensagem) {
    this.snackBar.open(mensagem, null,{
      duration: 2000
    })
  }

  onNoClick(): void {
    this.dialogRef.close();
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

}

//CondutasDialog --------------------------------------------------------

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
  
  
  constructor(public dialog: MatDialog,public dialogRef: MatDialogRef<CondutasDialog>, private router: Router,
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





//ConsultasDialog ---------------------------------------------------------

@Component({
  selector: 'consultas-dialog',
  templateUrl: 'consultas.component.html',
  })
  export class ConsultasDialog {

  consultasFormGroup: FormGroup;
  //categorias: CategoriaConsulta[] = [];
  categoria:CategoriaConsulta;

  consulta?: Consulta;
  preco_total:Number = 0;

  constructor(  public dialogRef: MatDialogRef<ConsultasDialog>, private router: Router,
  @Inject(MAT_DIALOG_DATA) public data: any, public authService:AuthService,
  public pacienteService: PacienteService,  public snackBar: MatSnackBar, private _formBuilder: FormBuilder) {
    this.categoria = new CategoriaConsulta();
    this.consulta = new Consulta();

    this.consultasFormGroup = this._formBuilder.group({
      categoria_nome: ['', Validators.required],
      categoria_preco: ['', Validators.required]
    });
    this.consultasFormGroup.controls['categoria_preco'].disable();
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  marcarConsulta(paciente, tipo){
    if(this.categoria.nome){ //Garantir que categoria foi selecionada
      this.DiarioPdf(paciente);

      let dia = new Date().getDate();
      let mes = +(new Date().getMonth()) + +1;
      let ano = new Date().getFullYear();
      this.consulta.data = dia +"/"+mes+"/"+ano;

      this.consulta.marcador = this.authService.get_perfil + ' - ' + this.authService.get_user_displayName;
      this.consulta.paciente = paciente;
      this.consulta.status = "Aberta";
      this.consulta.tipo = tipo;
      this.consulta.preco_consulta_medica = this.categoria.preco;
      this.consulta.categoria = this.categoria;

      let data = Object.assign({}, this.consulta);

      this.pacienteService.marcarConsulta(data)
      .then( res => {
        this.dialogRef.close();
        this.openSnackBar("Consulta agendada com sucesso");
      }, err => {
        console.log("ERRO: " + err.message)
        this.openSnackBar("Ocorreu um erro ao marcar a consulta. Contacte o Admin do sistema.");
      })

    }else{
      this.openSnackBar("Selecione uma categoria de consulta");
    }
  }

  openSnackBar(mensagem) {
    this.snackBar.open(mensagem, null,{
      duration: 2000
    })
  }


  public DiarioPdf(paciente: Paciente){// criacao do pdf
    let docu = new jsPDF({
      orientation: 'p',
      unit: 'px',
      format: 'a4',
      putOnlyUsedFonts:true,
     });

     var img = new Image();
    
     img.src ="../../../assets/images/1 - logo - vitalle.jpg"; 
     
    
     docu.addImage(img,"PNG", 50, 5,90, 90);
     docu.setFont("Courier");
     docu.setFontStyle("normal"); 
     docu.setFontSize(12);
     docu.text(paciente.nome,77, 112);
     docu.text(paciente.nid+"", 252, 112);
     docu.setFontStyle("bold");
     docu.text("Nome:", 52, 112);
     docu.text("NID:", 232, 112);
     docu.text("Cama:", 317, 112);
  
     docu.text("Data", 55, 132);
     docu.text("Observações Clínicas", 109, 132);
     docu.text("Pr.terapêut", 262, 132);
     docu.text("Dieta", 345, 132);


     docu.rect ( 50, 80 , 350 , 20 ); 

     docu.rect ( 50, 100 , 180 , 20 ); 
     docu.rect (  230, 100 , 85 , 20 ); 
     docu.rect (  315, 100 , 85 , 20 ); 

     docu.rect ( 50, 120 , 30 , 20 ); 
     docu.rect (  80, 120 , 180 , 20 ); 
     docu.rect (  260, 120 , 80 , 20 );
     docu.rect (  340, 120 , 60 , 20 );

     docu.rect ( 50, 140 , 30 , 20 ); 
     docu.rect (  80, 140 , 180 , 20 ); 
     docu.rect (  260, 140 , 80 , 20 );
     docu.rect (  340, 140 , 60 , 20 );

     docu.rect ( 50, 160 , 30 , 20 ); 
     docu.rect (  80, 160 , 180 , 20 ); 
     docu.rect (  260, 160 , 80 , 20 );
     docu.rect (  340, 160 , 60 , 20 );

     docu.rect ( 50, 180 , 30 , 20 ); 
     docu.rect (  80, 180 , 180 , 20 ); 
     docu.rect (  260, 180 , 80 , 20 );
     docu.rect (  340, 180 , 60 , 20 );

     docu.rect ( 50, 200 , 30 , 20 ); 
     docu.rect (  80, 200 , 180 , 20 ); 
     docu.rect (  260, 200 , 80 , 20 );
     docu.rect (  340, 200 , 60 , 20 );

     docu.rect ( 50,  220 , 30 , 20 ); 
     docu.rect (  80,  220 , 180 , 20 ); 
     docu.rect (  260,  220 , 80 , 20 );
     docu.rect (  340,  220 , 60 , 20 );

    
     docu.rect ( 50,  240 , 30 , 20 ); 
     docu.rect (  80,  240 , 180 , 20 ); 
     docu.rect (  260,  240 , 80 , 20 );
     docu.rect (  340,  240 , 60 , 20 );


     docu.rect ( 50,  260 , 30 , 20 ); 
     docu.rect (  80,  260 , 180 , 20 ); 
     docu.rect (  260,  260 , 80 , 20 );
     docu.rect (  340,  260 , 60 , 20 );

     docu.rect ( 50,  280 , 30 , 20 ); 
     docu.rect (  80,  280 , 180 , 20 ); 
     docu.rect (  260,  280 , 80 , 20 );
     docu.rect (  340,  280 , 60 , 20 );

     docu.rect ( 50,  300 , 30 , 20 ); 
     docu.rect (  80,  300 , 180 , 20 ); 
     docu.rect (  260,  300 , 80 , 20 );
     docu.rect (  340,  300 , 60 , 20 );

     docu.rect ( 50,  320 , 30 , 20 ); 
     docu.rect (  80,  320 , 180 , 20 ); 
     docu.rect (  260,  320 , 80 , 20 );
     docu.rect (  340,  320 , 60 , 20 );

     docu.rect ( 50,   340 , 30 , 20 ); 
     docu.rect (  80,   340 , 180 , 20 ); 
     docu.rect (  260,   340 , 80 , 20 );
     docu.rect (  340,   340 , 60 , 20 );


     docu.rect ( 50,   360 , 30 , 20 ); 
     docu.rect (  80,   360 , 180 , 20 ); 
     docu.rect (  260,   360 , 80 , 20 );
     docu.rect (  340,   360 , 60 , 20 );



     docu.rect ( 50,   380  , 30 , 20 ); 
     docu.rect (  80,   380  , 180 , 20 ); 
     docu.rect (  260,   380  , 80 , 20 );
     docu.rect (  340,   380  , 60 , 20 );

     docu.rect ( 50,   400  , 30 , 20 ); 
     docu.rect (  80,   400  , 180 , 20 ); 
     docu.rect (  260,   400  , 80 , 20 );
     docu.rect (  340,   400  , 60 , 20 );




     docu.rect ( 50,   420   , 30 , 20 ); 
     docu.rect (  80,   420   , 180 , 20 ); 
     docu.rect (  260,   420   , 80 , 20 );
     docu.rect (  340,   420   , 60 , 20 );

     docu.rect ( 50,   440   , 30 , 20 ); 
     docu.rect (  80,   440   , 180 , 20 ); 
     docu.rect (  260,   440   , 80 , 20 );
     docu.rect (  340,   440   , 60 , 20 );

     docu.rect ( 50,   460   , 30 , 20 ); 
     docu.rect (  80,   460   , 180 , 20 ); 
     docu.rect (  260,   460   , 80 , 20 );
     docu.rect (  340,   460   , 60 , 20 );

     docu.rect ( 50,   480   , 30 , 20 ); 
     docu.rect (  80,   480   , 180 , 20 ); 
     docu.rect (  260,   480   , 80 , 20 );
     docu.rect (  340,   480   , 60 , 20 );

     docu.rect ( 50,   500   , 30 , 20 ); 
     docu.rect (  80,   500   , 180 , 20 ); 
     docu.rect (  260,   500   , 80 , 20 );
     docu.rect (  340,   500   , 60 , 20 );

     docu.rect ( 50,   520   , 30 , 20 ); 
     docu.rect (  80,   520   , 180 , 20 ); 
     docu.rect (  260,   520   , 80 , 20 );
     docu.rect (  340,   520   , 60 , 20 );

     docu.rect ( 50,   540   , 30 , 20 ); 
     docu.rect (  80,   540   , 180 , 20 ); 
     docu.rect (  260,   540   , 80 , 20 );
     docu.rect (  340,   540   , 60 , 20 );

     docu.rect ( 50,   560   , 30 , 20 ); 
     docu.rect (  80,   560   , 180 , 20 ); 
     docu.rect (  260,   560   , 80 , 20 );
     docu.rect (  340,   560   , 60 , 20 );

     docu.rect ( 50,   580   , 30 , 20 ); 
     docu.rect (  80,   580   , 180 , 20 ); 
     docu.rect (  260,   580   , 80 , 20 );
     docu.rect (  340,   580   , 60 , 20 );

     docu.rect ( 50,   600   , 30 , 20 ); 
     docu.rect (  80,   600   , 180 , 20 ); 
     docu.rect (  260,   600   , 80 , 20 );
     docu.rect (  340,   600   , 60 , 20 );

     docu.setFont("Courier");
     docu.setFontStyle("normal"); 
     docu.setFontSize(15);
     docu.setFontStyle("bold");
     docu.text("DIÁRIO CLÍNICO", 175, 92);

     docu.save('diario.pdf');  //nome do arquivo
  }  




}




//DiagnosticosDialog ---------------------------------------------------------

@Component({
  selector: 'diagnosticos-dialog',
  templateUrl: 'diagnosticos.component.html',
  })
  export class DiagnosticosDialog {

  diagnosticoFormGroup: FormGroup;
  diagnosticos: DiagnosticoAuxiliar[] = [];
  diagnostico:DiagnosticoAuxiliar;
  diagnosticos_param: DiagnosticoAuxiliar[] = [];

  dataSourse: MatTableDataSource<DiagnosticoAuxiliar>;
  displayedColumns = ['tipo','subtipo','nome','preco', 'remover'];

  consulta?: Consulta;
  preco_total:Number = 0;

  tipodiagnostico: TipoDiagnosticoAux;
  subtipodiagnostico: SubTipoDiagnosticoAux;
  subtipos_diagnosticos_param: SubTipoDiagnosticoAux[] = [];

  constructor(  public dialogRef: MatDialogRef<DiagnosticosDialog>, private router: Router,
  @Inject(MAT_DIALOG_DATA) public data: any, public authService:AuthService,
  public pacienteService: PacienteService,  public snackBar: MatSnackBar, 
  private _formBuilder: FormBuilder, public configServices: ConfiguracoesService) {
    this.diagnostico = new DiagnosticoAuxiliar();

    this.diagnosticoFormGroup = this._formBuilder.group({
      diagnostico_tipo: [''],
      diagnostico_subtipo: [''],
      diagnostico_nome: ['', Validators.required],
      diagnostico_preco: ['', Validators.required]
    });
    this.diagnosticoFormGroup.controls['diagnostico_preco'].disable();

    this.dataSourse=new MatTableDataSource(this.diagnosticos);
    this.diagnosticos_param = this.data.diagnosticos;
    this.subtipos_diagnosticos_param = this.data.subtipos_diagnosticos;
  }

  filtrarTipo(tipo: TipoDiagnosticoAux) {
    this.diagnostico = new DiagnosticoAuxiliar();
    this.diagnostico.tipo = tipo;

    this.data.diagnosticos = null;
    this.data.diagnosticos = this.diagnosticos_param.filter(item => item.tipo.nome == tipo.nome);
    
    this.subtipodiagnostico = new SubTipoDiagnosticoAux();
    this.data.subtipos_diagnosticos = null;
    this.data.subtipos_diagnosticos = this.subtipos_diagnosticos_param.filter(item => item.tipo.nome == tipo.nome);
  }

  filtrarSubTipo(subtipo: SubTipoDiagnosticoAux){
    this.diagnostico = new DiagnosticoAuxiliar();
    this.diagnostico.subtipo = subtipo;

    this.data.diagnosticos = null;
    this.data.diagnosticos = this.diagnosticos_param.filter(item =>  deepEqual(item.subtipo,subtipo))
  }
  
  addDiognostico(diagnostico:DiagnosticoAuxiliar){
    if(diagnostico.nome){
      this.diagnosticos.push(diagnostico);

      this.preco_total = +this.preco_total + +diagnostico.preco;
  
      this.dataSourse=new MatTableDataSource(this.diagnosticos);
      this.diagnostico = new DiagnosticoAuxiliar();
      this.tipodiagnostico = new TipoDiagnosticoAux();
      this.subtipodiagnostico = new SubTipoDiagnosticoAux();
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


  faturarDiagnostico(paciente:Paciente){
    //Abrir uma consulta DIAGNOSTICO AUXILIAR --------------------
    let dia = new Date().getDate();
    let mes = +(new Date().getMonth()) + +1;
    let ano = new Date().getFullYear();

    this.consulta = new Consulta();
    this.consulta.data = dia +"/"+mes+"/"+ano;
    this.consulta.marcador = this.authService.get_perfil + ' - ' + this.authService.get_user_displayName;
    this.consulta.paciente = paciente;
    this.consulta.diagnosticos_aux = this.diagnosticos;
    this.consulta.status = "Encerrada";
    this.consulta.tipo = "DIAGNOSTICO AUX";

    //Criar uma faturacao da consulta do tipo CONDUTA CLINICA --------------------
    let faturacao = new Faturacao();
    faturacao.categoria = "DIAGNOSTICO_AUX";
    faturacao.valor = this.preco_total;
    faturacao.data = new Date();
    faturacao.consulta = this.consulta;
    faturacao.diagnostico_aux = this.consulta.diagnosticos_aux;
    
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



  marcarConsulta(paciente:Paciente){


    /*let dia = new Date().getDate();
    let mes = +(new Date().getMonth()) + +1;
    let ano = new Date().getFullYear();

    this.consulta = new Consulta();
    this.consulta.data = dia +"/"+mes+"/"+ano;
    this.consulta.marcador = this.authService.get_perfil + ' - ' + this.authService.get_user_displayName;
    this.consulta.paciente = paciente;
    this.consulta.diagnosticos_aux = this.diagnosticos;
    this.consulta.status = "Diagnostico";
    this.consulta.tipo = "DIAGNOSTICO AUX";

    let data = Object.assign({}, this.consulta);

    this.pacienteService.marcarConsulta(data)
    .then( res => {
      this.dialogRef.close();
      this.openSnackBar("Consulta agendada com sucesso");
    }, err => {
      console.log("ERRO: " + err.message)
      this.openSnackBar("Ocorreu um erro ao marcar a consulta. Contacte o Admin do sistema.");
    })*/
  }

  openSnackBar(mensagem) {
    this.snackBar.open(mensagem, null,{
      duration: 2000
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

  }
  export interface DialogData {
    animal: string;
    name: string;
  }
  
  /**
   * @title Dialog Overview
   */
  @Component({
    selector: 'dialog-detalhes',
    templateUrl: './detalhes.component.html',
    styleUrls: ['./detalhes.component.scss']
  })
  
  
  export class DialogDetalhes {
    


    constructor(
      public dialogRef: MatDialogRef<DialogDetalhes>,
      @Inject(MAT_DIALOG_DATA) public data: DialogData,private pacienteService: PacienteService) {
       
        
        
      }
      closeModal(){
   
        this.dialogRef.close();
      }
      
    
  }