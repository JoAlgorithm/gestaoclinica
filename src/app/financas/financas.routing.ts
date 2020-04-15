import { Routes } from '@angular/router';
import { ContaRecebidaComponent } from './conta-recebida/conta-recebida.component';
import { ContaReceberComponent } from './conta-receber/conta-receber.component';
import { PlanoContaComponent } from './plano-conta/plano-conta.component';
import { LancamentoComponent } from './lancamento/lancamento.component';

//import {TABLE_DEMO_ROUTES} from './table/routes';

export const FinancasRoutes: Routes = [
  {
    path: '',
    children: [
      {path: 'lancamento', component: LancamentoComponent},
      {path: 'contas_recibida', component: ContaRecebidaComponent},
      {path: 'contas_receber', component: ContaReceberComponent},
      {path: 'plano_conta', component: PlanoContaComponent}
      
    ]
  }
];
