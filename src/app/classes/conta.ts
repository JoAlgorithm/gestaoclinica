export class Conta {
    id?: string; //vai ser nr da fatura referente
    ano?: number;
    mes?: String;
    dia?: number;
    data?: string;

    //Categorias de contas
    // "A receber"
    // "Recebida"
    // "A pagar" (nao usadas num momento inicial)
    categoria?: string;

    forma_pagamento?: string;

    cliente_nome?: string;
    cliente_apelido?: string;
    cliente_nid?: number;
    nr_apolice?: string; //Nr de apolice do cliente referente a seguradora

    valor_total?: Number;

    //Descricao por extenso da consulta. Se forem diagnosticos e outros vamos concatenar.
    consulta?: string;

    seguradora_nome?: string;

    data_recebimento?: Date;
}