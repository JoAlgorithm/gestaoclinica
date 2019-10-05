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

  faturacao: Faturacao;

  constructor(public dialog: MatDialog, public authService: AuthService, public configServices:ConfiguracoesService,
    private pacienteService: PacienteService,public snackBar: MatSnackBar) { }

    ngOnInit() {
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

  faturarDiagnostico(consulta: Consulta){

    this.faturacao = new Faturacao();
    this.faturacao.categoria = "DIAGNOSTICO_AUX";
    this.faturacao.valor = consulta.preco_diagnosticos;
    this.faturacao.data = new Date();
    this.faturacao.consulta = consulta;
    this.faturacao.diagnostico_aux = consulta.diagnosticos_aux;
    
    this.faturacao.mes = this.getMes(+new Date().getMonth()+ +1);
    this.faturacao.ano = new Date().getFullYear();

    console.log("Faturacao mes "+this.faturacao.mes+" ano "+this.faturacao.ano)
    //console.log("NEW DATE Month: "+(+data.getFullYear()))
    //this.faturacao.diagnostico_aux = this.consultas.
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
      console.log("mais de 1")
      this.openDialog(consulta);
      

    }else{
      //Um diagnostico apenas
      //console.log("apenas de 1")

      //O array de diagnosticos pode ter mais de um diagnosticos apesar de ter apenas 1 a ser faturado
      // por isso temos que fazer loop para achar o nao faturado
      consulta.diagnosticos_aux.forEach(element => {
        if(element.faturado != true){
          
          element.faturado = true;
          console.log("consulta id: "+consulta.id)
          console.log("diagnostico faturado id: " + element.nome + " - "+element.faturado)
          
          //faturacao
          let data = Object.assign({}, this.faturacao);
          let d = Object.assign({}, consulta); 

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
          /*.catch( err => {
            console.log("ERRO: " + err.message)
          });*/

        }
      });
      
      
    }

  }

  openDialog(consulta: Consulta): void {
    let dialogRef = this.dialog.open(FaturarDialog, {
      width: '700px',
      data: { consulta: consulta }
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



  @ViewChild('content1') content1: ElementRef;
  @ViewChild('content2') content2: ElementRef;
  @ViewChild('content3') content3: ElementRef;
  @ViewChild('content4') content4: ElementRef;
  @ViewChild('content5') content5: ElementRef;
  @ViewChild('content6') content6: ElementRef;
  public downloadPDF(diagnosticos :DiagnosticoAuxiliar[]){// criacao do pdf
    let doc = new jsPDF({
      orientation: 'p',
      unit: 'px',
      format: 'a4',
      putOnlyUsedFonts:true,
    });
  
    let specialElementHandlers ={
      '#editor': function(element,renderer){return true;} 
    }
    /*let content1 = this.content1.nativeElement; 
    let content2 = this.content2.nativeElement;  
    let content3 = this.content3.nativeElement; 
    let content4 = this.content4.nativeElement; 
    let content5 = this.content5.nativeElement; 
    let content6 = this.content6.nativeElement; 
    doc.setFont("Courier");
    doc.setFontStyle("normal"); 
    doc.setFontSize(12);

    doc.fromHTML(content1.innerHTML, 125, 112,{
    'width':100,
      'elementHandlers': specialElementHandlers,
    });
    doc.fromHTML(content2.innerHTML, 340, 112,{
      'width':100,
      'elementHandlers': specialElementHandlers,
    });
    doc.fromHTML(content3.innerHTML, 85, 132,{
      'width':100,
      'elementHandlers': specialElementHandlers,
    });*/

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
      doc.text(element.preco , 294, linha)
      doc.text(element.preco , 354, linha)

      preco_total = +preco_total + +element.preco;
      item = +item + +1;
      linha = +linha + +20
    });
    doc.text(preco_total+" MZN"  , 355, 525) //descricao        

    doc.setFont("Courier");
    doc.setFontStyle("normal"); 
    doc.setFontSize(10);
    var img = new Image();
      
    // img.src ="../../../assets/images/medical-center-logo-design.jpg"; 
    //  img.src =this.clinica.logo_pdf; 
    //doc.convertBase64ToBinaryString(this.clinica.logo_pdf);
    // img.src =this.clinica.logo_pdf; 
    // doc.addImage(img,"PNG", 50, 10,90, 90);
  

    doc.text("Processado pelo computador", 170, 580);
    // doc.text("CENTRO MEDICO VITALLE", 165, 75);
    doc.text("AV.Principal N° 1- Cidade Baixa ", 50, 75);
    doc.text("Nampula,Nacala-Porto ", 50,85);
    doc.text("E-mail: manuelacacio40@gmail.com", 50, 95);
    doc.text("Cell: 842008104", 50, 105);
    
    doc.text("Nome do Paciente:", 50, 125);

    doc.text("NID:", 320, 125);
    doc.text("Apelido:", 50, 145);
    doc.text("Data de emissão: ", 280, 145);
    doc.setFillColor(50,50,50);
    doc.rect ( 50, 170 , 40 , 40 ); 
    doc.rect (  50, 190 , 40 , 40 ); 
    doc.rect ( 50, 210 , 40 , 40 ); 
    doc.rect (  50, 230 , 40 , 40 ); 
    doc.rect ( 50, 250 , 40 , 40 ); 
    doc.rect (  50, 270 , 40 , 40 ); 
    doc.rect ( 50, 290, 40 , 40 ); 
    doc.rect (  50, 310 , 40 , 40 ); 
    doc.rect ( 50, 330 , 40 , 40 ); 
    doc.rect (  50, 350 , 40 , 40 ); 
    doc.rect ( 50, 370 , 40 , 40 ); 
    doc.rect (  50, 390 , 40 , 40 ); 
    doc.rect ( 50, 410 , 40 , 40 ); 
    doc.rect (  50, 430 , 40 , 40 ); 
    doc.rect ( 50, 450, 40 , 40 ); 
    doc.rect (  50, 470 , 40 , 40 ); 

    doc.rect (  90, 170 , 150 , 40 ); 
    doc.rect (  90, 190 , 150 , 40 );
    doc.rect ( 90, 210 , 150 , 40 ); 
    doc.rect (  90, 230 , 150, 40 ); 
    doc.rect ( 90, 250 , 150, 40 ); 
    doc.rect (  90, 270 , 150 , 40 ); 
    doc.rect ( 90, 290, 150, 40 ); 
    doc.rect (  90, 310 , 150 , 40 ); 
    doc.rect ( 90, 330 , 150 , 40 ); 
    doc.rect (  90, 350 , 150 , 40 ); 
    doc.rect ( 90, 370 , 150, 40 ); 
    doc.rect (  90, 390 , 150, 40 ); 
    doc.rect ( 90, 410 , 150, 40 ); 
    doc.rect (  90, 430 , 150 , 40 ); 
    doc.rect ( 90, 450, 150 , 40 ); 
    doc.rect (  90, 470 , 150 , 40 ); 

    doc.rect (  240, 170 , 50 , 40 ); 
    doc.rect (  240, 190 , 50 , 40 );
    doc.rect ( 240, 210 , 50 , 40 ); 
    doc.rect (  240, 230 , 50 , 40 ); 
    doc.rect ( 240, 250 , 50 , 40 ); 
    doc.rect (  240, 270 , 50 , 40 ); 
    doc.rect ( 240, 290, 50 , 40 ); 
    doc.rect (  240, 310 , 50 , 40 ); 
    doc.rect ( 240, 330 , 50 , 40 ); 
    doc.rect (  240, 350 , 50 , 40 ); 
    doc.rect ( 240, 370 , 50 , 40 ); 
    doc.rect (  240, 390 , 50 , 40 ); 
    doc.rect ( 240, 410 , 50 , 40 ); 
    doc.rect (  240, 430 , 50 , 40 ); 
    doc.rect ( 240, 450, 50 , 40 ); 
    doc.rect (  240, 470 , 50 , 40 ); 

    doc.rect (  290, 170 , 60 , 40 ); 
    doc.rect (  290, 190 , 60 , 40 );
    doc.rect ( 290, 210 , 60 , 40 ); 
    doc.rect (  290, 230 , 60 , 40 ); 
    doc.rect ( 290, 250 , 60 , 40 ); 
    doc.rect (  290, 270 , 60 , 40 ); 
    doc.rect ( 290, 290, 60 , 40 ); 
    doc.rect (  290, 310 , 60 , 40 ); 
    doc.rect ( 290, 330 , 60 , 40 ); 
    doc.rect (  290, 350 , 60 , 40 ); 
    doc.rect ( 290, 370 , 60 , 40 ); 
    doc.rect (  290, 390 , 60 , 40 ); 
    doc.rect ( 290, 410 , 60 , 40 ); 
    doc.rect (  290, 430 , 60 , 40 ); 
    doc.rect ( 290, 450, 60 , 40 ); 
    doc.rect (  290, 470 , 60 , 40 ); 
    doc.rect (  290, 490 , 60 , 40 ); 

    doc.rect (  350, 170 , 50 , 40 ); 
    doc.rect (  350, 190 , 50 , 40 );
    doc.rect ( 350, 210 , 50 , 40 ); 
    doc.rect (  350, 230 , 50 , 40 ); 
    doc.rect ( 350, 250 , 50 , 40 ); 
    doc.rect (  350, 270 , 50 , 40 ); 
    doc.rect ( 350, 290, 50 , 40 ); 
    doc.rect (  350, 310 , 50 , 40 ); 
    doc.rect ( 350, 330 , 50 , 40 ); 
    doc.rect (  350, 350 , 50 , 40 ); 
    doc.rect ( 350, 370 , 50 , 40 ); 
    doc.rect ( 350, 390 , 50 , 40 ); 
    doc.rect ( 350, 410 , 50 , 40 ); 
    doc.rect (  350, 430 , 50 , 40 ); 
    doc.rect ( 350, 450, 50 , 40 ); 
    doc.rect ( 350, 470 , 50 , 40 ); 
    doc.rect ( 350, 490 , 50 , 40 ); 

    doc.setFontStyle("bold");
    doc.text("Item", 60, 180);
    doc.text("Descrição de Medicamento", 100, 180);
    doc.text("Quantd", 245, 180);
    doc.text("Preço Unit", 295, 180);
    doc.text("Preç Tot", 355, 180);
    doc.text("Total:", 295, 525);
    //  doc.text("FICHA DE PAGAMENTO", 165, 90);
    doc.save('Recebo.pdf');  
}



}



//DIALOG FATURAR MAIS DE UM DIAGNOSTICO AUX -----------------------------------------------------
@Component({
  selector: 'faturar-consulta-dialog',
  templateUrl: 'faturar-diagnostico.html',
  })
  export class FaturarDialog {

    consulta: Consulta;
    diagnosticos_aux: DiagnosticoAuxiliar[] = [];
    dataSource: MatTableDataSource<DiagnosticoAuxiliar>;
    displayedColumns = ['select', 'nome', 'preco'];
    @ViewChild(MatPaginator) paginator: MatPaginator;
  
    selection = new SelectionModel<DiagnosticoAuxiliar>(true, []);
    
    constructor(  public dialogRef: MatDialogRef<FaturarDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any, public authService:AuthService,
    public pacienteService: PacienteService,  public snackBar: MatSnackBar) {
      
      setTimeout(() => {
        this.consulta = data.consulta;
        console.log("consulta "+this.consulta.marcador);
  
        //Adicionar diagnosticos nao faturados ao array de diagnosticos
        this.consulta.diagnosticos_aux.forEach(element => {
          if(element.faturado != true){
            console.log(element.nome);
            this.diagnosticos_aux.push(element);  
          }
        });
  
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
          console.log("Alterou status da consulta para Em andamento")
          this.consulta.status = "Em andamento";
        }else{
          console.log("Alterou status da consulta para Encerrada")
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
  
  }