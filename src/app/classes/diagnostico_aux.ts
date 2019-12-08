import { TipoDiagnosticoAux } from "./tipo_diagnostico";
import { SubTipoDiagnosticoAux } from "./subtipo_diagnostico";

export class DiagnosticoAuxiliar {
    id?:String;

    nome?:String;
    preco?:Number;

    preco_seguradora?: Number;

    //Controla se o diagnostico foi ou nao faturado / atraves dessa variavel na lista de pendencias so aparecem as faturadas
    faturado?:boolean; 

    tipo?: TipoDiagnosticoAux; //Filtro 1: exs: HEMATOLOGIA, BIOQUIMICA, IMUNOQUIMICA, HORMONAS
    subtipo?: SubTipoDiagnosticoAux; //Filtro 2: exs: Perfil Hepatico, Perfil Renal, Perfil Lipidico, Perfil Anemico

}