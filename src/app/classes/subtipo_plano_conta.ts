import { TipoPlanoConta } from "./tipo_plano_conta";

export class SubTipoPlanoConta{
    id?: string;
    nome?: string;
    
    //1. Pagamento ou 2. Recebimento
    tipo: TipoPlanoConta; 

    //Esses dados serao configurados diretamente na base de dados
    // sera dinamico apenas para facilitar alguma alteracaco individual de uma determinada clinica no futuro
    //1.Recebimento
    //2.Pagamento
}