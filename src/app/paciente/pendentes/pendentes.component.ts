import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { Paciente } from '../../classes/paciente';
import { MatTableDataSource, MatPaginator, MatSort, MatSnackBar, MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material';
import { ConfiguracoesService } from '../../services/configuracoes.service';
import { PacienteService } from '../../services/paciente.service';
import { AuthService } from '../../services/auth.service';
import { Consulta } from '../../classes/consulta';
import { Faturacao } from '../../classes/faturacao';
import { DiagnosticoAuxiliar } from '../../classes/diagnostico_aux';
import { SelectionModel } from '@angular/cdk/collections';

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
      this.pacienteService.getConsultas().subscribe(data => {
        this.consultas = data.map(e => {
          return {
            id: e.payload.doc.id,
            paciente: e.payload.doc.data()['paciente'] as Paciente,
            ...e.payload.doc.data(),
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
            
          }).catch( err => {
            console.log("ERRO: " + err.message)
          });

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
        
      }).catch( err => {
        console.log("ERRO: " + err.message)
      });
      
      
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