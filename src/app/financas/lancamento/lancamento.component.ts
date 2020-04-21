import { Component, OnInit, ViewChild } from '@angular/core';
import { Lancamento } from '../../classes/lancamentos';
import { PlanoConta } from '../../classes/plano_conta';
import { TipoPlanoConta } from '../../classes/tipo_plano_conta';
import { SubTipoPlanoConta } from '../../classes/subtipo_plano_conta';
import { MatTableDataSource, MatPaginator, MatSort, MatSnackBar, MatDialog } from '@angular/material';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ConfiguracoesService } from '../../services/configuracoes.service';

@Component({
  selector: 'app-lancamento',
  templateUrl: './lancamento.component.html',
  styleUrls: ['./lancamento.component.scss']
})
export class LancamentoComponent implements OnInit {

  editando: Boolean = false;
  habilitar_formas = false;

  lancamento: Lancamento;
  lancamentos: Lancamento[] = [];

  planosConta: PlanoConta[] = [];
  planosConta_Aux: PlanoConta[] = [];
  tiposPlanos: TipoPlanoConta[] = [];
  subTiposPlanos: SubTipoPlanoConta[] = [];
  subTiposPlanos_Aux: SubTipoPlanoConta[] = [];

  cadastroFormGroup: FormGroup;
  dataSourse: MatTableDataSource<Lancamento>;
  displayedColumns = ['data', 'tipo','subtipo', 'plano', 'valor', 'editar', 'remover'];
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  formas_pagamento = [
    {value: 'Numerário', viewValue: 'Numerário'},
    {value: 'POS', viewValue: 'POS'},
    {value: 'MPesa', viewValue: 'MPesa'},
    {value: 'Cheque', viewValue: 'Cheque'},
    {value: 'Convênio', viewValue: 'Convênio'},
  ]

  anos = [];
  ano:number = (new Date()).getFullYear();
  meses = ['Janeiro', 'Fevereiro', 'Marco', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  mes = this.meses[+(new Date().getMonth())];

  constructor(private _formBuilder: FormBuilder, public snackBar: MatSnackBar, private authService: AuthService, public dialog: MatDialog,
  private configService: ConfiguracoesService) { 
   
    this.lancamento = new Lancamento();
    
    this.cadastroFormGroup = this._formBuilder.group({
      tipo: ['', Validators.required],
      subtipo: ['', Validators.required],
      plano: ['', Validators.required],
      valor: ['', [Validators.required, Validators.min(0)]],
      descricao: [''],
    });
  }

  ngOnInit() {
    this.configService.getSubTiposPlanosConta().snapshotChanges().subscribe(data => {
      this.subTiposPlanos_Aux = data.map(e => {
        return {
          id: e.payload.key,
          ...e.payload.val(),
        } as SubTipoPlanoConta;
      });
      this.subTiposPlanos = this.subTiposPlanos_Aux;
    })

    this.configService.getPlanosConta().snapshotChanges().subscribe(data => {
      this.planosConta_Aux = data.map(e => {
        return {
          id: e.payload.key,
          ...e.payload.val(),
        } as PlanoConta;
      });
      this.planosConta = this.planosConta_Aux;
    })

    this.configService.getLancamentos(this.ano, this.mes).snapshotChanges().subscribe(data => {
      this.lancamentos = data.map(e => {
        return {
          id: e.payload.key,
          ...e.payload.val(),
        } as Lancamento;
      });
      this.dataSourse=new MatTableDataSource(this.lancamentos.sort((a, b) => a.data > b.data ? 1 : -1));
      setTimeout(()=> this.dataSourse.paginator = this.paginator);
    })

    this.configService.getTiposPlanosConta().snapshotChanges().subscribe(data => {
      this.tiposPlanos = data.map(e => {
        return {
          id: e.payload.key,
          //subTipos: e.payload.val()['subTipos'] as SubTipoPlanoConta[],
          ...e.payload.val(),
        } as TipoPlanoConta;
      });
      this.lancamento.tipo = this.tiposPlanos[0];
      this.mudarTipo();
    })
  }

  mudarTipo(){
    this.subTiposPlanos = [];
    this.planosConta = [];

    this.habilitar_formas = this.lancamento.tipo.nome == "2.Entrada" ? true : false;

    if(this.lancamento.tipo){
      this.subTiposPlanos_Aux.forEach(element => {
        if(element.tipo.nome == this.lancamento.tipo.nome){
          this.subTiposPlanos.push(element);
        }
      });
    }

    this.planosConta_Aux.forEach(element => {
      if(element.tipo.nome == this.lancamento.tipo.nome){
        this.planosConta.push(element);
      }
    });
  }

  mudarSubTipo(){
    this.planosConta = [];

    if(this.lancamento.subtipo){
      this.planosConta_Aux.forEach(element => {
        if(element.subtipo.nome == this.lancamento.subtipo.nome){
          this.planosConta.push(element);
        }
      });
    }
  }


  autualizar(){
    if(this.cadastroFormGroup.valid){

      this.lancamento.descricao = this.lancamento.descricao ? this.lancamento.descricao : "";

      this.lancamento.tipo_nome = this.lancamento.tipo.nome;
      this.lancamento.subtipo_nome = this.lancamento.subtipo.nome;
      this.lancamento.plano_nome = this.lancamento.plano.nome;

      this.lancamento.tipo = null;
      this.lancamento.subtipo = null;
      this.lancamento.plano = null;

      let data = Object.assign({}, this.lancamento);

      this.configService.updateLancamento(data)
      .then( res => {

        this.lancamento = new Lancamento();
        this.cadastroFormGroup.reset;
        this.editando = false;
        this.lancamento.tipo = this.tiposPlanos[0];
        this.mudarTipo();

        this.openSnackBar("Lancamento atualizado com sucesso");
      }, err=>{
        this.openSnackBar("Ocorreu um erro ao cadastrar. Contacte o admnistrador do sistema");
      })

    }else{
      this.openSnackBar("Preencha devidamente todos os campos")
    }
  }

  cadastrar(){
    if(this.cadastroFormGroup.valid){

      //this.lancamento.dia = new Date().getDate();
      this.lancamento.dia = +new Date().toISOString().substr(8,2);
      this.lancamento.ano = this.ano;
      this.lancamento.mes = this.mes;
      this.lancamento.data = new Date();


      console.log("this.lancamento.data "+this.lancamento.data );

      this.lancamento.descricao = this.lancamento.descricao ? this.lancamento.descricao : "";

      this.lancamento.tipo_nome = this.lancamento.tipo.nome;
      this.lancamento.subtipo_nome = this.lancamento.subtipo.nome;
      this.lancamento.plano_nome = this.lancamento.plano.nome;

      this.lancamento.tipo = null;
      this.lancamento.subtipo = null;
      this.lancamento.plano = null;

      this.lancamento.data = this.lancamento.data;
      let data = Object.assign({}, this.lancamento);

      this.configService.createLancamento(data)
      .then( res => {

        this.lancamento = new Lancamento();
        this.cadastroFormGroup.reset;
        this.lancamento.tipo = this.tiposPlanos[0];
        this.mudarTipo();

        this.openSnackBar("Lancamento cadastrado com sucesso");
      }, err=>{
        this.openSnackBar("Ocorreu um erro ao cadastrar. Contacte o admnistrador do sistema");
      })


    }else{
      this.openSnackBar("Preencha devidamente todos os campos")
    }
  }

  editar(lancamento: Lancamento){
    this.lancamento = lancamento;
    //this.lancamento.data = new Date();
    this.editando = true;

    this.tiposPlanos.forEach(element => {
      if(element.nome == lancamento.tipo_nome){
        this.lancamento.tipo = element;
      }
    });

    this.subTiposPlanos_Aux.forEach(element => {
      if(element.nome == lancamento.subtipo_nome){
        this.lancamento.subtipo = element;
      }
    });

    this.planosConta_Aux.forEach(element => {
      if(element.nome == lancamento.plano_nome){
        this.lancamento.plano = element;
      }
    });

  }

  openSnackBar(mensagem) {
    this.snackBar.open(mensagem, null,{
      duration: 2000
    })
  }

}
