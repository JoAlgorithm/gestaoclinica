import { Routes } from '@angular/router';

import {CadastroComponent} from './cadastro/cadastro.component';
import { ListagemComponent } from './listagem/listagem.component';
import { PendentesComponent } from './pendentes/pendentes.component';
//import { ConsultaComponent } from './consulta/consulta.component';


//import {TABLE_DEMO_ROUTES} from './table/routes';

export const PacienteRoutes: Routes = [
  {
    path: '',
    children: [
      {path: 'cadastro_paciente', component: CadastroComponent},
      {path: 'listagem_paciente', component: ListagemComponent},
      {path: 'pendentes_paciente', component: PendentesComponent},
      //{path: 'consulta_paciente', component: ConsultaComponent},
    ]
  }
];
