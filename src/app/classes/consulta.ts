import { Paciente } from "./paciente";
import { DiagnosticoAuxiliar } from "./diagnostico_aux";

export class Consulta { 
    id?:String;

    data?:Date; //data em que a consulta foi marcada

    data_atendimento?:Date; //data em que a consulta iniciou a ser atendida

    data_cancelamento?:Date; //data em que a consulta foi cancelada
    
    /*
    *Quem marcou a consulta
    *Normalmente vai ser a Rececionista que agendou a consulta
    *Mas o Admin tambem pode o fazer por isso vamos persistir essa info
    */
    marcador?: String; //Quem marcou a consulta - 

    paciente?: Paciente;

    /*
    * O status indica o estado da:
    * Aberta: quando a rececionista marca mas o medico ainda nao atendeu
    * Em atendimento: quando o medico esta atendendo o paciente
    * Encerrada: quando o medico finalizou o atendimento do paciente
    * Cancelada: quando por algum motivo a consulta foi cancelada antes de sair do Aberta para Em atendimento
    */
    status?:String;

    tratamento_clinico_efetuado?:String;
    tratamento_clinico_prestar_servico?:String;
    observacoes?:String;

    justificativa_cancelamento?:String;
    cancelador?: String; //Quem cancelou a consulta

    diagnosticos?: DiagnosticoAuxiliar[];

    tipo?:String; //Uma consulta pode ser "CONSULTA MEDICA" OU "DIAGNOSTICO AUX"

    preco_consulta_medica?:Number;
}