import { Routes } from '@angular/router';
import { MovimentosComponent } from './movimentos/movimentos.component';
import { CadastrosComponent } from './cadastros/cadastros.component';
import { GestaoComponent } from './gestao/gestao.component';

//import {TABLE_DEMO_ROUTES} from './table/routes';

export const EstoqueRoutes: Routes = [
  {
    path: '',
    children: [
      {path: 'estoque_cadastros', component: CadastrosComponent},
      {path: 'estoque_movimentos', component: MovimentosComponent},
      {path: 'estoque_gestao', component: GestaoComponent}
    ]
  }
];
