export class Paciente { 

    id?:string;
    nid?:number;//anoabreviadoNNN onde N e um numero natural; ex: NID = 18001
    nome?:string;
    apelido?:string;
    sexo?:string;
    datanascimento?:Date;
    documento_identificacao?:string;
    nr_documento_identificacao?:string;
    localidade?:string;
    bairro?:string;
    avenida?:string;
    rua?:string;
    casa?:string;
    celula?:string;
    quarteirao?:string;
    posto_admnistrativo?:string;
    distrito?: string;
    provincia?:string;

    //Dados da pessoa de referencia
    referencia_nome?:string;
    referencia_apelido?:string;
    referencia_telefone?:string;

    /*
    * A historia clinica e preenchida na primeira consulta do paciente
    * Apos o cadastro do paciente essa variavel e preenchida como false e vira pra true apos preenchimento do medico
    */
    status_historia_clinica?:boolean;

    //Historia regressas
    //Todas variaveis dessa seccao iniciam com hr_
    hr_hospitalizacoes?:boolean;
    hr_transfusoes_sanguineas?:boolean;
    hr_trauma?:boolean;
    hr_problemas_medicos_n_relacionado?:boolean;
    hr_asma?:boolean;
    hr_hipertensao_arterial?:boolean;
    hr_diabetes_mellitus?:boolean;
    hr_d_cardiovascular?:boolean;
    hr_d_pulmonar?:boolean;
    hr_d_digestiva?:boolean;
    hr_d_genitourinaria?:boolean;
    hr_d_neurologia?:boolean;
    hr_d_psiquiatrica?:boolean;
    hr_alergia?:boolean;
    hr_alergia_especificacao?:String;

    //Historico familiar
    //Todas variaveis dessa seccao iniciam com hf_
    hf_hipertensao_arterial?:boolean;
    hf_diabete_mellitus?:boolean;
    hf_asma_bronquica?:boolean;
    hf_tuberculose?:boolean;
    hf_d_cardiovascular?:boolean;
    hf_d_neoplasica?:boolean;
    hf_d_tiroide?:boolean;
    hf_d_urogenital?:boolean;
    hf_d_tubo_digestivo?:boolean;
    hf_d_hemorragia?:boolean;
    hf_outras?:boolean;
    hf_outras_especificacao?:String;

    //Historia psico-social
    //Todas variaveis dessa seccao iniciam com ps_
    ps_situacao_laboral?:String;
    ps_status_familiar?:String;
    ps_suporte?:String;
    ps_fatores_stressantes?:String;
    ps_fatores_risco_estilo_vida?:String;
    ps_fatores_risco_trabalho?:String[];
    ps_fatores_risco_trabalho_especificacao?:String;


 }