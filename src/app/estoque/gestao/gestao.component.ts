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
import html2canvas from 'html2canvas';
import { TipoEstoque } from '../../classes/tipo_estoque';

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

  tipos_estoque: TipoEstoque[];
  tipo_estoque: TipoEstoque;

  constructor(private estoqueService: EstoqueService, public snackBar: MatSnackBar, public configServices: ConfiguracoesService
    //, private currencyPipe : CurrencyPipe
    ) { 
    this.deposito = new Deposito();
    this.tipo_estoque = new TipoEstoque();
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
      
        this.medicamentos_aux = this.medicamentos;
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

    this.estoqueService.getTiposEstoque().snapshotChanges().subscribe(data => {
      this.tipos_estoque = data.map(e => {
        return {
          id: e.payload.key,
          ...e.payload.val(),
        } as TipoEstoque;
      });
    })

    //this.configServices.getImage();
  }
  
  onSelect(deposito: Deposito){ //Mudar de deposito
    this.medicamentos = [];
    this.tipo_estoque = new TipoEstoque();
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

      this.medicamentos_aux = this.medicamentos;
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

  filtrarCategoria(tipo: TipoEstoque){
    this.habilitar_impressao = true;

    if(this.medicamentos_aux.length > 0){
      //this.medicamentos_aux = this.medicamentos;

      this.medicamentos = null;
      this.medicamentos = this.medicamentos_aux.filter(item => item.tipo.nome.indexOf(tipo.nome+"") > -1);     

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
    //console.log("Get mes "+number)
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
  //console.log("entrou no imprimir")
    
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
    //console.log("this.clinica.logo "+this.clinica.logo);
    var imgUrl = this.clinica.logo;

    getDataUri(imgUrl, function(dataUri) {
        console.log("CHEGOU 2");
        logo = dataUri;
        console.log("chegou logo=" + logo);

        doc.addImage(logo, 'PNG', 100, 40,90, 90);
    });

    function getDataUri(url, cb)
    {
      console.log("CHEGOU 1");
      console.log("url 1 "+url);
        var image = new Image();
        //image.setAttribute('crossOrigin', 'anonymous'); //getting images from external domain
        image.crossOrigin = "Anonymous";

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
            console.log("Finalizou construcao de imagem");
        };

        image.src = url;
        console.log("chegou final 1 "+url);
    }*/
  
    

      
   //doc.addImage(logo, 'PNG', 300, 40,90, 90);

    //var img = new Image();
    //img.src ="../../../assets/images/1 - logo - vitalle.jpg"; 
    //doc.addImage(img,"PNG", 300, 40,90, 90);




   /* var tainted = false;
    var img = new Image,
    canvas = document.createElement("canvas"),
    ctx = canvas.getContext("2d"),
    src = "https://firebasestorage.googleapis.com/v0/b/gestaoclinica-ed2f7.appspot.com/o/logosclinicas%2F1%20-%20Centro%20Medico%20Vitalle%2F1%20-%20logo%20-%20vitalle.jpg?alt=media&token=4bb93e5d-07d1-4018-903b-b16b28d570b8"; // insert image url here

    img.crossOrigin = "Anonymous";

    
    var load_handler = function() {
      canvas.width = 200;
      canvas.height = 200;
      ctx.fillStyle = 'white';
      ctx.font = '15px sans-serif';

      ctx.drawImage( img, 0, 0 );
      
      //ctx.drawImage( this, 0, 0 );

      // for browsers supporting the crossOrigin attribute
      if (tainted) {
      } else {
        // for others
        try {
          canvas.toDataURL();
        } catch (e) {
        }
      }
    };
    var error_handler = function() {
      // remove this onerror listener to avoid an infinite loop
      this.onerror = function() {
        return false
      };
      // certainly that the canvas was tainted
      tainted = true;

      // we need to removeAttribute() since chrome doesn't like the property=undefined way...
      this.removeAttribute('crossorigin');
      this.src = this.src;
    };

    img.onload = load_handler;
    img.onerror = error_handler;
    img.src = src;
    // make sure the load event fires for cached images too
    if ( img.complete || img.complete === undefined ) {
        console.log("Adicionou ")

        img.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
        img.src = src;
        doc.addImage(img+"","PNG", 300, 40,90, 90);
        
        
    }*/

/*
    var urls = 
    ["http://upload.wikimedia.org/wikipedia/commons/4/47/PNG_transparency_demonstration_1.png",
      this.clinica.logo_pdf, 
     "http://lorempixel.com/200/200"];

    var tainted = false;
    var img = new Image();
    img.crossOrigin = 'anonymous';

    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    document.body.appendChild(canvas);

    var load_handler = function() {
      canvas.width = 200;
      canvas.height = 200;
      ctx.fillStyle = 'white';
      ctx.font = '15px sans-serif';

      ctx.drawImage(this, 0, 0, 200, 200*(this.height/this.width));
      
      //ctx.drawImage( this, 0, 0 );

      // for browsers supporting the crossOrigin attribute
      if (tainted) {
      // ctx.strokeText('canvas tainted', 20, 100);
      // ctx.fillText('canvas tainted', 20, 100);
      } else {
        // for others
        try {
          canvas.toDataURL();
        } catch (e) {
          tainted = true;
          ctx.strokeText('canvas tainted after try catch', 20, 100);
          ctx.fillText('canvas tainted after try catch', 20, 100);
        }
      }
    };

    var error_handler = function() {
      // remove this onerror listener to avoid an infinite loop
      this.onerror = function() {
        return false
      };
      // certainly that the canvas was tainted
      tainted = true;

      // we need to removeAttribute() since chrome doesn't like the property=undefined way...
      this.removeAttribute('crossorigin');
      this.src = this.src;
    };

    onclick = function() {
      img.onload = load_handler;
      img.onerror = error_handler;
  
      img.src = urls[0];
  
    //btn.onclick = function() {
      // reset the flag
      tainted = false;
  
      // we need to create a new canvas, or it will keep its marked as tainted flag
      // try to comment the 3 next lines and switch multiple times the src to see what I mean
      ctx = canvas.getContext('2d');
      canvas.parentNode.replaceChild(ctx.canvas, canvas);
      canvas = ctx.canvas;
  
      // reset the attributes and error handler
      img.crossOrigin = 'anonymous';
      img.onerror = error_handler;
      img.src = urls[+!urls.indexOf(img.src)];
    }

    onclick

    

    
    if ( img.complete || img.complete === undefined ) {
 

      //img.src="data:image/jpeg;base64,"+urls[+!urls.indexOf(img.src)];
      //img.src="data:image/jpeg;base64,"+urls[+!urls.indexOf(img.src)].substring(22) 

      //img.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
      //img.src =  urls[+!urls.indexOf(img.src)];
      console.log("img.complete "+img.complete)
      console.log("img.src "+img.src)
      doc.addImage(img,"PNG", 300, 40,90, 90);
    } */

    //var img2 = canvas.toDataURL("image/PNG");
    //doc.addImage(img2, 'PNG', 100, 40,90, 90, undefined, 'FAST');
    //doc.addImage(img2, 'PNG', 100, 40,90, 90);

    //doc.addImage(img, 'PNG', 100, 40,90, 90);
      

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
      doc.text(element.un.nome+"", 332, linha);
      doc.text(cat+"" , 262, linha);
      doc.text(element.qtd_disponivel+"", 372, linha);
      doc.text(element.id+"", 22, linha);

      let string1 = "";
      let string2 = "";
      let string3 = "";
      let linhaAlternativo = 0;
      let linhaAlternativo2 = 0;
      let cp = element.composicao ? " - "+element.composicao : "";
      let nome = element.nome_generico+" - "+element.nome_comercial+cp;
      
      //doc.text(element.nome_comercial+"" , 72, linha);
      if(nome.length > 40 && nome.length > 80){
        string1 = nome.substr(0,40);
        string2 = nome.substr(40, 40).trim();
        string3 = nome.substr(40, +nome.length).trim();
  
        linhaAlternativo = +linha+ +20;
        linhaAlternativo2 =  +linha+ +40;
  
        doc.text(string1 , 72, linha) //descricao
        doc.text(string2 , 72, linhaAlternativo) //descricao
        doc.text(string3 , 72, linhaAlternativo2) //descricao

      }if(nome.length > 40){
        string1 = nome.substr(0,40);
        string2 = nome.substr(40, +nome.length).trim();
  
        linhaAlternativo = +linha+ +20;
  
        doc.text(string1 , 72, linha) //descricao
        doc.text(string2 , 72, linhaAlternativo) //descricao
  
      }else{
        doc.text(nome , 72, linha) //descricao
      }


      //linha = +linha + 15;
      //contagem +=1;

      if(linhaAlternativo > 0 && linhaAlternativo2 > 0){
        linha = +linha + 45;
        contagem +=3;
      }else if(linhaAlternativo > 0){
        linha = +linha + 30;
        contagem +=2;
      }else{
        linha = +linha + 15;
        contagem +=1;
      }

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
