import { Component, AfterViewInit, ViewChild } from '@angular/core';
import { PacienteService } from '../services/paciente.service';
import { Paciente } from '../classes/paciente';
import { ConfiguracoesService } from '../services/configuracoes.service';
import { DiagnosticoAuxiliar } from '../classes/diagnostico_aux';
import { Consulta } from '../classes/consulta';
import { Faturacao } from '../classes/faturacao';
import { MatTableDataSource, MatPaginator, MatSort, MatSnackBar } from '@angular/material';
import { OnInit} from '@angular/core';
import { Inject} from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';

import * as jsPDF from 'jspdf';
import { format } from 'util';
//import { format } from 'path';

import * as FusionCharts from 'fusioncharts';
import { AuthService } from '../services/auth.service';
import { User } from '../classes/user';
import { Deposito, DepositoRelatorio } from '../classes/deposito';
import { EstoqueService } from '../services/estoque.service';

@Component({
  //selector: 'app-dashboard',
  selector: 'dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {

  perfil = "";
  acesso_indicadores = false;
  acesso_indicadores2 = false;

  acesso_indicadores3 = false; //Filtros de clinica
  acesso_indicadores4 = false; //Filtros de farmacia
  username = "";

  pacientes: Paciente[];
  diagnosticos: DiagnosticoAuxiliar[];
  consultas: Consulta[];
  consultas_encerradas_medicas: any; //Consultas medicas pendentes do tipo Consulta Medica
  consultas_encerradas_diagnosticos: any; //Consultas medicas pendentes do tipo Diagnostico Aux
  consultas_encerradas_condutas: any; //Consultas medicas pendentes do tipo Conduta clinica
  pieChartLabels: String[] = [];
  pieChartDatas: any[] = [];
  faturacoes: Faturacao[];


  //ComboChartData: Array <any>;

  jan_consulta_nr = 0;
  jan_consulta_valor = 0;
  fev_consulta_nr = 0;
  fev_consulta_valor = 0;
  marc_consulta_nr = 0;
  marc_consulta_valor = 0;
  abril_consulta_nr = 0;
  abril_consulta_valor = 0;
  maio_consulta_nr = 0;
  maio_consulta_valor = 0;
  junho_consulta_nr = 0;
  junho_consulta_valor = 0;
  julh_consulta_nr = 0;
  julh_consulta_valor = 0;
  agos_consulta_nr = 0;
  agos_consulta_valor = 0;
  set_consulta_nr = 0;
  set_consulta_valor = 0;
  out_consulta_nr = 0;
  out_consulta_valor = 0;
  nov_consulta_nr = 0;
  nov_consulta_valor = 0;
  dez_consulta_nr = 0;
  dez_consulta_valor = 0;
  total_valor = 0 ;

  jan_diagnostico = 0;
  fev_diagnostico = 0;
  marc_diagnostico = 0;
  abril_diagnostico = 0;
  maio_diagnostico = 0;
  junho_diagnostico = 0;
  julh_diagnostico = 0;
  agos_diagnostico = 0;
  set_diagnostico = 0;
  out_diagnostico = 0;
  nov_diagnostico = 0;
  dez_diagnostico = 0;

  um_valor = 0
  dois_valor = 0
  tres_valor = 0
  quatro_valor = 0
  cinco_valor = 0
  seis_valor = 0
  sete_valor = 0
  oito_valor = 0
  nove_valor = 0
  dez_valor = 0
  onze_valor = 0
  doze_valor = 0
  treze_valor = 0
  catorze_valor = 0
  quinze_valor = 0
  dezasseis_valor = 0
  dezassete_valor = 0
  dezoito_valor = 0
  dezanove_valor = 0
  vinte_valor = 0
  vinteum_valor = 0
  vintedois_valor = 0
  vintetrez_valor = 0
  vintequatro_valor = 0
  vintecinco_valor = 0
  vinteseis_valor = 0
  vintesete_valor = 0
  vinteoito_valor = 0
  vintenove_valor = 0
  trinta_valor = 0
  trintaum_valor = 0

  anos = [];
  ano:string = (new Date()).getFullYear()+"";
  meses = ['Janeiro', 'Fevereiro', 'Marco', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  mes = this.meses[+(new Date().getMonth())];
  
  faturacoesMedico: FaturacaoMedico[] = [];

  faturacoesCategoria: FaturacaoCategoria[] = [];
  categoria_qtd_MEDICAMENTO = 0; //Qtd de vendas de medicamento e nao qtd de medicamentos  vendidos
  categoria_qtd_CONSULTA_MEDICA = 0; //Qtd de vendas de consultas medicas
  categoria_qtd_DIAGNOSTICO_AUX = 0; //Qtd de vendas de diagnosticos
  categoria_qtd_CONDUTA = 0; //Qtd de Vendas de condutas

  categoria_valor_MEDICAMENTO = 0; //Valor por vendas de medicamentos
  categoria_valor_CONSULTA_MEDICA = 0; //Valor por vendas de consulta medica
  categoria_valor_DIAGNOSTICO_AUX = 0; //Valor por vendas de diagnosticos aux
  categoria_valor_CONDUTA = 0; //Valor por vendas de vendas de 
  
  categoria_valor_MEDICAMENTO_ano = 0; //Valor por vendas de medicamentos
  categoria_valor_CONSULTA_MEDICA_ano = 0; //Valor por vendas de consulta medica
  categoria_valor_DIAGNOSTICO_AUX_ano = 0; //Valor por vendas de diagnosticos aux
  categoria_valor_CONDUTA_ano = 0; //Valor por vendas de vendas de conduta

  categoria_percentual_MEDICAMENTO = 0 //Percentual de valor por vendas de vendas de conduta
  categoria_percentual_CONSULTA_MEDICA = 0 //Percentual de valor por vendas de vendas de consulta medica
  categoria_percentual_DIAGNOSTICO_AUX = 0 //Percentual de valor por vendas de vendas de diagnosticos
  categoria_percentual_CONDUTA = 0 //Percentual de valor por vendas de vendas de conduta


  //ESTOQUE
  jan_estoque_acumulado = 0;
  jan_estoque_entrada = 0;
  jan_estoque_saida = 0;
  fev_estoque_acumulado = 0;
  fev_estoque_entrada = 0;
  fev_estoque_saida = 0;
  marc_estoque_acumulado = 0;
  marc_estoque_entrada = 0;
  marc_estoque_saida = 0;
  abril_estoque_acumulado = 0;
  abril_estoque_entrada = 0;
  abril_estoque_saida = 0;
  maio_estoque_acumulado = 0;
  maio_estoque_entrada = 0;
  maio_estoque_saida = 0;
  jun_estoque_acumulado = 0;
  jun_estoque_entrada = 0;
  jun_estoque_saida = 0;
  julho_estoque_acumulado = 0;
  julho_estoque_entrada = 0;
  julho_estoque_saida = 0;
  ago_estoque_acumulado = 0;
  ago_estoque_entrada = 0;
  ago_estoque_saida = 0;
  set_estoque_acumulado = 0;
  set_estoque_entrada = 0;
  set_estoque_saida = 0;
  out_estoque_acumulado = 0;
  out_estoque_entrada = 0;
  out_estoque_saida = 0;
  nov_estoque_acumulado = 0;
  nov_estoque_entrada = 0;
  nov_estoque_saida = 0;
  dez_estoque_acumulado = 0;
  dez_estoque_entrada = 0;
  dez_estoque_saida = 0;


  dataSourse: MatTableDataSource<FaturacaoMedico>;
  displayedColumns = ['Medico','Categoria', 'Ano', 'Mes', 'Valor'];
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  users: User[] = [];
  medicos = ["Todos"];
  medico = "Todos";

  depositos: Deposito[] = []; //Pegar chaves de depositos para filtros
  //deposito_id = "";
  //deposito_nome = ""; 
  deposito = new Deposito();
  depositos_relatorio : DepositoRelatorio[] = [];

  constructor(private pacienteService: PacienteService, private configService: ConfiguracoesService, private estoqueService: EstoqueService,
    public authService: AuthService, public dialog: MatDialog){
  }


  ngOnInit() {
    setTimeout(() => {
      this.perfil = this.authService.get_perfil;
      this.username = this.authService.get_user_displayName;
      //console.log("Mes selecionado: "+this.mes);

      if(this.perfil == 'Clinica_Admin'){
        this.acesso_indicadores = true;
        this.acesso_indicadores2 = true;
        this.acesso_indicadores3 = false;
        this.acesso_indicadores4 = true;
      }else if(this.perfil == 'Farmacia_Admin'){
        this.acesso_indicadores = true;
        this.acesso_indicadores2 = false;
        this.acesso_indicadores3 = true;
        this.acesso_indicadores4 = false;
      }
      this.configService.getAnos().snapshotChanges().subscribe(data => {
        this.anos = data.map(e => {
          return {
            id: e.payload.key
          }
        })
      })
  
      this.pacienteService.getPacientes().snapshotChanges().subscribe(data => {
        this.pacientes = data.map(e => {
          return {
            id: e.payload.key,
            ...e.payload.val(),
          } as Paciente;
        })      
      })
  
      this.configService.getDiagnosticos().snapshotChanges().subscribe(data => {
        this.diagnosticos = data.map(e => {
          return {
            id: e.payload.key,
            ...e.payload.val(),
          } as DiagnosticoAuxiliar;
        })
      })
  
      /*this.pacienteService.getConsultas().snapshotChanges().subscribe(data => {
        this.consultas = data.map(e => {
          return {
            id: e.payload.key,
            ...e.payload.val(),
          } as Consulta;
        })
        this.consultas_encerradas_medicas = this.consultas.filter( c => c.status === "Encerrada" && c.tipo == "Consulta Medica").length;
        
        this.consultas_encerradas_diagnosticos = this.consultas.filter( c => c.status === "Encerrada" && c.tipo == "DIAGNOSTICO AUX").length;
        
        this.consultas_encerradas_condutas = this.consultas.filter( c => c.status === "Encerrada" && c.tipo == "CONDUTA CLINICA").length;
        
        this.consultas.filter( c => c.tipo == "Consulta Medica").forEach(element => {
          if(element.diagnosticos_aux){
            if(element.diagnosticos_aux.length>0){
              this.consultas_encerradas_diagnosticos = +this.consultas_encerradas_diagnosticos + +1;
            }
          }
        });
  
      })*/

      this.zerarDados();

      this.estoqueService.getDepositos().snapshotChanges().subscribe(data => {
        this.depositos = data.map(e => {
          return {
            id: e.payload.key,
            nome: e.payload.val()['nome'] as string,
          } as Deposito;
        })
        
        this.deposito = this.depositos[0];
        //this.deposito_id = this.depositos[0].id+"";
        //this.deposito_nome = this.depositos[0].nome+"";

        this.estoqueService.getDepositoRelatorioSemiParcial(this.ano, this.deposito.id).snapshotChanges().subscribe(data => {
          this.depositos_relatorio = data.map(e => {
            return {
              id: e.payload.key,
              ...e.payload.val(),
            } as DepositoRelatorio;
          })

          this.depositos_relatorio.forEach(element => {
            
            switch(element.id) { //id representa o MES
              case "Janeiro": { 
                this.jan_estoque_acumulado = element.valor_acumulado ? element.valor_acumulado : 0;
                this.jan_estoque_entrada = element.valor_entrada ? element.valor_entrada : 0;
                this.jan_estoque_saida = element.valor_saida ? element.valor_saida : 0;
                break;
              } 
              case "Fevereiro": { 
                this.fev_estoque_acumulado = element.valor_acumulado ? element.valor_acumulado : 0;
                this.fev_estoque_entrada = element.valor_entrada ? element.valor_entrada : 0;
                this.fev_estoque_saida = element.valor_saida ? element.valor_saida : 0;
                break;
              } 
              case "Marco": { 
                this.marc_estoque_acumulado = element.valor_acumulado ? element.valor_acumulado : 0;
                this.marc_estoque_entrada = element.valor_entrada ? element.valor_entrada : 0;
                this.marc_estoque_saida = element.valor_saida ? element.valor_saida : 0;
                break ; 
              }
              case "Abril": { 
                this.abril_estoque_acumulado = element.valor_acumulado ? element.valor_acumulado : 0;
                this.abril_estoque_entrada = element.valor_entrada ? element.valor_entrada : 0;
                this.abril_estoque_saida = element.valor_saida ? element.valor_saida : 0;
                break ; 
              }
              case "Maio": { 
                this.maio_estoque_acumulado = element.valor_acumulado ? element.valor_acumulado : 0;
                this.maio_estoque_entrada = element.valor_entrada ? element.valor_entrada : 0;
                this.maio_estoque_saida = element.valor_saida ? element.valor_saida : 0;
                break ; 
              }
              case "Junho": { 
                this.jun_estoque_acumulado = element.valor_acumulado ? element.valor_acumulado : 0;
                this.jun_estoque_entrada = element.valor_entrada ? element.valor_entrada : 0;
                this.jun_estoque_saida = element.valor_saida ? element.valor_saida : 0;
                break ; 
              }
              case "Julho": { 
                this.julho_estoque_acumulado = element.valor_acumulado ? element.valor_acumulado : 0;
                this.julho_estoque_entrada = element.valor_entrada ? element.valor_entrada : 0;
                this.julho_estoque_saida = element.valor_saida ? element.valor_saida : 0;
                break; 
              }
              case "Agosto": { 
                this.ago_estoque_acumulado = element.valor_acumulado ? element.valor_acumulado : 0;
                this.ago_estoque_entrada = element.valor_entrada ? element.valor_entrada : 0;
                this.ago_estoque_saida = element.valor_saida ? element.valor_saida : 0;
                break; 
              }  
              case "Setembro": { 
                this.set_estoque_acumulado = element.valor_acumulado ? element.valor_acumulado : 0;
                this.set_estoque_entrada = element.valor_entrada ? element.valor_entrada : 0;
                this.set_estoque_saida = element.valor_saida ? element.valor_saida : 0;
                break; 
              }
              case "Outubro": { 
                this.out_estoque_acumulado = element.valor_acumulado ? element.valor_acumulado : 0;
                this.out_estoque_entrada = element.valor_entrada ? element.valor_entrada : 0;
                this.out_estoque_saida = element.valor_saida ? element.valor_saida : 0;
                break; 
              }
              case "Novembro": { 
                this.nov_estoque_acumulado = element.valor_acumulado ? element.valor_acumulado : 0;
                this.nov_estoque_entrada = element.valor_entrada ? element.valor_entrada : 0;
                this.nov_estoque_saida = element.valor_saida ? element.valor_saida : 0;
                break; 
              }
              case "Dezembro": { 
                this.dez_estoque_acumulado = element.valor_acumulado ? element.valor_acumulado : 0;
                this.dez_estoque_entrada = element.valor_entrada ? element.valor_entrada : 0;
                this.dez_estoque_saida = element.valor_saida ? element.valor_saida : 0;
                break; 
              }
              default: { 
                 //statements; 
                 break; 
              } 
           }//Fim switch case 

          });//Fim do foreach

          this.barChartData_MovimentosEstoque = [{
            data: [this.jan_estoque_entrada.toFixed(2), this.fev_estoque_entrada.toFixed(2), this.marc_estoque_entrada.toFixed(2), this.abril_estoque_entrada.toFixed(2), this.maio_estoque_entrada.toFixed(2), this.jun_estoque_entrada.toFixed(2), this.julho_estoque_entrada.toFixed(2), this.ago_estoque_entrada.toFixed(2), this.set_estoque_entrada.toFixed(2), this.out_estoque_entrada.toFixed(2), this.nov_estoque_entrada.toFixed(2), this.dez_estoque_entrada.toFixed(2)],
            label: 'Valor de entrada',
            borderWidth: 0
          }, {
            data: [this.jan_estoque_saida.toFixed(2), this.fev_estoque_saida.toFixed(2), this.marc_estoque_saida.toFixed(2), this.abril_estoque_saida.toFixed(2), this.maio_estoque_saida.toFixed(2), this.jun_estoque_saida, this.julho_estoque_saida.toFixed(2), this.ago_estoque_saida.toFixed(2), this.set_estoque_saida.toFixed(2), this.out_estoque_saida.toFixed(2), this.nov_estoque_saida.toFixed(2), this.dez_estoque_saida.toFixed(2)],
            label: 'Valor de saida',
            borderWidth: 0
          }];

          this.barChartData_FechamentoEstoque = [{
            data: [this.jan_estoque_acumulado.toFixed(2), this.fev_estoque_acumulado.toFixed(2), this.marc_estoque_acumulado.toFixed(2), this.abril_estoque_acumulado.toFixed(2), this.maio_estoque_acumulado.toFixed(2), this.jun_estoque_acumulado.toFixed(2), this.julho_estoque_acumulado.toFixed(2), this.ago_estoque_acumulado.toFixed(2), this.set_estoque_acumulado.toFixed(2), this.out_estoque_acumulado.toFixed(2), this.nov_estoque_acumulado.toFixed(2), this.dez_estoque_acumulado.toFixed(2)],
            label: 'Valor de estoque por mês',
            borderWidth: 0
          }];

        })

      })
      

      

      this.pacienteService.getConsultasRelatorio(this.ano).snapshotChanges().subscribe(data => {
        this.consultas = data.map(e => {
          return {
            id: e.payload.key,
            ...e.payload.val(),
          } as Consulta;
        })

        if(this.medico == "Todos"){
          this.consultas_encerradas_medicas = this.consultas.filter( c => c.tipo == "Consulta Medica").length;
          this.consultas_encerradas_diagnosticos = this.consultas.filter( c => c.tipo == "DIAGNOSTICO AUX").length;
          this.consultas_encerradas_condutas = this.consultas.filter( c => c.tipo == "CONDUTA CLINICA").length;
        }else{
          this.consultas_encerradas_medicas = this.consultas.filter( c => c.tipo == "Consulta Medica" && c.medico_nome == this.medico).length;
          this.consultas_encerradas_diagnosticos = this.consultas.filter( c => c.tipo == "DIAGNOSTICO AUX" && c.medico_nome == this.medico).length;
          this.consultas_encerradas_condutas = this.consultas.filter( c => c.tipo == "CONDUTA CLINICA" && c.medico_nome == this.medico).length;
        }
        
  
      })
  
      this.faturacoesMedico = [];
      this.faturacoesCategoria = [];

      this.pacienteService.getFaturacoes(this.ano).snapshotChanges().subscribe(data => {
        this.faturacoes = data.map(e => {
          return {
            id: e.payload.key,
            ...e.payload.val(),
          } as Faturacao;
        }) 
        
        this.faturacoes.forEach(element => {
          this.total_valor = +this.total_valor + +element.valor;

          //let dia = new Date(element.data).getDay();
          //dia = +dia + +1;
          let dia = new Date(element.data).toISOString().substr(8,2);

          switch(element.categoria){
            case "CONDUTA CLINICA": {
              //this.categoria_qtd_CONDUTA = +this.categoria_qtd_CONDUTA + +1;
              this.categoria_valor_CONDUTA_ano = +this.categoria_valor_CONDUTA_ano + +element.valor;
              break;
            }

            case "DIAGNOSTICO_AUX": {
              //this.categoria_qtd_DIAGNOSTICO_AUX = +this.categoria_qtd_DIAGNOSTICO_AUX + +1;
              this.categoria_valor_DIAGNOSTICO_AUX_ano = +this.categoria_valor_DIAGNOSTICO_AUX_ano + +element.valor;
              break;
            }

            case "CONSULTA_MEDICA": {
              //this.categoria_qtd_CONSULTA_MEDICA = +this.categoria_qtd_CONSULTA_MEDICA + +1;
              this.categoria_valor_CONSULTA_MEDICA_ano = +this.categoria_valor_CONSULTA_MEDICA_ano + +element.valor;
              break;
            }

            case "MEDICAMENTO": {
              //this.categoria_qtd_MEDICAMENTO = +this.categoria_qtd_MEDICAMENTO + +1;
              this.categoria_valor_MEDICAMENTO_ano = +this.categoria_valor_MEDICAMENTO_ano + +element.valor;
              break;
            }
          }

         if(this.mes == element.mes){

          switch(element.categoria){
            case "CONDUTA CLINICA": {
              this.categoria_qtd_CONDUTA = +this.categoria_qtd_CONDUTA + +1;
              this.categoria_valor_CONDUTA = +this.categoria_valor_CONDUTA + +element.valor;
              break;
            }

            case "DIAGNOSTICO_AUX": {
              this.categoria_qtd_DIAGNOSTICO_AUX = +this.categoria_qtd_DIAGNOSTICO_AUX + +1;
              this.categoria_valor_DIAGNOSTICO_AUX = +this.categoria_valor_DIAGNOSTICO_AUX + +element.valor;
              break;
            }

            case "CONSULTA_MEDICA": {
              this.categoria_qtd_CONSULTA_MEDICA = +this.categoria_qtd_CONSULTA_MEDICA + +1;
              this.categoria_valor_CONSULTA_MEDICA = +this.categoria_valor_CONSULTA_MEDICA + +element.valor;
              break;
            }

            case "MEDICAMENTO": {
              this.categoria_qtd_MEDICAMENTO = +this.categoria_qtd_MEDICAMENTO + +1;
              this.categoria_valor_MEDICAMENTO = +this.categoria_valor_MEDICAMENTO + +element.valor;
              break;
            }
          }

          //this.categoria_percentual_CONDUTA =  (this.categoria_valor_CONDUTA /this.total_valor)*100;
          //this.categoria_percentual_DIAGNOSTICO_AUX = (this.categoria_valor_DIAGNOSTICO_AUX /this.total_valor)*100;
          //this.categoria_percentual_MEDICAMENTO = (this.categoria_valor_MEDICAMENTO /this.total_valor)*100;
          //this.categoria_percentual_CONSULTA_MEDICA = (this.categoria_valor_CONSULTA_MEDICA /this.total_valor)*100;

          /*let faturacaoMedico = new FaturacaoMedico();
          faturacaoMedico.ano = element.ano;
          faturacaoMedico.mes = element.mes;
          faturacaoMedico.valor = element.valor;
          faturacaoMedico.medico = element.medico_nome;
          faturacaoMedico.categoria = element.categoria;
          this.faturacoesMedico.push(faturacaoMedico);*/

          switch(dia) {

            case "01": {
              this.um_valor = +this.um_valor + +element.valor;
              break;
            }

            case "02": {
              this.dois_valor = +this.dois_valor + +element.valor;
              break;
            }

            case "03": {
              this.tres_valor = +this.tres_valor + +element.valor;
              break;
            }
            
            case "04": {
              this.quatro_valor = +this.quatro_valor + +element.valor;
              break;
            }

            case "05": {
              this.cinco_valor = +this.cinco_valor + +element.valor;
              break;
            }

            case "06": {
              this.seis_valor = +this.seis_valor + +element.valor;
              break;
            }

            case "07": {
              this.sete_valor = +this.sete_valor + +element.valor;
              break;
            }

            case "08": {
              this.oito_valor = +this.oito_valor + +element.valor;
              break;
            }

            case "09": {
              this.nove_valor = +this.nove_valor + +element.valor;
              break;
            }

            case "10": {
              this.dez_valor = +this.dez_valor + +element.valor;
              break;
            }

            case "11": {
              this.onze_valor = +this.onze_valor + +element.valor;
              break;
            }

            case "12": {
              this.doze_valor = +this.doze_valor + +element.valor;
              break;
            }

            case "13": {
              this.treze_valor = +this.treze_valor + +element.valor;
              break;
            }

            case "14": {
              this.catorze_valor = +this.catorze_valor + +element.valor;
              break;
            }

            case "15": {
              this.quinze_valor = +this.quinze_valor + +element.valor;
              break;
            }

            case "16": {
              this.dezasseis_valor = +this.dezasseis_valor + +element.valor;
              break;
            }

            case "17": {
              this.dezassete_valor = +this.dezassete_valor + +element.valor;
              break;
            }

            case "18": {
              this.dezoito_valor = +this.dezoito_valor + +element.valor;
              break;
            }

            case "19": {
              this.dezanove_valor = +this.dezanove_valor + +element.valor;
              break;
            }

            case "20": {
              this.vinte_valor = +this.vinte_valor + +element.valor;
              break;
            }

            case "21": {
              this.vinteum_valor = +this.vinteum_valor + +element.valor;
              break;
            }

            case "22": {
              this.vintedois_valor = +this.vintedois_valor + +element.valor;
              break;
            }

            case "23": {
              this.vintetrez_valor = +this.vintetrez_valor + +element.valor;
              break;
            }

            case "24": {
              this.vintequatro_valor = +this.vintequatro_valor + +element.valor;
              break;
            }

            case "25": {
              this.vintecinco_valor = +this.vintecinco_valor + +element.valor;
              break;
            }

            case "26": {
              this.vinteseis_valor = +this.vinteseis_valor + +element.valor;
              break;
            }

            case "27": {
              this.vintesete_valor = +this.vintesete_valor + +element.valor;
              break;
            }

            case "28": {
              this.vinteoito_valor = +this.vinteoito_valor + +element.valor;
              break;
            }

            case "29": {
              this.vintenove_valor = +this.vintenove_valor + +element.valor;
              break;
            }

            case "30": {
              this.trinta_valor = +this.trinta_valor + +element.valor;
              break;
            }

            case "31": {
              this.trintaum_valor = +this.trintaum_valor + +element.valor;
              break;
            }

            default: { 
              //statements; 
              break; 
           } 

          }
         }

         switch(element.mes) { 
          case "Janeiro": { 
            this.jan_consulta_nr = +this.jan_consulta_nr + +1;
            this.jan_consulta_valor = +this.jan_consulta_valor+ +element.valor;
             break;
          } 
          case "Fevereiro": { 
            this.fev_consulta_nr = +this.fev_consulta_nr + +1;
            this.fev_consulta_valor = +this.fev_consulta_valor+ +element.valor;
            break;
          } 
          case "Marco": { 
            this.marc_consulta_nr = +this.marc_consulta_nr + +1;
            this.marc_consulta_valor = +this.marc_consulta_valor+ +element.valor;
            break ; 
          }
          case "Abril": { 
            this.abril_consulta_nr = +this.abril_consulta_nr + +1;
            this.abril_consulta_valor = +this.abril_consulta_valor+ +element.valor;
            break ; 
          }
          case "Maio": { 
            this.maio_consulta_nr = +this.maio_consulta_nr + +1;
            this.maio_consulta_valor = +this.maio_consulta_valor+ +element.valor;
            break ; 
          }
          case "Junho": { 
            this.junho_consulta_nr = +this.junho_consulta_nr + +1;
            this.junho_consulta_valor = +this.junho_consulta_valor+ +element.valor;
            break ; 
          }
          case "Julho": { 
            this.julh_consulta_nr = +this.julh_consulta_nr + +1;
            this.julh_consulta_valor = +this.julh_consulta_valor+ +element.valor;
            break; 
          }
          case "Agosto": { 
            this.agos_consulta_nr = +this.agos_consulta_nr + +1;
            this.agos_consulta_valor = +this.agos_consulta_valor+ +element.valor;
            break; 
          }  
          case "Setembro": { 
            this.set_consulta_nr = +this.set_consulta_nr + +1;
            this.set_consulta_valor = +this.set_consulta_valor+ +element.valor;
            break; 
          }
          case "Outubro": { 
            this.out_consulta_nr = +this.out_consulta_nr + +1;
            this.out_consulta_valor = +this.out_consulta_valor+ +element.valor;
            break; 
          }
          case "Novembro": { 
            this.nov_consulta_nr = +this.nov_consulta_nr + +1;
            this.nov_consulta_valor = +this.nov_consulta_valor+ +element.valor;
            break; 
          }
          case "Dezembro": { 
            this.dez_consulta_nr = +this.dez_consulta_nr + +1;
            this.dez_consulta_valor = +this.dez_consulta_valor+ +element.valor;
            break; 
          }
          default: { 
             //statements; 
             break; 
          } 
       }//Fim switch case 

  
          /*if(element.categoria == "DIAGNOSTICO_AUX"){
  
            switch(element.mes) { 
              case "Janeiro": { 
                this.jan_diagnostico = +this.jan_diagnostico + +1;
                this.jan_consulta_valor = +this.jan_consulta_valor+ +element.valor;
                 break;
              } 
              case "Fevereiro": { 
                this.fev_diagnostico = +this.fev_diagnostico + +1;
                this.fev_consulta_valor = +this.fev_consulta_valor+ +element.valor;
                break;
              } 
              case "Marco": { 
                this.marc_diagnostico = +this.marc_diagnostico + +1;
                this.marc_consulta_valor = +this.marc_consulta_valor+ +element.valor;
                break ; 
              }
              case "Abril": { 
                this.abril_diagnostico = +this.abril_diagnostico + +1;
                this.abril_consulta_valor = +this.abril_consulta_valor+ +element.valor;
                break ; 
              }
              case "Maio": { 
                this.maio_diagnostico = +this.maio_diagnostico + +1;
                this.maio_consulta_valor = +this.maio_consulta_valor+ +element.valor;
                break ; 
              }
              case "Junho": { 
                this.junho_diagnostico = +this.junho_diagnostico + +1;
                this.junho_consulta_valor = +this.junho_consulta_valor+ +element.valor;
                break ; 
              }
              case "Julho": { 
                this.julh_diagnostico = +this.julh_diagnostico + +1;
                this.julh_consulta_valor = +this.julh_consulta_valor+ +element.valor;
                break; 
              }
              case "Agosto": { 
                this.agos_diagnostico = +this.agos_diagnostico + +1;
                this.agos_consulta_valor = +this.agos_consulta_valor+ +element.valor;
                break; 
              }  
              case "Setembro": { 
                this.set_diagnostico = +this.set_diagnostico + +1;
                this.set_consulta_valor = +this.set_consulta_valor+ +element.valor;
                break; 
              }
              case "Outubro": { 
                this.out_diagnostico = +this.out_diagnostico + +1;
                this.out_consulta_valor = +this.out_consulta_valor+ +element.valor;
                break; 
              }
              case "Novembro": { 
                this.nov_diagnostico = +this.nov_diagnostico + +1;
                this.nov_consulta_valor = +this.nov_consulta_valor+ +element.valor;
                break; 
              }
              case "Dezembro": { 
                this.dez_diagnostico = +this.dez_diagnostico + +1;
                this.dez_consulta_valor = +this.dez_consulta_valor+ +element.valor;
                break; 
              }
              default: { 
                 //statements; 
                 break; 
              } 
           }//Fim switch case 
  
          //}else if(element.categoria == "CONSULTA_MEDICA"){
          }else{
  
            
              
          }//Fim if consulta medica*/
          
        });//Fim do loop ===================================================

        /*let dia = new Date().getDay();
        dia = +dia + +1;
        this.comboChartLabels2[dia] = "HOJE";*/
        
        /*this.dataSourse=new MatTableDataSource(this.faturacoesMedico.sort());
        this.dataSourse.paginator = this.paginator;
        this.dataSourse.sort = this.sort;*/

        

        //FATURACAO POR DIA 
        this.ComboChartData2 = [{
          data: [
            this.um_valor, 
            this.dois_valor, 
            this.tres_valor, 
            this.quatro_valor,
            this.cinco_valor,
            this.seis_valor,
            this.sete_valor,
            this.oito_valor,
            this.nove_valor,
            this.dez_valor,
            this.onze_valor,
            this.doze_valor,
            this.treze_valor,
            this.catorze_valor,
            this.quinze_valor,
            this.dezasseis_valor,
            this.dezassete_valor,
            this.dezoito_valor,
            this.dezanove_valor,
            this.vinte_valor,
            this.vinteum_valor,
            this.vintedois_valor,
            this.vintetrez_valor,
            this.vintequatro_valor,
            this.vintecinco_valor,
            this.vinteseis_valor,
            this.vintesete_valor,
            this.vinteoito_valor,
            this.vintenove_valor,
            this.trinta_valor,
            this.trintaum_valor
          ],
          label: 'Receita',
          borderWidth: 1,
          type: 'line',
          fill: false
        }];
  
        //Info do grafico de linhas com valores faturados
        this.ComboChartData= [{
          data: [
            this.jan_consulta_valor, 
            this.fev_consulta_valor, 
            this.marc_consulta_valor, 
            this.abril_consulta_valor, 
            this.maio_consulta_valor, 
            this.junho_consulta_valor, 
            this.julh_consulta_valor, 
            this.agos_consulta_valor, 
            this.set_consulta_valor, 
            this.out_consulta_valor, 
            this.nov_consulta_valor, 
            this.dez_consulta_valor
          ],
          label: 'Receita',
          borderWidth: 1,
          type: 'line',
          fill: false
        }/*, {
          data: [
            this.jan_consulta_nr, 
            this.fev_consulta_nr, 
            this.marc_consulta_nr, 
            this.abril_consulta_nr, 
            this.maio_consulta_nr, 
            this.junho_consulta_nr, 
            this.julh_consulta_nr, 
            this.agos_consulta_nr, 
            this.set_consulta_nr, 
            this.out_consulta_nr, 
            this.nov_consulta_nr, 
            this.dez_consulta_nr
          ],
          label: 'Consultas',
          borderWidth: 1,
          type: 'bar',
        }*/];

        
  
  
        //Info do grafico de barras
        this.barChartData = [{
          data: [
            this.jan_consulta_nr, 
            this.fev_consulta_nr, 
            this.marc_consulta_nr, 
            this.abril_consulta_nr, 
            this.maio_consulta_nr, 
            this.junho_consulta_nr, 
            this.julh_consulta_nr, 
            this.agos_consulta_nr, 
            this.set_consulta_nr, 
            this.out_consulta_nr, 
            this.nov_consulta_nr, 
            this.dez_consulta_nr
          ],
          label: 'Consulta medica',
          borderWidth: 0
        }, {
          data: [
            this.jan_diagnostico, 
            this.fev_diagnostico, 
            this.marc_diagnostico, 
            this.abril_diagnostico, 
            this.maio_diagnostico, 
            this.junho_diagnostico, 
            this.julh_diagnostico, 
            this.agos_diagnostico, 
            this.set_diagnostico, 
            this.out_diagnostico, 
            this.nov_diagnostico, 
            this.dez_diagnostico
          ],
          label: 'Diagnostico Auxiliar',
          borderWidth: 0
        }];

        this.doughnutChartData= [this.categoria_valor_CONSULTA_MEDICA , this.categoria_valor_DIAGNOSTICO_AUX, this.categoria_valor_CONDUTA, this.categoria_valor_MEDICAMENTO];
        this.doughnutChartData_ano= [this.categoria_valor_CONSULTA_MEDICA_ano , this.categoria_valor_DIAGNOSTICO_AUX_ano, this.categoria_valor_CONDUTA_ano, this.categoria_valor_MEDICAMENTO_ano];

        
      })

      
      //USERS
    this.configService.getUsers().snapshotChanges().subscribe(data => {
      this.users = data.map(e => {
        return {
          uid: e.payload.key,
          ...e.payload.val(),
        } as User;
      });

      this.medicos = ["Todos"];
      this.users.forEach(element => {
        if(element.clinica_id == this.authService.get_clinica_id && (element.perfil == "Clinica_Medico" || element.perfil == "Clinica_Admin")){
          if(element.displayName !== undefined){
            this.medicos.push(element.displayName);
          }
        }
      });

      //console.log("Medicos Total "+this.medicos.length)
    })

    });//Fim timeOut

  } //Fim ngOnInt
  




  // QUANDO ALTERAMOS ANO ---------------------------------------------------------
  onSelect(ano, mes, medico, deposito){
  //console.log("Medico selecionado: "+medico);
  this.ano = ano;
  this.mes = mes;
  this.medico = medico;
  //console.log("Alterar medico: "+this.medico)

  this.pacienteService.getConsultasRelatorio(this.ano).snapshotChanges().subscribe(data => {
    this.consultas = data.map(e => {
      return {
        id: e.payload.key,
        ...e.payload.val(),
      } as Consulta;
    })
    if(this.medico == "Todos"){
      this.consultas_encerradas_medicas = this.consultas.filter( c => c.tipo == "Consulta Medica").length;
      this.consultas_encerradas_diagnosticos = this.consultas.filter( c => c.tipo == "DIAGNOSTICO AUX").length;
      this.consultas_encerradas_condutas = this.consultas.filter( c => c.tipo == "CONDUTA CLINICA").length;
    }else{
      this.consultas_encerradas_medicas = this.consultas.filter( c => c.tipo == "Consulta Medica" && c.medico_nome == this.medico).length;
      this.consultas_encerradas_diagnosticos = this.consultas.filter( c => c.tipo == "DIAGNOSTICO AUX" && c.medico_nome == this.medico).length;
      this.consultas_encerradas_condutas = this.consultas.filter( c => c.tipo == "CONDUTA CLINICA" && c.medico_nome == this.medico).length;
    }
  })

  this.zerarDados();


  //ESTOQUES
  this.deposito = deposito;
    //this.deposito_id = this.depositos[0].id+"";
    //this.deposito_nome = this.depositos[0].nome+"";

    this.estoqueService.getDepositoRelatorioSemiParcial(this.ano, this.deposito.id).snapshotChanges().subscribe(data => {
      this.depositos_relatorio = data.map(e => {
        return {
          id: e.payload.key,
          ...e.payload.val(),
        } as DepositoRelatorio;
      })

      this.depositos_relatorio.forEach(element => {

        switch(element.id) { //id representa o MES
          case "Janeiro": { 
            this.jan_estoque_acumulado = element.valor_acumulado ? element.valor_acumulado : 0;
            this.jan_estoque_entrada = element.valor_entrada ? element.valor_entrada : 0;
            this.jan_estoque_saida = element.valor_saida ? element.valor_saida : 0;
            break;
          } 
          case "Fevereiro": { 
            this.fev_estoque_acumulado = element.valor_acumulado ? element.valor_acumulado : 0;
            this.fev_estoque_entrada = element.valor_entrada ? element.valor_entrada : 0;
            this.fev_estoque_saida = element.valor_saida ? element.valor_saida : 0;
            break;
          } 
          case "Marco": { 
            this.marc_estoque_acumulado = element.valor_acumulado ? element.valor_acumulado : 0;
            this.marc_estoque_entrada = element.valor_entrada ? element.valor_entrada : 0;
            this.marc_estoque_saida = element.valor_saida ? element.valor_saida : 0;
            break ; 
          }
          case "Abril": { 
            this.abril_estoque_acumulado = element.valor_acumulado ? element.valor_acumulado : 0;
            this.abril_estoque_entrada = element.valor_entrada ? element.valor_entrada : 0;
            this.abril_estoque_saida = element.valor_saida ? element.valor_saida : 0;
            break ; 
          }
          case "Maio": { 
            this.maio_estoque_acumulado = element.valor_acumulado ? element.valor_acumulado : 0;
            this.maio_estoque_entrada = element.valor_entrada ? element.valor_entrada : 0;
            this.maio_estoque_saida = element.valor_saida ? element.valor_saida : 0;
            break ; 
          }
          case "Junho": { 
            this.jun_estoque_acumulado = element.valor_acumulado ? element.valor_acumulado : 0;
            this.jun_estoque_entrada = element.valor_entrada ? element.valor_entrada : 0;
            this.jun_estoque_saida = element.valor_saida ? element.valor_saida : 0;
            break ; 
          }
          case "Julho": { 
            this.julho_estoque_acumulado = element.valor_acumulado ? element.valor_acumulado : 0;
            this.julho_estoque_entrada = element.valor_entrada ? element.valor_entrada : 0;
            this.julho_estoque_saida = element.valor_saida ? element.valor_saida : 0;
            break; 
          }
          case "Agosto": { 
            this.ago_estoque_acumulado = element.valor_acumulado ? element.valor_acumulado : 0;
            this.ago_estoque_entrada = element.valor_entrada ? element.valor_entrada : 0;
            this.ago_estoque_saida = element.valor_saida ? element.valor_saida : 0;
            break; 
          }  
          case "Setembro": { 
            this.set_estoque_acumulado = element.valor_acumulado ? element.valor_acumulado : 0;
            this.set_estoque_entrada = element.valor_entrada ? element.valor_entrada : 0;
            this.set_estoque_saida = element.valor_saida ? element.valor_saida : 0;
            break; 
          }
          case "Outubro": { 
            this.out_estoque_acumulado = element.valor_acumulado ? element.valor_acumulado : 0;
            this.out_estoque_entrada = element.valor_entrada ? element.valor_entrada : 0;
            this.out_estoque_saida = element.valor_saida ? element.valor_saida : 0;
            break; 
          }
          case "Novembro": { 
            this.nov_estoque_acumulado = element.valor_acumulado ? element.valor_acumulado : 0;
            this.nov_estoque_entrada = element.valor_entrada ? element.valor_entrada : 0;
            this.nov_estoque_saida = element.valor_saida ? element.valor_saida : 0;
            break; 
          }
          case "Dezembro": { 
            this.dez_estoque_acumulado = element.valor_acumulado ? element.valor_acumulado : 0;
            this.dez_estoque_entrada = element.valor_entrada ? element.valor_entrada : 0;
            this.dez_estoque_saida = element.valor_saida ? element.valor_saida : 0;
            break; 
          }
          default: { 
              //statements; 
              break; 
          } 
        }//Fim switch case 

      });//Fim do foreach

      this.barChartData_MovimentosEstoque = [{
        data: [this.jan_estoque_entrada.toFixed(2), this.fev_estoque_entrada.toFixed(2), this.marc_estoque_entrada.toFixed(2), this.abril_estoque_entrada.toFixed(2), this.maio_estoque_entrada.toFixed(2), this.jun_estoque_entrada.toFixed(2), this.julho_estoque_entrada.toFixed(2), this.ago_estoque_entrada.toFixed(2), this.set_estoque_entrada.toFixed(2), this.out_estoque_entrada.toFixed(2), this.nov_estoque_entrada.toFixed(2), this.dez_estoque_entrada.toFixed(2)],
        label: 'Valor de entrada',
        borderWidth: 0
      }, {
        data: [this.jan_estoque_saida.toFixed(2), this.fev_estoque_saida.toFixed(2), this.marc_estoque_saida.toFixed(2), this.abril_estoque_saida.toFixed(2), this.maio_estoque_saida.toFixed(2), this.jun_estoque_saida, this.julho_estoque_saida.toFixed(2), this.ago_estoque_saida.toFixed(2), this.set_estoque_saida.toFixed(2), this.out_estoque_saida.toFixed(2), this.nov_estoque_saida.toFixed(2), this.dez_estoque_saida.toFixed(2)],
        label: 'Valor de saida',
        borderWidth: 0
      }];

      this.barChartData_FechamentoEstoque = [{
        data: [this.jan_estoque_acumulado.toFixed(2), this.fev_estoque_acumulado.toFixed(2), this.marc_estoque_acumulado.toFixed(2), this.abril_estoque_acumulado.toFixed(2), this.maio_estoque_acumulado.toFixed(2), this.jun_estoque_acumulado.toFixed(2), this.julho_estoque_acumulado.toFixed(2), this.ago_estoque_acumulado.toFixed(2), this.set_estoque_acumulado.toFixed(2), this.out_estoque_acumulado.toFixed(2), this.nov_estoque_acumulado.toFixed(2), this.dez_estoque_acumulado.toFixed(2)],
        label: 'Valor de estoque por mês',
        borderWidth: 0
      }];

    })



    this.pacienteService.getFaturacoes(this.ano).snapshotChanges().subscribe(data => {
      this.faturacoes = data.map(e => {
        return {
          id: e.payload.key,
          ...e.payload.val(),
        } as Faturacao;
      }) 

      

      
      this.faturacoes.forEach(element => {

        if(this.medico == "Todos"){
          this.total_valor = +this.total_valor + +element.valor;

          //let dia = new Date(element.data).getDay();
          //dia = +dia + +1;
          let dia = new Date(element.data).toISOString().substr(8,2);          

          switch(element.categoria){
            case "CONDUTA CLINICA": {
              //this.categoria_qtd_CONDUTA = +this.categoria_qtd_CONDUTA + +1;
              this.categoria_valor_CONDUTA_ano = +this.categoria_valor_CONDUTA_ano + +element.valor;
              break;
            }

            case "DIAGNOSTICO_AUX": {
              //this.categoria_qtd_DIAGNOSTICO_AUX = +this.categoria_qtd_DIAGNOSTICO_AUX + +1;
              this.categoria_valor_DIAGNOSTICO_AUX_ano = +this.categoria_valor_DIAGNOSTICO_AUX_ano + +element.valor;
              break;
            }

            case "CONSULTA_MEDICA": {
              //this.categoria_qtd_CONSULTA_MEDICA = +this.categoria_qtd_CONSULTA_MEDICA + +1;
              this.categoria_valor_CONSULTA_MEDICA_ano = +this.categoria_valor_CONSULTA_MEDICA_ano + +element.valor;
              break;
            }

            case "MEDICAMENTO": {
              //this.categoria_qtd_MEDICAMENTO = +this.categoria_qtd_MEDICAMENTO + +1;
              this.categoria_valor_MEDICAMENTO_ano = +this.categoria_valor_MEDICAMENTO_ano + +element.valor;
              break;
            }
          }
          

         if(this.mes == element.mes){


          switch(element.categoria){
            case "CONDUTA CLINICA": {
              this.categoria_qtd_CONDUTA = +this.categoria_qtd_CONDUTA + +1;
              this.categoria_valor_CONDUTA = +this.categoria_valor_CONDUTA + +element.valor;
              break;
            }

            case "DIAGNOSTICO_AUX": {
              this.categoria_qtd_DIAGNOSTICO_AUX = +this.categoria_qtd_DIAGNOSTICO_AUX + +1;
              this.categoria_valor_DIAGNOSTICO_AUX = +this.categoria_valor_DIAGNOSTICO_AUX + +element.valor;
              break;
            }

            case "CONSULTA_MEDICA": {
              this.categoria_qtd_CONSULTA_MEDICA = +this.categoria_qtd_CONSULTA_MEDICA + +1;
              this.categoria_valor_CONSULTA_MEDICA = +this.categoria_valor_CONSULTA_MEDICA + +element.valor;
              break;
            }

            case "MEDICAMENTO": {
              this.categoria_qtd_MEDICAMENTO = +this.categoria_qtd_MEDICAMENTO + +1;
              this.categoria_valor_MEDICAMENTO = +this.categoria_valor_MEDICAMENTO + +element.valor;
              break;
            }
          }

          switch(dia) {

            case "01": {
              this.um_valor = +this.um_valor + +element.valor;
              break;
            }

            case "02": {
              this.dois_valor = +this.dois_valor + +element.valor;
              break;
            }

            case "03": {
              this.tres_valor = +this.tres_valor + +element.valor;
              break;
            }
            
            case "04": {
              this.quatro_valor = +this.quatro_valor + +element.valor;
              break;
            }

            case "05": {
              this.cinco_valor = +this.cinco_valor + +element.valor;
              break;
            }

            case "06": {
              this.seis_valor = +this.seis_valor + +element.valor;
              break;
            }

            case "07": {
              this.sete_valor = +this.sete_valor + +element.valor;
              break;
            }

            case "08": {
              this.oito_valor = +this.oito_valor + +element.valor;
              break;
            }

            case "09": {
              this.nove_valor = +this.nove_valor + +element.valor;
              break;
            }

            case "10": {
              this.dez_valor = +this.dez_valor + +element.valor;
              break;
            }

            case "11": {
              this.onze_valor = +this.onze_valor + +element.valor;
              break;
            }

            case "12": {
              this.doze_valor = +this.doze_valor + +element.valor;
              break;
            }

            case "13": {
              this.treze_valor = +this.treze_valor + +element.valor;
              break;
            }

            case "14": {
              this.catorze_valor = +this.catorze_valor + +element.valor;
              break;
            }

            case "15": {
              this.quinze_valor = +this.quinze_valor + +element.valor;
              break;
            }

            case "16": {
              this.dezasseis_valor = +this.dezasseis_valor + +element.valor;
              break;
            }

            case "17": {
              this.dezassete_valor = +this.dezassete_valor + +element.valor;
              break;
            }

            case "18": {
              this.dezoito_valor = +this.dezoito_valor + +element.valor;
              break;
            }

            case "19": {
              this.dezanove_valor = +this.dezanove_valor + +element.valor;
              break;
            }

            case "20": {
              this.vinte_valor = +this.vinte_valor + +element.valor;
              break;
            }

            case "21": {
              this.vinteum_valor = +this.vinteum_valor + +element.valor;
              break;
            }

            case "22": {
              this.vintedois_valor = +this.vintedois_valor + +element.valor;
              break;
            }

            case "23": {
              this.vintetrez_valor = +this.vintetrez_valor + +element.valor;
              break;
            }

            case "24": {
              this.vintequatro_valor = +this.vintequatro_valor + +element.valor;
              break;
            }

            case "25": {
              this.vintecinco_valor = +this.vintecinco_valor + +element.valor;
              break;
            }

            case "26": {
              this.vinteseis_valor = +this.vinteseis_valor + +element.valor;
              break;
            }

            case "27": {
              this.vintesete_valor = +this.vintesete_valor + +element.valor;
              break;
            }

            case "28": {
              this.vinteoito_valor = +this.vinteoito_valor + +element.valor;
              break;
            }

            case "29": {
              this.vintenove_valor = +this.vintenove_valor + +element.valor;
              break;
            }

            case "30": {
              this.trinta_valor = +this.trinta_valor + +element.valor;
              break;
            }

            case "31": {
              this.trintaum_valor = +this.trintaum_valor + +element.valor;
              break;
            }

            default: { 
              //statements; 
              break; 
           } 

          }
         }
         
         switch(element.mes) { 
          case "Janeiro": { 
            this.jan_consulta_nr = +this.jan_consulta_nr + +1;
            this.jan_consulta_valor = +this.jan_consulta_valor+ +element.valor;
             break;
          } 
          case "Fevereiro": { 
            this.fev_consulta_nr = +this.fev_consulta_nr + +1;
            this.fev_consulta_valor = +this.fev_consulta_valor+ +element.valor;
            break;
          } 
          case "Marco": { 
            this.marc_consulta_nr = +this.marc_consulta_nr + +1;
            this.marc_consulta_valor = +this.marc_consulta_valor+ +element.valor;
            break ; 
          }
          case "Abril": { 
            this.abril_consulta_nr = +this.abril_consulta_nr + +1;
            this.abril_consulta_valor = +this.abril_consulta_valor+ +element.valor;
            break ; 
          }
          case "Maio": { 
            this.maio_consulta_nr = +this.maio_consulta_nr + +1;
            this.maio_consulta_valor = +this.maio_consulta_valor+ +element.valor;
            break ; 
          }
          case "Junho": { 
            this.junho_consulta_nr = +this.junho_consulta_nr + +1;
            this.junho_consulta_valor = +this.junho_consulta_valor+ +element.valor;
            break ; 
          }
          case "Julho": { 
            this.julh_consulta_nr = +this.julh_consulta_nr + +1;
            this.julh_consulta_valor = +this.julh_consulta_valor+ +element.valor;
            break; 
          }
          case "Agosto": { 
            this.agos_consulta_nr = +this.agos_consulta_nr + +1;
            this.agos_consulta_valor = +this.agos_consulta_valor+ +element.valor;
            break; 
          }  
          case "Setembro": { 
            this.set_consulta_nr = +this.set_consulta_nr + +1;
            this.set_consulta_valor = +this.set_consulta_valor+ +element.valor;
            break; 
          }
          case "Outubro": { 
            this.out_consulta_nr = +this.out_consulta_nr + +1;
            this.out_consulta_valor = +this.out_consulta_valor+ +element.valor;
            break; 
          }
          case "Novembro": { 
            this.nov_consulta_nr = +this.nov_consulta_nr + +1;
            this.nov_consulta_valor = +this.nov_consulta_valor+ +element.valor;
            break; 
          }
          case "Dezembro": { 
            this.dez_consulta_nr = +this.dez_consulta_nr + +1;
            this.dez_consulta_valor = +this.dez_consulta_valor+ +element.valor;
            break; 
          }
          default: { 
             //statements; 
             break; 
          } 
       }//Fim switch case 

        
        }else if(this.medico == element.medico_nome){ //else =====================================================

          this.total_valor = +this.total_valor + +element.valor;

          switch(element.categoria){
            case "CONDUTA CLINICA": {
              //this.categoria_qtd_CONDUTA = +this.categoria_qtd_CONDUTA + +1;
              this.categoria_valor_CONDUTA_ano = +this.categoria_valor_CONDUTA_ano + +element.valor;
              break;
            }

            case "DIAGNOSTICO_AUX": {
              //this.categoria_qtd_DIAGNOSTICO_AUX = +this.categoria_qtd_DIAGNOSTICO_AUX + +1;
              this.categoria_valor_DIAGNOSTICO_AUX_ano = +this.categoria_valor_DIAGNOSTICO_AUX_ano + +element.valor;
              break;
            }

            case "CONSULTA_MEDICA": {
              //this.categoria_qtd_CONSULTA_MEDICA = +this.categoria_qtd_CONSULTA_MEDICA + +1;
              this.categoria_valor_CONSULTA_MEDICA_ano = +this.categoria_valor_CONSULTA_MEDICA_ano + +element.valor;
              break;
            }

            case "MEDICAMENTO": {
              //this.categoria_qtd_MEDICAMENTO = +this.categoria_qtd_MEDICAMENTO + +1;
              this.categoria_valor_MEDICAMENTO_ano = +this.categoria_valor_MEDICAMENTO_ano + +element.valor;
              break;
            }
          }

          //let dia = new Date(element.data).getDay();
          //dia = +dia + +1;
          let dia = new Date(element.data).toISOString().substr(8,2);

         if(this.mes == element.mes){

          switch(element.categoria){
            case "CONDUTA CLINICA": {
              this.categoria_qtd_CONDUTA = +this.categoria_qtd_CONDUTA + +1;
              this.categoria_valor_CONDUTA = +this.categoria_valor_CONDUTA + +element.valor;
              break;
            }

            case "DIAGNOSTICO_AUX": {
              this.categoria_qtd_DIAGNOSTICO_AUX = +this.categoria_qtd_DIAGNOSTICO_AUX + +1;
              this.categoria_valor_DIAGNOSTICO_AUX = +this.categoria_valor_DIAGNOSTICO_AUX + +element.valor;
              break;
            }

            case "CONSULTA_MEDICA": {
              this.categoria_qtd_CONSULTA_MEDICA = +this.categoria_qtd_CONSULTA_MEDICA + +1;
              this.categoria_valor_CONSULTA_MEDICA = +this.categoria_valor_CONSULTA_MEDICA + +element.valor;
              break;
            }

            case "MEDICAMENTO": {
              this.categoria_qtd_MEDICAMENTO = +this.categoria_qtd_MEDICAMENTO + +1;
              this.categoria_valor_MEDICAMENTO = +this.categoria_valor_MEDICAMENTO + +element.valor;
              break;
            }
          }

          switch(dia) {

            case "01": {
              this.um_valor = +this.um_valor + +element.valor;
              break;
            }

            case "02": {
              this.dois_valor = +this.dois_valor + +element.valor;
              break;
            }

            case "03": {
              this.tres_valor = +this.tres_valor + +element.valor;
              break;
            }
            
            case "04": {
              this.quatro_valor = +this.quatro_valor + +element.valor;
              break;
            }

            case "05": {
              this.cinco_valor = +this.cinco_valor + +element.valor;
              break;
            }

            case "06": {
              this.seis_valor = +this.seis_valor + +element.valor;
              break;
            }

            case "07": {
              this.sete_valor = +this.sete_valor + +element.valor;
              break;
            }

            case "08": {
              this.oito_valor = +this.oito_valor + +element.valor;
              break;
            }

            case "09": {
              this.nove_valor = +this.nove_valor + +element.valor;
              break;
            }

            case "10": {
              this.dez_valor = +this.dez_valor + +element.valor;
              break;
            }

            case "11": {
              this.onze_valor = +this.onze_valor + +element.valor;
              break;
            }

            case "12": {
              this.doze_valor = +this.doze_valor + +element.valor;
              break;
            }

            case "13": {
              this.treze_valor = +this.treze_valor + +element.valor;
              break;
            }

            case "14": {
              this.catorze_valor = +this.catorze_valor + +element.valor;
              break;
            }

            case "15": {
              this.quinze_valor = +this.quinze_valor + +element.valor;
              break;
            }

            case "16": {
              this.dezasseis_valor = +this.dezasseis_valor + +element.valor;
              break;
            }

            case "17": {
              this.dezassete_valor = +this.dezassete_valor + +element.valor;
              break;
            }

            case "18": {
              this.dezoito_valor = +this.dezoito_valor + +element.valor;
              break;
            }

            case "19": {
              this.dezanove_valor = +this.dezanove_valor + +element.valor;
              break;
            }

            case "20": {
              this.vinte_valor = +this.vinte_valor + +element.valor;
              break;
            }

            case "21": {
              this.vinteum_valor = +this.vinteum_valor + +element.valor;
              break;
            }

            case "22": {
              this.vintedois_valor = +this.vintedois_valor + +element.valor;
              break;
            }

            case "23": {
              this.vintetrez_valor = +this.vintetrez_valor + +element.valor;
              break;
            }

            case "24": {
              this.vintequatro_valor = +this.vintequatro_valor + +element.valor;
              break;
            }

            case "25": {
              this.vintecinco_valor = +this.vintecinco_valor + +element.valor;
              break;
            }

            case "26": {
              this.vinteseis_valor = +this.vinteseis_valor + +element.valor;
              break;
            }

            case "27": {
              this.vintesete_valor = +this.vintesete_valor + +element.valor;
              break;
            }

            case "28": {
              this.vinteoito_valor = +this.vinteoito_valor + +element.valor;
              break;
            }

            case "29": {
              this.vintenove_valor = +this.vintenove_valor + +element.valor;
              break;
            }

            case "30": {
              this.trinta_valor = +this.trinta_valor + +element.valor;
              break;
            }

            case "31": {
              this.trintaum_valor = +this.trintaum_valor + +element.valor;
              break;
            }

            default: { 
              //statements; 
              break; 
           } 

          }
         }
         
         switch(element.mes) { 
          case "Janeiro": { 
            this.jan_consulta_nr = +this.jan_consulta_nr + +1;
            this.jan_consulta_valor = +this.jan_consulta_valor+ +element.valor;
             break;
          } 
          case "Fevereiro": { 
            this.fev_consulta_nr = +this.fev_consulta_nr + +1;
            this.fev_consulta_valor = +this.fev_consulta_valor+ +element.valor;
            break;
          } 
          case "Marco": { 
            this.marc_consulta_nr = +this.marc_consulta_nr + +1;
            this.marc_consulta_valor = +this.marc_consulta_valor+ +element.valor;
            break ; 
          }
          case "Abril": { 
            this.abril_consulta_nr = +this.abril_consulta_nr + +1;
            this.abril_consulta_valor = +this.abril_consulta_valor+ +element.valor;
            break ; 
          }
          case "Maio": { 
            this.maio_consulta_nr = +this.maio_consulta_nr + +1;
            this.maio_consulta_valor = +this.maio_consulta_valor+ +element.valor;
            break ; 
          }
          case "Junho": { 
            this.junho_consulta_nr = +this.junho_consulta_nr + +1;
            this.junho_consulta_valor = +this.junho_consulta_valor+ +element.valor;
            break ; 
          }
          case "Julho": { 
            this.julh_consulta_nr = +this.julh_consulta_nr + +1;
            this.julh_consulta_valor = +this.julh_consulta_valor+ +element.valor;
            break; 
          }
          case "Agosto": { 
            this.agos_consulta_nr = +this.agos_consulta_nr + +1;
            this.agos_consulta_valor = +this.agos_consulta_valor+ +element.valor;
            break; 
          }  
          case "Setembro": { 
            this.set_consulta_nr = +this.set_consulta_nr + +1;
            this.set_consulta_valor = +this.set_consulta_valor+ +element.valor;
            break; 
          }
          case "Outubro": { 
            this.out_consulta_nr = +this.out_consulta_nr + +1;
            this.out_consulta_valor = +this.out_consulta_valor+ +element.valor;
            break; 
          }
          case "Novembro": { 
            this.nov_consulta_nr = +this.nov_consulta_nr + +1;
            this.nov_consulta_valor = +this.nov_consulta_valor+ +element.valor;
            break; 
          }
          case "Dezembro": { 
            this.dez_consulta_nr = +this.dez_consulta_nr + +1;
            this.dez_consulta_valor = +this.dez_consulta_valor+ +element.valor;
            break; 
          }
          default: { 
             //statements; 
             break; 
          } 
       }//Fim switch case

        } //Fim do IF
        
      });//Fim do loop =======================================================

      //Info do grafico de linhas com valores faturados
      this.ComboChartData= [{
        data: [
          this.jan_consulta_valor, 
          this.fev_consulta_valor, 
          this.marc_consulta_valor, 
          this.abril_consulta_valor, 
          this.maio_consulta_valor, 
          this.junho_consulta_valor, 
          this.julh_consulta_valor, 
          this.agos_consulta_valor, 
          this.set_consulta_valor, 
          this.out_consulta_valor, 
          this.nov_consulta_valor, 
          this.dez_consulta_valor
        ],
        label: 'Receita',
        borderWidth: 1,
        type: 'line',
        fill: false
      }];


        //FATURACAO POR DIA 
        this.ComboChartData2 = [{
          data: [
            this.um_valor, 
            this.dois_valor, 
            this.tres_valor, 
            this.quatro_valor,
            this.cinco_valor,
            this.seis_valor,
            this.sete_valor,
            this.oito_valor,
            this.nove_valor,
            this.dez_valor,
            this.onze_valor,
            this.doze_valor,
            this.treze_valor,
            this.catorze_valor,
            this.quinze_valor,
            this.dezasseis_valor,
            this.dezassete_valor,
            this.dezoito_valor,
            this.dezanove_valor,
            this.vinte_valor,
            this.vinteum_valor,
            this.vintedois_valor,
            this.vintetrez_valor,
            this.vintequatro_valor,
            this.vintecinco_valor,
            this.vinteseis_valor,
            this.vintesete_valor,
            this.vinteoito_valor,
            this.vintenove_valor,
            this.trinta_valor,
            this.trintaum_valor
          ],
          label: 'Receita',
          borderWidth: 1,
          type: 'line',
          fill: false
        }];


      //Info do grafico de barras
      this.barChartData = [{
        data: [
          this.jan_consulta_nr, 
          this.fev_consulta_nr, 
          this.marc_consulta_nr, 
          this.abril_consulta_nr, 
          this.maio_consulta_nr, 
          this.junho_consulta_nr, 
          this.julh_consulta_nr, 
          this.agos_consulta_nr, 
          this.set_consulta_nr, 
          this.out_consulta_nr, 
          this.nov_consulta_nr, 
          this.dez_consulta_nr
        ],
        label: 'Consulta medica',
        borderWidth: 0
      }, {
        data: [
          this.jan_diagnostico, 
          this.fev_diagnostico, 
          this.marc_diagnostico, 
          this.abril_diagnostico, 
          this.maio_diagnostico, 
          this.junho_diagnostico, 
          this.julh_diagnostico, 
          this.agos_diagnostico, 
          this.set_diagnostico, 
          this.out_diagnostico, 
          this.nov_diagnostico, 
          this.dez_diagnostico
        ],
        label: 'Diagnostico Auxiliar',
        borderWidth: 0
      }];
      
      this.doughnutChartData= [this.categoria_valor_CONSULTA_MEDICA , this.categoria_valor_DIAGNOSTICO_AUX, this.categoria_valor_CONDUTA, this.categoria_valor_MEDICAMENTO];
      this.doughnutChartData_ano= [this.categoria_valor_CONSULTA_MEDICA_ano , this.categoria_valor_DIAGNOSTICO_AUX_ano, this.categoria_valor_CONDUTA_ano, this.categoria_valor_MEDICAMENTO_ano];

      
      
    })
  }

  zerarDados(){
    this.total_valor = 0;
    this.jan_consulta_nr = 0;
    this.jan_consulta_valor = 0;
    this.fev_consulta_nr = 0;
    this.fev_consulta_valor = 0;
    this.marc_consulta_nr = 0;
    this.marc_consulta_valor = 0;
    this.abril_consulta_nr = 0;
    this.abril_consulta_valor = 0;
    this.maio_consulta_nr = 0;
    this.maio_consulta_valor = 0;
    this.junho_consulta_nr = 0;
    this.junho_consulta_valor = 0;
    this.julh_consulta_nr = 0;
    this.julh_consulta_valor = 0;
    this.agos_consulta_nr = 0;
    this.agos_consulta_valor = 0;
    this.set_consulta_nr = 0;
    this.set_consulta_valor = 0;
    this.out_consulta_nr = 0;
    this.out_consulta_valor = 0;
    this.nov_consulta_nr = 0;
    this.nov_consulta_valor = 0;
    this.dez_consulta_nr = 0;
    this.dez_consulta_valor = 0;

    this.jan_diagnostico = 0;
    this.fev_diagnostico = 0;
    this.marc_diagnostico = 0;
    this.abril_diagnostico = 0;
    this.maio_diagnostico = 0;
    this.junho_diagnostico = 0;
    this.julh_diagnostico = 0;
    this.agos_diagnostico = 0;
    this.set_diagnostico = 0;
    this.out_diagnostico = 0;
    this.nov_diagnostico = 0;
    this.dez_diagnostico = 0;

    this.um_valor = 0
    this.dois_valor = 0
    this.tres_valor = 0
    this.quatro_valor = 0
    this.cinco_valor = 0
    this.seis_valor = 0
    this.sete_valor = 0
    this.oito_valor = 0
    this.nove_valor = 0
    this.dez_valor = 0
    this.onze_valor = 0
    this.doze_valor = 0
    this.treze_valor = 0
    this.catorze_valor = 0
    this.quinze_valor = 0
    this.dezasseis_valor = 0
    this.dezassete_valor = 0
    this.dezoito_valor = 0
    this.dezanove_valor = 0
    this.vinte_valor = 0
    this.vinteum_valor = 0
    this.vintedois_valor = 0
    this.vintetrez_valor = 0
    this.vintequatro_valor = 0
    this.vintecinco_valor = 0
    this.vinteseis_valor = 0
    this.vintesete_valor = 0
    this.vinteoito_valor = 0
    this.vintenove_valor = 0
    this.trinta_valor = 0
    this.trintaum_valor = 0

    this.categoria_valor_CONSULTA_MEDICA = 0;
    this.categoria_valor_DIAGNOSTICO_AUX = 0;
    this.categoria_valor_MEDICAMENTO = 0;
    this.categoria_valor_CONDUTA = 0;

    this.categoria_valor_CONSULTA_MEDICA_ano = 0;
    this.categoria_valor_DIAGNOSTICO_AUX_ano = 0;
    this.categoria_valor_MEDICAMENTO_ano = 0;
    this.categoria_valor_CONDUTA_ano = 0;

    this.jan_estoque_acumulado = 0;
    this.jan_estoque_entrada = 0;
    this.jan_estoque_saida = 0;
    this.fev_estoque_acumulado = 0;
    this.fev_estoque_entrada = 0;
    this.fev_estoque_saida = 0;
    this.marc_estoque_acumulado = 0;
    this.marc_estoque_entrada = 0;
    this.marc_estoque_saida = 0;
    this.abril_estoque_acumulado = 0;
    this.abril_estoque_entrada = 0;
    this.abril_estoque_saida = 0;
    this.maio_estoque_acumulado = 0;
    this.maio_estoque_entrada = 0;
    this.maio_estoque_saida = 0;
    this.jun_estoque_acumulado = 0;
    this.jun_estoque_entrada = 0;
    this.jun_estoque_saida = 0;
    this.julho_estoque_acumulado = 0;
    this.julho_estoque_entrada = 0;
    this.julho_estoque_saida = 0;
    this.ago_estoque_acumulado = 0;
    this.ago_estoque_entrada = 0;
    this.ago_estoque_saida = 0;
    this.set_estoque_acumulado = 0;
    this.set_estoque_entrada = 0;
    this.set_estoque_saida = 0;
    this.out_estoque_acumulado = 0;
    this.out_estoque_entrada = 0;
    this.out_estoque_saida = 0;
    this.nov_estoque_acumulado = 0;
    this.nov_estoque_entrada = 0;
    this.nov_estoque_saida = 0;
    this.dez_estoque_acumulado = 0;
    this.dez_estoque_entrada = 0;
    this.dez_estoque_saida = 0;
  }

  Lista_pacientes(paciente){
    const dialogRef = this.dialog.open(DialogOverviewExampleDialog, {
      width: '1000px', 
      
     // data: {nome: paciente.nome}
    });
   
   dialogRef.afterClosed().subscribe(result => {
    console.log('The dialog was closed');
    // this.animal = result;
    
   });
   
  } 

  Lista_conduta(paciente){
    const dialogRef = this.dialog.open(dialogconduta, {
      width: '1000px', 
      
     // data: {nome: paciente.nome}
    });
   
   dialogRef.afterClosed().subscribe(result => {
    //console.log('The dialog was closed');
    // this.animal = result;
    
   });
   
  } 

  Lista_consulta(paciente){
    const dialogRef = this.dialog.open(dialogconsultas, {
      width: '1000px', 
      
     // data: {nome: paciente.nome}
    });
   
   dialogRef.afterClosed().subscribe(result => {
    //console.log('The dialog was closed');
    // this.animal = result;
    
   });
   
  } 


  Lista_dialogo(paciente){
    const dialogRef = this.dialog.open(dialogdiagnostico, {
      width: '1000px', 
      
     // data: {nome: paciente.nome}
    });
   
   dialogRef.afterClosed().subscribe(result => {
    //console.log('The dialog was closed');
    // this.animal = result;
    
   });
   
  } 





  public pieOptions: any = Object.assign({
    responsive: true,
    legend: {
      display: false,
      position: 'bottom'
    },
    elements: {
      arc: {
        borderWidth: 0
      }
    }
  });

   
    barChartType = 'bar';
    // Shared chart options
    globalChartOptions: any = {
      responsive: true,
      legend: {
        display: true,
        position: 'bottom'
      }
    };

    // combo chart
    comboChartLabels: Array <any> = ['Jan', 'Fev', 'Marc', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Sete', 'Out', 'Nov', 'Dez'];
    chartColors: Array <any> = [{ // grey
      backgroundColor: '#7986cb',
      borderColor: '#3f51b5',
      pointBackgroundColor: '#3f51b5',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(148,159,177,0.8)'
    }/*, { // dark grey
      backgroundColor: '#eeeeee',
      borderColor: '#e0e0e0',
      pointBackgroundColor: '#e0e0e0',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(77,83,96,1)'
    }, { // grey
      backgroundColor: 'rgba(148,159,177,0.2)',
      borderColor: 'rgba(148,159,177,1)',
      pointBackgroundColor: 'rgba(148,159,177,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(148,159,177,0.8)'
    }*/];
    comboChartLegend = true;
    ComboChartData: Array <any> = [{
      data: [
        this.jan_consulta_valor, 
        this.fev_consulta_valor, 
        this.marc_consulta_valor, 
        this.abril_consulta_valor, 
        this.maio_consulta_valor, 
        this.junho_consulta_valor, 
        this.julh_consulta_valor, 
        this.agos_consulta_valor, 
        this.set_consulta_valor, 
        this.out_consulta_valor, 
        this.nov_consulta_valor, 
        this.dez_consulta_valor
      ],
      label: 'Receita',
      borderWidth: 1,
      type: 'line',
      fill: false
    }/*, {
      data: [
        this.jan_consulta_nr, 
        this.fev_consulta_nr, 
        this.marc_consulta_nr, 
        this.abril_consulta_nr, 
        this.maio_consulta_nr, 
        this.junho_consulta_nr, 
        this.julh_consulta_nr, 
        this.agos_consulta_nr, 
        this.set_consulta_nr, 
        this.out_consulta_nr, 
        this.nov_consulta_nr, 
        this.dez_consulta_nr
      ],
      label: 'Consultas',
      borderWidth: 1,
      type: 'bar',
    }*/];
    ComboChartOptions: any = Object.assign({
      animation: false,
      scales: {
        xAxes: [{
          gridLines: {
            color: 'rgba(0,0,0,0.02)',
            zeroLineColor: 'rgba(0,0,0,0.02)'
          }
        }],
        yAxes: [{
          gridLines: {
            color: 'rgba(0,0,0,0.02)',
            zeroLineColor: 'rgba(0,0,0,0.02)'
          },
          ticks: {
            beginAtZero: true,
            suggestedMax: 9,
          }
        }]
      }
    }, this.globalChartOptions);


    // Bar
  barChartLabels: string[] = ['Jan', 'Fev', 'Marc', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Sete', 'Out', 'Nov', 'Dez'];
  //barChartType = 'bar';
  barChartLegend = true;
  barChartData: any[] = [{
    data: [
      this.jan_consulta_nr, 
      this.fev_consulta_nr, 
      this.marc_consulta_nr, 
      this.abril_consulta_nr, 
      this.maio_consulta_nr, 
      this.junho_consulta_nr, 
      this.julh_consulta_nr, 
      this.agos_consulta_nr, 
      this.set_consulta_nr, 
      this.out_consulta_nr, 
      this.nov_consulta_nr, 
      this.dez_consulta_nr
    ],
    label: 'Consulta medica',
    borderWidth: 0
  }, {
    data: [
      this.jan_diagnostico, 
      this.fev_diagnostico, 
      this.marc_diagnostico, 
      this.abril_diagnostico, 
      this.maio_diagnostico, 
      this.junho_diagnostico, 
      this.julh_diagnostico, 
      this.agos_diagnostico, 
      this.set_diagnostico, 
      this.out_diagnostico, 
      this.nov_diagnostico, 
      this.dez_diagnostico
    ],
    label: 'Diagnostico Auxiliar',
    borderWidth: 0
  }];
  barChartOptions: any = Object.assign({
    scaleShowVerticalLines: false,
    tooltips: {
      mode: 'index',
      intersect: false
    },
    responsive: true,
    scales: {
      xAxes: [{
        gridLines: {
          color: 'rgba(0,0,0,0.02)',
          defaultFontColor: 'rgba(0,0,0,0.02)',
          zeroLineColor: 'rgba(0,0,0,0.02)'
        },
        stacked: true,
        ticks: {
          beginAtZero: true
        }
      }],
      yAxes: [{
        gridLines: {
          color: 'rgba(0,0,0,0.02)',
           defaultFontColor: 'rgba(0,0,0,0.02)',
          zeroLineColor: 'rgba(0,0,0,0.02)'
        },
        stacked: true
      }]
    }
  }, this.globalChartOptions);
    




  // combo chart FATURACAO DIARIA
  comboChartLabels2: Array <any> = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31'];
  
  //this.comboChartLabels2[4] = 'HOJE';

  chartColors2: Array <any> = [{ // grey
    backgroundColor: '#7986cb',
    borderColor: '#3f51b5',
    pointBackgroundColor: '#3f51b5',
    pointBorderColor: '#fff',
    pointHoverBackgroundColor: '#fff',
    pointHoverBorderColor: 'rgba(148,159,177,0.8)'
  }/*, { // dark grey
    backgroundColor: '#eeeeee',
    borderColor: '#e0e0e0',
    pointBackgroundColor: '#e0e0e0',
    pointBorderColor: '#fff',
    pointHoverBackgroundColor: '#fff',
    pointHoverBorderColor: 'rgba(77,83,96,1)'
  }, { // grey
    backgroundColor: 'rgba(148,159,177,0.2)',
    borderColor: 'rgba(148,159,177,1)',
    pointBackgroundColor: 'rgba(148,159,177,1)',
    pointBorderColor: '#fff',
    pointHoverBackgroundColor: '#fff',
    pointHoverBorderColor: 'rgba(148,159,177,0.8)'
  }*/];
  comboChartLegend2 = true;
  ComboChartData2: Array <any> = [{
    data: [
      this.um_valor, 
      this.dois_valor, 
      this.tres_valor, 
      this.quatro_valor,
      this.cinco_valor,
      this.seis_valor,
      this.sete_valor,
      this.oito_valor,
      this.nove_valor,
      this.dez_valor,
      this.onze_valor,
      this.doze_valor,
      this.treze_valor,
      this.catorze_valor,
      this.quinze_valor,
      this.dezasseis_valor,
      this.dezassete_valor,
      this.dezoito_valor,
      this.dezanove_valor,
      this.vinte_valor,
      this.vinteum_valor,
      this.vintedois_valor,
      this.vintetrez_valor,
      this.vintequatro_valor,
      this.vintecinco_valor,
      this.vinteseis_valor,
      this.vintesete_valor,
      this.vinteoito_valor,
      this.vintenove_valor,
      this.trinta_valor,
      this.trintaum_valor
    ],
    label: 'Receita',
    borderWidth: 1,
    type: 'line',
    fill: false
  }];
  ComboChartOptions2: any = Object.assign({
    animation: false,
    scales: {
      xAxes: [{
        gridLines: {
          color: 'rgba(0,0,0,0.02)',
          zeroLineColor: 'rgba(0,0,0,0.02)'
        }
      }]/*,
      yAxes: [{
        gridLines: {
          color: 'rgba(0,0,0,0.02)',
          zeroLineColor: 'rgba(0,0,0,0.02)'
        },
        ticks: {
          beginAtZero: true,
          suggestedMax: 9,
        }
      }]*/
    }
  }, this.globalChartOptions);

    // Doughnut MES
    doughnutChartColors: any[] = [{
      //backgroundColor: ['#f44336', '#3f51b5', '#ffeb3b', '#4caf50', '#2196f']
      backgroundColor: ['#008080', '#6495ED', '#4b0082', '#4caf50', '#2196f']
    }];
    doughnutChartLabels: string[] = ['Cons. Medicas', 'Diagnostico Aux', 'Condutas', 'Medicamentos'];
    doughnutChartData: number[] = [this.categoria_valor_CONSULTA_MEDICA , this.categoria_valor_DIAGNOSTICO_AUX, this.categoria_valor_CONDUTA, this.categoria_valor_MEDICAMENTO];
    doughnutChartType = 'doughnut';
    doughnutOptions: any = Object.assign({
      elements: {
        arc: {
          borderWidth: 0
        }
      }
    }, this.globalChartOptions);

    // Doughnut ANO
    doughnutChartColors_ano: any[] = [{
      //backgroundColor: ['#f44336', '#3f51b5', '#ffeb3b', '#4caf50', '#2196f']
      backgroundColor: ['#008080', '#6495ED', '#4b0082', '#4caf50', '#2196f']
    }];
    doughnutChartLabels_ano: string[] = ['Cons. Medicas', 'Diagnostico Aux', 'Condutas', 'Medicamentos'];
    doughnutChartData_ano: number[] = [this.categoria_valor_CONSULTA_MEDICA_ano , this.categoria_valor_DIAGNOSTICO_AUX_ano, this.categoria_valor_CONDUTA_ano, this.categoria_valor_MEDICAMENTO_ano];
    doughnutChartType_ano = 'doughnut';
    doughnutOptions_ano: any = Object.assign({
      elements: {
        arc: {
          borderWidth: 0
        }
      }
    }, this.globalChartOptions);



    //GRAFICOS ESTOQUE
    // Bar
    //barChartLabels_MovimentosEstoque: string[] = ['Jan', 'Fev', 'Marc', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Sete', 'Out', 'Nov', 'Dez'];
    barChartLabels_MovimentosEstoque: string[] = ['Jan', 'Fev', 'Marc', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Sete', 'Out', 'Nov', 'Dez'];
    barChartType_MovimentosEstoque = 'bar';
    barChartLegend_MovimentosEstoque = true;
    barChartData_MovimentosEstoque: any[] = [{
      data: [this.jan_estoque_entrada, this.fev_estoque_entrada, this.marc_estoque_entrada, this.abril_estoque_entrada, this.maio_estoque_entrada, this.jun_estoque_entrada, this.julho_estoque_entrada, this.ago_estoque_entrada, this.set_estoque_entrada, this.out_estoque_entrada, this.nov_estoque_entrada, this.dez_estoque_entrada],
      label: 'Valor de entrada',
      borderWidth: 0
    }, {
      data: [this.jan_estoque_saida, this.fev_estoque_saida, this.marc_estoque_saida, this.abril_estoque_saida, this.maio_estoque_saida, this.jun_estoque_saida, this.julho_estoque_saida, this.ago_estoque_saida, this.set_estoque_saida, this.out_estoque_saida, this.nov_estoque_saida, this.dez_estoque_saida],
      label: 'Valor de saida',
      borderWidth: 0
    }];
    barChartOptions_MovimentosEstoque: any = Object.assign({
      scaleShowVerticalLines: false,
      scales: {
        xAxes: [{
          gridLines: {
            color: 'rgba(0,0,0,0.02)',
            zeroLineColor: 'rgba(0,0,0,0.02)'
          }
        }],
        yAxes: [{
          gridLines: {
            color: 'rgba(0,0,0,0.02)',
            zeroLineColor: 'rgba(0,0,0,0.02)'
          },
          position: 'left',
          ticks: {
            beginAtZero: true,
            suggestedMax: 9
          }
        }]
      }
    }, this.globalChartOptions);

    barChartLabels_FechamentoEstoque: string[] = ['Jan', 'Fev', 'Marc', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Sete', 'Out', 'Nov', 'Dez'];
    barChartType_FechamentoEstoque = 'bar';
    barChartLegend_FechamentoEstoque= true;
    barChartData_FechamentoEstoque: any[] = [{
      data: [this.jan_estoque_acumulado, this.fev_estoque_acumulado, this.marc_estoque_acumulado, this.abril_estoque_acumulado, this.maio_estoque_acumulado, this.jun_estoque_acumulado, this.julho_estoque_acumulado, this.ago_estoque_acumulado, this.set_estoque_acumulado, this.out_estoque_acumulado, this.nov_estoque_acumulado, this.dez_estoque_acumulado],
      label: 'Valor de estoque por mês',
      borderWidth: 0
    }];
    barChartOptions_FechamentoEstoque: any = Object.assign({
      scaleShowVerticalLines: false,
      scales: {
        xAxes: [{
          gridLines: {
            color: 'rgba(0,0,0,0.02)',
            zeroLineColor: 'rgba(0,0,0,0.02)'
          }
        }]
      }
    }, this.globalChartOptions);


 //Fusion plugin: em avaliacao
 // https://www.fusioncharts.com/dev/getting-started/angular/angular/configure-your-chart-using-angular
 // https://www.fusioncharts.com/download/fusioncharts-suite-xt?framework=js
  stackedColumnData = {
    chart: {
      caption: "Yearly Energy Production Rate",
      subCaption: " Top 5 Developed Countries",
      numbersuffix: " MZN",
      showSum: "1",
      plotToolText:
        "$label produces <b>$dataValue</b> of energy from $seriesName",
      //theme: "Fusion"
    },
    categories: [
      {
        category: [
          {
            label: "Canada"
          },
          {
            label: "China"
          },
          {
            label: "Russia"
          },
          {
            label: "Australia"
          },
          {
            label: "United States"
          },
          {
            label: "France"
          }
        ]
      }
    ],
    dataSet: [
      {
        seriesName: "Coal",
        data: [
          {
            value: "400"
          },
          {
            value: "830"
          },
          {
            value: "500"
          },
          {
            value: "420"
          },
          {
            value: "790"
          },
          {
            value: "380"
          }
        ]
      },
      {
        seriesName: "Hydro",
        data: [
          {
            value: "350"
          },
          {
            value: "620"
          },
          {
            value: "410"
          },
          {
            value: "370"
          },
          {
            value: "720"
          },
          {
            value: "310"
          }
        ]
      },
      {
        seriesName: "Nuclear",
        data: [
          {
            value: "210"
          },
          {
            value: "400"
          },
          {
            value: "450"
          },
          {
            value: "180"
          },
          {
            value: "570"
          },
          {
            value: "270"
          }
        ]
      },
      {
        seriesName: "Gas",
        data: [
          {
            value: "180"
          },
          {
            value: "330"
          },
          {
            value: "230"
          },
          {
            value: "160"
          },
          {
            value: "440"
          },
          {
            value: "350"
          }
        ]
      },
      {
        seriesName: "Oil",
        data: [
          {
            value: "60"
          },
          {
            value: "200"
          },
          {
            value: "200"
          },
          {
            value: "50"
          },
          {
            value: "230"
          },
          {
            value: "150"
          }
        ]
      }
    ]
  }

  exportChart(e){
    FusionCharts.batchExport({
      exportFormat:'pdf'
    })
  }

 

}


export class FaturacaoMedico {
  ano?: Number;
  mes?: String;
  //dia?: number;
  medico?: string; //nome do medico
  categoria?: String; //nome da categoria
  quantidade?: number;
  valor?: Number;
}

export class FaturacaoCategoria {
  ano?: Number;
  mes?: String;
  //dia?: number;
  categoria?: String; //nome da categoria
  quantidade?: number;
  valor?: Number;
}












export interface DialogData {
  animal: string;
  name: string;
}
@Component({
  selector: 'dialog-overview-example-dialog',
  templateUrl: './paciente.component.html',
})


export class DialogOverviewExampleDialog {
 pacientes: Paciente[];
 
 @ViewChild(MatPaginator) paginator: MatPaginator;
@ViewChild(MatSort) sort: MatSort;
  dataSourse: MatTableDataSource<Paciente>;
  displayedColumns = ['nid','nome','apelido','genero'];

  constructor(
    public dialogRef: MatDialogRef<DialogOverviewExampleDialog>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData, private pacienteService: PacienteService ,public dialog: MatDialog,) {

      this.pacienteService.getPacientes().snapshotChanges().subscribe(data => {
        this.pacientes = data.map(e => {
          return {
            id: e.payload.key,
            ...e.payload.val(),
          } as Paciente;
        })
        this.dataSourse=new MatTableDataSource(this.pacientes.sort((a, b) => a.nid - b.nid));
        this.dataSourse.paginator = this.paginator;
        this.dataSourse.sort = this.sort;
      })

    }
   
    

  onNoClick(): void {
    this.dialogRef.close();
  }
  
  closeModal(){
 
    this.dialogRef.close();
  }

  zerarDados(){


  }
  
  
}

@Component({
  selector: 'dialogconsultas',
  templateUrl: './consulta.component.html',
})


export class dialogconsultas {
  consultas: Consulta[];
  consultas_encerradas_medicas: any;
  ano:string = (new Date()).getFullYear()+"";
 @ViewChild(MatPaginator) paginator: MatPaginator;
@ViewChild(MatSort) sort: MatSort;
  dataSourse: MatTableDataSource<Consulta>;
  displayedColumns = ['categoria','nid','paciente','paciente_apelido','marcador'];

  constructor(
    public dialogRef: MatDialogRef<DialogOverviewExampleDialog>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData, private pacienteService: PacienteService ,public dialog: MatDialog,) {

      this.pacienteService.getConsultasRelatorio(this.ano).snapshotChanges().subscribe(data => {
        this.consultas = data.map(e => {
          return {
            id: e.payload.key,
            ...e.payload.val(),
          } as Consulta;
        })
        this.dataSourse=new MatTableDataSource(this.consultas.filter( c => c.tipo == "Consulta Medica").sort((a, b)  => a.categoria > b.categoria ? 1 : -1));
        this.dataSourse.paginator = this.paginator;
        this.dataSourse.sort = this.sort;
      })
      }
    


    }

    @Component({
      selector: 'dialogdiagnostico',
      templateUrl: './consulta.component.html',
    })
    
    
    export class dialogdiagnostico {
      consultas: Consulta[];
      consultas_encerradas_medicas: any;
      ano:string = (new Date()).getFullYear()+"";
     @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;
      dataSourse: MatTableDataSource<Consulta>;
      displayedColumns = ['categoria','nid','paciente','paciente_apelido','marcador'];
    
      constructor(
        public dialogRef: MatDialogRef<DialogOverviewExampleDialog>,
        @Inject(MAT_DIALOG_DATA) public data: DialogData, private pacienteService: PacienteService ,public dialog: MatDialog,) {
    
          this.pacienteService.getConsultasRelatorio(this.ano).snapshotChanges().subscribe(data => {
            this.consultas = data.map(e => {
              return {
                id: e.payload.key,
                ...e.payload.val(),
              } as Consulta;
            })
            this.dataSourse=new MatTableDataSource(this.consultas.filter( c => c.tipo == "DIAGNOSTICO AUX").sort((a, b)  => a.categoria > b.categoria ? 1 : -1));
            this.dataSourse.paginator = this.paginator;
            this.dataSourse.sort = this.sort;
          })
          }
        
        }


        @Component({
          selector: 'dialogconduta',
          templateUrl: './conduta.component.html',
        })
        
        
        export class dialogconduta {
          consultas: Consulta[];
          consultas_encerradas_medicas: any;
          ano:string = (new Date()).getFullYear()+"";
         @ViewChild(MatPaginator) paginator: MatPaginator;
        @ViewChild(MatSort) sort: MatSort;
          dataSourse: MatTableDataSource<Consulta>;
          displayedColumns = ['categoria','nid','paciente','paciente_apelido','marcador'];
        
          constructor(
            public dialogRef: MatDialogRef<DialogOverviewExampleDialog>,
            @Inject(MAT_DIALOG_DATA) public data: DialogData, private pacienteService: PacienteService ,public dialog: MatDialog,) {
        
              this.pacienteService.getConsultasRelatorio(this.ano).snapshotChanges().subscribe(data => {
                this.consultas = data.map(e => {
                  return {
                    id: e.payload.key,
                    ...e.payload.val(),
                  } as Consulta;
                })
                this.dataSourse=new MatTableDataSource(this.consultas.filter( c => c.tipo == "CONDUTA CLINICA").sort((a, b)  => a.categoria > b.categoria ? 1 : -1));
                this.dataSourse.paginator = this.paginator;
                this.dataSourse.sort = this.sort;
              })
              }
            
            }