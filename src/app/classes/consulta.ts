import { Paciente } from "./paciente";
import { DiagnosticoAuxiliar } from "./diagnostico_aux";

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

    //internamento?:boolean;


    //tratamento_clinico_efetuado?:String;
    //tratamento_clinico_prestar_servico?:String;
    //observacoes?:String;

    justificativa_cancelamento?:String;
    cancelador?: String; //Quem cancelou a consulta

    diagnosticos?: DiagnosticoAuxiliar[];

    tipo?:String; //Uma consulta pode ser "CONSULTA MEDICA" OU "DIAGNOSTICO AUX"

    preco_consulta_medica?:Number;
    preco_diagnosticos?:Number;

    //

    lista_diagnosticos_aux?:String = "";

    /*lista_diagnosticos(): string {
        let diagnosticos:string = "";
        this.diagnosticos_aux.forEach(d => {

            if (diagnosticos = ""){
                diagnosticos = d.nome + "";
            }else{
                diagnosticos = diagnosticos + " ; "+d.nome
            }
        });
        return diagnosticos;
    }*/


}