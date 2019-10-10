import { UnidadeMedida } from "./un";
import { CategoriaMedicamento } from "./categoria_medicamento";

export class Medicamento {
    id: string;
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

    //Categoria tecnicamente chamada de Apresentacao pode ser
    // Comprimido
    // Injectavel
    // Xarope
    categoria?: CategoriaMedicamento;

    min?: number;
    //max?: number;

    //Nivel de estoque pode ser:
    // Abaixo do minimo
    // OK
    // Acima do maximo
    nivel?: string;

    qtd_disponivel?: number;

    preco_venda?: number;

    valor_medio_entrada?:number; //Valor de estoque calculado com base na media dos valores de entrada

    //movimentos:Movimentos[];


 }
 