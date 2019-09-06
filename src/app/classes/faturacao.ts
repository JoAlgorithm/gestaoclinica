import { Consulta } from "./consulta";
import { DiagnosticoAuxiliar } from "./diagnostico_aux";

export class Faturacao { 

    id?: string; //Firebase ID

    data?: Date; //Data da faturacao

    valor?: Number; //Valor faturado

    /*
    * Categoria da faturacao serve para estratificarmos as fontes de receita, as opcoes podem ser:
    * DIAGNOSTICO_AUX
    * CONSULTA_MEDICA
    * MEDICAMENTO
    */
    categoria?:String;

    consulta?: Consulta;
    diagnostico_aux?: DiagnosticoAuxiliar[];

    faturador?:String; //User que faturou
}