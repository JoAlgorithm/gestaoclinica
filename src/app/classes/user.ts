import { Perfil } from "./perfil";

export interface User {
   uid: string;
   email: string;
   displayName: string;
   photoURL: string;
   emailVerified: boolean;

   clinica: string;
   perfil: string; //Perfil de acesso ex: Admin, Financeiro, ...
   clinica_id: string;
   endereco: string;
   provincia: string;
   cidade: string;

   //role: Roles;
}
