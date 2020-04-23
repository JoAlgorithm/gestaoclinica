import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatSort, MatSnackBar, MatDialog } from '@angular/material';
import { Conta } from '../../classes/conta';
import { PacienteService } from '../../services/paciente.service';
import { ConfiguracoesService } from '../../services/configuracoes.service';
import * as jsPDF from 'jspdf';
import { Clinica } from '../../classes/clinica';
import 'rxjs/add/operator/take';

@Component({
  selector: 'app-conta-recebida',
  templateUrl: './conta-recebida.component.html',
  styleUrls: ['./conta-recebida.component.scss']
})
export class ContaRecebidaComponent implements OnInit {

  anos = [];
  ano:string = (new Date()).getFullYear()+"";

  contas: Conta[] = [];

  clinica?: Clinica = new Clinica(); 

  dataSourse: MatTableDataSource<Conta>;
  displayedColumns = ['fatura','data', 'valor_total', 'seguradora', 'paciente', 'servico', 'fpagamento', 'imprimir'];
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  
  formas_pagamento = [
    {value: 'Todas', viewValue: 'Todas'},
    {value: 'Cartão de crédito', viewValue: 'Cartão de crédito'},
    {value: 'Convênio', viewValue: 'Convênio'},
    {value: 'Numerário', viewValue: 'Numerário'},
  ]
  forma_pagamento = this.formas_pagamento[0].value;
  
  constructor(private pacienteService: PacienteService, private configService: ConfiguracoesService, public snackBar: MatSnackBar,
    public dialog: MatDialog) { }

  ngOnInit() {


    setTimeout(() => {
      //ANOS
      this.configService.getAnos().snapshotChanges().subscribe(data => {
        this.anos = data.map(e => {
          return {
            id: e.payload.key
          }
        })
      })

      //CONTAS
      this.pacienteService.getContasRecebidas(this.ano).snapshotChanges().subscribe(data => {
        this.contas = data.map(e => {
          return {
            id: e.payload.key,
            ...e.payload.val(),
          } as Conta;
        })

        this.dataSourse=new MatTableDataSource(this.contas.sort((a, b) => +b.id - +a.id));
        this.dataSourse.paginator = this.paginator;
        this.dataSourse.sort = this.sort      

        if(this.contas.length <= 0){
          this.openSnackBar("Nao existe nenhuma conta recebida em "+this.ano);
        }
      })

      this.configService.getClinica().valueChanges()
        .take(1)
        .subscribe(c => {
          this.clinica = c;
      })

    })//Fim do timeOut
    
  }

  mudarFPagamento(){

  }

  onSelect(ano, forma_pagamento){
    this.contas = [];
    this.pacienteService.getContasRecebidas(ano).snapshotChanges().subscribe(data => {
      this.contas = data.map(e => {
        return {
          id: e.payload.key,
          ...e.payload.val(),
        } as Conta;
      })

         

      if(this.contas.length <= 0){
        this.openSnackBar("Nao existe nenhuma conta recebida em "+this.ano);
      }else{
        if(forma_pagamento !== "Todas"){

          this.contas.forEach(element => {

            if(element.forma_pagamento !== forma_pagamento){
              this.contas = this.contas.filter(obj => obj !== element); //Remover obejto do array
            }
  
          });

        }
      }

      this.dataSourse=new MatTableDataSource(this.contas.sort((a, b) => +b.id - +a.id));
      this.dataSourse.paginator = this.paginator;
      this.dataSourse.sort = this.sort   
    })
  }

  openSnackBar(mensagem) {
    this.snackBar.open(mensagem, null,{
      duration: 2000
    })
  }

  imprimir(conta: Conta, nome){

    this.openSnackBar("Processando segunda via do recibo: "+conta.id);

    let doc = new jsPDF({
      orientation: 'p',
      unit: 'px',
      format: 'a4',
      putOnlyUsedFonts:true,
    });
  
    let specialElementHandlers ={
      '#editor': function(element,renderer){return true;} 
    }
    //let dia = new Date().getDate();
    //let mes = +(new Date().getMonth()) + +1;
    //let ano = new Date().getFullYear();
    //let dataemisao = dia +"/"+mes+"/"+ano;  
  
    if(this.clinica.logo_pdf){
      var img = new Image();
      img.src ="../../../assets/images/1 - logo - vitalle.jpg"; 
      doc.addImage(img,"PNG", 300, 40,90, 90);
    }
    
  
    doc.setFont("Courier");
    doc.setFontStyle("normal"); 
    doc.setFontSize(12);
    doc.text(conta.id+"", 225, 40);
    let item = 1;
    let preco_total = 0;
    let linha = 200;                      
    conta.linhas.forEach(element => {
      doc.text(item+"", 55, linha) //item
      doc.text(element.qtd_solicitada+"", 257, linha) //quantidade


      let string1 = "";
      let string2 = "";
      let string3 = "";
      let linhaAlternativo = 0;
      let linhaAlternativo2 = 0;
      if(element.descricao_servico.length > 26 && element.descricao_servico.length > 52){
        string1 = element.descricao_servico.substr(0,26);
        string2 = element.descricao_servico.substr(26, 26).trim();
        string3 = element.descricao_servico.substr(52, +element.descricao_servico.length).trim();

        linhaAlternativo = +linha+ +20;
        linhaAlternativo2 =  +linha+ +40;

        doc.text(string1 , 95, linha) //descricao
        doc.text(string2 , 95, linhaAlternativo) //descricao
        doc.text(string3 , 95, linhaAlternativo2) //descricao

      }else if(element.descricao_servico.length > 26){
        string1 = element.descricao_servico.substr(0,26);
        string2 = element.descricao_servico.substr(26, +element.descricao_servico.length).trim();

        linhaAlternativo = +linha+ +20;

        doc.text(string1 , 95, linha) //descricao
        doc.text(string2 , 95, linhaAlternativo) //descricao
      }else{
        doc.text(element.descricao_servico , 95, linha) //descricao
      }

      //doc.text(element.descricao_servico , 95, linha) //descricao


      doc.text(element.preco_unitario.toFixed(2).replace(".",",")+"", 294, linha)
      doc.text((element.preco_unitario*element.qtd_solicitada).toFixed(2).replace(".",",")+"", 354, linha)
    
      preco_total = +preco_total + +element.preco_unitario*element.qtd_solicitada;

      item = +item + +1;

      if(linhaAlternativo > 0 && linhaAlternativo2 > 0){
        linha = +linha + +60;
      }else if(linhaAlternativo > 0){
        linha = +linha + +40;
      }else{
        linha = +linha + +20;
      }
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
    doc.text(this.clinica.endereco+"", 50, 65);
    doc.text(this.clinica.provincia+", "+this.clinica.cidade, 50,75);
    doc.text("Email: "+this.clinica.email, 50, 85);
    doc.text("Cell: "+this.clinica.telefone, 50, 95);
    doc.text("NUIT: "+this.clinica.nuit, 50, 105);
    
    doc.text("Nome do Paciente: "+conta.cliente_nome, 50, 125);
    doc.text("NID: "+conta.cliente_nid, 250, 125);
    doc.text("Apelido: "+conta.cliente_apelido, 50, 145);
    doc.text("Data de emissão: "+conta.data, 250, 145);
    let n = conta.cliente_nuit ? conta.cliente_nuit : "";
    doc.text("NUIT do paciente: "+n, 50, 165);
  
    doc.setFillColor(50,50,50);
    
    /*doc.text("Nome do Paciente:", 50, 125);
    doc.text(conta.cliente_nome, 128, 125);
    doc.text("NID:", 250, 125);
    doc.text(conta.cliente_nid+"", 268, 125);
    doc.text("Apelido:", 50, 145);
    doc.text(conta.cliente_apelido, 89, 145);
    doc.text("Data de emissão: ", 250, 145);
    doc.text(conta.data, 322, 145);
    doc.text("NUIT do paciente:"+conta.cliente_nuit, 50, 165);*/
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
  
    doc.save(nome+ conta.id +'.pdf'); 
  }

}
