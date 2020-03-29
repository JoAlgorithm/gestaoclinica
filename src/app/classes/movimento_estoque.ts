import { Medicamento } from "./medicamento";
import { Deposito, DepositoRelatorio } from "./deposito";

export class MovimentoEstoque {
    id?: string;
    
    //Tipos de movimento
    // Saida por estorno
    // Saida por venda
    // Saida por ajuste
    // Entrada por compra
    // Entrada por ajuste
    tipo_movimento?: string;

    deposito?: Deposito;
    deposito_relatorio?: DepositoRelatorio;

    medicamento?: Medicamento;
    medicamento_nome?: string; //usado para normalizar a base de dados
    medicamento_id?: string; //usado para normalizar a base de dados
    deposito_nome?: string; //usado para normalizar a base de dados
    deposito_id?: string; //usado para normalizar a base de dados

    quantidade?: number;

    valor_unitario?: number; //usado para calcular o valor de estoque

    data_movimento?: string;

    justificativa?: string;

    movimentador?: string;

    //Informacoes de fatura para o movimento de entrada por compra
    nr_fatura?: string;
    data_fatura?: string;
}