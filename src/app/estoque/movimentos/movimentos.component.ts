import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatSnackBar, MatDialog, MatTableDataSource } from '@angular/material';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { EstoqueService } from '../../services/estoque.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Deposito } from '../../classes/deposito';
import { Medicamento } from '../../classes/medicamento';
import { MovimentoEstoque } from '../../classes/movimento_estoque';

@Component({
  selector: 'app-movimentos',
  templateUrl: './movimentos.component.html',
  styleUrls: ['./movimentos.component.scss']
})
export class MovimentosComponent implements OnInit {

  depositos: Deposito[];
  medicamentos: Medicamento[];

  constructor(public dialog: MatDialog, public estoqueService: EstoqueService) { }

  ngOnInit() {
    //DEPOSITOS
    this.estoqueService.getDepositos().snapshotChanges().subscribe(data => {
      this.depositos = data.map(e => {
        return {
          id: e.payload.key,
          //medicamentos: e.payload.val()['medicamentos'] as Medicamento[],
          ...e.payload.val(),
        } as Deposito;
      })
      /*this.depositos.forEach(element => {
        if (element.medicamentos) {
          Object.keys(element.medicamentos).forEach(key=>{
            console.log("key ", key , " value : ", element.medicamentos[key].nome_generico)
          })
        }else{
          console.log("Sem medicamentos")
        }
      });*/
    })

    //MEDICAMENTOS
    this.estoqueService.getMedicamentos().snapshotChanges().subscribe(data => {
      this.medicamentos = data.map(e => {
        return {
          id: e.payload.key,
          ...e.payload.val(),
        } as Medicamento;
      })
    })
  }

  novoMovimento(tipoMovimento){
    let dialogRef = this.dialog.open(RegistoDialog, {
      width: '800px',
      data: {tipoMovimento: tipoMovimento, depositos:this.depositos,  medicamentos:this.medicamentos}
    });
    dialogRef.afterClosed().subscribe(result => {
    console.log("result "+result);
    });
  }

}


//REGISTO DIALOG --------------------------------------------------------
@Component({
  selector: 'registo-dialog',
  templateUrl: 'registo.component.html',
})
export class RegistoDialog {
  
  mvtFormGroup: FormGroup;
  mvt: MovimentoEstoque;
  mvts: MovimentoEstoque[] = [];

  dataSourse: MatTableDataSource<MovimentoEstoque>;
  displayedColumns = ['deposito','medicamento', 'qtd', 'remover'];

  depositos:Deposito[];

  constructor(public dialogRef: MatDialogRef<RegistoDialog>, private router: Router,
  @Inject(MAT_DIALOG_DATA) public data: any, public authService:AuthService,
  public estoqueService: EstoqueService,  public snackBar: MatSnackBar, private _formBuilder: FormBuilder)
  {
    this.mvt = new MovimentoEstoque();

    this.mvtFormGroup = this._formBuilder.group({
      deposito: ['', Validators.required],
      medicamento: ['', Validators.required],
      qtd: ['', Validators.required],
    });

    this.depositos = this.data.depositos;

  }//Fim do Constructor

  addMvt(){
    if(this.mvt.deposito != undefined && this.mvt.medicamento != undefined && this.mvt.quantidade != undefined ){
      
      //Antes de adicionar calcular a quantidade disponivel se essa adicao for efetuada
      if(this.mvt.deposito.medicamentos){
        Object.keys(this.mvt.deposito.medicamentos).forEach(key=>{
          if(this.mvt.medicamento.id == key){
            this.mvt.medicamento.qtd_disponivel = +this.mvt.deposito.medicamentos[key].qtd_disponivel + +this.mvt.quantidade;
          }
        })
      }else{
        this.mvt.medicamento.qtd_disponivel = this.mvt.quantidade;
      }
      
      this.mvts.push(this.mvt);
  
      this.dataSourse=new MatTableDataSource(this.mvts);
      this.mvt = new MovimentoEstoque();
    }else{
      this.openSnackBar("Preencha todos os campos obrigatorios");
    }
  }

  removeMvt(mvt:MovimentoEstoque){
    this.mvts.splice(this.mvts.indexOf(mvt), 1);
    this.dataSourse=new MatTableDataSource(this.mvts);
  }

  /**
   * Ao Salvar um movimento na base de dados precisamos:
   * 1. Salvar esse movimento no item para poder ver movimentos por item
   * 2. Salvar esse movimento do item no deposito para vermos posicao de estoque por deposito
   *    Para esse ponto precisamos verificar se o item ja foi adicionado ao deposito para acrescentar a
   *    quantidade em estoque ou retirar dependendo do tipo de movimento
   * 3. Salvar esse movimento na tabela de movimentos para listarmos todos movimentos que ocorreram
  */
  saveMvt(){
    if (typeof this.mvts !== 'undefined' && this.mvts.length > 0) {
      //data_movimento?: string;
      //movimentador?: string;
      //let d = Object.assign({}, this.consulta); 

      //Percorrer cada linha do array de movimentos
      this.mvts.forEach(mvt => {
        let d = Object.assign({}, mvt); 

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
      this.dialogRef.close();
      this.openSnackBar("Movimento cadastrado com sucesso");

    }else{
      this.openSnackBar("Adicione pelo menos 1 item na tabela");
    }
  }

  //Retornar quantidade do item no deposito
    verificarItemDep(medicamento: Medicamento, deposito: Deposito) : number{
    if(medicamento != undefined && deposito != undefined  ){
      //if(typeof deposito.medicamentos !== 'undefined' && deposito.medicamentos.length > 0){
      if(deposito.medicamentos){
        Object.keys(deposito.medicamentos).forEach(key=>{
          if(medicamento.id == key){
            console.log("encontrado "+deposito.medicamentos[key].qtd_disponivel)
            return deposito.medicamentos[key].qtd_disponivel;
          }
        })

        console.log("nao encontrado");
        return 0;
      }else{
        console.log("erro1");
        return 0;
      }
    }else{
      console.log("erro2");
      return 0;
    }

  }

  

  openSnackBar(mensagem) {
    this.snackBar.open(mensagem, null,{
      duration: 2000
    })
  }

}