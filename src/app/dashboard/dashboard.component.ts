import { Component, AfterViewInit, ViewChild } from '@angular/core';
import { PacienteService } from '../services/paciente.service';
import { Paciente } from '../classes/paciente';
import { ConfiguracoesService } from '../services/configuracoes.service';
import { DiagnosticoAuxiliar } from '../classes/diagnostico_aux';
import { Consulta } from '../classes/consulta';
import { Faturacao } from '../classes/faturacao';
import { MatTableDataSource, MatPaginator, MatSort, MatSnackBar } from '@angular/material';
import { OnInit} from '@angular/core';
import { Inject} from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';

import * as jsPDF from 'jspdf';
import { format } from 'util';
//import { format } from 'path';

import * as FusionCharts from 'fusioncharts';
import { AuthService } from '../services/auth.service';

@Component({
  //selector: 'app-dashboard',
  selector: 'dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {

  perfil = "";
  acesso_indicadores = false;
  username = "";

  pacientes: Paciente[];
  diagnosticos: DiagnosticoAuxiliar[];
  consultas: Consulta[];
  consultas_encerradas_medicas: any; //Consultas medicas pendentes do tipo Consulta Medica
  consultas_encerradas_diagnosticos: any; //Consultas medicas pendentes do tipo Diagnostico Aux
  consultas_encerradas_condutas: any; //Consultas medicas pendentes do tipo Conduta clinica
  pieChartLabels: String[] = [];
  pieChartDatas: any[] = [];
  faturacoes: Faturacao[];


  //ComboChartData: Array <any>;

  jan_consulta_nr = 0;
  jan_consulta_valor = 0;
  fev_consulta_nr = 0;
  fev_consulta_valor = 0;
  marc_consulta_nr = 0;
  marc_consulta_valor = 0;
  abril_consulta_nr = 0;
  abril_consulta_valor = 0;
  maio_consulta_nr = 0;
  maio_consulta_valor = 0;
  junho_consulta_nr = 0;
  junho_consulta_valor = 0;
  julh_consulta_nr = 0;
  julh_consulta_valor = 0;
  agos_consulta_nr = 0;
  agos_consulta_valor = 0;
  set_consulta_nr = 0;
  set_consulta_valor = 0;
  out_consulta_nr = 0;
  out_consulta_valor = 0;
  nov_consulta_nr = 0;
  nov_consulta_valor = 0;
  dez_consulta_nr = 0;
  dez_consulta_valor = 0;
  total_valor = 0 ;

  jan_diagnostico = 0;
  fev_diagnostico = 0;
  marc_diagnostico = 0;
  abril_diagnostico = 0;
  maio_diagnostico = 0;
  junho_diagnostico = 0;
  julh_diagnostico = 0;
  agos_diagnostico = 0;
  set_diagnostico = 0;
  out_diagnostico = 0;
  nov_diagnostico = 0;
  dez_diagnostico = 0;

  anos = [];
  ano:string = (new Date()).getFullYear()+"";

  constructor(private pacienteService: PacienteService, private configService: ConfiguracoesService,
    public authService: AuthService, public dialog: MatDialog){
  }


  ngOnInit() {
    this.perfil = this.authService.get_perfil;
    this.username = this.authService.get_user_displayName;
    if(this.perfil == 'Clinica_Admin'){
      this.acesso_indicadores = true;
    }

    this.configService.getAnos().snapshotChanges().subscribe(data => {
      this.anos = data.map(e => {
        return {
          id: e.payload.key
        }
      })
      /*this.anos.forEach(element => {
        if(element.id == this.ano){
          console.log("Selecionar ano "+element.id)
        }
      });*/
    })

    //let doc = new jsPDF();
    //doc.save("PDF")
    //this.pacienteService.limparConsultas();

    this.pacienteService.getPacientes().snapshotChanges().subscribe(data => {
      this.pacientes = data.map(e => {
        return {
          id: e.payload.key,
          ...e.payload.val(),
        } as Paciente;
      })      
    })

    this.configService.getDiagnosticos().snapshotChanges().subscribe(data => {
      this.diagnosticos = data.map(e => {
        return {
          id: e.payload.key,
          ...e.payload.val(),
        } as DiagnosticoAuxiliar;
      })
    })

    /*this.pacienteService.getConsultas().snapshotChanges().subscribe(data => {
      this.consultas = data.map(e => {
        return {
          id: e.payload.key,
          ...e.payload.val(),
        } as Consulta;
      })
      this.consultas_encerradas_medicas = this.consultas.filter( c => c.status === "Encerrada" && c.tipo == "Consulta Medica").length;
      
      this.consultas_encerradas_diagnosticos = this.consultas.filter( c => c.status === "Encerrada" && c.tipo == "DIAGNOSTICO AUX").length;
      
      this.consultas_encerradas_condutas = this.consultas.filter( c => c.status === "Encerrada" && c.tipo == "CONDUTA CLINICA").length;
      
      this.consultas.filter( c => c.tipo == "Consulta Medica").forEach(element => {
        if(element.diagnosticos_aux){
          if(element.diagnosticos_aux.length>0){
            this.consultas_encerradas_diagnosticos = +this.consultas_encerradas_diagnosticos + +1;
          }
        }
      });

    })*/
    this.pacienteService.getConsultasRelatorio(this.ano).snapshotChanges().subscribe(data => {
      this.consultas = data.map(e => {
        return {
          id: e.payload.key,
          ...e.payload.val(),
        } as Consulta;
      })
      this.consultas_encerradas_medicas = this.consultas.filter( c => c.tipo == "Consulta Medica").length;
      this.consultas_encerradas_diagnosticos = this.consultas.filter( c => c.tipo == "DIAGNOSTICO AUX").length;
      this.consultas_encerradas_condutas = this.consultas.filter( c => c.tipo == "CONDUTA CLINICA").length;

    })

    this.pacienteService.getFaturacoes(this.ano).snapshotChanges().subscribe(data => {
      this.faturacoes = data.map(e => {
        return {
          id: e.payload.key,
          //data: e.payload.val()['data'] as Date,
          ...e.payload.val(),
        } as Faturacao;
      }) 
      
      this.faturacoes.forEach(element => {
        //console.log("Mes: "+ element.mes+" Ano: "+element.ano+" Categoria: "+element.categoria) 
        this.total_valor = +this.total_valor + +element.valor;

        if(element.categoria == "DIAGNOSTICO_AUX"){

          switch(element.mes) { 
            case "Janeiro": { 
              this.jan_diagnostico = +this.jan_diagnostico + +1;
              this.jan_consulta_valor = +this.jan_consulta_valor+ +element.valor;
               break;
            } 
            case "Fevereiro": { 
              this.fev_diagnostico = +this.fev_diagnostico + +1;
              this.fev_consulta_valor = +this.fev_consulta_valor+ +element.valor;
              break;
            } 
            case "Marco": { 
              this.marc_diagnostico = +this.marc_diagnostico + +1;
              this.marc_consulta_valor = +this.marc_consulta_valor+ +element.valor;
              break ; 
            }
            case "Abril": { 
              this.abril_diagnostico = +this.abril_diagnostico + +1;
              this.abril_consulta_valor = +this.abril_consulta_valor+ +element.valor;
              break ; 
            }
            case "Maio": { 
              this.maio_diagnostico = +this.maio_diagnostico + +1;
              this.maio_consulta_valor = +this.maio_consulta_valor+ +element.valor;
              break ; 
            }
            case "Junho": { 
              this.junho_diagnostico = +this.junho_diagnostico + +1;
              this.junho_consulta_valor = +this.junho_consulta_valor+ +element.valor;
              break ; 
            }
            case "Julho": { 
              this.julh_diagnostico = +this.julh_diagnostico + +1;
              this.julh_consulta_valor = +this.julh_consulta_valor+ +element.valor;
              break; 
            }
            case "Agosto": { 
              this.agos_diagnostico = +this.agos_diagnostico + +1;
              this.agos_consulta_valor = +this.agos_consulta_valor+ +element.valor;
              break; 
            }  
            case "Setembro": { 
              this.set_diagnostico = +this.set_diagnostico + +1;
              this.set_consulta_valor = +this.set_consulta_valor+ +element.valor;
              break; 
            }
            case "Outubro": { 
              this.out_diagnostico = +this.out_diagnostico + +1;
              this.out_consulta_valor = +this.out_consulta_valor+ +element.valor;
              break; 
            }
            case "Novembro": { 
              this.nov_diagnostico = +this.nov_diagnostico + +1;
              this.nov_consulta_valor = +this.nov_consulta_valor+ +element.valor;
              break; 
            }
            case "Dezembro": { 
              this.dez_diagnostico = +this.dez_diagnostico + +1;
              this.dez_consulta_valor = +this.dez_consulta_valor+ +element.valor;
              break; 
            }
            default: { 
               //statements; 
               break; 
            } 
         }//Fim switch case 

        }else if(element.categoria == "CONSULTA_MEDICA"){

          switch(element.mes) { 
            case "Janeiro": { 
              this.jan_consulta_nr = +this.jan_consulta_nr + +1;
              this.jan_consulta_valor = +this.jan_consulta_valor+ +element.valor;
               break;
            } 
            case "Fevereiro": { 
              this.fev_consulta_nr = +this.fev_consulta_nr + +1;
              this.fev_consulta_valor = +this.fev_consulta_valor+ +element.valor;
              break;
            } 
            case "Marco": { 
              this.marc_consulta_nr = +this.marc_consulta_nr + +1;
              this.marc_consulta_valor = +this.marc_consulta_valor+ +element.valor;
              break ; 
            }
            case "Abril": { 
              this.abril_consulta_nr = +this.abril_consulta_nr + +1;
              this.abril_consulta_valor = +this.abril_consulta_valor+ +element.valor;
              break ; 
            }
            case "Maio": { 
              this.maio_consulta_nr = +this.maio_consulta_nr + +1;
              this.maio_consulta_valor = +this.maio_consulta_valor+ +element.valor;
              break ; 
            }
            case "Junho": { 
              this.junho_consulta_nr = +this.junho_consulta_nr + +1;
              this.junho_consulta_valor = +this.junho_consulta_valor+ +element.valor;
              break ; 
            }
            case "Julho": { 
              this.julh_consulta_nr = +this.julh_consulta_nr + +1;
              this.julh_consulta_valor = +this.julh_consulta_valor+ +element.valor;
              break; 
            }
            case "Agosto": { 
              this.agos_consulta_nr = +this.agos_consulta_nr + +1;
              this.agos_consulta_valor = +this.agos_consulta_valor+ +element.valor;
              break; 
            }  
            case "Setembro": { 
              this.set_consulta_nr = +this.set_consulta_nr + +1;
              this.set_consulta_valor = +this.set_consulta_valor+ +element.valor;
              break; 
            }
            case "Outubro": { 
              this.out_consulta_nr = +this.out_consulta_nr + +1;
              this.out_consulta_valor = +this.out_consulta_valor+ +element.valor;
              break; 
            }
            case "Novembro": { 
              this.nov_consulta_nr = +this.nov_consulta_nr + +1;
              this.nov_consulta_valor = +this.nov_consulta_valor+ +element.valor;
              break; 
            }
            case "Dezembro": { 
              this.dez_consulta_nr = +this.dez_consulta_nr + +1;
              this.dez_consulta_valor = +this.dez_consulta_valor+ +element.valor;
              break; 
            }
            default: { 
               //statements; 
               break; 
            } 
         }//Fim switch case 
            
        }//Fim if consulta medica
        
      });//Fim do loop

      //Info do grafico de linhas com valores faturados
      this.ComboChartData= [{
        data: [
          this.jan_consulta_valor, 
          this.fev_consulta_valor, 
          this.marc_consulta_valor, 
          this.abril_consulta_valor, 
          this.maio_consulta_valor, 
          this.junho_consulta_valor, 
          this.julh_consulta_valor, 
          this.agos_consulta_valor, 
          this.set_consulta_valor, 
          this.out_consulta_valor, 
          this.nov_consulta_valor, 
          this.dez_consulta_valor
        ],
        label: 'Receita',
        borderWidth: 1,
        type: 'line',
        fill: false
      }, {
        data: [
          this.jan_consulta_nr, 
          this.fev_consulta_nr, 
          this.marc_consulta_nr, 
          this.abril_consulta_nr, 
          this.maio_consulta_nr, 
          this.junho_consulta_nr, 
          this.julh_consulta_nr, 
          this.agos_consulta_nr, 
          this.set_consulta_nr, 
          this.out_consulta_nr, 
          this.nov_consulta_nr, 
          this.dez_consulta_nr
        ],
        label: 'Consultas',
        borderWidth: 1,
        type: 'bar',
      }];


      //Info do grafico de barras
      this.barChartData = [{
        data: [
          this.jan_consulta_nr, 
          this.fev_consulta_nr, 
          this.marc_consulta_nr, 
          this.abril_consulta_nr, 
          this.maio_consulta_nr, 
          this.junho_consulta_nr, 
          this.julh_consulta_nr, 
          this.agos_consulta_nr, 
          this.set_consulta_nr, 
          this.out_consulta_nr, 
          this.nov_consulta_nr, 
          this.dez_consulta_nr
        ],
        label: 'Consulta medica',
        borderWidth: 0
      }, {
        data: [
          this.jan_diagnostico, 
          this.fev_diagnostico, 
          this.marc_diagnostico, 
          this.abril_diagnostico, 
          this.maio_diagnostico, 
          this.junho_diagnostico, 
          this.julh_diagnostico, 
          this.agos_diagnostico, 
          this.set_diagnostico, 
          this.out_diagnostico, 
          this.nov_diagnostico, 
          this.dez_diagnostico
        ],
        label: 'Diagnostico Auxiliar',
        borderWidth: 0
      }];
      
      
    })

    







  }
  Lista_pacientes(paciente){
    const dialogRef = this.dialog.open(DialogOverviewExampleDialog, {
      width: '1000px', 
      
     // data: {nome: paciente.nome}
    });
   
   dialogRef.afterClosed().subscribe(result => {
    console.log('The dialog was closed');
    // this.animal = result;
    
   });
   
  } 

  Lista_conduta(paciente){
    const dialogRef = this.dialog.open(dialogconduta, {
      width: '1000px', 
      
     // data: {nome: paciente.nome}
    });
   
   dialogRef.afterClosed().subscribe(result => {
    console.log('The dialog was closed');
    // this.animal = result;
    
   });
   
  } 

  Lista_consulta(paciente){
    const dialogRef = this.dialog.open(dialogconsultas, {
      width: '1000px', 
      
     // data: {nome: paciente.nome}
    });
   
   dialogRef.afterClosed().subscribe(result => {
    console.log('The dialog was closed');
    // this.animal = result;
    
   });
   
  } 


  Lista_dialogo(paciente){
    const dialogRef = this.dialog.open(dialogdiagnostico, {
      width: '1000px', 
      
     // data: {nome: paciente.nome}
    });
   
   dialogRef.afterClosed().subscribe(result => {
    console.log('The dialog was closed');
    // this.animal = result;
    
   });
   
  } 





  public pieOptions: any = Object.assign({
    responsive: true,
    legend: {
      display: false,
      position: 'bottom'
    },
    elements: {
      arc: {
        borderWidth: 0
      }
    }
  });

   
    barChartType = 'bar';
    // Shared chart options
    globalChartOptions: any = {
      responsive: true,
      legend: {
        display: true,
        position: 'bottom'
      }
    };
    // combo chart
    comboChartLabels: Array <any> = ['Jan', 'Fev', 'Marc', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Sete', 'Out', 'Nov', 'Dez'];
    chartColors: Array <any> = [{ // grey
      backgroundColor: '#7986cb',
      borderColor: '#3f51b5',
      pointBackgroundColor: '#3f51b5',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(148,159,177,0.8)'
    }, { // dark grey
      backgroundColor: '#eeeeee',
      borderColor: '#e0e0e0',
      pointBackgroundColor: '#e0e0e0',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(77,83,96,1)'
    }, { // grey
      backgroundColor: 'rgba(148,159,177,0.2)',
      borderColor: 'rgba(148,159,177,1)',
      pointBackgroundColor: 'rgba(148,159,177,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(148,159,177,0.8)'
    }];
    comboChartLegend = true;
    ComboChartData: Array <any> = [{
      data: [
        this.jan_consulta_valor, 
        this.fev_consulta_valor, 
        this.marc_consulta_valor, 
        this.abril_consulta_valor, 
        this.maio_consulta_valor, 
        this.junho_consulta_valor, 
        this.julh_consulta_valor, 
        this.agos_consulta_valor, 
        this.set_consulta_valor, 
        this.out_consulta_valor, 
        this.nov_consulta_valor, 
        this.dez_consulta_valor
      ],
      label: 'Receita',
      borderWidth: 1,
      type: 'line',
      fill: false
    }, {
      data: [
        this.jan_consulta_nr, 
        this.fev_consulta_nr, 
        this.marc_consulta_nr, 
        this.abril_consulta_nr, 
        this.maio_consulta_nr, 
        this.junho_consulta_nr, 
        this.julh_consulta_nr, 
        this.agos_consulta_nr, 
        this.set_consulta_nr, 
        this.out_consulta_nr, 
        this.nov_consulta_nr, 
        this.dez_consulta_nr
      ],
      label: 'Consultas',
      borderWidth: 1,
      type: 'bar',
    }];
    ComboChartOptions: any = Object.assign({
      animation: false,
      scales: {
        xAxes: [{
          gridLines: {
            color: 'rgba(0,0,0,0.02)',
            zeroLineColor: 'rgba(0,0,0,0.02)'
          }
        }],
        yAxes: [{
          gridLines: {
            color: 'rgba(0,0,0,0.02)',
            zeroLineColor: 'rgba(0,0,0,0.02)'
          },
          ticks: {
            beginAtZero: true,
            suggestedMax: 9,
          }
        }]
      }
    }, this.globalChartOptions);


    // Bar
  barChartLabels: string[] = ['Jan', 'Fev', 'Marc', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Sete', 'Out', 'Nov', 'Dez'];
  //barChartType = 'bar';
  barChartLegend = true;
  barChartData: any[] = [{
    data: [
      this.jan_consulta_nr, 
      this.fev_consulta_nr, 
      this.marc_consulta_nr, 
      this.abril_consulta_nr, 
      this.maio_consulta_nr, 
      this.junho_consulta_nr, 
      this.julh_consulta_nr, 
      this.agos_consulta_nr, 
      this.set_consulta_nr, 
      this.out_consulta_nr, 
      this.nov_consulta_nr, 
      this.dez_consulta_nr
    ],
    label: 'Consulta medica',
    borderWidth: 0
  }, {
    data: [
      this.jan_diagnostico, 
      this.fev_diagnostico, 
      this.marc_diagnostico, 
      this.abril_diagnostico, 
      this.maio_diagnostico, 
      this.junho_diagnostico, 
      this.julh_diagnostico, 
      this.agos_diagnostico, 
      this.set_diagnostico, 
      this.out_diagnostico, 
      this.nov_diagnostico, 
      this.dez_diagnostico
    ],
    label: 'Diagnostico Auxiliar',
    borderWidth: 0
  }];
  barChartOptions: any = Object.assign({
    scaleShowVerticalLines: false,
    tooltips: {
      mode: 'index',
      intersect: false
    },
    responsive: true,
    scales: {
      xAxes: [{
        gridLines: {
          color: 'rgba(0,0,0,0.02)',
          defaultFontColor: 'rgba(0,0,0,0.02)',
          zeroLineColor: 'rgba(0,0,0,0.02)'
        },
        stacked: true,
        ticks: {
          beginAtZero: true
        }
      }],
      yAxes: [{
        gridLines: {
          color: 'rgba(0,0,0,0.02)',
           defaultFontColor: 'rgba(0,0,0,0.02)',
          zeroLineColor: 'rgba(0,0,0,0.02)'
        },
        stacked: true
      }]
    }
  }, this.globalChartOptions);
    


 //Fusion plugin: em avaliacao
 // https://www.fusioncharts.com/dev/getting-started/angular/angular/configure-your-chart-using-angular
 // https://www.fusioncharts.com/download/fusioncharts-suite-xt?framework=js
  stackedColumnData = {
    chart: {
      caption: "Yearly Energy Production Rate",
      subCaption: " Top 5 Developed Countries",
      numbersuffix: " MZN",
      showSum: "1",
      plotToolText:
        "$label produces <b>$dataValue</b> of energy from $seriesName",
      //theme: "Fusion"
    },
    categories: [
      {
        category: [
          {
            label: "Canada"
          },
          {
            label: "China"
          },
          {
            label: "Russia"
          },
          {
            label: "Australia"
          },
          {
            label: "United States"
          },
          {
            label: "France"
          }
        ]
      }
    ],
    dataSet: [
      {
        seriesName: "Coal",
        data: [
          {
            value: "400"
          },
          {
            value: "830"
          },
          {
            value: "500"
          },
          {
            value: "420"
          },
          {
            value: "790"
          },
          {
            value: "380"
          }
        ]
      },
      {
        seriesName: "Hydro",
        data: [
          {
            value: "350"
          },
          {
            value: "620"
          },
          {
            value: "410"
          },
          {
            value: "370"
          },
          {
            value: "720"
          },
          {
            value: "310"
          }
        ]
      },
      {
        seriesName: "Nuclear",
        data: [
          {
            value: "210"
          },
          {
            value: "400"
          },
          {
            value: "450"
          },
          {
            value: "180"
          },
          {
            value: "570"
          },
          {
            value: "270"
          }
        ]
      },
      {
        seriesName: "Gas",
        data: [
          {
            value: "180"
          },
          {
            value: "330"
          },
          {
            value: "230"
          },
          {
            value: "160"
          },
          {
            value: "440"
          },
          {
            value: "350"
          }
        ]
      },
      {
        seriesName: "Oil",
        data: [
          {
            value: "60"
          },
          {
            value: "200"
          },
          {
            value: "200"
          },
          {
            value: "50"
          },
          {
            value: "230"
          },
          {
            value: "150"
          }
        ]
      }
    ]
  }

  exportChart(e){
    FusionCharts.batchExport({
      exportFormat:'pdf'
    })
  }

 

}
export interface DialogData {
  animal: string;
  name: string;
}
@Component({
  selector: 'dialog-overview-example-dialog',
  templateUrl: './paciente.component.html',
})


export class DialogOverviewExampleDialog {
 pacientes: Paciente[];
 
 @ViewChild(MatPaginator) paginator: MatPaginator;
@ViewChild(MatSort) sort: MatSort;
  dataSourse: MatTableDataSource<Paciente>;
  displayedColumns = ['nid','nome','apelido','genero'];

  constructor(
    public dialogRef: MatDialogRef<DialogOverviewExampleDialog>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData, private pacienteService: PacienteService ,public dialog: MatDialog,) {

      this.pacienteService.getPacientes().snapshotChanges().subscribe(data => {
        this.pacientes = data.map(e => {
          return {
            id: e.payload.key,
            ...e.payload.val(),
          } as Paciente;
        })
        this.dataSourse=new MatTableDataSource(this.pacientes.sort((a, b) => a.nid - b.nid));
        this.dataSourse.paginator = this.paginator;
        this.dataSourse.sort = this.sort;
      })

    }
   
    

  onNoClick(): void {
    this.dialogRef.close();
  }
  
  closeModal(){
 
    this.dialogRef.close();
  }

  
  
}

@Component({
  selector: 'dialogconsultas',
  templateUrl: './consulta.component.html',
})


export class dialogconsultas {
  consultas: Consulta[];
  consultas_encerradas_medicas: any;
  ano:string = (new Date()).getFullYear()+"";
 @ViewChild(MatPaginator) paginator: MatPaginator;
@ViewChild(MatSort) sort: MatSort;
  dataSourse: MatTableDataSource<Consulta>;
  displayedColumns = ['categoria','nid','paciente','paciente_apelido','marcador'];

  constructor(
    public dialogRef: MatDialogRef<DialogOverviewExampleDialog>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData, private pacienteService: PacienteService ,public dialog: MatDialog,) {

      this.pacienteService.getConsultasRelatorio(this.ano).snapshotChanges().subscribe(data => {
        this.consultas = data.map(e => {
          return {
            id: e.payload.key,
            ...e.payload.val(),
          } as Consulta;
        })
        this.dataSourse=new MatTableDataSource(this.consultas.filter( c => c.tipo == "Consulta Medica").sort((a, b)  => a.categoria > b.categoria ? 1 : -1));
        this.dataSourse.paginator = this.paginator;
        this.dataSourse.sort = this.sort;
      })
      }
    


    }

    @Component({
      selector: 'dialogdiagnostico',
      templateUrl: './consulta.component.html',
    })
    
    
    export class dialogdiagnostico {
      consultas: Consulta[];
      consultas_encerradas_medicas: any;
      ano:string = (new Date()).getFullYear()+"";
     @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;
      dataSourse: MatTableDataSource<Consulta>;
      displayedColumns = ['categoria','nid','paciente','paciente_apelido','marcador'];
    
      constructor(
        public dialogRef: MatDialogRef<DialogOverviewExampleDialog>,
        @Inject(MAT_DIALOG_DATA) public data: DialogData, private pacienteService: PacienteService ,public dialog: MatDialog,) {
    
          this.pacienteService.getConsultasRelatorio(this.ano).snapshotChanges().subscribe(data => {
            this.consultas = data.map(e => {
              return {
                id: e.payload.key,
                ...e.payload.val(),
              } as Consulta;
            })
            this.dataSourse=new MatTableDataSource(this.consultas.filter( c => c.tipo == "DIAGNOSTICO AUX").sort((a, b)  => a.categoria > b.categoria ? 1 : -1));
            this.dataSourse.paginator = this.paginator;
            this.dataSourse.sort = this.sort;
          })
          }
        
        }


        @Component({
          selector: 'dialogconduta',
          templateUrl: './conduta.component.html',
        })
        
        
        export class dialogconduta {
          consultas: Consulta[];
          consultas_encerradas_medicas: any;
          ano:string = (new Date()).getFullYear()+"";
         @ViewChild(MatPaginator) paginator: MatPaginator;
        @ViewChild(MatSort) sort: MatSort;
          dataSourse: MatTableDataSource<Consulta>;
          displayedColumns = ['categoria','nid','paciente','paciente_apelido','marcador'];
        
          constructor(
            public dialogRef: MatDialogRef<DialogOverviewExampleDialog>,
            @Inject(MAT_DIALOG_DATA) public data: DialogData, private pacienteService: PacienteService ,public dialog: MatDialog,) {
        
              this.pacienteService.getConsultasRelatorio(this.ano).snapshotChanges().subscribe(data => {
                this.consultas = data.map(e => {
                  return {
                    id: e.payload.key,
                    ...e.payload.val(),
                  } as Consulta;
                })
                this.dataSourse=new MatTableDataSource(this.consultas.filter( c => c.tipo == "CONDUTA CLINICA").sort((a, b)  => a.categoria > b.categoria ? 1 : -1));
                this.dataSourse.paginator = this.paginator;
                this.dataSourse.sort = this.sort;
              })
              }
            
            }