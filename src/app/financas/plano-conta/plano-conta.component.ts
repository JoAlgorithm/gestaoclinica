import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { SubTipoPlanoConta } from '../../classes/subtipo_plano_conta';
import { MatTableDataSource, MatPaginator, MatSort, MatDialog, MatSnackBar } from '@angular/material';
import { TipoPlanoConta } from '../../classes/tipo_plano_conta';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-plano-conta',
  templateUrl: './plano-conta.component.html',
  styleUrls: ['./plano-conta.component.scss']
})
export class PlanoContaComponent implements OnInit {

  /*
  * VARIAVEIS DA TAB TIPOS PLANOS DE CONTA
  */
 //ATRIBUTOS DO FORLMULARIO
 tipoPlano: TipoPlanoConta;

 tipoPlanoFormGroup: FormGroup;

 //ATRIBUTOS DA TABELA
 dataSourseTipoPlano: MatTableDataSource<TipoPlanoConta>;
 displayedColumnsRipoPlano = ['id', 'nome', 'editar', 'remover'];
 @ViewChild('paginatorTipoPlano', { read: MatPaginator }) paginatorTipoPlano: MatPaginator;
 @ViewChild(MatSort) sortTipoPlano: MatSort;

  /*
  * VARIAVEIS DA TAB SUB-TIPOS PLANOS DE CONTA
  */
 //ATRIBUTOS DO FORLMULARIO
 subPlanoContaFormGroup: FormGroup;

 //ATRIBUTOS DA TABELA
 dataSourseSubPlanoConta: MatTableDataSource<SubTipoPlanoConta>;
 displayedColumnssubPlanoConta = ['id', 'nome', 'tipo', 'editar', 'remover'];
 @ViewChild('paginatorPlanoConta', { read: MatPaginator }) paginatorSubPlanoConta: MatPaginator;
 @ViewChild(MatSort) sortSubPlanoConta: MatSort;

  constructor(private _formBuilder: FormBuilder, public snackBar: MatSnackBar, private authService: AuthService, public dialog: MatDialog){
    this.tipoPlano = new TipoPlanoConta();
  }

  ngOnInit() {
    //TAB TIPOS PLANO
    this.tipoPlanoFormGroup = this._formBuilder.group({
      tp_nome: ['', Validators.required],
    });
  }

  cadastrarTipo(){
    
  }

}
