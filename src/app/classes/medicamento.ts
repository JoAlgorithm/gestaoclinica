import { UnidadeMedida } from "./un";
import { CategoriaMedicamento } from "./categoria_medicamento";
import { TipoEstoque } from "./tipo_estoque";

export class Medicamento {
    id?: string;
    codigo?: number; //gerar codigo que nem NID
    nome_generico?: string; //o mais usado
    nome_comercial?: string;
    composicao?: string; //1 grama

    //Status
    // Ativo
    // Inativo
    status?: string;

    //Exemplos Unidades de medida
    // Litro
    // Metro
    // Ampola
    // Frasco
    // KG
    // Miligrama
    // Unidade
    un?: UnidadeMedida;

    //Categoria tecnicamente chamada de Forma farmaceutica
    // Comprimido
    // Injectavel
    // Xarope
    categoria?: CategoriaMedicamento;

    //Tipo tecnicamente chamado de Categoria
    // Na verdade comprimido e um nome generico, em gestaio de estoques de farmacias separam-se as opcoes em
    // 1. Medicamentos (paracetamol, amoxicilina, etc)
    // 2. Material medico cirugico (luvas, algodao, etc)
    // 3. Consumiveis de laboratorio ()
    tipo?: TipoEstoque;

    min?: number;
    //max?: number;

    //Nivel de estoque pode ser:
    // Abaixo do minimo
    // OK
    // Acima do maximo
    nivel?: string;

    //Repor
    //Nao repor
    // etc
    sugestao?: string;

    qtd_disponivel?: number;

    preco_venda?: number;

    preco_seguradora?: number;

    valor_medio_entrada?:number; //Valor de estoque calculado com base na media dos valores de entrada

    //movimentos:Movimentos[];

    //Variaveis usadas para manipular a venda nas farmacias
    qtd_solicitada?: number;
    preco_venda_total?: number;



 }
 