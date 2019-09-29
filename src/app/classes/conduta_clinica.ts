import { TipoCondutaClinica } from "./tipo_conduta_clinica";

export class CondutaClinica {
    id?: string;

    //Tipos de condutas clinicas 
    // (essas infos devem ser cadastradas no realtime db pela Algorithm antes de entregar o sistem
    //foram lancadas na base de dados porque cada clinica pode optar pode chamar cada categoria do seu jeito)
    // PEQUENAS CIRURGIAS
    // MEDICINA FISICA E REABILITACAO
    // VACINACAO
    // INTERVECOES CLINICAS
    // MEDICACAO DISPONIVEL INJECTAVEL (incluir a quantidade)
    // MEDICACAO DISPONIVEL ORAL (incluir a quantidade)

    tipo?: TipoCondutaClinica;
    
    nome?: string;
    preco?: Number;
    
}