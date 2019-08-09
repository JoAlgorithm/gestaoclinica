import { Component } from '@angular/core';
import { PacienteService } from '../services/paciente.service';
import { Paciente } from '../classes/paciente';

@Component({
  //selector: 'app-dashboard',
  selector: 'dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
 

 /* estudantes: Estudante[];
  estudantesMatriculados: any[];
  estudantesMasculinos: any[];
  estudantesMascu: any = 0;
  estudantesFemininas: any =0;

  turmas: Turma[];
  turmasFilter: any[];
  naoMatriculdos:any =0 ;

  

  constructor(private estudanteService: EstudanteService){
  }

  ngOnInit() {

    this.estudanteService.getEstudantes().subscribe(data => {
      this.estudantes = data.map(e => {
        return {
          id: e.payload.doc.id,
          encarregado: e.payload.doc.data()['encarregado'] as Encarregado,
          turma: e.payload.doc.data()['turma'] as Turma,
          ...e.payload.doc.data(),
        } as Estudante;
      })
      this.estudantesMatriculados = this.estudantes.filter(e => e.turma != null);
      this.naoMatriculdos = this.estudantes.length - this.estudantesMatriculados.length;

      this.estudantesMascu = this.estudantes.filter(e => e.genero == 'Masculino').length;
      this.estudantesFemininas = this.estudantes.length - this.estudantesMascu;
      console.log(this.estudantesMascu + " " + this.estudantesFemininas)


      this.pieChartData = [this.estudantesMascu, this.estudantesFemininas];
      
    })

    this.estudanteService.getTurmas().subscribe(data => {
      this.turmas = data.map(e => {
        return {
          id: e.payload.doc.id,
          ...e.payload.doc.data()
        } as Turma;
      })       
    })
  }

  // Doughnut
  public pieChartColors: any[] = [{
    backgroundColor: ['#3f51b5','#f44336',  '#ffeb3b', '#4caf50', '#2196f']
  }];
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
  public pieChartLabels: string[] = ['Masculino', 'Feminino'];
  public pieChartData = [this.estudantesMascu, this.estudantesFemininas];
  public pieChartType = 'pie';

  */
}
