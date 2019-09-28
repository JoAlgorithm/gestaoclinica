import { Perfil } from "./perfil";

export class User {
   uid: string;
   email: string;
   displayName: string;
   photoURL: string;
   emailVerified: boolean;

   clinica: string;
   perfil: string; //Perfil de acesso ex: Admin, Admnistrativo, Medico & Rececionista
   clinica_id: string;
   endereco: string;
   provincia: string;
   cidade: string;

   status?: string; //user Ativo ou nao -> o Admnistrador pode mudar esse input a qualquer momento
   //role: Roles;
}
