import { Component, OnInit, ViewChild } from '@angular/core';
import { Deposito } from '../../classes/deposito';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatTableDataSource, MatPaginator, MatSort, MatSnackBar } from '@angular/material';
import { EstoqueService } from '../../services/estoque.service';
import { AuthService } from '../../services/auth.service';
import { UnidadeMedida } from '../../classes/un';

@Component({
  selector: 'app-cadastros',
  templateUrl: './cadastros.component.html',
  styleUrls: ['./cadastros.component.scss']
})
export class CadastrosComponent implements OnInit {

  /*
  * VARIAVEIS DA TAB MEDICAMENTOS
  */

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
   }

  ngOnInit() {
    //TAB MEDICAMENTOS

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

  registarDeposito(){
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

  }

  registarUN(){
    let data = Object.assign({}, this.un);

    this.estoqueService.createUN(data)
    .then( res => {
      this.un = new UnidadeMedida();
      this.unFormGroup.reset;
      this.openSnackBar("Unidade de medida cadastrada com sucesso");
    }, err=>{
      this.openSnackBar("Ocorreu um erro ao cadastrar. Contacte o admnistrador do sistema");
    })
  }

  openSnackBar(mensagem) {
    this.snackBar.open(mensagem, null,{
      duration: 2000
    })
  }

}
