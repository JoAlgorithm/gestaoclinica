export class Paciente { 

    id?:string;
    nome?:string;
    apelido?:string;
    sexo?:string;
    datanascimento?:Date;
    documento_identificacao?:string;
    nr_documento_identificacao?:string;
    localidade?:string;
    bairro?:string;
    avenidade?:string;
    rua?:string;
    casa?:string;
    celula?:string;
    quarteirao?:string;
    posto_admnistrativo?:string;
    distrito?: string;
    provincia?:string;

    //Dados da pessoa de referencia
    referencia_nome:string;
    referencia_apelido:string;
    referencia_telefone:string;


    //financeiro?:boolean;
    //admin?: boolean;
 }