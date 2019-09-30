import { Component } from '@angular/core';
import { PacienteService } from '../services/paciente.service';
import { Paciente } from '../classes/paciente';
import { ConfiguracoesService } from '../services/configuracoes.service';
import { DiagnosticoAuxiliar } from '../classes/diagnostico_aux';
import { Consulta } from '../classes/consulta';
import { Faturacao } from '../classes/faturacao';

import * as jsPDF from 'jspdf';
import { format } from 'util';
//import { format } from 'path';

@Component({
  //selector: 'app-dashboard',
  selector: 'dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {

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

  constructor(private pacienteService: PacienteService, private configService: ConfiguracoesService){
  }

  ngOnInit() {
    //let doc = new jsPDF();
    //doc.save("PDF")

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

    this.pacienteService.getConsultas().snapshotChanges().subscribe(data => {
      this.consultas = data.map(e => {
        return {
          id: e.payload.key,
          //diagnosticos_aux: e.payload.doc.data()['diagnosticos_aux'] as DiagnosticoAuxiliar[],
          ...e.payload.val(),
        } as Consulta;
      })
      this.consultas_encerradas_medicas = this.consultas.filter( c => c.status === "Encerrada" && c.tipo == "Consulta Medica").length;
      
      this.consultas_encerradas_diagnosticos = this.consultas.filter( c => c.status === "Encerrada" && c.tipo == "DIAGNOSTICO AUX").length;
      
      this.consultas_encerradas_condutas = this.consultas.filter( c => c.status === "Encerrada" && c.tipo == "CONDUTA CLINICA").length;
      
      this.consultas.filter( c => c.tipo == "Consulta Medica").forEach(element => {
        //console.log(element.diagnosticos_aux)
        if(element.diagnosticos_aux){
          if(element.diagnosticos_aux.length>0){
            this.consultas_encerradas_diagnosticos = +this.consultas_encerradas_diagnosticos + +1;
          }
        }
        
      });


      /*this.consultas.filter( c => c.status === "Encerrada" && c.tipo == "DIAGNOSTICO AUX").forEach(element => {
        element.diagnosticos_aux.forEach(d => {
          if (this.pieChartLabels.includes(d.nome)){
            this.pieChartLabels.push(d.nome);
          }
        })
      });*/
    })

    this.pacienteService.getFaturacoes().snapshotChanges().subscribe(data => {
      this.faturacoes = data.map(e => {
        return {
          id: e.payload.key,
          data: e.payload.val()['data'] as Date,
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
        label: 'Conduta Clinica',
        borderWidth: 0
      }];
      
      
    })

    

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
    label: 'Conduta Clinica',
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
    

}
