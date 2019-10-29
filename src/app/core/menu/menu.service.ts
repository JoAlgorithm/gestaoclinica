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
      {state: 'estoque_cadastros', name: 'Cadastros'}
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
      {state: 'estoque_cadastros', name: 'Cadastros'}
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
    console.log("Menu "+this.authService.get_perfil)
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
