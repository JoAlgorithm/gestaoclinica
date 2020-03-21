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
import { MovimentoEstoque } from '../../classes/movimento_estoque';
import { NrCotacao } from '../../classes/nr_cotacao';
import { NrFatura } from '../../classes/nr_fatura';
import { User } from '../../classes/user';
import { Seguradora } from '../../classes/seguradora';
import { Conta, Linha } from '../../classes/conta';
import { CategoriaMedicamento } from '../../classes/categoria_medicamento';
import { TipoEstoque } from '../../classes/tipo_estoque';
//import { MatProgressButtonOptions } from 'mat-progress-buttons';


@Component({
  selector: 'app-listagem',
  templateUrl: './listagem.component.html',
  styleUrls: ['./listagem.component.scss']
})
export class ListagemComponent implements OnInit {

  perfil = "";
  acesso_remover = true;
  acesso_faturar_all = true;
  clinica: Clinica = new Clinica();
  nrscotacao: NrCotacao[]; //PDF
  nr_cotacao = 0; //PDF
  nrsfaturcao: NrFatura[]; //PDF
  nr_fatura = 0; //PDF

  // trigger-variable for Ladda
  isLoading: boolean = false;
    
  toggleLoading() {
    this.isLoading = !this.isLoading;
  }

  datanascimento: Date;
  data_nascimento: Date;
  pacientes: Paciente[];
  dataSourse: MatTableDataSource<Paciente>;
  displayedColumns = ['nid','apelido', 'nome', 'sexo', 'documento_identificacao', 'referencia_telefone', 'detalhe','editar', 'consulta', 'remover'];
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  consulta: Consulta;
 
  diagnosticos:DiagnosticoAuxiliar[];

  condutas:CondutaClinica[];
  
 
  tiposconduta: TipoCondutaClinica[];
  tiposcondutas_aux: TipoCondutaClinica[];

  categorias_consulta: CategoriaConsulta[];
  categorias_consulta_aux:CategoriaConsulta[];

  tipos_diagnosticos: TipoDiagnosticoAux[];
  tipos_diagnosticos_aux: TipoDiagnosticoAux[];
  subtipos_diagnosticos: SubTipoDiagnosticoAux[];
  subtipos_diagnosticos_aux: SubTipoDiagnosticoAux[];

  depositos: Deposito[];
  sexos = [
    {value: 'Feminino', viewValue: 'Feminino'},
    {value: 'Masculino', viewValue: 'Masculino'}
  ];

  documentos_identificacao = [
    {value: 'BI', viewValue: 'Bilhete de identidade'},
    {value: 'Cedula', viewValue: 'Cedula'},
    {value: 'Passaporte', viewValue: 'Passaporte'},
    {value: 'Certidao de nascimento', viewValue: 'Certidao de nascimento'},
    {value: 'DIRE', viewValue: 'DIRE'},
    {value: 'Outros', viewValue: 'Outros'},
  ]
  provincias = [
    {value: 'Maputo', viewValue: 'Maputo'},
    {value: 'Gaza', viewValue: 'Gaza'},
    {value: 'Inhambane', viewValue: 'Inhambane'},
    {value: 'Sofala', viewValue: 'Sofala'},
    {value: 'Tete', viewValue: 'Tete'},
    {value: 'Quelimane', viewValue: 'Quelimane'},
    {value: 'Nampula', viewValue: 'Nampula'},
    {value: 'Cabo Delgado', viewValue: 'Cabo Delgado'},
    {value: 'Niassa', viewValue: 'Niassa'},
    {value: 'Zambezia', viewValue: 'Zambezia'}
  ]

  formas_pagamento = [
    {value: 'Cartão de crédito', viewValue: 'Cartão de crédito'},
    {value: 'Convênio', viewValue: 'Convênio'},
    {value: 'Numerário', viewValue: 'Numerário'},
  ]
 

  users: User[];
  medicos: string[] = [];

  seguradoras: Seguradora[];

  cats_medicamento: CategoriaMedicamento[];
  tipos_estoque: TipoEstoque[];

  constructor(public dialog: MatDialog, public authService: AuthService, public configServices:ConfiguracoesService,
    private pacienteService: PacienteService,public snackBar: MatSnackBar, private router: Router, public estoqueService: EstoqueService){ 
    this.consulta = new Consulta();
 }

  ngOnInit() {
    this.perfil = this.authService.get_perfil;
    if(this.perfil == 'Clinica_Admin'){
      this.acesso_remover = false;
    }else if(this.perfil == 'Farmacia_Admin'){
      this.acesso_remover = false;
    }

    if(this.perfil == 'Farmacia_Admnistrativo' || this.perfil == 'Farmacia_Admin'){
      this.acesso_faturar_all = false;
    }

    //PDF
    this.configServices.getNrsCotacao().snapshotChanges().subscribe(data => {
      this.nrscotacao = data.map(e => {
        return {
          id: e.payload.key,
          ...e.payload.val(),
        } as NrCotacao;
      });

      if(typeof this.nrscotacao !== 'undefined' && this.nrscotacao.length > 0){
        this.nr_cotacao = Math.max.apply(Math, this.nrscotacao.map(function(o) { return o.id; }));

        if(this.nr_cotacao.toString().substr(0,4) == new Date().getFullYear().toString()){
          //Se nao bater significa que mudamos de ano e precisamos recomecar a contagem    
          this.nr_cotacao = this.nr_cotacao+1;
        }else{
          this.nr_cotacao =  +(new Date().getFullYear()+'000001');
        }
        
      }else{
        this.nr_cotacao =  +(new Date().getFullYear()+'000001');
      }
      return this.nr_cotacao;
    })

    //PDF
    this.configServices.getNrsFatura().snapshotChanges().subscribe(data => {
      this.nrsfaturcao = data.map(e => {
        return {
          id: e.payload.key,
          ...e.payload.val(),
        } as NrFatura;
      });

      if(typeof this.nrsfaturcao !== 'undefined' && this.nrsfaturcao.length > 0){
        this.nr_fatura = Math.max.apply(Math, this.nrsfaturcao.map(function(o) { return o.id; }));
        
        if(this.nr_fatura.toString().substr(0,4) == new Date().getFullYear().toString()){
          //Se nao bater significa que mudamos de ano e precisamos recomecar a contagem  
          this.nr_fatura = this.nr_fatura+1;
        }else{
          this.nr_fatura =  +(new Date().getFullYear()+'000001');
        }
        
      }else{
        this.nr_fatura =  +(new Date().getFullYear()+'000001');
      }
      return this.nr_fatura;
    })

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
      });
      this.tiposcondutas_aux=this.tiposconduta;
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
      });
    
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

    //USERS
    this.configServices.getUsers().snapshotChanges().subscribe(data => {
      this.users = data.map(e => {
        return {
          uid: e.payload.key,
          ...e.payload.val(),
        } as User;
      });

      this.medicos = [];
      this.users.forEach(element => {
        if(element.clinica_id == this.authService.get_clinica_id && (element.perfil == "Clinica_Medico" || element.perfil == "Clinica_Admin")){
          if(element.displayName !== undefined){
            this.medicos.push(element.displayName);
          }
        }
      });

      //console.log("Medicos Total "+this.medicos.length)
    })

    //SEGURADORAS
    this.configServices.getSeguradoras().snapshotChanges().subscribe(data => {
      this.seguradoras = data.map(e => {
        return {
          id: e.payload.key,
          ...e.payload.val(),
        } as Seguradora;
      })
    }) 

    //FORMA FARMACEUTICA
    this.estoqueService.getCategoriasMedicamento().snapshotChanges().subscribe(data => {
      this.cats_medicamento = data.map(e => {
        return {
          id: e.payload.key,
          ...e.payload.val(),
        } as CategoriaMedicamento;
      });
    })

    //CATEGORIA MEDICAMENTO
    this.estoqueService.getTiposEstoque().snapshotChanges().subscribe(data => {
      this.tipos_estoque = data.map(e => {
        return {
          id: e.payload.key,
          ...e.payload.val(),
        } as TipoEstoque;
      });
    })

  }
 


  
  detalhes(doente){
  
    const dialogRef = this.dialog.open(DialogDetalhes, {
     
      width: '1000px',
     data: { nid: doente.nid,telefone: doente.telefone, data_nascimento: doente.datanascimento,apelido: doente.apelido, 
      nome: doente.nome, genero:doente.sexo,
       documento_identificacao: doente.documento_identificacao, 
       nr_documento_identificacao: doente.nr_documento_identificacao,
       localidade: doente.localidade,bairro:doente.bairro,
       avenida: doente.avenida, rua:doente.rua,casa: doente.casa,
       celula:doente.celula,quarteirao:doente.quarteirao,
       posto_admnistrativo: doente.posto_admnistrativo,
       distrito: doente.distrito,provincia:doente.provincia,
       acompanhante_nome:doente.referencia_nome,
       acompanhante_apelido:doente.referencia_apelido,
      acompanhante_telefone: doente.referencia_telefone,
      nuit: doente.nuit,
        
      }
    });
  }




  editar(doente: Paciente){

    const dialogRef = this.dialog.open(DialogEditar, {
      width: '1000px',
      data:{doente: doente,data_nascimento: this.data_nascimento=new Date(), 
        sexos: this.sexos,documentos_identificacao: this.documentos_identificacao,
        provincias: this.provincias,
      
      
      }
      
    });
    dialogRef.afterClosed().subscribe(result => {
      
      //console.log('The dialog was closed');
      
      // this.animal = result;
      
    });
   
  
    }


  marcarConsulta(paciente, tipo){
    let dialogRef = this.dialog.open(ConsultasDialog, {
      width: '800px',
      data: { paciente: paciente, tipo: tipo, categorias_consulta: this.categorias_consulta, clinica: this.clinica, nr_cotacao: this.nr_cotacao, nr_fatura: this.nr_fatura, medicos: this.medicos, formas_pagamento: this.formas_pagamento, seguradoras: this.seguradoras  }
    });
    dialogRef.afterClosed().subscribe(result => {
    //console.log("result "+result);
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
    if(this.nr_cotacao > 0 && this.nr_fatura >0){
      let dialogRef = this.dialog.open(DiagnosticosDialog, {
      width: '800px',
      data: { paciente: row, diagnosticos: this.diagnosticos,
        tipos_diagnosticos:this.tipos_diagnosticos, subtipos_diagnosticos:this.subtipos_diagnosticos
        , clinica: this.clinica, nr_cotacao: this.nr_cotacao, nr_fatura: this.nr_fatura, medicos: this.medicos,
        formas_pagamento: this.formas_pagamento, seguradoras: this.seguradoras
      }
      });
      dialogRef.afterClosed().subscribe(result => {
        this.configServices.getDiagnosticos().snapshotChanges().subscribe(data => {
          this.diagnosticos = data.map(e => {
            return {
              id: e.payload.key,
              ...e.payload.val(),
            } as DiagnosticoAuxiliar;
          })
        })
      });
    }else{
      this.openSnackBar("Processando nr de cotacao/fatura. Tente novamente.");
    } 
  }

  openConduta(row: Paciente): void {
    if(this.nr_cotacao > 0 && this.nr_fatura >0){
      let dialogRef = this.dialog.open(CondutasDialog, {
      width: '900px',
      data: { paciente: row, condutas: this.condutas, tiposconduta: this.tiposconduta, clinica: this.clinica, nr_cotacao: this.nr_cotacao, nr_fatura: this.nr_fatura, medicos: this.medicos, formas_pagamento: this.formas_pagamento, seguradoras: this.seguradoras }
      });
      dialogRef.afterClosed().subscribe(result => {
        this.configServices.getCondutasClinica().snapshotChanges().subscribe(data => {
          this.condutas = data.map(e => {
            return {
              id: e.payload.key,
              ...e.payload.val(),
            } as CondutaClinica;
          })
        })
      });
    }else{
      this.openSnackBar("Processando nr de cotacao/fatura. Tente novamente.");
    } 
  }

  openMedicamento(row: Paciente){
    console.log("nr fatura: "+this.nr_fatura);
    if(this.nr_cotacao > 0 && this.nr_fatura >0){
      let dialogRef = this.dialog.open(MedicamentosDialog, {
        width: '800px',
        data: { paciente: row, depositos: this.depositos, clinica: this.clinica, nr_cotacao: this.nr_cotacao, nr_fatura: this.nr_fatura, formas_pagamento: this.formas_pagamento, seguradoras: this.seguradoras, cats_medicamento: this.cats_medicamento, tipos_estoque: this.tipos_estoque }
      });
      dialogRef.afterClosed().subscribe(result => {
        //console.log("result "+result);
      });
    }else{
      this.openSnackBar("Processando nr de cotacao/fatura. Tente novamente.");
    }
    
  }

  remover(row: Paciente){

    let dialogRef = this.dialog.open(RemoverDialog, {
      width: '500px',
      data: { paciente: row }
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



//RemoverDialog --------------------------------------------------------
@Component({
  selector: 'remover-dialog',
  templateUrl: 'remover.component.html',
})
export class RemoverDialog {

  constructor(public dialog: MatDialog,public dialogRef: MatDialogRef<RemoverDialog>, private router: Router,
  @Inject(MAT_DIALOG_DATA) public data: any, public pacienteService:PacienteService, 
   public snackBar: MatSnackBar, private _formBuilder: FormBuilder) {

  }

  remover(id){
    this.pacienteService.deletePaciente(id)
    .then(r =>{
      this.dialogRef.close();
      this.openSnackBar("Removido com sucesso");
    },err =>{
      this.openSnackBar("Ocorreu um erro ao remover! Contacte a equipe de suporte ou tente novamente");
    })
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  openSnackBar(mensagem) {
    this.snackBar.open(mensagem, null,{
      duration: 2000
    })
  }

}




//MedicamentosDialog --------------------------------------------------------
@Component({
  selector: 'medicamentos-dialog',
  templateUrl: 'medicamentos.component.html',
})
export class MedicamentosDialog {

  clinica: Clinica; //PDF
  nr_cotacao = 0; //PDF
  nr_fatura = 0; //PDF

  desabilitar: boolean = false; //Fatura
  desabilitar2: boolean = false; //Cotacao
  texto: string = "Faturar"; //Fatura
  texto2: string = "Cotar"; //Cotacao

  medicamentoFormGroup: FormGroup;
  medicamentos: Medicamento[] = [];
  medicamentos_aux: Medicamento[] = [];
  //medicamentos_adicionados: Medicamento[] = [];

  movimentos: MovimentoEstoque[] = [];
  movimentos_aux: MovimentoEstoque[] = [];
  movimento: MovimentoEstoque = new MovimentoEstoque();

  medicamento: Medicamento;
  deposito: Deposito;
  depositos: Deposito[];
  depositos_aux: Deposito[];
  preco_total:Number = 0;
  max: Number = 1;
  min: Number = 1;

  //dataSourse: MatTableDataSource<Medicamento>;
  dataSourse: MatTableDataSource<MovimentoEstoque>;
  displayedColumns = ['medicamento','qtd_solicitada', 'preco_unit', 'preco_venda_total', 'remover'];

  consulta?: Consulta;

  forma_pagamento = "";

  seguradora: Seguradora;

  nr_apolice = "";

  cats_medicamento: CategoriaMedicamento[];
  cats_medicamento_aux: CategoriaMedicamento[];

  categoria: CategoriaMedicamento;
  categorias: CategoriaMedicamento[];
  categorias_aux: CategoriaMedicamento[];

  linhas: Linha[] = [];

  tipoEstoque: TipoEstoque;

  constructor(public dialog: MatDialog,public dialogRef: MatDialogRef<MedicamentosDialog>, private router: Router,
  @Inject(MAT_DIALOG_DATA) public data: any, public authService:AuthService, public estoqueService: EstoqueService, 
  public pacienteService: PacienteService,  public snackBar: MatSnackBar, private _formBuilder: FormBuilder,
  public configServices: ConfiguracoesService) {

    this.deposito = new Deposito();
    this.seguradora = new Seguradora();
    this.tipoEstoque = new TipoEstoque();
    
    
    this.categoria = new CategoriaMedicamento();

    this.medicamento = new Medicamento();
    this.depositos_aux=this.data.depositos;
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

    this.clinica = this.data.clinica; //PDF
    this.nr_cotacao = this.data.nr_cotacao; //PDF
    this.nr_fatura = this.data.nr_fatura; //PDF
    ///console.log("dialog nr fatura: "+this.nr_fatura);
    this.cats_medicamento = data.cats_medicamento;
    this.cats_medicamento_aux = data.cats_medicamento;

    //this.categorias = data.tipos_estoque;
    //this.categorias_aux = data.tipos_estoque;
    
  }

  filtrodeposito;
  filtrarDepositos(filtrodeposito) {
    this.medicamento = new Medicamento();
    if(filtrodeposito){
      filtrodeposito = filtrodeposito.trim(); // Remove whitespace
      filtrodeposito = filtrodeposito.toLowerCase(); // Datasource defaults to lowercase matches
     
      this.depositos= null;

      this.data.depositos = this.depositos_aux.filter(item => item.nome.toLocaleLowerCase().indexOf(filtrodeposito) > -1);     
    }else{
      this.data.depositos = this.depositos_aux;
    }
  }

  filtrocategoria="";
  desabilitar_fm = true;
  filtrarCategorias(filtrocategoria: TipoEstoque) {
    console.log("filtrocategoria "+this.tipoEstoque.nome);
    if(filtrocategoria.nome == "Medicamento"){
      this.desabilitar_fm = false;
    }else{
      this.desabilitar_fm = true;
      this.categoria = null;
      //this.medicamento.categoria = null;
    }

    //this.filtrocategoria = filtrocategoria;

    if(filtrocategoria){
      //console.log("categoria: "+filtrocategoria);
      //filtrocategoria = filtrocategoria.nome.trim()+; // Remove whitespace
      //filtrocategoria = filtrocategoria.nome.toLowerCase(); // Datasource defaults to lowercase matches
     
      this.medicamentos= null;
      this.medicamentos = this.medicamentos_aux.filter(item => item.tipo.nome.indexOf(filtrocategoria.nome+"") > -1);     
    }else{
     // this.medicamentos = this.medicamentos_aux;
    }
  }

  filtromedicamento="";
  filtrarMedicamentos(filtromedicamento) {
    if(filtromedicamento){
      filtromedicamento = filtromedicamento.trim(); // Remove whitespace
      filtromedicamento = filtromedicamento.toLowerCase(); // Datasource defaults to lowercase matches
     
      this.medicamentos= null;
      this.medicamentos = this.medicamentos_aux.filter(item => item.nome_comercial.toLocaleLowerCase().indexOf(filtromedicamento) > -1);     
    }else{
      this.medicamentos = this.medicamentos_aux;
    }
  }

  filtrartipomedic="";
  filtrarTipoMedicamento(filtrartipomedic) {
    if(filtrartipomedic){
      filtrartipomedic = filtrartipomedic.trim(); // Remove whitespace
      filtrartipomedic = filtrartipomedic.toLowerCase(); // Datasource defaults to lowercase matches
     
      this.cats_medicamento = null;
      this.cats_medicamento = this.cats_medicamento_aux.filter(item => item.nome.toLocaleLowerCase().indexOf(filtrartipomedic) > -1);     
    }else{
      this.cats_medicamento = this.cats_medicamento_aux;
    }
  }

  f_farmaceutica="";
  filtrarmedicamento(f_farmaceutica){
    this.medicamento = new Medicamento();
    if(f_farmaceutica && f_farmaceutica !== ""){
      //this.medicamentos= null;

      //this.medicamentos = this.medicamentos_aux.filter(item => item.nome_comercial.toLocaleLowerCase().indexOf(this.filtromedicamento) > -1);     
      
      /*this.filtrocategoria.trim(); // Remove whitespace
      this.filtrocategoria.toLowerCase(); // Datasource defaults to lowercase matches
     
      this.medicamentos= null;
      this.medicamentos = this.medicamentos_aux.filter(item => item.tipo.nome.toLocaleLowerCase().indexOf(this.filtrocategoria) > -1);  */   

      this.filtrarCategorias(this.tipoEstoque);

      this.medicamentos = this.medicamentos.filter(item => item.categoria.nome.indexOf(f_farmaceutica.nome) > -1);     
    }else{
      this.medicamentos = this.medicamentos_aux;
    }
  }


  precoSegurado = false;
  mudarFPagamento(){
    this.nr_apolice = "";
    this.seguradora = new Seguradora();
    if(this.medicamento.preco_venda){
      if(this.forma_pagamento == "Convênio"){
        this.precoSegurado = true;
      }else{
        this.precoSegurado = false;
      }
    }
    this.validarQtd(this.medicamento.qtd_solicitada);
  }


  getMedicamentos(deposito: Deposito){
    this.medicamentos = [];
    this.medicamentos_aux = [];
    this.medicamento = new Medicamento();
    this.max = 1;
    if(deposito.medicamentos){

      Object.keys(deposito.medicamentos).forEach(key=>{
        this.medicamentos.push(deposito.medicamentos[key]);
      })

      this.medicamentos_aux = this.medicamentos;
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

      if(this.forma_pagamento == "Convênio"){
        this.medicamento.preco_venda_total = qtd_solicitada*this.medicamento.preco_seguradora;
      }else{
        this.medicamento.preco_venda_total = qtd_solicitada*this.medicamento.preco_venda;
      }
      
    
    }else{
      this.medicamento.preco_venda_total = 0;
    }
  }

  addMedicamento(){
    if(this.medicamento.qtd_solicitada){

      let check = true;
      this.movimentos.forEach(md => {
        if(md.id == this.medicamento.id && md.deposito.id == this.deposito.id){
          check = false;
          return;
        }
      });

      if(check){
        if( Number(this.medicamento.qtd_solicitada) <= Number(this.medicamento.qtd_disponivel)){
          this.movimento.medicamento = this.medicamento;
          this.movimento.deposito = this.deposito;
          this.movimento.quantidade = this.medicamento.qtd_solicitada; 
          
          let linha = new Linha();
          linha.descricao_servico = this.medicamento.nome_comercial;
          linha.qtd_solicitada = this.medicamento.qtd_solicitada;
          linha.id_servico = this.medicamento.id;
    
          if(this.forma_pagamento == "Convênio"){
            this.movimento.medicamento.preco_venda_total = this.medicamento.preco_seguradora*this.medicamento.qtd_solicitada;
            this.preco_total = +this.preco_total + +(this.medicamento.preco_seguradora*this.medicamento.qtd_solicitada); 
            linha.preco_unitario = this.medicamento.preco_seguradora;
            linha.preco_total = this.medicamento.preco_seguradora*this.medicamento.qtd_solicitada;
          }else{
            this.movimento.medicamento.preco_venda_total = this.medicamento.preco_venda*this.medicamento.qtd_solicitada;
            this.preco_total = +this.preco_total + +(this.medicamento.preco_venda*this.medicamento.qtd_solicitada); 
            linha.preco_unitario = this.medicamento.preco_venda;
            linha.preco_total = this.medicamento.preco_seguradora*this.medicamento.qtd_solicitada;
          }
          
          let valor_tota_entrada = this.medicamento.valor_tota_entrada ? this.medicamento.valor_tota_entrada : 0;
          let valor_medio_entrada = this.medicamento.valor_medio_entrada ? this.medicamento.valor_medio_entrada : 0;
          if(this.medicamento.qtd_disponivel - this.medicamento.qtd_solicitada == 0){
            console.log("Valor de estoque unitario e toal vai alterar para zero");
          }else{
            console.log("Valor de estoque total vai alterar de "+valor_tota_entrada+" para "+valor_medio_entrada*(this.medicamento.qtd_disponivel - this.medicamento.qtd_solicitada))
          }

          this.linhas.push(linha);
          //this.listarLinhas();
          this.texto = "Faturar "+ this.preco_total.toFixed(2).replace(".",",") +" MZN";
          this.medicamento.qtd_disponivel = +this.medicamento.qtd_disponivel - +this.medicamento.qtd_solicitada;

          this.movimentos.push(this.movimento);
          this.movimentos_aux = this.movimentos;
          this.dataSourse=new MatTableDataSource(this.movimentos);
    
          this.medicamento = new Medicamento();
          this.movimento = new MovimentoEstoque();
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

  removeMedicamento(mv: MovimentoEstoque){
    let linha = new Linha();
    linha.descricao_servico = mv.medicamento.nome_generico;
    linha.qtd_solicitada = mv.medicamento.qtd_solicitada;
    linha.preco_total = mv.medicamento.preco_venda;
    linha.preco_unitario = mv.medicamento.preco_venda / mv.medicamento.qtd_solicitada;

    mv.medicamento.qtd_disponivel = +mv.medicamento.qtd_disponivel + +mv.medicamento.qtd_solicitada;
    this.preco_total = +this.preco_total - (mv.medicamento.qtd_solicitada*mv.medicamento.preco_venda);
    this.texto = "Faturar "+ this.preco_total.toFixed(2).replace(".",",") +" MZN";
    this.movimentos.splice(this.movimentos.indexOf(mv), 1);
    this.movimentos_aux = this.movimentos;
    this.dataSourse=new MatTableDataSource(this.movimentos);

    this.linhas.forEach(element => {
      if(element.id_servico == mv.medicamento.id){
        this.linhas.splice(this.linhas.indexOf(element), 1);
      }
    });

    //this.listarLinhas();
  }

  cotar(paciente: Paciente){
    if(this.movimentos.length>0){
      this.desabilitar2 = true;
      this.texto2 = "AGUARDE UM INSTANTE...";

      this.downloadPDF(this.movimentos, paciente, "Cotacao");
      this.texto2 = "Cotar";
      //this.desabilitar = false;
    }else{
      this.openSnackBar("Adicione pelo menos um medicamento.");
    }
  }

  listarLinhas(){
    console.log("LISTAGEM DE LINHAS: ");
    this.linhas.forEach(element => {
      console.log(element.descricao_servico + ' /precounit ' +element.preco_unitario + ' /qtd '+element.qtd_solicitada);
      console.log("");
    });
  }

  faturar(paciente: Paciente){
    if(this.movimentos.length>0){ //Verificar se tem informacao no array
      var updatedUserData = {};

      if(this.forma_pagamento == "Convênio"){  
        if(this.nr_apolice == "" || this.nr_apolice == null){
          this.openSnackBar("Preencha o nr da apolice");
          return;
        }

        if(this.seguradora.nome == "" || this.seguradora.nome == null){
          this.openSnackBar("Selecione a seguradora");
          return;
        }
      }

      this.desabilitar = true;
      this.texto = "AGUARDE UM INSTANTE...";

      //Abrir uma CONSULTA CLINICA --------------------
      let dia = new Date().getDate();
      let mes = this.getMes(+(new Date().getMonth()) + +1);
      let ano = new Date().getFullYear();  
      this.consulta = new Consulta();
      this.consulta.data = dia +"/"+mes+"/"+ano;
      this.consulta.ano = ano;
      this.consulta.marcador = this.authService.get_perfil + ' - ' + this.authService.get_user_displayName;
      //this.consulta.paciente = paciente;
      this.consulta.paciente_nome = paciente.nome;
      this.consulta.paciente_apelido = paciente.apelido;
      this.consulta.paciente_nid = paciente.nid;
      this.consulta.movimentosestoque = this.movimentos;

      let servico = "Medicamentos: ";

      this.consulta.movimentosestoque.forEach(mvt => {
        //console.log("mvt.medicamento.qtd_solicitada: "+mvt.medicamento.qtd_solicitada);
        mvt.medicamento.qtd_solicitada = null;


        let valor_tota_entrada = mvt.medicamento.valor_tota_entrada ? mvt.medicamento.valor_tota_entrada : 0;
        let valor_medio_entrada = mvt.medicamento.valor_medio_entrada ? mvt.medicamento.valor_medio_entrada : 0;
        if(mvt.medicamento.qtd_disponivel - mvt.medicamento.qtd_solicitada == 0){
          console.log("Valor de estoque unitario e toal vai alterar para zero");
          mvt.medicamento.valor_medio_entrada = 0;
          mvt.medicamento.valor_tota_entrada = 0;
        }else{
          console.log("Valor de estoque total vai alterar de "+valor_tota_entrada+" para "+valor_medio_entrada*(mvt.medicamento.qtd_disponivel - mvt.medicamento.qtd_solicitada))
          mvt.medicamento.valor_tota_entrada = valor_medio_entrada*(mvt.medicamento.qtd_disponivel - mvt.medicamento.qtd_solicitada);
        }

        mvt.deposito_nome = mvt.deposito.nome;
        mvt.deposito_id = mvt.deposito.id;
        //mvt.deposito = null;

        mvt.medicamento_nome = mvt.medicamento.nome_generico;
        mvt.medicamento_id = mvt.medicamento.id;
        servico = servico+" "+mvt.medicamento.nome_generico+" ; ";
        
        //mvt.medicamento = null;  
        
        mvt.data_movimento = dia +"/"+mes+"/"+ano;
        mvt.movimentador = this.authService.get_perfil + ' - ' + this.authService.get_user_displayName;
        mvt.tipo_movimento = "Saida por venda";

        //Gravando na tabela de depositos "depositos"
        updatedUserData['/depositos/'+this.authService.get_clinica_id + '/'+mvt.deposito_id+'/medicamentos/'+mvt.medicamento_id] = mvt.medicamento;

        //Gravando na tabela de movimentos "estoquesmovimentos"
        //eliminar redundancia de dados para dar agilidade e perfomance a base de dados
        //mvt.deposito_nome = mvt.deposito.nome;
        mvt.deposito = null;
        //mvt.medicamento_nome = mvt.medicamento.nome_comercial;
        let md = mvt.medicamento;
        mvt.medicamento = null;
        key = this.estoqueService.db.list('/estoquesmovimentos/'+this.authService.get_clinica_id).push('').key;
        updatedUserData['/estoquesmovimentos/'+this.authService.get_clinica_id+"/"+key] = mvt;
        mvt.medicamento = md;

        
        //console.log("PEGOU MEDICAMENTO: "+mvt.medicamento.nome_comercial)
      });
      this.consulta.status = "Encerrada";
      this.consulta.tipo = "MEDICAMENTO";      


      //Criar uma faturacao da consulta do tipo MEDICAMENTO --------------------
      let faturacao = new Faturacao();
      faturacao.categoria = "MEDICAMENTO";
      faturacao.valor = this.preco_total;
      faturacao.data = new Date();
      faturacao.mes = this.getMes(+new Date().getMonth()+ +1);
      faturacao.ano = new Date().getFullYear();
      faturacao.id = this.nr_fatura+"";

      let key = this.estoqueService.db.list('consultas/'+this.authService.get_clinica_id+'/lista_relatorio/'+ this.consulta.ano).push('').key;
      //console.log("Key faturacao e consultas:" +key);
        
      //Gravando na tabela de faturacao "faturacao"
      updatedUserData['faturacao/'+this.authService.get_clinica_id + '/'+faturacao.ano +'/'+this.nr_fatura] = faturacao;

      //Gravando na tabela de consultas
      //updatedUserData['consultas/'+this.authService.get_clinica_id+'/lista_completa/'+key] = this.consulta;
      updatedUserData['consultas/'+this.authService.get_clinica_id+'/lista_relatorio/'+ this.consulta.ano + '/'+key] = this.consulta;

      let conta = new Conta();
      conta.ano = ano;
      conta.mes = mes;
      conta.dia = dia;
      
      conta.data = dia +"/"+(+new Date().getMonth()+ +1)+"/"+ano;
      conta.cliente_nuit = paciente.nuit ? paciente.nuit : "";
      
      conta.cliente_apelido = this.consulta.paciente_apelido;
      conta.cliente_nome = this.consulta.paciente_nome;
      conta.cliente_nid = this.consulta.paciente_nid;
      conta.forma_pagamento = this.forma_pagamento;    
      conta.consulta = servico;
      conta.linhas = this.linhas;
      conta.segunda_via = true;
      if(conta.forma_pagamento == "Convênio"){
        conta.categoria = "A receber";
        conta.nr_apolice = this.nr_apolice;
        conta.seguradora_nome = this.seguradora.nome;
        conta.valor_total = this.preco_total;
      }else{
        conta.categoria = "Recebida";
        conta.valor_total = this.preco_total;
        conta.data_recebimento = new Date();
      }

      if(conta.categoria == "A receber"){
        updatedUserData['contas/'+this.authService.get_clinica_id + '/'+faturacao.ano +'/receber/'+this.nr_fatura] = conta;
      }else{
        updatedUserData['contas/'+this.authService.get_clinica_id + '/'+faturacao.ano +'/recebidas/'+this.nr_fatura] = conta;
      }
      
     /* this.movimentos_aux.forEach(mvt => {
        //mvt.medicamento.qtd_solicitada = null;
        
        mvt.data_movimento = dia +"/"+mes+"/"+ano;
        mvt.movimentador = this.authService.get_perfil + ' - ' + this.authService.get_user_displayName;
        mvt.tipo_movimento = "Saida por venda";

        //Gravando na tabela de depositos "depositos"
        updatedUserData['/depositos/'+this.authService.get_clinica_id + '/'+mvt.deposito_id+'/medicamentos/'+mvt.medicamento_id] = mvt.medicamento;

        //Gravando na tabela de movimentos "estoquesmovimentos"
        //eliminar redundancia de dados para dar agilidade e perfomance a base de dados
        //mvt.deposito_nome = mvt.deposito.nome;
        //mvt.deposito = null;
        //mvt.medicamento_nome = mvt.medicamento.nome_comercial;
        //mvt.medicamento = null;
        key = this.estoqueService.db.list('/estoquesmovimentos/'+this.authService.get_clinica_id).push('').key;
        updatedUserData['/estoquesmovimentos/'+this.authService.get_clinica_id+"/"+key] = mvt;
      });*/

      //GRAVAR SIMULTANEAMENTE TODOS OS DADOS E NAO HAVER INCONSISTENCIA
      let d = Object.assign({}, updatedUserData);
      this.estoqueService.updateEstoque(d) 
      .then(r =>{
        this.downloadPDF(this.movimentos, paciente, "Faturacao");  
        this.dialogRef.close();
        this.openSnackBar("Medicamento faturado com sucesso");
      }, err =>{
        this.openSnackBar("Ocorreu um erro ao cadastrar. Tente novamente ou contacte a equipe de suporte.");
      })

    }else{
      this.openSnackBar("Adicione pelo menos um medicamento.");
    }
  }
  


  //AO FATURAR PRECISA ATUALIZAR A QTD DISPONIVEL DO ITEM NO DEPOSITO
  /*faturar(paciente: Paciente){
    if(this.movimentos.length>0){
      this.desabilitar = true;
      this.texto = "AGUARDE UM INSTANTE...";
  
      //Abrir uma CONSULTA CLINICA --------------------
      let dia = new Date().getDate();
      let mes = +(new Date().getMonth()) + +1;
      let ano = new Date().getFullYear();
  
      this.consulta = new Consulta();
      this.consulta.data = dia +"/"+mes+"/"+ano;
      this.consulta.ano = ano;

      this.consulta.marcador = this.authService.get_perfil + ' - ' + this.authService.get_user_displayName;
      this.consulta.paciente = paciente;
      this.consulta.movimentosestoque = this.movimentos;
      this.consulta.status = "Encerrada";
      this.consulta.tipo = "MEDICAMENTO";
      
      this.consulta.paciente_nome = paciente.nome;
      this.consulta.paciente_apelido = paciente.apelido;
      this.consulta.paciente_nid = paciente.nid;
  
      //Criar uma faturacao da consulta do tipo MEDICAMENTO --------------------
      let faturacao = new Faturacao();
      faturacao.categoria = "MEDICAMENTO";
      faturacao.valor = this.preco_total;
      faturacao.data = new Date();
      //faturacao.consulta = this.consulta;
      //faturacao.movimentosestoque = this.consulta.movimentosestoque;
      
      faturacao.mes = this.getMes(+new Date().getMonth()+ +1);
      faturacao.ano = new Date().getFullYear();
      faturacao.id = this.nr_fatura+"";
      //faturacao.subcategoria = this.
  
  
      //Persistir informacao na base de dados ----------------------------
      let data = Object.assign({}, faturacao);
      let d = Object.assign({}, this.consulta); 
  
      this.pacienteService.faturar(data)
      .then( res => {
        this.pacienteService.marcarConsulta(d)
        .then(r => {
  
          //Para cada medicamento precisamos criar e salvar o movimento de Saida por venda
          console.log("qtd solicitada: "+this.movimentos[0].medicamento.qtd_solicitada)
          this.movimentos.forEach(mvt => {

            console.log("MVT ------------------")
            console.log("Qtd solicitada "+mvt.medicamento.qtd_solicitada);
            console.log("Nome comercial: "+mvt.medicamento.nome_comercial);
            console.log("");

            mvt.medicamento.qtd_solicitada = null;
            mvt.data_movimento = dia +"/"+mes+"/"+ano;
            mvt.movimentador = this.authService.get_perfil + ' - ' + this.authService.get_user_displayName;
            mvt.tipo_movimento = "Saida por venda";

            //console.log("id deposito: "+mvt.deposito.id)
  
            let d = Object.assign({}, mvt); 
            //d.medicamento.qtd_solicitada = null;
            
  
            //2. Salvar esse movimento do item no deposito para vermos posicao de estoque por deposito
            this.estoqueService.addMedicamentoDeposito(d)
            .then(r =>{}, err =>{
              this.openSnackBar("Ocorreu um erro ao cadastrar");
            })
              
            //1. Salvar esse movimento no item para poder ver movimentos por item
            this.estoqueService.addMovimentoItem(d)
            .then(r =>{}, err =>{
              this.openSnackBar("Ocorreu um erro ao cadastrar");
            })
  
            //3. Salvar esse movimento na tabela de movimentos para listarmos todos movimentos que ocorreram
            this.estoqueService.addMovimento(d)
            .then(r =>{}, err =>{
              this.openSnackBar("Ocorreu um erro ao cadastrar");
            })
  
          });

          //this.gerarPDF(this.movimentos , paciente, 'Faturacao', d.id);
          this.downloadPDF(this.movimentos, paciente, "Faturacao");          
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
    }else{
      this.openSnackBar("Adicione pelo menos um medicamento.");
    }
  }*/

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

    //GERAR PDFS
    public downloadPDF(movimentos :MovimentoEstoque[], paciente: Paciente, categoria){// criacao do pdf

      let nome = "";
      if(categoria == 'Cotacao'){
        nome = "COTAÇÃO";
      }else{
        nome = "RECIBO";
      }
    
      if(this.clinica.endereco){
        if(this.nr_cotacao > 0 && this.nr_fatura >0){
          
        
          if(categoria == 'Cotacao'){
            let nr_cotacao = new NrCotacao();
            nr_cotacao.id = this.nr_cotacao+"";
            let d = Object.assign({}, nr_cotacao); 
  
            this.configServices.addNrCotacao(d)
            .then(r =>{
      
              this.gerarPDF(movimentos , paciente, nome, d.id);
              
            }, err=>{
              this.openSnackBar("Ocorreu um erro ao gerar a "+ categoria +". Tente novamente.");
            })
          }else{
            let nr_fatura = new NrFatura();
            nr_fatura.id = this.nr_fatura+"";
            let d = Object.assign({}, nr_fatura); 
  
            this.configServices.addNrFatura(d)
            .then(r =>{
      
              this.gerarPDF(movimentos , paciente, nome, d.id);
              
            }, err=>{
              this.openSnackBar("Ocorreu um erro ao gerar a "+ categoria +". Tente novamente.");
            })
          }
          
  
        }else{
          this.openSnackBar("Ocorreu um erro ao gerar a "+ categoria +". Tente novamente.");
        }
      
      }else{
        this.openSnackBar("Ocorreu um erro ao gerar a "+ categoria +". Tente novamente.");
      }
       
  }//Fim download pdf
  
  
  gerarPDF(movimentos :MovimentoEstoque[], paciente: Paciente, nome, id){
    let doc = new jsPDF({
      orientation: 'p',
      unit: 'px',
      format: 'a4',
      putOnlyUsedFonts:true,
    });
  
    let specialElementHandlers ={
      '#editor': function(element,renderer){return true;} 
    }
    let dia = new Date().getDate();
    let mes = +(new Date().getMonth()) + +1;
    let ano = new Date().getFullYear();
    let dataemisao = dia +"/"+mes+"/"+ano;  
  
    var img = new Image();
    img.src ="../../../assets/images/1 - logo - vitalle.jpg"; 
    doc.addImage(img,"PNG", 300, 40,90, 90);
  
    doc.setFont("Courier");
    doc.setFontStyle("normal"); 
    doc.setFontSize(12);
    doc.text(id+"", 225, 40);
    let item = 1;
    let preco_total = 0;
    let linha = 200;                      
    movimentos.forEach(element => {
      doc.text(item+"", 55, linha) //item
      doc.text(element.quantidade+"", 257, linha) //quantidade
      doc.text(element.medicamento.nome_comercial , 95, linha) //descricao


      if(this.forma_pagamento == "Convênio"){
        doc.text(element.medicamento.preco_seguradora.toFixed(2).replace(".",",")+"", 294, linha)
        doc.text((element.medicamento.preco_seguradora*element.quantidade).toFixed(2).replace(".",",")+"", 354, linha)
    
        preco_total = +preco_total + +element.medicamento.preco_seguradora*element.quantidade;

        //console.log("Pagou convenio");
      }else{
        doc.text(element.medicamento.preco_venda.toFixed(2).replace(".",",")+"", 294, linha)
        doc.text((element.medicamento.preco_venda*element.quantidade).toFixed(2).replace(".",",")+"", 354, linha)
    
        preco_total = +preco_total + +element.medicamento.preco_venda*element.quantidade;
        //console.log("Pagou normal");
      }

      
      item = +item + +1;
      linha = +linha + +20;
    });   
     
    doc.setFont("Courier");
    doc.setFontStyle("normal"); 
    doc.setFontStyle("bold");
    doc.setFontSize(15);
  
    doc.text(nome+":", 170, 40);  
  
    doc.setFont("Courier");
    doc.setFontStyle("normal"); 
    doc.setFontSize(10);
  
    doc.text("Processado pelo computador", 170, 580);

    doc.text(this.clinica.endereco, 50, 65);
    doc.text(this.clinica.provincia+", "+this.clinica.cidade, 50,75);
    doc.text("Email: "+this.clinica.email, 50, 85);
    doc.text("Cell: "+this.clinica.telefone, 50, 95);
    doc.text("NUIT: "+this.clinica.nuit, 50, 105);
    
    doc.text("Nome do Paciente: "+paciente.nome, 50, 125);
    doc.text("NID: "+paciente.nid, 250, 125);
    doc.text("Apelido: "+paciente.apelido, 50, 145);
    doc.text("Data de emissão: "+dataemisao, 250, 145);
    let n = paciente.nuit ? paciente.nuit : ""; //Trabalhando o NUIT por nao ser campo obrigatorio pode estar nulo
    doc.text("NUIT do paciente: "+n, 50, 165);

    /*doc.text(this.clinica.endereco, 50, 75);
    doc.text(this.clinica.provincia+", "+this.clinica.cidade, 50,85);
    doc.text("Email: "+this.clinica.email, 50, 95);
    doc.text("Cell: "+this.clinica.telefone, 50, 105);
    
    doc.text("Nome do Paciente:", 50, 125);
    doc.text(paciente.nome, 128, 125);
    doc.text("NID:", 250, 125);
    doc.text(paciente.nid+"", 268, 125);
    doc.text("Apelido:", 50, 145);
    doc.text(paciente.apelido, 89, 145);
    doc.text("Data de emissão: ", 250, 145);
    doc.text(dataemisao, 322, 145);*/
    doc.setFillColor(50,50,50);
    doc.rect ( 50, 170 , 40 , 20 ); 
    doc.rect (  50, 190 , 40 , 320 ); 
  
    doc.rect (  90, 170 , 150 , 20 ); 
    doc.rect (  90, 190 , 150 , 320 );
  
    doc.rect (  240, 170 , 50 , 20 ); 
    doc.rect (  240, 190 , 50 , 320 );
  
    doc.rect (  290, 170 , 60 , 20 ); 
    doc.rect (  290, 190 , 60 , 320 );
  
    doc.rect (  350, 170 , 50 , 20 ); 
    doc.rect (  350, 190 , 50 , 320);
  
    doc.rect ( 290, 510 , 110 , 20 );
  
    doc.setFontStyle("bold");
    doc.text("Item", 60, 180);
    doc.text("Descrição", 120, 180);
    doc.text("Quantd", 245, 180);
    doc.text("Preço Unit", 295, 180);
    doc.text("Preç Tot", 355, 180);
    doc.text("Total: "+preco_total.toFixed(2).replace(".",",")+" MZN", 293, 525);
  
    doc.rect (  290, 170 , 60 , 20 ); 
    doc.rect (  290, 190 , 60 , 320 );
  
    doc.save(nome+ id +'.pdf'); 
  }

}

//========================================================================================================================
//CondutasDialog --------------------------------------------------------
//========================================================================================================================

@Component({
  selector: 'condutas-dialog',
  templateUrl: 'condutas.component.html',
})
  export class CondutasDialog {

  clinica: Clinica; //PDF
  nr_cotacao = 0; //PDF
  nr_fatura = 0; //PDF

  desabilitar: boolean = false; //Fatura
  desabilitar2: boolean = false; //Cotacao
  texto: string = "Faturar"; //Fatura
  texto2: string = "Cotar"; //Cotacao

  condutaFormGroup: FormGroup;
  condutas: CondutaClinica[] = [];
  condutas_aux: CondutaClinica[]
  conduta: CondutaClinica;
  tipoconduta: TipoCondutaClinica;
  tiposconduta: TipoCondutaClinica[];
  tiposcondutas_aux: TipoCondutaClinica[];
  dataSourse: MatTableDataSource<CondutaClinica>;
  displayedColumns = ['tipo','nome', 'preco', 'remover'];

  consulta?: Consulta;
  preco_total:Number = 0;

  tiposcondutas_param: TipoCondutaClinica[]; //Passadas no parametro data

  condutas_param: CondutaClinica[]; //Passadas no parametro data
  condutas_alternativas: CondutaClinica[];

  medico = "";

  forma_pagamento = "";

  seguradora: Seguradora;

  nr_apolice = "";
  
  linhas: Linha[] = [];
  
  constructor(public dialog: MatDialog,public dialogRef: MatDialogRef<CondutasDialog>, private router: Router,
  @Inject(MAT_DIALOG_DATA) public data: any, public authService:AuthService, public configServices: ConfiguracoesService,
  public pacienteService: PacienteService,  public snackBar: MatSnackBar, private _formBuilder: FormBuilder) {
    this.conduta = new CondutaClinica();
    this.tipoconduta = new TipoCondutaClinica();
    
    this.tiposcondutas_aux = this.data.tiposconduta;
    this.condutas_aux = this.data.condutas;
    this.condutaFormGroup = this._formBuilder.group({
      conduta_tipo: ['', Validators.required],
      conduta_nome: ['', Validators.required],
      conduta_preco: ['', Validators.required]
    });
    this.condutaFormGroup.controls['conduta_preco'].disable();

    this.dataSourse=new MatTableDataSource(this.condutas);

    this.tiposcondutas_param = this.data.tiposconduta;
    this.condutas_param = this.data.condutas;
    //console.log("iniciou: "+this.data.condutas[0].tipo.nome)
    //this.condutas_alternativas = this.condutas_param;
 
    this.clinica = this.data.clinica; //PDF
    this.nr_cotacao = this.data.nr_cotacao; //PDF
    this.nr_fatura = this.data.nr_fatura; //PDF
    
    this.seguradora = new Seguradora();
  }
  

  filtroTipoconduta="";
  filtrarTiposcondutas(filtroTipoconduta) {
    if(filtroTipoconduta){
      filtroTipoconduta = filtroTipoconduta.trim(); // Remove whitespace
      filtroTipoconduta = filtroTipoconduta.toLowerCase(); // Datasource defaults to lowercase matches
     
      this.tiposconduta= null;

      this.data.tiposconduta = this.tiposcondutas_aux.filter(item => item.nome.toLocaleLowerCase().indexOf(filtroTipoconduta) > -1);     
    }else{
      this.data.tiposconduta = this.tiposcondutas_aux;
    }
  }

  filtroconduta="";
  filtrarCondutas(filtroconduta) {
    if(filtroconduta){
      filtroconduta = filtroconduta.trim(); // Remove whitespace
      filtroconduta = filtroconduta.toLowerCase(); // Datasource defaults to lowercase matches
     
    this.condutas= null;

  this.data.condutas = this.condutas_aux.filter(item => item.nome.toLocaleLowerCase().indexOf(filtroconduta) > -1);     
    }else{
      this.data.condutas = this.condutas_aux;
    }
  }

  precoSegurado = false;
  mudarFPagamento(){
    this.nr_apolice = "";
    this.seguradora = new Seguradora();
    if(this.conduta.preco){
      if(this.forma_pagamento == "Convênio"){
        this.precoSegurado = true;
      }else{
        this.precoSegurado = false;
      }
    }
  }

  addConduta(conduta:CondutaClinica){
    if(conduta.nome){
      this.condutas.push(conduta);

      let linha = new Linha();
      linha.descricao_servico = conduta.nome;
      linha.qtd_solicitada = 1;
      linha.id_servico = conduta.id;

      if(this.forma_pagamento == "Convênio"){
        //doc.text(categoriaConsulta.preco_seguradora+"", 294, linha)
        //doc.text(categoriaConsulta.preco_seguradora+"", 354, linha)
        //preco_total = +categoriaConsulta.preco_seguradora;
        linha.preco_unitario = +conduta.preco_seguradora;
        this.preco_total = +this.preco_total + +conduta.preco_seguradora;
      }else{
        //doc.text(categoriaConsulta.preco+"", 294, linha)
        //doc.text(categoriaConsulta.preco+"", 354, linha)
        //preco_total = +categoriaConsulta.preco;

        linha.preco_unitario = +conduta.preco;
        this.preco_total = +this.preco_total + +conduta.preco;
      }

      linha.preco_total = 1*linha.preco_unitario;
      this.linhas.push(linha);
      
      this.texto = "Faturar "+ this.preco_total.toFixed(2).replace(".",",") +" MZN";

  
      this.dataSourse=new MatTableDataSource(this.condutas);
      this.conduta = new CondutaClinica();
    }else{
      this.openSnackBar("Selecione uma conduta clinica");
    }
    
  }

  removeConduta(conduta:CondutaClinica){
    this.preco_total = +this.preco_total - +conduta.preco;
    this.texto = "Faturar "+ this.preco_total.toFixed(2).replace(".",",") +" MZN";
    this.condutas.splice(this.condutas.indexOf(conduta), 1);
    this.dataSourse=new MatTableDataSource(this.condutas);

    this.linhas.forEach(element => {
      if(element.id_servico == conduta.id){
      this.linhas.splice(this.linhas.indexOf(element), 1);
      }
    });
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
    if(this.condutas.length>0 && this.medico !== ""){
      var updatedUserData = {};

      if(this.forma_pagamento == "Convênio"){  
        if(this.nr_apolice == "" || this.nr_apolice == null){
          this.openSnackBar("Preencha o nr da apolice");
          return;
        }

        if(this.seguradora.nome == "" || this.seguradora.nome == null){
          this.openSnackBar("Selecione a seguradora");
          return;
        }
      }

      this.desabilitar = true;
      this.texto = "AGUARDE UM INSTANTE..."

      let servico = "Condutas clinicas: ";

      //Abrir uma consulta CONDUTA CLINICA --------------------
      let dia = new Date().getDate();
      let mes = this.getMes( +(new Date().getMonth()) + +1);
      let ano = new Date().getFullYear();

      this.consulta = new Consulta();
      this.consulta.data = dia +"/"+mes+"/"+ano;
      this.consulta.ano = ano;
      this.consulta.marcador = this.authService.get_perfil + ' - ' + this.authService.get_user_displayName;
      //this.consulta.paciente = paciente;
      this.consulta.condutas_clinicas = this.condutas;
      //let cd = this.condutas;
      this.consulta.condutas_clinicas.forEach(element => {
        element.tipo = null;
        servico = servico+" "+element.nome+" ; ";
      });
      this.consulta.status = "Encerrada";
      this.consulta.tipo = "CONDUTA CLINICA";

      this.consulta.paciente_nome = paciente.nome;
      this.consulta.paciente_apelido = paciente.apelido;
      this.consulta.paciente_nid = paciente.nid;

      this.consulta.medico_nome = this.medico;

      let key = this.pacienteService.db.list('consultas/'+this.authService.get_clinica_id +'/lista_relatorio/'+ ano).push('').key;
      this.consulta.id = key;

      //Gravando a consulta
      //updatedUserData['consultas/'+this.authService.get_clinica_id + '/lista_completa/'+key] = this.consulta;

      updatedUserData['consultas/'+this.authService.get_clinica_id +'/lista_relatorio/'+ ano + '/'+key] = this.consulta;
      //this.condutas = cd;

      //Criar uma faturacao da consulta do tipo CONDUTA CLINICA --------------------
      let faturacao = new Faturacao();
      faturacao.categoria = "CONDUTA CLINICA";
      faturacao.valor = this.preco_total;
      faturacao.data = new Date();
      faturacao.id = this.nr_fatura+"";
      faturacao.mes = mes+"";
      faturacao.ano = ano;
      faturacao.medico_nome = this.medico;

      //Gravando na tabela de faturacao "faturacao"
      updatedUserData['faturacao/'+this.authService.get_clinica_id + '/'+faturacao.ano +'/'+this.nr_fatura] = faturacao;

      let conta = new Conta();
      conta.ano = ano;
      conta.mes = mes;
      conta.dia = dia;
      //conta.data = dia +"/"+mes+"/"+ano;
      conta.data = dia +"/"+(+new Date().getMonth()+ +1)+"/"+ano;
      conta.cliente_nuit = paciente.nuit ? paciente.nuit : "";
      
      conta.cliente_apelido = this.consulta.paciente_apelido;
      conta.cliente_nome = this.consulta.paciente_nome;
      conta.cliente_nid = this.consulta.paciente_nid;

      /*if(this.consulta.paciente.nuit == undefined){
        conta.cliente_nuit = "";
      }else{        
        conta.cliente_nuit = this.consulta.paciente.nuit;
      }  */

      conta.forma_pagamento = this.forma_pagamento;    
      conta.consulta = servico;
      conta.linhas = this.linhas;
      conta.segunda_via = true;
      if(conta.forma_pagamento == "Convênio"){
        conta.categoria = "A receber";
        conta.nr_apolice = this.nr_apolice;
        conta.seguradora_nome = this.seguradora.nome;
        conta.valor_total = this.preco_total;
      }else{
        conta.categoria = "Recebida";
        conta.valor_total = this.preco_total;
        conta.data_recebimento = new Date();
      }

      if( conta.categoria == "A receber"){
        updatedUserData['contas/'+this.authService.get_clinica_id + '/'+faturacao.ano +'/receber/'+this.nr_fatura] = conta;
      }else{
        updatedUserData['contas/'+this.authService.get_clinica_id + '/'+faturacao.ano +'/recebidas/'+this.nr_fatura] = conta;
      }

      //GRAVAR SIMULTANEAMENTE TODOS OS DADOS E NAO HAVER INCONSISTENCIA
      let d = Object.assign({}, updatedUserData);
      this.pacienteService.multiSave(d) 
      .then(r =>{
        this.downloadPDF(this.condutas, paciente, "Faturacao");        
          this.dialogRef.close();
          this.openSnackBar("Faturado com sucesso.");
      }, err =>{
        this.desabilitar = false;
        this.texto = "Faturar";
        this.openSnackBar("Ocorreu um erro ao cadastrar. Tente novamente ou contacte a equipe de suporte.");
      })

      //Persistir informacao na base de dados ----------------------------
      /*let data = Object.assign({}, faturacao);
      let d = Object.assign({}, this.consulta); */

      /*this.pacienteService.faturar(data)
      .then( res => {
        this.pacienteService.marcarConsulta(d)
        .then(r => {
          this.downloadPDF(this.condutas, paciente, "Faturacao");        
          this.dialogRef.close();
          this.openSnackBar("Faturado com sucesso");
        }, er => {
          console.log("ERRO: " + er.message)
          this.openSnackBar("Ocorreu um erro. Contacte o Admin do sistema.");
        })      
      }, err=>{
        console.log("ERRO: " + err.message)
        this.openSnackBar("Ocorreu um erro. Contacte o Admin do sistema.");
      })*/
    }else{
      this.openSnackBar("Adicione pelo menos uma conduta e selecione o medico");
    }
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



  cotar(paciente: Paciente){
    if(this.condutas.length>0){
      this.desabilitar2 = true;
      this.texto2 = "AGUARDE UM INSTANTE...";

      this.downloadPDF(this.condutas, paciente, "Cotacao");
      this.texto2 = "Cotar";
      //this.desabilitar = false;
    }else{
      this.openSnackBar("Adicione pelo menos uma conduta.");
    }
  }




  //GERAR PDFS
  public downloadPDF(condutas :CondutaClinica[], paciente: Paciente, categoria){// criacao do pdf

    let nome = "";
    if(categoria == 'Cotacao'){
      nome = "COTAÇÃO";
    }else{
      nome = "RECIBO";
    }
  
    if(this.clinica.endereco){
      if(this.nr_cotacao > 0 && this.nr_fatura >0){
        
      
        if(categoria == 'Cotacao'){
          let nr_cotacao = new NrCotacao();
          nr_cotacao.id = this.nr_cotacao+"";
          let d = Object.assign({}, nr_cotacao); 

          this.configServices.addNrCotacao(d)
          .then(r =>{
    
            this.gerarPDF(condutas , paciente, nome, d.id);
            
          }, err=>{
            this.openSnackBar("Ocorreu um erro ao gerar a "+ categoria +". Tente novamente.");
          })
        }else{
          let nr_fatura = new NrFatura();
          nr_fatura.id = this.nr_fatura+"";
          let d = Object.assign({}, nr_fatura); 

          this.configServices.addNrFatura(d)
          .then(r =>{
    
            this.gerarPDF(condutas , paciente, nome, d.id);
            
          }, err=>{
            this.openSnackBar("Ocorreu um erro ao gerar a "+ categoria +". Tente novamente.");
          })
        }
        

      }else{
        this.openSnackBar("Ocorreu um erro ao gerar a "+ categoria +". Tente novamente.");
      }
    
    }else{
      this.openSnackBar("Ocorreu um erro ao gerar a "+ categoria +". Tente novamente.");
    }
     
}//Fim download pdf


gerarPDF(condutas :CondutaClinica[], paciente: Paciente, nome, id){
  let doc = new jsPDF({
    orientation: 'p',
    unit: 'px',
    format: 'a4',
    putOnlyUsedFonts:true,
  });

  let specialElementHandlers ={
    '#editor': function(element,renderer){return true;} 
  }
  let dia = new Date().getDate();
  let mes = +(new Date().getMonth()) + +1;
  let ano = new Date().getFullYear();
  let dataemisao = dia +"/"+mes+"/"+ano;  

  var img = new Image();
  img.src ="../../../assets/images/1 - logo - vitalle.jpg"; 
  doc.addImage(img,"PNG", 300, 40,90, 90);

  doc.setFont("Courier");
  doc.setFontStyle("normal"); 
  doc.setFontSize(12);
  doc.text(id+"", 225, 40);
  let item = 1;
  let preco_total = 0;
  let linha = 200;                      
  condutas.forEach(element => {
    doc.text(item+"", 55, linha) //item
    doc.text("1", 257, linha) //quantidade

    let string1 = "";
    let string2 = "";
    let linhaAlternativo = 0;
    if(element.nome.length > 26){
      string1 = element.nome.substr(0,26);
      let q = +element.nome.length - +26;
      string2 = element.nome.substr(q).toString().trim();

      linhaAlternativo = +linha+ +20;

      doc.text(string1 , 95, linha) //descricao
      doc.text(string2 , 95, linhaAlternativo) //descricao

    }else{
      doc.text(element.nome , 95, linha) //descricao
    }
    

    if(this.forma_pagamento == "Convênio"){
      doc.text(element.preco_seguradora+"", 294, linha)
      doc.text(element.preco_seguradora+"", 354, linha)
  
      preco_total = +preco_total + +element.preco_seguradora;
    }else{
      doc.text(element.preco+"", 294, linha)
      doc.text(element.preco+"", 354, linha)
  
      preco_total = +preco_total + +element.preco;
    }

    

    if(linhaAlternativo > 0){
      linha = +linha + +40;
    }else{
      linha = +linha + +20;
    }

    item = +item + +1;
    //linha = +linha + +20;
  });   
   
  doc.setFont("Courier");
  doc.setFontStyle("normal"); 
  doc.setFontStyle("bold");
  doc.setFontSize(15);

  doc.text(nome+":", 170, 40);  

  doc.setFont("Courier");
  doc.setFontStyle("normal"); 
  doc.setFontSize(10);

  doc.text("Processado pelo computador", 170, 580);

  doc.text(this.clinica.endereco, 50, 65);
  doc.text(this.clinica.provincia+", "+this.clinica.cidade, 50,75);
  doc.text("Email: "+this.clinica.email, 50, 85);
  doc.text("Cell: "+this.clinica.telefone, 50, 95);
  doc.text("NUIT: "+this.clinica.nuit, 50, 105);
  
  doc.text("Nome do Paciente: "+paciente.nome, 50, 125);
  doc.text("NID: "+paciente.nid, 250, 125);
  doc.text("Apelido: "+paciente.apelido, 50, 145);
  doc.text("Data de emissão: "+dataemisao, 250, 145);
  let n = paciente.nuit ? paciente.nuit : ""; //Trabalhando o NUIT por nao ser campo obrigatorio pode estar nulo
  doc.text("NUIT do paciente: "+n, 50, 165);

  /*doc.text(this.clinica.endereco, 50, 65);
  doc.text(this.clinica.provincia+", "+this.clinica.cidade, 50,75);
  doc.text("Email: "+this.clinica.email, 50, 85);
  doc.text("Cell: "+this.clinica.telefone, 50, 95);
  doc.text("NUIT: "+this.clinica.nuit, 50, 105);
  doc.text("Nome do Paciente:"+paciente.nome, 50, 125);
  //doc.text(paciente.nome, 128, 125);
  doc.text("NID: "+paciente.nid, 250, 125);
  //doc.text(paciente.nid+"", 268, 125);
  doc.text("Apelido: "+paciente.apelido, 50, 145);
  // doc.text(paciente.apelido, 89, 145);
  doc.text("Data de emissão: "+dataemisao, 250, 145);
  //doc.text(dataemisao, 322, 145);
  doc.text("NUIT do paciente: "+paciente.nuit, 50, 165);*/
  doc.setFillColor(50,50,50);
  doc.rect ( 50, 170 , 40 , 20 ); 
  doc.rect (  50, 190 , 40 , 320 ); 

  doc.rect (  90, 170 , 150 , 20 ); 
  doc.rect (  90, 190 , 150 , 320 );

  doc.rect (  240, 170 , 50 , 20 ); 
  doc.rect (  240, 190 , 50 , 320 );

  doc.rect (  290, 170 , 60 , 20 ); 
  doc.rect (  290, 190 , 60 , 320 );

  doc.rect (  350, 170 , 50 , 20 ); 
  doc.rect (  350, 190 , 50 , 320);

  doc.rect ( 290, 510 , 110 , 20 );

  doc.setFontStyle("bold");
  doc.text("Item", 60, 180);
  doc.text("Descrição", 120, 180);
  doc.text("Quantd", 245, 180);
  doc.text("Preço Unit", 295, 180);
  doc.text("Preç Tot", 355, 180);
  doc.text("Total: "+preco_total.toFixed(2).replace(".",",")+" MZN", 293, 525);

  doc.rect (  290, 170 , 60 , 20 ); 
  doc.rect (  290, 190 , 60 , 320 );

  doc.save(nome+ id +'.pdf'); 
}

}




//=========================================================================================================================
//ConsultasDialog ---------------------------------------------------------
//=========================================================================================================================

@Component({
  selector: 'consultas-dialog',
  templateUrl: 'consultas.component.html',
  })
  export class ConsultasDialog {

    clinica: Clinica; //PDF
    nr_cotacao = 0; //PDF
    nr_fatura = 0; //PDF
    //categorias_consulta: CategoriaConsulta[];
  //  categorias_consulta_aux: CategoriaConsulta[];
    desabilitar: boolean = false; //Fatura
    desabilitar2: boolean = false; //Cotacao
    texto: string = "Marcar consulta"; //Fatura
    texto2: string = "Cotar"; //Cotacao

    consultasFormGroup: FormGroup;
    categorias: CategoriaConsulta[] = [];
    categorias_aux: CategoriaConsulta[];
    categorias_consulta: CategoriaConsulta[];
    categoria:CategoriaConsulta;

    consulta?: Consulta;
    preco_total:Number = 0;

    medico = "";

    forma_pagamento = "";

    seguradora: Seguradora;

    nr_apolice = "";

    linhas: Linha[] = [];

  constructor(  public dialogRef: MatDialogRef<ConsultasDialog>, private router: Router,
  @Inject(MAT_DIALOG_DATA) public data: any, public authService:AuthService, public configServices: ConfiguracoesService,
  public pacienteService: PacienteService,  public snackBar: MatSnackBar, private _formBuilder: FormBuilder) {
    this.categoria = new CategoriaConsulta();
    this.consulta = new Consulta();
    this.categorias_aux=this.data.categorias_consulta;
    this.consultasFormGroup = this._formBuilder.group({
      categoria_nome: ['', Validators.required],
      categoria_preco: ['', Validators.required]
    });
    this.consultasFormGroup.controls['categoria_preco'].disable();
  
    this.clinica = this.data.clinica; //PDF
    this.nr_cotacao = this.data.nr_cotacao; //PDF
    this.nr_fatura = this.data.nr_fatura; //PDF

    this.seguradora = new Seguradora();
  }
 
  onNoClick(): void {
    this.dialogRef.close();
  }

  precoSegurado = false;
  mudarFPagamento(){
    this.nr_apolice = "";
    this.seguradora = new Seguradora();
    if(this.categoria.preco){
      if(this.forma_pagamento == "Convênio"){
        this.precoSegurado = true;
      }else{
        this.precoSegurado = false;
      }
    }
  }

  filtroconsulta="";
  filtrarConsultas(filtroconsulta) {
    if(filtroconsulta){
      filtroconsulta = filtroconsulta.trim(); // Remove whitespace
      filtroconsulta = filtroconsulta.toLowerCase(); // Datasource defaults to lowercase matches
     
    this.categorias_consulta= null;

  this.data.categorias_consulta = this.categorias_aux.filter(item => item.nome.toLocaleLowerCase().indexOf(filtroconsulta) > -1);     
    }else{
      this.data.categorias_consulta = this.categorias_aux;
    }
  }

  getMes(number): String{
    //console.log("Get mes "+number)
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

  marcarConsulta(paciente, tipo){
    if(this.categoria.nome && this.medico !== ""){ //Garantir que categoria foi selecionada
      var updatedUserData = {};

      if(this.forma_pagamento == "Convênio"){  
        if(this.nr_apolice == "" || this.nr_apolice == null){
          this.openSnackBar("Preencha o nr da apolice");
          return;
        }

        if(this.seguradora.nome == "" || this.seguradora.nome == null){
          this.openSnackBar("Selecione a seguradora");
          return;
        }
      }

      this.desabilitar = true;
      this.texto = "AGUARDE UM INSTANTE...";

      let dia = new Date().getDate();
      let mes = this.getMes( +(new Date().getMonth()) + +1);
      let ano = new Date().getFullYear();
      this.consulta.data = dia +"/"+mes+"/"+ano;
      this.consulta.ano = ano;
      this.DiarioPdf(paciente);

      this.consulta.marcador = this.authService.get_perfil + ' - ' + this.authService.get_user_displayName;
      this.consulta.paciente = paciente;
      this.consulta.status = "Aberta";
      this.consulta.tipo = tipo;

      let linha = new Linha();
      linha.descricao_servico = this.categoria.nome;
      linha.qtd_solicitada = 1;
      linha.id_servico = this.categoria.id;
      
      

      if(this.forma_pagamento == "Convênio"){
        linha.preco_unitario = +this.categoria.preco_seguradora;
        this.consulta.preco_consulta_medica = this.categoria.preco_seguradora;
        this.consulta.seguradora_nome = this.seguradora.nome;
        this.consulta.nr_apolice = this.nr_apolice;
      }else{
        this.consulta.preco_consulta_medica = this.categoria.preco;
        linha.preco_unitario = +this.categoria.preco;
      }

      linha.preco_total = linha.preco_unitario*1;
      this.linhas.push(linha);

      this.consulta.categoria = this.categoria;

      this.consulta.paciente_nome = this.consulta.paciente.nome;
      this.consulta.paciente_apelido = this.consulta.paciente.apelido;
      this.consulta.paciente_nid= this.consulta.paciente.nid;

      this.consulta.timestamp = new Date().valueOf();

      this.consulta.medico_nome = this.medico;

      

      let key = this.pacienteService.db.list('consultas/'+this.authService.get_clinica_id + '/lista_completa/').push('').key;
      this.consulta.id = key;

      //Gravando a consulta
      updatedUserData['consultas/'+this.authService.get_clinica_id + '/lista_completa/'+key] = this.consulta;

      let faturacao = new Faturacao();
      faturacao.categoria = "CONSULTA_MEDICA";

      if(this.forma_pagamento == "Convênio"){
        faturacao.valor = this.categoria.preco_seguradora;
      }else{
        faturacao.valor = this.categoria.preco;
      }    

      faturacao.data = new Date();
      faturacao.mes = mes+"";
      faturacao.ano = ano;
      faturacao.id = this.nr_fatura+"";
      faturacao.medico_nome = this.medico;

      //Gravando na tabela de faturacao "faturacao"
      updatedUserData['faturacao/'+this.authService.get_clinica_id + '/'+faturacao.ano +'/'+this.nr_fatura] = faturacao;

      let conta = new Conta();
      conta.ano = ano;
      conta.mes = mes;
      conta.dia = dia;
      conta.data = dia +"/"+(+(new Date().getMonth()) + +1) +"/"+ano;
      conta.cliente_apelido = this.consulta.paciente.apelido;
      conta.cliente_nome = this.consulta.paciente.nome;
      conta.cliente_nid = this.consulta.paciente.nid;
      conta.forma_pagamento = this.forma_pagamento;
      conta.consulta = "Consulta medica: "+this.consulta.categoria.nome;
      conta.cliente_nuit = this.consulta.paciente.nuit ? this.consulta.paciente.nuit : "";
      conta.linhas = this.linhas;
      conta.segunda_via = true;
      if(conta.forma_pagamento == "Convênio"){
        conta.categoria = "A receber";
        conta.nr_apolice = this.nr_apolice;
        conta.seguradora_nome = this.seguradora.nome;
        conta.valor_total = this.categoria.preco_seguradora;
      }else{
        conta.categoria = "Recebida";
        conta.valor_total = this.categoria.preco;
        conta.data_recebimento = new Date();
      }

      if( conta.categoria == "A receber"){
        updatedUserData['contas/'+this.authService.get_clinica_id + '/'+faturacao.ano +'/receber/'+this.nr_fatura] = conta;
      }else{
        updatedUserData['contas/'+this.authService.get_clinica_id + '/'+faturacao.ano +'/recebidas/'+this.nr_fatura] = conta;
      }
      
      

      //GRAVAR SIMULTANEAMENTE TODOS OS DADOS E NAO HAVER INCONSISTENCIA
      let d = Object.assign({}, updatedUserData);
      this.pacienteService.multiSave(d) 
      .then(r =>{
        this.downloadPDF(this.categoria, paciente, "Faturacao");
        this.dialogRef.close();
        this.openSnackBar("Consulta agendada com sucesso.");
      }, err =>{
        this.desabilitar2 = false;
        this.texto2 = "Marcar consulta";
        this.openSnackBar("Ocorreu um erro ao cadastrar. Tente novamente ou contacte a equipe de suporte.");
      })
      
      
    }else{
      this.openSnackBar("Preencha todos os campos habilitados.");
    }

  }

  /*marcarConsulta(paciente, tipo){
    if(this.categoria.nome){ //Garantir que categoria foi selecionada
      

      let dia = new Date().getDate();
      let mes = +(new Date().getMonth()) + +1;
      let ano = new Date().getFullYear();
      this.consulta.data = dia +"/"+mes+"/"+ano;
      this.consulta.ano = ano;
      this.DiarioPdf(paciente);

      this.consulta.marcador = this.authService.get_perfil + ' - ' + this.authService.get_user_displayName;
      this.consulta.paciente = paciente;
      this.consulta.status = "Aberta";
      this.consulta.tipo = tipo;
      this.consulta.preco_consulta_medica = this.categoria.preco;
      this.consulta.categoria = this.categoria;

      this.consulta.paciente_nome = this.consulta.paciente.nome;
      this.consulta.paciente_apelido = this.consulta.paciente.apelido;
      this.consulta.paciente_nid= this.consulta.paciente.nid;

      this.consulta.timestamp = new Date().valueOf();

      let data = Object.assign({}, this.consulta);

      this.pacienteService.marcarConsulta(data)
      .then( res => {
        this.downloadPDF(this.categoria, paciente, "Faturacao");
        this.dialogRef.close();
        this.openSnackBar("Consulta agendada com sucesso");
      }, err => {
        
        console.log("ERRO: " + err.message)
        this.openSnackBar("Ocorreu um erro ao marcar a consulta. Contacte o Admin do sistema.");
      })

    }else{
      this.openSnackBar("Selecione uma categoria de consulta");
    }
  }*/

  openSnackBar(mensagem) {
    this.snackBar.open(mensagem, null,{
      duration: 2000
    })
  }



  cotar(paciente: Paciente){
    if(this.categoria.nome){
      this.desabilitar2 = true;
      this.texto2 = "AGUARDE UM INSTANTE...";

      this.downloadPDF(this.categoria, paciente, "Cotacao");
      this.texto2 = "Cotar";
      //this.desabilitar = false;
    }else{
      this.openSnackBar("Selecione uma categoria de consulta");
    }
  }




  //GERAR PDFS
  public downloadPDF(categoriaConsulta :CategoriaConsulta, paciente: Paciente, categoria){// criacao do pdf

    let nome = "";
    if(categoria == 'Cotacao'){
      nome = "COTAÇÃO";
    }else{
      nome = "RECIBO";
    }
  
    if(this.clinica.endereco){
      if(this.nr_cotacao > 0 && this.nr_fatura >0){
        
      
        if(categoria == 'Cotacao'){
          let nr_cotacao = new NrCotacao();
          nr_cotacao.id = this.nr_cotacao+"";
          let d = Object.assign({}, nr_cotacao); 

          this.configServices.addNrCotacao(d)
          .then(r =>{
    
            this.gerarPDF(categoriaConsulta , paciente, nome, d.id);
            
          }, err=>{
            this.openSnackBar("Ocorreu um erro ao gerar a "+ categoria +". Tente novamente.");
          })
        }else{
          let nr_fatura = new NrFatura();
          nr_fatura.id = this.nr_fatura+"";
          let d = Object.assign({}, nr_fatura); 

          this.configServices.addNrFatura(d)
          .then(r =>{
    
            this.gerarPDF(categoriaConsulta , paciente, nome, d.id);
            
          }, err=>{
            this.openSnackBar("Ocorreu um erro ao gerar a "+ categoria +". Tente novamente.");
          })
        }
        

      }else{
        this.openSnackBar("Ocorreu um erro ao gerar a "+ categoria +". Tente novamente.");
      }
    
    }else{
      this.openSnackBar("Ocorreu um erro ao gerar a "+ categoria +". Tente novamente.");
    }
     
}//Fim download pdf


gerarPDF(categoriaConsulta :CategoriaConsulta, paciente: Paciente, nome, id){
  let doc = new jsPDF({
    orientation: 'p',
    unit: 'px',
    format: 'a4',
    putOnlyUsedFonts:true,
  });

  let specialElementHandlers ={
    '#editor': function(element,renderer){return true;} 
  }
  let dia = new Date().getDate();
  let mes = +(new Date().getMonth()) + +1;
  let ano = new Date().getFullYear();
  let dataemisao = dia +"/"+mes+"/"+ano;  

  var img = new Image();
  img.src ="../../../assets/images/1 - logo - vitalle.jpg"; 
  doc.addImage(img,"PNG", 300, 40,90, 90);

  doc.setFont("Courier");
  doc.setFontStyle("normal"); 
  doc.setFontSize(12);
  doc.text(id+"", 225, 40);
  let item = 1;
  let preco_total = 0;
  let linha = 200;                      

  doc.text(item+"", 55, linha) //item
  doc.text("1", 257, linha) //quantidade

  let string1 = "";
  let string2 = "";
  let linhaAlternativo = 0;
  if(categoriaConsulta.nome.length > 26){
    string1 = categoriaConsulta.nome.substr(0,26);
    let q = +categoriaConsulta.nome.length - +26;
    string2 = categoriaConsulta.nome.substr(q).toString().trim();

    linhaAlternativo = +linha+ +20;

    doc.text(string1 , 95, linha) //descricao
    doc.text(string2 , 95, linhaAlternativo) //descricao

  }else{
    doc.text(categoriaConsulta.nome , 95, linha) //descricao
  }
  
  if(this.forma_pagamento == "Convênio"){
    doc.text(categoriaConsulta.preco_seguradora+"", 294, linha)
    doc.text(categoriaConsulta.preco_seguradora+"", 354, linha)
    preco_total = +categoriaConsulta.preco_seguradora;

  }else{
    doc.text(categoriaConsulta.preco+"", 294, linha)
    doc.text(categoriaConsulta.preco+"", 354, linha)
    preco_total = +categoriaConsulta.preco;

  }

  //preco_total = +categoriaConsulta.preco;
  item = +item + +1;

  if(linhaAlternativo > 0){
    linha = +linha + +40;
  }else{
    linha = +linha + +20;
  }
  
   
   
  doc.setFont("Courier");
  doc.setFontStyle("normal"); 
  doc.setFontStyle("bold");
  doc.setFontSize(15);

  doc.text(nome+":", 170, 40);  

  doc.setFont("Courier");
  doc.setFontStyle("normal"); 
  doc.setFontSize(10);

  doc.text("Processado pelo computador", 170, 580);
  doc.text(this.clinica.endereco, 50, 65);
  doc.text(this.clinica.provincia+", "+this.clinica.cidade, 50,75);
  doc.text("Email: "+this.clinica.email, 50, 85);
  doc.text("Cell: "+this.clinica.telefone, 50, 95);
  doc.text("NUIT: "+this.clinica.nuit, 50, 105);
  
  doc.text("Nome do Paciente: "+paciente.nome, 50, 125);
  doc.text("NID: "+paciente.nid, 250, 125);
  doc.text("Apelido: "+paciente.apelido, 50, 145);
  doc.text("Data de emissão: "+dataemisao, 250, 145);
  let n = paciente.nuit ? paciente.nuit : ""; //Trabalhando o NUIT por nao ser campo obrigatorio pode estar nulo
  doc.text("NUIT do paciente: "+n, 50, 165);
 
  doc.setFillColor(50,50,50);
  doc.rect ( 50, 170 , 40 , 20 ); 
  doc.rect (  50, 190 , 40 , 320 ); 

  doc.rect (  90, 170 , 150 , 20 ); 
  doc.rect (  90, 190 , 150 , 320 );

  doc.rect (  240, 170 , 50 , 20 ); 
  doc.rect (  240, 190 , 50 , 320 );

  doc.rect (  290, 170 , 60 , 20 ); 
  doc.rect (  290, 190 , 60 , 320 );

  doc.rect (  350, 170 , 50 , 20 ); 
  doc.rect (  350, 190 , 50 , 320);

  doc.rect ( 290, 510 , 110 , 20 );

  doc.setFontStyle("bold");
  doc.text("Item", 60, 180);
  doc.text("Descrição", 120, 180);
  doc.text("Quantd", 245, 180);
  doc.text("Preço Unit", 295, 180);
  doc.text("Preç Tot", 355, 180);
  doc.text("Total: "+preco_total.toFixed(2).replace(".",",")+" MZN", 293, 525);

  doc.rect (  290, 170 , 60 , 20 ); 
  doc.rect (  290, 190 , 60 , 320 );

  doc.save(nome+ id +'.pdf'); 
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
     docu.text(paciente.nome+" "+paciente.apelido,77, 112);
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

     docu.save('Diario clinico -' + paciente.nid + ' - ' + this.consulta.data + '.pdf');  //nome do arquivo
  }  

}



//==========================================================================================================
//DiagnosticosDialog ---------------------------------------------------------
//=========================================================================================================

@Component({
  selector: 'diagnosticos-dialog',
  templateUrl: 'diagnosticos.component.html',
  })
  export class DiagnosticosDialog {

  clinica: Clinica; //PDF
  nr_cotacao = 0; //PDF
  nr_fatura = 0; //PDF

  desabilitar: boolean = false; //Fatura
  desabilitar2: boolean = false; //Cotacao
  texto: string = "Faturar"; //Fatura
  texto2: string = "Cotar"; //Cotacao

  diagnosticoFormGroup: FormGroup;
  diagnosticos: DiagnosticoAuxiliar[] = [];
  diagnostico:DiagnosticoAuxiliar;
  diagnosticos_aux:DiagnosticoAuxiliar[];
  diagnosticos_param: DiagnosticoAuxiliar[] = [];

  dataSourse: MatTableDataSource<DiagnosticoAuxiliar>;
  displayedColumns = ['tipo','subtipo','nome','preco', 'remover'];

  consulta?: Consulta;
  preco_total:Number = 0;
 
  tipodiagnostico: TipoDiagnosticoAux;
  subtipodiagnostico: SubTipoDiagnosticoAux;
  subtipos_diagnosticos_param: SubTipoDiagnosticoAux[] = [];
  
  tipos_diagnosticos: TipoDiagnosticoAux[];
  tipos_diagnosticos_aux: TipoDiagnosticoAux[];
  subtipos_diagnosticos: SubTipoDiagnosticoAux[];
  subtipos_diagnosticos_aux: SubTipoDiagnosticoAux[];

  medico = "";

  forma_pagamento = "";

  seguradora: Seguradora;

  nr_apolice = "";

  linhas: Linha[] = [];

  constructor(  public dialogRef: MatDialogRef<DiagnosticosDialog>, private router: Router,
  @Inject(MAT_DIALOG_DATA) public data: any, public authService:AuthService,
  public pacienteService: PacienteService,  public snackBar: MatSnackBar, 
  private _formBuilder: FormBuilder, public configServices: ConfiguracoesService) {
    this.diagnostico = new DiagnosticoAuxiliar();

    this.seguradora = new Seguradora();
    
    this.diagnosticos_aux = this.data.diagnosticos;
    this.tipos_diagnosticos_aux = this.data.tipos_diagnosticos;
    this.subtipos_diagnosticos_aux = this.data.subtipos_diagnosticos;

    
    /*this.configServices.getDiagnosticos().snapshotChanges().subscribe(data => {
      this.diagnosticos = data.map(e => {
        return {
          id: e.payload.key,
          ...e.payload.val(),
        } as DiagnosticoAuxiliar;
      });
      this.diagnosticos_aux=this.diagnosticos;
    })

    this.configServices.getTiposDiagnosticos().snapshotChanges().subscribe(data => {
      this.tipos_diagnosticos = data.map(e => {
        return {
          id: e.payload.key,
          //subtipos: e.payload.val()['subtipo'] as SubTipoDiagnosticoAux[],
          ...e.payload.val(),
        } as TipoDiagnosticoAux;
      });
      this.tipos_diagnosticos_aux=this.tipos_diagnosticos;
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
    })*/
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

    this.clinica = this.data.clinica; //PDF
    this.nr_cotacao = this.data.nr_cotacao; //PDF
    this.nr_fatura = this.data.nr_fatura; //PDF

  }

  precoSegurado = false;
  mudarFPagamento(){
    this.nr_apolice = "";
    this.seguradora = new Seguradora();
    if(this.diagnostico.preco){
      if(this.forma_pagamento == "Convênio"){
        this.precoSegurado = true;
      }else{
        this.precoSegurado = false;
      }
    }
  }

  

  filtrodiagnostico="";
  filtrarDiagnosticos(filtrodiagnostico) {
    if(filtrodiagnostico){
      filtrodiagnostico = filtrodiagnostico.trim(); // Remove whitespace
      filtrodiagnostico = filtrodiagnostico.toLowerCase(); // Datasource defaults to lowercase matches
     
    this.diagnosticos= null;

  this.data.diagnosticos = this.diagnosticos_aux.filter(item => item.nome.toLocaleLowerCase().indexOf(filtrodiagnostico) > -1);     
    }else{
      this.data.diagnosticos = this.diagnosticos_aux;
    }
  }

  filtrotipodiagnostico="";

  filtrarTipoDiagnosticos(filtrotipodiagnostico) {
    if(filtrotipodiagnostico){
      filtrotipodiagnostico = filtrotipodiagnostico.trim(); // Remove whitespace
      filtrotipodiagnostico = filtrotipodiagnostico.toLowerCase(); // Datasource defaults to lowercase matches
     
    this.tipos_diagnosticos= null;

  this.data.tipos_diagnosticos = this.tipos_diagnosticos_aux.filter(item => item.nome.toLocaleLowerCase().indexOf(filtrotipodiagnostico) > -1);     
    }else{
      this.data.tipos_diagnosticos = this.tipos_diagnosticos_aux;
    }
  }

  filtrosubtipodiagnostico="";
  filtrarSubtipoDiagnostico(filtrosubtipodiagnostico){
    if(filtrosubtipodiagnostico){
      filtrosubtipodiagnostico = filtrosubtipodiagnostico.trim(); // Remove whitespace
      filtrosubtipodiagnostico = filtrosubtipodiagnostico.toLowerCase(); // Datasource defaults to lowercase matches
     
    this.data.subtipos_diagnosticos= null;
  
  this.data.subtipos_diagnosticos = this.subtipos_diagnosticos_aux.filter(item => item.nome.toLocaleLowerCase().indexOf(filtrosubtipodiagnostico) > -1);     
    }else{
      this.data.subtipos_diagnosticos = this.subtipos_diagnosticos_aux;
    }
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


      let linha = new Linha();
      linha.descricao_servico = diagnostico.nome+"";
      linha.qtd_solicitada = 1;
      linha.id_servico = diagnostico.id+"";
      
      

      if(this.forma_pagamento == "Convênio"){
        linha.preco_unitario = +diagnostico.preco_seguradora;
        this.preco_total = +this.preco_total + +diagnostico.preco_seguradora;
      }else{
        linha.preco_unitario = +diagnostico.preco;
        this.preco_total = +this.preco_total + +diagnostico.preco;
      }
     
      linha.preco_total = linha.preco_unitario*1;
      this.linhas.push(linha);

      this.texto = "Faturar "+ this.preco_total.toFixed(2).replace(".",",") +" MZN";
  
      this.dataSourse=new MatTableDataSource(this.diagnosticos);
      this.diagnostico = new DiagnosticoAuxiliar();
      this.tipodiagnostico = new TipoDiagnosticoAux();
      this.subtipodiagnostico = new SubTipoDiagnosticoAux();
    }else{
      this.openSnackBar("Selecione um diagnostico");
    }
    
  }

  removeDiagostico(diagnostico:DiagnosticoAuxiliar){
    this.preco_total = +this.preco_total - +diagnostico.preco;
    this.texto = "Faturar "+ this.preco_total.toFixed(2).replace(".",",") +" MZN";
    this.diagnosticos.splice(this.diagnosticos.indexOf(diagnostico), 1);
    this.dataSourse=new MatTableDataSource(this.diagnosticos);

    this.linhas.forEach(element => {
      if(element.id_servico == diagnostico.id){
      this.linhas.splice(this.linhas.indexOf(element), 1);
      }
    });
  }

  onNoClick(): void {
    this.dialogRef.close();
  }


  faturarDiagnostico(paciente:Paciente){
    if(this.diagnosticos.length>0 && this.medico !== ""){

      var updatedUserData = {};

      if(this.forma_pagamento == "Convênio"){  
        if(this.nr_apolice == "" || this.nr_apolice == null){
          this.openSnackBar("Preencha o nr da apolice");
          return;
        }

        if(this.seguradora.nome == "" || this.seguradora.nome == null){
          this.openSnackBar("Selecione a seguradora");
          return;
        }
      }

      let servico = "Diagnosticos: ";

      //Abrir uma consulta DIAGNOSTICO AUXILIAR --------------------
      let dia = new Date().getDate();
      let mes = this.getMes(+(new Date().getMonth()) + +1);
      let ano = new Date().getFullYear();

      this.consulta = new Consulta();
      this.consulta.data = dia +"/"+mes+"/"+ano;
      this.consulta.ano = ano;
      this.consulta.marcador = this.authService.get_perfil + ' - ' + this.authService.get_user_displayName;
      this.consulta.paciente = paciente;
      this.consulta.diagnosticos_aux = this.diagnosticos;

      this.consulta.diagnosticos_aux.forEach(element => {
        element.tipo = null;
        servico = servico+" "+element.nome+" ; ";
      });

      this.consulta.status = "Encerrada";
      this.consulta.tipo = "DIAGNOSTICO AUX";

      this.consulta.paciente_nome = paciente.nome;
      this.consulta.paciente_apelido = paciente.apelido;
      this.consulta.paciente_nid = paciente.nid;

      this.consulta.medico_nome = this.medico;

      let key = this.pacienteService.db.list('consultas/'+this.authService.get_clinica_id +'/lista_relatorio/'+ ano).push('').key;
      this.consulta.id = key;

      updatedUserData['consultas/'+this.authService.get_clinica_id +'/lista_relatorio/'+ ano + '/'+key] = this.consulta;


      let faturacao = new Faturacao();
      faturacao.categoria = "DIAGNOSTICO_AUX";
      faturacao.valor = this.preco_total;
      faturacao.data = new Date();
      //faturacao.consulta = this.consulta;
      //faturacao.diagnostico_aux = this.consulta.diagnosticos_aux;
      
      faturacao.mes = this.getMes(+new Date().getMonth()+ +1);
      faturacao.ano = new Date().getFullYear();
      faturacao.id = this.nr_fatura+"";

      faturacao.medico_nome = this.medico;

      updatedUserData['faturacao/'+this.authService.get_clinica_id + '/'+faturacao.ano +'/'+this.nr_fatura] = faturacao;

      let conta = new Conta();
      conta.ano = ano;
      conta.mes = mes;
      conta.dia = dia;
      conta.data = dia +"/"+(+new Date().getMonth()+ +1)+"/"+ano;
      conta.cliente_nuit = this.consulta.paciente.nuit ? this.consulta.paciente.nuit : "";
      conta.cliente_apelido = this.consulta.paciente_apelido;
      conta.cliente_nome = this.consulta.paciente_nome;
      conta.cliente_nid = this.consulta.paciente_nid;
      conta.forma_pagamento = this.forma_pagamento;    
      conta.consulta = servico;
      conta.linhas = this.linhas;
      conta.segunda_via = true;
      if(conta.forma_pagamento == "Convênio"){
        conta.categoria = "A receber";
        conta.nr_apolice = this.nr_apolice;
        conta.seguradora_nome = this.seguradora.nome;
        conta.valor_total = this.preco_total;
      }else{
        conta.categoria = "Recebida";
        conta.valor_total = this.preco_total;
        conta.data_recebimento = new Date();
      }

      if(conta.categoria == "A receber"){
        updatedUserData['contas/'+this.authService.get_clinica_id + '/'+faturacao.ano +'/receber/'+this.nr_fatura] = conta;
      }else{
        updatedUserData['contas/'+this.authService.get_clinica_id + '/'+faturacao.ano +'/recebidas/'+this.nr_fatura] = conta;
      }

      //GRAVAR SIMULTANEAMENTE TODOS OS DADOS E NAO HAVER INCONSISTENCIA
      let d = Object.assign({}, updatedUserData);
      this.pacienteService.multiSave(d) 
      .then(r =>{
        this.downloadPDF(this.diagnosticos, paciente, "Faturacao");
        this.dialogRef.close();
        this.openSnackBar("Faturado com sucesso");
      }, err =>{
        this.desabilitar = false;
        this.texto = "Faturar";
        this.openSnackBar("Ocorreu um erro ao cadastrar. Tente novamente ou contacte a equipe de suporte.");
      })
      

      //Persistir informacao na base de dados ----------------------------
      //let data = Object.assign({}, faturacao);
      //let d = Object.assign({}, this.consulta);

      /************************************ AJUSTAR PARA MULTIPUSH ***********************************/

      /*this.pacienteService.faturar(data)
      .then( res => {
        this.pacienteService.marcarConsulta(d)
        .then(r => {
          this.downloadPDF(this.diagnosticos, paciente, "Faturacao");
          this.dialogRef.close();
          this.openSnackBar("Faturado com sucesso");
        }, er => {
          console.log("ERRO: " + er.message)
          this.openSnackBar("Ocorreu um erro. Contacte o Admin do sistema.");
        })      
      }, err=>{
        console.log("ERRO: " + err.message)
        this.openSnackBar("Ocorreu um erro. Contacte o Admin do sistema.");
      })*/

    }else{
      this.openSnackBar("Adicione pelo menos um diagnostico e selecione o medico");
    }

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




  cotar(paciente: Paciente){
    if(this.diagnosticos.length>0){
      this.desabilitar2 = true;
      this.texto2 = "AGUARDE UM INSTANTE...";

      this.downloadPDF(this.diagnosticos, paciente, "Cotacao");
      this.texto2 = "Cotar";
      //this.desabilitar = false;
    }else{
      this.openSnackBar("Adicione pelo menos um diagnostico");
    }
  }




  //GERAR PDFS
  public downloadPDF(diagnosticos :DiagnosticoAuxiliar[], paciente: Paciente, categoria){// criacao do pdf

    let nome = "";
    if(categoria == 'Cotacao'){
      nome = "COTAÇÃO";
    }else{
      nome = "RECIBO";
    }
  
    if(this.clinica.endereco){
      if(this.nr_cotacao > 0 && this.nr_fatura >0){
        
      
        if(categoria == 'Cotacao'){
          let nr_cotacao = new NrCotacao();
          nr_cotacao.id = this.nr_cotacao+"";
          let d = Object.assign({}, nr_cotacao); 

          this.configServices.addNrCotacao(d)
          .then(r =>{
    
            this.gerarPDF(diagnosticos , paciente, nome, d.id);
            
          }, err=>{
            this.openSnackBar("Ocorreu um erro ao gerar a "+ categoria +". Tente novamente.");
          })
        }else{
          let nr_fatura = new NrFatura();
          nr_fatura.id = this.nr_fatura+"";
          let d = Object.assign({}, nr_fatura); 

          this.configServices.addNrFatura(d)
          .then(r =>{
    
            this.gerarPDF(diagnosticos , paciente, nome, d.id);
            
          }, err=>{
            this.openSnackBar("Ocorreu um erro ao gerar a "+ categoria +". Tente novamente.");
          })
        }
        

      }else{
        this.openSnackBar("Ocorreu um erro ao gerar a "+ categoria +". Tente novamente.");
      }
    
    }else{
      this.openSnackBar("Ocorreu um erro ao gerar a "+ categoria +". Tente novamente.");
    }
     
}//Fim download pdf

gerarPDF(diagnosticos :DiagnosticoAuxiliar[], paciente: Paciente, nome, id){
  let doc = new jsPDF({
    orientation: 'p',
    unit: 'px',
    format: 'a4',
    putOnlyUsedFonts:true,
  });

  let specialElementHandlers ={
    '#editor': function(element,renderer){return true;} 
  }
  let dia = new Date().getDate();
  let mes = +(new Date().getMonth()) + +1;
  let ano = new Date().getFullYear();
  let dataemisao = dia +"/"+mes+"/"+ano;  

  var img = new Image();
  img.src ="../../../assets/images/1 - logo - vitalle.jpg"; 
  doc.addImage(img,"PNG", 300, 40,90, 90);

  doc.setFont("Courier");
  doc.setFontStyle("normal"); 
  doc.setFontSize(12);
  doc.text(id+"", 225, 40);
  let item = 1;
  let preco_total = 0;
  let linha = 200;                      
  diagnosticos.forEach(element => {
    doc.text(item+"", 55, linha) //item
    doc.text("1", 257, linha) //quantidade

    let string1 = "";
    let string2 = "";
    let linhaAlternativo = 0;
    if(element.nome.length > 26){
      string1 = element.nome.substr(0,26);
      let q = +element.nome.length - +26;
      string2 = element.nome.substr(q).toString().trim();

      linhaAlternativo = +linha+ +20;

      doc.text(string1 , 95, linha) //descricao
      doc.text(string2 , 95, linhaAlternativo) //descricao

    }else{
      doc.text(element.nome , 95, linha) //descricao
    }
    //doc.text(element.nome , 95, linha) //descricao

    if(this.forma_pagamento == "Convênio"){
      doc.text(element.preco_seguradora+"", 294, linha)
      doc.text(element.preco_seguradora+"", 354, linha)
  
      preco_total = +preco_total + +element.preco_seguradora;
    }else{
      doc.text(element.preco+"", 294, linha)
      doc.text(element.preco+"", 354, linha)
  
      preco_total = +preco_total + +element.preco;
    }

    
    item = +item + +1;

    if(linhaAlternativo >0){
      linha = +linha + +40;
    }else{
      linha = +linha + +20;
    }
    
  });   
   
  doc.setFont("Courier");
  doc.setFontStyle("normal"); 
  doc.setFontStyle("bold");
  doc.setFontSize(15);

  doc.text(nome+":", 170, 40);  

  doc.setFont("Courier");
  doc.setFontStyle("normal"); 
  doc.setFontSize(10);

  doc.text("Processado pelo computador", 170, 580);
  doc.text(this.clinica.endereco, 50, 65);
  doc.text(this.clinica.provincia+", "+this.clinica.cidade, 50,75);
  doc.text("Email: "+this.clinica.email, 50, 85);
  doc.text("Cell: "+this.clinica.telefone, 50, 95);
  doc.text("NUIT: "+this.clinica.nuit, 50, 105);
  
  doc.text("Nome do Paciente: "+paciente.nome, 50, 125);
  doc.text("NID: "+paciente.nid, 250, 125);
  doc.text("Apelido: "+paciente.apelido, 50, 145);
  doc.text("Data de emissão: "+dataemisao, 250, 145);
  let n = paciente.nuit ? paciente.nuit : ""; //Trabalhando o NUIT por nao ser campo obrigatorio pode estar nulo
  doc.text("NUIT do paciente: "+n, 50, 165);

  /*doc.text(this.clinica.endereco, 50, 65);
  doc.text(this.clinica.provincia+", "+this.clinica.cidade, 50,75);
  doc.text("Email: "+this.clinica.email, 50, 85);
  doc.text("Cell: "+this.clinica.telefone, 50, 95);
  doc.text("NUIT: "+this.clinica.nuit, 50, 105);
  doc.text("Nome do Paciente:"+paciente.nome, 50, 125);
  //doc.text(paciente.nome, 128, 125);
  doc.text("NID:"+paciente.nid, 250, 125);
  //doc.text(paciente.nid+"", 268, 125);
  doc.text("Apelido:"+paciente.apelido, 50, 145);
  // doc.text(paciente.apelido, 89, 145);
  doc.text("Data de emissão:"+dataemisao, 250, 145);
  //doc.text(dataemisao, 322, 145);
  doc.text("NUIT do paciente:"+paciente.nuit, 50, 165);*/

  doc.setFillColor(50,50,50);
  doc.rect ( 50, 170 , 40 , 20 ); 
  doc.rect (  50, 190 , 40 , 320 ); 

  doc.rect (  90, 170 , 150 , 20 ); 
  doc.rect (  90, 190 , 150 , 320 );

  doc.rect (  240, 170 , 50 , 20 ); 
  doc.rect (  240, 190 , 50 , 320 );

  doc.rect (  290, 170 , 60 , 20 ); 
  doc.rect (  290, 190 , 60 , 320 );

  doc.rect (  350, 170 , 50 , 20 ); 
  doc.rect (  350, 190 , 50 , 320);

  doc.rect ( 290, 510 , 110 , 20 );

  doc.setFontStyle("bold");
  doc.text("Item", 60, 180);
  doc.text("Descrição", 120, 180);
  doc.text("Quantd", 245, 180);
  doc.text("Preço Unit", 295, 180);
  doc.text("Preç Tot", 355, 180);
  doc.text("Total: "+preco_total.toFixed(2).replace(".",",")+" MZN", 293, 525);

  doc.rect (  290, 170 , 60 , 20 ); 
  doc.rect (  290, 190 , 60 , 320 );

  doc.save(nome+ id +'.pdf'); 
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



  /*export interface DialogData {
    animal: string;
    name: string;
  }*/
  
  /**
   * @title Dialog Overview
   */
  @Component({
    selector: 'dialog-detalhes',
    templateUrl: './detalhes.component.html',
    styleUrls: ['./detalhes.component.scss']
  })
  
  
  export class DialogDetalhes {
   
    constructor(public dialogRef: MatDialogRef<DialogDetalhes>, @Inject(MAT_DIALOG_DATA) public data: any,
    private pacienteService: PacienteService) {

    }
    clinica: Clinica;
    pacientes: Paciente[];
    
    gerarPDFDados(paciente){
  let doc = new jsPDF({
    orientation: 'p',
    unit: 'px',
    format: 'a4',
    putOnlyUsedFonts:true,
  });

  let specialElementHandlers ={
    '#editor': function(element,renderer){return true;} 
  }
  let dia = new Date().getDate();
  let mes = +(new Date().getMonth()) + +1;
  let ano = new Date().getFullYear();
 let dataemisao = dia +"/"+mes+"/"+ano;  
  var img = new Image();
  img.src ="../../../assets/images/1 - logo - vitalle.jpg"; 
  doc.addImage(img,"PNG", 170, 40,100, 100);
  doc.setFont("Courier");
  doc.setFontStyle("normal"); 
 // doc.setFontStyle("bold");
  doc.setFontSize(12);
  doc.text("Nome do Paciente:"+paciente.nome,50, 195);
  doc.text("NID:"+paciente.nid, 250, 195);
  doc.text("Apelido:"+paciente.apelido, 50, 215);
  doc.text("Genero:"+paciente.genero, 250, 215);
  doc.text("Documento:"+paciente.documento_identificacao, 50, 235);
  doc.text("Numero de documento:"+paciente.nr_documento_identificacao, 250, 235);
  doc.text("Bairro:"+paciente.bairro, 250, 255);
   doc.text("Localidade:"+paciente.localidade, 50, 255);
   doc.text("Avenida:"+paciente.avenida, 50, 275);
   doc.text("Casa:"+paciente.casa, 250, 275);
   doc.text("Celula:"+paciente.celula, 50, 295);
   doc.text("Quarteirao:"+paciente.quarteirao, 250, 295);
   doc.text("Posto Administrativo:"+paciente.posto_admnistrativo, 50, 315);
   doc.text("Distrito:"+paciente.distrito, 250, 315);
   doc.text("Provincia:"+paciente.provincia, 50, 335);
   doc.text("Nome Referencial:"+paciente.acompanhante_nome, 250, 335);
   doc.text("Apelido:"+paciente.acompanhante_apelido, 50, 355);
   doc.text("Telefone:"+paciente.acompanhante_telefone, 250, 355);
   doc.text("NUIT do paciente:"+paciente.nuit, 50, 375);
  doc.setFont("Courier");
  doc.setFontStyle("normal"); 
  doc.setFontSize(12);
  
  
 // doc.text(paciente.nome, 140, 195);
 
  //doc.text(paciente.nid+"", 272, 195);
  
 // doc.text(paciente.apelido, 93, 215);
//
 // doc.text(paciente.genero,288, 215);

 
 // doc.text(paciente.documento_identificacao, 103, 235);

 // doc.text(paciente.nr_documento_identificacao+"", 356, 235);

 
 // doc.text(paciente.localidade, 110, 255);
 
 
 // doc.text(paciente.bairro, 287, 255);

  
 // doc.text(paciente.avenida, 96, 275);
 

 // doc.text(paciente.casa+"", 280, 275);
 

// doc.text(paciente.celula+"", 90, 295);

 
 //  doc.text(paciente.quarteirao+"", 310, 295);
  
  
  // doc.text(paciente.posto_admnistrativo, 165, 315);
  
  // doc.text(paciente.distrito, 299, 315);


   
  
  // doc.text(paciente.provincia, 104, 335);

 
  
   //doc.text(paciente.acompanhante_nome, 343, 335);

  

  // doc.text(paciente.acompanhante_apelido, 94, 355);

 

   //doc.text(paciente.acompanhante_telefone, 298, 355);

  //doc.text(paciente.nuit, 145, 375);

  doc.setFont("Courier");
  doc.setFontStyle("normal"); 
  doc.setFontStyle("bold");
  doc.setFontSize(14);
  doc.text("DADOS DO PACIENTE", 170, 145);
 



  doc.setFont("Courier");
  doc.setFontStyle("normal"); 
  doc.setFontSize(10);
 
 // doc.text("Processado pelo computador", 170, 580);
  
  
  doc.text("Processado pelo computador", 165, 550);

 

  doc.setFontStyle("bold");
 

  doc.save(paciente.nome +'.pdf'); 
}


    closeModal(){
      this.dialogRef.close();
    }
      
  }

  @Component({
    selector: 'dialog-editar',
    templateUrl: './editar.component.html',
  
  })
  
  
  export class DialogEditar{
  
    constructor(private _formBuilder: FormBuilder, public dialog: MatDialog,
    public dialogRef: MatDialogRef<DialogEditar>,
    @Inject(MAT_DIALOG_DATA) public data: any, public authService:AuthService,
    public pacienteService: PacienteService,  public snackBar: MatSnackBar, public configServices:ConfiguracoesService)
    {

    }

    pacientes: Paciente[];

    GuardarDados(paciente){
      let data = Object.assign({}, paciente)
      this.pacienteService.updatePaciente(data) 
      .then( res => {
  
        this.openSnackBar("Dados Guardados com sucesso");
      }).catch(erro => {
        this.openSnackBar("Ocorreu um erro ao atualizar os dados. Consulte o Admin do sistema.");
          console.log("Erro ao atualizar dados do paciente na consulta: "+erro.message)
      });
    }

    onNoClick(): void {
      this.dialogRef.close();
    }
    
    closeModal(){
      this.dialogRef.close();
    }

    openSnackBar(mensagem) {
      /*this.snackBar.openFromComponent(null, {
      duration: 2000,
      announcementMessage: mensagem
      });*/
      this.snackBar.open(mensagem, null,{
        duration: 4000
      
      })
    }
}
    
   
   
  