import { Medicamento } from "./medicamento";
import { MovimentosComponent } from "../estoque/movimentos/movimentos.component";

export class Deposito {
    id: string;
    nome?: string;
    descricao?: string;
    medicamentos?: Medicamento[];
    movimentos?: MovimentosComponent[];

    valor_total?: number; //Sempre que um item é adicionado ou subtraido no deposito o valor é ajustado

    //Dados para relatorios
    ano?:number;
    mes?:string;
    valor_entrada?:number; //Armazena apenas os valores de entrada daquele mes
    valor_acumulado?:number; //Armazena a variavel "valor_total" existente naquele mes
 }
 
 export class DepositoRelatorio {
    id: string;
    nome?: string;

    //Dados para relatorios
    ano?:number;
    mes?:string;
    valor_entrada?:number; //Armazena apenas os valores de entrada daquele mes
    valor_saida?:number; //Armazena apenas os valores de saida daquele mes
    valor_acumulado?:number; //Armazena a variavel "valor_total" existente naquele mes
 }
 