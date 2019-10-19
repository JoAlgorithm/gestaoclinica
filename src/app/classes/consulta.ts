import { Paciente } from "./paciente";
import { DiagnosticoAuxiliar } from "./diagnostico_aux";
import { CategoriaConsulta } from "./categoria_consulta";
import { CondutaClinica } from "./conduta_clinica";
import { Medicamento } from "./medicamento";
import { MovimentoEstoque } from "./movimento_estoque";

export class Consulta { 
    id?:String;

    data?:string; //data em que a consulta foi marcada

    data_atendimento?:string; //data em que a consulta iniciou a ser atendida

    data_cancelamento?:string; //data em que a consulta foi cancelada

    data_encerramento?:string; //data em que a consulta foi cancelada

    data_diagnostico?:string; //data em que a consulta mudou de Aberta para Diagnostico
    
    /*
    *Quem marcou a consulta
    *Normalmente vai ser a Rececionista que agendou a consulta
    *Mas o Admin tambem pode o fazer por isso vamos persistir essa info
    */
    marcador?: String; //Quem marcou a consulta - 

    encerrador?: String; //Quem encerrou a consulta - 

    marcador_diagnostico?: String; //Quem mandou paciente para o diagnostico

    paciente?: Paciente;

    /*
    * O status indica o estado da:
    * Aberta: quando a rececionista marca mas o medico ainda nao atendeu
    * //Em atendimento: quando o medico esta atendendo o paciente
    * Encerrada: quando o medico finalizou o atendimento do paciente
    * Cancelada: quando por algum motivo a consulta foi cancelada antes de sair do Aberta para Em atendimento
    * Ao inves de considerarmos o Status "Em atendimento" usaremos:
    * Internamento: quando o paciente tiver sido internado
    * Diagnostico: quando o paciente estiver sendo diagnosticado
    * Em atendimento: o diagnostico ja foi encerrado pela rececionista
    */
    status?:String;

    queixas_principais?: String;
    historia_doenca_atual?: String;
    diagnosticos_aux?: DiagnosticoAuxiliar[];
    diagnostico_final?: String;
    tratamento_efetuar?: String;
    observacoes?: String;

    //Colocado na clinica porque podera haver a possibilidade de o medico ter de incluir isso
    // na consulta do paciente
    // Inicialmente a ideia e ficar apenas com a rececionista mas para nao ter de mexer na estrutura
    // depois ficou dentro da consulta caso haja necessidade do medico incluir
    condutas_clinicas?: CondutaClinica[]; 
    //internamento?:boolean;

    //medicamentos?: Medicamento[];
    movimentosestoque?: MovimentoEstoque[]; //Dentro de movimentos vai ter o medicamento e deposito

    //tratamento_clinico_efetuado?:String;
    //tratamento_clinico_prestar_servico?:String;
    //observacoes?:String;

    justificativa_cancelamento?:String;
    cancelador?: String; //Quem cancelou a consulta

    diagnosticos?: DiagnosticoAuxiliar[];
    //movimentosestoque?: MovimentoEstoque[];

    tipo?:String; //Uma consulta pode ser "CONSULTA MEDICA" OU "DIAGNOSTICO AUX" OU "CONDUTA CLINICA" OU "MEDICAMENTO"

    //Dependendo do tipo de consulta e usada uma variavel para contabilizar o preco
    // Uma consulta pode conter diagnosticcos e condutuas e cada item tera seu proprio preco
    preco_consulta_medica?:Number;
    preco_diagnosticos?:Number;
    preco_condutas?:Number;


    lista_diagnosticos_aux?:String = "";


    //Uma consulta pode ter uma categoria se for do tipo Consulta medica ex: Medicina geral, Cirurgia, etc
    categoria?: CategoriaConsulta; 

}