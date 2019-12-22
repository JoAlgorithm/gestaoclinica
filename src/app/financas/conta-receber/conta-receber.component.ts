import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { PacienteService } from '../../services/paciente.service';
import { ConfiguracoesService } from '../../services/configuracoes.service';
import { Conta } from '../../classes/conta';
import { MatTableDataSource, MatPaginator, MatSort, MatSnackBar, MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-conta-receber',
  templateUrl: './conta-receber.component.html',
  styleUrls: ['./conta-receber.component.scss']
})
export class ContaReceberComponent implements OnInit {

  anos = [];
  ano:string = (new Date()).getFullYear()+"";

  contas: Conta[] = [];

  dataSourse: MatTableDataSource<Conta>;
  displayedColumns = ['fatura','data', 'valor_total', 'seguradora', 'apolice', 'paciente', 'servico', 'confirmar'];
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;


  constructor(private pacienteService: PacienteService, private configService: ConfiguracoesService, public snackBar: MatSnackBar,
    public dialog: MatDialog) { }

  ngOnInit() {
    setTimeout(() => {
      console.log("Ano "+this.ano)

      //ANOS
      this.configService.getAnos().snapshotChanges().subscribe(data => {
        this.anos = data.map(e => {
          return {
            id: e.payload.key
          }
        })
      })

      //CONTAS
      this.pacienteService.getContasReceber(this.ano).snapshotChanges().subscribe(data => {
        this.contas = data.map(e => {
          return {
            id: e.payload.key,
            ...e.payload.val(),
          } as Conta;
        })

        this.dataSourse=new MatTableDataSource(this.contas);
        this.dataSourse.paginator = this.paginator;
        this.dataSourse.sort = this.sort      

        if(this.contas.length <= 0){
          this.openSnackBar("Nao existe nenhuma conta a pagar");
        }
      })

    })//Fim do timeOut
  }

  onSelect(ano){
    this.contas = [];
    this.pacienteService.getContasReceber(this.ano).snapshotChanges().subscribe(data => {
      this.contas = data.map(e => {
        return {
          id: e.payload.key,
          ...e.payload.val(),
        } as Conta;
      })

      this.dataSourse=new MatTableDataSource(this.contas);
      this.dataSourse.paginator = this.paginator;
      this.dataSourse.sort = this.sort      

      if(this.contas.length <= 0){
        this.openSnackBar("Nao existe nenhuma conta a pagar");
      }
    })
  }

  confirmar(conta: Conta){
    const dialogRef = this.dialog.open(ConfirmacaoDialog, {
      width: '600px',
      data:{conta: conta}
    });
    dialogRef.afterClosed().subscribe(result => {  
      //console.log('The dialog was closed');
    });
  }

  openSnackBar(mensagem) {
    this.snackBar.open(mensagem, null,{
      duration: 2000
    })
  }

}



//ConfirmacaoDialog --------------------------------------------------------
@Component({
  selector: 'confirmacao-dialog',
  templateUrl: 'confirmar.component.html',
})
export class ConfirmacaoDialog {

  /*forma_pagamento = "";
  formas_pagamento = [
    {value: 'Cartão de crédito', viewValue: 'Cartão de crédito'},
    {value: 'Numerário', viewValue: 'Numerário'},
  ]*/

  constructor(public dialog: MatDialog,public dialogRef: MatDialogRef<ConfirmacaoDialog>, private router: Router,
  @Inject(MAT_DIALOG_DATA) public data: any, public authService:AuthService, 
   public snackBar: MatSnackBar, //private _formBuilder: FormBuilder,
    public pacienteService: PacienteService) {
  }

  confirmar(conta: Conta){
    var updatedUserData = {};
    conta.categoria = "Recebida";
    conta.data_recebimento = new Date();

    //Eliminado conta na lista de pendentes
    updatedUserData['contas/'+this.authService.get_clinica_id + '/'+conta.ano +'/receber/'+conta.id] = null;
    updatedUserData['contas/'+this.authService.get_clinica_id + '/'+conta.ano +'/recebidas/'+conta.id] = conta;
    let d = Object.assign({}, updatedUserData);

    this.pacienteService.multiSave(d) 
      .then(r =>{
        this.dialogRef.close();
        this.openSnackBar("Conta recebida com sucesso.");
      }, err =>{
        this.openSnackBar("Ocorreu um erro ao atualizar. Tente novamente ou contacte a equipe de suporte.");
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
