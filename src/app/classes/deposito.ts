import { Medicamento } from "./medicamento";
import { MovimentosComponent } from "../estoque/movimentos/movimentos.component";

export class Deposito {
    id: string;
    nome?: string;
    descricao?: string;
    medicamentos?: Medicamento[];
    movimentos?: MovimentosComponent[];

    valor_total?: number; //Sempre que um item é adicionado ou subtraido no deposito o valor é ajustado
 }
 