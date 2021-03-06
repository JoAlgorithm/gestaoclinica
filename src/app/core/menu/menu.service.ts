import { Injectable } from '@angular/core';
import { AuthService } from '../../services/auth.service';

export interface BadgeItem {
  type: string;
  value: string;
}

export interface ChildrenItems {
  state: string;
  name: string;
  type?: string;
}

export interface Menu {
  state: string;
  name: string;
  type: string;
  icon: string;
  badge?: BadgeItem[];
  children?: ChildrenItems[];
}

const MENUITEMS:Menu[] = [
  {
    state: 'dashboard',
    //state: 'home',
    name: 'INICIO',
    type: 'link',
    icon: 'home'
  },
  {
    state: 'paciente',
    name: 'RECEPCAO',
    type: 'sub',
    icon: 'local_library',
    children: [
      {state: 'cadastro_paciente', name: 'Cadastro de paciente'},
      {state: 'listagem_paciente', name: 'Lista de pacientes'},
      {state: 'pendentes_paciente', name: 'Pendentes'},
    ]
  },
  {
    state: 'consultas',
    name: 'CONSULTAS',
    type: 'link',
    icon: 'assignment_ind',
  },
  {
    state: 'estoque',
    name: 'ESTOQUE',
    type: 'sub',
    icon: 'local_pharmacy',
    children: [
      {state: 'estoque_movimentos', name: 'Movimentos'},
      {state: 'estoque_cadastros', name: 'Cadastros'},
      {state: 'estoque_gestao', name: 'Gestao'},
    ]
  },
  {
    state: 'financas',
    name: 'FINANCAS',
    type: 'sub',
    icon: 'monetization_on',
    children: [
      {state: 'lancamento', name: 'Lancamentos'},
      {state: 'contas_recibida', name: 'Contas recebidas'},
      {state: 'contas_receber', name: 'Contas a receber'},
      {state: 'plano_conta', name: 'Planos de conta'}
    ]
  },
  {
    state: 'configuracoes',
    name: 'CONFIGURACOES',
    type: 'link',
    icon: 'settings',
  },
];

const MENUITEMS_RECECIONISTA:Menu[] = [
  {
    state: 'dashboard',
    //state: 'home',
    name: 'INICIO',
    type: 'link',
    icon: 'home'
  },
  {
    state: 'paciente',
    name: 'RECEPCAO',
    type: 'sub',
    icon: 'local_library',
    children: [
      {state: 'cadastro_paciente', name: 'Cadastro de paciente'},
      {state: 'listagem_paciente', name: 'Lista de pacientes'},
      {state: 'pendentes_paciente', name: 'Pendentes'},
    ]
  }  
];

const MENUITEMS_MEDICO:Menu[] = [
  {
    state: 'dashboard',
    //state: 'home',
    name: 'INICIO',
    type: 'link',
    icon: 'home'
  },
  {
    state: 'consultas',
    name: 'CONSULTAS',
    type: 'link',
    icon: 'assignment_ind',
  }
];

const MENUITEMS_ADMNISTRATIVO:Menu[] = [
  {
    state: 'dashboard',
    //state: 'home',
    name: 'INICIO',
    type: 'link',
    icon: 'home'
  },
  {
    state: 'consultas',
    name: 'CONSULTAS',
    type: 'link',
    icon: 'assignment_ind',
  },
  {
    state: 'estoque',
    name: 'ESTOQUE',
    type: 'sub',
    icon: 'local_pharmacy',
    children: [
      {state: 'estoque_movimentos', name: 'Movimentos'},
      {state: 'estoque_cadastros', name: 'Cadastros'},
      {state: 'estoque_gestao', name: 'Gestao'},
    ]
  },
  {
    state: 'financas',
    name: 'FINANCAS',
    type: 'sub',
    icon: 'monetization_on',
    children: [
      {state: 'lancamento', name: 'Lancamentos'},
      {state: 'contas_recibida', name: 'Contas recebidas'},
      {state: 'contas_receber', name: 'Contas a receber'},
      {state: 'plano_conta', name: 'Planos de conta'}
    ]
  },
  {
    state: 'configuracoes',
    name: 'CONFIGURACOES',
    type: 'link',
    icon: 'settings',
  }
];

const MENUITEMS_FARMACIA_ADMNISTRATIVO:Menu[] = [
  {
    state: 'dashboard',
    //state: 'home',
    name: 'INICIO',
    type: 'link',
    //icon: 'pie_chart'
    icon: 'home'
  },
  {
    state: 'vendas',
    name: 'VENDA',
    type: 'link',
    icon: 'shopping_cart'
  },
  {
    state: 'estoque',
    name: 'ESTOQUE',
    type: 'sub',
    icon: 'local_pharmacy',
    children: [
      {state: 'estoque_movimentos', name: 'Movimentos'},
      {state: 'estoque_cadastros', name: 'Cadastros'},
      {state: 'estoque_gestao', name: 'Gestao'},
    ]
  },
  {
    state: 'financas',
    name: 'FINANCAS',
    type: 'sub',
    icon: 'monetization_on',
    children: [
      {state: 'lancamento', name: 'Lancamentos'},
      {state: 'contas_recibida', name: 'Contas recebidas'},
      {state: 'contas_receber', name: 'Contas a receber'},
      {state: 'plano_conta', name: 'Planos de conta'}
    ]
  },
  {
    state: 'configuracoes',
    name: 'CONFIGURACOES',
    type: 'link',
    icon: 'settings',
  }
  
];


@Injectable()
export class MenuService {

  //MENUITEMS:Menu[] = [];
  
  constructor(private authService: AuthService){}
  


  getAll(): Menu[] {

    //setTimeout(() );
    switch(this.authService.get_perfil) { 
      case "Clinica_Admnistrativo": { 
         //statements; 
         return MENUITEMS_ADMNISTRATIVO;
      } 
      case "Clinica_Rececionista": { 
         //statements; 
         return MENUITEMS_RECECIONISTA;
         //break; 
      } 
      case "Clinica_Medico": { 
        //statements; 
        return MENUITEMS_MEDICO;
        //break; 
      } 
      case "Farmacia_Admnistrativo": { 
        //statements; 
        return MENUITEMS_FARMACIA_ADMNISTRATIVO;
        //break; 
      }
      case "Farmacia_Admin": { 
        //statements; 
        return MENUITEMS_FARMACIA_ADMNISTRATIVO; //Esse tem acesso aos dois graficos de faturacao e filtros por periodo
        //break; 
      } 
      default: { 
         //statements; 
         return MENUITEMS;
         //break; 
      }
      //return MENUITEMS;
   } 

    //return MENUITEMS;
  }

  add(menu: Menu) {
    //console.log("Menu "+this.authService.get_perfil)
    switch(this.authService.get_perfil) { 
      case "Admnistrativo": { 
         //statements; 
         console.log("Admnistrativo")

         MENUITEMS.push(menu);
         break; 
      } 
      case "Rececionista": { 
         //statements; 
         console.log("Rececionista")
         if(menu.name == "RECEPCAO"){
          MENUITEMS.push(menu);
         }
         break; 
      } 
      case "Medico": { 
        //statements; 
        console.log("Medico")
        if(menu.name == "CONSULTAS"){
          MENUITEMS.push(menu);
         }
        MENUITEMS.push(menu);
        break; 
      } 
      default: { 
         //statements; 
         console.log("Admin")
         MENUITEMS.push(menu);
         break; 
      } 
   } 
    

  }
}
