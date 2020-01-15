import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { Deposito } from '../../classes/deposito';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatTableDataSource, MatPaginator, MatSort, MatSnackBar, MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { EstoqueService } from '../../services/estoque.service';
import { AuthService } from '../../services/auth.service';
import { UnidadeMedida } from '../../classes/un';
import { Medicamento } from '../../classes/medicamento';
import { CategoriaMedicamento } from '../../classes/categoria_medicamento';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { FormControl } from '@angular/forms';
import { TipoEstoque } from '../../classes/tipo_estoque';
import { Router } from '@angular/router';
import 'rxjs/add/operator/take';

@Component({
  selector: 'app-cadastros',
  templateUrl: './cadastros.component.html',
  styleUrls: ['./cadastros.component.scss']
})
export class CadastrosComponent implements OnInit {

  

  /*
  * VARIAVEIS DA TAB MEDICAMENTOS
  */
  desabilitar_fm = false;
  tipos_estoque: TipoEstoque[];
  cats_medicamento: CategoriaMedicamento[];
  cats_medicamento_aux: CategoriaMedicamento[];
  medicamento: Medicamento;
  medicamentos: Medicamento[];

  medicamentoFormGroup: FormGroup; //Fomulario

  dataSourseMedicamento: MatTableDataSource<Medicamento>;
  displayedColumnsMedicamento = ['codigo', 'tipo' ,'categoria', 'nome_g', 'nome_c', 'un', 'preco_venda', 'preco_seguradora', 'min', 'composicao', 'editar', 'remover'];
  @ViewChild('paginatorMedicamento', { read: MatPaginator }) paginatorMedicamento: MatPaginator;

  /*
  * VARIAVEIS DA TAB DEPOSITOS
  */
  deposito: Deposito;
  depositos: Deposito[];

  depositoFormGroup: FormGroup; //Fomulario

  dataSourseDeposito: MatTableDataSource<Deposito>;
  displayedColumnsDeposito = ['nome', 'descricao', 'editar', 'remover'];
  @ViewChild('paginatorDeposito', { read: MatPaginator }) paginatorDeposito: MatPaginator;
  //@ViewChild(MatSort) sortDiagnostico: MatSort;

  /*
  * VARIAVEIS DA TAB UNIDADES DE MEDIDA
  */
  un: UnidadeMedida;
  uns: UnidadeMedida[];
  uns_aux: UnidadeMedida[];

  unFormGroup: FormGroup; //Fomulario

  dataSourseUN: MatTableDataSource<UnidadeMedida>;
  displayedColumnsUN = ['nome', 'editar', 'remover'];
  @ViewChild('paginatorUN', { read: MatPaginator }) paginatorUN: MatPaginator;

  constructor(private _formBuilder: FormBuilder, public estoqueService: EstoqueService,
    public snackBar: MatSnackBar, private authService: AuthService, public dialog: MatDialog) {
    this.deposito = new Deposito();
    this.un = new UnidadeMedida();
    this.medicamento = new Medicamento();
    this.medicamento.min = 0;
   }

  ngOnInit() {
     
    //TAB MEDICAMENTOS
    this.medicamentoFormGroup = this._formBuilder.group({
      m_tipo: ['', Validators.required],
      m_categoria: ['', Validators.required],
      m_nome_generico: ['', Validators.required],
      m_nome_comercial: ['', Validators.required],
      m_nome_composicao: [''],
      m_un: ['', Validators.required],
      m_preco_venda: ['', Validators.required],
      preco_seguradora: ['', Validators.required],
      m_min: [''],
    });

    this.estoqueService.getTiposEstoque().snapshotChanges().subscribe(data => {
      this.tipos_estoque = data.map(e => {
        return {
          id: e.payload.key,
          ...e.payload.val(),
        } as TipoEstoque;
      });
    })
    
    this.estoqueService.getCategoriasMedicamento().snapshotChanges().subscribe(data => {
      this.cats_medicamento = data.map(e => {
        return {
          id: e.payload.key,
          ...e.payload.val(),
        } as CategoriaMedicamento;
      });
      this.cats_medicamento_aux = this.cats_medicamento;
    })

    this.estoqueService.getMedicamentos().snapshotChanges().subscribe(data => {
      this.medicamentos = data.map(e => {
        return {
          id: e.payload.key,
          ...e.payload.val(),
        } as Medicamento;
      });
      this.dataSourseMedicamento=new MatTableDataSource(this.medicamentos.sort((a, b) => a.codigo > b.codigo ? 1 : -1));
      setTimeout(()=> this.dataSourseMedicamento.paginator = this.paginatorMedicamento);

      //Gerar codigo do proximo medicamento
      if(typeof this.medicamentos !== 'undefined' && this.medicamentos.length > 0){
        this.medicamento.codigo = Math.max.apply(Math, this.medicamentos.map(function(o) { return o.codigo; }));
        this.medicamento.codigo = this.medicamento.codigo+1;
      }else{
        this.medicamento.codigo =  +(new Date().getFullYear()+'000001');
      }
    })

    //TAB DEPOSITOS
    this.depositoFormGroup = this._formBuilder.group({
      deposito_nome: ['', Validators.required],
      deposito_descricao: ['']
    });

    this.estoqueService.getDepositos().snapshotChanges().subscribe(data => {
      this.depositos = data.map(e => {
        return {
          id: e.payload.key,
          ...e.payload.val(),
        } as Deposito;
      });
      this.dataSourseDeposito=new MatTableDataSource(this.depositos.sort((a, b) => a.nome > b.nome ? 1 : -1));
      setTimeout(()=> this.dataSourseDeposito.paginator = this.paginatorDeposito);
    })

    //TAB UNIDADES DE MEDIDA
    this.unFormGroup = this._formBuilder.group({
      un_nome: ['', Validators.required]
    });

    this.estoqueService.getUNs().snapshotChanges().subscribe(data => {
      this.uns = data.map(e => {
        return {
          id: e.payload.key,
          ...e.payload.val(),
        } as UnidadeMedida;
      });
      this.dataSourseUN=new MatTableDataSource(this.uns.sort((a, b) => a.nome > b.nome ? 1 : -1));
      setTimeout(()=> this.dataSourseUN.paginator = this.paginatorUN);
      this.uns_aux=this.uns;
    })
  }


  removeItem(item, nome ,id){
    const dialogRef = this.dialog.open(ConfirmacaoDialog, {
      width: '500px',
      data:{item: item, nome: nome , id: id}
    });
    dialogRef.afterClosed().subscribe(result => {  
      //console.log('The dialog was closed');
    });
  }
  
  mudarCategoria(){
    if(this.medicamento.tipo.nome == "Medicamento"){
      this.desabilitar_fm = false;
    }else{
      this.desabilitar_fm = true;
      this.medicamento.categoria = null;
    }
  }

  updatedUserData = {};
  //medicamentos_aux: Medicamento[];
  medicamentos_aux: MedicamentoDeposito[];
  editarMedicamento(medicamento: Medicamento){
    this.medicamento = medicamento;
    this.updatedUserData = {};
    this.medicamentos_aux = [];

    //Ja que item existe verificar se esta cadastrado em algum deposito para atualizar
    this.depositos.forEach(element => {

      this.estoqueService.getMedicamentoDeposito(this.medicamento.id, element.id).valueChanges()
      .take(1)
      .subscribe(c => {
        if(c){ //Se medicamento existir no deposito
          
          this.medicamentos_aux.push(new MedicamentoDeposito(c, element));

          this.updatedUserData['depositos/'+this.authService.get_clinica_id + '/'+element.id+'/medicamentos/'+this.medicamento.id] = new MedicamentoDeposito(this.medicamento, element);  
        }
      })

    });
  }

  editarDeposito(deposito: Deposito){
    this.deposito= deposito;
  }

  editarUnidade(Unidade: UnidadeMedida){
    this.un= Unidade;
  }
  
  applyFilter(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // Datasource defaults to lowercase matches
    //this.dataSourseMedicamento.filter = filterValue;
   this.cats_medicamento.filter((unit) => unit.nome.indexOf(filterValue) > -1)
   this.cats_medicamento.filter(v => v.nome == filterValue)
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

  filterunidad="";
  filtrarUnidade(filterunidad) {
    if(filterunidad){
      filterunidad = filterunidad.trim(); // Remove whitespace
      filterunidad = filterunidad.toLowerCase(); // Datasource defaults to lowercase matches
     
    this.uns = null;
      this.uns = this.uns_aux.filter(item => item.nome.toLocaleLowerCase().indexOf(filterunidad) > -1);     
    }else{
      this.uns = this.uns_aux;
    }
  }

  registarMedicamento(){
    if(this.medicamento.nome_generico || this.medicamento.categoria || this.medicamento.un || this.medicamento.preco_venda){
      
      if(!this.medicamento.composicao){
        this.medicamento.composicao = "";
      }

      let novocodigo = this.medicamento.codigo+1;//Gerar codigo do proximo medicamento
      let data = Object.assign({}, this.medicamento);
      if(data.id){ 

        

        //O objetivo é atualizar o medicamento em todos os depositos sem interferir na qtd_disponivel em cada deposito
        for (const key in this.updatedUserData) { //Percorrer o "updatedUserData" onde tem medicamentos nos depositos
          if (this.updatedUserData.hasOwnProperty(key)) {

            //console.log("== Inicio check: "+key);
            //console.log("");
            //console.log("Percorrer array aux");
            //console.log("");

            this.medicamentos_aux.forEach(element => {
              //console.log("this.updatedUserData[key].deposito.id: "+this.updatedUserData[key].deposito.id);

              if(this.updatedUserData[key].deposito.id == element.deposito.id && this.updatedUserData[key].medicamento.id == element.medicamento.id)
              {
                this.medicamento.qtd_disponivel = element.medicamento.qtd_disponivel;
                //console.log("COLOCAR QTD DISPONIVEL "+this.medicamento.qtd_disponivel)
              }

            });

            let medicamento = new Medicamento();
            medicamento.qtd_disponivel = this.medicamento.qtd_disponivel;
            medicamento.nome_comercial = this.medicamento.nome_comercial;
            medicamento.categoria = this.medicamento.categoria;
            medicamento.codigo = this.medicamento.codigo;
            medicamento.composicao = this.medicamento.composicao;
            medicamento.id = this.medicamento.id;
            medicamento.nome_generico = this.medicamento.nome_generico;
            medicamento.preco_seguradora = this.medicamento.preco_seguradora;
            medicamento.preco_venda = this.medicamento.preco_venda;
            medicamento.tipo = this.medicamento.tipo;
            medicamento.un = this.medicamento.un;
            medicamento.min = this.medicamento.min;


            this.updatedUserData[key] = medicamento;
            //console.log("Atualizar medicamento com qtd disponivel de" + this.medicamento.qtd_disponivel + "no endereco: "+key);
            this.medicamento.qtd_disponivel = null;
            //console.log("Atualizou medicamento")

          }
        }
          
        this.updatedUserData['medicamentos/'+this.authService.get_clinica_id + '/'+this.medicamento.id+'/'] = this.medicamento;
        let d = Object.assign({}, this.updatedUserData);
        //console.log("Converteu");

        this.estoqueService.updateEstoque(d)
        .then( res => {
          this.medicamento= new Medicamento();
          this.medicamentoFormGroup.reset;
          this.updatedUserData = {};
          this.openSnackBar("Medicamento Atualizado com sucesso");
        }, err=>{
          this.openSnackBar("Ocorreu um erro ao cadastrar. Contacte o admnistrador do sistema");
        })

      }else{
      this.estoqueService.createMedicamento(data)
      .then( res => {
        
        this.medicamento = new Medicamento();
        this.medicamento.min = 0;
        this.medicamento.codigo = novocodigo;
        this.medicamentoFormGroup.reset;

        this.openSnackBar("Medicamento cadastrado com sucesso");
      }, err=>{
        this.openSnackBar("Ocorreu um erro ao cadastrar. Contacte o admnistrador do sistema");
      })
    }
  }}

  registarDeposito(){
    if(this.deposito.nome){
      if(!this.deposito.descricao){
        this.deposito.descricao = null;
      }
      let data = Object.assign({}, this.deposito);
      if(data.id){ 
      
        this.estoqueService.updateDeposito(data)
        .then( res => {
          this.deposito= new Deposito();
          this.depositoFormGroup.reset;
          this.openSnackBar("Deposito Atualizado com sucesso");
        }, err=>{
          this.openSnackBar("Ocorreu um erro ao cadastrar. Contacte o admnistrador do sistema");
        })
      }else{
      this.estoqueService.createDeposito(data)
      .then( res => {
        this.deposito = new Deposito();
        this.depositoFormGroup.reset;
        this.openSnackBar("Deposito cadastrado com sucesso");
      }, err=>{
        this.openSnackBar("Ocorreu um erro ao cadastrar. Contacte o admnistrador do sistema");
      })
    }
  }}

  registarUN(){
    if(this.un.nome){
      let data = Object.assign({}, this.un);
      if(data.id){ 
      
        this.estoqueService.updateUN(data)
        .then( res => {
          this.un= new UnidadeMedida();
          this.unFormGroup.reset;
          this.openSnackBar("Unidade de medida atualizada com sucesso");
        }, err=>{
          this.openSnackBar("Ocorreu um erro ao cadastrar. Contacte o admnistrador do sistema");
        })
      }else{
      this.estoqueService.createUN(data)
      .then( res => {
        this.un = new UnidadeMedida();
        this.unFormGroup.reset;
        this.openSnackBar("Unidade de medida cadastrada com sucesso");
      }, err=>{
        this.openSnackBar("Ocorreu um erro ao cadastrar. Contacte o admnistrador do sistema");
      })
    }
  }}

  openSnackBar(mensagem) {
    this.snackBar.open(mensagem, null,{
      duration: 2000
    })
  }

}

export class MedicamentoDeposito {
  medicamento?: Medicamento;
  deposito?: Deposito;

  constructor(medicamento?: Medicamento, deposito?: Deposito) {
    this.medicamento = medicamento;
    this.deposito = deposito;
  }
}

//ConfirmacaoDialog --------------------------------------------------------
@Component({
  selector: 'confirmacao-dialog',
  templateUrl: 'confirmar.component.html',
})
export class ConfirmacaoDialog {

  constructor(public dialog: MatDialog,public dialogRef: MatDialogRef<ConfirmacaoDialog>, private router: Router,
  @Inject(MAT_DIALOG_DATA) public data: any, public authService:AuthService, 
   public snackBar: MatSnackBar, private _formBuilder: FormBuilder,
    public estoqueService: EstoqueService) {
  }

  remover(item, id){
    switch(item){
      case "UN": { 
        this.estoqueService.removeUN(id).then( r=> {
          this.dialogRef.close();
          this.openSnackBar(item +" removido com sucesso.")
        }).catch(err => {
          this.openSnackBar("Ocorreu algum erro ao remover. Tente novamente ou contacte a equipe de suporte.")
        })
      } 
      case "Deposito": { 
        this.estoqueService.removeDeposito(id).then( r=> {
          this.dialogRef.close();
          this.openSnackBar(item +" removida com sucesso.")
        }).catch(err => {
          this.openSnackBar("Ocorreu algum erro ao remover. Tente novamente ou contacte a equipe de suporte.")
        })
      }
      case "Medicamento": { 
        this.estoqueService.removeMedicamento(id).then( r=> {
          this.dialogRef.close();
          this.openSnackBar(item +" removida com sucesso.")
        }).catch(err => {
          this.openSnackBar("Ocorreu algum erro ao remover. Tente novamente ou contacte a equipe de suporte.")
        })
      }
      default: { 
          break; 
      }
    }
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