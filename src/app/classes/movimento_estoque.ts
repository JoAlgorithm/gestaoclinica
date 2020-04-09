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
    // Saida por Transferencia
    // Entrada por Transferencia
    tipo_movimento?: string;

    deposito?: Deposito;
    deposito_relatorio?: DepositoRelatorio;

    deposito_destino?: Deposito; //novo atributo usado para guardar o deposito a ser transferido quando o movimento for transferencia
    deposito_origem?: Deposito; //novo atributo usado para guardar o deposito de origem quando o movimento for transferencia

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