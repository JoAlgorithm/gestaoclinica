import { Routes } from '@angular/router';
import { SignInComponent } from './sign-in/sign-in.component';

//import {CadastroComponent} from './cadastro/cadastro.component';
//import { ListagemComponent } from './listagem/listagem.component';

//import {TABLE_DEMO_ROUTES} from './table/routes';

export const AutenticacaoRoutes: Routes = [
  {
    path: '',
    children: [
      {path: '', component: SignInComponent},
      //{path: 'listagem_estudante', component: ListagemComponent}
      
    ]
  }
];
