import { Component, OnInit } from '@angular/core';
import { Clinica } from '../classes/clinica';
import { NrCotacao } from '../classes/nr_cotacao';
import { NrFatura } from '../classes/nr_fatura';
import { Seguradora } from '../classes/seguradora';
import { CategoriaMedicamento } from '../classes/categoria_medicamento';
import { TipoEstoque } from '../classes/tipo_estoque';
import { EstoqueService } from '../services/estoque.service';
import { ConfiguracoesService } from '../services/configuracoes.service';
import { Deposito } from '../classes/deposito';
import { MovimentoEstoque } from '../classes/movimento_estoque';
import { MatTableDataSource, MatSnackBar } from '@angular/material';
import 'rxjs/add/operator/take';
import { Medicamento } from '../classes/medicamento';
import { Consulta } from '../classes/consulta';
import { Linha, Conta } from '../classes/conta';
import { CustomValidators } from 'ng2-validation';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Faturacao } from '../classes/faturacao';
import { Paciente } from '../classes/paciente';
import { AuthService } from '../services/auth.service';
import * as jsPDF from 'jspdf';


@Component({
  selector: 'app-vendas',
  templateUrl: './vendas.component.html',
  styleUrls: ['./vendas.component.scss']
})
export class VendasComponent implements OnInit {

  clinica: Clinica = new Clinica();
  nrscotacao: NrCotacao[]; //PDF
  nr_cotacao = 0; //PDF
  nrsfaturcao: NrFatura[]; //PDF
  nr_fatura = 0; //PDF

  seguradoras: Seguradora[];

  cats_medicamento: CategoriaMedicamento[];
  tipos_estoque: TipoEstoque[];

  depositos: Deposito[];
  deposito: Deposito = new Deposito();

  //dataSourse: MatTableDataSource<MovimentoEstoque>;
  //displayedColumns = ['medicamento','qtd_solicitada', 'preco_unit', 'preco_venda_total', 'remover'];

  


  //Dados da dialog
  //clinica: Clinica; //PDF
  //nr_cotacao = 0; //PDF
  //nr_fatura = 0; //PDF

  desabilitar: boolean = false; //Fatura
  desabilitar2: boolean = false; //Cotacao
  texto: string = "Faturar"; //Fatura
  texto2: string = "Cotar"; //Cotacao

  medicamentoFormGroup: FormGroup;
  medicamentos: Medicamento[] = [];
  medicamentos_aux: Medicamento[] = [];
  //medicamentos_adicionados: Medicamento[] = [];

  movimentos: MovimentoEstoque[] = [];
  movimentos_aux: MovimentoEstoque[] = [];
  movimento: MovimentoEstoque = new MovimentoEstoque();

  medicamento: Medicamento;
  //deposito: Deposito;
  //depositos: Deposito[];
  depositos_aux: Deposito[];
  preco_total:Number = 0;
  max: Number = 1;
  min: Number = 1;

  //dataSourse: MatTableDataSource<Medicamento>;
  dataSourse: MatTableDataSource<MovimentoEstoque>;
  displayedColumns = ['medicamento','qtd_solicitada', 'preco_unit', 'preco_venda_total', 'remover'];

  consulta?: Consulta;

  forma_pagamento = "";
  formas_pagamento = [
    {value: 'Numerário', viewValue: 'Numerário'},
    {value: 'Cartão de crédito', viewValue: 'Cartão de crédito'},
    {value: 'Convênio', viewValue: 'Convênio'},
  ]

  seguradora: Seguradora;

  nr_apolice = "";

  //cats_medicamento: CategoriaMedicamento[];
  cats_medicamento_aux: CategoriaMedicamento[];

  categoria: CategoriaMedicamento;
  categorias: CategoriaMedicamento[];
  categorias_aux: CategoriaMedicamento[];

  linhas: Linha[] = [];

  tipoEstoque: TipoEstoque;
  
  ano:string = (new Date()).getFullYear()+"";
  meses = ['Janeiro', 'Fevereiro', 'Marco', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  mes = this.meses[+(new Date().getMonth())];
  valor_entrada = 0;
  valor_acumulado = 0;

  paciente:Paciente;


  constructor(public estoqueService: EstoqueService,  public configServices: ConfiguracoesService, public snackBar: MatSnackBar,
    private _formBuilder: FormBuilder, public authService: AuthService) {
    this.deposito = new Deposito();
    this.seguradora = new Seguradora();
    this.tipoEstoque = new TipoEstoque();
    this.categoria = new CategoriaMedicamento();
    this.medicamento = new Medicamento();
    this.paciente = new Paciente();
    this.paciente.nome = "";
    this.paciente.apelido = "";
    this.paciente.nuit = "";
    this.paciente.nid = 0;

    this.medicamentoFormGroup = this._formBuilder.group({
      deposito: ['', Validators.required],
      medicamento: ['', Validators.required],
      qtd_solicitada: ['',  Validators.compose([Validators.required, CustomValidators.number({min: this.min, max: this.max})])],
      qtd_disponivel: ['', Validators.required],
      preco_venda_total: ['', Validators.required],
      preco: ['', Validators.required],
    });
    this.medicamentoFormGroup.controls['qtd_disponivel'].disable();
    this.medicamentoFormGroup.controls['preco'].disable();
    this.medicamentoFormGroup.controls['preco_venda_total'].disable();
  }

  ngOnInit() {
    //PROCESSAR NR DE COTACOES
    this.configServices.getNrsCotacao().snapshotChanges().subscribe(data => {
      this.nrscotacao = data.map(e => {
        return {
          id: e.payload.key,
          ...e.payload.val(),
        } as NrCotacao;
      });

      if(typeof this.nrscotacao !== 'undefined' && this.nrscotacao.length > 0){
        this.nr_cotacao = Math.max.apply(Math, this.nrscotacao.map(function(o) { return o.id; }));

        if(this.nr_cotacao.toString().substr(0,4) == new Date().getFullYear().toString()){
          //Se nao bater significa que mudamos de ano e precisamos recomecar a contagem    
          this.nr_cotacao = this.nr_cotacao+1;
        }else{
          this.nr_cotacao =  +(new Date().getFullYear()+'000001');
        }
        
      }else{
        this.nr_cotacao =  +(new Date().getFullYear()+'000001');
      }
      console.log("cotacao nr "+this.nr_cotacao);
      return this.nr_cotacao;
    })

    //PROCESSAR NR DE FATURAS
    this.configServices.getNrsFatura().snapshotChanges().subscribe(data => {
      this.nrsfaturcao = data.map(e => {
        return {
          id: e.payload.key,
          ...e.payload.val(),
        } as NrFatura;
      });

      if(typeof this.nrsfaturcao !== 'undefined' && this.nrsfaturcao.length > 0){
        this.nr_fatura = Math.max.apply(Math, this.nrsfaturcao.map(function(o) { return o.id; }));
        
        if(this.nr_fatura.toString().substr(0,4) == new Date().getFullYear().toString()){
          //Se nao bater significa que mudamos de ano e precisamos recomecar a contagem  
          this.nr_fatura = this.nr_fatura+1;
        }else{
          this.nr_fatura =  +(new Date().getFullYear()+'000001');
        }
        
      }else{
        this.nr_fatura =  +(new Date().getFullYear()+'000001');
      }
      console.log("fatura nr "+this.nr_fatura);
      return this.nr_fatura;
    })

    //DADOS DA CLINICA/FARMACIA
    this.configServices.getClinica().valueChanges()
    .take(1)
    .subscribe(c => {
      this.clinica = c;
    })

    //DEPOSITOS
    this.estoqueService.getDepositos().snapshotChanges().subscribe(data => {
      this.depositos = data.map(e => {
        return {
          id: e.payload.key,
          ...e.payload.val(),
        } as Deposito;
      })
      this.depositos_aux = this.depositos;
    })

    //SEGURADORAS
    this.configServices.getSeguradoras().snapshotChanges().subscribe(data => {
      this.seguradoras = data.map(e => {
        return {
          id: e.payload.key,
          ...e.payload.val(),
        } as Seguradora;
      })
    }) 

    //FORMA FARMACEUTICA
    this.estoqueService.getCategoriasMedicamento().snapshotChanges().subscribe(data => {
      this.cats_medicamento = data.map(e => {
        return {
          id: e.payload.key,
          ...e.payload.val(),
        } as CategoriaMedicamento;
      });
      this.cats_medicamento_aux = this.cats_medicamento;
    })

    //CATEGORIA MEDICAMENTO
    this.estoqueService.getTiposEstoque().snapshotChanges().subscribe(data => {
      this.tipos_estoque = data.map(e => {
        return {
          id: e.payload.key,
          ...e.payload.val(),
        } as TipoEstoque;
      });
    })

  }


  filtrodeposito;
  filtrarDepositos(filtrodeposito) {
    this.medicamento = new Medicamento();
    if(filtrodeposito){
      filtrodeposito = filtrodeposito.trim(); // Remove whitespace
      filtrodeposito = filtrodeposito.toLowerCase(); // Datasource defaults to lowercase matches
     
      this.depositos= null;

      this.depositos = this.depositos_aux.filter(item => item.nome.toLocaleLowerCase().indexOf(filtrodeposito) > -1);     
    }else{
      this.depositos = this.depositos_aux;
    }
  }

  filtrocategoria="";
  desabilitar_fm = true;
  filtrarCategorias(filtrocategoria: TipoEstoque) {
    console.log("filtrocategoria "+this.tipoEstoque.nome);
    if(filtrocategoria.nome == "Medicamento"){
      this.desabilitar_fm = false;
    }else{
      this.desabilitar_fm = true;
      this.categoria = null;
    }


    if(filtrocategoria){
     
      this.medicamentos= null;
      this.medicamentos = this.medicamentos_aux.filter(item => item.tipo.nome.indexOf(filtrocategoria.nome+"") > -1);     
    }else{
     // this.medicamentos = this.medicamentos_aux;
    }
  }

  filtromedicamento="";
  filtrarMedicamentos(filtromedicamento) {
    if(filtromedicamento){
      filtromedicamento = filtromedicamento.trim(); // Remove whitespace
      filtromedicamento = filtromedicamento.toLowerCase(); // Datasource defaults to lowercase matches
     
      this.medicamentos= null;
      this.medicamentos = this.medicamentos_aux.filter(item => item.nome_comercial.toLocaleLowerCase().indexOf(filtromedicamento) > -1);     
    }else{
      this.medicamentos = this.medicamentos_aux;
    }
  }

  filtrartipomedic="";
  filtrarTipoMedicamento(filtrartipomedic) {
    if(filtrartipomedic){
      filtrartipomedic = filtrartipomedic.trim(); // Remove whitespace
      filtrartipomedic = filtrartipomedic.toLowerCase(); // Datasource defaults to lowercase matches
     
      this.cats_medicamento = null;
      this.cats_medicamento = this.cats_medicamento_aux.filter(item => item.nome.toLocaleLowerCase().indexOf(filtrartipomedic) > -1);     
    }else{
      this.cats_medicamento = this.cats_medicamento_aux;
    }
  }

  f_farmaceutica="";
  filtrarmedicamento(f_farmaceutica){
    this.medicamento = new Medicamento();
    if(f_farmaceutica && f_farmaceutica !== ""){

      this.filtrarCategorias(this.tipoEstoque);

      this.medicamentos = this.medicamentos.filter(item => item.categoria.nome.indexOf(f_farmaceutica.nome) > -1);     
    }else{
      this.medicamentos = this.medicamentos_aux;
    }
  }

  precoSegurado = false;
  mudarFPagamento(){
    this.nr_apolice = "";
    this.seguradora = new Seguradora();
    if(this.medicamento.preco_venda){
      if(this.forma_pagamento == "Convênio"){
        this.precoSegurado = true;
      }else{
        this.precoSegurado = false;
      }
    }
    this.validarQtd(this.medicamento.qtd_solicitada);
  }

  getMedicamentos(deposito: Deposito){
    this.medicamentos = [];
    this.medicamentos_aux = [];
    this.medicamento = new Medicamento();
    this.max = 1;
    if(deposito.medicamentos){

      Object.keys(deposito.medicamentos).forEach(key=>{
        this.medicamentos.push(deposito.medicamentos[key]);
      })

      this.medicamentos_aux = this.medicamentos;
    }else{
      this.openSnackBar("Deposito sem medicamentos. Contacte o Admnistrativo");
    }
  }

  limitarQuantidade(){
    this.max = this.medicamento.qtd_disponivel;
    this.medicamentoFormGroup.controls['qtd_solicitada']
      .setValidators(CustomValidators.number({min: 1, max: this.medicamento.qtd_disponivel}));
  }

  validarQtd(qtd_solicitada){
    if(qtd_solicitada){

      if(this.forma_pagamento == "Convênio"){
        this.medicamento.preco_venda_total = qtd_solicitada*this.medicamento.preco_seguradora;
      }else{
        this.medicamento.preco_venda_total = qtd_solicitada*this.medicamento.preco_venda;
      }
      
    
    }else{
      this.medicamento.preco_venda_total = 0;
    }
  }

  addMedicamento(){
    if(this.medicamento.qtd_solicitada){

      let check = true;
      this.movimentos.forEach(md => {
        if(md.id == this.medicamento.id && md.deposito.id == this.deposito.id){
          check = false;
          return;
        }
      });

      if(check){
        if( Number(this.medicamento.qtd_solicitada) <= Number(this.medicamento.qtd_disponivel)){
          this.movimento.medicamento = this.medicamento;
          this.movimento.deposito = this.deposito;
          this.movimento.quantidade = this.medicamento.qtd_solicitada; 
          
          let linha = new Linha();
          linha.descricao_servico = this.medicamento.nome_comercial;
          linha.qtd_solicitada = this.medicamento.qtd_solicitada;
          linha.id_servico = this.medicamento.id;
    
          if(this.forma_pagamento == "Convênio"){
            this.movimento.medicamento.preco_venda_total = this.medicamento.preco_seguradora*this.medicamento.qtd_solicitada;
            this.preco_total = +this.preco_total + +(this.medicamento.preco_seguradora*this.medicamento.qtd_solicitada); 
            linha.preco_unitario = this.medicamento.preco_seguradora;
            linha.preco_total = this.medicamento.preco_seguradora*this.medicamento.qtd_solicitada;
          }else{
            this.movimento.medicamento.preco_venda_total = this.medicamento.preco_venda*this.medicamento.qtd_solicitada;
            this.preco_total = +this.preco_total + +(this.medicamento.preco_venda*this.medicamento.qtd_solicitada); 
            linha.preco_unitario = this.medicamento.preco_venda;
            linha.preco_total = this.medicamento.preco_seguradora*this.medicamento.qtd_solicitada;
          }
          
          let valor_tota_entrada = this.medicamento.valor_tota_entrada ? this.medicamento.valor_tota_entrada : 0;
          let valor_medio_entrada = this.medicamento.valor_medio_entrada ? this.medicamento.valor_medio_entrada : 0;
          if(this.medicamento.qtd_disponivel - this.medicamento.qtd_solicitada == 0){
            console.log("Valor de estoque unitario e toal vai alterar para zero");
          }else{
            console.log("Valor de estoque total vai alterar de "+valor_tota_entrada+" para "+valor_medio_entrada*(this.medicamento.qtd_disponivel - this.medicamento.qtd_solicitada))
          }

          this.movimento.deposito.valor_total = this.movimento.deposito.valor_total ? this.movimento.deposito.valor_total : 0;
          this.movimento.deposito.valor_total = +this.movimento.deposito.valor_total - +(+valor_medio_entrada * +this.medicamento.qtd_solicitada);
          console.log("Novo Valor Deposito "+this.movimento.deposito.valor_total);

          this.linhas.push(linha);
          //this.listarLinhas();
          this.texto = "Faturar "+ this.preco_total.toFixed(2).replace(".",",") +" MZN";
          this.medicamento.qtd_disponivel = +this.medicamento.qtd_disponivel - +this.medicamento.qtd_solicitada;

          this.movimentos.push(this.movimento);
          this.movimentos_aux = this.movimentos;
          this.dataSourse=new MatTableDataSource(this.movimentos);
    
          this.medicamento = new Medicamento();
          this.movimento = new MovimentoEstoque();
          this.max = 1;
        }else{
          this.openSnackBar("Qtd solicitada nao pode ser superior a quantidade disponivel");
        }
      }else{
        this.openSnackBar("Medicamento ja adicionado a lista");
      }
    }else{
      this.openSnackBar("Selecione um medicamento");
    }
  }

  removeMedicamento(mv: MovimentoEstoque){
    let linha = new Linha();
    linha.descricao_servico = mv.medicamento.nome_generico;
    linha.qtd_solicitada = mv.medicamento.qtd_solicitada;
    linha.preco_total = mv.medicamento.preco_venda;
    linha.preco_unitario = mv.medicamento.preco_venda / mv.medicamento.qtd_solicitada;

    mv.medicamento.qtd_disponivel = +mv.medicamento.qtd_disponivel + +mv.medicamento.qtd_solicitada;
    this.preco_total = +this.preco_total - (mv.medicamento.qtd_solicitada*mv.medicamento.preco_venda);
    this.texto = "Faturar "+ this.preco_total.toFixed(2).replace(".",",") +" MZN";
    this.movimentos.splice(this.movimentos.indexOf(mv), 1);
    this.movimentos_aux = this.movimentos;
    this.dataSourse=new MatTableDataSource(this.movimentos);

    //Resturando valor de estoque
    let valor_medio_entrada = mv.medicamento.valor_medio_entrada ? mv.medicamento.valor_medio_entrada : 0;
    mv.deposito.valor_total = mv.deposito.valor_total ? mv.deposito.valor_total : 0;
    mv.deposito.valor_total = +mv.deposito.valor_total + (+valor_medio_entrada * +mv.medicamento.qtd_solicitada);
    console.log("Novo Valor Deposito "+mv.deposito.valor_total);


    this.linhas.forEach(element => {
      if(element.id_servico == mv.medicamento.id){
        this.linhas.splice(this.linhas.indexOf(element), 1);
      }
    });

    //this.listarLinhas();
  }

  cotar(paciente: Paciente){
    if(this.movimentos.length>0){
      this.desabilitar2 = true;
      this.texto2 = "AGUARDE UM INSTANTE...";

      this.downloadPDF(this.movimentos, paciente, "Cotacao");
      this.texto2 = "Cotar";
      this.desabilitar2 = false;
      //this.desabilitar = false;
      this.cancelar();
    }else{
      this.openSnackBar("Adicione pelo menos um medicamento.");
    }
  }

  listarLinhas(){
    console.log("LISTAGEM DE LINHAS: ");
    this.linhas.forEach(element => {
      console.log(element.descricao_servico + ' /precounit ' +element.preco_unitario + ' /qtd '+element.qtd_solicitada);
      console.log("");
    });
  }

  faturar(paciente: Paciente){
    if(this.movimentos.length>0){ //Verificar se tem informacao no array
      var updatedUserData = {};

      if(this.forma_pagamento == "Convênio"){  
        if(this.nr_apolice == "" || this.nr_apolice == null){
          this.openSnackBar("Preencha o nr da apolice");
          return;
        }

        if(this.seguradora.nome == "" || this.seguradora.nome == null){
          this.openSnackBar("Selecione a seguradora");
          return;
        }
      }

      this.desabilitar = true;
      this.texto = "AGUARDE UM INSTANTE...";

      //Abrir uma CONSULTA CLINICA --------------------
      let dia = new Date().getDate();
      let mes = this.getMes(+(new Date().getMonth()) + +1);
      let ano = new Date().getFullYear();  
      this.consulta = new Consulta();
      this.consulta.data = dia +"/"+mes+"/"+ano;
      this.consulta.ano = ano;
      this.consulta.marcador = this.authService.get_perfil + ' - ' + this.authService.get_user_displayName;
      //this.consulta.paciente = paciente;
      this.consulta.paciente_nome = paciente.nome ? paciente.nome : "";
      this.consulta.paciente_apelido = paciente.apelido ? paciente.apelido : "";
      //this.consulta.paciente_nid = paciente.nid;
      this.consulta.movimentosestoque = this.movimentos;

      let servico = "Medicamentos: ";

      this.consulta.movimentosestoque.forEach(mvt => {
        //console.log("mvt.medicamento.qtd_solicitada: "+mvt.medicamento.qtd_solicitada);
        let valor_tota_entrada = mvt.medicamento.valor_tota_entrada ? mvt.medicamento.valor_tota_entrada : 0;
        let valor_medio_entrada = mvt.medicamento.valor_medio_entrada ? mvt.medicamento.valor_medio_entrada : 0;
        
        let vl = +(+valor_medio_entrada * +mvt.medicamento.qtd_solicitada).toFixed(2);

        mvt.medicamento.qtd_solicitada = null;

        
        if(mvt.medicamento.qtd_disponivel - mvt.medicamento.qtd_solicitada == 0){
          console.log("Valor de estoque unitario e toal vai alterar para zero");
          mvt.medicamento.valor_medio_entrada = 0;
          mvt.medicamento.valor_tota_entrada = 0;
        }else{
          console.log("Valor de estoque total vai alterar de "+valor_tota_entrada+" para "+valor_medio_entrada*(mvt.medicamento.qtd_disponivel - mvt.medicamento.qtd_solicitada))
          mvt.medicamento.valor_tota_entrada = valor_medio_entrada*(mvt.medicamento.qtd_disponivel - mvt.medicamento.qtd_solicitada);
        }

        //Gravando valor de estoque de depositos
        updatedUserData['/depositos/'+this.authService.get_clinica_id + '/'+mvt.deposito.id+'/valor_total'] = mvt.deposito.valor_total;

         //Gravando valor de estoque de depositos relatorio
         updatedUserData['/depositos_relatorio/'+this.authService.get_clinica_id + '/'+mvt.deposito.id+'/'+ this.ano+'/'+ this.mes+'/valor_acumulado'] = mvt.deposito.valor_total;

        //let vl = +valor_medio_entrada * +mvt.medicamento.qtd_solicitada;
        this.estoqueService.db.object('/depositos_relatorio/'+this.authService.get_clinica_id + '/'+mvt.deposito.id+'/'+ this.ano+'/'+ this.mes+'/valor_saida').query
        .ref.transaction(valor_saida => {
          if(valor_saida === null){
            console.log("entrou no null");
            valor_saida = vl;
            return valor_saida;
          }else{
            console.log("entrou no somatorio");
            valor_saida = +valor_saida + +vl;
            return valor_saida;
          }
        })

        mvt.deposito_nome = mvt.deposito.nome;
        mvt.deposito_id = mvt.deposito.id;
        //mvt.deposito = null;

        mvt.medicamento_nome = mvt.medicamento.nome_generico;
        mvt.medicamento_id = mvt.medicamento.id;
        servico = servico+" "+mvt.medicamento.nome_generico+" ; ";
        
        //mvt.medicamento = null;  
        
        mvt.data_movimento = dia +"/"+mes+"/"+ano;
        mvt.movimentador = this.authService.get_perfil + ' - ' + this.authService.get_user_displayName;
        mvt.tipo_movimento = "Saida por venda";

        //Gravando na tabela de depositos "depositos"
        updatedUserData['/depositos/'+this.authService.get_clinica_id + '/'+mvt.deposito_id+'/medicamentos/'+mvt.medicamento_id] = mvt.medicamento;

        //Gravando na tabela de movimentos "estoquesmovimentos"
        //eliminar redundancia de dados para dar agilidade e perfomance a base de dados
        //mvt.deposito_nome = mvt.deposito.nome;
        mvt.deposito = null;
        //mvt.medicamento_nome = mvt.medicamento.nome_comercial;
        let md = mvt.medicamento;
        mvt.medicamento = null;
        key = this.estoqueService.db.list('/estoquesmovimentos/'+this.authService.get_clinica_id).push('').key;
        updatedUserData['/estoquesmovimentos/'+this.authService.get_clinica_id+"/"+key] = mvt;
        mvt.medicamento = md;

        
        //console.log("PEGOU MEDICAMENTO: "+mvt.medicamento.nome_comercial)
      });
      this.consulta.status = "Encerrada";
      this.consulta.tipo = "MEDICAMENTO";      


      //Criar uma faturacao da consulta do tipo MEDICAMENTO --------------------
      let faturacao = new Faturacao();
      faturacao.categoria = "MEDICAMENTO";
      faturacao.valor = this.preco_total;
      faturacao.data = new Date();
      faturacao.mes = this.getMes(+new Date().getMonth()+ +1);
      faturacao.ano = new Date().getFullYear();
      faturacao.id = this.nr_fatura+"";

      let key = this.estoqueService.db.list('consultas/'+this.authService.get_clinica_id+'/lista_relatorio/'+ this.consulta.ano).push('').key;
      //console.log("Key faturacao e consultas:" +key);
        
      //Gravando na tabela de faturacao "faturacao"
      updatedUserData['faturacao/'+this.authService.get_clinica_id + '/'+faturacao.ano +'/'+this.nr_fatura] = faturacao;

      //Gravando na tabela de consultas
      //updatedUserData['consultas/'+this.authService.get_clinica_id+'/lista_completa/'+key] = this.consulta;
      updatedUserData['consultas/'+this.authService.get_clinica_id+'/lista_relatorio/'+ this.consulta.ano + '/'+key] = this.consulta;

      let conta = new Conta();
      conta.ano = ano;
      conta.mes = mes;
      conta.dia = dia;
      
      conta.data = dia +"/"+(+new Date().getMonth()+ +1)+"/"+ano;
      conta.cliente_nuit = paciente.nuit ? paciente.nuit : "";
      
      conta.cliente_apelido = this.consulta.paciente_apelido;
      conta.cliente_nome = this.consulta.paciente_nome;
      //conta.cliente_nid = this.consulta.paciente_nid;
      conta.forma_pagamento = this.forma_pagamento;    
      conta.consulta = servico;
      conta.linhas = this.linhas;
      conta.segunda_via = true;
      if(conta.forma_pagamento == "Convênio"){
        conta.categoria = "A receber";
        conta.nr_apolice = this.nr_apolice;
        conta.seguradora_nome = this.seguradora.nome;
        conta.valor_total = this.preco_total;
      }else{
        conta.categoria = "Recebida";
        conta.valor_total = this.preco_total;
        conta.data_recebimento = new Date();
      }

      if(conta.categoria == "A receber"){
        updatedUserData['contas/'+this.authService.get_clinica_id + '/'+faturacao.ano +'/receber/'+this.nr_fatura] = conta;
      }else{
        updatedUserData['contas/'+this.authService.get_clinica_id + '/'+faturacao.ano +'/recebidas/'+this.nr_fatura] = conta;
      }
    

      //GRAVAR SIMULTANEAMENTE TODOS OS DADOS E NAO HAVER INCONSISTENCIA
      let d = Object.assign({}, updatedUserData);
      this.estoqueService.updateEstoque(d) 
      .then(r =>{
        this.downloadPDF(this.movimentos, paciente, "Faturacao");  
        //this.dialogRef.close();
        //Limpar campos
        this.desabilitar = false;
        this.texto = "Faturar";
        this.cancelar();
        this.openSnackBar("Medicamento faturado com sucesso");
      }, err =>{
        this.openSnackBar("Ocorreu um erro ao cadastrar. Tente novamente ou contacte a equipe de suporte.");
      })

    }else{
      this.openSnackBar("Adicione pelo menos um medicamento.");
    }
  }

  cancelar(){
    //window.location.reload();
    this.texto = "Faturar";
    this.deposito = new Deposito();
    this.seguradora = new Seguradora();
    this.tipoEstoque = new TipoEstoque();
    this.categoria = new CategoriaMedicamento();
    this.medicamento = new Medicamento();
    this.paciente = new Paciente();
    this.paciente.nome = "";
    this.paciente.apelido = "";
    this.paciente.nuit = "";
    this.paciente.nid = 0;
    this.forma_pagamento = "";
    this.formas_pagamento = [
      {value: 'Numerário', viewValue: 'Numerário'},
      {value: 'Cartão de crédito', viewValue: 'Cartão de crédito'},
      {value: 'Convênio', viewValue: 'Convênio'},
    ]
    this.medicamentos = [];
    this.medicamentos_aux = [];
    this.movimentos = [];
    this.movimentos_aux = [];
    this.dataSourse=new MatTableDataSource(this.movimentos);

    this.medicamentoFormGroup = this._formBuilder.group({
      deposito: ['', Validators.required],
      medicamento: ['', Validators.required],
      qtd_solicitada: ['',  Validators.compose([Validators.required, CustomValidators.number({min: this.min, max: this.max})])],
      qtd_disponivel: ['', Validators.required],
      preco_venda_total: ['', Validators.required],
      preco: ['', Validators.required],
    });
    this.medicamentoFormGroup.controls['qtd_disponivel'].disable();
    this.medicamentoFormGroup.controls['preco'].disable();
    this.medicamentoFormGroup.controls['preco_venda_total'].disable();

    this.ngOnInit();
  }

  getMes(number): String{
    console.log("Get mes "+number)
    switch(number) { 
      case 1: { 
         return "Janeiro";
      } 
      case 2: { 
         return "Fevereiro"; 
      } 
      case 3: { 
         return "Marco"; 
      }
      case 4: { 
        return "Abril"; 
      }
      case 5: { 
        return "Maio"; 
      }
      case 6: { 
        return "Junho"; 
      }
      case 7: { 
        return "Julho"; 
      }
      case 8: { 
        return "Agosto"; 
      }  
      case 9: { 
        return "Setembro"; 
      }
      case 10: { 
        return "Outubro"; 
      }
      case 11: { 
        return "Novembro"; 
      }
      case 12: { 
        return "Dezembro"; 
      }
      default: { 
         //statements; 
         break; 
      } 
   } 
  }

    //GERAR PDFS
    public downloadPDF(movimentos :MovimentoEstoque[], paciente: Paciente, categoria){// criacao do pdf

      let nome = "";
      if(categoria == 'Cotacao'){
        nome = "COTAÇÃO";
      }else{
        nome = "RECIBO";
      }
    
      if(this.clinica.endereco){
        if(this.nr_cotacao > 0 && this.nr_fatura >0){
          
        
          if(categoria == 'Cotacao'){
            let nr_cotacao = new NrCotacao();
            nr_cotacao.id = this.nr_cotacao+"";
            let d = Object.assign({}, nr_cotacao); 
  
            this.configServices.addNrCotacao(d)
            .then(r =>{
      
              this.gerarPDF(movimentos , paciente, nome, d.id);
              
            }, err=>{
              this.openSnackBar("Ocorreu um erro ao gerar a "+ categoria +". Tente novamente.");
            })
          }else{
            let nr_fatura = new NrFatura();
            nr_fatura.id = this.nr_fatura+"";
            let d = Object.assign({}, nr_fatura); 
  
            this.configServices.addNrFatura(d)
            .then(r =>{
      
              this.gerarPDF(movimentos , paciente, nome, d.id);
              
            }, err=>{
              this.openSnackBar("Ocorreu um erro ao gerar a "+ categoria +". Tente novamente.");
            })
          }
          
  
        }else{
          this.openSnackBar("Ocorreu um erro ao gerar a "+ categoria +". Tente novamente.");
        }
      
      }else{
        this.openSnackBar("Ocorreu um erro ao gerar a "+ categoria +". Tente novamente.");
      }
       
  }//Fim download pdf
  
  
  gerarPDF(movimentos :MovimentoEstoque[], paciente: Paciente, nome, id){
    let doc = new jsPDF({
      orientation: 'p',
      unit: 'px',
      format: 'a4',
      putOnlyUsedFonts:true,
    });
  
    let specialElementHandlers ={
      '#editor': function(element,renderer){return true;} 
    }
    let dia = new Date().getDate();
    let mes = +(new Date().getMonth()) + +1;
    let ano = new Date().getFullYear();
    let dataemisao = dia +"/"+mes+"/"+ano;  
  
    var img = new Image();
    img.src ="../../../assets/images/FarmaciaBEM_SAUDE.png"; 
    doc.addImage(img,"PNG", 300, 40,90, 90);
    console.log("Fatura verio daqui");
  
    doc.setFont("Courier");
    doc.setFontStyle("normal"); 
    doc.setFontSize(12);
    doc.text(id+"", 225, 40);
    let item = 1;
    let preco_total = 0;
    let linha = 200;
    let string1 = "";
    let string2 = "";
    let string3 = "";
    let linhaAlternativo = 0;
    let linhaAlternativo2 = 0;              
    movimentos.forEach(element => {
      doc.text(item+"", 55, linha) //item
      doc.text(element.quantidade+"", 257, linha) //quantidade

      //doc.text(element.medicamento.nome_comercial , 95, linha) //descricao
      if(element.medicamento.nome_comercial.length > 26 && element.medicamento.nome_comercial.length > 52){
        string1 = element.medicamento.nome_comercial.substr(0,26);
        string2 = element.medicamento.nome_comercial.substr(26,26).trim();
        string3 = element.medicamento.nome_comercial.substr(52, +element.medicamento.nome_comercial.length).trim();
    
        linhaAlternativo = +linha+ +20;
        linhaAlternativo2 =  +linha+ +40;
    
        doc.text(string1 , 95, linha) //descricao
        doc.text(string2 , 95, linhaAlternativo) //descricao
        doc.text(string3 , 95, linhaAlternativo2) //descricao
    
      }else if(element.medicamento.nome_comercial.length > 26){
        string1 = element.medicamento.nome_comercial.substr(0,26);
        string2 = element.medicamento.nome_comercial.substr(26, +element.medicamento.nome_comercial.length).trim();
    
        linhaAlternativo = +linha+ +20;
    
        doc.text(string1 , 95, linha) //descricao
        doc.text(string2 , 95, linhaAlternativo) //descricao
      }
      else{
        doc.text(element.medicamento.nome_comercial , 95, linha) //descricao
      }

      if(this.forma_pagamento == "Convênio"){
        doc.text(element.medicamento.preco_seguradora.toFixed(2).replace(".",",")+"", 294, linha)
        doc.text((element.medicamento.preco_seguradora*element.quantidade).toFixed(2).replace(".",",")+"", 354, linha)
    
        preco_total = +preco_total + +element.medicamento.preco_seguradora*element.quantidade;

        //console.log("Pagou convenio");
      }else{
        doc.text(element.medicamento.preco_venda.toFixed(2).replace(".",",")+"", 294, linha)
        doc.text((element.medicamento.preco_venda*element.quantidade).toFixed(2).replace(".",",")+"", 354, linha)
    
        preco_total = +preco_total + +element.medicamento.preco_venda*element.quantidade;
        //console.log("Pagou normal");
      }

      
      item = +item + +1;

      if(linhaAlternativo > 0 && linhaAlternativo2 > 0){
        linha = +linha + +60;
      }else if(linhaAlternativo > 0){
        linha = +linha + +40;
      }else{
        linha = +linha + +20;
      }
    });   
     
    doc.setFont("Courier");
    doc.setFontStyle("normal"); 
    doc.setFontStyle("bold");
    doc.setFontSize(15);
  
    doc.text(nome+":", 170, 40);  
  
    doc.setFont("Courier");
    doc.setFontStyle("normal"); 
    doc.setFontSize(10);
  
    doc.text("Processado pelo computador", 170, 580);

    doc.text(this.clinica.endereco, 50, 65);
    doc.text(this.clinica.provincia+", "+this.clinica.cidade, 50,75);
    doc.text("Email: "+this.clinica.email, 50, 85);
    doc.text("Cell: "+this.clinica.telefone, 50, 95);
    doc.text("NUIT: "+this.clinica.nuit, 50, 105);
    
    doc.text("Nome do Paciente: "+paciente.nome, 50, 125);
    doc.text("NID: "+paciente.nid, 250, 125);
    doc.text("Apelido: "+paciente.apelido, 50, 145);
    doc.text("Data de emissão: "+dataemisao, 250, 145);
    let n = paciente.nuit ? paciente.nuit : ""; //Trabalhando o NUIT por nao ser campo obrigatorio pode estar nulo
    doc.text("NUIT do paciente: "+n, 50, 165);


    doc.setFillColor(50,50,50);
    doc.rect ( 50, 170 , 40 , 20 ); 
    doc.rect (  50, 190 , 40 , 320 ); 
  
    doc.rect (  90, 170 , 150 , 20 ); 
    doc.rect (  90, 190 , 150 , 320 );
  
    doc.rect (  240, 170 , 50 , 20 ); 
    doc.rect (  240, 190 , 50 , 320 );
  
    doc.rect (  290, 170 , 60 , 20 ); 
    doc.rect (  290, 190 , 60 , 320 );
  
    doc.rect (  350, 170 , 50 , 20 ); 
    doc.rect (  350, 190 , 50 , 320);
  
    doc.rect ( 290, 510 , 110 , 20 );
  
    doc.setFontStyle("bold");
    doc.text("Item", 60, 180);
    doc.text("Descrição", 120, 180);
    doc.text("Quantd", 245, 180);
    doc.text("Preço Unit", 295, 180);
    doc.text("Preç Tot", 355, 180);
    doc.text("Total: "+preco_total.toFixed(2).replace(".",",")+" MZN", 293, 525);
  
    doc.rect (  290, 170 , 60 , 20 ); 
    doc.rect (  290, 190 , 60 , 320 );
  
    doc.save(nome+ id +'.pdf'); 
  }
  

  openSnackBar(mensagem) {
    this.snackBar.open(mensagem, null,{
      duration: 2000
    })
  }

}
