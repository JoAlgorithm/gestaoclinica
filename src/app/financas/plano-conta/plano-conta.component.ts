import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { SubTipoPlanoConta } from '../../classes/subtipo_plano_conta';
import { MatTableDataSource, MatPaginator, MatSort, MatDialog, MatSnackBar } from '@angular/material';
import { TipoPlanoConta } from '../../classes/tipo_plano_conta';
import { AuthService } from '../../services/auth.service';
import { ConfiguracoesService } from '../../services/configuracoes.service';
import { PlanoConta } from '../../classes/plano_conta';

@Component({
  selector: 'app-plano-conta',
  templateUrl: './plano-conta.component.html',
  styleUrls: ['./plano-conta.component.scss']
})
export class PlanoContaComponent implements OnInit {

  planoConta: PlanoConta;
  tipoPlano: TipoPlanoConta;
  //subTipoPlanoConta: SubTipoPlanoConta;
  editando: Boolean = false;

  planosConta: PlanoConta[] = [];
  tiposPlanos: TipoPlanoConta[] = [];
  subTiposPlanos: SubTipoPlanoConta[] = [];
  subTiposPlanos_Aux: SubTipoPlanoConta[] = [];

  cadastroFormGroup: FormGroup;

  dataSourse: MatTableDataSource<PlanoConta>;
  displayedColumns = ['tipo','subtipo', 'nome',  'editar', 'remover'];
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(private _formBuilder: FormBuilder, public snackBar: MatSnackBar, private authService: AuthService, public dialog: MatDialog,
    private configService: ConfiguracoesService){

      this.planoConta = new PlanoConta();
      this.tipoPlano = new TipoPlanoConta();

      this.cadastroFormGroup = this._formBuilder.group({
        tipo: ['', Validators.required],
        subtipo: ['', Validators.required],
        nome: ['', Validators.required],
      });
    
  }

  ngOnInit() {
    this.configService.getTiposPlanosConta().snapshotChanges().subscribe(data => {
      this.tiposPlanos = data.map(e => {
        return {
          id: e.payload.key,
          //subTipos: e.payload.val()['subTipos'] as SubTipoPlanoConta[],
          ...e.payload.val(),
        } as TipoPlanoConta;
      });
    })

    this.configService.getSubTiposPlanosConta().snapshotChanges().subscribe(data => {
      this.subTiposPlanos = data.map(e => {
        return {
          id: e.payload.key,
          ...e.payload.val(),
        } as SubTipoPlanoConta;
      });
      this.subTiposPlanos_Aux = this.subTiposPlanos;
    })

    this.configService.getPlanosConta().snapshotChanges().subscribe(data => {
      this.planosConta = data.map(e => {
        return {
          id: e.payload.key,
          ...e.payload.val(),
        } as PlanoConta;
      });
      this.dataSourse=new MatTableDataSource(this.planosConta.sort((a, b) => a.tipo.nome > b.tipo.nome ? 1 : -1));
      setTimeout(()=> this.dataSourse.paginator = this.paginator);
    })

  }

  mudarTipo(){
    this.subTiposPlanos = [];

    this.subTiposPlanos_Aux.forEach(element => {
      if(element.tipo.nome == this.planoConta.tipo.nome){
        this.subTiposPlanos.push(element);
      }
    });
  }

  cadastrar(){
    if(this.cadastroFormGroup.valid){

      let data = Object.assign({}, this.planoConta);

      this.configService.createPlanoConta(data)
      .then( res => {

        this.planoConta = new PlanoConta();
        this.cadastroFormGroup.reset;

        this.openSnackBar("Plano de conta cadastrado com sucesso");
      }, err=>{
        this.openSnackBar("Ocorreu um erro ao cadastrar. Contacte o admnistrador do sistema");
      })

    }else{
      this.openSnackBar("Preencha devidamente todos os campos")
    }
  }

  autualizar(){
    if(this.cadastroFormGroup.valid){
      let data = Object.assign({}, this.planoConta);

      this.configService.updatePlanoConta(data)
      .then( res => {

        this.planoConta = new PlanoConta();
        this.cadastroFormGroup.reset;
        this.editando = false;

        this.openSnackBar("Plano de conta atualizado com sucesso");
      }, err=>{
        this.openSnackBar("Ocorreu um erro ao cadastrar. Contacte o admnistrador do sistema");
      })

    }else{
      this.openSnackBar("Preencha devidamente todos os campos")
    }
  }

  editar(planoConta: PlanoConta){
    this.planoConta = planoConta;
    this.editando = true;

    this.tiposPlanos.forEach(element => {
      if(element.nome == planoConta.tipo.nome){
        this.planoConta.tipo = element;
      }
    });

    this.subTiposPlanos.forEach(element => {
      if(element.nome == planoConta.subtipo.nome){
        this.planoConta.subtipo = element;
      }
    });
  }

  openSnackBar(mensagem) {
    this.snackBar.open(mensagem, null,{
      duration: 2000
    })
  }

}
