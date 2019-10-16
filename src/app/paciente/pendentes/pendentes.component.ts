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

@Component({
  selector: 'app-pendentes',
  templateUrl: './pendentes.component.html',
  styleUrls: ['./pendentes.component.scss']
})
export class PendentesComponent implements OnInit {
 


  consultas: Consulta[];
 


  dataSourse: MatTableDataSource<Consulta>;
  displayedColumns = ['nid','apelido', 'nome', 'diagnosticos_aux', 'valor_pagar' ,'status','imprimir', 'faturar'];
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  clinica: Clinica = new Clinica();
  faturacao: Faturacao;

  nrscotacao: NrCotacao[];
  nr_cotacao = 0;
  nrsfaturcao: NrFatura[];
  nr_fatura = 0;

  constructor(public dialog: MatDialog, public authService: AuthService, public configServices:ConfiguracoesService,
    private pacienteService: PacienteService,public snackBar: MatSnackBar) { }

    ngOnInit() {
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
      this.dataSourse.paginator = this.paginator;
      this.dataSourse.sort = this.sort;
    })
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
        this.faturacao.consulta = consulta;
        this.faturacao.diagnostico_aux = consulta.diagnosticos_aux;
        
        this.faturacao.mes = this.getMes(+new Date().getMonth()+ +1);
        this.faturacao.ano = new Date().getFullYear();

        this.faturacao.faturador = this.authService.get_perfil + ' - ' + this.authService.get_user_displayName;

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

        if(total>1){
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
          
        }

      }else{
        this.openSnackBar("Ocorreu um erro ao gerar a cotacao. Tente novamente.");
      }
    }else{
      this.openSnackBar("Ocorreu um erro ao gerar a cotacao. Tente novamente.");
    }

  }

  openDialog(consulta: Consulta): void {
    let dialogRef = this.dialog.open(FaturarDialog, {
      width: '700px',
      data: { consulta: consulta, clinica: this.clinica, nr_cotacao: this.nr_cotacao, nr_fatura: this.nr_fatura }
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
      nome = "COT";
    }else{
      nome = "FAT";
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
  //  doc.text("FICHA DE PAGAMENTO", 165, 90);

  doc.save(nome+ id +'.pdf'); 
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
    displayedColumns = ['select', 'nome', 'preco'];
    @ViewChild(MatPaginator) paginator: MatPaginator;
  
    selection = new SelectionModel<DiagnosticoAuxiliar>(true, []);
    
    constructor(  public dialogRef: MatDialogRef<FaturarDialog>, public configServices: ConfiguracoesService,
    @Inject(MAT_DIALOG_DATA) public data: any, public authService:AuthService,
    public pacienteService: PacienteService,  public snackBar: MatSnackBar) {
      
      setTimeout(() => {
        this.consulta = data.consulta;
  
        //Adicionar diagnosticos nao faturados ao array de diagnosticos
        this.consulta.diagnosticos_aux.forEach(element => {
          if(element.faturado != true){
            console.log(element.nome);
            this.diagnosticos_aux.push(element);  
          }
        });
  
        this.clinica = this.data.clinica;
        this.nr_cotacao = this.data.nr_cotacao;
        this.nr_fatura = this.data.nr_fatura;

        this.dataSource = new MatTableDataSource(this.diagnosticos_aux);
        setTimeout(() => this.dataSource.paginator = this.paginator);
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

    faturar(){ 
      let diagnostico_aux2: DiagnosticoAuxiliar[] = [];//Usado para juntar a lista de diagnosticos a serem faturados para sairem no pdf

      let faturacao = new Faturacao();
      //faturacao.categoria = this.consulta.tipo;
      
      faturacao.categoria = "DIAGNOSTICO_AUX";
      faturacao.valor = 0;
      faturacao.data = new Date();
      faturacao.consulta = this.consulta;
      //faturacao.diagnostico_aux = consulta.diagnosticos_aux;
      //this.faturacao.diagnostico_aux = this.consultas.
      faturacao.faturador = this.authService.get_perfil + ' - ' + this.authService.get_user_displayName;

      faturacao.mes = this.getMes(+new Date().getMonth()+ +1);
      faturacao.ano = new Date().getFullYear();

      /*if(this.consulta.tipo == "Consulta Medica"){
        this.consulta.status = "Em andamento";
      }else{
        this.consulta.status = "Encerrada";
      }*/

      //Verificar diagnosticos selecionados na tabela
      this.dataSource.data.forEach(row => {
        //console.log(row.nome+" selecionado ? "+  this.selection.isSelected(row))

        //Atualizar os diagnosticos selecionados para faturados
        if(this.selection.isSelected(row)){

          this.consulta.diagnosticos_aux.forEach(element => {
            if(row == element){
              element.faturado = true;
              faturacao.valor = +faturacao.valor + +element.preco;
              diagnostico_aux2.push(element);
            }
          });

        } 
      });

      

      
      //Se todos os itens tiverem sido faturados a consulta:
      // encerra se for do tipo Diagnostico
      // ou fica em andamento se for do tipo medica
      console.log("is all selected "+this.isAllSelected())
      if(this.isAllSelected()){
        if(this.consulta.tipo == "Consulta Medica"){
          this.consulta.status = "Em andamento";
        }else{
          this.consulta.status = "Encerrada";
        }
      }else{
        //se nao forem faturados todos os diagnosticos entao o status da consulta nao muda
        console.log("NAO ALTEROU O STATUS DA CONSULTA")
        this.consulta.status = "Diagnostico";
      }

      //Guardar as informacoes na base de dados
      //faturacao
      let data = Object.assign({},faturacao);
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
      })
      
      
    }//FIM DO METODO FATURAR



    /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
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

  openSnackBarr(mensagem) {
    this.snackBar.open(mensagem, null,{
      duration: 2000
    })
  }



  //GERAR PDFS
  public downloadPDF(diagnosticos :DiagnosticoAuxiliar[], paciente: Paciente, categoria){// criacao do pdf

    let nome = "";
    if(categoria == 'Cotacao'){
      nome = "COT";
    }else{
      nome = "FAT";
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
  //  doc.text("FICHA DE PAGAMENTO", 165, 90);

  doc.save(nome+ id +'.pdf'); 
}
  
  }