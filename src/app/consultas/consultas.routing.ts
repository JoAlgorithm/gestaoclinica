import { Routes } from '@angular/router';

import { ConsultasComponent } from './consultas.component';
//import { AtendimentoComponent } from '../atendimento/atendimento.component';
//import { Consulta } from '../classes/consulta';

export const ConsultasRoutes: Routes = [
  {  path: '',  component: ConsultasComponent},
  //{path : 'atendimento', component : AtendimentoComponent, data : {consulta : Consulta}}
];

