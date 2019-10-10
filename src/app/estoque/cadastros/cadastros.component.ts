import { Component, OnInit, ViewChild } from '@angular/core';
import { Deposito } from '../../classes/deposito';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatTableDataSource, MatPaginator, MatSort, MatSnackBar } from '@angular/material';
import { EstoqueService } from '../../services/estoque.service';
import { AuthService } from '../../services/auth.service';
import { UnidadeMedida } from '../../classes/un';
import { Medicamento } from '../../classes/medicamento';
import { CategoriaMedicamento } from '../../classes/categoria_medicamento';

@Component({
  selector: 'app-cadastros',
  templateUrl: './cadastros.component.html',
  styleUrls: ['./cadastros.component.scss']
})
export class CadastrosComponent implements OnInit {

  /*
  * VARIAVEIS DA TAB MEDICAMENTOS
  */
  cats_medicamento: CategoriaMedicamento[];
  medicamento: Medicamento;
  medicamentos: Medicamento[];

  medicamentoFormGroup: FormGroup; //Fomulario

  dataSourseMedicamento: MatTableDataSource<Medicamento>;
  displayedColumnsMedicamento = ['codigo', 'categoria', 'nome_g', 'nome_c', 'un', 'preco_venda', 'min', 'composicao', 'editar'];
  @ViewChild(MatPaginator) paginatorMedicamento: MatPaginator;

  /*
  * VARIAVEIS DA TAB DEPOSITOS
  */
  deposito: Deposito;
  depositos: Deposito[];

  depositoFormGroup: FormGroup; //Fomulario

  dataSourseDeposito: MatTableDataSource<Deposito>;
  displayedColumnsDeposito = ['nome', 'descricao', 'editar'];
  @ViewChild(MatPaginator) paginatorDeposito: MatPaginator;
  //@ViewChild(MatSort) sortDiagnostico: MatSort;

  /*
  * VARIAVEIS DA TAB UNIDADES DE MEDIDA
  */
  un: UnidadeMedida;
  uns: UnidadeMedida[];

  unFormGroup: FormGroup; //Fomulario

  dataSourseUN: MatTableDataSource<UnidadeMedida>;
  displayedColumnsUN = ['nome', 'editar'];
  @ViewChild(MatPaginator) paginatorUN: MatPaginator;

  constructor(private _formBuilder: FormBuilder, public estoqueService: EstoqueService,
    public snackBar: MatSnackBar, private authService: AuthService) {
    this.deposito = new Deposito();
    this.un = new UnidadeMedida();
    this.medicamento = new Medicamento();
    this.medicamento.min = 0;
   }

  ngOnInit() {
    //TAB MEDICAMENTOS
    this.medicamentoFormGroup = this._formBuilder.group({
      m_categoria: ['', Validators.required],
      m_nome_generico: ['', Validators.required],
      m_nome_comercial: ['', Validators.required],
      m_nome_composicao: [''],
      m_un: ['', Validators.required],
      m_preco_venda: ['', Validators.required],
      m_min: [''],
    });

    this.estoqueService.getCategoriasMedicamento().snapshotChanges().subscribe(data => {
      this.cats_medicamento = data.map(e => {
        return {
          id: e.payload.key,
          ...e.payload.val(),
        } as CategoriaMedicamento;
      });
    })

    this.estoqueService.getMedicamentos().snapshotChanges().subscribe(data => {
      this.medicamentos = data.map(e => {
        return {
          id: e.payload.key,
          ...e.payload.val(),
        } as Medicamento;
      });
      this.dataSourseMedicamento=new MatTableDataSource(this.medicamentos.sort((a, b) => a.codigo > b.codigo ? 1 : -1));
      this.dataSourseMedicamento.paginator = this.paginatorMedicamento;

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
      this.dataSourseDeposito.paginator = this.paginatorDeposito;
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
      this.dataSourseUN.paginator = this.paginatorUN;
    })
  }

  registarMedicamento(){
    if(this.medicamento.nome_generico || this.medicamento.categoria || this.medicamento.un || this.medicamento.preco_venda){
      let novocodigo = this.medicamento.codigo+1;//Gerar codigo do proximo medicamento
      let data = Object.assign({}, this.medicamento);
  
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
    }else{
      this.openSnackBar("Preencha os campos obrigatorios");
    }
  }

  registarDeposito(){
    if(this.deposito.nome){
      if(!this.deposito.descricao){
        this.deposito.descricao = null;
      }
      let data = Object.assign({}, this.deposito);
  
      this.estoqueService.createDeposito(data)
      .then( res => {
        this.deposito = new Deposito();
        this.depositoFormGroup.reset;
        this.openSnackBar("Deposito cadastrado com sucesso");
      }, err=>{
        this.openSnackBar("Ocorreu um erro ao cadastrar. Contacte o admnistrador do sistema");
      })
    }else{
      this.openSnackBar("Preencha os campos obrigatorios");
    }
  }

  registarUN(){
    if(this.un.nome){
      let data = Object.assign({}, this.un);

      this.estoqueService.createUN(data)
      .then( res => {
        this.un = new UnidadeMedida();
        this.unFormGroup.reset;
        this.openSnackBar("Unidade de medida cadastrada com sucesso");
      }, err=>{
        this.openSnackBar("Ocorreu um erro ao cadastrar. Contacte o admnistrador do sistema");
      })
    }else{
      this.openSnackBar("Preencha os campos obrigatorios");
    }
  }

  openSnackBar(mensagem) {
    this.snackBar.open(mensagem, null,{
      duration: 2000
    })
  }

}
