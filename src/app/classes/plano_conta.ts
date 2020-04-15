import { SubTipoPlanoConta } from "./subtipo_plano_conta";
import { TipoPlanoConta } from "./tipo_plano_conta";

export class PlanoConta {
    id?: string;

    //1. Pagamento ou 2. Recebimento
    tipo: TipoPlanoConta; //Vamos cadastrar direto na base de dados

    //1. Pagamento
    //1.1. Despesas admnistrativas e comerciais
    //1.2. Despesas de produtos vendidos
    //1.3. Despesas financeiras
    //1.4. Investimentos
    //1.5. Despesas alimenticias
    //1.6. Outras despesas

    //2. Recebimento
    //2.1. Receitas de vendas
    //2.2. Receitas financeiras
    //2.3. Outras receitas
    subtipo: SubTipoPlanoConta; 

    nome?: string;
}