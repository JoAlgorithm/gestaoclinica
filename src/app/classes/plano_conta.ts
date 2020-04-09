import { SubTipoPlanoConta } from "./subtipo_plano_conta";
import { TipoPlanoConta } from "./tipo_plano_conta";

export class PlanoConta {
    id?: string;

    //1. Pagamento ou 2. Recebimento
    tipo: TipoPlanoConta; 

    //1. Pagamento
    //1.1. Despesas admnistrativas e comerciais
    //1.2. Despesas de produtos vendidos
    //1.3. Despesas finaceiras
    //1.4. Investimentos
    //1.5. Despesas alimenticias
    //1.6. Outras despesas
    subtipo: SubTipoPlanoConta; 

    nome?: string;
}