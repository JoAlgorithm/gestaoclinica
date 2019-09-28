import { Component } from '@angular/core';
import { PacienteService } from '../services/paciente.service';
import { Paciente } from '../classes/paciente';
import { ConfiguracoesService } from '../services/configuracoes.service';
import { DiagnosticoAuxiliar } from '../classes/diagnostico_aux';
import { Consulta } from '../classes/consulta';
import { Faturacao } from '../classes/faturacao';

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
  pieChartLabels: String[] = [];
  pieChartDatas: any[] = [];
  faturacoes: Faturacao[];


  ComboChartData: Array <any>;

  constructor(private pacienteService: PacienteService, private configService: ConfiguracoesService){
  }

  ngOnInit() {
    this.pacienteService.getPacientes().subscribe(data => {
      this.pacientes = data.map(e => {
        return {
          id: e.payload.doc.id,
          ...e.payload.doc.data(),
        } as Paciente;
      })      
    })

    this.configService.getDiagnosticos().subscribe(data => {
      this.diagnosticos = data.map(e => {
        return {
          id: e.payload.doc.id,
          ...e.payload.doc.data(),
        } as DiagnosticoAuxiliar;
      })
    })

    this.pacienteService.getConsultas().subscribe(data => {
      this.consultas = data.map(e => {
        return {
          id: e.payload.doc.id,
          ...e.payload.doc.data(),
        } as Consulta;
      })
      this.consultas_encerradas_medicas = this.consultas.filter( c => c.status === "Encerrada" && c.tipo == "Consulta Medica").length;
      this.consultas_encerradas_diagnosticos = this.consultas.filter( c => c.status === "Encerrada" && c.tipo == "DIAGNOSTICO AUX").length;
    
      /*this.consultas.filter( c => c.status === "Encerrada" && c.tipo == "DIAGNOSTICO AUX").forEach(element => {
        element.diagnosticos_aux.forEach(d => {
          if (this.pieChartLabels.includes(d.nome)){
            this.pieChartLabels.push(d.nome);
          }
        })
      });*/
    })

    this.pacienteService.getFaturacoes().subscribe(data => {
      this.faturacoes = data.map(e => {
        return {
          id: e.payload.doc.id,
          data: e.payload.doc.data()['data'] as Date,
          ...e.payload.doc.data(),
        } as Faturacao;
      }) 
      
      this.faturacoes.forEach(element => {
        console.log("Mes: "+ element.mes+" Ano: "+element.ano+" Categoria: "+element.categoria) 
      });
      
    })

    this.ComboChartData= [{
      data: [6, 5, 8, 8, 5, 5, 4, 10, 5, 11, 8, 3],
      label: 'Series A',
      borderWidth: 1,
      type: 'line',
      fill: false
    }, {
      data: [5, 4, 4, 2, 6, 2, 5, 7, 9, 10, 11, 5],
      label: 'Series B',
      borderWidth: 1,
      type: 'bar',
    }];

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
        display: false,
        position: 'bottom'
      }
    };
    // combo chart
    comboChartLabels: Array <any> = ['Janeiro', 'Fevereiro', 'Marco', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
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
    /*ComboChartData: Array <any> = [{
      data: [6, 5, 8, 8, 5, 5, 4],
      label: 'Series A',
      borderWidth: 1,
      type: 'line',
      fill: false
    }, {
      data: [5, 4, 4, 2, 6, 2, 5],
      label: 'Series B',
      borderWidth: 1,
      type: 'bar',
    }];*/
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


    

}
