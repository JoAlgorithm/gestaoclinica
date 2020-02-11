import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatSnackBar, MatDialog, MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
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

  movimentos: MovimentoEstoque[];

  dataSourse: MatTableDataSource<MovimentoEstoque>;
  displayedColumns = ['data_movimento', 'tipo_movimento', 'deposito', 'medicamento', 'quantidade', 'editar'];
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;


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

    //MOVIMENTOS
    this.estoqueService.getMovimentos().snapshotChanges().subscribe(data => {
      this.movimentos = data.map(e => {
        return {
          id: e.payload.key,
          ...e.payload.val(),
        } as MovimentoEstoque;
      })
      this.dataSourse=new MatTableDataSource(this.movimentos);
      this.dataSourse.paginator = this.paginator;
      this.dataSourse.sort = this.sort;
    })
  }

  novoEntrada(tipoMovimento){
    let dialogRef = this.dialog.open(RegistoDialog, {
      width: '1000px',
      data: {tipoMovimento: tipoMovimento, depositos:this.depositos,  medicamentos:this.medicamentos}
    });
    dialogRef.afterClosed().subscribe(result => {
      //console.log("result "+result);
    });
  }

  novoSaida(tipoMovimento){
    let dialogRef = this.dialog.open(SaidaDialog, {
      width: '1000px',
      data: {tipoMovimento: tipoMovimento, depositos:this.depositos,  medicamentos:this.medicamentos}
    });
    dialogRef.afterClosed().subscribe(result => {
      //DEPOSITOS
      this.estoqueService.getDepositos().snapshotChanges().subscribe(data => {
        this.depositos = data.map(e => {
          return {
            id: e.payload.key,
            //medicamentos: e.payload.val()['medicamentos'] as Medicamento[],
            ...e.payload.val(),
          } as Deposito;
        })
      })
    });
  }

}

//SAIDA DIALOG ------------------------------------------------
@Component({
  selector: 'saida-dialog',
  templateUrl: 'saida.component.html',
})
export class SaidaDialog {

  mvtFormGroup: FormGroup;
  mvt: MovimentoEstoque;
  mvts: MovimentoEstoque[] = [];

  dataSourse: MatTableDataSource<MovimentoEstoque>;
  displayedColumns = ['deposito','medicamento', 'qtd', 'remover'];

  depositos:Deposito[];
  deposito: Deposito;

  medicamentos: Medicamento[];
  medicamento: Medicamento;

  //motivoSaida = ['Estorno', 'Ajuste']
  
  medicamentos_aux: Medicamento[];

  constructor(public dialogRef: MatDialogRef<SaidaDialog>, private router: Router,
  @Inject(MAT_DIALOG_DATA) public data: any, public authService:AuthService,
  public estoqueService: EstoqueService,  public snackBar: MatSnackBar, private _formBuilder: FormBuilder)
  {
    this.mvt = new MovimentoEstoque();
    this.medicamento = new Medicamento();
    this.deposito = new Deposito();

    this.mvtFormGroup = this._formBuilder.group({
      deposito: ['', Validators.required],
      medicamento: ['', Validators.required],
      qtd: ['', Validators.required],
      //qtd_disponivel: ['', Validators.required],
    });

    this.depositos = this.data.depositos;

    this.medicamentos_aux = this.data.medicamentos;
  }//Fim do Constructor

  onNoClick(): void {
    this.dialogRef.close();
  }

  filtrartipomedic="";
  filtrarMedicamento(filtrartipomedic) {
    if(filtrartipomedic){
      filtrartipomedic = filtrartipomedic.trim(); // Remove whitespace
      filtrartipomedic = filtrartipomedic.toLowerCase(); // Datasource defaults to lowercase matches
     
    this.data.medicamentos = null;
      this.data.medicamentos = this.medicamentos_aux.filter(item => item.nome_generico.toLocaleLowerCase().indexOf(filtrartipomedic) > -1);     
    }else{
      this.data.medicamentos = this.medicamentos_aux;
    }
  }

  saveMvt(){
    if (typeof this.mvts !== 'undefined' && this.mvts.length > 0) {

      let dia = new Date().getDate();
      let mes = +(new Date().getMonth()) + +1;
      let ano = new Date().getFullYear();
      this.mvt.data_movimento = dia +"/"+mes+"/"+ano;
      this.mvt.movimentador = this.authService.get_perfil + ' - ' + this.authService.get_user_displayName;
      this.mvt.tipo_movimento = this.data.tipoMovimento;

      var updatedUserData = {};
      this.mvts.forEach(mvt => {
        this.dialogRef.close();
        let key = this.estoqueService.db.list('estoquesmovimentos/'+this.authService.get_clinica_id).push('').key;
        
        mvt.medicamento.qtd_solicitada = null;
        //Gravando na tabela de depositos "depositos"
        updatedUserData['/depositos/'+this.authService.get_clinica_id + '/'+mvt.deposito.id+'/medicamentos/'+mvt.medicamento.id] = mvt.medicamento;

        //Gravando na tabela de movimentos "estoquesmovimentos"
        //eliminar redundancia de dados para dar agilidade e perfomance a base de dados
        mvt.deposito_nome = mvt.deposito.nome;
        mvt.deposito = null;
        mvt.medicamento_nome = mvt.medicamento.nome_generico;
        mvt.medicamento = null;
        updatedUserData['/estoquesmovimentos/'+this.authService.get_clinica_id+"/"+key] = mvt;
      });
      
      //CODIGO NOVO PARA GRAVAR SIMULTANEAMENTE TODOS OS DADOS E NAO HAVER INCONSISTENCIA
      let d = Object.assign({}, updatedUserData);
      this.estoqueService.updateEstoque(d) 
      .then(r =>{
        this.openSnackBar("Movimento cadastrado com sucesso");
      }, err =>{
        this.openSnackBar("Ocorreu um erro ao cadastrar. Tente novamente ou contacte a equipe de suporte.");
      })

    }else{
      this.openSnackBar("Adicione pelo menos 1 item na tabela");
    }
  }

  getMedicamentos(deposito: Deposito){
    this.medicamentos = [];
    this.medicamento = new Medicamento();
    //this.max = 1;
    if(deposito.medicamentos){

      Object.keys(deposito.medicamentos).forEach(key=>{
        this.medicamentos.push(deposito.medicamentos[key]);
      })

    }else{
      this.openSnackBar("Deposito sem medicamentos. Contacte o Admnistrativo");
    }
  }

  addMvt(){
    if(this.medicamento.qtd_solicitada){

      let check = true;
      this.mvts.forEach(md => {
        if(md.medicamento.id == this.medicamento.id && md.deposito.id == this.deposito.id){
          check = false;
          return;
        }
      });

      if(check){
        if( Number(this.medicamento.qtd_solicitada) <= Number(this.medicamento.qtd_disponivel)){
          this.mvt.medicamento = this.medicamento;
          this.mvt.deposito = this.deposito;
          this.mvt.quantidade = this.medicamento.qtd_solicitada;  
    
          this.mvt.medicamento.preco_venda_total = this.medicamento.preco_venda*this.medicamento.qtd_solicitada;
          //this.preco_total = +this.preco_total + +(this.medicamento.preco_venda*this.medicamento.qtd_solicitada); 
          //this.texto = "Faturar "+ this.preco_total.toFixed(2).replace(".",",") +" MZN";
          this.medicamento.qtd_disponivel = +this.medicamento.qtd_disponivel - +this.medicamento.qtd_solicitada;

          this.mvts.push(this.mvt);
          //this.movimentos_aux = this.mvts;
          this.dataSourse=new MatTableDataSource(this.mvts);
    
          this.medicamento = new Medicamento();
          this.mvt = new MovimentoEstoque();
          //this.max = 1;
        }else{
          this.openSnackBar("Qtd a retirar nao pode ser superior a quantidade disponivel");
        }
      }else{
        this.openSnackBar("Medicamento ja adicionado a lista");
      }
    }else{
      this.openSnackBar("Selecione um medicamento");
    }
  }

  

  removeMedicamento(mv: MovimentoEstoque){
    mv.medicamento.qtd_disponivel = +mv.medicamento.qtd_disponivel + +mv.medicamento.qtd_solicitada;
    this.mvts.splice(this.mvts.indexOf(mv), 1);
    this.dataSourse=new MatTableDataSource(this.mvts);
  }

  openSnackBar(mensagem) {
    this.snackBar.open(mensagem, null,{
      duration: 3000
    })
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

  medicamentos_aux: Medicamento[];

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

    this.medicamentos_aux = this.data.medicamentos;
  }//Fim do Constructor

  onNoClick(): void {
    this.dialogRef.close();
  }

  filtrartipomedic="";
  filtrarMedicamento(filtrartipomedic) {
    if(filtrartipomedic){
      filtrartipomedic = filtrartipomedic.trim(); // Remove whitespace
      filtrartipomedic = filtrartipomedic.toLowerCase(); // Datasource defaults to lowercase matches
     
    this.data.medicamentos = null;
      this.data.medicamentos = this.medicamentos_aux.filter(item => item.nome_generico.toLocaleLowerCase().indexOf(filtrartipomedic) > -1);     
    }else{
      this.data.medicamentos = this.medicamentos_aux;
    }
  }
  
  addMvt(){
    if(this.mvt.deposito != undefined && this.mvt.medicamento != undefined && this.mvt.quantidade != undefined ){
      
      let dia = new Date().getDate();
      let mes = +(new Date().getMonth()) + +1;
      let ano = new Date().getFullYear();
      this.mvt.data_movimento = dia +"/"+mes+"/"+ano;
      this.mvt.movimentador = this.authService.get_perfil + ' - ' + this.authService.get_user_displayName;
      this.mvt.tipo_movimento = this.data.tipoMovimento;

      let update_qtd = false;
      //Antes de adicionar calcular a quantidade disponivel se essa adicao for efetuada
      if(this.mvt.deposito.medicamentos){
        //console.log("entrou 1");
        Object.keys(this.mvt.deposito.medicamentos).forEach(key=>{
          if(this.mvt.medicamento.id == key){
            if(this.mvt.deposito.medicamentos[key].qtd_disponivel){
              this.mvt.medicamento.qtd_disponivel = +this.mvt.deposito.medicamentos[key].qtd_disponivel + +this.mvt.quantidade;
              update_qtd = true;
            }else{
              update_qtd = true;
              this.mvt.medicamento.qtd_disponivel = this.mvt.quantidade;
            }
            //console.log("qtd disponivel INICIAL: "+this.mvt.medicamento.qtd_disponivel);
          }
        })
      }else{
       // console.log("entrou 2");
        update_qtd = true;
        this.mvt.medicamento.qtd_disponivel = this.mvt.quantidade;
        //console.log("qtd disponivel INICIAL2: "+this.mvt.medicamento.qtd_disponivel);
      }
      
      //console.log("qtd disponivel: "+this.mvt.medicamento.qtd_disponivel);
      if(!update_qtd){
        this.mvt.medicamento.qtd_disponivel = this.mvt.quantidade;
        //console.log("atulizado no final");
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

      var updatedUserData = {};
      this.mvts.forEach(mvt => {
        this.dialogRef.close();
        let key = this.estoqueService.db.list('estoquesmovimentos/'+this.authService.get_clinica_id).push('').key;
        
        //Gravando na tabela de depositos "depositos"
        updatedUserData['/depositos/'+this.authService.get_clinica_id + '/'+mvt.deposito.id+'/medicamentos/'+mvt.medicamento.id] = mvt.medicamento;

        //Gravando na tabela de movimentos "estoquesmovimentos"
        //eliminar redundancia de dados para dar agilidade e perfomance a base de dados
        mvt.deposito_nome = mvt.deposito.nome;
        mvt.deposito = null;
        mvt.medicamento_nome = mvt.medicamento.nome_comercial;
        mvt.medicamento = null;
        updatedUserData['/estoquesmovimentos/'+this.authService.get_clinica_id+"/"+key] = mvt;
      });
      
      //CODIGO NOVO PARA GRAVAR SIMULTANEAMENTE TODOS OS DADOS E NAO HAVER INCONSISTENCIA
      let d = Object.assign({}, updatedUserData);
      this.estoqueService.updateEstoque(d) 
      .then(r =>{
        this.openSnackBar("Movimento cadastrado com sucesso");
      }, err =>{
        this.openSnackBar("Ocorreu um erro ao cadastrar. Tente novamente ou contacte a equipe de suporte.");
      })

      //Percorrer cada linha do array de movimentos
      //CODIGO ANTIGO QUE FUNCIONA BEM
      /*this.mvts.forEach(mvt => {
        console.log("Qtd disponivel "+mvt.medicamento.qtd_disponivel);
        
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
*/
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
      duration: 3000
    })
  }

}