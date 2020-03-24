import { Component, OnInit, ViewChild, Inject, ElementRef } from '@angular/core';
import { Paciente } from '../../classes/paciente';
import { MatTableDataSource, MatPaginator, MatSort, MatSnackBar, MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material';
import { ConfiguracoesService } from '../../services/configuracoes.service';
import { PacienteService } from '../../services/paciente.service';
import { AuthService } from '../../services/auth.service';
import { Consulta } from '../../classes/consulta';
import { Faturacao } from '../../classes/faturacao';
import { DiagnosticoAuxiliar } from '../../classes/diagnostico_aux';
import { SelectionModel } from '@angular/cdk/collections';
import * as jsPDF from 'jspdf';
import { Clinica } from '../../classes/clinica';
import { NrCotacao } from '../../classes/nr_cotacao';
import { NrFatura } from '../../classes/nr_fatura';
import { Seguradora } from '../../classes/seguradora';
import { Conta, Linha } from '../../classes/conta';

@Component({
  selector: 'app-pendentes',
  templateUrl: './pendentes.component.html',
  styleUrls: ['./pendentes.component.scss']
})
export class PendentesComponent implements OnInit {
 
  perfil = "";
  acesso_remover = true;

  consultas: Consulta[];

  dataSourse: MatTableDataSource<Consulta>;
  displayedColumns = ['nid','apelido', 'nome', 'diagnosticos_aux', 'valor_pagar' ,'status','imprimir', 'faturar', 'remover'];
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  clinica: Clinica = new Clinica();
  faturacao: Faturacao;

  nrscotacao: NrCotacao[];
  nr_cotacao = 0;
  nrsfaturcao: NrFatura[];
  nr_fatura = 0;

  formas_pagamento = [
    {value: 'Cartão de crédito', viewValue: 'Cartão de crédito'},
    {value: 'Convênio', viewValue: 'Convênio'},
    {value: 'Numerário', viewValue: 'Numerário'},
  ]

  seguradoras: Seguradora[];

  constructor(public dialog: MatDialog, public authService: AuthService, public configServices:ConfiguracoesService,
    private pacienteService: PacienteService,public snackBar: MatSnackBar) { }

    ngOnInit() {

      this.perfil = this.authService.get_perfil;
      if(this.perfil == 'Clinica_Admin'){
        this.acesso_remover = false;
      }

      this.configServices.getNrsCotacao().snapshotChanges().subscribe(data => {
        this.nrscotacao = data.map(e => {
          return {
            id: e.payload.key,
            ...e.payload.val(),
          } as NrCotacao;
        });
  
        if(typeof this.nrscotacao !== 'undefined' && this.nrscotacao.length > 0){
          this.nr_cotacao = Math.max.apply(Math, this.nrscotacao.map(function(o) { return o.id; }));
          this.nr_cotacao = this.nr_cotacao+1;
        }else{
          this.nr_cotacao =  +(new Date().getFullYear()+'000001');
        }
        return this.nr_cotacao;
      })

      this.configServices.getNrsFatura().snapshotChanges().subscribe(data => {
        this.nrsfaturcao = data.map(e => {
          return {
            id: e.payload.key,
            ...e.payload.val(),
          } as NrFatura;
        });
  
        if(typeof this.nrsfaturcao !== 'undefined' && this.nrsfaturcao.length > 0){
          this.nr_fatura = Math.max.apply(Math, this.nrsfaturcao.map(function(o) { return o.id; }));
          this.nr_fatura = this.nr_fatura+1;
        }else{
          this.nr_fatura =  +(new Date().getFullYear()+'000001');
        }
        return this.nr_fatura;
      })

      

      this.configServices.getClinica().valueChanges()
      .take(1)
      .subscribe(c => {
        this.clinica = c;
      })


      this.pacienteService.getConsultas().snapshotChanges().subscribe(data => {
        this.consultas = data.map(e => {
          return {
            id: e.payload.key,
            paciente: e.payload.val()['paciente'] as Paciente,
            ...e.payload.val(),
          } as Consulta;
        })

        this.consultas.filter(c =>c.status === "Diagnostico" || c.status === "Internamento").forEach(c => {
          c.lista_diagnosticos_aux = undefined;
          //console.log(" --------------- "+ c.paciente.nome+" ---------------------")

          /*if(c.diagnosticos_aux === null){
            console.log("c.diagnosticos_aux is null")
          }else{*/

            //console.log("fora "+c.paciente.nome );
            for (let key in c.diagnosticos_aux) {
              if (c.diagnosticos_aux.hasOwnProperty(key)) {

                //Garantir que dignosticos faturados nao sejam incluidos na lista de pendencias
                if(c.diagnosticos_aux[key].faturado != true){

                  let element = c.diagnosticos_aux[key];
                  //console.log(c.paciente.nome +" "+element.nome +" "+element.preco);
                  
                  if(c.lista_diagnosticos_aux){
                    c.lista_diagnosticos_aux = c.lista_diagnosticos_aux + " | " + element.nome;
                    c.preco_diagnosticos = +c.preco_diagnosticos + +element.preco;
                    //console.log("2")
                  }else{
                    c.lista_diagnosticos_aux = element.nome;
                    c.preco_diagnosticos = element.preco;
                    //console.log("1")
                  }
                }
              }
            }

            /*c.diagnosticos_aux.forEach(element => {
              //if(element.faturado !== true){
  
                //console.log("ELEMENT "+ element.nome)
                //console.log("LISTA ATUAL "+c.lista_diagnosticos_aux)
  
                if(c.lista_diagnosticos_aux){
                  //console.log("2")
                  c.lista_diagnosticos_aux = c.lista_diagnosticos_aux + " | " + element.nome
                  c.preco_diagnosticos = +c.preco_diagnosticos + +element.preco;
                }else{
                  //console.log("1")
                  c.lista_diagnosticos_aux = element.nome;
                  c.preco_diagnosticos = element.preco;
                }
              //}
              
            });*/
          //}
          

        });

        

      this.dataSourse=new MatTableDataSource(
        this.consultas.filter(c =>c.status === "Diagnostico" || c.status === "Internamento").sort((a, b) => a.data > b.data ? 1 : -1)
      );
      setTimeout(()=>this.dataSourse.paginator = this.paginator);
      this.dataSourse.sort = this.sort;
      
    })

    //SEGURADORAS
    this.configServices.getSeguradoras().snapshotChanges().subscribe(data => {
      this.seguradoras = data.map(e => {
        return {
          id: e.payload.key,
          ...e.payload.val(),
        } as Seguradora;
      })
    })
  }
  
  remover(consulta: Consulta){
    let dialogRef = this.dialog.open(RemoverPendentesDialog, {
      width: '500px',
      data: { consulta: consulta}
    });
    dialogRef.afterClosed().subscribe(result => {
      //console.log("result "+result);
    });
  }
  



  applyFilter(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // Datasource defaults to lowercase matches
    this.dataSourse.filter = filterValue;
    this.dataSourse.filter = filterValue;
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

  cotar(diagnosticos :DiagnosticoAuxiliar[], paciente: Paciente, categoria){
    let diagnosticos2: DiagnosticoAuxiliar[] = []; //Lista auxiliar para guardar diagnosticos nao faturados para serem apresentados no pdf

    diagnosticos.forEach(element => {
      if(element.faturado != true){
        diagnosticos2.push(element);
      }
    })
    this.downloadPDF(diagnosticos2, paciente, categoria);
  }

  faturarDiagnostico(consulta: Consulta){

    if(this.clinica.endereco){
      if(this.nr_cotacao > 0){

        this.faturacao = new Faturacao();
        this.faturacao.categoria = "DIAGNOSTICO_AUX";
        this.faturacao.valor = consulta.preco_diagnosticos;
        this.faturacao.data = new Date();
        //this.faturacao.consulta = consulta;
        //this.faturacao.diagnostico_aux = consulta.diagnosticos_aux;
        
        this.faturacao.mes = this.getMes(+new Date().getMonth()+ +1);
        this.faturacao.ano = new Date().getFullYear();

        this.faturacao.faturador = this.authService.get_perfil + ' - ' + this.authService.get_user_displayName;
        this.faturacao.id = this.nr_fatura+"";
        

        if(consulta.tipo == "Consulta Medica"){
          consulta.status = "Em andamento";
        }else{
          consulta.status = "Encerrada";
        }
        
        let total = 0;
        consulta.diagnosticos_aux.forEach(element => {
          if(element.faturado != true){
            total = total+1;
          }
        });

        this.openDialog(consulta);

        /*if(total>1){
          //Mais de um diagnostico para rececionista poder selecionar apenas que os clientes querem
          this.openDialog(consulta);
          

        }else{
          //Um diagnostico apenas
          //console.log("apenas de 1")

          //O array de diagnosticos pode ter mais de um diagnosticos apesar de ter apenas 1 a ser faturado
          // por isso temos que fazer loop para achar o nao faturado
          consulta.diagnosticos_aux.forEach(element => {
            if(element.faturado != true){
              
              element.faturado = true;
              let diagnostico_aux2: DiagnosticoAuxiliar[] = [];//Usado para pegar o Diagnostico nao faturado e apresentar no pdf
              diagnostico_aux2.push(element);
              
              //faturacao
              let data = Object.assign({}, this.faturacao);
              let d = Object.assign({}, consulta); 

              this.downloadPDF(diagnostico_aux2, consulta.paciente, 'Fatura');
              this.pacienteService.faturar(data)
              .then( res => {
                this.pacienteService.updateConsulta(d)
                .then(r => {
                  this.openSnackBar("Faturado com sucesso");
                })
                .catch(er => {
                  console.log("ERRO: " + er.message)
                })
                
              }, err=>{
                console.log("ERRO: " + err.message)
              })
            }
          });
          
        }*/

      }else{
        this.openSnackBar("Ocorreu um erro ao gerar a cotacao. Tente novamente.");
      }
    }else{
      this.openSnackBar("Ocorreu um erro ao gerar a cotacao. Tente novamente.");
    }

  }

  openDialog(consulta: Consulta): void {
    let dialogRef = this.dialog.open(FaturarDialog, {
      width: '800px',
      data: { consulta: consulta, clinica: this.clinica, nr_cotacao: this.nr_cotacao, nr_fatura: this.nr_fatura, formas_pagamento: this.formas_pagamento, seguradoras: this.seguradoras }
    });
    dialogRef.afterClosed().subscribe(result => {
      //console.log("result "+result);
    });
  }

  openSnackBar(mensagem) {
    this.snackBar.open(mensagem, null,{
      duration: 2000
    })
  }

  public downloadPDF(diagnosticos :DiagnosticoAuxiliar[], paciente: Paciente, categoria){// criacao do pdf

    let nome = "";
    if(categoria == 'Cotacao'){
      nome = "COTAÇÃO";
    }else{
      nome = "RECIBO";
    }

    if(this.clinica.endereco){
      if(this.nr_cotacao > 0 && this.nr_fatura >0){
        
      
        if(categoria == 'Cotacao'){
          let nr_cotacao = new NrCotacao();
          nr_cotacao.id = this.nr_cotacao+"";
          let d = Object.assign({}, nr_cotacao); 

          this.configServices.addNrCotacao(d)
          .then(r =>{
    
            this.gerarPDF(diagnosticos , paciente, nome, d.id);
            
          }, err=>{
            this.openSnackBar("Ocorreu um erro ao gerar a "+ categoria +". Tente novamente.");
          })
        }else{
          let nr_fatura = new NrFatura();
          nr_fatura.id = this.nr_fatura+"";
          let d = Object.assign({}, nr_fatura); 

          this.configServices.addNrFatura(d)
          .then(r =>{
    
            this.gerarPDF(diagnosticos , paciente, nome, d.id);
            
          }, err=>{
            this.openSnackBar("Ocorreu um erro ao gerar a "+ categoria +". Tente novamente.");
            
          })
        }
        

      }else{
        this.openSnackBar("Ocorreu um erro ao gerar a "+ categoria +". Tente novamente.");
      }
    
    }else{
      this.openSnackBar("Ocorreu um erro ao gerar a "+ categoria +". Tente novamente.");
    }
     
}//Fim download pdf

openSnackBarr(mensagem) {
  this.snackBar.open(mensagem, null,{
    duration: 2000
  })
}

gerarPDF(diagnosticos :DiagnosticoAuxiliar[], paciente: Paciente, nome, id){
  let doc = new jsPDF({
    orientation: 'p',
    unit: 'px',
    format: 'a4',
    putOnlyUsedFonts:true,
  });

  let specialElementHandlers ={
    '#editor': function(element,renderer){return true;} 
  }
  let dia = new Date().getDate();
  let mes = +(new Date().getMonth()) + +1;
  let ano = new Date().getFullYear();
 let dataemisao = dia +"/"+mes+"/"+ano;  

  var img = new Image();
  img.src ="../../../assets/images/1 - logo - vitalle.jpg"; 
  doc.addImage(img,"PNG", 300, 40,90, 90);

  doc.setFont("Courier");
  doc.setFontStyle("normal"); 
  doc.setFontSize(12);
  doc.text(id+"", 225, 40);
  let item = 1;
  let preco_total = 0;
  let linha = 200;                      
  diagnosticos.forEach(element => {
    doc.text(item+"", 55, linha) //item
    doc.text("1", 257, linha) //quantidade
    doc.text(element.nome , 95, linha) //descricao
    doc.text(element.preco, 294, linha)
    doc.text(element.preco, 354, linha)

    preco_total = +preco_total + +element.preco;
    item = +item + +1;
    linha = +linha + +20;
  });   
  
  
  doc.setFont("Courier");
  doc.setFontStyle("normal"); 
  doc.setFontStyle("bold");
  doc.setFontSize(15);

  doc.text(nome+":", 170, 40);  



  doc.setFont("Courier");
  doc.setFontStyle("normal"); 
  doc.setFontSize(10);

  doc.text("Processado pelo computador", 170, 580);
  // doc.text("CENTRO MEDICO VITALLE", 165, 75);
  doc.text(this.clinica.endereco, 50, 75);
  doc.text(this.clinica.provincia+", "+this.clinica.cidade, 50,85);
  doc.text("Email: "+this.clinica.email, 50, 95);
  doc.text("Cell: "+this.clinica.telefone, 50, 105);
  
  doc.text("Nome do Paciente:", 50, 125);
  doc.text(paciente.nome, 128, 125);
  doc.text("NID:", 250, 125);
  doc.text(paciente.nid+"", 268, 125);
  doc.text("Apelido:", 50, 145);
  doc.text(paciente.apelido, 89, 145);
  doc.text("Data de emissão: ", 250, 145);
  doc.text(dataemisao, 322, 145);
  doc.setFillColor(50,50,50);
  doc.rect ( 50, 170 , 40 , 20 ); 
  doc.rect (  50, 190 , 40 , 320 ); 

  doc.rect (  90, 170 , 150 , 20 ); 
  doc.rect (  90, 190 , 150 , 320 );

  doc.rect (  240, 170 , 50 , 20 ); 
  doc.rect (  240, 190 , 50 , 320 );

  doc.rect (  290, 170 , 60 , 20 ); 
  doc.rect (  290, 190 , 60 , 320 );

  doc.rect (  350, 170 , 50 , 20 ); 
  doc.rect (  350, 190 , 50 , 320);

  doc.rect ( 290, 510 , 110 , 20 );

  doc.setFontStyle("bold");
  doc.text("Item", 60, 180);
  doc.text("Descrição", 120, 180);
  doc.text("Quantd", 245, 180);
  doc.text("Preço Unit", 295, 180);
  doc.text("Preç Tot", 355, 180);
  doc.text("Total: "+preco_total.toFixed(2).replace(".",",")+" MZN", 293, 525);

  doc.rect (  290, 170 , 60 , 20 ); 
  doc.rect (  290, 190 , 60 , 320 );

  //  doc.text("FICHA DE PAGAMENTO", 165, 90);

  doc.save(nome+ id +'.pdf'); 
}


}


//DIALOG CONFIRMAR REMOCAO -----------------------------------------------------
@Component({
  selector: 'remover-dialog',
  templateUrl: 'remover-diagnostico.html',
})
export class RemoverPendentesDialog {

  consulta?: Consulta;

  constructor(public dialogRef: MatDialogRef<RemoverPendentesDialog>, public configServices: ConfiguracoesService,
  @Inject(MAT_DIALOG_DATA) public data: any, public authService:AuthService,
  public pacienteService: PacienteService,  public snackBar: MatSnackBar) {
    setTimeout(() => {
      this.consulta = data.consulta;
    })
  }

  remover(){
    this.consulta.diagnosticos_aux.forEach(element => {
      if(!element.faturado){
        this.consulta.diagnosticos_aux = this.consulta.diagnosticos_aux.filter(obj => obj !== element); //Remover obejto do array
      }
    });

    this.consulta.status = "Em andamento";

    let d = Object.assign({}, this.consulta);

    this.pacienteService.updateConsulta(d)
    .then(r => {
      this.dialogRef.close();
      this.openSnackBar("Diagnosticos removidos com sucesso");
    })
    .catch(er => {
      this.openSnackBar("Ocorreu um erro ao remover os diagnosticos");
      console.log("ERRO: " + er.message)
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




//DIALOG FATURAR MAIS DE UM DIAGNOSTICO AUX -----------------------------------------------------
@Component({
  selector: 'faturar-consulta-dialog',
  templateUrl: 'faturar-diagnostico.html',
  })
  export class FaturarDialog {

    clinica: Clinica;
    nr_cotacao = 0;
    nr_fatura = 0;

    consulta: Consulta;
    diagnosticos_aux: DiagnosticoAuxiliar[] = [];
    dataSource: MatTableDataSource<DiagnosticoAuxiliar>;
    displayedColumns = ['select', 'nome', 'preco_singular', 'preco_empresa'];
    @ViewChild(MatPaginator) paginator: MatPaginator;
  
    selection = new SelectionModel<DiagnosticoAuxiliar>(true, []);

    forma_pagamento = "";

    seguradora: Seguradora;

    nr_apolice = "";

    preco_total:Number = 0;

    tot_diagnosticos = 0;

    linhas: Linha[] = [];
    
    constructor(  public dialogRef: MatDialogRef<FaturarDialog>, public configServices: ConfiguracoesService,
    @Inject(MAT_DIALOG_DATA) public data: any, public authService:AuthService,
    public pacienteService: PacienteService,  public snackBar: MatSnackBar) {
      
      setTimeout(() => {
        this.consulta = data.consulta;
  
        //Adicionar diagnosticos nao faturados ao array de diagnosticos
        this.consulta.diagnosticos_aux.forEach(element => {
          if(element.faturado != true){
            this.diagnosticos_aux.push(element);  
            this.tot_diagnosticos = +this.tot_diagnosticos + +1;
            //this.preco_total = +this.preco_total + +element.preco;
          }
        });
  
        this.clinica = this.data.clinica;
        this.nr_cotacao = this.data.nr_cotacao;
        this.nr_fatura = this.data.nr_fatura;

        this.seguradora = new Seguradora();

        this.dataSource = new MatTableDataSource(this.diagnosticos_aux);
        setTimeout(() => this.dataSource.paginator = this.paginator);
      })

    }
  
    precoSegurado = false;
    mudarFPagamento(){
      this.nr_apolice = "";
      this.seguradora = new Seguradora();
      this.preco_total = 0;

      if(this.forma_pagamento == "Convênio"){
        this.precoSegurado = true;

        this.consulta.diagnosticos_aux.forEach(element => {
          if(element.faturado != true){
            this.diagnosticos_aux.push(element);  
            //this.preco_total = +this.preco_total + +element.preco_seguradora;
            //this.selecionarLinha(element);
          }
        });

      }else{
        this.precoSegurado = false;

        this.consulta.diagnosticos_aux.forEach(element => {
          if(element.faturado != true){
            this.diagnosticos_aux.push(element);  
            //this.preco_total = +this.preco_total + +element.preco;
            //this.selecionarLinha(element);
          }
        });
      }
      this.calcularPreco();
      console.log("consulta.id "+this.consulta.id)
    }

    onNoClick(): void {
      this.dialogRef.close();
    }
  
    openSnackBar(mensagem) {
      this.snackBar.open(mensagem, null,{
        duration: 2000
      })
    }

    teste(){
      alert(this.isAllSelected());
    }

    getMes(number): String{
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
          break; 
        } 
     } 
    }

    faturar(){ 
      
      //INICIO VALIDACOES ===========================================
      //Verificar se pelo menos um item foi selecionado
      let qtd_selecionado = 0;
      this.dataSource.data.forEach(row => {
        if (this.selection.isSelected(row)){
          qtd_selecionado = 1;
        }
      })

      if(qtd_selecionado == 0){
        //Se for igual a zero entao nao foi selecionado nada, deve interromper o metodo
        this.openSnackBar("Selcione pelo menos uma linha a ser faturada");
        return;
      }

      if(this.forma_pagamento == "Convênio"){  
        if(this.nr_apolice == "" || this.nr_apolice == null){
          this.openSnackBar("Preencha o nr da apolice");
          return;
        }

        if(this.seguradora.nome == "" || this.seguradora.nome == null){
          this.openSnackBar("Selecione a seguradora");
          return;
        }
      }

      //FIM VALIDACOES ===========================================

      let diagnostico_aux2: DiagnosticoAuxiliar[] = [];//Usado para juntar a lista de diagnosticos a serem faturados para sairem no pdf
      let faturacao = new Faturacao();
      var updatedUserData = {};
      let servico = "Diagnosticos: ";
      
      faturacao.categoria = "DIAGNOSTICO_AUX";
      faturacao.valor = 0;
      faturacao.data = new Date();
      //faturacao.consulta = this.consulta;
      //faturacao.diagnostico_aux = consulta.diagnosticos_aux;
      //this.faturacao.diagnostico_aux = this.consultas.
      faturacao.faturador = this.authService.get_perfil + ' - ' + this.authService.get_user_displayName;

      faturacao.mes = this.getMes(+new Date().getMonth()+ +1);
      faturacao.ano = new Date().getFullYear();
      faturacao.id = this.nr_fatura+"";

      console.log("Medico consulta: "+this.consulta.medico_nome);
      faturacao.medico_nome = this.consulta.medico_nome; //Acrescentado 24.03.2020

      /*if(this.consulta.tipo == "Consulta Medica"){
        this.consulta.status = "Em andamento";
      }else{
        this.consulta.status = "Encerrada";
      }*/

      //Verificar diagnosticos selecionados na tabela
      diagnostico_aux2 = [];
      this.dataSource.data.forEach(row => {
        //console.log("Analisando row "+row.nome);
        //console.log(row.nome+" selecionado ? "+  this.selection.isSelected(row))

        //Atualizar os diagnosticos selecionados para faturados
        if(this.selection.isSelected(row)){

          this.consulta.diagnosticos_aux.forEach(element => {
            if(row == element){
              element.faturado = true;


              if(this.forma_pagamento == "Convênio"){  
                faturacao.valor = +faturacao.valor + +element.preco_seguradora;
              }else{
                faturacao.valor = +faturacao.valor + +element.preco;
              }
              //servico = servico+" "+element.nome+" ; ";
              //diagnostico_aux2.push(element);
              diagnostico_aux2.indexOf(element) === -1 ? servico = servico+" "+element.nome+" ; " : console.log("This item already exists");
              diagnostico_aux2.indexOf(element) === -1 ? diagnostico_aux2.push(element) : console.log("This item already exists");
              //console.log("Adicionou element: "+element.nome +" row: "+row.nome);
            }
          });

        } 
      });
      //console.log("Adicionou "+diagnostico_aux2.length)
      updatedUserData['faturacao/'+this.authService.get_clinica_id + '/'+faturacao.ano +'/'+this.nr_fatura] = faturacao;

      
      //Se todos os itens tiverem sido faturados a consulta:
      // encerra se for do tipo Diagnostico
      // ou fica em andamento se for do tipo medica
      //console.log("is all selected "+this.isAllSelected())
      if(this.isAllSelected()){
        if(this.consulta.tipo == "Consulta Medica"){
          this.consulta.status = "Em andamento";
          //alert("Status da consulta: "+"Em andamento");
        }else{
          this.consulta.status = "Encerrada";
          //alert("Status da consulta: "+"Encerrada");
        }
      }else{
        //se nao forem faturados todos os diagnosticos entao o status da consulta nao muda
        console.log("NAO ALTEROU O STATUS DA CONSULTA")
        this.consulta.status = "Diagnostico";
        //alert("Status da consulta: "+"Diagnostico");
      }
      //alert(this.consulta.id);
      updatedUserData['consultas/'+this.authService.get_clinica_id + '/lista_completa/'+this.consulta.id] = this.consulta;

      let dia = new Date().getDate();
      let mes = this.getMes(+(new Date().getMonth()) + +1);
      let ano = new Date().getFullYear();
      let conta = new Conta();
      conta.ano = ano;
      conta.mes = mes;
      conta.dia = dia;
      conta.data = dia +"/"+mes+"/"+ano;
      conta.cliente_apelido = this.consulta.paciente_apelido;
      conta.cliente_nome = this.consulta.paciente_nome;
      conta.cliente_nid = this.consulta.paciente_nid;
      conta.forma_pagamento = this.forma_pagamento;    
      conta.consulta = servico;
      conta.linhas = this.linhas;
      conta.segunda_via = true;
      if(conta.forma_pagamento == "Convênio"){
        conta.categoria = "A receber";
        conta.nr_apolice = this.nr_apolice;
        conta.seguradora_nome = this.seguradora.nome;
        conta.valor_total = this.preco_total;
      }else{
        conta.categoria = "Recebida";
        conta.valor_total = this.preco_total;
        conta.data_recebimento = new Date();
      }

      if(conta.categoria == "A receber"){
        updatedUserData['contas/'+this.authService.get_clinica_id + '/'+faturacao.ano +'/receber/'+this.nr_fatura] = conta;
      }else{
        updatedUserData['contas/'+this.authService.get_clinica_id + '/'+faturacao.ano +'/recebidas/'+this.nr_fatura] = conta;
      }

      let d = Object.assign({}, updatedUserData);
      this.pacienteService.multiSave(d) 
      .then(r =>{
        this.downloadPDF(diagnostico_aux2, this.consulta.paciente, 'Fatura');
        this.dialogRef.close();
        this.openSnackBar("Faturado com sucesso");
      }, err =>{
        console.log("ERRO: " + err.message)
        this.openSnackBar("Ocorreu um erro ao faturar. Tente novamente ou contacte a equipe de suporte.");
      })

      //Guardar as informacoes na base de dados
      //faturacao
      /*let data = Object.assign({},faturacao);
      let d = Object.assign({}, this.consulta); 

      this.pacienteService.faturar(data)
      .then( res => {
        this.downloadPDF(diagnostico_aux2, this.consulta.paciente, 'Fatura');
        this.pacienteService.updateConsulta(d)
        .then(r => {
          this.dialogRef.close();
          this.openSnackBar("Faturado com sucesso");
        })
        .catch(er => {
          console.log("ERRO: " + er.message)
        })
        
      }, err=>{
        console.log("ERRO: " + err.message)
      })*/
      
      
    }//FIM DO METODO FATURAR



    /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    
    const numSelected = this.selection.selected.length;
    const numRows = this.tot_diagnosticos;

    //console.log("numSelected: "+numSelected+" / numRows: "+numRows);
    return numSelected == numRows;

    /*
      const numSelected = this.selection.selected.length;
      const numRows = this.dataSource.data.length;
      return numSelected === numRows;
    */
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected() ?
        this.selection.clear() :
        this.dataSource.data.forEach(row => {
          this.selection.select(row)
        });
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: DiagnosticoAuxiliar): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.id}`;
  }

  calcularPreco(){
    this.preco_total = 0;
    this.linhas = [];

    if(this.forma_pagamento == "Convênio"){

      this.consulta.diagnosticos_aux.forEach(element => {
        if(element.faturado != true){
          if (this.selection.isSelected(element)){
            this.preco_total = +this.preco_total + +element.preco_seguradora;

            let linha = new Linha();
            linha.descricao_servico = element.nome+"";
            linha.qtd_solicitada = 1;
            linha.id_servico = element.id+"";
            linha.preco_unitario = +element.preco_seguradora;
            linha.preco_total = linha.preco_unitario*1;
            this.linhas.push(linha);
          }
        }
      });

    }else{

      this.consulta.diagnosticos_aux.forEach(element => {
        if(element.faturado != true){
          if (this.selection.isSelected(element)){
            this.preco_total = +this.preco_total + +element.preco;

            let linha = new Linha();
            linha.descricao_servico = element.nome+"";
            linha.qtd_solicitada = 1;
            linha.id_servico = element.id+"";
            linha.preco_unitario = +element.preco;
            linha.preco_total = linha.preco_unitario*1;
            this.linhas.push(linha);
          }
        }
      });
    }

    
  }

  /*selecionarLinha(row: DiagnosticoAuxiliar){

    if (this.isAllSelected()){

      this.selecionarTudo();

    }else{

      if(this.forma_pagamento == "Convênio"){  
        if (this.selection.isSelected(row)){
          this.preco_total = +this.preco_total + +row.preco_seguradora;
          console.log("Selecionada "+row.nome+" somou "+row.preco_seguradora);
        }else{
          if(this.preco_total > 0)
            this.preco_total = +this.preco_total + -row.preco_seguradora;
          console.log("Nao Selecionada "+row.nome+" retirou "+ row.preco_seguradora);
        }
      }else{
        if (this.selection.isSelected(row)){
          this.preco_total = +this.preco_total + +row.preco;
          console.log("Nao Selecionada "+row.nome+" retirou "+ row.preco);
        }else{
          if(this.preco_total > 0)
            this.preco_total = +this.preco_total + -row.preco;
            console.log("Nao Selecionada "+row.nome+" retirou "+ row.preco_seguradora);
        }
      }

    }
    
  }*/

  openSnackBarr(mensagem) {
    this.snackBar.open(mensagem, null,{
      duration: 2000
    })
  }



  //GERAR PDFS
  public downloadPDF(diagnosticos :DiagnosticoAuxiliar[], paciente: Paciente, categoria){// criacao do pdf

    let nome = "";
    if(categoria == 'Cotacao'){
      nome = "COTAÇÃO";
    }else{
      nome = "RECIBO";
    }

    if(this.clinica.endereco){
      if(this.nr_cotacao > 0 && this.nr_fatura >0){
        
      
        if(categoria == 'Cotacao'){
          let nr_cotacao = new NrCotacao();
          nr_cotacao.id = this.nr_cotacao+"";
          let d = Object.assign({}, nr_cotacao); 

          this.configServices.addNrCotacao(d)
          .then(r =>{
    
            this.gerarPDF(diagnosticos , paciente, nome, d.id);
            
          }, err=>{
            this.openSnackBar("Ocorreu um erro ao gerar a "+ categoria +". Tente novamente.");
          })
        }else{
          let nr_fatura = new NrFatura();
          nr_fatura.id = this.nr_fatura+"";
          let d = Object.assign({}, nr_fatura); 

          this.configServices.addNrFatura(d)
          .then(r =>{
    
            this.gerarPDF(diagnosticos , paciente, nome, d.id);
            
          }, err=>{
            this.openSnackBar("Ocorreu um erro ao gerar a "+ categoria +". Tente novamente.");
          })
        }
        

      }else{
        this.openSnackBar("Ocorreu um erro ao gerar a "+ categoria +". Tente novamente.");
      }
    
    }else{
      this.openSnackBar("Ocorreu um erro ao gerar a "+ categoria +". Tente novamente.");
    }
     
}//Fim download pdf


gerarPDF(diagnosticos :DiagnosticoAuxiliar[], paciente: Paciente, nome, id){
  let doc = new jsPDF({
    orientation: 'p',
    unit: 'px',
    format: 'a4',
    putOnlyUsedFonts:true,
  });

  let specialElementHandlers ={
    '#editor': function(element,renderer){return true;} 
  }
  let dia = new Date().getDate();
  let mes = +(new Date().getMonth()) + +1;
  let ano = new Date().getFullYear();
 let dataemisao = dia +"/"+mes+"/"+ano;  

  var img = new Image();
  img.src ="../../../assets/images/1 - logo - vitalle.jpg"; 
  doc.addImage(img,"PNG", 300, 40,90, 90);

  doc.setFont("Courier");
  doc.setFontStyle("normal"); 
  doc.setFontSize(12);
  doc.text(id+"", 225, 40);
  let item = 1;
  let preco_total = 0;
  let linha = 200;                      
  diagnosticos.forEach(element => {
    doc.text(item+"", 55, linha) //item
    doc.text("1", 257, linha) //quantidade
    doc.text(element.nome , 95, linha) //descricao

    if(this.forma_pagamento == "Convênio"){  
      doc.text(element.preco_seguradora, 294, linha)
      doc.text(element.preco_seguradora, 354, linha)
      preco_total = +preco_total + +element.preco_seguradora;
    }else{
      doc.text(element.preco, 294, linha)
      doc.text(element.preco, 354, linha)
      preco_total = +preco_total + +element.preco;
    }

    
    item = +item + +1;
    linha = +linha + +20;
  });     

  doc.setFont("Courier");
  doc.setFontStyle("normal"); 
  doc.setFontStyle("bold");
  doc.setFontSize(15);

  doc.text(nome+":", 170, 40);  


  doc.setFont("Courier");
  doc.setFontStyle("normal"); 
  doc.setFontSize(10);

  doc.text("Processado pelo computador", 170, 580);
  // doc.text("CENTRO MEDICO VITALLE", 165, 75);

  doc.text(this.clinica.endereco, 50, 65);
  doc.text(this.clinica.provincia+", "+this.clinica.cidade, 50,75);
  doc.text("Email: "+this.clinica.email, 50, 85);
  doc.text("Cell: "+this.clinica.telefone, 50, 95);
  doc.text("NUIT: "+this.clinica.nuit, 50, 105);
  
  doc.text("Nome do Paciente: "+paciente.nome, 50, 125);
  doc.text("NID: "+paciente.nid, 250, 125);
  doc.text("Apelido: "+paciente.apelido, 50, 145);
  doc.text("Data de emissão: "+dataemisao, 250, 145);
  let n = paciente.nuit ? paciente.nuit : ""; //Trabalhando o NUIT por nao ser campo obrigatorio pode estar nulo
  doc.text("NUIT do paciente: "+n, 50, 165);
  /*doc.text(this.clinica.endereco, 50, 75);
  doc.text(this.clinica.provincia+", "+this.clinica.cidade, 50,85);
  doc.text("Email: "+this.clinica.email, 50, 95);
  doc.text("Cell: "+this.clinica.telefone, 50, 105);
  
  doc.text("Nome do Paciente:", 50, 125);
  doc.text(paciente.nome, 128, 125);
  doc.text("NID:", 250, 125);
  doc.text(paciente.nid+"", 268, 125);
  doc.text("Apelido:", 50, 145);
  doc.text(paciente.apelido, 89, 145);
  doc.text("Data de emissão: ", 250, 145);
  doc.text(dataemisao, 322, 145);*/

  doc.setFillColor(50,50,50);
  doc.rect ( 50, 170 , 40 , 20 ); 
  doc.rect (  50, 190 , 40 , 320 ); 

  doc.rect (  90, 170 , 150 , 20 ); 
  doc.rect (  90, 190 , 150 , 320 );

  doc.rect (  240, 170 , 50 , 20 ); 
  doc.rect (  240, 190 , 50 , 320 );

  doc.rect (  290, 170 , 60 , 20 ); 
  doc.rect (  290, 190 , 60 , 320 );

  doc.rect (  350, 170 , 50 , 20 ); 
  doc.rect (  350, 190 , 50 , 320);

  doc.rect ( 290, 510 , 110 , 20 );

  doc.setFontStyle("bold");
  doc.text("Item", 60, 180);
  doc.text("Descrição", 120, 180);
  doc.text("Quantd", 245, 180);
  doc.text("Preço Unit", 295, 180);
  doc.text("Preç Tot", 355, 180);

  
  doc.text("Total: "+preco_total.toFixed(2).replace(".",",")+" MZN", 293, 525);
  //  doc.text("FICHA DE PAGAMENTO", 165, 90);

  doc.save(nome+ id +'.pdf'); 
}
  
  }