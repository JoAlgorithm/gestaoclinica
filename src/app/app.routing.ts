import { Routes } from '@angular/router';

import { AdminLayoutComponent, AuthLayoutComponent } from './core';

export const AppRoutes: Routes = [{
  path: '',
  component: AuthLayoutComponent,
  children: [{
    //path: 'autenticacao',
    path: '',
    loadChildren: './autenticacao/autenticacao.module#AutenticacaoComponentsModule'
  },
  {
    path: 'session',
    loadChildren: './session/session.module#SessionModule'
  }]
},{
  path: '',
  component: AdminLayoutComponent,
  children: [{
    path: '',
    loadChildren: './dashboard/dashboard.module#DashboardModule'
  },
  {
    path: 'paciente',
    loadChildren: './paciente/paciente.module#PacienteComponentsModule'
  },
  {
    path: 'consultas',
    loadChildren: './consultas/consultas.module#ConsultasModule'
  },
  {
    path: 'configuracoes',
    loadChildren: './configuracoes/configuracoes.module#ConfiguracoesModule'
  },
  {
    path: 'atendimento',
    loadChildren: './atendimento/atendimento.module#AtendimentoModule'
  },
  {
    path: 'estoque',
    loadChildren: './estoque/estoque.module#EstoqueComponentsModule'
  },
  {
    path: 'financas',
    loadChildren: './financas/financas.module#FinancasComponentsModule'
  }],

}, {
  path: '**',
  redirectTo: 'session/404'
}];
