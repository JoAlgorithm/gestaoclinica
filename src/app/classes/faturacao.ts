import { Consulta } from "./consulta";
import { DiagnosticoAuxiliar } from "./diagnostico_aux";
import { CondutaClinica } from "./conduta_clinica";
import { Medicamento } from "./medicamento";
import { MovimentoEstoque } from "./movimento_estoque";

export class Faturacao { 

    id?: string; //Firebase ID

    data?: Date; //Data da faturacao
    mes?: String; //Mes
    ano?: Number; //Ano

    valor?: Number; //Valor faturado

    /*
    * Categoria da faturacao serve para estratificarmos as fontes de receita, as opcoes podem ser:
    * DIAGNOSTICO_AUX
    * CONSULTA_MEDICA
    * MEDICAMENTO
    * CONDUTA CLINICA
    */
    categoria?:String;

    /*
    *  Se a Categoria for Diagnostico Aux: preencher o nome do Diagnostico
    * Se a Categoria for Consulta medica: preencher o nome da Consulta medica
    */
    subcategoria?: String;

    //consulta?: Consulta;
    //diagnostico_aux?: DiagnosticoAuxiliar[];
    //condutas_clinicas?: CondutaClinica[];
    //medicamentos?: Medicamento[];

    //movimentosestoque?: MovimentoEstoque[];//Dentro de movimento tem medicamentos, deposito e qtd

    faturador?:String; //User que faturou

    medico_nome?: string; //Variavel usada para fazer estatisticas de faturacao por medico
}