import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatSnackBar, MatDialog, MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { EstoqueService } from '../../services/estoque.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Deposito } from '../../classes/deposito';
import { Medicamento } from '../../classes/medicamento';
import { MovimentoEstoque } from '../../classes/movimento_estoque';
import { CategoriaMedicamento } from '../../classes/categoria_medicamento';
import { TipoEstoque } from '../../classes/tipo_estoque';

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

  //ano:string = (new Date()).getFullYear()+"";
  //meses = ['Janeiro', 'Fevereiro', 'Marco', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  //mes = this.meses[+(new Date().getMonth())];
  //valor_entrada = 0;
  //valor_acumulado = 0;
  
  cats_medicamento: CategoriaMedicamento[];
  tipos_estoque: TipoEstoque[];

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
          data_movimento: e.payload.val()['data_movimento'],
          tipo_movimento: e.payload.val()['tipo_movimento'],
          deposito_nome: e.payload.val()['deposito_nome'],
          medicamento_nome: e.payload.val()['medicamento_nome'],
          quantidade: e.payload.val()['quantidade'],
          
          //...e.payload.val(),
        } as MovimentoEstoque;
      })
      this.dataSourse=new MatTableDataSource(this.movimentos);
      this.dataSourse.paginator = this.paginator;
      this.dataSourse.sort = this.sort;
    })

    //TIPOS ESTOQUES
    this.estoqueService.getTiposEstoque().snapshotChanges().subscribe(data => {
      this.tipos_estoque = data.map(e => {
        return {
          id: e.payload.key,
          ...e.payload.val(),
        } as TipoEstoque;
      });
    })

    //CATEGORIA DE MEDICAMENTOS
    this.estoqueService.getCategoriasMedicamento().snapshotChanges().subscribe(data => {
      this.cats_medicamento = data.map(e => {
        return {
          id: e.payload.key,
          ...e.payload.val(),
        } as CategoriaMedicamento;
      });
    })

  }

  novoEntrada(tipoMovimento){
    let dialogRef = this.dialog.open(RegistoDialog, {
      width: '1000px',
      data: {tipoMovimento: tipoMovimento, depositos:this.depositos,  medicamentos:this.medicamentos, categorias: this.cats_medicamento, tipos_estoque: this.tipos_estoque}
    });
    dialogRef.afterClosed().subscribe(result => {
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

  novoSaida(tipoMovimento){
    let dialogRef = this.dialog.open(SaidaDialog, {
      width: '1000px',
      data: {tipoMovimento: tipoMovimento, depositos:this.depositos,  medicamentos:this.medicamentos, categorias: this.cats_medicamento, tipos_estoque: this.tipos_estoque}
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

  novoTransferencia(tipoMovimento){
    let dialogRef = this.dialog.open(TransferenciaDialog, {
      width: '1000px',
      data: {tipoMovimento: tipoMovimento, depositos:this.depositos,  medicamentos:this.medicamentos, categorias: this.cats_medicamento, tipos_estoque: this.tipos_estoque}
    });
    dialogRef.afterClosed().subscribe(result => {
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
  

  ano:string = (new Date()).getFullYear()+"";
  meses = ['Janeiro', 'Fevereiro', 'Marco', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  mes = this.meses[+(new Date().getMonth())];
  valor_entrada = 0;
  valor_acumulado = 0;

  cats_medicamento_aux: CategoriaMedicamento[];
  categoria: CategoriaMedicamento;
  tipo_estoque:TipoEstoque;
  tipos_estoque_aux: TipoEstoque[];

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

    this.cats_medicamento_aux = this.data.categorias;
    this.tipos_estoque_aux = this.data.tipos_estoque;

    
  }//Fim do Constructor

  onNoClick(): void {
    this.dialogRef.close();
  }

  desabilitar_fm = true;
  mudarCategoria(){
    this.medicamento = new Medicamento();
    this.categoria = new CategoriaMedicamento();
    let n = this.tipo_estoque.nome;
    if(n == "Medicamento"){
      this.desabilitar_fm = false;
    }else{
      this.desabilitar_fm = true;
    }

    //this.medicamentos = null;
    this.medicamentos = this.medicamentos_aux.filter(item => item.tipo.nome.indexOf(n+"") > -1);     
  }

  mudarFormaFarmaceutica(){
    this.medicamento = new Medicamento();
    let n = this.categoria.nome;

    this.medicamentos = this.medicamentos_aux.filter(item => {  
      let i = item.categoria ? item.categoria.nome : "";
      if(i == n){
        return item.categoria.nome.indexOf(n+"") > -1
      }        
    }); 
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

      
      this.mvt.movimentador = this.authService.get_perfil + ' - ' + this.authService.get_user_displayName;
      this.mvt.tipo_movimento = this.data.tipoMovimento;

      var updatedUserData = {};
      this.mvts.forEach(mvt => {
        this.dialogRef.close();
        let key = this.estoqueService.db.list('estoquesmovimentos/'+this.authService.get_clinica_id).push('').key;

        let valor_tota_entrada = mvt.medicamento.valor_tota_entrada ? mvt.medicamento.valor_tota_entrada : 0;
        let valor_medio_entrada = mvt.medicamento.valor_medio_entrada ? mvt.medicamento.valor_medio_entrada : 0;
        
        mvt.deposito.valor_total = mvt.deposito.valor_total ? mvt.deposito.valor_total : 0;

        if(mvt.deposito.valor_total > 0)
          mvt.deposito.valor_total = +mvt.deposito.valor_total - (+valor_medio_entrada * mvt.medicamento.qtd_solicitada);
        
        //Quem ja usava sistema antes dessa funcionalidade de valor de estoque pode estar com itens com estoque sem valor
        // entao ao fazer saida pode gerar inconsistencia, assim sendo o valor de nao deve nunca ficar negativo
        // em teoria isso nunca vai acontecer, foi colocado por contigencia
        if(mvt.deposito.valor_total < 0)
          mvt.deposito.valor_total = 0;

        //Gravando valor de estoque de depositos
        updatedUserData['/depositos/'+this.authService.get_clinica_id + '/'+mvt.deposito.id+'/valor_total'] = mvt.deposito.valor_total;
        //Gravando valor de estoque de depositos relatorio
        updatedUserData['/depositos_relatorio/'+this.authService.get_clinica_id + '/'+mvt.deposito.id+'/'+ this.ano+'/'+ this.mes+'/valor_acumulado'] = mvt.deposito.valor_total;

        let vl = +(+valor_medio_entrada * +mvt.medicamento.qtd_solicitada).toFixed(2);
        this.estoqueService.db.object('/depositos_relatorio/'+this.authService.get_clinica_id + '/'+mvt.deposito.id+'/'+ this.ano+'/'+ this.mes+'/valor_saida').query
        .ref.transaction(valor_saida => {
          if(valor_saida === null){
            console.log("entrou no null");
            valor_saida = vl;
            return valor_saida;
          }else{
            console.log("entrou no somatorio");
            valor_saida = +valor_saida + +vl;
            return valor_saida;
          }
        })



        mvt.medicamento.qtd_solicitada = null;

        
        if(mvt.medicamento.qtd_disponivel == 0){
          console.log("Valor de estoque unitario e toal vai alterar para zero");
          mvt.medicamento.valor_medio_entrada = 0;
          mvt.medicamento.valor_tota_entrada = 0;
        }else{
          console.log("Valor de estoque total vai alterar de "+valor_tota_entrada+" para "+valor_medio_entrada*(mvt.medicamento.qtd_disponivel - mvt.medicamento.qtd_solicitada))
          mvt.medicamento.valor_tota_entrada = +valor_medio_entrada * +mvt.medicamento.qtd_disponivel;
        }

       

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
    this.categoria = new CategoriaMedicamento();
    this.tipo_estoque = new TipoEstoque();
    this.medicamentos = [];
    this.medicamento = new Medicamento();
    //this.max = 1;
    if(deposito.medicamentos){

      Object.keys(deposito.medicamentos).forEach(key=>{
        this.medicamentos.push(deposito.medicamentos[key]);
        //this.medicamentos_aux.push(deposito.medicamentos[key]);
      })
      this.medicamentos_aux = this.medicamentos;

    }else{
      this.openSnackBar("Deposito sem medicamentos. Contacte o Admnistrativo");
    }
  }

  getMedicamento(medicamento: Medicamento){
    Object.keys(this.medicamentos).forEach(key=>{
      if(this.medicamentos[key] == medicamento.id){
        this.medicamento = this.medicamentos[key];
      }
    })
  }

  addMvt(){
    if(this.medicamento.qtd_solicitada){

      let dia = new Date().getDate();
      let mes = +(new Date().getMonth()) + +1;
      let ano = new Date().getFullYear();
      this.mvt.data_movimento = dia +"/"+mes+"/"+ano;
      this.mvt.movimentador = this.authService.get_perfil + ' - ' + this.authService.get_user_displayName;
      this.mvt.tipo_movimento = this.data.tipoMovimento;
      this.mvt.deposito_id = this.deposito.id;

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


          let valor_tota_entrada = this.medicamento.valor_tota_entrada ? this.medicamento.valor_tota_entrada : 0;
          let valor_medio_entrada = this.medicamento.valor_medio_entrada ? this.medicamento.valor_medio_entrada : 0;
          if(this.medicamento.qtd_disponivel - this.medicamento.qtd_solicitada == 0){
            console.log("Valor de estoque unitario e toal vai alterar para zero");
          }else{
            console.log("Valor de estoque total vai alterar de "+valor_tota_entrada+" para "+ +this.medicamento.qtd_disponivel * valor_medio_entrada);
          }

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

 
  ano:string = (new Date()).getFullYear()+"";
  meses = ['Janeiro', 'Fevereiro', 'Marco', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  mes = this.meses[+(new Date().getMonth())];
  valor_entrada = 0;
  valor_acumulado = 0;

  cats_medicamento_aux: CategoriaMedicamento[];
  categoria: CategoriaMedicamento;
  tipo_estoque:TipoEstoque;
  tipos_estoque_aux: TipoEstoque[];

  constructor(public dialogRef: MatDialogRef<RegistoDialog>, private router: Router,
  @Inject(MAT_DIALOG_DATA) public data: any, public authService:AuthService,
  public estoqueService: EstoqueService,  public snackBar: MatSnackBar, private _formBuilder: FormBuilder)
  {
    this.mvt = new MovimentoEstoque();

    this.categoria = new CategoriaMedicamento();
    this.tipo_estoque = new TipoEstoque();

    this.mvtFormGroup = this._formBuilder.group({
      deposito: ['', Validators.required],
      medicamento: ['', Validators.required],
      qtd: ['', Validators.required],
    });

    this.depositos = this.data.depositos;

    this.medicamentos_aux = this.data.medicamentos;

    this.cats_medicamento_aux = this.data.categorias;
    this.tipos_estoque_aux = this.data.tipos_estoque;
  }//Fim do Constructor

  onNoClick(): void {
    this.dialogRef.close();
  }

  desabilitar_fm = true;
  mudarCategoria(){
    this.mvt.medicamento = new Medicamento();
    this.categoria = new CategoriaMedicamento();
    let n = this.tipo_estoque.nome;
    if(n == "Medicamento"){
      this.desabilitar_fm = false;
    }else{
      this.desabilitar_fm = true;
    }

    this.data.medicamentos = null;
    this.data.medicamentos = this.medicamentos_aux.filter(item => item.tipo.nome.indexOf(n+"") > -1);     
  }

  mudarFormaFarmaceutica(){
    let n = this.categoria.nome;

    this.data.medicamentos = this.medicamentos_aux.filter(item => {  
      let i = item.categoria ? item.categoria.nome : "";
      if(i == n){
        return item.categoria.nome.indexOf(n+"") > -1
      }        
    }); 
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
  // faturacao.ano = new Date().getFullYear();
  // faturacao.mes = this.getMes(+new Date().getMonth()+ +1);

  addMvt(){
    if(this.mvt.deposito != undefined && this.mvt.medicamento != undefined && this.mvt.quantidade != undefined && this.mvt.valor_unitario != undefined){
      
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
              
              //console.log("ENTROU AQUI ");
              //console.log("this.mvt.deposito.medicamentos[key].qtd_disponivel "+this.mvt.deposito.medicamentos[key].qtd_disponivel);
              let qtd_disponivel = this.mvt.deposito.medicamentos[key].qtd_disponivel ? this.mvt.deposito.medicamentos[key].qtd_disponivel : 0;
              //console.log("qtd_disponivel "+qtd_disponivel);
              //console.log("this.mvt.deposito.medicamentos[key].qtd_disponivel "+this.mvt.deposito.medicamentos[key].qtd_disponivel);
              
              if(qtd_disponivel > 0){
                console.log("Secao 1");

                let valor_medio_anterior = +this.mvt.deposito.medicamentos[key].valor_medio_entrada ? +this.mvt.deposito.medicamentos[key].valor_medio_entrada : 0;
                //console.log("valor_medio_anterior" +valor_medio_anterior);
                let valor_anterior = +this.mvt.deposito.medicamentos[key].qtd_disponivel * +valor_medio_anterior;
                let valor_novo = +this.mvt.quantidade * +this.mvt.valor_unitario;
                this.mvt.medicamento.valor_medio_entrada = +((+valor_novo + +valor_anterior)/(+this.mvt.deposito.medicamentos[key].qtd_disponivel + +this.mvt.quantidade)).toFixed(2);
                this.mvt.medicamento.valor_tota_entrada = +(+this.mvt.medicamento.valor_medio_entrada * (+this.mvt.deposito.medicamentos[key].qtd_disponivel + +this.mvt.quantidade)).toFixed(2);
                console.log("Valor de unitario: "+this.mvt.medicamento.valor_medio_entrada);
                console.log("Valor total: "+this.mvt.medicamento.valor_tota_entrada);

                this.mvt.deposito.valor_total = this.mvt.deposito.valor_total ? this.mvt.deposito.valor_total : 0;
                this.mvt.deposito.valor_total = +this.mvt.deposito.valor_total + +(+this.mvt.quantidade * +this.mvt.valor_unitario);
                console.log("Valor total deposito "+this.mvt.deposito.valor_total);
                
              }else{
                console.log("Secao 2");
                this.mvt.medicamento.valor_medio_entrada = +this.mvt.valor_unitario;
                this.mvt.medicamento.valor_tota_entrada = +this.mvt.quantidade * +this.mvt.valor_unitario;
                console.log("Valor de unitario: "+this.mvt.medicamento.valor_medio_entrada);
                console.log("Valor total: "+this.mvt.medicamento.valor_tota_entrada);

                this.mvt.deposito.valor_total = this.mvt.deposito.valor_total ? this.mvt.deposito.valor_total : 0;
                this.mvt.deposito.valor_total = +this.mvt.deposito.valor_total + +(+this.mvt.quantidade * +this.mvt.valor_unitario);
                console.log("Valor total deposito "+this.mvt.deposito.valor_total);
              }
              
              update_qtd = true;
            }else{
              update_qtd = true;
              this.mvt.medicamento.qtd_disponivel = this.mvt.quantidade;

              this.mvt.medicamento.valor_medio_entrada = +this.mvt.valor_unitario;
              this.mvt.medicamento.valor_tota_entrada = +this.mvt.quantidade * +this.mvt.valor_unitario;
              console.log("Valor de unitario: "+this.mvt.medicamento.valor_medio_entrada);
              console.log("Valor total: "+this.mvt.medicamento.valor_tota_entrada);

              this.mvt.deposito.valor_total = this.mvt.deposito.valor_total ? this.mvt.deposito.valor_total : 0;
              this.mvt.deposito.valor_total = +this.mvt.deposito.valor_total + +(+this.mvt.quantidade * +this.mvt.valor_unitario);
              console.log("Valor total deposito "+this.mvt.deposito.valor_total);
            }
            //console.log("qtd disponivel INICIAL: "+this.mvt.medicamento.qtd_disponivel);
          }
        })
      }else{
        update_qtd = true;
        this.mvt.medicamento.qtd_disponivel = this.mvt.quantidade;

        console.log("Secao 3");
        this.mvt.medicamento.valor_medio_entrada = +this.mvt.valor_unitario;
        this.mvt.medicamento.valor_tota_entrada = +this.mvt.quantidade * +this.mvt.valor_unitario;
        console.log("Valor de unitario: "+this.mvt.medicamento.valor_medio_entrada);
        console.log("Valor total: "+this.mvt.medicamento.valor_tota_entrada);
       
        this.mvt.deposito.valor_total = this.mvt.deposito.valor_total ? this.mvt.deposito.valor_total : 0;
        this.mvt.deposito.valor_total = +this.mvt.deposito.valor_total + +(+this.mvt.quantidade * +this.mvt.valor_unitario);
        console.log("Valor total deposito "+this.mvt.deposito.valor_total);
        //console.log("qtd disponivel INICIAL2: "+this.mvt.medicamento.qtd_disponivel);
      }
      
      //console.log("qtd disponivel: "+this.mvt.medicamento.qtd_disponivel);
      if(!update_qtd){
        this.mvt.medicamento.qtd_disponivel = this.mvt.quantidade;
        //console.log("atulizado no final");
        console.log("Secao 4");
        this.mvt.medicamento.valor_medio_entrada = +this.mvt.valor_unitario;
        this.mvt.medicamento.valor_tota_entrada = +this.mvt.quantidade * +this.mvt.valor_unitario;
        console.log("Valor de unitario: "+this.mvt.medicamento.valor_medio_entrada);
        console.log("Valor total: "+this.mvt.medicamento.valor_tota_entrada);

        this.mvt.deposito.valor_total = this.mvt.deposito.valor_total ? this.mvt.deposito.valor_total : 0;
        this.mvt.deposito.valor_total = +this.mvt.deposito.valor_total + +(+this.mvt.quantidade * +this.mvt.valor_unitario);
        console.log("Valor total deposito "+this.mvt.deposito.valor_total);
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

      let valor_entrada_total = 0;

      var updatedUserData = {};
      this.mvts.forEach(mvt => {
        this.dialogRef.close();
        let key = this.estoqueService.db.list('estoquesmovimentos/'+this.authService.get_clinica_id).push('').key;
        
        //Gravando na tabela de depositos "depositos"
        updatedUserData['/depositos/'+this.authService.get_clinica_id + '/'+mvt.deposito.id+'/medicamentos/'+mvt.medicamento.id] = mvt.medicamento;


        //Gravando valor de estoque de depositos
        updatedUserData['/depositos/'+this.authService.get_clinica_id + '/'+mvt.deposito.id+'/valor_total'] = mvt.deposito.valor_total;

        
        //Gravando valor de estoque de depositos relatorio
        updatedUserData['/depositos_relatorio/'+this.authService.get_clinica_id + '/'+mvt.deposito.id+'/'+ this.ano+'/'+ this.mes+'/valor_acumulado'] = mvt.deposito.valor_total;

        this.estoqueService.db.object('/depositos_relatorio/'+this.authService.get_clinica_id + '/'+mvt.deposito.id+'/'+ this.ano+'/'+ this.mes+'/valor_entrada').query
        .ref.transaction(valor_entrada => {
          if(valor_entrada === null){
            console.log("entrou no null");
            valor_entrada = +(+mvt.quantidade * +mvt.valor_unitario).toFixed(2);
            return valor_entrada;
          }else{
            console.log("entrou no somatorio");
            valor_entrada = +(+valor_entrada + +(+mvt.quantidade * +mvt.valor_unitario)).toFixed(2);
            return valor_entrada;
          }
        })
      

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


//TRANSFERENCIA DIALOG --------------------------------------------------------
@Component({
  selector: 'transferencia-dialog',
  templateUrl: 'transferencia.component.html',
})
export class TransferenciaDialog {

  mvt: MovimentoEstoque;
  mvts: MovimentoEstoque[] = [];

  dataSourse: MatTableDataSource<MovimentoEstoque>;
  displayedColumns = ['deposito','medicamento', 'qtd', 'destino', 'remover'];

  depositos:Deposito[];
  deposito: Deposito;
  deposito_destino: Deposito;

  medicamentos: Medicamento[];
  medicamentos_aux: Medicamento[];
  medicamento: Medicamento;
  
  ano:string = (new Date()).getFullYear()+"";
  meses = ['Janeiro', 'Fevereiro', 'Marco', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  mes = this.meses[+(new Date().getMonth())];
  valor_entrada = 0;
  valor_acumulado = 0;

  cats_medicamento_aux: CategoriaMedicamento[];
  categoria: CategoriaMedicamento;
  tipo_estoque:TipoEstoque;
  tipos_estoque_aux: TipoEstoque[];
  
  constructor(public dialogRef: MatDialogRef<TransferenciaDialog>, private router: Router, @Inject(MAT_DIALOG_DATA) public data: any,
  public authService:AuthService,  public estoqueService: EstoqueService,  public snackBar: MatSnackBar, private _formBuilder: FormBuilder){
    this.mvt = new MovimentoEstoque();
    this.medicamento = new Medicamento();
    this.deposito = new Deposito();
    this.deposito_destino = new Deposito();

    this.depositos = this.data.depositos;
    this.medicamentos_aux = this.data.medicamentos;
    this.cats_medicamento_aux = this.data.categorias;
    this.tipos_estoque_aux = this.data.tipos_estoque;
  }

  onNoClick(): void {this.dialogRef.close();}

  desabilitar_fm = true;
  mudarCategoria(){
    this.medicamento = new Medicamento();
    this.categoria = new CategoriaMedicamento();
    let n = this.tipo_estoque.nome;
    if(n == "Medicamento"){
      this.desabilitar_fm = false;
    }else{
      this.desabilitar_fm = true;
    }

    //this.medicamentos = null;
    this.medicamentos = this.medicamentos_aux.filter(item => item.tipo.nome.indexOf(n+"") > -1);     
  }

  mudarFormaFarmaceutica(){
    this.medicamento = new Medicamento();
    let n = this.categoria.nome;

    this.medicamentos = this.medicamentos_aux.filter(item => {  
      let i = item.categoria ? item.categoria.nome : "";
      if(i == n){
        return item.categoria.nome.indexOf(n+"") > -1
      }        
    }); 
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

  getMedicamentos(deposito: Deposito){
    this.categoria = new CategoriaMedicamento();
    this.tipo_estoque = new TipoEstoque();
    this.medicamentos = [];
    this.medicamento = new Medicamento();
    
    if(deposito.medicamentos){
      Object.keys(deposito.medicamentos).forEach(key=>{
        this.medicamentos.push(deposito.medicamentos[key]);
      })
      this.medicamentos_aux = this.medicamentos;
    }else{
      this.openSnackBar("Deposito sem medicamentos. Contacte o Admnistrativo");
    }
  }

  getMedicamento(medicamento: Medicamento){
    Object.keys(this.medicamentos).forEach(key=>{
      if(this.medicamentos[key] == medicamento.id){
        this.medicamento = this.medicamentos[key];
      }
    })
  }

  addMvt(){
    if(this.medicamento.qtd_solicitada){

      if(this.deposito_destino.nome == this.deposito.nome){
        this.openSnackBar("Nao pode transferir para o mesmo deposito");
      }else{
        let dia = new Date().getDate();
        let mes = +(new Date().getMonth()) + +1;
        let ano = new Date().getFullYear();
        this.mvt.data_movimento = dia +"/"+mes+"/"+ano;
        this.mvt.movimentador = this.authService.get_perfil + ' - ' + this.authService.get_user_displayName;
        this.mvt.tipo_movimento = this.data.tipoMovimento;
        this.mvt.deposito_id = this.deposito.id;
        this.mvt.deposito_destino = this.deposito_destino;
  
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
  
  
            let valor_tota_entrada = this.medicamento.valor_tota_entrada ? this.medicamento.valor_tota_entrada : 0;
            let valor_medio_entrada = this.medicamento.valor_medio_entrada ? this.medicamento.valor_medio_entrada : 0;
            if(this.medicamento.qtd_disponivel - this.medicamento.qtd_solicitada == 0){
              console.log("Valor de estoque unitario e toal vai alterar para zero");
            }else{
              console.log("Valor de estoque total vai alterar de "+valor_tota_entrada+" para "+ +this.medicamento.qtd_disponivel * valor_medio_entrada);
            }
  
            this.mvts.push(this.mvt);
            //this.movimentos_aux = this.mvts;
            this.dataSourse=new MatTableDataSource(this.mvts);
      
            this.medicamento = new Medicamento();
            this.mvt = new MovimentoEstoque();
            this.deposito_destino = new Deposito();
            //this.max = 1;
          }else{
            this.openSnackBar("Qtd a retirar nao pode ser superior a quantidade disponivel");
          }
        }else{
          this.openSnackBar("Medicamento ja adicionado a lista");
        }
      }
    }else{
      this.openSnackBar("Selecione um medicamento");
    }
  }

  removeMedicamento(mv: MovimentoEstoque){
    mv.medicamento.qtd_disponivel = +mv.medicamento.qtd_disponivel + +mv.medicamento.qtd_solicitada;
    this.mvts.splice(this.mvts.indexOf(mv), 1);
    this.dataSourse=new MatTableDataSource(this.mvts);
    this.medicamento = new Medicamento();
    this.mvt = new MovimentoEstoque();
    this.deposito_destino = new Deposito();
  }

  updatedUserData = {};
  saveMvt(){
    if (typeof this.mvts !== 'undefined' && this.mvts.length > 0) {
      
      this.mvt.movimentador = this.authService.get_perfil + ' - ' + this.authService.get_user_displayName;
      this.mvt.tipo_movimento = "Saida por transferencia";

      this.dialogRef.close();
      this.mvts.forEach(mvt => {
        let key = this.estoqueService.db.list('estoquesmovimentos/'+this.authService.get_clinica_id).push('').key;

        let valor_tota_entrada = mvt.medicamento.valor_tota_entrada ? mvt.medicamento.valor_tota_entrada : 0;
        let valor_medio_entrada = mvt.medicamento.valor_medio_entrada ? mvt.medicamento.valor_medio_entrada : 0;

        //console.log("MEDICAMENTO ANTES DE ENTRAR")
        //console.log(mvt.medicamento.qtd_disponivel);
       // console.log("")
        this.processar_entrada(mvt.medicamento, mvt.deposito_destino, key, mvt.quantidade, valor_medio_entrada);
       // console.log("")
        //console.log("MEDICAMENTO DEPOIS DE ENTRAR")
       // console.log(mvt.medicamento.qtd_disponivel);

        mvt.deposito.valor_total = mvt.deposito.valor_total ? mvt.deposito.valor_total : 0;

        if(mvt.deposito.valor_total > 0)
          mvt.deposito.valor_total = +mvt.deposito.valor_total - (+valor_medio_entrada * mvt.medicamento.qtd_solicitada);
        
        //Quem ja usava sistema antes dessa funcionalidade de valor de estoque pode estar com itens com estoque sem valor
        // entao ao fazer saida pode gerar inconsistencia, assim sendo o valor de nao deve nunca ficar negativo
        // em teoria isso nunca vai acontecer, foi colocado por contigencia
        if(mvt.deposito.valor_total < 0)
          mvt.deposito.valor_total = 0;

        //Gravando valor de estoque de depositos
        this.updatedUserData['/depositos/'+this.authService.get_clinica_id + '/'+mvt.deposito.id+'/valor_total'] = mvt.deposito.valor_total;
        //Gravando valor de estoque de depositos relatorio
        this.updatedUserData['/depositos_relatorio/'+this.authService.get_clinica_id + '/'+mvt.deposito.id+'/'+ this.ano+'/'+ this.mes+'/valor_acumulado'] = mvt.deposito.valor_total;

        let vl = +(+valor_medio_entrada * +mvt.medicamento.qtd_solicitada).toFixed(2);
        this.estoqueService.db.object('/depositos_relatorio/'+this.authService.get_clinica_id + '/'+mvt.deposito.id+'/'+ this.ano+'/'+ this.mes+'/valor_saida').query
        .ref.transaction(valor_saida => {
          if(valor_saida === null){
           // console.log("entrou no null");
            valor_saida = vl;
            return valor_saida;
          }else{
            //console.log("entrou no somatorio");
            valor_saida = +valor_saida + +vl;
            return valor_saida;
          }
        });

        mvt.medicamento.qtd_solicitada = null;
        
        if(mvt.medicamento.qtd_disponivel == 0){
          //console.log("Valor de estoque unitario e toal vai alterar para zero");
          mvt.medicamento.valor_medio_entrada = 0;
          mvt.medicamento.valor_tota_entrada = 0;
        }else{
          console.log("Valor de estoque total vai alterar de "+valor_tota_entrada+" para "+valor_medio_entrada*(mvt.medicamento.qtd_disponivel - mvt.medicamento.qtd_solicitada))
          mvt.medicamento.valor_tota_entrada = +valor_medio_entrada * +mvt.medicamento.qtd_disponivel;
        }

        //Gravando na tabela de depositos "depositos"
        this.updatedUserData['/depositos/'+this.authService.get_clinica_id + '/'+mvt.deposito.id+'/medicamentos/'+mvt.medicamento.id] = mvt.medicamento;

        //Gravando na tabela de movimentos "estoquesmovimentos"
        //eliminar redundancia de dados para dar agilidade e perfomance a base de dados
        mvt.deposito_nome = mvt.deposito.nome;
        mvt.deposito = null;
        mvt.medicamento_nome = mvt.medicamento.nome_generico;
        mvt.medicamento = null;
        this.updatedUserData['/estoquesmovimentos/'+this.authService.get_clinica_id+"/"+key] = mvt;
      });
      
      //CODIGO NOVO PARA GRAVAR SIMULTANEAMENTE TODOS OS DADOS E NAO HAVER INCONSISTENCIA
      //console.log("DONE")
      let d = Object.assign({}, this.updatedUserData);
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

  processar_entrada(medicamento: Medicamento, deposito: Deposito, key:string, qtd_entrada, valor_unitario_entrada){ 
      //console.log("Loop adicionando");
      let dia = new Date().getDate();
      let mes = +(new Date().getMonth()) + +1;
      let ano = new Date().getFullYear();

      let mvt = new MovimentoEstoque();
      mvt.data_movimento = dia +"/"+mes+"/"+ano;
      mvt.movimentador = this.authService.get_perfil + ' - ' + this.authService.get_user_displayName;
      mvt.tipo_movimento = "Entrada por transferencia";

      let md = new Medicamento();
      md.id = medicamento.id;
      md.codigo = medicamento.codigo;
      md.nome_comercial = medicamento.nome_comercial;
      md.nome_generico = medicamento.nome_generico;
      md.valor_medio_entrada = medicamento.valor_medio_entrada ? medicamento.valor_medio_entrada : 0;
      md.valor_tota_entrada =  medicamento.valor_tota_entrada ? medicamento.valor_tota_entrada : 0;
      md.qtd_disponivel = medicamento.qtd_disponivel ? medicamento.qtd_disponivel : 0;
      md.categoria = medicamento.categoria ? medicamento.categoria : null;
      md.tipo = medicamento.tipo ? medicamento.tipo : null;
      md.un = medicamento.un ? medicamento.un : null;
      md.composicao = medicamento.composicao ? medicamento.composicao : "";
      md.nivel = medicamento.nivel ? medicamento.nivel : "";
      md.preco_venda = medicamento.preco_venda ? medicamento.preco_venda : 0;
      //md.preco_venda_total = medicamento.preco_venda ? medicamento.preco_venda_total : 0;
      md.min = medicamento.min ? medicamento.min : 0;
      

      let dp = new Deposito();
      dp.id = deposito.id;
      dp.nome = deposito.nome;
      dp.medicamentos = deposito.medicamentos ? deposito.medicamentos : undefined;
      dp.valor_entrada = deposito.valor_entrada ? deposito.valor_entrada : 0;
      dp.valor_acumulado = deposito.valor_acumulado ? deposito.valor_acumulado : 0;
      dp.valor_total = deposito.valor_total ? deposito.valor_total : 0;
      dp.mes = deposito.mes ? deposito.mes : undefined; 
      dp.descricao = deposito.descricao ? deposito.descricao : "";
      dp.movimentos = deposito.movimentos ? dp.movimentos : undefined;
      dp.ano = deposito.ano ? deposito.ano : undefined; 
      

      mvt.medicamento = md;
      mvt.deposito = dp;
      mvt.quantidade = qtd_entrada;  
      mvt.valor_unitario = valor_unitario_entrada;

      let update_qtd = false;

      //Antes de adicionar calcular a quantidade disponivel se essa adicao for efetuada
      if(deposito.medicamentos){
        //console.log("entrou 1");
        Object.keys(mvt.deposito.medicamentos).forEach(key=>{
          if(mvt.medicamento.id == key){
            if(mvt.deposito.medicamentos[key].qtd_disponivel){
              mvt.medicamento.qtd_disponivel = +mvt.deposito.medicamentos[key].qtd_disponivel + +mvt.quantidade;
              
              let qtd_disponivel = mvt.deposito.medicamentos[key].qtd_disponivel ? mvt.deposito.medicamentos[key].qtd_disponivel : 0;

              if(qtd_disponivel > 0){
               // console.log("Secao 1");

                let valor_medio_anterior = +mvt.deposito.medicamentos[key].valor_medio_entrada ? +mvt.deposito.medicamentos[key].valor_medio_entrada : 0;
                
                let valor_anterior = +mvt.deposito.medicamentos[key].qtd_disponivel * +valor_medio_anterior;
                let valor_novo = +qtd_entrada * +valor_unitario_entrada;
                mvt.medicamento.valor_medio_entrada = +((+valor_novo + +valor_anterior)/(+mvt.deposito.medicamentos[key].qtd_disponivel + +qtd_entrada)).toFixed(2);
                mvt.medicamento.valor_tota_entrada = +(+mvt.medicamento.valor_medio_entrada * (+mvt.deposito.medicamentos[key].qtd_disponivel + +qtd_entrada)).toFixed(2);
               // console.log("Valor de unitario: "+mvt.medicamento.valor_medio_entrada);
                //console.log("Valor total: "+mvt.medicamento.valor_tota_entrada);

                mvt.deposito.valor_total = mvt.deposito.valor_total ? mvt.deposito.valor_total : 0;
                mvt.deposito.valor_total = +mvt.deposito.valor_total + +(+qtd_entrada * +valor_unitario_entrada);
               // console.log("Valor total deposito "+mvt.deposito.valor_total);
                
              }else{
                console.log("Secao 2");
                mvt.medicamento.valor_medio_entrada = +valor_unitario_entrada;
                mvt.medicamento.valor_tota_entrada = +qtd_entrada * +valor_unitario_entrada;
                //console.log("Valor de unitario: "+mvt.medicamento.valor_medio_entrada);
               // console.log("Valor total: "+mvt.medicamento.valor_tota_entrada);

                mvt.deposito.valor_total = mvt.deposito.valor_total ? mvt.deposito.valor_total : 0;
                mvt.deposito.valor_total = +mvt.deposito.valor_total + +(+qtd_entrada * +valor_unitario_entrada);
               // console.log("Valor total deposito "+mvt.deposito.valor_total);
              }
              
              update_qtd = true;
            }else{
              update_qtd = true;
              mvt.medicamento.qtd_disponivel = qtd_entrada;

              mvt.medicamento.valor_medio_entrada = +valor_unitario_entrada;
              mvt.medicamento.valor_tota_entrada = +qtd_entrada * +valor_unitario_entrada;
              //console.log("Valor de unitario: "+mvt.medicamento.valor_medio_entrada);
              //console.log("Valor total: "+mvt.medicamento.valor_tota_entrada);
            
              mvt.deposito.valor_total = deposito.valor_total ? deposito.valor_total : 0;
              mvt.deposito.valor_total = +mvt.deposito.valor_total + +(+qtd_entrada * +valor_unitario_entrada);
              //console.log("Valor total deposito "+mvt.deposito.valor_total);
            }
            //console.log("qtd disponivel INICIAL: "+this.mvt.medicamento.qtd_disponivel);
          }
        })
      }else{
        update_qtd = true;
        console.log("Secao 3");

        mvt.medicamento.qtd_disponivel = qtd_entrada;

        mvt.medicamento.valor_medio_entrada = +valor_unitario_entrada;
        mvt.medicamento.valor_tota_entrada = +qtd_entrada * +valor_unitario_entrada;
        //console.log("Valor de unitario: "+mvt.medicamento.valor_medio_entrada);
        //console.log("Valor total: "+mvt.medicamento.valor_tota_entrada);
       
        mvt.deposito.valor_total = deposito.valor_total ? deposito.valor_total : 0;
        mvt.deposito.valor_total = +mvt.deposito.valor_total + +(+qtd_entrada * +valor_unitario_entrada);
        //console.log("Valor total deposito "+mvt.deposito.valor_total);
        //console.log("qtd disponivel INICIAL2: "+this.mvt.medicamento.qtd_disponivel);
      }
      
      //console.log("qtd disponivel: "+this.mvt.medicamento.qtd_disponivel);
      if(!update_qtd){
        console.log("Secao 4");

        mvt.medicamento.qtd_disponivel = qtd_entrada;

        mvt.medicamento.valor_medio_entrada = +valor_unitario_entrada;
        mvt.medicamento.valor_tota_entrada = +qtd_entrada * +valor_unitario_entrada;
        //console.log("Valor de unitario: "+mvt.medicamento.valor_medio_entrada);
        //console.log("Valor total: "+mvt.medicamento.valor_tota_entrada);
       
        mvt.deposito.valor_total = deposito.valor_total ? deposito.valor_total : 0;
        mvt.deposito.valor_total = +mvt.deposito.valor_total + +(+qtd_entrada * +valor_unitario_entrada);
        //console.log("Valor total deposito "+mvt.deposito.valor_total);
      }

      //GRAVAR OS DADOS

      //Gravando na tabela de depositos "depositos"
      //console.log("Salvar 1a etapa");
      mvt.medicamento.qtd_solicitada = null;
      this.updatedUserData['/depositos/'+this.authService.get_clinica_id + '/'+mvt.deposito.id+'/medicamentos/'+mvt.medicamento.id] = mvt.medicamento;

     // console.log("Salvar 2a etapa");
      //Gravando valor de estoque de depositos
      this.updatedUserData['/depositos/'+this.authService.get_clinica_id + '/'+mvt.deposito.id+'/valor_total'] = mvt.deposito.valor_total;

      //console.log("Salvar 3a etapa");
      //Gravando valor de estoque de depositos relatorio
      this.updatedUserData['/depositos_relatorio/'+this.authService.get_clinica_id + '/'+mvt.deposito.id+'/'+ this.ano+'/'+ this.mes+'/valor_acumulado'] = mvt.deposito.valor_total;

     /// console.log("Salvar 4a etapa");
      this.estoqueService.db.object('/depositos_relatorio/'+this.authService.get_clinica_id + '/'+mvt.deposito.id+'/'+ this.ano+'/'+ this.mes+'/valor_entrada').query
      .ref.transaction(valor_entrada => {
        if(valor_entrada === undefined){
          valor_entrada = +(+mvt.quantidade * +valor_unitario_entrada).toFixed(2);
          return valor_entrada;
        }else{
          valor_entrada = +(+valor_entrada + +(+mvt.quantidade * +valor_unitario_entrada)).toFixed(2);
          return valor_entrada;
        }
      })
    

      //console.log("Salvar 5a etapa");
      //Gravando na tabela de movimentos "estoquesmovimentos"
      //eliminar redundancia de dados para dar agilidade e perfomance a base de dados
      mvt.deposito_nome = mvt.deposito.nome;
      mvt.deposito = null;
      mvt.medicamento_nome = mvt.medicamento.nome_comercial;
      mvt.medicamento = null;
      this.updatedUserData['/estoquesmovimentos/'+this.authService.get_clinica_id+"/"+key] = mvt;

      //mvt = null;
      //console.log("Fim Loop Adicionar");
  }

  openSnackBar(mensagem) {
    this.snackBar.open(mensagem, null,{
      duration: 3000
    })
  }

}