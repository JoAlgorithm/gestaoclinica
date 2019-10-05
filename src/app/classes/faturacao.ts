import { Consulta } from "./consulta";
import { DiagnosticoAuxiliar } from "./diagnostico_aux";
import { CondutaClinica } from "./conduta_clinica";

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

    consulta?: Consulta;
    diagnostico_aux?: DiagnosticoAuxiliar[];
    condutas_clinicas?: CondutaClinica[];

    faturador?:String; //User que faturou
}