import { TipoPlanoConta } from "./tipo_plano_conta";
import { SubTipoPlanoConta } from "./subtipo_plano_conta";
import { PlanoConta } from "./plano_conta";

//Essa classe regista lancamentos financeiros de SAIDAS E ENTRADAS
export class Lancamento {
    id?: string;

    //1.Saida ou 2.Entrada
    tipo: TipoPlanoConta; //Vamos cadastrar direto na base de dados
    tipo_nome: string;

    //1.Saida
    //1.1.Despesas admnistrativas (Energia, etc)
    //1.2.Despesas de transporte
    //1.3.Despesas de alimentacao
    //1.4.Outras despesas (Salario, etc)

    //1.2. Despesas de produtos vendidos
    //1.3. Despesas financeiras
    //1.4. Investimentos
    //1.5. Despesas alimenticias
    //1.6. Outras despesas

    //2.Entrada
    //2.1.Receitas de vendas
        //CONSULTA_MEDICA
        //DIAGNOSTICO_AUX
        //CONDUTA CLINICA 
        //MEDICAMENTO
    //2.2. Receitas financeiras
    //2.3. Outras receitas
    subtipo: SubTipoPlanoConta; 
    subtipo_nome: string;

    plano?: PlanoConta;
    plano_nome: string;

    data?: Date; //Data de lancamento
    dia?: number;
    mes?: string; //Mes
    ano?: Number; //Ano

    valor?: Number; //Valor monetario

    descricao?: string;

    formaPagamento?: string; //Se for 2. Recebimento tem segragar por forma de pagamento

    nr_fatura?: number;
}