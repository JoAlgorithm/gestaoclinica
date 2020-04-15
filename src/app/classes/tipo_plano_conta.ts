import { SubTipoPlanoConta } from "./subtipo_plano_conta";

export class TipoPlanoConta{
    id?: string;
    nome?: string;

    subTipos?: SubTipoPlanoConta[];

    //Esses dados serao configurados diretamente na base de dados
    // sera dinamico apenas para facilitar alguma alteracaco individual de uma determinada clinica no futuro
    //1.Recebimento
    //2.Pagamento
}