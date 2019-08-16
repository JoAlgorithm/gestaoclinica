import { Component, OnInit } from '@angular/core';
import { Router, NavigationStart, ActivatedRoute } from '@angular/router';
import { Consulta } from '../classes/consulta';
import { Subscription } from 'rxjs';
import { PacienteService } from '../services/paciente.service';

@Component({
  selector: 'app-atendimento',
  templateUrl: './atendimento.component.html',
  styleUrls: ['./atendimento.component.scss']
})
export class AtendimentoComponent implements OnInit {
  

  constructor(private route: ActivatedRoute, private router: Router, public pacienteService: PacienteService) {

    console.log("id "+ this.route.data.subscribe(id => console.log(id))  ) 

  }

  ngOnInit() {

    

    /*this.consulta = this.route
      .data
      .subscribe(v => console.log(v)) as Consulta;
      console.log("Consulta: "+this.consulta.paciente.nome)*/

      /*this.consulta = this.route.events.pipe(
        filter(e => e instanceof NavigationStart),
        map(() => this.route.getCurrentNavigation().extras.data)
      )as Consulta;*/
  }



}
