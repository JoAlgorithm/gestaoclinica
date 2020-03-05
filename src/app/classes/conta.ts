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

    //Como inicialmente nao existia emissao de segunda via / ao desenvolver essa funcionalidade tiveram que ser acrescentadas variaveis na
    // tabela, porem as faturas antigas dariam erro ao tentar imprimir entao essa variavel vem para desabilitar as faturas antigas que nao
    // estavam preparadas para serem impressas
    segunda_via?: boolean; 

    //Essa variavel linhas foi criada depois para poder listar os itens da fatura linha a linha
    linhas?: Linha[];
}

export class Linha{
    descricao_servico?: string;
    preco_unitario?: number;
    qtd_solicitada?: number;
    preco_total?: number;
    id_servico?: string;
    

    /*constructor(descricao_servico?: string, preco_unitario?: number, qtd_solicitada?: number, preco_total?: number){
        this.descricao_servico = descricao_servico;
        this.preco_unitario = preco_unitario;
        this.qtd_solicitada = qtd_solicitada;
        this.preco_total = preco_total;
    }*/
}