import { Component, OnInit, ViewChild } from '@angular/core';
import { Deposito } from '../../classes/deposito';
import { EstoqueService } from '../../services/estoque.service';
import { Medicamento } from '../../classes/medicamento';
import { MatTableDataSource, MatPaginator, MatSort, MatSnackBar } from '@angular/material';
//import { CommonModule, CurrencyPipe} from '@angular/common';
import * as jsPDF from 'jspdf';
import 'rxjs/add/operator/take';
import { ConfiguracoesService } from '../../services/configuracoes.service';
import { Clinica } from '../../classes/clinica';

@Component({
  selector: 'app-gestao',
  templateUrl: './gestao.component.html',
  styleUrls: ['./gestao.component.scss']
})
export class GestaoComponent implements OnInit {

  depositos: Deposito[];
  deposito: Deposito;
  medicamentos: Medicamento[] = [];
  medicamentos_aux: Medicamento[] = [];

  dataSourse: MatTableDataSource<Medicamento>;
  displayedColumns = ['codigo','nome', 'min',  'qtd_disponivel', 'valor_unitario', 'valor_total', 'nivel', 'sugestao'];
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  clinica: Clinica;

  habilitar_impressao: boolean = true;

  constructor(private estoqueService: EstoqueService, public snackBar: MatSnackBar, public configServices: ConfiguracoesService
    //, private currencyPipe : CurrencyPipe
    ) { 
    this.deposito = new Deposito();
  }


  ngOnInit() {
    this.estoqueService.getDepositos().snapshotChanges().subscribe(data => {
      this.depositos = data.map(e => {
        return {
          id: e.payload.key,
          medicamentos: e.payload.val()['medicamentos'] as Medicamento[],
          ...e.payload.val(),
        } as Deposito;
      })

      if(this.depositos[0]){
        this.deposito = this.depositos[0];
        this.medicamentos = this.depositos[0].medicamentos;

       

      //transformAmount(element){
        //this.formattedAmount = this.currencyPipe.transform(this.deposito.valor_total, '$');
    
        //element.target.value = this.formattedAmount;
      //}

      }

      this.medicamentos = [];
      if(this.deposito.medicamentos){

        Object.keys(this.deposito.medicamentos).forEach(key=>{
          this.medicamentos.push(this.deposito.medicamentos[key]);

        })

        this.medicamentos.forEach(element => {
          
          //console.log("element.un "+element.un.nome);

          if(element.min){
            if(element.qtd_disponivel == 0){
              element.nivel = "Zerado";
              element.sugestao = "Repor urgente";
            }else if(element.qtd_disponivel >= element.min){
              element.nivel = ">= Min";
              element.sugestao = "Estoque aceitavel";
            }else if(element.min > 0){
              element.nivel = "< Min";
              element.sugestao = "Repor";
            }else{
              element.sugestao = "Definir min";
            }
          }else{
            element.sugestao = "Definir min";
          }
        });

        

        this.dataSourse=new MatTableDataSource(this.medicamentos);
        this.dataSourse.paginator = this.paginator;
        this.dataSourse.sort = this.sort;
  
        this.habilitar_impressao = false;
      }else{
        this.medicamentos = [];
        this.dataSourse=new MatTableDataSource(this.medicamentos);
        this.dataSourse.paginator = this.paginator;
        this.dataSourse.sort = this.sort
        this.openSnackBar("Deposito sem medicamentos. Contacte o Admnistrativo");
      }
      
    })

    this.configServices.getClinica().valueChanges()
    .take(1)
    .subscribe(c => {
      this.clinica = c;
    })

    //this.configServices.getImage();
  }
  
  onSelect(deposito: Deposito){ //Mudar de deposito
    this.medicamentos = [];
    this.habilitar_impressao = true;
    //this.medicamento = new Medicamento();
    //this.max = 1;
    if(deposito.medicamentos){

      Object.keys(deposito.medicamentos).forEach(key=>{
        this.medicamentos.push(deposito.medicamentos[key]);
      })

      this.medicamentos.forEach(element => {
        if(element.min){
          if(element.qtd_disponivel == 0){
            element.nivel = "Zerado";
            element.sugestao = "Repor urgente";
          }else if(element.qtd_disponivel >= element.min){
            element.nivel = ">= Min";
            element.sugestao = "Estoque aceitavel";
          }else if(element.min > 0){
            element.nivel = "< Min";
            element.sugestao = "Repor";
          }else{
            element.sugestao = "Definir min";
          }
        }else{
          element.sugestao = "Definir min";
        }
      });

      this.dataSourse=new MatTableDataSource(this.medicamentos);
      this.dataSourse.paginator = this.paginator;
      this.dataSourse.sort = this.sort

      this.habilitar_impressao = false;
    }else{
      this.medicamentos = [];
      this.dataSourse=new MatTableDataSource(this.medicamentos);
      this.dataSourse.paginator = this.paginator;
      this.dataSourse.sort = this.sort
      this.openSnackBar("Deposito sem medicamentos. Contacte o Admnistrativo");
    }
  }

  openSnackBar(mensagem) {
    this.snackBar.open(mensagem, null,{
      duration: 3000
    })
  }

  
  dia = new Date().getDate();
  mes = this.getMes(+(new Date().getMonth()) + +1);
  ano = new Date().getFullYear();
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

  imprimir(){

    
    //Tamanho maximo de itens por pagina

    /*let id = 202000001;
    for (var _i = 0; _i < 50000; _i++) {
      let md = new Medicamento();
      md.id = id+"";
      md.nome_comercial = "Artesunato+Sulfametoxipirazina";   
      md.qtd_disponivel = +10000;

      id = +id + 1;
      this.medicamentos_aux.push(md);
    }*/
  

    this.openSnackBar("Processando o inventario");

    let doc = new jsPDF({
      orientation: 'p',
      unit: 'px',
      format: 'a4',
      putOnlyUsedFonts:true,
    });

    /*let logo = null;
    //var imgUrl = "https://firebasestorage.googleapis.com/v0/b/gestaoclinica-ed2f7.appspot.com/o/logosclinicas%2F1%20-%20Centro%20Medico%20Vitalle%2F1%20-%20logo%20-%20vitalle.jpg?alt=media&token=4bb93e5d-07d1-4018-903b-b16b28d570b8";
    console.log("this.clinica.logo "+this.clinica.logo);
    var imgUrl = this.clinica.logo;

    getDataUri(imgUrl, function(dataUri) {
        logo = dataUri;
        console.log("logo=" + logo);

        doc.addImage(logo, 'PNG', 300, 40,90, 90);
    });

    function getDataUri(url, cb)
    {
        var image = new Image();
        image.setAttribute('crossOrigin', 'anonymous'); //getting images from external domain

        image.onload = function () {
            var canvas = document.createElement('canvas');
            //canvas.width = this.naturalWidth;
            //canvas.height = this.naturalHeight; 
            canvas.width = 90;
            canvas.height = 90; 

            //next three lines for white background in case png has a transparent background
            var ctx = canvas.getContext('2d');
            ctx.fillStyle = '#fff';  /// set white fill style
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            canvas.getContext('2d').drawImage(image, 0, 0);

            cb(canvas.toDataURL('image/jpeg'));
        };

        image.src = url;
    }*/
  
    

      
   //doc.addImage(logo, 'PNG', 300, 40,90, 90);

    //var img = new Image();
    //img.src ="../../../assets/images/1 - logo - vitalle.jpg"; 
    //doc.addImage(img,"PNG", 300, 40,90, 90);
        
  
                   
   /* conta.linhas.forEach(element => {
      doc.text(item+"", 55, linha) //item
      doc.text(element.qtd_solicitada+"", 257, linha) //quantidade


      let string1 = "";
      let string2 = "";
      let linhaAlternativo = 0;
      if(element.descricao_servico.length > 26){
        string1 = element.descricao_servico.substr(0,26);
        let q = +element.descricao_servico.length - +26;
        string2 = element.descricao_servico.substr(q).toString().trim();

        linhaAlternativo = +linha+ +20;

        doc.text(string1 , 95, linha) //descricao
        doc.text(string2 , 95, linhaAlternativo) //descricao

      }else{
        doc.text(element.descricao_servico , 95, linha) //descricao
      }


      doc.text(element.preco_unitario.toFixed(2).replace(".",",")+"", 294, linha)
      doc.text((element.preco_unitario*element.qtd_solicitada).toFixed(2).replace(".",",")+"", 354, linha)
    
      preco_total = +preco_total + +element.preco_unitario*element.qtd_solicitada;

      item = +item + +1;

      if(linhaAlternativo > 0){
        linha = +linha + +40;
      }else{
        linha = +linha + +20;
      }
    }); */  

    //CABECALHO
    doc.setFont("Courier");
    doc.setFontStyle("normal"); 
    doc.setFontStyle("bold");
    doc.setFontSize(10); 
    doc.text("FICHA DE ESTOQUE", 175, 40); 

    doc.setFont("Courier");
    doc.setFontStyle("bold");
    doc.text(this.deposito.nome.toUpperCase(), 190, 50);

    doc.setFont("Courier");
    doc.setFontStyle("normal"); 
    doc.setFontSize(8);
    

    doc.text("ATUALIZAÇÃO: "+this.dia+"/"+this.mes+"/"+this.ano, 170, 60);
  
    doc.setFont("Courier");
    doc.setFontStyle("normal"); 
    doc.setFontSize(10);
 
    //Tabela
    doc.setFillColor(50,50,50);
    doc.setFontStyle("normal");
 
    doc.rect (20, 70 , 50 , 20 ); 
    doc.rect (20, 90 , 50 , 500 ); 
    doc.text("CODIGO", 22, 82);

    doc.rect (70, 70 , 190 , 20 ); 
    doc.rect (70, 90 , 190 , 500 );
    doc.text("NOME COMERCIAL", 72, 82);    
  
    doc.rect (260, 70 , 70 , 20 ); 
    doc.rect (260, 90 , 70 , 500 );
    doc.text("F.FARMACEUTICA", 262, 82);
    
    doc.rect (330, 70 , 40 , 20 ); 
    doc.rect (330, 90 , 40 , 500 );
    doc.text("U.MEDIDA", 332, 82);
  
    doc.rect (370, 70 , 45 , 20 ); 
    doc.rect (370, 90 , 45 , 500);
    doc.text("QTD STOCK", 372, 82);

    //RODAPE
    let pagina = 1;
    doc.setFontSize(8);
    doc.text("Pág. "+pagina, 370, 615);
    doc.setFontSize(10);
  

    let linha = 100;
    let contagem = 0;
    this.medicamentos.forEach(element => {

      //console.log("element.un "+element.un.nome);
      let cat = element.categoria ? element.categoria.nome : "";

      doc.text(element.nome_comercial+"" , 72, linha);
      doc.text(element.un.nome+"", 332, linha);
      doc.text(cat+"" , 262, linha);
      doc.text(element.qtd_disponivel+"", 372, linha);
      doc.text(element.id+"", 22, linha);

      linha = +linha + 15;
      contagem +=1;

      if(contagem % 33 == 0){
        
        linha = 100;

        doc.addPage({
          orientation: 'p',
          unit: 'px',
          format: 'a4',
          putOnlyUsedFonts:true,
        })

        //CABECALHO
        doc.setFont("Courier");
        doc.setFontStyle("normal"); 
        doc.setFontStyle("bold");
        doc.setFontSize(10); 
        doc.text("FICHA DE ESTOQUE", 175, 40); 

        doc.setFont("Courier");
        doc.setFontStyle("bold");
        doc.text("DEPOSITO 1", 190, 50);

        doc.setFont("Courier");
        doc.setFontStyle("normal"); 
        doc.setFontSize(8);
        doc.text("ATUALIZAÇÃO: "+this.dia+"/"+this.mes+"/"+this.ano, 170, 60);
      
        doc.setFont("Courier");
        doc.setFontStyle("normal"); 
        doc.setFontSize(10);
    
        //Tabela
        doc.setFillColor(50,50,50);
        doc.setFontStyle("normal");
    
        doc.rect (20, 70 , 50 , 20 ); 
        doc.rect (20, 90 , 50 , 500 ); 
        doc.text("CODIGO", 22, 82);

        doc.rect (70, 70 , 190 , 20 ); 
        doc.rect (70, 90 , 190 , 500 );
        doc.text("NOME COMERCIAL", 72, 82);    
      
        doc.rect (260, 70 , 70 , 20 ); 
        doc.rect (260, 90 , 70 , 500 );
        doc.text("F.FARMACEUTICA", 262, 82);
        
        doc.rect (330, 70 , 40 , 20 ); 
        doc.rect (330, 90 , 40 , 500 );
        doc.text("U.MEDIDA", 332, 82);
      
        doc.rect (370, 70 , 45 , 20 ); 
        doc.rect (370, 90 , 45 , 500);
        doc.text("QTD STOCK", 372, 82);
  
        pagina = +pagina + 1;
        doc.setFontSize(8);
        doc.text("Pág. "+pagina, 370, 615);
        doc.setFontSize(10);
      }
    });

    

    /*doc.addPage(
      'a4',
      'p',
    )*/
  
    doc.save('Inventario - '+this.deposito.nome+' - '+this.dia+'/'+this.mes+'/'+this.ano+'.pdf'); 
    //doc.output('Inventario.pdf');
  }



}
