import { Medicamento } from "./medicamento";

export class MovimentoEstoque {
    id?: string;
    
    //Tipos de movimento
    // Saida por estorno
    // Saida por venda
    // Saida por ajuste
    // Entrada por compra
    // Entrada por ajuste
    tipo_movimento?: string;

    medicamento?: Medicamento;

    quantidade?: number;

    data?: string;

    justificativa?: string;

    movimentador?: string;
}