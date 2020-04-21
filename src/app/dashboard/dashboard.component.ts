import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
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
import { Lancamento } from '../classes/lancamentos';
//import { TableUtil } from "./tableUtil";
import * as XLSX from 'xlsx';


export class TableUtil {
  static exportToExcel(tableId: string, name?: string) {
    let timeSpan = new Date().toISOString();
    let prefix = "Lista de entradas e saidas" || name;
    let fileName = `${prefix}-${timeSpan}`;
    let targetTableElm = document.getElementById(tableId);
    let wb = XLSX.utils.table_to_book(targetTableElm, <XLSX.Table2SheetOpts>{ sheet: prefix });
    XLSX.writeFile(wb, `${fileName}.xlsx`);
    //XLSX.write(wb, {bookType: 'xlsx' , bookSST: false, type: 'binary'});
  }
}

@Component({
  //selector: 'app-dashboard',
  selector: 'dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
  tabela = false; //Farmacias
  tabela2 = false; //CLinicas

  exportTable(){
      this.tabela = true;
      setTimeout( () => {
        TableUtil.exportToExcel("ExampleTable", " - "+this.mes);
        this.tabela = false;
      }, 500 );
  }

  exportTable2(){
    this.tabela2 = true;
    setTimeout( () => {
      TableUtil.exportToExcel("ExampleTable2", " - "+this.mes);
      this.tabela2 = false;
    }, 500 );
  }
 
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
  
  //LANCAMENTOS =======================
  lancamentos: Lancamento[] = [];
  lancamentosConsolidados: LancamentoConsolidado[] = [];

  //FARMACIAS
  dataSourseLancamentos: MatTableDataSource<LancamentoConsolidado>;
  displayedColumnsLancamentos = ['Dia',
  'Numerario', 'POS', 'Mpesa', 'Cheque','Convenio','EntradaTotal',
  'Admnistrativa','Energia','Salario', 'Alimentacao', 'Transporte', 'SaidaOutros', 'SaidaTotal'];
  @ViewChild(MatPaginator) paginatorLancamentos: MatPaginator;
  @ViewChild(MatSort) sortLancamentos: MatSort;

  //CLINICAS
  dataSourseLancamentos2: MatTableDataSource<LancamentoConsolidado>;
  displayedColumnsLancamentos2 = ['Dia',
  'Consulta','Diagnostico','Conduta','Medicamento',
  'Numerario', 'POS', 'Mpesa', 'Cheque','Convenio','EntradaTotal',
  'Admnistrativa','Energia','Salario', 'Alimentacao', 'Transporte', 'SaidaOutros', 'SaidaTotal'];
  @ViewChild(MatPaginator) paginatorLancamentos2: MatPaginator;
  @ViewChild(MatSort) sortLancamentos2: MatSort;
  
  saida_Admnistrativa?: number;
  saida_Energia?: number;
  saida_Salario?: number;
  saida_Alimentacao?: number;
  saida_Transporte?: number;
  saida_Outros?: number;

  saida_total?: number;

  /*um_entrada_ = 0
  dois_entrada_ = 0
  tres_entrada_ = 0
  quatro_entrada_ = 0
  cinco_entrada_ = 0
  seis_entrada_ = 0
  sete_entrada_ = 0
  oito_entrada_ = 0
  nove_entrada_ = 0
  dez_entrada_ = 0
  onze_entrada_ = 0
  doze_entrada_ = 0
  treze_entrada_ = 0
  catorze_entrada_ = 0
  quinze_entrada_ = 0
  dezasseis_entrada_ = 0
  dezassete_entrada_ = 0
  dezoito_entrada_ = 0
  dezanove_entrada_ = 0
  vinte_entrada_ = 0
  vinteum_entrada_ = 0
  vintedois_entrada_ = 0
  vintetrez_entrada_ = 0
  vintequatro_entrada_ = 0
  vintecinco_entrada_ = 0
  vinteseis_entrada_ = 0
  vintesete_entrada_ = 0
  vinteoito_entrada_ = 0
  vintenove_entrada_ = 0
  trinta_entrada_ = 0
  trintaum_entrada_ = 0*/

  //ENTRADA POS
  um_entrada_POS = 0
  dois_entrada_POS = 0
  tres_entrada_POS = 0
  quatro_entrada_POS = 0
  cinco_entrada_POS = 0
  seis_entrada_POS = 0
  sete_entrada_POS = 0
  oito_entrada_POS = 0
  nove_entrada_POS = 0
  dez_entrada_POS = 0
  onze_entrada_POS = 0
  doze_entrada_POS = 0
  treze_entrada_POS = 0
  catorze_entrada_POS = 0
  quinze_entrada_POS = 0
  dezasseis_entrada_POS = 0
  dezassete_entrada_POS = 0
  dezoito_entrada_POS = 0
  dezanove_entrada_POS = 0
  vinte_entrada_POS = 0
  vinteum_entrada_POS = 0
  vintedois_entrada_POS = 0
  vintetrez_entrada_POS = 0
  vintequatro_entrada_POS = 0
  vintecinco_entrada_POS = 0
  vinteseis_entrada_POS = 0
  vintesete_entrada_POS = 0
  vinteoito_entrada_POS = 0
  vintenove_entrada_POS = 0
  trinta_entrada_POS = 0
  trintaum_entrada_POS = 0

  //ENTRADA NUMERARIO
  um_entrada_NUMERARIO = 0
  dois_entrada_NUMERARIO = 0
  tres_entrada_NUMERARIO = 0
  quatro_entrada_NUMERARIO = 0
  cinco_entrada_NUMERARIO = 0
  seis_entrada_NUMERARIO = 0
  sete_entrada_NUMERARIO = 0
  oito_entrada_NUMERARIO = 0
  nove_entrada_NUMERARIO = 0
  dez_entrada_NUMERARIO = 0
  onze_entrada_NUMERARIO = 0
  doze_entrada_NUMERARIO = 0
  treze_entrada_NUMERARIO = 0
  catorze_entrada_NUMERARIO = 0
  quinze_entrada_NUMERARIO = 0
  dezasseis_entrada_NUMERARIO = 0
  dezassete_entrada_NUMERARIO = 0
  dezoito_entrada_NUMERARIO = 0
  dezanove_entrada_NUMERARIO = 0
  vinte_entrada_NUMERARIO = 0
  vinteum_entrada_NUMERARIO = 0
  vintedois_entrada_NUMERARIO = 0
  vintetrez_entrada_NUMERARIO = 0
  vintequatro_entrada_NUMERARIO = 0
  vintecinco_entrada_NUMERARIO = 0
  vinteseis_entrada_NUMERARIO = 0
  vintesete_entrada_NUMERARIO = 0
  vinteoito_entrada_NUMERARIO = 0
  vintenove_entrada_NUMERARIO = 0
  trinta_entrada_NUMERARIO = 0
  trintaum_entrada_NUMERARIO = 0

  //ENTRADA MPESA
  um_entrada_MPesa = 0
  dois_entrada_MPesa = 0
  tres_entrada_MPesa = 0
  quatro_entrada_MPesa = 0
  cinco_entrada_MPesa = 0
  seis_entrada_MPesa = 0
  sete_entrada_MPesa = 0
  oito_entrada_MPesa = 0
  nove_entrada_MPesa = 0
  dez_entrada_MPesa = 0
  onze_entrada_MPesa = 0
  doze_entrada_MPesa = 0
  treze_entrada_MPesa = 0
  catorze_entrada_MPesa = 0
  quinze_entrada_MPesa = 0
  dezasseis_entrada_MPesa = 0
  dezassete_entrada_MPesa = 0
  dezoito_entrada_MPesa = 0
  dezanove_entrada_MPesa = 0
  vinte_entrada_MPesa = 0
  vinteum_entrada_MPesa = 0
  vintedois_entrada_MPesa = 0
  vintetrez_entrada_MPesa = 0
  vintequatro_entrada_MPesa = 0
  vintecinco_entrada_MPesa = 0
  vinteseis_entrada_MPesa = 0
  vintesete_entrada_MPesa = 0
  vinteoito_entrada_MPesa = 0
  vintenove_entrada_MPesa = 0
  trinta_entrada_MPesa = 0
  trintaum_entrada_MPesa = 0

  //ENTRADA CHEQUE
  um_entrada_Cheque = 0
  dois_entrada_Cheque = 0
  tres_entrada_Cheque = 0
  quatro_entrada_Cheque = 0
  cinco_entrada_Cheque = 0
  seis_entrada_Cheque = 0
  sete_entrada_Cheque = 0
  oito_entrada_Cheque = 0
  nove_entrada_Cheque = 0
  dez_entrada_Cheque = 0
  onze_entrada_Cheque = 0
  doze_entrada_Cheque = 0
  treze_entrada_Cheque = 0
  catorze_entrada_Cheque = 0
  quinze_entrada_Cheque = 0
  dezasseis_entrada_Cheque = 0
  dezassete_entrada_Cheque = 0
  dezoito_entrada_Cheque = 0
  dezanove_entrada_Cheque = 0
  vinte_entrada_Cheque = 0
  vinteum_entrada_Cheque = 0
  vintedois_entrada_Cheque = 0
  vintetrez_entrada_Cheque = 0
  vintequatro_entrada_Cheque = 0
  vintecinco_entrada_Cheque = 0
  vinteseis_entrada_Cheque = 0
  vintesete_entrada_Cheque = 0
  vinteoito_entrada_Cheque = 0
  vintenove_entrada_Cheque = 0
  trinta_entrada_Cheque = 0
  trintaum_entrada_Cheque = 0

  //ENTRADA CONVEBIO
  um_entrada_Convenio = 0
  dois_entrada_Convenio = 0
  tres_entrada_Convenio = 0
  quatro_entrada_Convenio = 0
  cinco_entrada_Convenio = 0
  seis_entrada_Convenio = 0
  sete_entrada_Convenio = 0
  oito_entrada_Convenio = 0
  nove_entrada_Convenio = 0
  dez_entrada_Convenio = 0
  onze_entrada_Convenio = 0
  doze_entrada_Convenio = 0
  treze_entrada_Convenio = 0
  catorze_entrada_Convenio = 0
  quinze_entrada_Convenio = 0
  dezasseis_entrada_Convenio = 0
  dezassete_entrada_Convenio = 0
  dezoito_entrada_Convenio = 0
  dezanove_entrada_Convenio = 0
  vinte_entrada_Convenio = 0
  vinteum_entrada_Convenio = 0
  vintedois_entrada_Convenio = 0
  vintetrez_entrada_Convenio = 0
  vintequatro_entrada_Convenio = 0
  vintecinco_entrada_Convenio = 0
  vinteseis_entrada_Convenio = 0
  vintesete_entrada_Convenio = 0
  vinteoito_entrada_Convenio = 0
  vintenove_entrada_Convenio = 0
  trinta_entrada_Convenio = 0
  trintaum_entrada_Convenio = 0

  //ENTRADA CONSULTA
  um_entrada_Consulta = 0
  dois_entrada_Consulta = 0
  tres_entrada_Consulta = 0
  quatro_entrada_Consulta = 0
  cinco_entrada_Consulta = 0
  seis_entrada_Consulta = 0
  sete_entrada_Consulta = 0
  oito_entrada_Consulta = 0
  nove_entrada_Consulta = 0
  dez_entrada_Consulta = 0
  onze_entrada_Consulta = 0
  doze_entrada_Consulta = 0
  treze_entrada_Consulta = 0
  catorze_entrada_Consulta = 0
  quinze_entrada_Consulta = 0
  dezasseis_entrada_Consulta = 0
  dezassete_entrada_Consulta = 0
  dezoito_entrada_Consulta = 0
  dezanove_entrada_Consulta = 0
  vinte_entrada_Consulta = 0
  vinteum_entrada_Consulta = 0
  vintedois_entrada_Consulta = 0
  vintetrez_entrada_Consulta = 0
  vintequatro_entrada_Consulta = 0
  vintecinco_entrada_Consulta = 0
  vinteseis_entrada_Consulta = 0
  vintesete_entrada_Consulta = 0
  vinteoito_entrada_Consulta = 0
  vintenove_entrada_Consulta = 0
  trinta_entrada_Consulta = 0
  trintaum_entrada_Consulta = 0

  //ENTRADA DIAGNOSTICO AUX
  um_entrada_Diagnostico = 0
  dois_entrada_Diagnostico = 0
  tres_entrada_Diagnostico = 0
  quatro_entrada_Diagnostico = 0
  cinco_entrada_Diagnostico = 0
  seis_entrada_Diagnostico = 0
  sete_entrada_Diagnostico = 0
  oito_entrada_Diagnostico = 0
  nove_entrada_Diagnostico = 0
  dez_entrada_Diagnostico = 0
  onze_entrada_Diagnostico = 0
  doze_entrada_Diagnostico = 0
  treze_entrada_Diagnostico = 0
  catorze_entrada_Diagnostico = 0
  quinze_entrada_Diagnostico = 0
  dezasseis_entrada_Diagnostico = 0
  dezassete_entrada_Diagnostico = 0
  dezoito_entrada_Diagnostico = 0
  dezanove_entrada_Diagnostico = 0
  vinte_entrada_Diagnostico = 0
  vinteum_entrada_Diagnostico = 0
  vintedois_entrada_Diagnostico = 0
  vintetrez_entrada_Diagnostico = 0
  vintequatro_entrada_Diagnostico = 0
  vintecinco_entrada_Diagnostico = 0
  vinteseis_entrada_Diagnostico = 0
  vintesete_entrada_Diagnostico = 0
  vinteoito_entrada_Diagnostico = 0
  vintenove_entrada_Diagnostico = 0
  trinta_entrada_Diagnostico = 0
  trintaum_entrada_Diagnostico = 0

  //ENTRADA CONDUTAS
  um_entrada_Conduta = 0
  dois_entrada_Conduta = 0
  tres_entrada_Conduta = 0
  quatro_entrada_Conduta = 0
  cinco_entrada_Conduta = 0
  seis_entrada_Conduta = 0
  sete_entrada_Conduta = 0
  oito_entrada_Conduta = 0
  nove_entrada_Conduta = 0
  dez_entrada_Conduta = 0
  onze_entrada_Conduta = 0
  doze_entrada_Conduta = 0
  treze_entrada_Conduta = 0
  catorze_entrada_Conduta = 0
  quinze_entrada_Conduta = 0
  dezasseis_entrada_Conduta = 0
  dezassete_entrada_Conduta = 0
  dezoito_entrada_Conduta = 0
  dezanove_entrada_Conduta = 0
  vinte_entrada_Conduta = 0
  vinteum_entrada_Conduta = 0
  vintedois_entrada_Conduta = 0
  vintetrez_entrada_Conduta = 0
  vintequatro_entrada_Conduta = 0
  vintecinco_entrada_Conduta = 0
  vinteseis_entrada_Conduta = 0
  vintesete_entrada_Conduta = 0
  vinteoito_entrada_Conduta = 0
  vintenove_entrada_Conduta = 0
  trinta_entrada_Conduta = 0
  trintaum_entrada_Conduta = 0

  //ENTRADA MEDICAMENTO
  um_entrada_Medicamento = 0
  dois_entrada_Medicamento = 0
  tres_entrada_Medicamento = 0
  quatro_entrada_Medicamento = 0
  cinco_entrada_Medicamento = 0
  seis_entrada_Medicamento = 0
  sete_entrada_Medicamento = 0
  oito_entrada_Medicamento = 0
  nove_entrada_Medicamento = 0
  dez_entrada_Medicamento = 0
  onze_entrada_Medicamento = 0
  doze_entrada_Medicamento = 0
  treze_entrada_Medicamento = 0
  catorze_entrada_Medicamento = 0
  quinze_entrada_Medicamento = 0
  dezasseis_entrada_Medicamento = 0
  dezassete_entrada_Medicamento = 0
  dezoito_entrada_Medicamento = 0
  dezanove_entrada_Medicamento = 0
  vinte_entrada_Medicamento = 0
  vinteum_entrada_Medicamento = 0
  vintedois_entrada_Medicamento = 0
  vintetrez_entrada_Medicamento = 0
  vintequatro_entrada_Medicamento = 0
  vintecinco_entrada_Medicamento = 0
  vinteseis_entrada_Medicamento = 0
  vintesete_entrada_Medicamento = 0
  vinteoito_entrada_Medicamento = 0
  vintenove_entrada_Medicamento = 0
  trinta_entrada_Medicamento = 0
  trintaum_entrada_Medicamento = 0

  //ENTRADA TOTAL
  um_entrada_Total = 0
  dois_entrada_Total = 0
  tres_entrada_Total = 0
  quatro_entrada_Total = 0
  cinco_entrada_Total = 0
  seis_entrada_Total = 0
  sete_entrada_Total = 0
  oito_entrada_Total = 0
  nove_entrada_Total = 0
  dez_entrada_Total = 0
  onze_entrada_Total = 0
  doze_entrada_Total = 0
  treze_entrada_Total = 0
  catorze_entrada_Total = 0
  quinze_entrada_Total = 0
  dezasseis_entrada_Total = 0
  dezassete_entrada_Total = 0
  dezoito_entrada_Total = 0
  dezanove_entrada_Total = 0
  vinte_entrada_Total = 0
  vinteum_entrada_Total = 0
  vintedois_entrada_Total = 0
  vintetrez_entrada_Total = 0
  vintequatro_entrada_Total = 0
  vintecinco_entrada_Total = 0
  vinteseis_entrada_Total = 0
  vintesete_entrada_Total = 0
  vinteoito_entrada_Total = 0
  vintenove_entrada_Total = 0
  trinta_entrada_Total = 0
  trintaum_entrada_Total = 0

  //SAIDA TOTAL
  um_saida_Total = 0
  dois_saida_Total = 0
  tres_saida_Total = 0
  quatro_saida_Total = 0
  cinco_saida_Total = 0
  seis_saida_Total = 0
  sete_saida_Total = 0
  oito_saida_Total = 0
  nove_saida_Total = 0
  dez_saida_Total = 0
  onze_saida_Total = 0
  doze_saida_Total = 0
  treze_saida_Total = 0
  catorze_saida_Total = 0
  quinze_saida_Total = 0
  dezasseis_saida_Total = 0
  dezassete_saida_Total = 0
  dezoito_saida_Total = 0
  dezanove_saida_Total = 0
  vinte_saida_Total = 0
  vinteum_saida_Total = 0
  vintedois_saida_Total = 0
  vintetrez_saida_Total = 0
  vintequatro_saida_Total = 0
  vintecinco_saida_Total = 0
  vinteseis_saida_Total = 0
  vintesete_saida_Total = 0
  vinteoito_saida_Total = 0
  vintenove_saida_Total = 0
  trinta_saida_Total = 0
  trintaum_saida_Total = 0

  //SAIDA ENERGIA
  um_saida_Energia = 0
  dois_saida_Energia = 0
  tres_saida_Energia = 0
  quatro_saida_Energia = 0
  cinco_saida_Energia = 0
  seis_saida_Energia = 0
  sete_saida_Energia = 0
  oito_saida_Energia = 0
  nove_saida_Energia = 0
  dez_saida_Energia = 0
  onze_saida_Energia = 0
  doze_saida_Energia = 0
  treze_saida_Energia = 0
  catorze_saida_Energia = 0
  quinze_saida_Energia = 0
  dezasseis_saida_Energia = 0
  dezassete_saida_Energia = 0
  dezoito_saida_Energia = 0
  dezanove_saida_Energia = 0
  vinte_saida_Energia = 0
  vinteum_saida_Energia = 0
  vintedois_saida_Energia = 0
  vintetrez_saida_Energia = 0
  vintequatro_saida_Energia = 0
  vintecinco_saida_Energia = 0
  vinteseis_saida_Energia = 0
  vintesete_saida_Energia = 0
  vinteoito_saida_Energia = 0
  vintenove_saida_Energia = 0
  trinta_saida_Energia = 0
  trintaum_saida_Energia = 0

  //SAIDA DESPESAS ADMNISTRATIVAS
  um_saida_Admnistrativas = 0
  dois_saida_Admnistrativas = 0
  tres_saida_Admnistrativas = 0
  quatro_saida_Admnistrativas = 0
  cinco_saida_Admnistrativas = 0
  seis_saida_Admnistrativas = 0
  sete_saida_Admnistrativas = 0
  oito_saida_Admnistrativas = 0
  nove_saida_Admnistrativas = 0
  dez_saida_Admnistrativas = 0
  onze_saida_Admnistrativas = 0
  doze_saida_Admnistrativas = 0
  treze_saida_Admnistrativas = 0
  catorze_saida_Admnistrativas = 0
  quinze_saida_Admnistrativas = 0
  dezasseis_saida_Admnistrativas = 0
  dezassete_saida_Admnistrativas = 0
  dezoito_saida_Admnistrativas = 0
  dezanove_saida_Admnistrativas = 0
  vinte_saida_Admnistrativas = 0
  vinteum_saida_Admnistrativas = 0
  vintedois_saida_Admnistrativas = 0
  vintetrez_saida_Admnistrativas = 0
  vintequatro_saida_Admnistrativas = 0
  vintecinco_saida_Admnistrativas = 0
  vinteseis_saida_Admnistrativas = 0
  vintesete_saida_Admnistrativas = 0
  vinteoito_saida_Admnistrativas = 0
  vintenove_saida_Admnistrativas = 0
  trinta_saida_Admnistrativas = 0
  trintaum_saida_Admnistrativas = 0

  //SAIDA ALIMENTACAO
  um_saida_Alimentacao = 0
  dois_saida_Alimentacao = 0
  tres_saida_Alimentacao = 0
  quatro_saida_Alimentacao = 0
  cinco_saida_Alimentacao = 0
  seis_saida_Alimentacao = 0
  sete_saida_Alimentacao = 0
  oito_saida_Alimentacao = 0
  nove_saida_Alimentacao = 0
  dez_saida_Alimentacao = 0
  onze_saida_Alimentacao = 0
  doze_saida_Alimentacao = 0
  treze_saida_Alimentacao = 0
  catorze_saida_Alimentacao = 0
  quinze_saida_Alimentacao = 0
  dezasseis_saida_Alimentacao = 0
  dezassete_saida_Alimentacao = 0
  dezoito_saida_Alimentacao = 0
  dezanove_saida_Alimentacao = 0
  vinte_saida_Alimentacao = 0
  vinteum_saida_Alimentacao = 0
  vintedois_saida_Alimentacao = 0
  vintetrez_saida_Alimentacao = 0
  vintequatro_saida_Alimentacao = 0
  vintecinco_saida_Alimentacao = 0
  vinteseis_saida_Alimentacao = 0
  vintesete_saida_Alimentacao = 0
  vinteoito_saida_Alimentacao = 0
  vintenove_saida_Alimentacao = 0
  trinta_saida_Alimentacao = 0
  trintaum_saida_Alimentacao = 0

  //SAIDA TRANSPORTE
  um_saida_Transporte = 0
  dois_saida_Transporte = 0
  tres_saida_Transporte = 0
  quatro_saida_Transporte = 0
  cinco_saida_Transporte = 0
  seis_saida_Transporte = 0
  sete_saida_Transporte = 0
  oito_saida_Transporte = 0
  nove_saida_Transporte = 0
  dez_saida_Transporte = 0
  onze_saida_Transporte = 0
  doze_saida_Transporte = 0
  treze_saida_Transporte = 0
  catorze_saida_Transporte = 0
  quinze_saida_Transporte = 0
  dezasseis_saida_Transporte = 0
  dezassete_saida_Transporte = 0
  dezoito_saida_Transporte = 0
  dezanove_saida_Transporte = 0
  vinte_saida_Transporte = 0
  vinteum_saida_Transporte = 0
  vintedois_saida_Transporte = 0
  vintetrez_saida_Transporte = 0
  vintequatro_saida_Transporte = 0
  vintecinco_saida_Transporte = 0
  vinteseis_saida_Transporte = 0
  vintesete_saida_Transporte = 0
  vinteoito_saida_Transporte = 0
  vintenove_saida_Transporte = 0
  trinta_saida_Transporte = 0
  trintaum_saida_Transporte = 0

  //SAIDA SALARIOS
  um_saida_Salario = 0
  dois_saida_Salario = 0
  tres_saida_Salario = 0
  quatro_saida_Salario = 0
  cinco_saida_Salario = 0
  seis_saida_Salario = 0
  sete_saida_Salario = 0
  oito_saida_Salario = 0
  nove_saida_Salario = 0
  dez_saida_Salario = 0
  onze_saida_Salario = 0
  doze_saida_Salario = 0
  treze_saida_Salario = 0
  catorze_saida_Salario = 0
  quinze_saida_Salario = 0
  dezasseis_saida_Salario = 0
  dezassete_saida_Salario = 0
  dezoito_saida_Salario = 0
  dezanove_saida_Salario = 0
  vinte_saida_Salario = 0
  vinteum_saida_Salario = 0
  vintedois_saida_Salario = 0
  vintetrez_saida_Salario = 0
  vintequatro_saida_Salario = 0
  vintecinco_saida_Salario = 0
  vinteseis_saida_Salario = 0
  vintesete_saida_Salario = 0
  vinteoito_saida_Salario = 0
  vintenove_saida_Salario = 0
  trinta_saida_Salario = 0
  trintaum_saida_Salario = 0

  //SAIDA OUTROS
  um_saida_Outros = 0
  dois_saida_Outros = 0
  tres_saida_Outros = 0
  quatro_saida_Outros = 0
  cinco_saida_Outros = 0
  seis_saida_Outros = 0
  sete_saida_Outros = 0
  oito_saida_Outros = 0
  nove_saida_Outros = 0
  dez_saida_Outros = 0
  onze_saida_Outros = 0
  doze_saida_Outros = 0
  treze_saida_Outros = 0
  catorze_saida_Outros = 0
  quinze_saida_Outros = 0
  dezasseis_saida_Outros = 0
  dezassete_saida_Outros = 0
  dezoito_saida_Outros = 0
  dezanove_saida_Outros = 0
  vinte_saida_Outros = 0
  vinteum_saida_Outros = 0
  vintedois_saida_Outros = 0
  vintetrez_saida_Outros = 0
  vintequatro_saida_Outros = 0
  vintecinco_saida_Outros = 0
  vinteseis_saida_Outros = 0
  vintesete_saida_Outros = 0
  vinteoito_saida_Outros = 0
  vintenove_saida_Outros = 0
  trinta_saida_Outros = 0
  trintaum_saida_Outros = 0

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

      this.configService.getLancamentos(this.ano, this.mes).snapshotChanges().subscribe(data => {
        this.lancamentos = data.map(e => {
          return {
            id: e.payload.key,
            ...e.payload.val(),
          } as Lancamento;
        })

        let um_LancamentoConsolidado = new LancamentoConsolidado(1,this.mes, 0, 0, 0, 0, 0,0, 0, 0, 0, 0, 0, 0, 0, 0, 0,0, 0);
        let dois_LancamentoConsolidado = new LancamentoConsolidado(2,this.mes, 0, 0, 0, 0, 0,0, 0, 0, 0, 0, 0, 0, 0, 0, 0,0, 0);
        let tres_LancamentoConsolidado = new LancamentoConsolidado(3,this.mes, 0, 0, 0, 0, 0,0, 0, 0, 0, 0, 0, 0, 0, 0, 0,0, 0);
        let quatro_LancamentoConsolidado = new LancamentoConsolidado(4,this.mes, 0, 0, 0, 0, 0,0, 0, 0, 0, 0, 0, 0, 0, 0, 0,0, 0);
        let cinco_LancamentoConsolidado = new LancamentoConsolidado(5,this.mes, 0, 0, 0, 0, 0,0, 0, 0, 0, 0, 0, 0, 0, 0, 0,0, 0);
        let seis_LancamentoConsolidado = new LancamentoConsolidado(6,this.mes, 0, 0, 0, 0, 0,0, 0, 0, 0, 0, 0, 0, 0, 0, 0,0, 0);
        let sete_LancamentoConsolidado = new LancamentoConsolidado(7,this.mes, 0, 0, 0, 0, 0,0, 0, 0, 0, 0, 0, 0, 0, 0, 0,0, 0);
        let oito_LancamentoConsolidado = new LancamentoConsolidado(8,this.mes, 0, 0, 0, 0, 0,0, 0, 0, 0, 0, 0, 0, 0, 0, 0,0, 0);
        let nove_LancamentoConsolidado = new LancamentoConsolidado(9,this.mes, 0, 0, 0, 0, 0,0, 0, 0, 0, 0, 0, 0, 0, 0, 0,0, 0);
        let dez_LancamentoConsolidado = new LancamentoConsolidado(10,this.mes, 0, 0, 0, 0, 0,0, 0, 0, 0, 0, 0, 0, 0, 0, 0,0, 0);
        let onze_LancamentoConsolidado = new LancamentoConsolidado(11,this.mes, 0, 0, 0, 0, 0,0, 0, 0, 0, 0, 0, 0, 0, 0, 0,0, 0);
        let doze_LancamentoConsolidado = new LancamentoConsolidado(12,this.mes, 0, 0, 0, 0, 0,0, 0, 0, 0, 0, 0, 0, 0, 0, 0,0, 0);
        let treze_LancamentoConsolidado = new LancamentoConsolidado(13,this.mes, 0, 0, 0, 0, 0,0, 0, 0, 0, 0, 0, 0, 0, 0, 0,0, 0);
        let catorze_LancamentoConsolidado = new LancamentoConsolidado(14,this.mes, 0, 0, 0, 0, 0,0, 0, 0, 0, 0, 0, 0, 0, 0, 0,0, 0);
        let quinze_LancamentoConsolidado = new LancamentoConsolidado(15,this.mes, 0, 0, 0, 0, 0,0, 0, 0, 0, 0, 0, 0, 0, 0, 0,0, 0);
        let dezasseis_LancamentoConsolidado = new LancamentoConsolidado(16,this.mes, 0, 0, 0, 0, 0,0, 0, 0, 0, 0, 0, 0, 0, 0, 0,0, 0);
        let dezassete_LancamentoConsolidado =  new LancamentoConsolidado(17,this.mes, 0, 0, 0, 0, 0,0, 0, 0, 0, 0, 0, 0, 0, 0, 0,0, 0);
        let dezoito_LancamentoConsolidado = new LancamentoConsolidado(18,this.mes, 0, 0, 0, 0, 0,0, 0, 0, 0, 0, 0, 0, 0, 0, 0,0, 0);
        let dezanove_LancamentoConsolidado = new LancamentoConsolidado(19,this.mes, 0, 0, 0, 0, 0,0, 0, 0, 0, 0, 0, 0, 0, 0, 0,0, 0);
        let vinte_LancamentoConsolidado = new LancamentoConsolidado(20,this.mes, 0, 0, 0, 0, 0,0, 0, 0, 0, 0, 0, 0, 0, 0, 0,0, 0);
        let vinteum_LancamentoConsolidado = new LancamentoConsolidado(21,this.mes, 0, 0, 0, 0, 0,0, 0, 0, 0, 0, 0, 0, 0, 0, 0,0, 0);
        let vintedois_LancamentoConsolidado = new LancamentoConsolidado(22,this.mes, 0, 0, 0, 0, 0,0, 0, 0, 0, 0, 0, 0, 0, 0, 0,0, 0);
        let vintetrez_LancamentoConsolidado = new LancamentoConsolidado(23,this.mes, 0, 0, 0, 0, 0,0, 0, 0, 0, 0, 0, 0, 0, 0, 0,0, 0);
        let vintequatro_LancamentoConsolidado = new LancamentoConsolidado(24,this.mes, 0, 0, 0, 0, 0,0, 0, 0, 0, 0, 0, 0, 0, 0, 0,0, 0);
        let vintecinco_LancamentoConsolidado = new LancamentoConsolidado(25,this.mes, 0, 0, 0, 0, 0,0, 0, 0, 0, 0, 0, 0, 0, 0, 0,0, 0);
        let vinteseis_LancamentoConsolidado = new LancamentoConsolidado(26,this.mes, 0, 0, 0, 0, 0,0, 0, 0, 0, 0, 0, 0, 0, 0, 0,0, 0);
        let vintesete_LancamentoConsolidado = new LancamentoConsolidado(27,this.mes, 0, 0, 0, 0, 0,0, 0, 0, 0, 0, 0, 0, 0, 0, 0,0, 0);
        let vinteoito_LancamentoConsolidado = new LancamentoConsolidado(28,this.mes, 0, 0, 0, 0, 0,0, 0, 0, 0, 0, 0, 0, 0, 0, 0,0, 0);
        let vintenove_LancamentoConsolidado = new LancamentoConsolidado(29,this.mes, 0, 0, 0, 0, 0,0, 0, 0, 0, 0, 0, 0, 0, 0, 0,0, 0);
        let trinta_LancamentoConsolidado = new LancamentoConsolidado(30,this.mes, 0, 0, 0, 0, 0,0, 0, 0, 0, 0, 0, 0, 0, 0, 0,0, 0);
        let trintaum_LancamentoConsolidado = new LancamentoConsolidado(31,this.mes, 0, 0, 0, 0, 0,0, 0, 0, 0, 0, 0, 0, 0, 0, 0,0, 0);

        this.resetDadosLancamentos();

        //let dia = new Date(element.data).toISOString().substr(8,2);

        this.lancamentos.forEach(element => {
          //let dia = new Date(element.data).toISOString().substr(8,2);

          switch(element.dia+"") {
            case "01": { 
              this.um_entrada_NUMERARIO = element.formaPagamento == "Numerário" ? +this.um_entrada_NUMERARIO + +element.valor : this.um_entrada_NUMERARIO;
              this.um_entrada_POS = element.formaPagamento == "POS" ? +this.um_entrada_POS + +element.valor : this.um_entrada_POS;
              this.um_entrada_MPesa = element.formaPagamento == "MPesa" ? +this.um_entrada_MPesa + +element.valor : this.um_entrada_MPesa;
              this.um_entrada_Cheque = element.formaPagamento == "Cheque" ? +this.um_entrada_Cheque + +element.valor : this.um_entrada_Cheque;
              this.um_entrada_Convenio= element.formaPagamento == "Convênio" ? +this.um_entrada_Convenio + +element.valor : this.um_entrada_Convenio;
              
              this.um_entrada_Consulta = element.plano_nome == "CONSULTA_MEDICA" ? +this.um_entrada_Consulta + +element.valor : this.um_entrada_Consulta;
              this.um_entrada_Diagnostico = element.plano_nome == "DIAGNOSTICO_AUX" ? +this.um_entrada_Diagnostico + +element.valor : this.um_entrada_Diagnostico;
              this.um_entrada_Conduta = element.plano_nome == "CONDUTA CLINICA" ? +this.um_entrada_Conduta + +element.valor : this.um_entrada_Conduta;
              this.um_entrada_Medicamento = element.plano_nome == "MEDICAMENTO" ? +this.um_entrada_Medicamento + +element.valor : this.um_entrada_Medicamento;

              this.um_entrada_Total = element.tipo_nome == "2.Entrada" ? +this.um_entrada_Total + +element.valor : this.um_entrada_Total;
              
              this.um_saida_Energia = (element.tipo_nome == "1.Saida" && element.plano_nome == "Energia") ? +this.um_saida_Energia + +element.valor : this.um_saida_Energia;
              this.um_saida_Salario = (element.tipo_nome == "1.Saida" && element.plano_nome == "Salario") ? +this.um_saida_Salario + +element.valor : this.um_saida_Salario;
              this.um_saida_Transporte = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && element.subtipo_nome == "1.2.Despesas de transporte") ? +this.um_saida_Transporte + +element.valor : this.um_saida_Transporte;
              this.um_saida_Alimentacao = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && element.subtipo_nome == "1.3.Despesas de alimentacao") ? +this.um_saida_Alimentacao + +element.valor : this.um_saida_Alimentacao;
              this.um_saida_Admnistrativas = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && element.subtipo_nome == "1.1.Despesas admnistrativas") ? +this.um_saida_Admnistrativas + +element.valor : this.um_saida_Admnistrativas;
              this.um_saida_Outros = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && (element.subtipo_nome !== "1.1.Despesas admnistrativas" && element.subtipo_nome !== "1.2.Despesas de transporte" && element.subtipo_nome !== "1.3.Despesas de alimentacao")) ? +this.um_saida_Outros + +element.valor : this.um_saida_Outros;
              
              this.um_saida_Total = element.tipo_nome == "1.Saida" ? +this.um_saida_Total + +element.valor : this.um_saida_Total;

              um_LancamentoConsolidado = new LancamentoConsolidado(
                element.dia, element.mes, this.um_entrada_NUMERARIO, this.um_entrada_POS, this.um_entrada_MPesa, this.um_entrada_Cheque, this.um_entrada_Convenio,
                this.um_entrada_Consulta, this.um_entrada_Diagnostico, this.um_entrada_Conduta, this.um_entrada_Medicamento, this.um_entrada_Total,
                this.um_saida_Energia, this.um_saida_Salario, this.um_saida_Alimentacao, this.um_saida_Transporte, this.um_saida_Admnistrativas,
                this.um_saida_Outros, this.um_saida_Total);
              break;
            } 
            case "02": {
              this.dois_entrada_NUMERARIO = element.formaPagamento == "Numerário" ? +this.dois_entrada_NUMERARIO + +element.valor : this.dois_entrada_NUMERARIO;
              this.dois_entrada_POS = element.formaPagamento == "POS" ? +this.dois_entrada_POS + +element.valor : this.dois_entrada_POS;
              this.dois_entrada_MPesa = element.formaPagamento == "MPesa" ? +this.dois_entrada_MPesa + +element.valor : this.dois_entrada_MPesa;
              this.dois_entrada_Cheque = element.formaPagamento == "Cheque" ? +this.dois_entrada_Cheque + +element.valor : this.dois_entrada_Cheque;
              this.dois_entrada_Convenio= element.formaPagamento == "Convênio" ? +this.dois_entrada_Convenio + +element.valor : this.dois_entrada_Convenio;
              
              this.dois_entrada_Consulta = element.plano_nome == "CONSULTA_MEDICA" ? +this.dois_entrada_Consulta + +element.valor : this.dois_entrada_Consulta;
              this.dois_entrada_Diagnostico = element.plano_nome == "DIAGNOSTICO_AUX" ? +this.dois_entrada_Diagnostico + +element.valor : this.dois_entrada_Diagnostico;
              this.dois_entrada_Conduta = element.plano_nome == "CONDUTA CLINICA" ? +this.dois_entrada_Conduta + +element.valor : this.dois_entrada_Conduta;
              this.dois_entrada_Medicamento = element.plano_nome == "MEDICAMENTO" ? +this.dois_entrada_Medicamento + +element.valor : this.dois_entrada_Medicamento;

              this.dois_entrada_Total = element.tipo_nome == "2.Entrada" ? +this.dois_entrada_Total + +element.valor : this.dois_entrada_Total;

              this.dois_saida_Energia = (element.tipo_nome == "1.Saida" && element.plano_nome == "Energia") ? +this.dois_saida_Energia + +element.valor : this.dois_saida_Energia;
              this.dois_saida_Salario = (element.tipo_nome == "1.Saida" && element.plano_nome == "Salario") ? +this.dois_saida_Salario + +element.valor : this.dois_saida_Salario;
              this.dois_saida_Transporte = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && element.subtipo_nome == "1.2.Despesas de transporte") ? +this.dois_saida_Transporte + +element.valor : this.dois_saida_Transporte;
              this.dois_saida_Alimentacao = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && element.subtipo_nome == "1.3.Despesas de alimentacao") ? +this.dois_saida_Alimentacao + +element.valor : this.dois_saida_Alimentacao;
              this.dois_saida_Admnistrativas = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && element.subtipo_nome == "1.1.Despesas admnistrativas") ? +this.dois_saida_Admnistrativas + +element.valor : this.dois_saida_Admnistrativas;
              this.dois_saida_Outros = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && (element.subtipo_nome !== "1.1.Despesas admnistrativas" && element.subtipo_nome !== "1.2.Despesas de transporte" && element.subtipo_nome !== "1.3.Despesas de alimentacao")) ? +this.dois_saida_Outros + +element.valor : this.dois_saida_Outros;

              this.dois_saida_Total = element.tipo_nome == "1.Saida" ? +this.dois_saida_Total + +element.valor : this.dois_saida_Total;             

              dois_LancamentoConsolidado = new LancamentoConsolidado(
                element.dia,element.mes, this.dois_entrada_NUMERARIO, this.dois_entrada_POS, this.dois_entrada_MPesa, this.dois_entrada_Cheque, this.dois_entrada_Convenio,
                this.dois_entrada_Consulta, this.dois_entrada_Diagnostico, this.dois_entrada_Conduta, this.dois_entrada_Medicamento, this.dois_entrada_Total,
                this.dois_saida_Energia, this.dois_saida_Salario, this.dois_saida_Alimentacao, this.dois_saida_Transporte, this.dois_saida_Admnistrativas,
                this.dois_saida_Outros, this.dois_saida_Total);
              break;
            }

            case "03": {
              this.tres_entrada_NUMERARIO = element.formaPagamento == "Numerário" ? +this.tres_entrada_NUMERARIO + +element.valor : this.tres_entrada_NUMERARIO;
              this.tres_entrada_POS = element.formaPagamento == "POS" ? +this.tres_entrada_POS + +element.valor : this.tres_entrada_POS;
              this.tres_entrada_MPesa = element.formaPagamento == "MPesa" ? +this.tres_entrada_MPesa + +element.valor : this.tres_entrada_MPesa;
              this.tres_entrada_Cheque = element.formaPagamento == "Cheque" ? +this.tres_entrada_Cheque + +element.valor : this.tres_entrada_Cheque;
              this.tres_entrada_Convenio= element.formaPagamento == "Convênio" ? +this.tres_entrada_Convenio + +element.valor : this.tres_entrada_Convenio;
             
              this.tres_entrada_Consulta = element.plano_nome == "CONSULTA_MEDICA" ? +this.tres_entrada_Consulta + +element.valor : this.tres_entrada_Consulta;
              this.tres_entrada_Diagnostico = element.plano_nome == "DIAGNOSTICO_AUX" ? +this.tres_entrada_Diagnostico + +element.valor : this.tres_entrada_Diagnostico;
              this.tres_entrada_Conduta = element.plano_nome == "CONDUTA CLINICA" ? +this.tres_entrada_Conduta + +element.valor : this.tres_entrada_Conduta;
              this.tres_entrada_Medicamento = element.plano_nome == "MEDICAMENTO" ? +this.tres_entrada_Medicamento + +element.valor : this.tres_entrada_Medicamento;

              this.tres_entrada_Total = element.tipo_nome == "2.Entrada" ? +this.tres_entrada_Total + +element.valor : this.tres_entrada_Total;

              this.tres_saida_Energia = (element.tipo_nome == "1.Saida" && element.plano_nome == "Energia") ? +this.tres_saida_Energia + +element.valor : this.tres_saida_Energia;
              this.tres_saida_Salario = (element.tipo_nome == "1.Saida" && element.plano_nome == "Salario") ? +this.tres_saida_Salario + +element.valor : this.tres_saida_Salario;
              this.tres_saida_Transporte = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && element.subtipo_nome == "1.2.Despesas de transporte") ? +this.tres_saida_Transporte + +element.valor : this.tres_saida_Transporte;
              this.tres_saida_Alimentacao = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && element.subtipo_nome == "1.3.Despesas de alimentacao") ? +this.tres_saida_Alimentacao + +element.valor : this.tres_saida_Alimentacao;
              this.tres_saida_Admnistrativas = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && element.subtipo_nome == "1.1.Despesas admnistrativas") ? +this.tres_saida_Admnistrativas + +element.valor : this.tres_saida_Admnistrativas;
              this.tres_saida_Outros = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && (element.subtipo_nome !== "1.1.Despesas admnistrativas" && element.subtipo_nome !== "1.2.Despesas de transporte" && element.subtipo_nome !== "1.3.Despesas de alimentacao")) ? +this.tres_saida_Outros + +element.valor : this.tres_saida_Outros;

              this.tres_saida_Total = element.tipo_nome == "1.Saida" ? +this.tres_saida_Total + +element.valor : this.tres_saida_Total;             

              tres_LancamentoConsolidado = new LancamentoConsolidado(
                element.dia,element.mes, this.tres_entrada_NUMERARIO, this.tres_entrada_POS, this.tres_entrada_MPesa, this.tres_entrada_Cheque, this.tres_entrada_Convenio,
                this.tres_entrada_Consulta, this.tres_entrada_Diagnostico, this.tres_entrada_Conduta, this.tres_entrada_Medicamento, this.tres_entrada_Total,
                this.tres_saida_Energia, this.tres_saida_Salario, this.tres_saida_Alimentacao, this.tres_saida_Transporte, this.tres_saida_Admnistrativas,
                this.tres_saida_Outros, this.tres_saida_Total);
             
              break;
            }
            
            case "04": {
              this.quatro_entrada_NUMERARIO = element.formaPagamento == "Numerário" ? +this.quatro_entrada_NUMERARIO + +element.valor : this.quatro_entrada_NUMERARIO;
              this.quatro_entrada_POS = element.formaPagamento == "POS" ? +this.quatro_entrada_POS + +element.valor : this.quatro_entrada_POS;
              this.quatro_entrada_MPesa = element.formaPagamento == "MPesa" ? +this.quatro_entrada_MPesa + +element.valor : this.quatro_entrada_MPesa;
              this.quatro_entrada_Cheque = element.formaPagamento == "Cheque" ? +this.quatro_entrada_Cheque + +element.valor : this.quatro_entrada_Cheque;
              this.quatro_entrada_Convenio= element.formaPagamento == "Convênio" ? +this.quatro_entrada_Convenio + +element.valor : this.quatro_entrada_Convenio;
              
              this.quatro_entrada_Consulta = element.plano_nome == "CONSULTA_MEDICA" ? +this.quatro_entrada_Consulta + +element.valor : this.quatro_entrada_Consulta;
              this.quatro_entrada_Diagnostico = element.plano_nome == "DIAGNOSTICO_AUX" ? +this.quatro_entrada_Diagnostico + +element.valor : this.quatro_entrada_Diagnostico;
              this.quatro_entrada_Conduta = element.plano_nome == "CONDUTA CLINICA" ? +this.quatro_entrada_Conduta + +element.valor : this.quatro_entrada_Conduta;
              this.quatro_entrada_Medicamento = element.plano_nome == "MEDICAMENTO" ? +this.quatro_entrada_Medicamento + +element.valor : this.quatro_entrada_Medicamento;

              this.quatro_entrada_Total = element.tipo_nome == "2.Entrada" ? +this.quatro_entrada_Total + +element.valor : this.quatro_entrada_Total;

              this.quatro_saida_Energia = (element.tipo_nome == "1.Saida" && element.plano_nome == "Energia") ? +this.quatro_saida_Energia + +element.valor : this.quatro_saida_Energia;
              this.quatro_saida_Salario = (element.tipo_nome == "1.Saida" && element.plano_nome == "Salario") ? +this.quatro_saida_Salario + +element.valor : this.quatro_saida_Salario;
              this.quatro_saida_Transporte = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && element.subtipo_nome == "1.2.Despesas de transporte") ? +this.quatro_saida_Transporte + +element.valor : this.quatro_saida_Transporte;
              this.quatro_saida_Alimentacao = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && element.subtipo_nome == "1.3.Despesas de alimentacao") ? +this.quatro_saida_Alimentacao + +element.valor : this.quatro_saida_Alimentacao;
              this.quatro_saida_Admnistrativas = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && element.subtipo_nome == "1.1.Despesas admnistrativas") ? +this.quatro_saida_Admnistrativas + +element.valor : this.quatro_saida_Admnistrativas;
              this.quatro_saida_Outros = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && (element.subtipo_nome !== "1.1.Despesas admnistrativas" && element.subtipo_nome !== "1.2.Despesas de transporte" && element.subtipo_nome !== "1.3.Despesas de alimentacao")) ? +this.quatro_saida_Outros + +element.valor : this.quatro_saida_Outros;

              this.quatro_saida_Total = element.tipo_nome == "1.Saida" ? +this.quatro_saida_Total + +element.valor : this.quatro_saida_Total;             

              quatro_LancamentoConsolidado = new LancamentoConsolidado(
                element.dia,element.mes, this.quatro_entrada_NUMERARIO, this.quatro_entrada_POS, this.quatro_entrada_MPesa, this.quatro_entrada_Cheque, this.quatro_entrada_Convenio,
                this.quatro_entrada_Consulta, this.quatro_entrada_Diagnostico, this.quatro_entrada_Conduta, this.quatro_entrada_Medicamento, this.quatro_entrada_Total,
                this.quatro_saida_Energia, this.quatro_saida_Salario, this.quatro_saida_Alimentacao, this.quatro_saida_Transporte, this.quatro_saida_Admnistrativas,
                this.quatro_saida_Outros, this.quatro_saida_Total);
              break;
            }

            case "05": {
              this.cinco_entrada_NUMERARIO = element.formaPagamento == "Numerário" ? +this.cinco_entrada_NUMERARIO + +element.valor : this.cinco_entrada_NUMERARIO;
              this.cinco_entrada_POS = element.formaPagamento == "POS" ? +this.cinco_entrada_POS + +element.valor : this.cinco_entrada_POS;
              this.cinco_entrada_MPesa = element.formaPagamento == "MPesa" ? +this.cinco_entrada_MPesa + +element.valor : this.cinco_entrada_MPesa;
              this.cinco_entrada_Cheque = element.formaPagamento == "Cheque" ? +this.cinco_entrada_Cheque + +element.valor : this.cinco_entrada_Cheque;
              this.cinco_entrada_Convenio= element.formaPagamento == "Convênio" ? +this.cinco_entrada_Convenio + +element.valor : this.cinco_entrada_Convenio;
              
              this.cinco_entrada_Consulta = element.plano_nome == "CONSULTA_MEDICA" ? +this.cinco_entrada_Consulta + +element.valor : this.cinco_entrada_Consulta;
              this.cinco_entrada_Diagnostico = element.plano_nome == "DIAGNOSTICO_AUX" ? +this.cinco_entrada_Diagnostico + +element.valor : this.cinco_entrada_Diagnostico;
              this.cinco_entrada_Conduta = element.plano_nome == "CONDUTA CLINICA" ? +this.cinco_entrada_Conduta + +element.valor : this.cinco_entrada_Conduta;
              this.cinco_entrada_Medicamento = element.plano_nome == "MEDICAMENTO" ? +this.cinco_entrada_Medicamento + +element.valor : this.cinco_entrada_Medicamento;

              this.cinco_entrada_Total = element.tipo_nome == "2.Entrada" ? +this.cinco_entrada_Total + +element.valor : this.cinco_entrada_Total;

              this.cinco_saida_Energia = (element.tipo_nome == "1.Saida" && element.plano_nome == "Energia") ? +this.cinco_saida_Energia + +element.valor : this.cinco_saida_Energia;
              this.cinco_saida_Salario = (element.tipo_nome == "1.Saida" && element.plano_nome == "Salario") ? +this.cinco_saida_Salario + +element.valor : this.cinco_saida_Salario;
              this.cinco_saida_Transporte = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && element.subtipo_nome == "1.2.Despesas de transporte") ? +this.cinco_saida_Transporte + +element.valor : this.cinco_saida_Transporte;
              this.cinco_saida_Alimentacao = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && element.subtipo_nome == "1.3.Despesas de alimentacao") ? +this.cinco_saida_Alimentacao + +element.valor : this.cinco_saida_Alimentacao;
              this.cinco_saida_Admnistrativas = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && element.subtipo_nome == "1.1.Despesas admnistrativas") ? +this.cinco_saida_Admnistrativas + +element.valor : this.cinco_saida_Admnistrativas;
              this.cinco_saida_Outros = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && (element.subtipo_nome !== "1.1.Despesas admnistrativas" && element.subtipo_nome !== "1.2.Despesas de transporte" && element.subtipo_nome !== "1.3.Despesas de alimentacao")) ? +this.cinco_saida_Outros + +element.valor : this.cinco_saida_Outros;

              this.cinco_saida_Total = element.tipo_nome == "1.Saida" ? +this.cinco_saida_Total + +element.valor : this.cinco_saida_Total;             

              cinco_LancamentoConsolidado = new LancamentoConsolidado(
                element.dia,element.mes, this.cinco_entrada_NUMERARIO, this.cinco_entrada_POS, this.cinco_entrada_MPesa, this.cinco_entrada_Cheque, this.cinco_entrada_Convenio,
                this.cinco_entrada_Consulta, this.cinco_entrada_Diagnostico, this.cinco_entrada_Conduta, this.cinco_entrada_Medicamento, this.cinco_entrada_Total,
                this.cinco_saida_Energia, this.cinco_saida_Salario, this.cinco_saida_Alimentacao, this.cinco_saida_Transporte, this.cinco_saida_Admnistrativas,
                this.cinco_saida_Outros, this.cinco_saida_Total);
              break;
            }

            case "06": {
              this.seis_entrada_NUMERARIO = element.formaPagamento == "Numerário" ? +this.seis_entrada_NUMERARIO + +element.valor : this.seis_entrada_NUMERARIO;
              this.seis_entrada_POS = element.formaPagamento == "POS" ? +this.seis_entrada_POS + +element.valor : this.seis_entrada_POS;
              this.seis_entrada_MPesa = element.formaPagamento == "MPesa" ? +this.seis_entrada_MPesa + +element.valor : this.seis_entrada_MPesa;
              this.seis_entrada_Cheque = element.formaPagamento == "Cheque" ? +this.seis_entrada_Cheque + +element.valor : this.seis_entrada_Cheque;
              this.seis_entrada_Convenio= element.formaPagamento == "Convênio" ? +this.seis_entrada_Convenio + +element.valor : this.seis_entrada_Convenio;
              
              this.seis_entrada_Consulta = element.plano_nome == "CONSULTA_MEDICA" ? +this.seis_entrada_Consulta + +element.valor : this.seis_entrada_Consulta;
              this.seis_entrada_Diagnostico = element.plano_nome == "DIAGNOSTICO_AUX" ? +this.seis_entrada_Diagnostico + +element.valor : this.seis_entrada_Diagnostico;
              this.seis_entrada_Conduta = element.plano_nome == "CONDUTA CLINICA" ? +this.seis_entrada_Conduta + +element.valor : this.seis_entrada_Conduta;
              this.seis_entrada_Medicamento = element.plano_nome == "MEDICAMENTO" ? +this.seis_entrada_Medicamento + +element.valor : this.seis_entrada_Medicamento;

              this.seis_entrada_Total = element.tipo_nome == "2.Entrada" ? +this.seis_entrada_Total + +element.valor : this.seis_entrada_Total;

              this.seis_saida_Energia = (element.tipo_nome == "1.Saida" && element.plano_nome == "Energia") ? +this.seis_saida_Energia + +element.valor : this.seis_saida_Energia;
              this.seis_saida_Salario = (element.tipo_nome == "1.Saida" && element.plano_nome == "Salario") ? +this.seis_saida_Salario + +element.valor : this.seis_saida_Salario;
              this.seis_saida_Transporte = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && element.subtipo_nome == "1.2.Despesas de transporte") ? +this.seis_saida_Transporte + +element.valor : this.seis_saida_Transporte;
              this.seis_saida_Alimentacao = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && element.subtipo_nome == "1.3.Despesas de alimentacao") ? +this.seis_saida_Alimentacao + +element.valor : this.seis_saida_Alimentacao;
              this.seis_saida_Admnistrativas = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && element.subtipo_nome == "1.1.Despesas admnistrativas") ? +this.seis_saida_Admnistrativas + +element.valor : this.seis_saida_Admnistrativas;
              this.seis_saida_Outros = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && (element.subtipo_nome !== "1.1.Despesas admnistrativas" && element.subtipo_nome !== "1.2.Despesas de transporte" && element.subtipo_nome !== "1.3.Despesas de alimentacao")) ? +this.seis_saida_Outros + +element.valor : this.seis_saida_Outros;

              this.seis_saida_Total = element.tipo_nome == "1.Saida" ? +this.seis_saida_Total + +element.valor : this.seis_saida_Total;             

              seis_LancamentoConsolidado = new LancamentoConsolidado(
                element.dia,element.mes, this.seis_entrada_NUMERARIO, this.seis_entrada_POS, this.seis_entrada_MPesa, this.seis_entrada_Cheque, this.seis_entrada_Convenio,
                this.seis_entrada_Consulta, this.seis_entrada_Diagnostico, this.seis_entrada_Conduta, this.seis_entrada_Medicamento, this.seis_entrada_Total,
                this.seis_saida_Energia, this.seis_saida_Salario, this.seis_saida_Alimentacao, this.seis_saida_Transporte, this.seis_saida_Admnistrativas,
                this.seis_saida_Outros, this.seis_saida_Total);
              break;
            }

            case "07": {
              this.sete_entrada_NUMERARIO = element.formaPagamento == "Numerário" ? +this.sete_entrada_NUMERARIO + +element.valor : this.sete_entrada_NUMERARIO;
              this.sete_entrada_POS = element.formaPagamento == "POS" ? +this.sete_entrada_POS + +element.valor : this.sete_entrada_POS;
              this.sete_entrada_MPesa = element.formaPagamento == "MPesa" ? +this.sete_entrada_MPesa + +element.valor : this.sete_entrada_MPesa;
              this.sete_entrada_Cheque = element.formaPagamento == "Cheque" ? +this.sete_entrada_Cheque + +element.valor : this.sete_entrada_Cheque;
              this.sete_entrada_Convenio= element.formaPagamento == "Convênio" ? +this.sete_entrada_Convenio + +element.valor : this.sete_entrada_Convenio;
              
              this.sete_entrada_Consulta = element.plano_nome == "CONSULTA_MEDICA" ? +this.sete_entrada_Consulta + +element.valor : this.sete_entrada_Consulta;
              this.sete_entrada_Diagnostico = element.plano_nome == "DIAGNOSTICO_AUX" ? +this.sete_entrada_Diagnostico + +element.valor : this.sete_entrada_Diagnostico;
              this.sete_entrada_Conduta = element.plano_nome == "CONDUTA CLINICA" ? +this.sete_entrada_Conduta + +element.valor : this.sete_entrada_Conduta;
              this.sete_entrada_Medicamento = element.plano_nome == "MEDICAMENTO" ? +this.sete_entrada_Medicamento + +element.valor : this.sete_entrada_Medicamento;

              this.sete_entrada_Total = element.tipo_nome == "2.Entrada" ? +this.sete_entrada_Total + +element.valor : this.sete_entrada_Total;

              this.sete_saida_Energia = (element.tipo_nome == "1.Saida" && element.plano_nome == "Energia") ? +this.sete_saida_Energia + +element.valor : this.sete_saida_Energia;
              this.sete_saida_Salario = (element.tipo_nome == "1.Saida" && element.plano_nome == "Salario") ? +this.sete_saida_Salario + +element.valor : this.sete_saida_Salario;
              this.sete_saida_Transporte = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && element.subtipo_nome == "1.2.Despesas de transporte") ? +this.sete_saida_Transporte + +element.valor : this.sete_saida_Transporte;
              this.sete_saida_Alimentacao = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && element.subtipo_nome == "1.3.Despesas de alimentacao") ? +this.sete_saida_Alimentacao + +element.valor : this.sete_saida_Alimentacao;
              this.sete_saida_Admnistrativas = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && element.subtipo_nome == "1.1.Despesas admnistrativas") ? +this.sete_saida_Admnistrativas + +element.valor : this.sete_saida_Admnistrativas;
              this.sete_saida_Outros = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && (element.subtipo_nome !== "1.1.Despesas admnistrativas" && element.subtipo_nome !== "1.2.Despesas de transporte" && element.subtipo_nome !== "1.3.Despesas de alimentacao")) ? +this.sete_saida_Outros + +element.valor : this.sete_saida_Outros;

              this.sete_saida_Total = element.tipo_nome == "1.Saida" ? +this.sete_saida_Total + +element.valor : this.sete_saida_Total;             

              sete_LancamentoConsolidado = new LancamentoConsolidado(
                element.dia,element.mes, this.sete_entrada_NUMERARIO, this.sete_entrada_POS, this.sete_entrada_MPesa, this.sete_entrada_Cheque, this.sete_entrada_Convenio,
                this.sete_entrada_Consulta, this.sete_entrada_Diagnostico, this.sete_entrada_Conduta, this.sete_entrada_Medicamento, this.sete_entrada_Total,
                this.sete_saida_Energia, this.sete_saida_Salario, this.sete_saida_Alimentacao, this.sete_saida_Transporte, this.sete_saida_Admnistrativas,
                this.sete_saida_Outros, this.sete_saida_Total);
              break;
            }

            case "08": {
              this.oito_entrada_NUMERARIO = element.formaPagamento == "Numerário" ? +this.oito_entrada_NUMERARIO + +element.valor : this.oito_entrada_NUMERARIO;
              this.oito_entrada_POS = element.formaPagamento == "POS" ? +this.oito_entrada_POS + +element.valor : this.oito_entrada_POS;
              this.oito_entrada_MPesa = element.formaPagamento == "MPesa" ? +this.oito_entrada_MPesa + +element.valor : this.oito_entrada_MPesa;
              this.oito_entrada_Cheque = element.formaPagamento == "Cheque" ? +this.oito_entrada_Cheque + +element.valor : this.oito_entrada_Cheque;
              this.oito_entrada_Convenio= element.formaPagamento == "Convênio" ? +this.oito_entrada_Convenio + +element.valor : this.oito_entrada_Convenio;
              
              this.oito_entrada_Consulta = element.plano_nome == "CONSULTA_MEDICA" ? +this.oito_entrada_Consulta + +element.valor : this.oito_entrada_Consulta;
              this.oito_entrada_Diagnostico = element.plano_nome == "DIAGNOSTICO_AUX" ? +this.oito_entrada_Diagnostico + +element.valor : this.oito_entrada_Diagnostico;
              this.oito_entrada_Conduta = element.plano_nome == "CONDUTA CLINICA" ? +this.oito_entrada_Conduta + +element.valor : this.oito_entrada_Conduta;
              this.oito_entrada_Medicamento = element.plano_nome == "MEDICAMENTO" ? +this.oito_entrada_Medicamento + +element.valor : this.oito_entrada_Medicamento;

              this.oito_entrada_Total = element.tipo_nome == "2.Entrada" ? +this.oito_entrada_Total + +element.valor : this.oito_entrada_Total;

              this.oito_saida_Energia = (element.tipo_nome == "1.Saida" && element.plano_nome == "Energia") ? +this.oito_saida_Energia + +element.valor : this.oito_saida_Energia;
              this.oito_saida_Salario = (element.tipo_nome == "1.Saida" && element.plano_nome == "Salario") ? +this.oito_saida_Salario + +element.valor : this.oito_saida_Salario;
              this.oito_saida_Transporte = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && element.subtipo_nome == "1.2.Despesas de transporte") ? +this.oito_saida_Transporte + +element.valor : this.oito_saida_Transporte;
              this.oito_saida_Alimentacao = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && element.subtipo_nome == "1.3.Despesas de alimentacao") ? +this.oito_saida_Alimentacao + +element.valor : this.oito_saida_Alimentacao;
              this.oito_saida_Admnistrativas = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && element.subtipo_nome == "1.1.Despesas admnistrativas") ? +this.oito_saida_Admnistrativas + +element.valor : this.oito_saida_Admnistrativas;
              this.oito_saida_Outros = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && (element.subtipo_nome !== "1.1.Despesas admnistrativas" && element.subtipo_nome !== "1.2.Despesas de transporte" && element.subtipo_nome !== "1.3.Despesas de alimentacao")) ? +this.oito_saida_Outros + +element.valor : this.oito_saida_Outros;

              this.oito_saida_Total = element.tipo_nome == "1.Saida" ? +this.oito_saida_Total + +element.valor : this.oito_saida_Total;             

              oito_LancamentoConsolidado = new LancamentoConsolidado(
                element.dia,element.mes, this.oito_entrada_NUMERARIO, this.oito_entrada_POS, this.oito_entrada_MPesa, this.oito_entrada_Cheque, this.oito_entrada_Convenio,
                this.oito_entrada_Consulta, this.oito_entrada_Diagnostico, this.oito_entrada_Conduta, this.oito_entrada_Medicamento, this.oito_entrada_Total,
                this.oito_saida_Energia, this.oito_saida_Salario, this.oito_saida_Alimentacao, this.oito_saida_Transporte, this.oito_saida_Admnistrativas,
                this.oito_saida_Outros, this.oito_saida_Total);
              break;
            }

            case "09": {
              this.nove_entrada_NUMERARIO = element.formaPagamento == "Numerário" ? +this.nove_entrada_NUMERARIO + +element.valor : this.nove_entrada_NUMERARIO;
              this.nove_entrada_POS = element.formaPagamento == "POS" ? +this.nove_entrada_POS + +element.valor : this.nove_entrada_POS;
              this.nove_entrada_MPesa = element.formaPagamento == "MPesa" ? +this.nove_entrada_MPesa + +element.valor : this.nove_entrada_MPesa;
              this.nove_entrada_Cheque = element.formaPagamento == "Cheque" ? +this.nove_entrada_Cheque + +element.valor : this.nove_entrada_Cheque;
              this.nove_entrada_Convenio= element.formaPagamento == "Convênio" ? +this.nove_entrada_Convenio + +element.valor : this.nove_entrada_Convenio;
              
              this.nove_entrada_Consulta = element.plano_nome == "CONSULTA_MEDICA" ? +this.nove_entrada_Consulta + +element.valor : this.nove_entrada_Consulta;
              this.nove_entrada_Diagnostico = element.plano_nome == "DIAGNOSTICO_AUX" ? +this.nove_entrada_Diagnostico + +element.valor : this.nove_entrada_Diagnostico;
              this.nove_entrada_Conduta = element.plano_nome == "CONDUTA CLINICA" ? +this.nove_entrada_Conduta + +element.valor : this.nove_entrada_Conduta;
              this.nove_entrada_Medicamento = element.plano_nome == "MEDICAMENTO" ? +this.nove_entrada_Medicamento + +element.valor : this.nove_entrada_Medicamento;

              this.nove_entrada_Total = element.tipo_nome == "2.Entrada" ? +this.nove_entrada_Total + +element.valor : this.nove_entrada_Total;

              this.nove_saida_Energia = (element.tipo_nome == "1.Saida" && element.plano_nome == "Energia") ? +this.nove_saida_Energia + +element.valor : this.nove_saida_Energia;
              this.nove_saida_Salario = (element.tipo_nome == "1.Saida" && element.plano_nome == "Salario") ? +this.nove_saida_Salario + +element.valor : this.nove_saida_Salario;
              this.nove_saida_Transporte = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && element.subtipo_nome == "1.2.Despesas de transporte") ? +this.nove_saida_Transporte + +element.valor : this.nove_saida_Transporte;
              this.nove_saida_Alimentacao = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && element.subtipo_nome == "1.3.Despesas de alimentacao") ? +this.nove_saida_Alimentacao + +element.valor : this.nove_saida_Alimentacao;
              this.nove_saida_Admnistrativas = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && element.subtipo_nome == "1.1.Despesas admnistrativas") ? +this.nove_saida_Admnistrativas + +element.valor : this.nove_saida_Admnistrativas;
              this.nove_saida_Outros = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && (element.subtipo_nome !== "1.1.Despesas admnistrativas" && element.subtipo_nome !== "1.2.Despesas de transporte" && element.subtipo_nome !== "1.3.Despesas de alimentacao")) ? +this.nove_saida_Outros + +element.valor : this.nove_saida_Outros;

              this.nove_saida_Total = element.tipo_nome == "1.Saida" ? +this.nove_saida_Total + +element.valor : this.nove_saida_Total;             

              nove_LancamentoConsolidado = new LancamentoConsolidado(
                element.dia,element.mes, this.nove_entrada_NUMERARIO, this.nove_entrada_POS, this.nove_entrada_MPesa, this.nove_entrada_Cheque, this.nove_entrada_Convenio,
                this.nove_entrada_Consulta, this.nove_entrada_Diagnostico, this.nove_entrada_Conduta, this.nove_entrada_Medicamento, this.nove_entrada_Total,
                this.nove_saida_Energia, this.nove_saida_Salario, this.nove_saida_Alimentacao, this.nove_saida_Transporte, this.nove_saida_Admnistrativas,
                this.nove_saida_Outros, this.nove_saida_Total);
              break;
            }

            case "10": {
              this.dez_entrada_NUMERARIO = element.formaPagamento == "Numerário" ? +this.dez_entrada_NUMERARIO + +element.valor : this.dez_entrada_NUMERARIO;
              this.dez_entrada_POS = element.formaPagamento == "POS" ? +this.dez_entrada_POS + +element.valor : this.dez_entrada_POS;
              this.dez_entrada_MPesa = element.formaPagamento == "MPesa" ? +this.dez_entrada_MPesa + +element.valor : this.dez_entrada_MPesa;
              this.dez_entrada_Cheque = element.formaPagamento == "Cheque" ? +this.dez_entrada_Cheque + +element.valor : this.dez_entrada_Cheque;
              this.dez_entrada_Convenio= element.formaPagamento == "Convênio" ? +this.dez_entrada_Convenio + +element.valor : this.dez_entrada_Convenio;
              
              this.dez_entrada_Consulta = element.plano_nome == "CONSULTA_MEDICA" ? +this.dez_entrada_Consulta + +element.valor : this.dez_entrada_Consulta;
              this.dez_entrada_Diagnostico = element.plano_nome == "DIAGNOSTICO_AUX" ? +this.dez_entrada_Diagnostico + +element.valor : this.dez_entrada_Diagnostico;
              this.dez_entrada_Conduta = element.plano_nome == "CONDUTA CLINICA" ? +this.dez_entrada_Conduta + +element.valor : this.dez_entrada_Conduta;
              this.dez_entrada_Medicamento = element.plano_nome == "MEDICAMENTO" ? +this.dez_entrada_Medicamento + +element.valor : this.dez_entrada_Medicamento;

              this.dez_entrada_Total = element.tipo_nome == "2.Entrada" ? +this.dez_entrada_Total + +element.valor : this.dez_entrada_Total;

              this.dez_saida_Energia = (element.tipo_nome == "1.Saida" && element.plano_nome == "Energia") ? +this.dez_saida_Energia + +element.valor : this.dez_saida_Energia;
              this.dez_saida_Salario = (element.tipo_nome == "1.Saida" && element.plano_nome == "Salario") ? +this.dez_saida_Salario + +element.valor : this.dez_saida_Salario;
              this.dez_saida_Transporte = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && element.subtipo_nome == "1.2.Despesas de transporte") ? +this.dez_saida_Transporte + +element.valor : this.dez_saida_Transporte;
              this.dez_saida_Alimentacao = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && element.subtipo_nome == "1.3.Despesas de alimentacao") ? +this.dez_saida_Alimentacao + +element.valor : this.dez_saida_Alimentacao;
              this.dez_saida_Admnistrativas = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && element.subtipo_nome == "1.1.Despesas admnistrativas") ? +this.dez_saida_Admnistrativas + +element.valor : this.dez_saida_Admnistrativas;
              this.dez_saida_Outros = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && (element.subtipo_nome !== "1.1.Despesas admnistrativas" && element.subtipo_nome !== "1.2.Despesas de transporte" && element.subtipo_nome !== "1.3.Despesas de alimentacao")) ? +this.dez_saida_Outros + +element.valor : this.dez_saida_Outros;

              this.dez_saida_Total = element.tipo_nome == "1.Saida" ? +this.dez_saida_Total + +element.valor : this.dez_saida_Total;             

              dez_LancamentoConsolidado = new LancamentoConsolidado(
                element.dia,element.mes, this.dez_entrada_NUMERARIO, this.dez_entrada_POS, this.dez_entrada_MPesa, this.dez_entrada_Cheque, this.dez_entrada_Convenio,
                this.dez_entrada_Consulta, this.dez_entrada_Diagnostico, this.dez_entrada_Conduta, this.dez_entrada_Medicamento, this.dez_entrada_Total,
                this.dez_saida_Energia, this.dez_saida_Salario, this.dez_saida_Alimentacao, this.dez_saida_Transporte, this.dez_saida_Admnistrativas,
                this.dez_saida_Outros, this.dez_saida_Total);
              break;
            }

            case "11": {
              this.onze_entrada_NUMERARIO = element.formaPagamento == "Numerário" ? +this.onze_entrada_NUMERARIO + +element.valor : this.onze_entrada_NUMERARIO;
              this.onze_entrada_POS = element.formaPagamento == "POS" ? +this.onze_entrada_POS + +element.valor : this.onze_entrada_POS;
              this.onze_entrada_MPesa = element.formaPagamento == "MPesa" ? +this.onze_entrada_MPesa + +element.valor : this.onze_entrada_MPesa;
              this.onze_entrada_Cheque = element.formaPagamento == "Cheque" ? +this.onze_entrada_Cheque + +element.valor : this.onze_entrada_Cheque;
              this.onze_entrada_Convenio= element.formaPagamento == "Convênio" ? +this.onze_entrada_Convenio + +element.valor : this.onze_entrada_Convenio;
              
              this.onze_entrada_Consulta = element.plano_nome == "CONSULTA_MEDICA" ? +this.onze_entrada_Consulta + +element.valor : this.onze_entrada_Consulta;
             this.onze_entrada_Diagnostico = element.plano_nome == "DIAGNOSTICO_AUX" ? +this.onze_entrada_Diagnostico + +element.valor : this.onze_entrada_Diagnostico;
              this.onze_entrada_Conduta = element.plano_nome == "CONDUTA CLINICA" ? +this.onze_entrada_Conduta + +element.valor : this.onze_entrada_Conduta;
              this.onze_entrada_Medicamento = element.plano_nome == "MEDICAMENTO" ? +this.onze_entrada_Medicamento + +element.valor : this.onze_entrada_Medicamento;

              this.onze_entrada_Total = element.tipo_nome == "2.Entrada" ? +this.onze_entrada_Total + +element.valor : this.onze_entrada_Total;

              this.onze_saida_Energia = (element.tipo_nome == "1.Saida" && element.plano_nome == "Energia") ? +this.onze_saida_Energia + +element.valor : this.onze_saida_Energia;
              this.onze_saida_Salario = (element.tipo_nome == "1.Saida" && element.plano_nome == "Salario") ? +this.onze_saida_Salario + +element.valor : this.onze_saida_Salario;
              this.onze_saida_Transporte = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && element.subtipo_nome == "1.2.Despesas de transporte") ? +this.onze_saida_Transporte + +element.valor : this.onze_saida_Transporte;
              this.onze_saida_Alimentacao = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && element.subtipo_nome == "1.3.Despesas de alimentacao") ? +this.onze_saida_Alimentacao + +element.valor : this.onze_saida_Alimentacao;
              this.onze_saida_Admnistrativas = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && element.subtipo_nome == "1.1.Despesas admnistrativas") ? +this.onze_saida_Admnistrativas + +element.valor : this.onze_saida_Admnistrativas;
              this.onze_saida_Outros = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && (element.subtipo_nome !== "1.1.Despesas admnistrativas" && element.subtipo_nome !== "1.2.Despesas de transporte" && element.subtipo_nome !== "1.3.Despesas de alimentacao")) ? +this.onze_saida_Outros + +element.valor : this.onze_saida_Outros;

              this.onze_saida_Total = element.tipo_nome == "1.Saida" ? +this.onze_saida_Total + +element.valor : this.onze_saida_Total;             

              onze_LancamentoConsolidado = new LancamentoConsolidado(
                element.dia,element.mes, this.onze_entrada_NUMERARIO, this.onze_entrada_POS, this.onze_entrada_MPesa, this.onze_entrada_Cheque, this.onze_entrada_Convenio,
                this.onze_entrada_Consulta, this.onze_entrada_Diagnostico, this.onze_entrada_Conduta, this.onze_entrada_Medicamento, this.onze_entrada_Total,
                this.onze_saida_Energia, this.onze_saida_Salario, this.onze_saida_Alimentacao, this.onze_saida_Transporte, this.onze_saida_Admnistrativas,
                this.onze_saida_Outros, this.onze_saida_Total);
              break;
            }

            case "12": {
              this.doze_entrada_NUMERARIO = element.formaPagamento == "Numerário" ? +this.doze_entrada_NUMERARIO + +element.valor : this.doze_entrada_NUMERARIO;
              this.doze_entrada_POS = element.formaPagamento == "POS" ? +this.doze_entrada_POS + +element.valor : this.doze_entrada_POS;
              this.doze_entrada_MPesa = element.formaPagamento == "MPesa" ? +this.doze_entrada_MPesa + +element.valor : this.doze_entrada_MPesa;
              this.doze_entrada_Cheque = element.formaPagamento == "Cheque" ? +this.doze_entrada_Cheque + +element.valor : this.doze_entrada_Cheque;
              this.doze_entrada_Convenio= element.formaPagamento == "Convênio" ? +this.doze_entrada_Convenio + +element.valor : this.doze_entrada_Convenio;
              
              this.doze_entrada_Consulta = element.plano_nome == "CONSULTA_MEDICA" ? +this.doze_entrada_Consulta + +element.valor : this.doze_entrada_Consulta;
              this.doze_entrada_Diagnostico = element.plano_nome == "DIAGNOSTICO_AUX" ? +this.doze_entrada_Diagnostico + +element.valor : this.doze_entrada_Diagnostico;
              this.doze_entrada_Conduta = element.plano_nome == "CONDUTA CLINICA" ? +this.doze_entrada_Conduta + +element.valor : this.doze_entrada_Conduta;
              this.doze_entrada_Medicamento = element.plano_nome == "MEDICAMENTO" ? +this.doze_entrada_Medicamento + +element.valor : this.doze_entrada_Medicamento;

              this.doze_entrada_Total = element.tipo_nome == "2.Entrada" ? +this.doze_entrada_Total + +element.valor : this.doze_entrada_Total;

              this.doze_saida_Energia = (element.tipo_nome == "1.Saida" && element.plano_nome == "Energia") ? +this.doze_saida_Energia + +element.valor : this.doze_saida_Energia;
              this.doze_saida_Salario = (element.tipo_nome == "1.Saida" && element.plano_nome == "Salario") ? +this.doze_saida_Salario + +element.valor : this.doze_saida_Salario;
              this.doze_saida_Transporte = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && element.subtipo_nome == "1.2.Despesas de transporte") ? +this.doze_saida_Transporte + +element.valor : this.doze_saida_Transporte;
              this.doze_saida_Alimentacao = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && element.subtipo_nome == "1.3.Despesas de alimentacao") ? +this.doze_saida_Alimentacao + +element.valor : this.doze_saida_Alimentacao;
              this.doze_saida_Admnistrativas = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && element.subtipo_nome == "1.1.Despesas admnistrativas") ? +this.doze_saida_Admnistrativas + +element.valor : this.doze_saida_Admnistrativas;
              this.doze_saida_Outros = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && (element.subtipo_nome !== "1.1.Despesas admnistrativas" && element.subtipo_nome !== "1.2.Despesas de transporte" && element.subtipo_nome !== "1.3.Despesas de alimentacao")) ? +this.doze_saida_Outros + +element.valor : this.doze_saida_Outros;

              this.doze_saida_Total = element.tipo_nome == "1.Saida" ? +this.doze_saida_Total + +element.valor : this.doze_saida_Total;             

              doze_LancamentoConsolidado = new LancamentoConsolidado(
                element.dia,element.mes, this.doze_entrada_NUMERARIO, this.doze_entrada_POS, this.doze_entrada_MPesa, this.doze_entrada_Cheque, this.doze_entrada_Convenio,
                this.doze_entrada_Consulta, this.doze_entrada_Diagnostico, this.doze_entrada_Conduta, this.doze_entrada_Medicamento, this.doze_entrada_Total,
                this.doze_saida_Energia, this.doze_saida_Salario, this.doze_saida_Alimentacao, this.doze_saida_Transporte, this.doze_saida_Admnistrativas,
                this.doze_saida_Outros, this.doze_saida_Total);
              break;
            }

            case "13": {
              this.treze_entrada_NUMERARIO = element.formaPagamento == "Numerário" ? +this.treze_entrada_NUMERARIO + +element.valor : this.treze_entrada_NUMERARIO;
              this.treze_entrada_POS = element.formaPagamento == "POS" ? +this.treze_entrada_POS + +element.valor : this.treze_entrada_POS;
              this.treze_entrada_MPesa = element.formaPagamento == "MPesa" ? +this.treze_entrada_MPesa + +element.valor : this.treze_entrada_MPesa;
              this.treze_entrada_Cheque = element.formaPagamento == "Cheque" ? +this.treze_entrada_Cheque + +element.valor : this.treze_entrada_Cheque;
              this.treze_entrada_Convenio= element.formaPagamento == "Convênio" ? +this.treze_entrada_Convenio + +element.valor : this.treze_entrada_Convenio;
              
              this.treze_entrada_Consulta = element.plano_nome == "CONSULTA_MEDICA" ? +this.treze_entrada_Consulta + +element.valor : this.treze_entrada_Consulta;
              this.treze_entrada_Diagnostico = element.plano_nome == "DIAGNOSTICO_AUX" ? +this.treze_entrada_Diagnostico + +element.valor : this.treze_entrada_Diagnostico;
              this.treze_entrada_Conduta = element.plano_nome == "CONDUTA CLINICA" ? +this.treze_entrada_Conduta + +element.valor : this.treze_entrada_Conduta;
              this.treze_entrada_Medicamento = element.plano_nome == "MEDICAMENTO" ? +this.treze_entrada_Medicamento + +element.valor : this.treze_entrada_Medicamento;

              this.treze_entrada_Total = element.tipo_nome == "2.Entrada" ? +this.treze_entrada_Total + +element.valor : this.treze_entrada_Total;

              this.treze_saida_Energia = (element.tipo_nome == "1.Saida" && element.plano_nome == "Energia") ? +this.treze_saida_Energia + +element.valor : this.treze_saida_Energia;
              this.treze_saida_Salario = (element.tipo_nome == "1.Saida" && element.plano_nome == "Salario") ? +this.treze_saida_Salario + +element.valor : this.treze_saida_Salario;
              this.treze_saida_Transporte = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && element.subtipo_nome == "1.2.Despesas de transporte") ? +this.treze_saida_Transporte + +element.valor : this.treze_saida_Transporte;
              this.treze_saida_Alimentacao = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && element.subtipo_nome == "1.3.Despesas de alimentacao") ? +this.treze_saida_Alimentacao + +element.valor : this.treze_saida_Alimentacao;
              this.treze_saida_Admnistrativas = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && element.subtipo_nome == "1.1.Despesas admnistrativas") ? +this.treze_saida_Admnistrativas + +element.valor : this.treze_saida_Admnistrativas;
              this.treze_saida_Outros = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && (element.subtipo_nome !== "1.1.Despesas admnistrativas" && element.subtipo_nome !== "1.2.Despesas de transporte" && element.subtipo_nome !== "1.3.Despesas de alimentacao")) ? +this.treze_saida_Outros + +element.valor : this.treze_saida_Outros;

              this.treze_saida_Total = element.tipo_nome == "1.Saida" ? +this.treze_saida_Total + +element.valor : this.treze_saida_Total;             

              treze_LancamentoConsolidado = new LancamentoConsolidado(
                element.dia,element.mes, this.treze_entrada_NUMERARIO, this.treze_entrada_POS, this.treze_entrada_MPesa, this.treze_entrada_Cheque, this.treze_entrada_Convenio,
                this.treze_entrada_Consulta, this.treze_entrada_Diagnostico, this.treze_entrada_Conduta, this.treze_entrada_Medicamento, this.treze_entrada_Total,
                this.treze_saida_Energia, this.treze_saida_Salario, this.treze_saida_Alimentacao, this.treze_saida_Transporte, this.treze_saida_Admnistrativas,
                this.treze_saida_Outros, this.treze_saida_Total);
              break;
            }

            case "14": {
              this.catorze_entrada_NUMERARIO = element.formaPagamento == "Numerário" ? +this.catorze_entrada_NUMERARIO + +element.valor : this.catorze_entrada_NUMERARIO;
              this.catorze_entrada_POS = element.formaPagamento == "POS" ? +this.catorze_entrada_POS + +element.valor : this.catorze_entrada_POS;
              this.catorze_entrada_MPesa = element.formaPagamento == "MPesa" ? +this.catorze_entrada_MPesa + +element.valor : this.catorze_entrada_MPesa;
              this.catorze_entrada_Cheque = element.formaPagamento == "Cheque" ? +this.catorze_entrada_Cheque + +element.valor : this.catorze_entrada_Cheque;
              this.catorze_entrada_Convenio= element.formaPagamento == "Convênio" ? +this.catorze_entrada_Convenio + +element.valor : this.catorze_entrada_Convenio;
              
              this.catorze_entrada_Consulta = element.plano_nome == "CONSULTA_MEDICA" ? +this.catorze_entrada_Consulta + +element.valor : this.catorze_entrada_Consulta;
              this.catorze_entrada_Diagnostico = element.plano_nome == "DIAGNOSTICO_AUX" ? +this.catorze_entrada_Diagnostico + +element.valor : this.catorze_entrada_Diagnostico;
              this.catorze_entrada_Conduta = element.plano_nome == "CONDUTA CLINICA" ? +this.catorze_entrada_Conduta + +element.valor : this.catorze_entrada_Conduta;
              this.catorze_entrada_Medicamento = element.plano_nome == "MEDICAMENTO" ? +this.catorze_entrada_Medicamento + +element.valor : this.catorze_entrada_Medicamento;

              this.catorze_entrada_Total = element.tipo_nome == "2.Entrada" ? +this.catorze_entrada_Total + +element.valor : this.catorze_entrada_Total;

              this.catorze_saida_Energia = (element.tipo_nome == "1.Saida" && element.plano_nome == "Energia") ? +this.catorze_saida_Energia + +element.valor : this.catorze_saida_Energia;
              this.catorze_saida_Salario = (element.tipo_nome == "1.Saida" && element.plano_nome == "Salario") ? +this.catorze_saida_Salario + +element.valor : this.catorze_saida_Salario;
              this.catorze_saida_Transporte = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && element.subtipo_nome == "1.2.Despesas de transporte") ? +this.catorze_saida_Transporte + +element.valor : this.catorze_saida_Transporte;
              this.catorze_saida_Alimentacao = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && element.subtipo_nome == "1.3.Despesas de alimentacao") ? +this.catorze_saida_Alimentacao + +element.valor : this.catorze_saida_Alimentacao;
              this.catorze_saida_Admnistrativas = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && element.subtipo_nome == "1.1.Despesas admnistrativas") ? +this.catorze_saida_Admnistrativas + +element.valor : this.catorze_saida_Admnistrativas;
              this.catorze_saida_Outros = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && (element.subtipo_nome !== "1.1.Despesas admnistrativas" && element.subtipo_nome !== "1.2.Despesas de transporte" && element.subtipo_nome !== "1.3.Despesas de alimentacao")) ? +this.catorze_saida_Outros + +element.valor : this.catorze_saida_Outros;

              this.catorze_saida_Total = element.tipo_nome == "1.Saida" ? +this.catorze_saida_Total + +element.valor : this.catorze_saida_Total;             

              catorze_LancamentoConsolidado = new LancamentoConsolidado(
                element.dia,element.mes, this.catorze_entrada_NUMERARIO, this.catorze_entrada_POS, this.catorze_entrada_MPesa, this.catorze_entrada_Cheque, this.catorze_entrada_Convenio,
                this.catorze_entrada_Consulta, this.catorze_entrada_Diagnostico, this.catorze_entrada_Conduta, this.catorze_entrada_Medicamento, this.catorze_entrada_Total,
                this.catorze_saida_Energia, this.catorze_saida_Salario, this.catorze_saida_Alimentacao, this.catorze_saida_Transporte, this.catorze_saida_Admnistrativas,
                this.catorze_saida_Outros, this.catorze_saida_Total);
              break;
            }

            case "15": {
              this.quinze_entrada_NUMERARIO = element.formaPagamento == "Numerário" ? +this.quinze_entrada_NUMERARIO + +element.valor : this.quinze_entrada_NUMERARIO;
              this.quinze_entrada_POS = element.formaPagamento == "POS" ? +this.quinze_entrada_POS + +element.valor : this.quinze_entrada_POS;
              this.quinze_entrada_MPesa = element.formaPagamento == "MPesa" ? +this.quinze_entrada_MPesa + +element.valor : this.quinze_entrada_MPesa;
              this.quinze_entrada_Cheque = element.formaPagamento == "Cheque" ? +this.quinze_entrada_Cheque + +element.valor : this.quinze_entrada_Cheque;
              this.quinze_entrada_Convenio= element.formaPagamento == "Convênio" ? +this.quinze_entrada_Convenio + +element.valor : this.quinze_entrada_Convenio;
              
              this.quinze_entrada_Consulta = element.plano_nome == "CONSULTA_MEDICA" ? +this.quinze_entrada_Consulta + +element.valor : this.quinze_entrada_Consulta;
              this.quinze_entrada_Diagnostico = element.plano_nome == "DIAGNOSTICO_AUX" ? +this.quinze_entrada_Diagnostico + +element.valor : this.quinze_entrada_Diagnostico;
              this.quinze_entrada_Conduta = element.plano_nome == "CONDUTA CLINICA" ? +this.quinze_entrada_Conduta + +element.valor : this.quinze_entrada_Conduta;
              this.quinze_entrada_Medicamento = element.plano_nome == "MEDICAMENTO" ? +this.quinze_entrada_Medicamento + +element.valor : this.quinze_entrada_Medicamento;

              this.quinze_entrada_Total = element.tipo_nome == "2.Entrada" ? +this.quinze_entrada_Total + +element.valor : this.quinze_entrada_Total;

              this.quinze_saida_Energia = (element.tipo_nome == "1.Saida" && element.plano_nome == "Energia") ? +this.quinze_saida_Energia + +element.valor : this.quinze_saida_Energia;
              this.quinze_saida_Salario = (element.tipo_nome == "1.Saida" && element.plano_nome == "Salario") ? +this.quinze_saida_Salario + +element.valor : this.quinze_saida_Salario;
              this.quinze_saida_Transporte = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && element.subtipo_nome == "1.2.Despesas de transporte") ? +this.quinze_saida_Transporte + +element.valor : this.quinze_saida_Transporte;
              this.quinze_saida_Alimentacao = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && element.subtipo_nome == "1.3.Despesas de alimentacao") ? +this.quinze_saida_Alimentacao + +element.valor : this.quinze_saida_Alimentacao;
              this.quinze_saida_Admnistrativas = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && element.subtipo_nome == "1.1.Despesas admnistrativas") ? +this.quinze_saida_Admnistrativas + +element.valor : this.quinze_saida_Admnistrativas;
              this.quinze_saida_Outros = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && (element.subtipo_nome !== "1.1.Despesas admnistrativas" && element.subtipo_nome !== "1.2.Despesas de transporte" && element.subtipo_nome !== "1.3.Despesas de alimentacao")) ? +this.quinze_saida_Outros + +element.valor : this.quinze_saida_Outros;

              this.quinze_saida_Total = element.tipo_nome == "1.Saida" ? +this.quinze_saida_Total + +element.valor : this.quinze_saida_Total;             

              quinze_LancamentoConsolidado = new LancamentoConsolidado(
                element.dia,element.mes, this.quinze_entrada_NUMERARIO, this.quinze_entrada_POS, this.quinze_entrada_MPesa, this.quinze_entrada_Cheque, this.quinze_entrada_Convenio,
                this.quinze_entrada_Consulta, this.quinze_entrada_Diagnostico, this.quinze_entrada_Conduta, this.quinze_entrada_Medicamento, this.quinze_entrada_Total,
                this.quinze_saida_Energia, this.quinze_saida_Salario, this.quinze_saida_Alimentacao, this.quinze_saida_Transporte, this.quinze_saida_Admnistrativas,
                this.quinze_saida_Outros, this.quinze_saida_Total);
              break;
            }

            case "16": {
              this.dezasseis_entrada_NUMERARIO = element.formaPagamento == "Numerário" ? +this.dezasseis_entrada_NUMERARIO + +element.valor : this.dezasseis_entrada_NUMERARIO;
              this.dezasseis_entrada_POS = element.formaPagamento == "POS" ? +this.dezasseis_entrada_POS + +element.valor : this.dezasseis_entrada_POS;
              this.dezasseis_entrada_MPesa = element.formaPagamento == "MPesa" ? +this.dezasseis_entrada_MPesa + +element.valor : this.dezasseis_entrada_MPesa;
              this.dezasseis_entrada_Cheque = element.formaPagamento == "Cheque" ? +this.dezasseis_entrada_Cheque + +element.valor : this.dezasseis_entrada_Cheque;
              this.dezasseis_entrada_Convenio= element.formaPagamento == "Convênio" ? +this.dezasseis_entrada_Convenio + +element.valor : this.dezasseis_entrada_Convenio;
              
              this.dezasseis_entrada_Consulta = element.plano_nome == "CONSULTA_MEDICA" ? +this.dezasseis_entrada_Consulta + +element.valor : this.dezasseis_entrada_Consulta;
              this.dezasseis_entrada_Diagnostico = element.plano_nome == "DIAGNOSTICO_AUX" ? +this.dezasseis_entrada_Diagnostico + +element.valor : this.dezasseis_entrada_Diagnostico;
              this.dezasseis_entrada_Conduta = element.plano_nome == "CONDUTA CLINICA" ? +this.dezasseis_entrada_Conduta + +element.valor : this.dezasseis_entrada_Conduta;
              this.dezasseis_entrada_Medicamento = element.plano_nome == "MEDICAMENTO" ? +this.dezasseis_entrada_Medicamento + +element.valor : this.dezasseis_entrada_Medicamento;

              this.dezasseis_entrada_Total = element.tipo_nome == "2.Entrada" ? +this.dezasseis_entrada_Total + +element.valor : this.dezasseis_entrada_Total;

              this.dezasseis_saida_Energia = (element.tipo_nome == "1.Saida" && element.plano_nome == "Energia") ? +this.dezasseis_saida_Energia + +element.valor : this.dezasseis_saida_Energia;
              this.dezasseis_saida_Salario = (element.tipo_nome == "1.Saida" && element.plano_nome == "Salario") ? +this.dezasseis_saida_Salario + +element.valor : this.dezasseis_saida_Salario;
              this.dezasseis_saida_Transporte = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && element.subtipo_nome == "1.2.Despesas de transporte") ? +this.dezasseis_saida_Transporte + +element.valor : this.dezasseis_saida_Transporte;
              this.dezasseis_saida_Alimentacao = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && element.subtipo_nome == "1.3.Despesas de alimentacao") ? +this.dezasseis_saida_Alimentacao + +element.valor : this.dezasseis_saida_Alimentacao;
              this.dezasseis_saida_Admnistrativas = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && element.subtipo_nome == "1.1.Despesas admnistrativas") ? +this.dezasseis_saida_Admnistrativas + +element.valor : this.dezasseis_saida_Admnistrativas;
              this.dezasseis_saida_Outros = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && (element.subtipo_nome !== "1.1.Despesas admnistrativas" && element.subtipo_nome !== "1.2.Despesas de transporte" && element.subtipo_nome !== "1.3.Despesas de alimentacao")) ? +this.dezasseis_saida_Outros + +element.valor : this.dezasseis_saida_Outros;

              this.dezasseis_saida_Total = element.tipo_nome == "1.Saida" ? +this.dezasseis_saida_Total + +element.valor : this.dezasseis_saida_Total;             

              dezasseis_LancamentoConsolidado = new LancamentoConsolidado(
                element.dia,element.mes, this.dezasseis_entrada_NUMERARIO, this.dezasseis_entrada_POS, this.dezasseis_entrada_MPesa, this.dezasseis_entrada_Cheque, this.dezasseis_entrada_Convenio,
                this.dezasseis_entrada_Consulta, this.dezasseis_entrada_Diagnostico, this.dezasseis_entrada_Conduta, this.dezasseis_entrada_Medicamento, this.dezasseis_entrada_Total,
                this.dezasseis_saida_Energia, this.dezasseis_saida_Salario, this.dezasseis_saida_Alimentacao, this.dezasseis_saida_Transporte, this.dezasseis_saida_Admnistrativas,
                this.dezasseis_saida_Outros, this.dezasseis_saida_Total);
              break;
            }

            case "17": {
              this.dezassete_entrada_NUMERARIO = element.formaPagamento == "Numerário" ? +this.dezassete_entrada_NUMERARIO + +element.valor : this.dezassete_entrada_NUMERARIO;
              this.dezassete_entrada_POS = element.formaPagamento == "POS" ? +this.dezassete_entrada_POS + +element.valor : this.dezassete_entrada_POS;
              this.dezassete_entrada_MPesa = element.formaPagamento == "MPesa" ? +this.dezassete_entrada_MPesa + +element.valor : this.dezassete_entrada_MPesa;
              this.dezassete_entrada_Cheque = element.formaPagamento == "Cheque" ? +this.dezassete_entrada_Cheque + +element.valor : this.dezassete_entrada_Cheque;
              this.dezassete_entrada_Convenio= element.formaPagamento == "Convênio" ? +this.dezassete_entrada_Convenio + +element.valor : this.dezassete_entrada_Convenio;
              
              this.dezassete_entrada_Consulta = element.plano_nome == "CONSULTA_MEDICA" ? +this.dezassete_entrada_Consulta + +element.valor : this.dezassete_entrada_Consulta;
              this.dezassete_entrada_Diagnostico = element.plano_nome == "DIAGNOSTICO_AUX" ? +this.dezassete_entrada_Diagnostico + +element.valor : this.dezassete_entrada_Diagnostico;
              this.dezassete_entrada_Conduta = element.plano_nome == "CONDUTA CLINICA" ? +this.dezassete_entrada_Conduta + +element.valor : this.dezassete_entrada_Conduta;
              this.dezassete_entrada_Medicamento = element.plano_nome == "MEDICAMENTO" ? +this.dezassete_entrada_Medicamento + +element.valor : this.dezassete_entrada_Medicamento;

              this.dezassete_entrada_Total = element.tipo_nome == "2.Entrada" ? +this.dezassete_entrada_Total + +element.valor : this.dezassete_entrada_Total;

              this.dezassete_saida_Energia = (element.tipo_nome == "1.Saida" && element.plano_nome == "Energia") ? +this.dezassete_saida_Energia + +element.valor : this.dezassete_saida_Energia;
              this.dezassete_saida_Salario = (element.tipo_nome == "1.Saida" && element.plano_nome == "Salario") ? +this.dezassete_saida_Salario + +element.valor : this.dezassete_saida_Salario;
              this.dezassete_saida_Transporte = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && element.subtipo_nome == "1.2.Despesas de transporte") ? +this.dezassete_saida_Transporte + +element.valor : this.dezassete_saida_Transporte;
              this.dezassete_saida_Alimentacao = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && element.subtipo_nome == "1.3.Despesas de alimentacao") ? +this.dezassete_saida_Alimentacao + +element.valor : this.dezassete_saida_Alimentacao;
              this.dezassete_saida_Admnistrativas = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && element.subtipo_nome == "1.1.Despesas admnistrativas") ? +this.dezassete_saida_Admnistrativas + +element.valor : this.dezassete_saida_Admnistrativas;
              this.dezassete_saida_Outros = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && (element.subtipo_nome !== "1.1.Despesas admnistrativas" && element.subtipo_nome !== "1.2.Despesas de transporte" && element.subtipo_nome !== "1.3.Despesas de alimentacao")) ? +this.dezassete_saida_Outros + +element.valor : this.dezassete_saida_Outros;

              this.dezassete_saida_Total = element.tipo_nome == "1.Saida" ? +this.dezassete_saida_Total + +element.valor : this.dezassete_saida_Total;             

              dezassete_LancamentoConsolidado = new LancamentoConsolidado(
                element.dia,element.mes, this.dezassete_entrada_NUMERARIO, this.dezassete_entrada_POS, this.dezassete_entrada_MPesa, this.dezassete_entrada_Cheque, this.dezassete_entrada_Convenio,
                this.dezassete_entrada_Consulta, this.dezassete_entrada_Diagnostico, this.dezassete_entrada_Conduta, this.dezassete_entrada_Medicamento, this.dezassete_entrada_Total,
                this.dezassete_saida_Energia, this.dezassete_saida_Salario, this.dezassete_saida_Alimentacao, this.dezassete_saida_Transporte, this.dezassete_saida_Admnistrativas,
                this.dezassete_saida_Outros, this.dezassete_saida_Total);
              break;
            }

            case "18": {
              this.dezoito_entrada_NUMERARIO = element.formaPagamento == "Numerário" ? +this.dezoito_entrada_NUMERARIO + +element.valor : this.dezoito_entrada_NUMERARIO;
              this.dezoito_entrada_POS = element.formaPagamento == "POS" ? +this.dezoito_entrada_POS + +element.valor : this.dezoito_entrada_POS;
              this.dezoito_entrada_MPesa = element.formaPagamento == "MPesa" ? +this.dezoito_entrada_MPesa + +element.valor : this.dezoito_entrada_MPesa;
              this.dezoito_entrada_Cheque = element.formaPagamento == "Cheque" ? +this.dezoito_entrada_Cheque + +element.valor : this.dezoito_entrada_Cheque;
              this.dezoito_entrada_Convenio= element.formaPagamento == "Convênio" ? +this.dezoito_entrada_Convenio + +element.valor : this.dezoito_entrada_Convenio;
              
              this.dezoito_entrada_Consulta = element.plano_nome == "CONSULTA_MEDICA" ? +this.dezoito_entrada_Consulta + +element.valor : this.dezoito_entrada_Consulta;
              this.dezoito_entrada_Diagnostico = element.plano_nome == "DIAGNOSTICO_AUX" ? +this.dezoito_entrada_Diagnostico + +element.valor : this.dezoito_entrada_Diagnostico;
              this.dezoito_entrada_Conduta = element.plano_nome == "CONDUTA CLINICA" ? +this.dezoito_entrada_Conduta + +element.valor : this.dezoito_entrada_Conduta;
              this.dezoito_entrada_Medicamento = element.plano_nome == "MEDICAMENTO" ? +this.dezoito_entrada_Medicamento + +element.valor : this.dezoito_entrada_Medicamento;

              this.dezoito_entrada_Total = element.tipo_nome == "2.Entrada" ? +this.dezoito_entrada_Total + +element.valor : this.dezoito_entrada_Total;

              this.dezoito_saida_Energia = (element.tipo_nome == "1.Saida" && element.plano_nome == "Energia") ? +this.dezoito_saida_Energia + +element.valor : this.dezoito_saida_Energia;
              this.dezoito_saida_Salario = (element.tipo_nome == "1.Saida" && element.plano_nome == "Salario") ? +this.dezoito_saida_Salario + +element.valor : this.dezoito_saida_Salario;
              this.dezoito_saida_Transporte = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && element.subtipo_nome == "1.2.Despesas de transporte") ? +this.dezoito_saida_Transporte + +element.valor : this.dezoito_saida_Transporte;
              this.dezoito_saida_Alimentacao = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && element.subtipo_nome == "1.3.Despesas de alimentacao") ? +this.dezoito_saida_Alimentacao + +element.valor : this.dezoito_saida_Alimentacao;
              this.dezoito_saida_Admnistrativas = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && element.subtipo_nome == "1.1.Despesas admnistrativas") ? +this.dezoito_saida_Admnistrativas + +element.valor : this.dezoito_saida_Admnistrativas;
              this.dezoito_saida_Outros = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && (element.subtipo_nome !== "1.1.Despesas admnistrativas" && element.subtipo_nome !== "1.2.Despesas de transporte" && element.subtipo_nome !== "1.3.Despesas de alimentacao")) ? +this.dezoito_saida_Outros + +element.valor : this.dezoito_saida_Outros;

              this.dezoito_saida_Total = element.tipo_nome == "1.Saida" ? +this.dezoito_saida_Total + +element.valor : this.dezoito_saida_Total;             

              dezoito_LancamentoConsolidado = new LancamentoConsolidado(
                element.dia,element.mes, this.dezoito_entrada_NUMERARIO, this.dezoito_entrada_POS, this.dezoito_entrada_MPesa, this.dezoito_entrada_Cheque, this.dezoito_entrada_Convenio,
                this.dezoito_entrada_Consulta, this.dezoito_entrada_Diagnostico, this.dezoito_entrada_Conduta, this.dezoito_entrada_Medicamento, this.dezoito_entrada_Total,
                this.dezoito_saida_Energia, this.dezoito_saida_Salario, this.dezoito_saida_Alimentacao, this.dezoito_saida_Transporte, this.dezoito_saida_Admnistrativas,
                this.dezoito_saida_Outros, this.dezoito_saida_Total);

              break;
            }

            case "19": {
              this.dezanove_entrada_NUMERARIO = element.formaPagamento == "Numerário" ? +this.dezanove_entrada_NUMERARIO + +element.valor : this.dezanove_entrada_NUMERARIO;
              this.dezanove_entrada_POS = element.formaPagamento == "POS" ? +this.dezanove_entrada_POS + +element.valor : this.dezanove_entrada_POS;
              this.dezanove_entrada_MPesa = element.formaPagamento == "MPesa" ? +this.dezanove_entrada_MPesa + +element.valor : this.dezanove_entrada_MPesa;
              this.dezanove_entrada_Cheque = element.formaPagamento == "Cheque" ? +this.dezanove_entrada_Cheque + +element.valor : this.dezanove_entrada_Cheque;
              this.dezanove_entrada_Convenio= element.formaPagamento == "Convênio" ? +this.dezanove_entrada_Convenio + +element.valor : this.dezanove_entrada_Convenio;
              
              this.dezanove_entrada_Consulta = element.plano_nome == "CONSULTA_MEDICA" ? +this.dezanove_entrada_Consulta + +element.valor : this.dezanove_entrada_Consulta;
              this.dezanove_entrada_Diagnostico = element.plano_nome == "DIAGNOSTICO_AUX" ? +this.dezanove_entrada_Diagnostico + +element.valor : this.dezanove_entrada_Diagnostico;
              this.dezanove_entrada_Conduta = element.plano_nome == "CONDUTA CLINICA" ? +this.dezanove_entrada_Conduta + +element.valor : this.dezanove_entrada_Conduta;
              this.dezanove_entrada_Medicamento = element.plano_nome == "MEDICAMENTO" ? +this.dezanove_entrada_Medicamento + +element.valor : this.dezanove_entrada_Medicamento;

              this.dezanove_entrada_Total = element.tipo_nome == "2.Entrada" ? +this.dezanove_entrada_Total + +element.valor : this.dezanove_entrada_Total;

              this.dezanove_saida_Energia = (element.tipo_nome == "1.Saida" && element.plano_nome == "Energia") ? +this.dezanove_saida_Energia + +element.valor : this.dezanove_saida_Energia;
              this.dezanove_saida_Salario = (element.tipo_nome == "1.Saida" && element.plano_nome == "Salario") ? +this.dezanove_saida_Salario + +element.valor : this.dezanove_saida_Salario;
              this.dezanove_saida_Transporte = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && element.subtipo_nome == "1.2.Despesas de transporte") ? +this.dezanove_saida_Transporte + +element.valor : this.dezanove_saida_Transporte;
              this.dezanove_saida_Alimentacao = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && element.subtipo_nome == "1.3.Despesas de alimentacao") ? +this.dezanove_saida_Alimentacao + +element.valor : this.dezanove_saida_Alimentacao;
              this.dezanove_saida_Admnistrativas = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && element.subtipo_nome == "1.1.Despesas admnistrativas") ? +this.dezanove_saida_Admnistrativas + +element.valor : this.dezanove_saida_Admnistrativas;
              this.dezanove_saida_Outros = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && (element.subtipo_nome !== "1.1.Despesas admnistrativas" && element.subtipo_nome !== "1.2.Despesas de transporte" && element.subtipo_nome !== "1.3.Despesas de alimentacao")) ? +this.dezanove_saida_Outros + +element.valor : this.dezanove_saida_Outros;

              this.dezanove_saida_Total = element.tipo_nome == "1.Saida" ? +this.dezanove_saida_Total + +element.valor : this.dezanove_saida_Total;             

              dezanove_LancamentoConsolidado = new LancamentoConsolidado(
                element.dia,element.mes, this.dezanove_entrada_NUMERARIO, this.dezanove_entrada_POS, this.dezanove_entrada_MPesa, this.dezanove_entrada_Cheque, this.dezanove_entrada_Convenio,
                this.dezanove_entrada_Consulta, this.dezanove_entrada_Diagnostico, this.dezanove_entrada_Conduta, this.dezanove_entrada_Medicamento, this.dezanove_entrada_Total,
                this.dezanove_saida_Energia, this.dezanove_saida_Salario, this.dezanove_saida_Alimentacao, this.dezanove_saida_Transporte, this.dezanove_saida_Admnistrativas,
                this.dezanove_saida_Outros, this.dezanove_saida_Total);
              break;
            }

            case "20": {
              this.vinte_entrada_NUMERARIO = element.formaPagamento == "Numerário" ? +this.vinte_entrada_NUMERARIO + +element.valor : this.vinte_entrada_NUMERARIO;
              this.vinte_entrada_POS = element.formaPagamento == "POS" ? +this.vinte_entrada_POS + +element.valor : this.vinte_entrada_POS;
              this.vinte_entrada_MPesa = element.formaPagamento == "MPesa" ? +this.vinte_entrada_MPesa + +element.valor : this.vinte_entrada_MPesa;
              this.vinte_entrada_Cheque = element.formaPagamento == "Cheque" ? +this.vinte_entrada_Cheque + +element.valor : this.vinte_entrada_Cheque;
              this.vinte_entrada_Convenio= element.formaPagamento == "Convênio" ? +this.vinte_entrada_Convenio + +element.valor : this.vinte_entrada_Convenio;
              
              this.vinte_entrada_Consulta = element.plano_nome == "CONSULTA_MEDICA" ? +this.vinte_entrada_Consulta + +element.valor : this.vinte_entrada_Consulta;
              this.vinte_entrada_Diagnostico = element.plano_nome == "DIAGNOSTICO_AUX" ? +this.vinte_entrada_Diagnostico + +element.valor : this.vinte_entrada_Diagnostico;
              this.vinte_entrada_Conduta = element.plano_nome == "CONDUTA CLINICA" ? +this.vinte_entrada_Conduta + +element.valor : this.vinte_entrada_Conduta;
              this.vinte_entrada_Medicamento = element.plano_nome == "MEDICAMENTO" ? +this.vinte_entrada_Medicamento + +element.valor : this.vinte_entrada_Medicamento;

              this.vinte_entrada_Total = element.tipo_nome == "2.Entrada" ? +this.vinte_entrada_Total + +element.valor : this.vinte_entrada_Total;

              this.vinte_saida_Energia = (element.tipo_nome == "1.Saida" && element.plano_nome == "Energia") ? +this.vinte_saida_Energia + +element.valor : this.vinte_saida_Energia;
              this.vinte_saida_Salario = (element.tipo_nome == "1.Saida" && element.plano_nome == "Salario") ? +this.vinte_saida_Salario + +element.valor : this.vinte_saida_Salario;
              this.vinte_saida_Transporte = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && element.subtipo_nome == "1.2.Despesas de transporte") ? +this.vinte_saida_Transporte + +element.valor : this.vinte_saida_Transporte;
              this.vinte_saida_Alimentacao = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && element.subtipo_nome == "1.3.Despesas de alimentacao") ? +this.vinte_saida_Alimentacao + +element.valor : this.vinte_saida_Alimentacao;
              this.vinte_saida_Admnistrativas = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && element.subtipo_nome == "1.1.Despesas admnistrativas") ? +this.vinte_saida_Admnistrativas + +element.valor : this.vinte_saida_Admnistrativas;
              this.vinte_saida_Outros = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && (element.subtipo_nome !== "1.1.Despesas admnistrativas" && element.subtipo_nome !== "1.2.Despesas de transporte" && element.subtipo_nome !== "1.3.Despesas de alimentacao")) ? +this.vinte_saida_Outros + +element.valor : this.vinte_saida_Outros;

              this.vinte_saida_Total = element.tipo_nome == "1.Saida" ? +this.vinte_saida_Total + +element.valor : this.vinte_saida_Total;             

              vinte_LancamentoConsolidado = new LancamentoConsolidado(
                element.dia,element.mes, this.vinte_entrada_NUMERARIO, this.vinte_entrada_POS, this.vinte_entrada_MPesa, this.vinte_entrada_Cheque, this.vinte_entrada_Convenio,
                this.vinte_entrada_Consulta, this.vinte_entrada_Diagnostico, this.vinte_entrada_Conduta, this.vinte_entrada_Medicamento, this.vinte_entrada_Total,
                this.vinte_saida_Energia, this.vinte_saida_Salario, this.vinte_saida_Alimentacao, this.vinte_saida_Transporte, this.vinte_saida_Admnistrativas,
                this.vinte_saida_Outros, this.vinte_saida_Total);

              break;
            }

            case "21": {
              this.vinteum_entrada_NUMERARIO = element.formaPagamento == "Numerário" ? +this.vinteum_entrada_NUMERARIO + +element.valor : this.vinteum_entrada_NUMERARIO;
              this.vinteum_entrada_POS = element.formaPagamento == "POS" ? +this.vinteum_entrada_POS + +element.valor : this.vinteum_entrada_POS;
              this.vinteum_entrada_MPesa = element.formaPagamento == "MPesa" ? +this.vinteum_entrada_MPesa + +element.valor : this.vinteum_entrada_MPesa;
              this.vinteum_entrada_Cheque = element.formaPagamento == "Cheque" ? +this.vinteum_entrada_Cheque + +element.valor : this.vinteum_entrada_Cheque;
              this.vinteum_entrada_Convenio= element.formaPagamento == "Convênio" ? +this.vinteum_entrada_Convenio + +element.valor : this.vinteum_entrada_Convenio;
              
              this.vinteum_entrada_Consulta = element.plano_nome == "CONSULTA_MEDICA" ? +this.vinteum_entrada_Consulta + +element.valor : this.vinteum_entrada_Consulta;
              this.vinteum_entrada_Diagnostico = element.plano_nome == "DIAGNOSTICO_AUX" ? +this.vinteum_entrada_Diagnostico + +element.valor : this.vinteum_entrada_Diagnostico;
              this.vinteum_entrada_Conduta = element.plano_nome == "CONDUTA CLINICA" ? +this.vinteum_entrada_Conduta + +element.valor : this.vinteum_entrada_Conduta;
              this.vinteum_entrada_Medicamento = element.plano_nome == "MEDICAMENTO" ? +this.vinteum_entrada_Medicamento + +element.valor : this.vinteum_entrada_Medicamento;

              this.vinteum_entrada_Total = element.tipo_nome == "2.Entrada" ? +this.vinteum_entrada_Total + +element.valor : this.vinteum_entrada_Total;

              this.vinteum_saida_Energia = (element.tipo_nome == "1.Saida" && element.plano_nome == "Energia") ? +this.vinteum_saida_Energia + +element.valor : this.vinteum_saida_Energia;
              this.vinteum_saida_Salario = (element.tipo_nome == "1.Saida" && element.plano_nome == "Salario") ? +this.vinteum_saida_Salario + +element.valor : this.vinteum_saida_Salario;
              this.vinteum_saida_Transporte = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && element.subtipo_nome == "1.2.Despesas de transporte") ? +this.vinteum_saida_Transporte + +element.valor : this.vinteum_saida_Transporte;
              this.vinteum_saida_Alimentacao = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && element.subtipo_nome == "1.3.Despesas de alimentacao") ? +this.vinteum_saida_Alimentacao + +element.valor : this.vinteum_saida_Alimentacao;
              this.vinteum_saida_Admnistrativas = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && element.subtipo_nome == "1.1.Despesas admnistrativas") ? +this.vinteum_saida_Admnistrativas + +element.valor : this.vinteum_saida_Admnistrativas;
              this.vinteum_saida_Outros = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && (element.subtipo_nome !== "1.1.Despesas admnistrativas" && element.subtipo_nome !== "1.2.Despesas de transporte" && element.subtipo_nome !== "1.3.Despesas de alimentacao")) ? +this.vinteum_saida_Outros + +element.valor : this.vinteum_saida_Outros;

              this.vinteum_saida_Total = element.tipo_nome == "1.Saida" ? +this.vinteum_saida_Total + +element.valor : this.vinteum_saida_Total;             

              vinteum_LancamentoConsolidado = new LancamentoConsolidado(
                element.dia,element.mes, this.vinteum_entrada_NUMERARIO, this.vinteum_entrada_POS, this.vinteum_entrada_MPesa, this.vinteum_entrada_Cheque, this.vinteum_entrada_Convenio,
                this.vinteum_entrada_Consulta, this.vinteum_entrada_Diagnostico, this.vinteum_entrada_Conduta, this.vinteum_entrada_Medicamento, this.vinteum_entrada_Total,
                this.vinteum_saida_Energia, this.vinteum_saida_Salario, this.vinteum_saida_Alimentacao, this.vinteum_saida_Transporte, this.vinteum_saida_Admnistrativas,
                this.vinteum_saida_Outros, this.vinteum_saida_Total);

              break;
            }

            case "22": {
              this.vintedois_entrada_NUMERARIO = element.formaPagamento == "Numerário" ? +this.vintedois_entrada_NUMERARIO + +element.valor : this.vintedois_entrada_NUMERARIO;
              this.vintedois_entrada_POS = element.formaPagamento == "POS" ? +this.vintedois_entrada_POS + +element.valor : this.vintedois_entrada_POS;
              this.vintedois_entrada_MPesa = element.formaPagamento == "MPesa" ? +this.vintedois_entrada_MPesa + +element.valor : this.vintedois_entrada_MPesa;
              this.vintedois_entrada_Cheque = element.formaPagamento == "Cheque" ? +this.vintedois_entrada_Cheque + +element.valor : this.vintedois_entrada_Cheque;
              this.vintedois_entrada_Convenio= element.formaPagamento == "Convênio" ? +this.vintedois_entrada_Convenio + +element.valor : this.vintedois_entrada_Convenio;
              
              this.vintedois_entrada_Consulta = element.plano_nome == "CONSULTA_MEDICA" ? +this.vintedois_entrada_Consulta + +element.valor : this.vintedois_entrada_Consulta;
              this.vintedois_entrada_Diagnostico = element.plano_nome == "DIAGNOSTICO_AUX" ? +this.vintedois_entrada_Diagnostico + +element.valor : this.vintedois_entrada_Diagnostico;
              this.vintedois_entrada_Conduta = element.plano_nome == "CONDUTA CLINICA" ? +this.vintedois_entrada_Conduta + +element.valor : this.vintedois_entrada_Conduta;
              this.vintedois_entrada_Medicamento = element.plano_nome == "MEDICAMENTO" ? +this.vintedois_entrada_Medicamento + +element.valor : this.vintedois_entrada_Medicamento;

              this.vintedois_entrada_Total = element.tipo_nome == "2.Entrada" ? +this.vintedois_entrada_Total + +element.valor : this.vintedois_entrada_Total;

              this.vintedois_saida_Energia = (element.tipo_nome == "1.Saida" && element.plano_nome == "Energia") ? +this.vintedois_saida_Energia + +element.valor : this.vintedois_saida_Energia;
              this.vintedois_saida_Salario = (element.tipo_nome == "1.Saida" && element.plano_nome == "Salario") ? +this.vintedois_saida_Salario + +element.valor : this.vintedois_saida_Salario;
              this.vintedois_saida_Transporte = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && element.subtipo_nome == "1.2.Despesas de transporte") ? +this.vintedois_saida_Transporte + +element.valor : this.vintedois_saida_Transporte;
              this.vintedois_saida_Alimentacao = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && element.subtipo_nome == "1.3.Despesas de alimentacao") ? +this.vintedois_saida_Alimentacao + +element.valor : this.vintedois_saida_Alimentacao;
              this.vintedois_saida_Admnistrativas = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && element.subtipo_nome == "1.1.Despesas admnistrativas") ? +this.vintedois_saida_Admnistrativas + +element.valor : this.vintedois_saida_Admnistrativas;
              this.vintedois_saida_Outros = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && (element.subtipo_nome !== "1.1.Despesas admnistrativas" && element.subtipo_nome !== "1.2.Despesas de transporte" && element.subtipo_nome !== "1.3.Despesas de alimentacao")) ? +this.vintedois_saida_Outros + +element.valor : this.vintedois_saida_Outros;

              this.vintedois_saida_Total = element.tipo_nome == "1.Saida" ? +this.vintedois_saida_Total + +element.valor : this.vintedois_saida_Total;             

              vintedois_LancamentoConsolidado = new LancamentoConsolidado(
                element.dia,element.mes, this.vintedois_entrada_NUMERARIO, this.vintedois_entrada_POS, this.vintedois_entrada_MPesa, this.vintedois_entrada_Cheque, this.vintedois_entrada_Convenio,
                this.vintedois_entrada_Consulta, this.vintedois_entrada_Diagnostico, this.vintedois_entrada_Conduta, this.vintedois_entrada_Medicamento, this.vintedois_entrada_Total,
                this.vintedois_saida_Energia, this.vintedois_saida_Salario, this.vintedois_saida_Alimentacao, this.vintedois_saida_Transporte, this.vintedois_saida_Admnistrativas,
                this.vintedois_saida_Outros, this.vintedois_saida_Total);
              break;
            }

            case "23": {
              this.vintetrez_entrada_NUMERARIO = element.formaPagamento == "Numerário" ? +this.vintetrez_entrada_NUMERARIO + +element.valor : this.vintetrez_entrada_NUMERARIO;
              this.vintetrez_entrada_POS = element.formaPagamento == "POS" ? +this.vintetrez_entrada_POS + +element.valor : this.vintetrez_entrada_POS;
              this.vintetrez_entrada_MPesa = element.formaPagamento == "MPesa" ? +this.vintetrez_entrada_MPesa + +element.valor : this.vintetrez_entrada_MPesa;
              this.vintetrez_entrada_Cheque = element.formaPagamento == "Cheque" ? +this.vintetrez_entrada_Cheque + +element.valor : this.vintetrez_entrada_Cheque;
              this.vintetrez_entrada_Convenio= element.formaPagamento == "Convênio" ? +this.vintetrez_entrada_Convenio + +element.valor : this.vintetrez_entrada_Convenio;
              
              this.vintetrez_entrada_Consulta = element.plano_nome == "CONSULTA_MEDICA" ? +this.vintetrez_entrada_Consulta + +element.valor : this.vintetrez_entrada_Consulta;
              this.vintetrez_entrada_Diagnostico = element.plano_nome == "DIAGNOSTICO_AUX" ? +this.vintetrez_entrada_Diagnostico + +element.valor : this.vintetrez_entrada_Diagnostico;
              this.vintetrez_entrada_Conduta = element.plano_nome == "CONDUTA CLINICA" ? +this.vintetrez_entrada_Conduta + +element.valor : this.vintetrez_entrada_Conduta;
              this.vintetrez_entrada_Medicamento = element.plano_nome == "MEDICAMENTO" ? +this.vintetrez_entrada_Medicamento + +element.valor : this.vintetrez_entrada_Medicamento;

              this.vintetrez_entrada_Total = element.tipo_nome == "2.Entrada" ? +this.vintetrez_entrada_Total + +element.valor : this.vintetrez_entrada_Total;

              this.vintetrez_saida_Energia = (element.tipo_nome == "1.Saida" && element.plano_nome == "Energia") ? +this.vintetrez_saida_Energia + +element.valor : this.vintetrez_saida_Energia;
              this.vintetrez_saida_Salario = (element.tipo_nome == "1.Saida" && element.plano_nome == "Salario") ? +this.vintetrez_saida_Salario + +element.valor : this.vintetrez_saida_Salario;
              this.vintetrez_saida_Transporte = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && element.subtipo_nome == "1.2.Despesas de transporte") ? +this.vintetrez_saida_Transporte + +element.valor : this.vintetrez_saida_Transporte;
              this.vintetrez_saida_Alimentacao = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && element.subtipo_nome == "1.3.Despesas de alimentacao") ? +this.vintetrez_saida_Alimentacao + +element.valor : this.vintetrez_saida_Alimentacao;
              this.vintetrez_saida_Admnistrativas = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && element.subtipo_nome == "1.1.Despesas admnistrativas") ? +this.vintetrez_saida_Admnistrativas + +element.valor : this.vintetrez_saida_Admnistrativas;
              this.vintetrez_saida_Outros = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && (element.subtipo_nome !== "1.1.Despesas admnistrativas" && element.subtipo_nome !== "1.2.Despesas de transporte" && element.subtipo_nome !== "1.3.Despesas de alimentacao")) ? +this.vintetrez_saida_Outros + +element.valor : this.vintetrez_saida_Outros;

              this.vintetrez_saida_Total = element.tipo_nome == "1.Saida" ? +this.vintetrez_saida_Total + +element.valor : this.vintetrez_saida_Total;             

              vintetrez_LancamentoConsolidado = new LancamentoConsolidado(
                element.dia,element.mes, this.vintetrez_entrada_NUMERARIO, this.vintetrez_entrada_POS, this.vintetrez_entrada_MPesa, this.vintetrez_entrada_Cheque, this.vintetrez_entrada_Convenio,
                this.vintetrez_entrada_Consulta, this.vintetrez_entrada_Diagnostico, this.vintetrez_entrada_Conduta, this.vintetrez_entrada_Medicamento, this.vintetrez_entrada_Total,
                this.vintetrez_saida_Energia, this.vintetrez_saida_Salario, this.vintetrez_saida_Alimentacao, this.vintetrez_saida_Transporte, this.vintetrez_saida_Admnistrativas,
                this.vintetrez_saida_Outros, this.vintetrez_saida_Total);

              break;
            }

            case "24": {
              this.vintequatro_entrada_NUMERARIO = element.formaPagamento == "Numerário" ? +this.vintequatro_entrada_NUMERARIO + +element.valor : this.vintequatro_entrada_NUMERARIO;
              this.vintequatro_entrada_POS = element.formaPagamento == "POS" ? +this.vintequatro_entrada_POS + +element.valor : this.vintequatro_entrada_POS;
              this.vintequatro_entrada_MPesa = element.formaPagamento == "MPesa" ? +this.vintequatro_entrada_MPesa + +element.valor : this.vintequatro_entrada_MPesa;
              this.vintequatro_entrada_Cheque = element.formaPagamento == "Cheque" ? +this.vintequatro_entrada_Cheque + +element.valor : this.vintequatro_entrada_Cheque;
              this.vintequatro_entrada_Convenio= element.formaPagamento == "Convênio" ? +this.vintequatro_entrada_Convenio + +element.valor : this.vintequatro_entrada_Convenio;
              this.vintequatro_entrada_Consulta = element.plano_nome == "CONSULTA_MEDICA" ? +this.vintequatro_entrada_Consulta + +element.valor : this.vintequatro_entrada_Consulta;

              this.vintequatro_entrada_Diagnostico = element.plano_nome == "DIAGNOSTICO_AUX" ? +this.vintequatro_entrada_Diagnostico + +element.valor : this.vintequatro_entrada_Diagnostico;
              this.vintequatro_entrada_Conduta = element.plano_nome == "CONDUTA CLINICA" ? +this.vintequatro_entrada_Conduta + +element.valor : this.vintequatro_entrada_Conduta;
              this.vintequatro_entrada_Medicamento = element.plano_nome == "MEDICAMENTO" ? +this.vintequatro_entrada_Medicamento + +element.valor : this.vintequatro_entrada_Medicamento;

              this.vintequatro_entrada_Total = element.tipo_nome == "2.Entrada" ? +this.vintequatro_entrada_Total + +element.valor : this.vintequatro_entrada_Total;

              this.vintequatro_saida_Energia = (element.tipo_nome == "1.Saida" && element.plano_nome == "Energia") ? +this.vintequatro_saida_Energia + +element.valor : this.vintequatro_saida_Energia;
              this.vintequatro_saida_Salario = (element.tipo_nome == "1.Saida" && element.plano_nome == "Salario") ? +this.vintequatro_saida_Salario + +element.valor : this.vintequatro_saida_Salario;
              this.vintequatro_saida_Transporte = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && element.subtipo_nome == "1.2.Despesas de transporte") ? +this.vintequatro_saida_Transporte + +element.valor : this.vintequatro_saida_Transporte;
              this.vintequatro_saida_Alimentacao = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && element.subtipo_nome == "1.3.Despesas de alimentacao") ? +this.vintequatro_saida_Alimentacao + +element.valor : this.vintequatro_saida_Alimentacao;
              this.vintequatro_saida_Admnistrativas = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && element.subtipo_nome == "1.1.Despesas admnistrativas") ? +this.vintequatro_saida_Admnistrativas + +element.valor : this.vintequatro_saida_Admnistrativas;
              this.vintequatro_saida_Outros = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && (element.subtipo_nome !== "1.1.Despesas admnistrativas" && element.subtipo_nome !== "1.2.Despesas de transporte" && element.subtipo_nome !== "1.3.Despesas de alimentacao")) ? +this.vintequatro_saida_Outros + +element.valor : this.vintequatro_saida_Outros;

              this.vintequatro_saida_Total = element.tipo_nome == "1.Saida" ? +this.vintequatro_saida_Total + +element.valor : this.vintequatro_saida_Total;             

              vintequatro_LancamentoConsolidado = new LancamentoConsolidado(
                element.dia,element.mes, this.vintequatro_entrada_NUMERARIO, this.vintequatro_entrada_POS, this.vintequatro_entrada_MPesa, this.vintequatro_entrada_Cheque, this.vintequatro_entrada_Convenio,
                this.vintequatro_entrada_Consulta, this.vintequatro_entrada_Diagnostico, this.vintequatro_entrada_Conduta, this.vintequatro_entrada_Medicamento, this.vintequatro_entrada_Total,
                this.vintequatro_saida_Energia, this.vintequatro_saida_Salario, this.vintequatro_saida_Alimentacao, this.vintequatro_saida_Transporte, this.vintequatro_saida_Admnistrativas,
                this.vintequatro_saida_Outros, this.vintequatro_saida_Total);
              break;
            }

            case "25": {
              this.vintecinco_entrada_NUMERARIO = element.formaPagamento == "Numerário" ? +this.vintecinco_entrada_NUMERARIO + +element.valor : this.vintecinco_entrada_NUMERARIO;
              this.vintecinco_entrada_POS = element.formaPagamento == "POS" ? +this.vintecinco_entrada_POS + +element.valor : this.vintecinco_entrada_POS;
              this.vintecinco_entrada_MPesa = element.formaPagamento == "MPesa" ? +this.vintecinco_entrada_MPesa + +element.valor : this.vintecinco_entrada_MPesa;
              this.vintecinco_entrada_Cheque = element.formaPagamento == "Cheque" ? +this.vintecinco_entrada_Cheque + +element.valor : this.vintecinco_entrada_Cheque;
              this.vintecinco_entrada_Convenio= element.formaPagamento == "Convênio" ? +this.vintecinco_entrada_Convenio + +element.valor : this.vintecinco_entrada_Convenio;
              
              this.vintecinco_entrada_Consulta = element.plano_nome == "CONSULTA_MEDICA" ? +this.vintecinco_entrada_Consulta + +element.valor : this.vintecinco_entrada_Consulta;
              this.vintecinco_entrada_Diagnostico = element.plano_nome == "DIAGNOSTICO_AUX" ? +this.vintecinco_entrada_Diagnostico + +element.valor : this.vintecinco_entrada_Diagnostico;
              this.vintecinco_entrada_Conduta = element.plano_nome == "CONDUTA CLINICA" ? +this.vintecinco_entrada_Conduta + +element.valor : this.vintecinco_entrada_Conduta;
              this.vintecinco_entrada_Medicamento = element.plano_nome == "MEDICAMENTO" ? +this.vintecinco_entrada_Medicamento + +element.valor : this.vintecinco_entrada_Medicamento;

              this.vintecinco_entrada_Total = element.tipo_nome == "2.Entrada" ? +this.vintecinco_entrada_Total + +element.valor : this.vintecinco_entrada_Total;

              this.vintecinco_saida_Energia = (element.tipo_nome == "1.Saida" && element.plano_nome == "Energia") ? +this.vintecinco_saida_Energia + +element.valor : this.vintecinco_saida_Energia;
              this.vintecinco_saida_Salario = (element.tipo_nome == "1.Saida" && element.plano_nome == "Salario") ? +this.vintecinco_saida_Salario + +element.valor : this.vintecinco_saida_Salario;
              this.vintecinco_saida_Transporte = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && element.subtipo_nome == "1.2.Despesas de transporte") ? +this.vintecinco_saida_Transporte + +element.valor : this.vintecinco_saida_Transporte;
              this.vintecinco_saida_Alimentacao = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && element.subtipo_nome == "1.3.Despesas de alimentacao") ? +this.vintecinco_saida_Alimentacao + +element.valor : this.vintecinco_saida_Alimentacao;
              this.vintecinco_saida_Admnistrativas = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && element.subtipo_nome == "1.1.Despesas admnistrativas") ? +this.vintecinco_saida_Admnistrativas + +element.valor : this.vintecinco_saida_Admnistrativas;
              this.vintecinco_saida_Outros = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && (element.subtipo_nome !== "1.1.Despesas admnistrativas" && element.subtipo_nome !== "1.2.Despesas de transporte" && element.subtipo_nome !== "1.3.Despesas de alimentacao")) ? +this.vintecinco_saida_Outros + +element.valor : this.vintecinco_saida_Outros;

              this.vintecinco_saida_Total = element.tipo_nome == "1.Saida" ? +this.vintecinco_saida_Total + +element.valor : this.vintecinco_saida_Total;             

              vintecinco_LancamentoConsolidado = new LancamentoConsolidado(
                element.dia,element.mes, this.vintecinco_entrada_NUMERARIO, this.vintecinco_entrada_POS, this.vintecinco_entrada_MPesa, this.vintecinco_entrada_Cheque, this.vintecinco_entrada_Convenio,
                this.vintecinco_entrada_Consulta, this.vintecinco_entrada_Diagnostico, this.vintecinco_entrada_Conduta, this.vintecinco_entrada_Medicamento, this.vintecinco_entrada_Total,
                this.vintecinco_saida_Energia, this.vintecinco_saida_Salario, this.vintecinco_saida_Alimentacao, this.vintecinco_saida_Transporte, this.vintecinco_saida_Admnistrativas,
                this.vintecinco_saida_Outros, this.vintecinco_saida_Total);
              break;
            }

            case "26": {
              this.vinteseis_entrada_NUMERARIO = element.formaPagamento == "Numerário" ? +this.vinteseis_entrada_NUMERARIO + +element.valor : this.vinteseis_entrada_NUMERARIO;
              this.vinteseis_entrada_POS = element.formaPagamento == "POS" ? +this.vinteseis_entrada_POS + +element.valor : this.vinteseis_entrada_POS;
              this.vinteseis_entrada_MPesa = element.formaPagamento == "MPesa" ? +this.vinteseis_entrada_MPesa + +element.valor : this.vinteseis_entrada_MPesa;
              this.vinteseis_entrada_Cheque = element.formaPagamento == "Cheque" ? +this.vinteseis_entrada_Cheque + +element.valor : this.vinteseis_entrada_Cheque;
              this.vinteseis_entrada_Convenio= element.formaPagamento == "Convênio" ? +this.vinteseis_entrada_Convenio + +element.valor : this.vinteseis_entrada_Convenio;
              
              this.vinteseis_entrada_Consulta = element.plano_nome == "CONSULTA_MEDICA" ? +this.vinteseis_entrada_Consulta + +element.valor : this.vinteseis_entrada_Consulta;
              this.vinteseis_entrada_Diagnostico = element.plano_nome == "DIAGNOSTICO_AUX" ? +this.vinteseis_entrada_Diagnostico + +element.valor : this.vinteseis_entrada_Diagnostico;
              this.vinteseis_entrada_Conduta = element.plano_nome == "CONDUTA CLINICA" ? +this.vinteseis_entrada_Conduta + +element.valor : this.vinteseis_entrada_Conduta;
              this.vinteseis_entrada_Medicamento = element.plano_nome == "MEDICAMENTO" ? +this.vinteseis_entrada_Medicamento + +element.valor : this.vinteseis_entrada_Medicamento;

              this.vinteseis_entrada_Total = element.tipo_nome == "2.Entrada" ? +this.vinteseis_entrada_Total + +element.valor : this.vinteseis_entrada_Total;

              this.vinteseis_saida_Energia = (element.tipo_nome == "1.Saida" && element.plano_nome == "Energia") ? +this.vinteseis_saida_Energia + +element.valor : this.vinteseis_saida_Energia;
              this.vinteseis_saida_Salario = (element.tipo_nome == "1.Saida" && element.plano_nome == "Salario") ? +this.vinteseis_saida_Salario + +element.valor : this.vinteseis_saida_Salario;
              this.vinteseis_saida_Transporte = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && element.subtipo_nome == "1.2.Despesas de transporte") ? +this.vinteseis_saida_Transporte + +element.valor : this.vinteseis_saida_Transporte;
              this.vinteseis_saida_Alimentacao = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && element.subtipo_nome == "1.3.Despesas de alimentacao") ? +this.vinteseis_saida_Alimentacao + +element.valor : this.vinteseis_saida_Alimentacao;
              this.vinteseis_saida_Admnistrativas = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && element.subtipo_nome == "1.1.Despesas admnistrativas") ? +this.vinteseis_saida_Admnistrativas + +element.valor : this.vinteseis_saida_Admnistrativas;
              this.vinteseis_saida_Outros = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && (element.subtipo_nome !== "1.1.Despesas admnistrativas" && element.subtipo_nome !== "1.2.Despesas de transporte" && element.subtipo_nome !== "1.3.Despesas de alimentacao")) ? +this.vinteseis_saida_Outros + +element.valor : this.vinteseis_saida_Outros;

              this.vinteseis_saida_Total = element.tipo_nome == "1.Saida" ? +this.vinteseis_saida_Total + +element.valor : this.vinteseis_saida_Total;             

              vinteseis_LancamentoConsolidado = new LancamentoConsolidado(
                element.dia,element.mes, this.vinteseis_entrada_NUMERARIO, this.vinteseis_entrada_POS, this.vinteseis_entrada_MPesa, this.vinteseis_entrada_Cheque, this.vinteseis_entrada_Convenio,
                this.vinteseis_entrada_Consulta, this.vinteseis_entrada_Diagnostico, this.vinteseis_entrada_Conduta, this.vinteseis_entrada_Medicamento, this.vinteseis_entrada_Total,
                this.vinteseis_saida_Energia, this.vinteseis_saida_Salario, this.vinteseis_saida_Alimentacao, this.vinteseis_saida_Transporte, this.vinteseis_saida_Admnistrativas,
                this.vinteseis_saida_Outros, this.vinteseis_saida_Total);
              break;
            }

            case "27": {
              this.vintesete_entrada_NUMERARIO = element.formaPagamento == "Numerário" ? +this.vintesete_entrada_NUMERARIO + +element.valor : this.vintesete_entrada_NUMERARIO;
              this.vintesete_entrada_POS = element.formaPagamento == "POS" ? +this.vintesete_entrada_POS + +element.valor : this.vintesete_entrada_POS;
              this.vintesete_entrada_MPesa = element.formaPagamento == "MPesa" ? +this.vintesete_entrada_MPesa + +element.valor : this.vintesete_entrada_MPesa;
              this.vintesete_entrada_Cheque = element.formaPagamento == "Cheque" ? +this.vintesete_entrada_Cheque + +element.valor : this.vintesete_entrada_Cheque;
              this.vintesete_entrada_Convenio= element.formaPagamento == "Convênio" ? +this.vintesete_entrada_Convenio + +element.valor : this.vintesete_entrada_Convenio;
              
              this.vintesete_entrada_Consulta = element.plano_nome == "CONSULTA_MEDICA" ? +this.vintesete_entrada_Consulta + +element.valor : this.vintesete_entrada_Consulta;
              this.vintesete_entrada_Diagnostico = element.plano_nome == "DIAGNOSTICO_AUX" ? +this.vintesete_entrada_Diagnostico + +element.valor : this.vintesete_entrada_Diagnostico;
              this.vintesete_entrada_Conduta = element.plano_nome == "CONDUTA CLINICA" ? +this.vintesete_entrada_Conduta + +element.valor : this.vintesete_entrada_Conduta;
              this.vintesete_entrada_Medicamento = element.plano_nome == "MEDICAMENTO" ? +this.vintesete_entrada_Medicamento + +element.valor : this.vintesete_entrada_Medicamento;

              this.vintesete_entrada_Total = element.tipo_nome == "2.Entrada" ? +this.vintesete_entrada_Total + +element.valor : this.vintesete_entrada_Total;

              this.vintesete_saida_Energia = (element.tipo_nome == "1.Saida" && element.plano_nome == "Energia") ? +this.vintesete_saida_Energia + +element.valor : this.vintesete_saida_Energia;
              this.vintesete_saida_Salario = (element.tipo_nome == "1.Saida" && element.plano_nome == "Salario") ? +this.vintesete_saida_Salario + +element.valor : this.vintesete_saida_Salario;
              this.vintesete_saida_Transporte = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && element.subtipo_nome == "1.2.Despesas de transporte") ? +this.vintesete_saida_Transporte + +element.valor : this.vintesete_saida_Transporte;
              this.vintesete_saida_Alimentacao = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && element.subtipo_nome == "1.3.Despesas de alimentacao") ? +this.vintesete_saida_Alimentacao + +element.valor : this.vintesete_saida_Alimentacao;
              this.vintesete_saida_Admnistrativas = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && element.subtipo_nome == "1.1.Despesas admnistrativas") ? +this.vintesete_saida_Admnistrativas + +element.valor : this.vintesete_saida_Admnistrativas;
              this.vintesete_saida_Outros = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && (element.subtipo_nome !== "1.1.Despesas admnistrativas" && element.subtipo_nome !== "1.2.Despesas de transporte" && element.subtipo_nome !== "1.3.Despesas de alimentacao")) ? +this.vintesete_saida_Outros + +element.valor : this.vintesete_saida_Outros;

              this.vintesete_saida_Total = element.tipo_nome == "1.Saida" ? +this.vintesete_saida_Total + +element.valor : this.vintesete_saida_Total;             

              vintesete_LancamentoConsolidado = new LancamentoConsolidado(
                element.dia,element.mes, this.vintesete_entrada_NUMERARIO, this.vintesete_entrada_POS, this.vintesete_entrada_MPesa, this.vintesete_entrada_Cheque, this.vintesete_entrada_Convenio,
                this.vintesete_entrada_Consulta, this.vintesete_entrada_Diagnostico, this.vintesete_entrada_Conduta, this.vintesete_entrada_Medicamento, this.vintesete_entrada_Total,
                this.vintesete_saida_Energia, this.vintesete_saida_Salario, this.vintesete_saida_Alimentacao, this.vintesete_saida_Transporte, this.vintesete_saida_Admnistrativas,
                this.vintesete_saida_Outros, this.vintesete_saida_Total);
              break;
            }

            case "28": {
              this.vinteoito_entrada_NUMERARIO = element.formaPagamento == "Numerário" ? +this.vinteoito_entrada_NUMERARIO + +element.valor : this.vinteoito_entrada_NUMERARIO;
              this.vinteoito_entrada_POS = element.formaPagamento == "POS" ? +this.vinteoito_entrada_POS + +element.valor : this.vinteoito_entrada_POS;
              this.vinteoito_entrada_MPesa = element.formaPagamento == "MPesa" ? +this.vinteoito_entrada_MPesa + +element.valor : this.vinteoito_entrada_MPesa;
              this.vinteoito_entrada_Cheque = element.formaPagamento == "Cheque" ? +this.vinteoito_entrada_Cheque + +element.valor : this.vinteoito_entrada_Cheque;
              this.vinteoito_entrada_Convenio= element.formaPagamento == "Convênio" ? +this.vinteoito_entrada_Convenio + +element.valor : this.vinteoito_entrada_Convenio;
              
              this.vinteoito_entrada_Consulta = element.plano_nome == "CONSULTA_MEDICA" ? +this.vinteoito_entrada_Consulta + +element.valor : this.vinteoito_entrada_Consulta;
              this.vinteoito_entrada_Diagnostico = element.plano_nome == "DIAGNOSTICO_AUX" ? +this.vinteoito_entrada_Diagnostico + +element.valor : this.vinteoito_entrada_Diagnostico;
              this.vinteoito_entrada_Conduta = element.plano_nome == "CONDUTA CLINICA" ? +this.vinteoito_entrada_Conduta + +element.valor : this.vinteoito_entrada_Conduta;
              this.vinteoito_entrada_Medicamento = element.plano_nome == "MEDICAMENTO" ? +this.vinteoito_entrada_Medicamento + +element.valor : this.vinteoito_entrada_Medicamento;

              this.vinteoito_entrada_Total = element.tipo_nome == "2.Entrada" ? +this.vinteoito_entrada_Total + +element.valor : this.vinteoito_entrada_Total;

              this.vinteoito_saida_Energia = (element.tipo_nome == "1.Saida" && element.plano_nome == "Energia") ? +this.vinteoito_saida_Energia + +element.valor : this.vinteoito_saida_Energia;
              this.vinteoito_saida_Salario = (element.tipo_nome == "1.Saida" && element.plano_nome == "Salario") ? +this.vinteoito_saida_Salario + +element.valor : this.vinteoito_saida_Salario;
              this.vinteoito_saida_Transporte = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && element.subtipo_nome == "1.2.Despesas de transporte") ? +this.vinteoito_saida_Transporte + +element.valor : this.vinteoito_saida_Transporte;
              this.vinteoito_saida_Alimentacao = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && element.subtipo_nome == "1.3.Despesas de alimentacao") ? +this.vinteoito_saida_Alimentacao + +element.valor : this.vinteoito_saida_Alimentacao;
              this.vinteoito_saida_Admnistrativas = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && element.subtipo_nome == "1.1.Despesas admnistrativas") ? +this.vinteoito_saida_Admnistrativas + +element.valor : this.vinteoito_saida_Admnistrativas;
              this.vinteoito_saida_Outros = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && (element.subtipo_nome !== "1.1.Despesas admnistrativas" && element.subtipo_nome !== "1.2.Despesas de transporte" && element.subtipo_nome !== "1.3.Despesas de alimentacao")) ? +this.vinteoito_saida_Outros + +element.valor : this.vinteoito_saida_Outros;

              this.vinteoito_saida_Total = element.tipo_nome == "1.Saida" ? +this.vinteoito_saida_Total + +element.valor : this.vinteoito_saida_Total;             

              vinteoito_LancamentoConsolidado = new LancamentoConsolidado(
                element.dia,element.mes, this.vinteoito_entrada_NUMERARIO, this.vinteoito_entrada_POS, this.vinteoito_entrada_MPesa, this.vinteoito_entrada_Cheque, this.vinteoito_entrada_Convenio,
                this.vinteoito_entrada_Consulta, this.vinteoito_entrada_Diagnostico, this.vinteoito_entrada_Conduta, this.vinteoito_entrada_Medicamento, this.vinteoito_entrada_Total,
                this.vinteoito_saida_Energia, this.vinteoito_saida_Salario, this.vinteoito_saida_Alimentacao, this.vinteoito_saida_Transporte, this.vinteoito_saida_Admnistrativas,
                this.vinteoito_saida_Outros, this.vinteoito_saida_Total);
              break;
            }

            case "29": {
              this.vintenove_entrada_NUMERARIO = element.formaPagamento == "Numerário" ? +this.vintenove_entrada_NUMERARIO + +element.valor : this.vintenove_entrada_NUMERARIO;
              this.vintenove_entrada_POS = element.formaPagamento == "POS" ? +this.vintenove_entrada_POS + +element.valor : this.vintenove_entrada_POS;
              this.vintenove_entrada_MPesa = element.formaPagamento == "MPesa" ? +this.vintenove_entrada_MPesa + +element.valor : this.vintenove_entrada_MPesa;
              this.vintenove_entrada_Cheque = element.formaPagamento == "Cheque" ? +this.vintenove_entrada_Cheque + +element.valor : this.vintenove_entrada_Cheque;
              this.vintenove_entrada_Convenio= element.formaPagamento == "Convênio" ? +this.vintenove_entrada_Convenio + +element.valor : this.vintenove_entrada_Convenio;
              
              this.vintenove_entrada_Consulta = element.plano_nome == "CONSULTA_MEDICA" ? +this.vintenove_entrada_Consulta + +element.valor : this.vintenove_entrada_Consulta;
              this.vintenove_entrada_Diagnostico = element.plano_nome == "DIAGNOSTICO_AUX" ? +this.vintenove_entrada_Diagnostico + +element.valor : this.vintenove_entrada_Diagnostico;
              this.vintenove_entrada_Conduta = element.plano_nome == "CONDUTA CLINICA" ? +this.vintenove_entrada_Conduta + +element.valor : this.vintenove_entrada_Conduta;
              this.vintenove_entrada_Medicamento = element.plano_nome == "MEDICAMENTO" ? +this.vintenove_entrada_Medicamento + +element.valor : this.vintenove_entrada_Medicamento;

              this.vintenove_entrada_Total = element.tipo_nome == "2.Entrada" ? +this.vintenove_entrada_Total + +element.valor : this.vintenove_entrada_Total;

              this.vintenove_saida_Energia = (element.tipo_nome == "1.Saida" && element.plano_nome == "Energia") ? +this.vintenove_saida_Energia + +element.valor : this.vintenove_saida_Energia;
              this.vintenove_saida_Salario = (element.tipo_nome == "1.Saida" && element.plano_nome == "Salario") ? +this.vintenove_saida_Salario + +element.valor : this.vintenove_saida_Salario;
              this.vintenove_saida_Transporte = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && element.subtipo_nome == "1.2.Despesas de transporte") ? +this.vintenove_saida_Transporte + +element.valor : this.vintenove_saida_Transporte;
              this.vintenove_saida_Alimentacao = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && element.subtipo_nome == "1.3.Despesas de alimentacao") ? +this.vintenove_saida_Alimentacao + +element.valor : this.vintenove_saida_Alimentacao;
              this.vintenove_saida_Admnistrativas = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && element.subtipo_nome == "1.1.Despesas admnistrativas") ? +this.vintenove_saida_Admnistrativas + +element.valor : this.vintenove_saida_Admnistrativas;
              this.vintenove_saida_Outros = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && (element.subtipo_nome !== "1.1.Despesas admnistrativas" && element.subtipo_nome !== "1.2.Despesas de transporte" && element.subtipo_nome !== "1.3.Despesas de alimentacao")) ? +this.vintenove_saida_Outros + +element.valor : this.vintenove_saida_Outros;

              this.vintenove_saida_Total = element.tipo_nome == "1.Saida" ? +this.vintenove_saida_Total + +element.valor : this.vintenove_saida_Total;             

              vintenove_LancamentoConsolidado = new LancamentoConsolidado(
                element.dia,element.mes, this.vintenove_entrada_NUMERARIO, this.vintenove_entrada_POS, this.vintenove_entrada_MPesa, this.vintenove_entrada_Cheque, this.vintenove_entrada_Convenio,
                this.vintenove_entrada_Consulta, this.vintenove_entrada_Diagnostico, this.vintenove_entrada_Conduta, this.vintenove_entrada_Medicamento, this.vintenove_entrada_Total,
                this.vintenove_saida_Energia, this.vintenove_saida_Salario, this.vintenove_saida_Alimentacao, this.vintenove_saida_Transporte, this.vintenove_saida_Admnistrativas,
                this.vintenove_saida_Outros, this.vintenove_saida_Total);
              
              break;
            }

            case "30": {
              this.trinta_entrada_NUMERARIO = element.formaPagamento == "Numerário" ? +this.trinta_entrada_NUMERARIO + +element.valor : this.trinta_entrada_NUMERARIO;
              this.trinta_entrada_POS = element.formaPagamento == "POS" ? +this.trinta_entrada_POS + +element.valor : this.trinta_entrada_POS;
              this.trinta_entrada_MPesa = element.formaPagamento == "MPesa" ? +this.trinta_entrada_MPesa + +element.valor : this.trinta_entrada_MPesa;
              this.trinta_entrada_Cheque = element.formaPagamento == "Cheque" ? +this.trinta_entrada_Cheque + +element.valor : this.trinta_entrada_Cheque;
              this.trinta_entrada_Convenio= element.formaPagamento == "Convênio" ? +this.trinta_entrada_Convenio + +element.valor : this.trinta_entrada_Convenio;
              
              this.trinta_entrada_Consulta = element.plano_nome == "CONSULTA_MEDICA" ? +this.trinta_entrada_Consulta + +element.valor : this.trinta_entrada_Consulta;
              this.trinta_entrada_Diagnostico = element.plano_nome == "DIAGNOSTICO_AUX" ? +this.trinta_entrada_Diagnostico + +element.valor : this.trinta_entrada_Diagnostico;
              this.trinta_entrada_Conduta = element.plano_nome == "CONDUTA CLINICA" ? +this.trinta_entrada_Conduta + +element.valor : this.trinta_entrada_Conduta;
              this.trinta_entrada_Medicamento = element.plano_nome == "MEDICAMENTO" ? +this.trinta_entrada_Medicamento + +element.valor : this.trinta_entrada_Medicamento;

              this.trinta_entrada_Total = element.tipo_nome == "2.Entrada" ? +this.trinta_entrada_Total + +element.valor : this.trinta_entrada_Total;

              this.trinta_saida_Energia = (element.tipo_nome == "1.Saida" && element.plano_nome == "Energia") ? +this.trinta_saida_Energia + +element.valor : this.trinta_saida_Energia;
              this.trinta_saida_Salario = (element.tipo_nome == "1.Saida" && element.plano_nome == "Salario") ? +this.trinta_saida_Salario + +element.valor : this.trinta_saida_Salario;
              this.trinta_saida_Transporte = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && element.subtipo_nome == "1.2.Despesas de transporte") ? +this.trinta_saida_Transporte + +element.valor : this.trinta_saida_Transporte;
              this.trinta_saida_Alimentacao = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && element.subtipo_nome == "1.3.Despesas de alimentacao") ? +this.trinta_saida_Alimentacao + +element.valor : this.trinta_saida_Alimentacao;
              this.trinta_saida_Admnistrativas = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && element.subtipo_nome == "1.1.Despesas admnistrativas") ? +this.trinta_saida_Admnistrativas + +element.valor : this.trinta_saida_Admnistrativas;
              this.trinta_saida_Outros = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && (element.subtipo_nome !== "1.1.Despesas admnistrativas" && element.subtipo_nome !== "1.2.Despesas de transporte" && element.subtipo_nome !== "1.3.Despesas de alimentacao")) ? +this.trinta_saida_Outros + +element.valor : this.trinta_saida_Outros;

              this.trinta_saida_Total = element.tipo_nome == "1.Saida" ? +this.trinta_saida_Total + +element.valor : this.trinta_saida_Total;             

              trinta_LancamentoConsolidado = new LancamentoConsolidado(
                element.dia,element.mes, this.trinta_entrada_NUMERARIO, this.trinta_entrada_POS, this.trinta_entrada_MPesa, this.trinta_entrada_Cheque, this.trinta_entrada_Convenio,
                this.trinta_entrada_Consulta, this.trinta_entrada_Diagnostico, this.trinta_entrada_Conduta, this.trinta_entrada_Medicamento, this.trinta_entrada_Total,
                this.trinta_saida_Energia, this.trinta_saida_Salario, this.trinta_saida_Alimentacao, this.trinta_saida_Transporte, this.trinta_saida_Admnistrativas,
                this.trinta_saida_Outros, this.trinta_saida_Total);
              
              break;
            }

            case "31": {
              this.trintaum_entrada_NUMERARIO = element.formaPagamento == "Numerário" ? +this.trintaum_entrada_NUMERARIO + +element.valor : this.trintaum_entrada_NUMERARIO;
              this.trintaum_entrada_POS = element.formaPagamento == "POS" ? +this.trintaum_entrada_POS + +element.valor : this.trintaum_entrada_POS;
              this.trintaum_entrada_MPesa = element.formaPagamento == "MPesa" ? +this.trintaum_entrada_MPesa + +element.valor : this.trintaum_entrada_MPesa;
              this.trintaum_entrada_Cheque = element.formaPagamento == "Cheque" ? +this.trintaum_entrada_Cheque + +element.valor : this.trintaum_entrada_Cheque;
              this.trintaum_entrada_Convenio= element.formaPagamento == "Convênio" ? +this.trintaum_entrada_Convenio + +element.valor : this.trintaum_entrada_Convenio;
              
              this.trintaum_entrada_Consulta = element.plano_nome == "CONSULTA_MEDICA" ? +this.trintaum_entrada_Consulta + +element.valor : this.trintaum_entrada_Consulta;
              this.trintaum_entrada_Diagnostico = element.plano_nome == "DIAGNOSTICO_AUX" ? +this.trintaum_entrada_Diagnostico + +element.valor : this.trintaum_entrada_Diagnostico;
              this.trintaum_entrada_Conduta = element.plano_nome == "CONDUTA CLINICA" ? +this.trintaum_entrada_Conduta + +element.valor : this.trintaum_entrada_Conduta;
              this.trintaum_entrada_Medicamento = element.plano_nome == "MEDICAMENTO" ? +this.trintaum_entrada_Medicamento + +element.valor : this.trintaum_entrada_Medicamento;

              this.trintaum_entrada_Total = element.tipo_nome == "2.Entrada" ? +this.trintaum_entrada_Total + +element.valor : this.trintaum_entrada_Total;

              this.trintaum_saida_Energia = (element.tipo_nome == "1.Saida" && element.plano_nome == "Energia") ? +this.trintaum_saida_Energia + +element.valor : this.trintaum_saida_Energia;
              this.trintaum_saida_Salario = (element.tipo_nome == "1.Saida" && element.plano_nome == "Salario") ? +this.trintaum_saida_Salario + +element.valor : this.trintaum_saida_Salario;
              this.trintaum_saida_Transporte = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && element.subtipo_nome == "1.2.Despesas de transporte") ? +this.trintaum_saida_Transporte + +element.valor : this.trintaum_saida_Transporte;
              this.trintaum_saida_Alimentacao = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && element.subtipo_nome == "1.3.Despesas de alimentacao") ? +this.trintaum_saida_Alimentacao + +element.valor : this.trintaum_saida_Alimentacao;
              this.trintaum_saida_Admnistrativas = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && element.subtipo_nome == "1.1.Despesas admnistrativas") ? +this.trintaum_saida_Admnistrativas + +element.valor : this.trintaum_saida_Admnistrativas;
              this.trintaum_saida_Outros = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && (element.subtipo_nome !== "1.1.Despesas admnistrativas" && element.subtipo_nome !== "1.2.Despesas de transporte" && element.subtipo_nome !== "1.3.Despesas de alimentacao")) ? +this.trintaum_saida_Outros + +element.valor : this.trintaum_saida_Outros;

              this.trintaum_saida_Total = element.tipo_nome == "1.Saida" ? +this.trintaum_saida_Total + +element.valor : this.trintaum_saida_Total;             

              trintaum_LancamentoConsolidado = new LancamentoConsolidado(
                element.dia,element.mes, this.trintaum_entrada_NUMERARIO, this.trintaum_entrada_POS, this.trintaum_entrada_MPesa, this.trintaum_entrada_Cheque, this.trintaum_entrada_Convenio,
                this.trintaum_entrada_Consulta, this.trintaum_entrada_Diagnostico, this.trintaum_entrada_Conduta, this.trintaum_entrada_Medicamento, this.trintaum_entrada_Total,
                this.trintaum_saida_Energia, this.trintaum_saida_Salario, this.trintaum_saida_Alimentacao, this.trintaum_saida_Transporte, this.trintaum_saida_Admnistrativas,
                this.trintaum_saida_Outros, this.trintaum_saida_Total);
              break;
            }
            default: { 
               //statements; 
               break; 
            } 
          }
        });

        this.lancamentosConsolidados = [];
        this.lancamentosConsolidados.push(um_LancamentoConsolidado);
        this.lancamentosConsolidados.push(dois_LancamentoConsolidado);
        this.lancamentosConsolidados.push(tres_LancamentoConsolidado);
        this.lancamentosConsolidados.push(quatro_LancamentoConsolidado);
        this.lancamentosConsolidados.push(cinco_LancamentoConsolidado);
        this.lancamentosConsolidados.push(seis_LancamentoConsolidado);
        this.lancamentosConsolidados.push(sete_LancamentoConsolidado);
        this.lancamentosConsolidados.push(oito_LancamentoConsolidado);
        this.lancamentosConsolidados.push(nove_LancamentoConsolidado);
        this.lancamentosConsolidados.push(dez_LancamentoConsolidado);
        this.lancamentosConsolidados.push(onze_LancamentoConsolidado);
        this.lancamentosConsolidados.push(doze_LancamentoConsolidado);
        this.lancamentosConsolidados.push(treze_LancamentoConsolidado);
        this.lancamentosConsolidados.push(catorze_LancamentoConsolidado);
        this.lancamentosConsolidados.push(quinze_LancamentoConsolidado);
        this.lancamentosConsolidados.push(dezasseis_LancamentoConsolidado);
        this.lancamentosConsolidados.push(dezassete_LancamentoConsolidado);
        this.lancamentosConsolidados.push(dezoito_LancamentoConsolidado);
        this.lancamentosConsolidados.push(dezanove_LancamentoConsolidado);
        this.lancamentosConsolidados.push(vinte_LancamentoConsolidado);
        this.lancamentosConsolidados.push(vinteum_LancamentoConsolidado);
        this.lancamentosConsolidados.push(vintedois_LancamentoConsolidado);
        this.lancamentosConsolidados.push(vintetrez_LancamentoConsolidado);
        this.lancamentosConsolidados.push(vintequatro_LancamentoConsolidado);
        this.lancamentosConsolidados.push(vintecinco_LancamentoConsolidado);
        this.lancamentosConsolidados.push(vinteseis_LancamentoConsolidado);
        this.lancamentosConsolidados.push(vintesete_LancamentoConsolidado);
        this.lancamentosConsolidados.push(vinteoito_LancamentoConsolidado);
        this.lancamentosConsolidados.push(vintenove_LancamentoConsolidado);
        this.lancamentosConsolidados.push(trinta_LancamentoConsolidado);
        this.lancamentosConsolidados.push(trintaum_LancamentoConsolidado);

        //Farmacias
        if(this.acesso_indicadores3){
          this.dataSourseLancamentos=new MatTableDataSource(this.lancamentosConsolidados.sort((a, b) => a.dia > b.dia ? 1 : -1));
          setTimeout(()=> this.dataSourseLancamentos.paginator = this.paginatorLancamentos);
        }

        //Clinicas
        if(this.acesso_indicadores4){
          this.dataSourseLancamentos2=new MatTableDataSource(this.lancamentosConsolidados.sort((a, b) => a.dia > b.dia ? 1 : -1));
          setTimeout(()=> this.dataSourseLancamentos2.paginator = this.paginatorLancamentos2);
        }
      
      })

      
      
      
      




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


  this.configService.getLancamentos(this.ano, this.mes).snapshotChanges().subscribe(data => {
    this.lancamentos = data.map(e => {
      return {
        id: e.payload.key,
        ...e.payload.val(),
      } as Lancamento;
    })

    let um_LancamentoConsolidado = new LancamentoConsolidado(1,this.mes, 0, 0, 0, 0, 0,0, 0, 0, 0, 0, 0, 0, 0, 0, 0,0, 0);
    let dois_LancamentoConsolidado = new LancamentoConsolidado(2,this.mes, 0, 0, 0, 0, 0,0, 0, 0, 0, 0, 0, 0, 0, 0, 0,0, 0);
    let tres_LancamentoConsolidado = new LancamentoConsolidado(3,this.mes, 0, 0, 0, 0, 0,0, 0, 0, 0, 0, 0, 0, 0, 0, 0,0, 0);
    let quatro_LancamentoConsolidado = new LancamentoConsolidado(4,this.mes, 0, 0, 0, 0, 0,0, 0, 0, 0, 0, 0, 0, 0, 0, 0,0, 0);
    let cinco_LancamentoConsolidado = new LancamentoConsolidado(5,this.mes, 0, 0, 0, 0, 0,0, 0, 0, 0, 0, 0, 0, 0, 0, 0,0, 0);
    let seis_LancamentoConsolidado = new LancamentoConsolidado(6,this.mes, 0, 0, 0, 0, 0,0, 0, 0, 0, 0, 0, 0, 0, 0, 0,0, 0);
    let sete_LancamentoConsolidado = new LancamentoConsolidado(7,this.mes, 0, 0, 0, 0, 0,0, 0, 0, 0, 0, 0, 0, 0, 0, 0,0, 0);
    let oito_LancamentoConsolidado = new LancamentoConsolidado(8,this.mes, 0, 0, 0, 0, 0,0, 0, 0, 0, 0, 0, 0, 0, 0, 0,0, 0);
    let nove_LancamentoConsolidado = new LancamentoConsolidado(9,this.mes, 0, 0, 0, 0, 0,0, 0, 0, 0, 0, 0, 0, 0, 0, 0,0, 0);
    let dez_LancamentoConsolidado = new LancamentoConsolidado(10,this.mes, 0, 0, 0, 0, 0,0, 0, 0, 0, 0, 0, 0, 0, 0, 0,0, 0);
    let onze_LancamentoConsolidado = new LancamentoConsolidado(11,this.mes, 0, 0, 0, 0, 0,0, 0, 0, 0, 0, 0, 0, 0, 0, 0,0, 0);
    let doze_LancamentoConsolidado = new LancamentoConsolidado(12,this.mes, 0, 0, 0, 0, 0,0, 0, 0, 0, 0, 0, 0, 0, 0, 0,0, 0);
    let treze_LancamentoConsolidado = new LancamentoConsolidado(13,this.mes, 0, 0, 0, 0, 0,0, 0, 0, 0, 0, 0, 0, 0, 0, 0,0, 0);
    let catorze_LancamentoConsolidado = new LancamentoConsolidado(14,this.mes, 0, 0, 0, 0, 0,0, 0, 0, 0, 0, 0, 0, 0, 0, 0,0, 0);
    let quinze_LancamentoConsolidado = new LancamentoConsolidado(15,this.mes, 0, 0, 0, 0, 0,0, 0, 0, 0, 0, 0, 0, 0, 0, 0,0, 0);
    let dezasseis_LancamentoConsolidado = new LancamentoConsolidado(16,this.mes, 0, 0, 0, 0, 0,0, 0, 0, 0, 0, 0, 0, 0, 0, 0,0, 0);
    let dezassete_LancamentoConsolidado =  new LancamentoConsolidado(17,this.mes, 0, 0, 0, 0, 0,0, 0, 0, 0, 0, 0, 0, 0, 0, 0,0, 0);
    let dezoito_LancamentoConsolidado = new LancamentoConsolidado(18,this.mes, 0, 0, 0, 0, 0,0, 0, 0, 0, 0, 0, 0, 0, 0, 0,0, 0);
    let dezanove_LancamentoConsolidado = new LancamentoConsolidado(19,this.mes, 0, 0, 0, 0, 0,0, 0, 0, 0, 0, 0, 0, 0, 0, 0,0, 0);
    let vinte_LancamentoConsolidado = new LancamentoConsolidado(20,this.mes, 0, 0, 0, 0, 0,0, 0, 0, 0, 0, 0, 0, 0, 0, 0,0, 0);
    let vinteum_LancamentoConsolidado = new LancamentoConsolidado(21,this.mes, 0, 0, 0, 0, 0,0, 0, 0, 0, 0, 0, 0, 0, 0, 0,0, 0);
    let vintedois_LancamentoConsolidado = new LancamentoConsolidado(22,this.mes, 0, 0, 0, 0, 0,0, 0, 0, 0, 0, 0, 0, 0, 0, 0,0, 0);
    let vintetrez_LancamentoConsolidado = new LancamentoConsolidado(23,this.mes, 0, 0, 0, 0, 0,0, 0, 0, 0, 0, 0, 0, 0, 0, 0,0, 0);
    let vintequatro_LancamentoConsolidado = new LancamentoConsolidado(24,this.mes, 0, 0, 0, 0, 0,0, 0, 0, 0, 0, 0, 0, 0, 0, 0,0, 0);
    let vintecinco_LancamentoConsolidado = new LancamentoConsolidado(25,this.mes, 0, 0, 0, 0, 0,0, 0, 0, 0, 0, 0, 0, 0, 0, 0,0, 0);
    let vinteseis_LancamentoConsolidado = new LancamentoConsolidado(26,this.mes, 0, 0, 0, 0, 0,0, 0, 0, 0, 0, 0, 0, 0, 0, 0,0, 0);
    let vintesete_LancamentoConsolidado = new LancamentoConsolidado(27,this.mes, 0, 0, 0, 0, 0,0, 0, 0, 0, 0, 0, 0, 0, 0, 0,0, 0);
    let vinteoito_LancamentoConsolidado = new LancamentoConsolidado(28,this.mes, 0, 0, 0, 0, 0,0, 0, 0, 0, 0, 0, 0, 0, 0, 0,0, 0);
    let vintenove_LancamentoConsolidado = new LancamentoConsolidado(29,this.mes, 0, 0, 0, 0, 0,0, 0, 0, 0, 0, 0, 0, 0, 0, 0,0, 0);
    let trinta_LancamentoConsolidado = new LancamentoConsolidado(30,this.mes, 0, 0, 0, 0, 0,0, 0, 0, 0, 0, 0, 0, 0, 0, 0,0, 0);
    let trintaum_LancamentoConsolidado = new LancamentoConsolidado(31,this.mes, 0, 0, 0, 0, 0,0, 0, 0, 0, 0, 0, 0, 0, 0, 0,0, 0);

    this.resetDadosLancamentos();

    //let dia = new Date(element.data).toISOString().substr(8,2);

    this.lancamentos.forEach(element => {
      //let dia = new Date(element.data).toISOString().substr(8,2);

      switch(element.dia+"") {
        case "01": { 
          this.um_entrada_NUMERARIO = element.formaPagamento == "Numerário" ? +this.um_entrada_NUMERARIO + +element.valor : this.um_entrada_NUMERARIO;
          this.um_entrada_POS = element.formaPagamento == "POS" ? +this.um_entrada_POS + +element.valor : this.um_entrada_POS;
          this.um_entrada_MPesa = element.formaPagamento == "MPesa" ? +this.um_entrada_MPesa + +element.valor : this.um_entrada_MPesa;
          this.um_entrada_Cheque = element.formaPagamento == "Cheque" ? +this.um_entrada_Cheque + +element.valor : this.um_entrada_Cheque;
          this.um_entrada_Convenio= element.formaPagamento == "Convênio" ? +this.um_entrada_Convenio + +element.valor : this.um_entrada_Convenio;
          
          this.um_entrada_Consulta = element.plano_nome == "CONSULTA_MEDICA" ? +this.um_entrada_Consulta + +element.valor : this.um_entrada_Consulta;
          this.um_entrada_Diagnostico = element.plano_nome == "DIAGNOSTICO_AUX" ? +this.um_entrada_Diagnostico + +element.valor : this.um_entrada_Diagnostico;
          this.um_entrada_Conduta = element.plano_nome == "CONDUTA CLINICA" ? +this.um_entrada_Conduta + +element.valor : this.um_entrada_Conduta;
          this.um_entrada_Medicamento = element.plano_nome == "MEDICAMENTO" ? +this.um_entrada_Medicamento + +element.valor : this.um_entrada_Medicamento;

          this.um_entrada_Total = element.tipo_nome == "2.Entrada" ? +this.um_entrada_Total + +element.valor : this.um_entrada_Total;
          
          this.um_saida_Energia = (element.tipo_nome == "1.Saida" && element.plano_nome == "Energia") ? +this.um_saida_Energia + +element.valor : this.um_saida_Energia;
          this.um_saida_Salario = (element.tipo_nome == "1.Saida" && element.plano_nome == "Salario") ? +this.um_saida_Salario + +element.valor : this.um_saida_Salario;
          this.um_saida_Transporte = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && element.subtipo_nome == "1.2.Despesas de transporte") ? +this.um_saida_Transporte + +element.valor : this.um_saida_Transporte;
          this.um_saida_Alimentacao = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && element.subtipo_nome == "1.3.Despesas de alimentacao") ? +this.um_saida_Alimentacao + +element.valor : this.um_saida_Alimentacao;
          this.um_saida_Admnistrativas = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && element.subtipo_nome == "1.1.Despesas admnistrativas") ? +this.um_saida_Admnistrativas + +element.valor : this.um_saida_Admnistrativas;
          this.um_saida_Outros = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && (element.subtipo_nome !== "1.1.Despesas admnistrativas" && element.subtipo_nome !== "1.2.Despesas de transporte" && element.subtipo_nome !== "1.3.Despesas de alimentacao")) ? +this.um_saida_Outros + +element.valor : this.um_saida_Outros;
          
          this.um_saida_Total = element.tipo_nome == "1.Saida" ? +this.um_saida_Total + +element.valor : this.um_saida_Total;

          um_LancamentoConsolidado = new LancamentoConsolidado(
            element.dia, element.mes, this.um_entrada_NUMERARIO, this.um_entrada_POS, this.um_entrada_MPesa, this.um_entrada_Cheque, this.um_entrada_Convenio,
            this.um_entrada_Consulta, this.um_entrada_Diagnostico, this.um_entrada_Conduta, this.um_entrada_Medicamento, this.um_entrada_Total,
            this.um_saida_Energia, this.um_saida_Salario, this.um_saida_Alimentacao, this.um_saida_Transporte, this.um_saida_Admnistrativas,
            this.um_saida_Outros, this.um_saida_Total);
          break;
        } 
        case "02": {
          this.dois_entrada_NUMERARIO = element.formaPagamento == "Numerário" ? +this.dois_entrada_NUMERARIO + +element.valor : this.dois_entrada_NUMERARIO;
          this.dois_entrada_POS = element.formaPagamento == "POS" ? +this.dois_entrada_POS + +element.valor : this.dois_entrada_POS;
          this.dois_entrada_MPesa = element.formaPagamento == "MPesa" ? +this.dois_entrada_MPesa + +element.valor : this.dois_entrada_MPesa;
          this.dois_entrada_Cheque = element.formaPagamento == "Cheque" ? +this.dois_entrada_Cheque + +element.valor : this.dois_entrada_Cheque;
          this.dois_entrada_Convenio= element.formaPagamento == "Convênio" ? +this.dois_entrada_Convenio + +element.valor : this.dois_entrada_Convenio;
          
          this.dois_entrada_Consulta = element.plano_nome == "CONSULTA_MEDICA" ? +this.dois_entrada_Consulta + +element.valor : this.dois_entrada_Consulta;
          this.dois_entrada_Diagnostico = element.plano_nome == "DIAGNOSTICO_AUX" ? +this.dois_entrada_Diagnostico + +element.valor : this.dois_entrada_Diagnostico;
          this.dois_entrada_Conduta = element.plano_nome == "CONDUTA CLINICA" ? +this.dois_entrada_Conduta + +element.valor : this.dois_entrada_Conduta;
          this.dois_entrada_Medicamento = element.plano_nome == "MEDICAMENTO" ? +this.dois_entrada_Medicamento + +element.valor : this.dois_entrada_Medicamento;

          this.dois_entrada_Total = element.tipo_nome == "2.Entrada" ? +this.dois_entrada_Total + +element.valor : this.dois_entrada_Total;

          this.dois_saida_Energia = (element.tipo_nome == "1.Saida" && element.plano_nome == "Energia") ? +this.dois_saida_Energia + +element.valor : this.dois_saida_Energia;
          this.dois_saida_Salario = (element.tipo_nome == "1.Saida" && element.plano_nome == "Salario") ? +this.dois_saida_Salario + +element.valor : this.dois_saida_Salario;
          this.dois_saida_Transporte = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && element.subtipo_nome == "1.2.Despesas de transporte") ? +this.dois_saida_Transporte + +element.valor : this.dois_saida_Transporte;
          this.dois_saida_Alimentacao = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && element.subtipo_nome == "1.3.Despesas de alimentacao") ? +this.dois_saida_Alimentacao + +element.valor : this.dois_saida_Alimentacao;
          this.dois_saida_Admnistrativas = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && element.subtipo_nome == "1.1.Despesas admnistrativas") ? +this.dois_saida_Admnistrativas + +element.valor : this.dois_saida_Admnistrativas;
          this.dois_saida_Outros = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && (element.subtipo_nome !== "1.1.Despesas admnistrativas" && element.subtipo_nome !== "1.2.Despesas de transporte" && element.subtipo_nome !== "1.3.Despesas de alimentacao")) ? +this.dois_saida_Outros + +element.valor : this.dois_saida_Outros;

          this.dois_saida_Total = element.tipo_nome == "1.Saida" ? +this.dois_saida_Total + +element.valor : this.dois_saida_Total;             

          dois_LancamentoConsolidado = new LancamentoConsolidado(
            element.dia,element.mes, this.dois_entrada_NUMERARIO, this.dois_entrada_POS, this.dois_entrada_MPesa, this.dois_entrada_Cheque, this.dois_entrada_Convenio,
            this.dois_entrada_Consulta, this.dois_entrada_Diagnostico, this.dois_entrada_Conduta, this.dois_entrada_Medicamento, this.dois_entrada_Total,
            this.dois_saida_Energia, this.dois_saida_Salario, this.dois_saida_Alimentacao, this.dois_saida_Transporte, this.dois_saida_Admnistrativas,
            this.dois_saida_Outros, this.dois_saida_Total);
          break;
        }

        case "03": {
          this.tres_entrada_NUMERARIO = element.formaPagamento == "Numerário" ? +this.tres_entrada_NUMERARIO + +element.valor : this.tres_entrada_NUMERARIO;
          this.tres_entrada_POS = element.formaPagamento == "POS" ? +this.tres_entrada_POS + +element.valor : this.tres_entrada_POS;
          this.tres_entrada_MPesa = element.formaPagamento == "MPesa" ? +this.tres_entrada_MPesa + +element.valor : this.tres_entrada_MPesa;
          this.tres_entrada_Cheque = element.formaPagamento == "Cheque" ? +this.tres_entrada_Cheque + +element.valor : this.tres_entrada_Cheque;
          this.tres_entrada_Convenio= element.formaPagamento == "Convênio" ? +this.tres_entrada_Convenio + +element.valor : this.tres_entrada_Convenio;
         
          this.tres_entrada_Consulta = element.plano_nome == "CONSULTA_MEDICA" ? +this.tres_entrada_Consulta + +element.valor : this.tres_entrada_Consulta;
          this.tres_entrada_Diagnostico = element.plano_nome == "DIAGNOSTICO_AUX" ? +this.tres_entrada_Diagnostico + +element.valor : this.tres_entrada_Diagnostico;
          this.tres_entrada_Conduta = element.plano_nome == "CONDUTA CLINICA" ? +this.tres_entrada_Conduta + +element.valor : this.tres_entrada_Conduta;
          this.tres_entrada_Medicamento = element.plano_nome == "MEDICAMENTO" ? +this.tres_entrada_Medicamento + +element.valor : this.tres_entrada_Medicamento;

          this.tres_entrada_Total = element.tipo_nome == "2.Entrada" ? +this.tres_entrada_Total + +element.valor : this.tres_entrada_Total;

          this.tres_saida_Energia = (element.tipo_nome == "1.Saida" && element.plano_nome == "Energia") ? +this.tres_saida_Energia + +element.valor : this.tres_saida_Energia;
          this.tres_saida_Salario = (element.tipo_nome == "1.Saida" && element.plano_nome == "Salario") ? +this.tres_saida_Salario + +element.valor : this.tres_saida_Salario;
          this.tres_saida_Transporte = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && element.subtipo_nome == "1.2.Despesas de transporte") ? +this.tres_saida_Transporte + +element.valor : this.tres_saida_Transporte;
          this.tres_saida_Alimentacao = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && element.subtipo_nome == "1.3.Despesas de alimentacao") ? +this.tres_saida_Alimentacao + +element.valor : this.tres_saida_Alimentacao;
          this.tres_saida_Admnistrativas = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && element.subtipo_nome == "1.1.Despesas admnistrativas") ? +this.tres_saida_Admnistrativas + +element.valor : this.tres_saida_Admnistrativas;
          this.tres_saida_Outros = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && (element.subtipo_nome !== "1.1.Despesas admnistrativas" && element.subtipo_nome !== "1.2.Despesas de transporte" && element.subtipo_nome !== "1.3.Despesas de alimentacao")) ? +this.tres_saida_Outros + +element.valor : this.tres_saida_Outros;

          this.tres_saida_Total = element.tipo_nome == "1.Saida" ? +this.tres_saida_Total + +element.valor : this.tres_saida_Total;             

          tres_LancamentoConsolidado = new LancamentoConsolidado(
            element.dia,element.mes, this.tres_entrada_NUMERARIO, this.tres_entrada_POS, this.tres_entrada_MPesa, this.tres_entrada_Cheque, this.tres_entrada_Convenio,
            this.tres_entrada_Consulta, this.tres_entrada_Diagnostico, this.tres_entrada_Conduta, this.tres_entrada_Medicamento, this.tres_entrada_Total,
            this.tres_saida_Energia, this.tres_saida_Salario, this.tres_saida_Alimentacao, this.tres_saida_Transporte, this.tres_saida_Admnistrativas,
            this.tres_saida_Outros, this.tres_saida_Total);
         
          break;
        }
        
        case "04": {
          this.quatro_entrada_NUMERARIO = element.formaPagamento == "Numerário" ? +this.quatro_entrada_NUMERARIO + +element.valor : this.quatro_entrada_NUMERARIO;
          this.quatro_entrada_POS = element.formaPagamento == "POS" ? +this.quatro_entrada_POS + +element.valor : this.quatro_entrada_POS;
          this.quatro_entrada_MPesa = element.formaPagamento == "MPesa" ? +this.quatro_entrada_MPesa + +element.valor : this.quatro_entrada_MPesa;
          this.quatro_entrada_Cheque = element.formaPagamento == "Cheque" ? +this.quatro_entrada_Cheque + +element.valor : this.quatro_entrada_Cheque;
          this.quatro_entrada_Convenio= element.formaPagamento == "Convênio" ? +this.quatro_entrada_Convenio + +element.valor : this.quatro_entrada_Convenio;
          
          this.quatro_entrada_Consulta = element.plano_nome == "CONSULTA_MEDICA" ? +this.quatro_entrada_Consulta + +element.valor : this.quatro_entrada_Consulta;
          this.quatro_entrada_Diagnostico = element.plano_nome == "DIAGNOSTICO_AUX" ? +this.quatro_entrada_Diagnostico + +element.valor : this.quatro_entrada_Diagnostico;
          this.quatro_entrada_Conduta = element.plano_nome == "CONDUTA CLINICA" ? +this.quatro_entrada_Conduta + +element.valor : this.quatro_entrada_Conduta;
          this.quatro_entrada_Medicamento = element.plano_nome == "MEDICAMENTO" ? +this.quatro_entrada_Medicamento + +element.valor : this.quatro_entrada_Medicamento;

          this.quatro_entrada_Total = element.tipo_nome == "2.Entrada" ? +this.quatro_entrada_Total + +element.valor : this.quatro_entrada_Total;

          this.quatro_saida_Energia = (element.tipo_nome == "1.Saida" && element.plano_nome == "Energia") ? +this.quatro_saida_Energia + +element.valor : this.quatro_saida_Energia;
          this.quatro_saida_Salario = (element.tipo_nome == "1.Saida" && element.plano_nome == "Salario") ? +this.quatro_saida_Salario + +element.valor : this.quatro_saida_Salario;
          this.quatro_saida_Transporte = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && element.subtipo_nome == "1.2.Despesas de transporte") ? +this.quatro_saida_Transporte + +element.valor : this.quatro_saida_Transporte;
          this.quatro_saida_Alimentacao = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && element.subtipo_nome == "1.3.Despesas de alimentacao") ? +this.quatro_saida_Alimentacao + +element.valor : this.quatro_saida_Alimentacao;
          this.quatro_saida_Admnistrativas = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && element.subtipo_nome == "1.1.Despesas admnistrativas") ? +this.quatro_saida_Admnistrativas + +element.valor : this.quatro_saida_Admnistrativas;
          this.quatro_saida_Outros = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && (element.subtipo_nome !== "1.1.Despesas admnistrativas" && element.subtipo_nome !== "1.2.Despesas de transporte" && element.subtipo_nome !== "1.3.Despesas de alimentacao")) ? +this.quatro_saida_Outros + +element.valor : this.quatro_saida_Outros;

          this.quatro_saida_Total = element.tipo_nome == "1.Saida" ? +this.quatro_saida_Total + +element.valor : this.quatro_saida_Total;             

          quatro_LancamentoConsolidado = new LancamentoConsolidado(
            element.dia,element.mes, this.quatro_entrada_NUMERARIO, this.quatro_entrada_POS, this.quatro_entrada_MPesa, this.quatro_entrada_Cheque, this.quatro_entrada_Convenio,
            this.quatro_entrada_Consulta, this.quatro_entrada_Diagnostico, this.quatro_entrada_Conduta, this.quatro_entrada_Medicamento, this.quatro_entrada_Total,
            this.quatro_saida_Energia, this.quatro_saida_Salario, this.quatro_saida_Alimentacao, this.quatro_saida_Transporte, this.quatro_saida_Admnistrativas,
            this.quatro_saida_Outros, this.quatro_saida_Total);
          break;
        }

        case "05": {
          this.cinco_entrada_NUMERARIO = element.formaPagamento == "Numerário" ? +this.cinco_entrada_NUMERARIO + +element.valor : this.cinco_entrada_NUMERARIO;
          this.cinco_entrada_POS = element.formaPagamento == "POS" ? +this.cinco_entrada_POS + +element.valor : this.cinco_entrada_POS;
          this.cinco_entrada_MPesa = element.formaPagamento == "MPesa" ? +this.cinco_entrada_MPesa + +element.valor : this.cinco_entrada_MPesa;
          this.cinco_entrada_Cheque = element.formaPagamento == "Cheque" ? +this.cinco_entrada_Cheque + +element.valor : this.cinco_entrada_Cheque;
          this.cinco_entrada_Convenio= element.formaPagamento == "Convênio" ? +this.cinco_entrada_Convenio + +element.valor : this.cinco_entrada_Convenio;
          
          this.cinco_entrada_Consulta = element.plano_nome == "CONSULTA_MEDICA" ? +this.cinco_entrada_Consulta + +element.valor : this.cinco_entrada_Consulta;
          this.cinco_entrada_Diagnostico = element.plano_nome == "DIAGNOSTICO_AUX" ? +this.cinco_entrada_Diagnostico + +element.valor : this.cinco_entrada_Diagnostico;
          this.cinco_entrada_Conduta = element.plano_nome == "CONDUTA CLINICA" ? +this.cinco_entrada_Conduta + +element.valor : this.cinco_entrada_Conduta;
          this.cinco_entrada_Medicamento = element.plano_nome == "MEDICAMENTO" ? +this.cinco_entrada_Medicamento + +element.valor : this.cinco_entrada_Medicamento;

          this.cinco_entrada_Total = element.tipo_nome == "2.Entrada" ? +this.cinco_entrada_Total + +element.valor : this.cinco_entrada_Total;

          this.cinco_saida_Energia = (element.tipo_nome == "1.Saida" && element.plano_nome == "Energia") ? +this.cinco_saida_Energia + +element.valor : this.cinco_saida_Energia;
          this.cinco_saida_Salario = (element.tipo_nome == "1.Saida" && element.plano_nome == "Salario") ? +this.cinco_saida_Salario + +element.valor : this.cinco_saida_Salario;
          this.cinco_saida_Transporte = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && element.subtipo_nome == "1.2.Despesas de transporte") ? +this.cinco_saida_Transporte + +element.valor : this.cinco_saida_Transporte;
          this.cinco_saida_Alimentacao = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && element.subtipo_nome == "1.3.Despesas de alimentacao") ? +this.cinco_saida_Alimentacao + +element.valor : this.cinco_saida_Alimentacao;
          this.cinco_saida_Admnistrativas = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && element.subtipo_nome == "1.1.Despesas admnistrativas") ? +this.cinco_saida_Admnistrativas + +element.valor : this.cinco_saida_Admnistrativas;
          this.cinco_saida_Outros = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && (element.subtipo_nome !== "1.1.Despesas admnistrativas" && element.subtipo_nome !== "1.2.Despesas de transporte" && element.subtipo_nome !== "1.3.Despesas de alimentacao")) ? +this.cinco_saida_Outros + +element.valor : this.cinco_saida_Outros;

          this.cinco_saida_Total = element.tipo_nome == "1.Saida" ? +this.cinco_saida_Total + +element.valor : this.cinco_saida_Total;             

          cinco_LancamentoConsolidado = new LancamentoConsolidado(
            element.dia,element.mes, this.cinco_entrada_NUMERARIO, this.cinco_entrada_POS, this.cinco_entrada_MPesa, this.cinco_entrada_Cheque, this.cinco_entrada_Convenio,
            this.cinco_entrada_Consulta, this.cinco_entrada_Diagnostico, this.cinco_entrada_Conduta, this.cinco_entrada_Medicamento, this.cinco_entrada_Total,
            this.cinco_saida_Energia, this.cinco_saida_Salario, this.cinco_saida_Alimentacao, this.cinco_saida_Transporte, this.cinco_saida_Admnistrativas,
            this.cinco_saida_Outros, this.cinco_saida_Total);
          break;
        }

        case "06": {
          this.seis_entrada_NUMERARIO = element.formaPagamento == "Numerário" ? +this.seis_entrada_NUMERARIO + +element.valor : this.seis_entrada_NUMERARIO;
          this.seis_entrada_POS = element.formaPagamento == "POS" ? +this.seis_entrada_POS + +element.valor : this.seis_entrada_POS;
          this.seis_entrada_MPesa = element.formaPagamento == "MPesa" ? +this.seis_entrada_MPesa + +element.valor : this.seis_entrada_MPesa;
          this.seis_entrada_Cheque = element.formaPagamento == "Cheque" ? +this.seis_entrada_Cheque + +element.valor : this.seis_entrada_Cheque;
          this.seis_entrada_Convenio= element.formaPagamento == "Convênio" ? +this.seis_entrada_Convenio + +element.valor : this.seis_entrada_Convenio;
          
          this.seis_entrada_Consulta = element.plano_nome == "CONSULTA_MEDICA" ? +this.seis_entrada_Consulta + +element.valor : this.seis_entrada_Consulta;
          this.seis_entrada_Diagnostico = element.plano_nome == "DIAGNOSTICO_AUX" ? +this.seis_entrada_Diagnostico + +element.valor : this.seis_entrada_Diagnostico;
          this.seis_entrada_Conduta = element.plano_nome == "CONDUTA CLINICA" ? +this.seis_entrada_Conduta + +element.valor : this.seis_entrada_Conduta;
          this.seis_entrada_Medicamento = element.plano_nome == "MEDICAMENTO" ? +this.seis_entrada_Medicamento + +element.valor : this.seis_entrada_Medicamento;

          this.seis_entrada_Total = element.tipo_nome == "2.Entrada" ? +this.seis_entrada_Total + +element.valor : this.seis_entrada_Total;

          this.seis_saida_Energia = (element.tipo_nome == "1.Saida" && element.plano_nome == "Energia") ? +this.seis_saida_Energia + +element.valor : this.seis_saida_Energia;
          this.seis_saida_Salario = (element.tipo_nome == "1.Saida" && element.plano_nome == "Salario") ? +this.seis_saida_Salario + +element.valor : this.seis_saida_Salario;
          this.seis_saida_Transporte = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && element.subtipo_nome == "1.2.Despesas de transporte") ? +this.seis_saida_Transporte + +element.valor : this.seis_saida_Transporte;
          this.seis_saida_Alimentacao = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && element.subtipo_nome == "1.3.Despesas de alimentacao") ? +this.seis_saida_Alimentacao + +element.valor : this.seis_saida_Alimentacao;
          this.seis_saida_Admnistrativas = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && element.subtipo_nome == "1.1.Despesas admnistrativas") ? +this.seis_saida_Admnistrativas + +element.valor : this.seis_saida_Admnistrativas;
          this.seis_saida_Outros = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && (element.subtipo_nome !== "1.1.Despesas admnistrativas" && element.subtipo_nome !== "1.2.Despesas de transporte" && element.subtipo_nome !== "1.3.Despesas de alimentacao")) ? +this.seis_saida_Outros + +element.valor : this.seis_saida_Outros;

          this.seis_saida_Total = element.tipo_nome == "1.Saida" ? +this.seis_saida_Total + +element.valor : this.seis_saida_Total;             

          seis_LancamentoConsolidado = new LancamentoConsolidado(
            element.dia,element.mes, this.seis_entrada_NUMERARIO, this.seis_entrada_POS, this.seis_entrada_MPesa, this.seis_entrada_Cheque, this.seis_entrada_Convenio,
            this.seis_entrada_Consulta, this.seis_entrada_Diagnostico, this.seis_entrada_Conduta, this.seis_entrada_Medicamento, this.seis_entrada_Total,
            this.seis_saida_Energia, this.seis_saida_Salario, this.seis_saida_Alimentacao, this.seis_saida_Transporte, this.seis_saida_Admnistrativas,
            this.seis_saida_Outros, this.seis_saida_Total);
          break;
        }

        case "07": {
          this.sete_entrada_NUMERARIO = element.formaPagamento == "Numerário" ? +this.sete_entrada_NUMERARIO + +element.valor : this.sete_entrada_NUMERARIO;
          this.sete_entrada_POS = element.formaPagamento == "POS" ? +this.sete_entrada_POS + +element.valor : this.sete_entrada_POS;
          this.sete_entrada_MPesa = element.formaPagamento == "MPesa" ? +this.sete_entrada_MPesa + +element.valor : this.sete_entrada_MPesa;
          this.sete_entrada_Cheque = element.formaPagamento == "Cheque" ? +this.sete_entrada_Cheque + +element.valor : this.sete_entrada_Cheque;
          this.sete_entrada_Convenio= element.formaPagamento == "Convênio" ? +this.sete_entrada_Convenio + +element.valor : this.sete_entrada_Convenio;
          
          this.sete_entrada_Consulta = element.plano_nome == "CONSULTA_MEDICA" ? +this.sete_entrada_Consulta + +element.valor : this.sete_entrada_Consulta;
          this.sete_entrada_Diagnostico = element.plano_nome == "DIAGNOSTICO_AUX" ? +this.sete_entrada_Diagnostico + +element.valor : this.sete_entrada_Diagnostico;
          this.sete_entrada_Conduta = element.plano_nome == "CONDUTA CLINICA" ? +this.sete_entrada_Conduta + +element.valor : this.sete_entrada_Conduta;
          this.sete_entrada_Medicamento = element.plano_nome == "MEDICAMENTO" ? +this.sete_entrada_Medicamento + +element.valor : this.sete_entrada_Medicamento;

          this.sete_entrada_Total = element.tipo_nome == "2.Entrada" ? +this.sete_entrada_Total + +element.valor : this.sete_entrada_Total;

          this.sete_saida_Energia = (element.tipo_nome == "1.Saida" && element.plano_nome == "Energia") ? +this.sete_saida_Energia + +element.valor : this.sete_saida_Energia;
          this.sete_saida_Salario = (element.tipo_nome == "1.Saida" && element.plano_nome == "Salario") ? +this.sete_saida_Salario + +element.valor : this.sete_saida_Salario;
          this.sete_saida_Transporte = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && element.subtipo_nome == "1.2.Despesas de transporte") ? +this.sete_saida_Transporte + +element.valor : this.sete_saida_Transporte;
          this.sete_saida_Alimentacao = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && element.subtipo_nome == "1.3.Despesas de alimentacao") ? +this.sete_saida_Alimentacao + +element.valor : this.sete_saida_Alimentacao;
          this.sete_saida_Admnistrativas = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && element.subtipo_nome == "1.1.Despesas admnistrativas") ? +this.sete_saida_Admnistrativas + +element.valor : this.sete_saida_Admnistrativas;
          this.sete_saida_Outros = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && (element.subtipo_nome !== "1.1.Despesas admnistrativas" && element.subtipo_nome !== "1.2.Despesas de transporte" && element.subtipo_nome !== "1.3.Despesas de alimentacao")) ? +this.sete_saida_Outros + +element.valor : this.sete_saida_Outros;

          this.sete_saida_Total = element.tipo_nome == "1.Saida" ? +this.sete_saida_Total + +element.valor : this.sete_saida_Total;             

          sete_LancamentoConsolidado = new LancamentoConsolidado(
            element.dia,element.mes, this.sete_entrada_NUMERARIO, this.sete_entrada_POS, this.sete_entrada_MPesa, this.sete_entrada_Cheque, this.sete_entrada_Convenio,
            this.sete_entrada_Consulta, this.sete_entrada_Diagnostico, this.sete_entrada_Conduta, this.sete_entrada_Medicamento, this.sete_entrada_Total,
            this.sete_saida_Energia, this.sete_saida_Salario, this.sete_saida_Alimentacao, this.sete_saida_Transporte, this.sete_saida_Admnistrativas,
            this.sete_saida_Outros, this.sete_saida_Total);
          break;
        }

        case "08": {
          this.oito_entrada_NUMERARIO = element.formaPagamento == "Numerário" ? +this.oito_entrada_NUMERARIO + +element.valor : this.oito_entrada_NUMERARIO;
          this.oito_entrada_POS = element.formaPagamento == "POS" ? +this.oito_entrada_POS + +element.valor : this.oito_entrada_POS;
          this.oito_entrada_MPesa = element.formaPagamento == "MPesa" ? +this.oito_entrada_MPesa + +element.valor : this.oito_entrada_MPesa;
          this.oito_entrada_Cheque = element.formaPagamento == "Cheque" ? +this.oito_entrada_Cheque + +element.valor : this.oito_entrada_Cheque;
          this.oito_entrada_Convenio= element.formaPagamento == "Convênio" ? +this.oito_entrada_Convenio + +element.valor : this.oito_entrada_Convenio;
          
          this.oito_entrada_Consulta = element.plano_nome == "CONSULTA_MEDICA" ? +this.oito_entrada_Consulta + +element.valor : this.oito_entrada_Consulta;
          this.oito_entrada_Diagnostico = element.plano_nome == "DIAGNOSTICO_AUX" ? +this.oito_entrada_Diagnostico + +element.valor : this.oito_entrada_Diagnostico;
          this.oito_entrada_Conduta = element.plano_nome == "CONDUTA CLINICA" ? +this.oito_entrada_Conduta + +element.valor : this.oito_entrada_Conduta;
          this.oito_entrada_Medicamento = element.plano_nome == "MEDICAMENTO" ? +this.oito_entrada_Medicamento + +element.valor : this.oito_entrada_Medicamento;

          this.oito_entrada_Total = element.tipo_nome == "2.Entrada" ? +this.oito_entrada_Total + +element.valor : this.oito_entrada_Total;

          this.oito_saida_Energia = (element.tipo_nome == "1.Saida" && element.plano_nome == "Energia") ? +this.oito_saida_Energia + +element.valor : this.oito_saida_Energia;
          this.oito_saida_Salario = (element.tipo_nome == "1.Saida" && element.plano_nome == "Salario") ? +this.oito_saida_Salario + +element.valor : this.oito_saida_Salario;
          this.oito_saida_Transporte = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && element.subtipo_nome == "1.2.Despesas de transporte") ? +this.oito_saida_Transporte + +element.valor : this.oito_saida_Transporte;
          this.oito_saida_Alimentacao = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && element.subtipo_nome == "1.3.Despesas de alimentacao") ? +this.oito_saida_Alimentacao + +element.valor : this.oito_saida_Alimentacao;
          this.oito_saida_Admnistrativas = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && element.subtipo_nome == "1.1.Despesas admnistrativas") ? +this.oito_saida_Admnistrativas + +element.valor : this.oito_saida_Admnistrativas;
          this.oito_saida_Outros = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && (element.subtipo_nome !== "1.1.Despesas admnistrativas" && element.subtipo_nome !== "1.2.Despesas de transporte" && element.subtipo_nome !== "1.3.Despesas de alimentacao")) ? +this.oito_saida_Outros + +element.valor : this.oito_saida_Outros;

          this.oito_saida_Total = element.tipo_nome == "1.Saida" ? +this.oito_saida_Total + +element.valor : this.oito_saida_Total;             

          oito_LancamentoConsolidado = new LancamentoConsolidado(
            element.dia,element.mes, this.oito_entrada_NUMERARIO, this.oito_entrada_POS, this.oito_entrada_MPesa, this.oito_entrada_Cheque, this.oito_entrada_Convenio,
            this.oito_entrada_Consulta, this.oito_entrada_Diagnostico, this.oito_entrada_Conduta, this.oito_entrada_Medicamento, this.oito_entrada_Total,
            this.oito_saida_Energia, this.oito_saida_Salario, this.oito_saida_Alimentacao, this.oito_saida_Transporte, this.oito_saida_Admnistrativas,
            this.oito_saida_Outros, this.oito_saida_Total);
          break;
        }

        case "09": {
          this.nove_entrada_NUMERARIO = element.formaPagamento == "Numerário" ? +this.nove_entrada_NUMERARIO + +element.valor : this.nove_entrada_NUMERARIO;
          this.nove_entrada_POS = element.formaPagamento == "POS" ? +this.nove_entrada_POS + +element.valor : this.nove_entrada_POS;
          this.nove_entrada_MPesa = element.formaPagamento == "MPesa" ? +this.nove_entrada_MPesa + +element.valor : this.nove_entrada_MPesa;
          this.nove_entrada_Cheque = element.formaPagamento == "Cheque" ? +this.nove_entrada_Cheque + +element.valor : this.nove_entrada_Cheque;
          this.nove_entrada_Convenio= element.formaPagamento == "Convênio" ? +this.nove_entrada_Convenio + +element.valor : this.nove_entrada_Convenio;
          
          this.nove_entrada_Consulta = element.plano_nome == "CONSULTA_MEDICA" ? +this.nove_entrada_Consulta + +element.valor : this.nove_entrada_Consulta;
          this.nove_entrada_Diagnostico = element.plano_nome == "DIAGNOSTICO_AUX" ? +this.nove_entrada_Diagnostico + +element.valor : this.nove_entrada_Diagnostico;
          this.nove_entrada_Conduta = element.plano_nome == "CONDUTA CLINICA" ? +this.nove_entrada_Conduta + +element.valor : this.nove_entrada_Conduta;
          this.nove_entrada_Medicamento = element.plano_nome == "MEDICAMENTO" ? +this.nove_entrada_Medicamento + +element.valor : this.nove_entrada_Medicamento;

          this.nove_entrada_Total = element.tipo_nome == "2.Entrada" ? +this.nove_entrada_Total + +element.valor : this.nove_entrada_Total;

          this.nove_saida_Energia = (element.tipo_nome == "1.Saida" && element.plano_nome == "Energia") ? +this.nove_saida_Energia + +element.valor : this.nove_saida_Energia;
          this.nove_saida_Salario = (element.tipo_nome == "1.Saida" && element.plano_nome == "Salario") ? +this.nove_saida_Salario + +element.valor : this.nove_saida_Salario;
          this.nove_saida_Transporte = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && element.subtipo_nome == "1.2.Despesas de transporte") ? +this.nove_saida_Transporte + +element.valor : this.nove_saida_Transporte;
          this.nove_saida_Alimentacao = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && element.subtipo_nome == "1.3.Despesas de alimentacao") ? +this.nove_saida_Alimentacao + +element.valor : this.nove_saida_Alimentacao;
          this.nove_saida_Admnistrativas = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && element.subtipo_nome == "1.1.Despesas admnistrativas") ? +this.nove_saida_Admnistrativas + +element.valor : this.nove_saida_Admnistrativas;
          this.nove_saida_Outros = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && (element.subtipo_nome !== "1.1.Despesas admnistrativas" && element.subtipo_nome !== "1.2.Despesas de transporte" && element.subtipo_nome !== "1.3.Despesas de alimentacao")) ? +this.nove_saida_Outros + +element.valor : this.nove_saida_Outros;

          this.nove_saida_Total = element.tipo_nome == "1.Saida" ? +this.nove_saida_Total + +element.valor : this.nove_saida_Total;             

          nove_LancamentoConsolidado = new LancamentoConsolidado(
            element.dia,element.mes, this.nove_entrada_NUMERARIO, this.nove_entrada_POS, this.nove_entrada_MPesa, this.nove_entrada_Cheque, this.nove_entrada_Convenio,
            this.nove_entrada_Consulta, this.nove_entrada_Diagnostico, this.nove_entrada_Conduta, this.nove_entrada_Medicamento, this.nove_entrada_Total,
            this.nove_saida_Energia, this.nove_saida_Salario, this.nove_saida_Alimentacao, this.nove_saida_Transporte, this.nove_saida_Admnistrativas,
            this.nove_saida_Outros, this.nove_saida_Total);
          break;
        }

        case "10": {
          this.dez_entrada_NUMERARIO = element.formaPagamento == "Numerário" ? +this.dez_entrada_NUMERARIO + +element.valor : this.dez_entrada_NUMERARIO;
          this.dez_entrada_POS = element.formaPagamento == "POS" ? +this.dez_entrada_POS + +element.valor : this.dez_entrada_POS;
          this.dez_entrada_MPesa = element.formaPagamento == "MPesa" ? +this.dez_entrada_MPesa + +element.valor : this.dez_entrada_MPesa;
          this.dez_entrada_Cheque = element.formaPagamento == "Cheque" ? +this.dez_entrada_Cheque + +element.valor : this.dez_entrada_Cheque;
          this.dez_entrada_Convenio= element.formaPagamento == "Convênio" ? +this.dez_entrada_Convenio + +element.valor : this.dez_entrada_Convenio;
          
          this.dez_entrada_Consulta = element.plano_nome == "CONSULTA_MEDICA" ? +this.dez_entrada_Consulta + +element.valor : this.dez_entrada_Consulta;
          this.dez_entrada_Diagnostico = element.plano_nome == "DIAGNOSTICO_AUX" ? +this.dez_entrada_Diagnostico + +element.valor : this.dez_entrada_Diagnostico;
          this.dez_entrada_Conduta = element.plano_nome == "CONDUTA CLINICA" ? +this.dez_entrada_Conduta + +element.valor : this.dez_entrada_Conduta;
          this.dez_entrada_Medicamento = element.plano_nome == "MEDICAMENTO" ? +this.dez_entrada_Medicamento + +element.valor : this.dez_entrada_Medicamento;

          this.dez_entrada_Total = element.tipo_nome == "2.Entrada" ? +this.dez_entrada_Total + +element.valor : this.dez_entrada_Total;

          this.dez_saida_Energia = (element.tipo_nome == "1.Saida" && element.plano_nome == "Energia") ? +this.dez_saida_Energia + +element.valor : this.dez_saida_Energia;
          this.dez_saida_Salario = (element.tipo_nome == "1.Saida" && element.plano_nome == "Salario") ? +this.dez_saida_Salario + +element.valor : this.dez_saida_Salario;
          this.dez_saida_Transporte = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && element.subtipo_nome == "1.2.Despesas de transporte") ? +this.dez_saida_Transporte + +element.valor : this.dez_saida_Transporte;
          this.dez_saida_Alimentacao = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && element.subtipo_nome == "1.3.Despesas de alimentacao") ? +this.dez_saida_Alimentacao + +element.valor : this.dez_saida_Alimentacao;
          this.dez_saida_Admnistrativas = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && element.subtipo_nome == "1.1.Despesas admnistrativas") ? +this.dez_saida_Admnistrativas + +element.valor : this.dez_saida_Admnistrativas;
          this.dez_saida_Outros = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && (element.subtipo_nome !== "1.1.Despesas admnistrativas" && element.subtipo_nome !== "1.2.Despesas de transporte" && element.subtipo_nome !== "1.3.Despesas de alimentacao")) ? +this.dez_saida_Outros + +element.valor : this.dez_saida_Outros;

          this.dez_saida_Total = element.tipo_nome == "1.Saida" ? +this.dez_saida_Total + +element.valor : this.dez_saida_Total;             

          dez_LancamentoConsolidado = new LancamentoConsolidado(
            element.dia,element.mes, this.dez_entrada_NUMERARIO, this.dez_entrada_POS, this.dez_entrada_MPesa, this.dez_entrada_Cheque, this.dez_entrada_Convenio,
            this.dez_entrada_Consulta, this.dez_entrada_Diagnostico, this.dez_entrada_Conduta, this.dez_entrada_Medicamento, this.dez_entrada_Total,
            this.dez_saida_Energia, this.dez_saida_Salario, this.dez_saida_Alimentacao, this.dez_saida_Transporte, this.dez_saida_Admnistrativas,
            this.dez_saida_Outros, this.dez_saida_Total);
          break;
        }

        case "11": {
          this.onze_entrada_NUMERARIO = element.formaPagamento == "Numerário" ? +this.onze_entrada_NUMERARIO + +element.valor : this.onze_entrada_NUMERARIO;
          this.onze_entrada_POS = element.formaPagamento == "POS" ? +this.onze_entrada_POS + +element.valor : this.onze_entrada_POS;
          this.onze_entrada_MPesa = element.formaPagamento == "MPesa" ? +this.onze_entrada_MPesa + +element.valor : this.onze_entrada_MPesa;
          this.onze_entrada_Cheque = element.formaPagamento == "Cheque" ? +this.onze_entrada_Cheque + +element.valor : this.onze_entrada_Cheque;
          this.onze_entrada_Convenio= element.formaPagamento == "Convênio" ? +this.onze_entrada_Convenio + +element.valor : this.onze_entrada_Convenio;
          
          this.onze_entrada_Consulta = element.plano_nome == "CONSULTA_MEDICA" ? +this.onze_entrada_Consulta + +element.valor : this.onze_entrada_Consulta;
         this.onze_entrada_Diagnostico = element.plano_nome == "DIAGNOSTICO_AUX" ? +this.onze_entrada_Diagnostico + +element.valor : this.onze_entrada_Diagnostico;
          this.onze_entrada_Conduta = element.plano_nome == "CONDUTA CLINICA" ? +this.onze_entrada_Conduta + +element.valor : this.onze_entrada_Conduta;
          this.onze_entrada_Medicamento = element.plano_nome == "MEDICAMENTO" ? +this.onze_entrada_Medicamento + +element.valor : this.onze_entrada_Medicamento;

          this.onze_entrada_Total = element.tipo_nome == "2.Entrada" ? +this.onze_entrada_Total + +element.valor : this.onze_entrada_Total;

          this.onze_saida_Energia = (element.tipo_nome == "1.Saida" && element.plano_nome == "Energia") ? +this.onze_saida_Energia + +element.valor : this.onze_saida_Energia;
          this.onze_saida_Salario = (element.tipo_nome == "1.Saida" && element.plano_nome == "Salario") ? +this.onze_saida_Salario + +element.valor : this.onze_saida_Salario;
          this.onze_saida_Transporte = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && element.subtipo_nome == "1.2.Despesas de transporte") ? +this.onze_saida_Transporte + +element.valor : this.onze_saida_Transporte;
          this.onze_saida_Alimentacao = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && element.subtipo_nome == "1.3.Despesas de alimentacao") ? +this.onze_saida_Alimentacao + +element.valor : this.onze_saida_Alimentacao;
          this.onze_saida_Admnistrativas = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && element.subtipo_nome == "1.1.Despesas admnistrativas") ? +this.onze_saida_Admnistrativas + +element.valor : this.onze_saida_Admnistrativas;
          this.onze_saida_Outros = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && (element.subtipo_nome !== "1.1.Despesas admnistrativas" && element.subtipo_nome !== "1.2.Despesas de transporte" && element.subtipo_nome !== "1.3.Despesas de alimentacao")) ? +this.onze_saida_Outros + +element.valor : this.onze_saida_Outros;

          this.onze_saida_Total = element.tipo_nome == "1.Saida" ? +this.onze_saida_Total + +element.valor : this.onze_saida_Total;             

          onze_LancamentoConsolidado = new LancamentoConsolidado(
            element.dia,element.mes, this.onze_entrada_NUMERARIO, this.onze_entrada_POS, this.onze_entrada_MPesa, this.onze_entrada_Cheque, this.onze_entrada_Convenio,
            this.onze_entrada_Consulta, this.onze_entrada_Diagnostico, this.onze_entrada_Conduta, this.onze_entrada_Medicamento, this.onze_entrada_Total,
            this.onze_saida_Energia, this.onze_saida_Salario, this.onze_saida_Alimentacao, this.onze_saida_Transporte, this.onze_saida_Admnistrativas,
            this.onze_saida_Outros, this.onze_saida_Total);
          break;
        }

        case "12": {
          this.doze_entrada_NUMERARIO = element.formaPagamento == "Numerário" ? +this.doze_entrada_NUMERARIO + +element.valor : this.doze_entrada_NUMERARIO;
          this.doze_entrada_POS = element.formaPagamento == "POS" ? +this.doze_entrada_POS + +element.valor : this.doze_entrada_POS;
          this.doze_entrada_MPesa = element.formaPagamento == "MPesa" ? +this.doze_entrada_MPesa + +element.valor : this.doze_entrada_MPesa;
          this.doze_entrada_Cheque = element.formaPagamento == "Cheque" ? +this.doze_entrada_Cheque + +element.valor : this.doze_entrada_Cheque;
          this.doze_entrada_Convenio= element.formaPagamento == "Convênio" ? +this.doze_entrada_Convenio + +element.valor : this.doze_entrada_Convenio;
          
          this.doze_entrada_Consulta = element.plano_nome == "CONSULTA_MEDICA" ? +this.doze_entrada_Consulta + +element.valor : this.doze_entrada_Consulta;
          this.doze_entrada_Diagnostico = element.plano_nome == "DIAGNOSTICO_AUX" ? +this.doze_entrada_Diagnostico + +element.valor : this.doze_entrada_Diagnostico;
          this.doze_entrada_Conduta = element.plano_nome == "CONDUTA CLINICA" ? +this.doze_entrada_Conduta + +element.valor : this.doze_entrada_Conduta;
          this.doze_entrada_Medicamento = element.plano_nome == "MEDICAMENTO" ? +this.doze_entrada_Medicamento + +element.valor : this.doze_entrada_Medicamento;

          this.doze_entrada_Total = element.tipo_nome == "2.Entrada" ? +this.doze_entrada_Total + +element.valor : this.doze_entrada_Total;

          this.doze_saida_Energia = (element.tipo_nome == "1.Saida" && element.plano_nome == "Energia") ? +this.doze_saida_Energia + +element.valor : this.doze_saida_Energia;
          this.doze_saida_Salario = (element.tipo_nome == "1.Saida" && element.plano_nome == "Salario") ? +this.doze_saida_Salario + +element.valor : this.doze_saida_Salario;
          this.doze_saida_Transporte = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && element.subtipo_nome == "1.2.Despesas de transporte") ? +this.doze_saida_Transporte + +element.valor : this.doze_saida_Transporte;
          this.doze_saida_Alimentacao = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && element.subtipo_nome == "1.3.Despesas de alimentacao") ? +this.doze_saida_Alimentacao + +element.valor : this.doze_saida_Alimentacao;
          this.doze_saida_Admnistrativas = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && element.subtipo_nome == "1.1.Despesas admnistrativas") ? +this.doze_saida_Admnistrativas + +element.valor : this.doze_saida_Admnistrativas;
          this.doze_saida_Outros = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && (element.subtipo_nome !== "1.1.Despesas admnistrativas" && element.subtipo_nome !== "1.2.Despesas de transporte" && element.subtipo_nome !== "1.3.Despesas de alimentacao")) ? +this.doze_saida_Outros + +element.valor : this.doze_saida_Outros;

          this.doze_saida_Total = element.tipo_nome == "1.Saida" ? +this.doze_saida_Total + +element.valor : this.doze_saida_Total;             

          doze_LancamentoConsolidado = new LancamentoConsolidado(
            element.dia,element.mes, this.doze_entrada_NUMERARIO, this.doze_entrada_POS, this.doze_entrada_MPesa, this.doze_entrada_Cheque, this.doze_entrada_Convenio,
            this.doze_entrada_Consulta, this.doze_entrada_Diagnostico, this.doze_entrada_Conduta, this.doze_entrada_Medicamento, this.doze_entrada_Total,
            this.doze_saida_Energia, this.doze_saida_Salario, this.doze_saida_Alimentacao, this.doze_saida_Transporte, this.doze_saida_Admnistrativas,
            this.doze_saida_Outros, this.doze_saida_Total);
          break;
        }

        case "13": {
          this.treze_entrada_NUMERARIO = element.formaPagamento == "Numerário" ? +this.treze_entrada_NUMERARIO + +element.valor : this.treze_entrada_NUMERARIO;
          this.treze_entrada_POS = element.formaPagamento == "POS" ? +this.treze_entrada_POS + +element.valor : this.treze_entrada_POS;
          this.treze_entrada_MPesa = element.formaPagamento == "MPesa" ? +this.treze_entrada_MPesa + +element.valor : this.treze_entrada_MPesa;
          this.treze_entrada_Cheque = element.formaPagamento == "Cheque" ? +this.treze_entrada_Cheque + +element.valor : this.treze_entrada_Cheque;
          this.treze_entrada_Convenio= element.formaPagamento == "Convênio" ? +this.treze_entrada_Convenio + +element.valor : this.treze_entrada_Convenio;
          
          this.treze_entrada_Consulta = element.plano_nome == "CONSULTA_MEDICA" ? +this.treze_entrada_Consulta + +element.valor : this.treze_entrada_Consulta;
          this.treze_entrada_Diagnostico = element.plano_nome == "DIAGNOSTICO_AUX" ? +this.treze_entrada_Diagnostico + +element.valor : this.treze_entrada_Diagnostico;
          this.treze_entrada_Conduta = element.plano_nome == "CONDUTA CLINICA" ? +this.treze_entrada_Conduta + +element.valor : this.treze_entrada_Conduta;
          this.treze_entrada_Medicamento = element.plano_nome == "MEDICAMENTO" ? +this.treze_entrada_Medicamento + +element.valor : this.treze_entrada_Medicamento;

          this.treze_entrada_Total = element.tipo_nome == "2.Entrada" ? +this.treze_entrada_Total + +element.valor : this.treze_entrada_Total;

          this.treze_saida_Energia = (element.tipo_nome == "1.Saida" && element.plano_nome == "Energia") ? +this.treze_saida_Energia + +element.valor : this.treze_saida_Energia;
          this.treze_saida_Salario = (element.tipo_nome == "1.Saida" && element.plano_nome == "Salario") ? +this.treze_saida_Salario + +element.valor : this.treze_saida_Salario;
          this.treze_saida_Transporte = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && element.subtipo_nome == "1.2.Despesas de transporte") ? +this.treze_saida_Transporte + +element.valor : this.treze_saida_Transporte;
          this.treze_saida_Alimentacao = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && element.subtipo_nome == "1.3.Despesas de alimentacao") ? +this.treze_saida_Alimentacao + +element.valor : this.treze_saida_Alimentacao;
          this.treze_saida_Admnistrativas = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && element.subtipo_nome == "1.1.Despesas admnistrativas") ? +this.treze_saida_Admnistrativas + +element.valor : this.treze_saida_Admnistrativas;
          this.treze_saida_Outros = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && (element.subtipo_nome !== "1.1.Despesas admnistrativas" && element.subtipo_nome !== "1.2.Despesas de transporte" && element.subtipo_nome !== "1.3.Despesas de alimentacao")) ? +this.treze_saida_Outros + +element.valor : this.treze_saida_Outros;

          this.treze_saida_Total = element.tipo_nome == "1.Saida" ? +this.treze_saida_Total + +element.valor : this.treze_saida_Total;             

          treze_LancamentoConsolidado = new LancamentoConsolidado(
            element.dia,element.mes, this.treze_entrada_NUMERARIO, this.treze_entrada_POS, this.treze_entrada_MPesa, this.treze_entrada_Cheque, this.treze_entrada_Convenio,
            this.treze_entrada_Consulta, this.treze_entrada_Diagnostico, this.treze_entrada_Conduta, this.treze_entrada_Medicamento, this.treze_entrada_Total,
            this.treze_saida_Energia, this.treze_saida_Salario, this.treze_saida_Alimentacao, this.treze_saida_Transporte, this.treze_saida_Admnistrativas,
            this.treze_saida_Outros, this.treze_saida_Total);
          break;
        }

        case "14": {
          this.catorze_entrada_NUMERARIO = element.formaPagamento == "Numerário" ? +this.catorze_entrada_NUMERARIO + +element.valor : this.catorze_entrada_NUMERARIO;
          this.catorze_entrada_POS = element.formaPagamento == "POS" ? +this.catorze_entrada_POS + +element.valor : this.catorze_entrada_POS;
          this.catorze_entrada_MPesa = element.formaPagamento == "MPesa" ? +this.catorze_entrada_MPesa + +element.valor : this.catorze_entrada_MPesa;
          this.catorze_entrada_Cheque = element.formaPagamento == "Cheque" ? +this.catorze_entrada_Cheque + +element.valor : this.catorze_entrada_Cheque;
          this.catorze_entrada_Convenio= element.formaPagamento == "Convênio" ? +this.catorze_entrada_Convenio + +element.valor : this.catorze_entrada_Convenio;
          
          this.catorze_entrada_Consulta = element.plano_nome == "CONSULTA_MEDICA" ? +this.catorze_entrada_Consulta + +element.valor : this.catorze_entrada_Consulta;
          this.catorze_entrada_Diagnostico = element.plano_nome == "DIAGNOSTICO_AUX" ? +this.catorze_entrada_Diagnostico + +element.valor : this.catorze_entrada_Diagnostico;
          this.catorze_entrada_Conduta = element.plano_nome == "CONDUTA CLINICA" ? +this.catorze_entrada_Conduta + +element.valor : this.catorze_entrada_Conduta;
          this.catorze_entrada_Medicamento = element.plano_nome == "MEDICAMENTO" ? +this.catorze_entrada_Medicamento + +element.valor : this.catorze_entrada_Medicamento;

          this.catorze_entrada_Total = element.tipo_nome == "2.Entrada" ? +this.catorze_entrada_Total + +element.valor : this.catorze_entrada_Total;

          this.catorze_saida_Energia = (element.tipo_nome == "1.Saida" && element.plano_nome == "Energia") ? +this.catorze_saida_Energia + +element.valor : this.catorze_saida_Energia;
          this.catorze_saida_Salario = (element.tipo_nome == "1.Saida" && element.plano_nome == "Salario") ? +this.catorze_saida_Salario + +element.valor : this.catorze_saida_Salario;
          this.catorze_saida_Transporte = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && element.subtipo_nome == "1.2.Despesas de transporte") ? +this.catorze_saida_Transporte + +element.valor : this.catorze_saida_Transporte;
          this.catorze_saida_Alimentacao = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && element.subtipo_nome == "1.3.Despesas de alimentacao") ? +this.catorze_saida_Alimentacao + +element.valor : this.catorze_saida_Alimentacao;
          this.catorze_saida_Admnistrativas = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && element.subtipo_nome == "1.1.Despesas admnistrativas") ? +this.catorze_saida_Admnistrativas + +element.valor : this.catorze_saida_Admnistrativas;
          this.catorze_saida_Outros = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && (element.subtipo_nome !== "1.1.Despesas admnistrativas" && element.subtipo_nome !== "1.2.Despesas de transporte" && element.subtipo_nome !== "1.3.Despesas de alimentacao")) ? +this.catorze_saida_Outros + +element.valor : this.catorze_saida_Outros;

          this.catorze_saida_Total = element.tipo_nome == "1.Saida" ? +this.catorze_saida_Total + +element.valor : this.catorze_saida_Total;             

          catorze_LancamentoConsolidado = new LancamentoConsolidado(
            element.dia,element.mes, this.catorze_entrada_NUMERARIO, this.catorze_entrada_POS, this.catorze_entrada_MPesa, this.catorze_entrada_Cheque, this.catorze_entrada_Convenio,
            this.catorze_entrada_Consulta, this.catorze_entrada_Diagnostico, this.catorze_entrada_Conduta, this.catorze_entrada_Medicamento, this.catorze_entrada_Total,
            this.catorze_saida_Energia, this.catorze_saida_Salario, this.catorze_saida_Alimentacao, this.catorze_saida_Transporte, this.catorze_saida_Admnistrativas,
            this.catorze_saida_Outros, this.catorze_saida_Total);
          break;
        }

        case "15": {
          this.quinze_entrada_NUMERARIO = element.formaPagamento == "Numerário" ? +this.quinze_entrada_NUMERARIO + +element.valor : this.quinze_entrada_NUMERARIO;
          this.quinze_entrada_POS = element.formaPagamento == "POS" ? +this.quinze_entrada_POS + +element.valor : this.quinze_entrada_POS;
          this.quinze_entrada_MPesa = element.formaPagamento == "MPesa" ? +this.quinze_entrada_MPesa + +element.valor : this.quinze_entrada_MPesa;
          this.quinze_entrada_Cheque = element.formaPagamento == "Cheque" ? +this.quinze_entrada_Cheque + +element.valor : this.quinze_entrada_Cheque;
          this.quinze_entrada_Convenio= element.formaPagamento == "Convênio" ? +this.quinze_entrada_Convenio + +element.valor : this.quinze_entrada_Convenio;
          
          this.quinze_entrada_Consulta = element.plano_nome == "CONSULTA_MEDICA" ? +this.quinze_entrada_Consulta + +element.valor : this.quinze_entrada_Consulta;
          this.quinze_entrada_Diagnostico = element.plano_nome == "DIAGNOSTICO_AUX" ? +this.quinze_entrada_Diagnostico + +element.valor : this.quinze_entrada_Diagnostico;
          this.quinze_entrada_Conduta = element.plano_nome == "CONDUTA CLINICA" ? +this.quinze_entrada_Conduta + +element.valor : this.quinze_entrada_Conduta;
          this.quinze_entrada_Medicamento = element.plano_nome == "MEDICAMENTO" ? +this.quinze_entrada_Medicamento + +element.valor : this.quinze_entrada_Medicamento;

          this.quinze_entrada_Total = element.tipo_nome == "2.Entrada" ? +this.quinze_entrada_Total + +element.valor : this.quinze_entrada_Total;

          this.quinze_saida_Energia = (element.tipo_nome == "1.Saida" && element.plano_nome == "Energia") ? +this.quinze_saida_Energia + +element.valor : this.quinze_saida_Energia;
          this.quinze_saida_Salario = (element.tipo_nome == "1.Saida" && element.plano_nome == "Salario") ? +this.quinze_saida_Salario + +element.valor : this.quinze_saida_Salario;
          this.quinze_saida_Transporte = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && element.subtipo_nome == "1.2.Despesas de transporte") ? +this.quinze_saida_Transporte + +element.valor : this.quinze_saida_Transporte;
          this.quinze_saida_Alimentacao = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && element.subtipo_nome == "1.3.Despesas de alimentacao") ? +this.quinze_saida_Alimentacao + +element.valor : this.quinze_saida_Alimentacao;
          this.quinze_saida_Admnistrativas = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && element.subtipo_nome == "1.1.Despesas admnistrativas") ? +this.quinze_saida_Admnistrativas + +element.valor : this.quinze_saida_Admnistrativas;
          this.quinze_saida_Outros = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && (element.subtipo_nome !== "1.1.Despesas admnistrativas" && element.subtipo_nome !== "1.2.Despesas de transporte" && element.subtipo_nome !== "1.3.Despesas de alimentacao")) ? +this.quinze_saida_Outros + +element.valor : this.quinze_saida_Outros;

          this.quinze_saida_Total = element.tipo_nome == "1.Saida" ? +this.quinze_saida_Total + +element.valor : this.quinze_saida_Total;             

          quinze_LancamentoConsolidado = new LancamentoConsolidado(
            element.dia,element.mes, this.quinze_entrada_NUMERARIO, this.quinze_entrada_POS, this.quinze_entrada_MPesa, this.quinze_entrada_Cheque, this.quinze_entrada_Convenio,
            this.quinze_entrada_Consulta, this.quinze_entrada_Diagnostico, this.quinze_entrada_Conduta, this.quinze_entrada_Medicamento, this.quinze_entrada_Total,
            this.quinze_saida_Energia, this.quinze_saida_Salario, this.quinze_saida_Alimentacao, this.quinze_saida_Transporte, this.quinze_saida_Admnistrativas,
            this.quinze_saida_Outros, this.quinze_saida_Total);
          break;
        }

        case "16": {
          this.dezasseis_entrada_NUMERARIO = element.formaPagamento == "Numerário" ? +this.dezasseis_entrada_NUMERARIO + +element.valor : this.dezasseis_entrada_NUMERARIO;
          this.dezasseis_entrada_POS = element.formaPagamento == "POS" ? +this.dezasseis_entrada_POS + +element.valor : this.dezasseis_entrada_POS;
          this.dezasseis_entrada_MPesa = element.formaPagamento == "MPesa" ? +this.dezasseis_entrada_MPesa + +element.valor : this.dezasseis_entrada_MPesa;
          this.dezasseis_entrada_Cheque = element.formaPagamento == "Cheque" ? +this.dezasseis_entrada_Cheque + +element.valor : this.dezasseis_entrada_Cheque;
          this.dezasseis_entrada_Convenio= element.formaPagamento == "Convênio" ? +this.dezasseis_entrada_Convenio + +element.valor : this.dezasseis_entrada_Convenio;
          
          this.dezasseis_entrada_Consulta = element.plano_nome == "CONSULTA_MEDICA" ? +this.dezasseis_entrada_Consulta + +element.valor : this.dezasseis_entrada_Consulta;
          this.dezasseis_entrada_Diagnostico = element.plano_nome == "DIAGNOSTICO_AUX" ? +this.dezasseis_entrada_Diagnostico + +element.valor : this.dezasseis_entrada_Diagnostico;
          this.dezasseis_entrada_Conduta = element.plano_nome == "CONDUTA CLINICA" ? +this.dezasseis_entrada_Conduta + +element.valor : this.dezasseis_entrada_Conduta;
          this.dezasseis_entrada_Medicamento = element.plano_nome == "MEDICAMENTO" ? +this.dezasseis_entrada_Medicamento + +element.valor : this.dezasseis_entrada_Medicamento;

          this.dezasseis_entrada_Total = element.tipo_nome == "2.Entrada" ? +this.dezasseis_entrada_Total + +element.valor : this.dezasseis_entrada_Total;

          this.dezasseis_saida_Energia = (element.tipo_nome == "1.Saida" && element.plano_nome == "Energia") ? +this.dezasseis_saida_Energia + +element.valor : this.dezasseis_saida_Energia;
          this.dezasseis_saida_Salario = (element.tipo_nome == "1.Saida" && element.plano_nome == "Salario") ? +this.dezasseis_saida_Salario + +element.valor : this.dezasseis_saida_Salario;
          this.dezasseis_saida_Transporte = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && element.subtipo_nome == "1.2.Despesas de transporte") ? +this.dezasseis_saida_Transporte + +element.valor : this.dezasseis_saida_Transporte;
          this.dezasseis_saida_Alimentacao = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && element.subtipo_nome == "1.3.Despesas de alimentacao") ? +this.dezasseis_saida_Alimentacao + +element.valor : this.dezasseis_saida_Alimentacao;
          this.dezasseis_saida_Admnistrativas = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && element.subtipo_nome == "1.1.Despesas admnistrativas") ? +this.dezasseis_saida_Admnistrativas + +element.valor : this.dezasseis_saida_Admnistrativas;
          this.dezasseis_saida_Outros = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && (element.subtipo_nome !== "1.1.Despesas admnistrativas" && element.subtipo_nome !== "1.2.Despesas de transporte" && element.subtipo_nome !== "1.3.Despesas de alimentacao")) ? +this.dezasseis_saida_Outros + +element.valor : this.dezasseis_saida_Outros;

          this.dezasseis_saida_Total = element.tipo_nome == "1.Saida" ? +this.dezasseis_saida_Total + +element.valor : this.dezasseis_saida_Total;             

          dezasseis_LancamentoConsolidado = new LancamentoConsolidado(
            element.dia,element.mes, this.dezasseis_entrada_NUMERARIO, this.dezasseis_entrada_POS, this.dezasseis_entrada_MPesa, this.dezasseis_entrada_Cheque, this.dezasseis_entrada_Convenio,
            this.dezasseis_entrada_Consulta, this.dezasseis_entrada_Diagnostico, this.dezasseis_entrada_Conduta, this.dezasseis_entrada_Medicamento, this.dezasseis_entrada_Total,
            this.dezasseis_saida_Energia, this.dezasseis_saida_Salario, this.dezasseis_saida_Alimentacao, this.dezasseis_saida_Transporte, this.dezasseis_saida_Admnistrativas,
            this.dezasseis_saida_Outros, this.dezasseis_saida_Total);
          break;
        }

        case "17": {
          this.dezassete_entrada_NUMERARIO = element.formaPagamento == "Numerário" ? +this.dezassete_entrada_NUMERARIO + +element.valor : this.dezassete_entrada_NUMERARIO;
          this.dezassete_entrada_POS = element.formaPagamento == "POS" ? +this.dezassete_entrada_POS + +element.valor : this.dezassete_entrada_POS;
          this.dezassete_entrada_MPesa = element.formaPagamento == "MPesa" ? +this.dezassete_entrada_MPesa + +element.valor : this.dezassete_entrada_MPesa;
          this.dezassete_entrada_Cheque = element.formaPagamento == "Cheque" ? +this.dezassete_entrada_Cheque + +element.valor : this.dezassete_entrada_Cheque;
          this.dezassete_entrada_Convenio= element.formaPagamento == "Convênio" ? +this.dezassete_entrada_Convenio + +element.valor : this.dezassete_entrada_Convenio;
          
          this.dezassete_entrada_Consulta = element.plano_nome == "CONSULTA_MEDICA" ? +this.dezassete_entrada_Consulta + +element.valor : this.dezassete_entrada_Consulta;
          this.dezassete_entrada_Diagnostico = element.plano_nome == "DIAGNOSTICO_AUX" ? +this.dezassete_entrada_Diagnostico + +element.valor : this.dezassete_entrada_Diagnostico;
          this.dezassete_entrada_Conduta = element.plano_nome == "CONDUTA CLINICA" ? +this.dezassete_entrada_Conduta + +element.valor : this.dezassete_entrada_Conduta;
          this.dezassete_entrada_Medicamento = element.plano_nome == "MEDICAMENTO" ? +this.dezassete_entrada_Medicamento + +element.valor : this.dezassete_entrada_Medicamento;

          this.dezassete_entrada_Total = element.tipo_nome == "2.Entrada" ? +this.dezassete_entrada_Total + +element.valor : this.dezassete_entrada_Total;

          this.dezassete_saida_Energia = (element.tipo_nome == "1.Saida" && element.plano_nome == "Energia") ? +this.dezassete_saida_Energia + +element.valor : this.dezassete_saida_Energia;
          this.dezassete_saida_Salario = (element.tipo_nome == "1.Saida" && element.plano_nome == "Salario") ? +this.dezassete_saida_Salario + +element.valor : this.dezassete_saida_Salario;
          this.dezassete_saida_Transporte = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && element.subtipo_nome == "1.2.Despesas de transporte") ? +this.dezassete_saida_Transporte + +element.valor : this.dezassete_saida_Transporte;
          this.dezassete_saida_Alimentacao = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && element.subtipo_nome == "1.3.Despesas de alimentacao") ? +this.dezassete_saida_Alimentacao + +element.valor : this.dezassete_saida_Alimentacao;
          this.dezassete_saida_Admnistrativas = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && element.subtipo_nome == "1.1.Despesas admnistrativas") ? +this.dezassete_saida_Admnistrativas + +element.valor : this.dezassete_saida_Admnistrativas;
          this.dezassete_saida_Outros = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && (element.subtipo_nome !== "1.1.Despesas admnistrativas" && element.subtipo_nome !== "1.2.Despesas de transporte" && element.subtipo_nome !== "1.3.Despesas de alimentacao")) ? +this.dezassete_saida_Outros + +element.valor : this.dezassete_saida_Outros;

          this.dezassete_saida_Total = element.tipo_nome == "1.Saida" ? +this.dezassete_saida_Total + +element.valor : this.dezassete_saida_Total;             

          dezassete_LancamentoConsolidado = new LancamentoConsolidado(
            element.dia,element.mes, this.dezassete_entrada_NUMERARIO, this.dezassete_entrada_POS, this.dezassete_entrada_MPesa, this.dezassete_entrada_Cheque, this.dezassete_entrada_Convenio,
            this.dezassete_entrada_Consulta, this.dezassete_entrada_Diagnostico, this.dezassete_entrada_Conduta, this.dezassete_entrada_Medicamento, this.dezassete_entrada_Total,
            this.dezassete_saida_Energia, this.dezassete_saida_Salario, this.dezassete_saida_Alimentacao, this.dezassete_saida_Transporte, this.dezassete_saida_Admnistrativas,
            this.dezassete_saida_Outros, this.dezassete_saida_Total);
          break;
        }

        case "18": {
          this.dezoito_entrada_NUMERARIO = element.formaPagamento == "Numerário" ? +this.dezoito_entrada_NUMERARIO + +element.valor : this.dezoito_entrada_NUMERARIO;
          this.dezoito_entrada_POS = element.formaPagamento == "POS" ? +this.dezoito_entrada_POS + +element.valor : this.dezoito_entrada_POS;
          this.dezoito_entrada_MPesa = element.formaPagamento == "MPesa" ? +this.dezoito_entrada_MPesa + +element.valor : this.dezoito_entrada_MPesa;
          this.dezoito_entrada_Cheque = element.formaPagamento == "Cheque" ? +this.dezoito_entrada_Cheque + +element.valor : this.dezoito_entrada_Cheque;
          this.dezoito_entrada_Convenio= element.formaPagamento == "Convênio" ? +this.dezoito_entrada_Convenio + +element.valor : this.dezoito_entrada_Convenio;
          
          this.dezoito_entrada_Consulta = element.plano_nome == "CONSULTA_MEDICA" ? +this.dezoito_entrada_Consulta + +element.valor : this.dezoito_entrada_Consulta;
          this.dezoito_entrada_Diagnostico = element.plano_nome == "DIAGNOSTICO_AUX" ? +this.dezoito_entrada_Diagnostico + +element.valor : this.dezoito_entrada_Diagnostico;
          this.dezoito_entrada_Conduta = element.plano_nome == "CONDUTA CLINICA" ? +this.dezoito_entrada_Conduta + +element.valor : this.dezoito_entrada_Conduta;
          this.dezoito_entrada_Medicamento = element.plano_nome == "MEDICAMENTO" ? +this.dezoito_entrada_Medicamento + +element.valor : this.dezoito_entrada_Medicamento;

          this.dezoito_entrada_Total = element.tipo_nome == "2.Entrada" ? +this.dezoito_entrada_Total + +element.valor : this.dezoito_entrada_Total;

          this.dezoito_saida_Energia = (element.tipo_nome == "1.Saida" && element.plano_nome == "Energia") ? +this.dezoito_saida_Energia + +element.valor : this.dezoito_saida_Energia;
          this.dezoito_saida_Salario = (element.tipo_nome == "1.Saida" && element.plano_nome == "Salario") ? +this.dezoito_saida_Salario + +element.valor : this.dezoito_saida_Salario;
          this.dezoito_saida_Transporte = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && element.subtipo_nome == "1.2.Despesas de transporte") ? +this.dezoito_saida_Transporte + +element.valor : this.dezoito_saida_Transporte;
          this.dezoito_saida_Alimentacao = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && element.subtipo_nome == "1.3.Despesas de alimentacao") ? +this.dezoito_saida_Alimentacao + +element.valor : this.dezoito_saida_Alimentacao;
          this.dezoito_saida_Admnistrativas = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && element.subtipo_nome == "1.1.Despesas admnistrativas") ? +this.dezoito_saida_Admnistrativas + +element.valor : this.dezoito_saida_Admnistrativas;
          this.dezoito_saida_Outros = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && (element.subtipo_nome !== "1.1.Despesas admnistrativas" && element.subtipo_nome !== "1.2.Despesas de transporte" && element.subtipo_nome !== "1.3.Despesas de alimentacao")) ? +this.dezoito_saida_Outros + +element.valor : this.dezoito_saida_Outros;

          this.dezoito_saida_Total = element.tipo_nome == "1.Saida" ? +this.dezoito_saida_Total + +element.valor : this.dezoito_saida_Total;             

          dezoito_LancamentoConsolidado = new LancamentoConsolidado(
            element.dia,element.mes, this.dezoito_entrada_NUMERARIO, this.dezoito_entrada_POS, this.dezoito_entrada_MPesa, this.dezoito_entrada_Cheque, this.dezoito_entrada_Convenio,
            this.dezoito_entrada_Consulta, this.dezoito_entrada_Diagnostico, this.dezoito_entrada_Conduta, this.dezoito_entrada_Medicamento, this.dezoito_entrada_Total,
            this.dezoito_saida_Energia, this.dezoito_saida_Salario, this.dezoito_saida_Alimentacao, this.dezoito_saida_Transporte, this.dezoito_saida_Admnistrativas,
            this.dezoito_saida_Outros, this.dezoito_saida_Total);

          break;
        }

        case "19": {
          this.dezanove_entrada_NUMERARIO = element.formaPagamento == "Numerário" ? +this.dezanove_entrada_NUMERARIO + +element.valor : this.dezanove_entrada_NUMERARIO;
          this.dezanove_entrada_POS = element.formaPagamento == "POS" ? +this.dezanove_entrada_POS + +element.valor : this.dezanove_entrada_POS;
          this.dezanove_entrada_MPesa = element.formaPagamento == "MPesa" ? +this.dezanove_entrada_MPesa + +element.valor : this.dezanove_entrada_MPesa;
          this.dezanove_entrada_Cheque = element.formaPagamento == "Cheque" ? +this.dezanove_entrada_Cheque + +element.valor : this.dezanove_entrada_Cheque;
          this.dezanove_entrada_Convenio= element.formaPagamento == "Convênio" ? +this.dezanove_entrada_Convenio + +element.valor : this.dezanove_entrada_Convenio;
          
          this.dezanove_entrada_Consulta = element.plano_nome == "CONSULTA_MEDICA" ? +this.dezanove_entrada_Consulta + +element.valor : this.dezanove_entrada_Consulta;
          this.dezanove_entrada_Diagnostico = element.plano_nome == "DIAGNOSTICO_AUX" ? +this.dezanove_entrada_Diagnostico + +element.valor : this.dezanove_entrada_Diagnostico;
          this.dezanove_entrada_Conduta = element.plano_nome == "CONDUTA CLINICA" ? +this.dezanove_entrada_Conduta + +element.valor : this.dezanove_entrada_Conduta;
          this.dezanove_entrada_Medicamento = element.plano_nome == "MEDICAMENTO" ? +this.dezanove_entrada_Medicamento + +element.valor : this.dezanove_entrada_Medicamento;

          this.dezanove_entrada_Total = element.tipo_nome == "2.Entrada" ? +this.dezanove_entrada_Total + +element.valor : this.dezanove_entrada_Total;

          this.dezanove_saida_Energia = (element.tipo_nome == "1.Saida" && element.plano_nome == "Energia") ? +this.dezanove_saida_Energia + +element.valor : this.dezanove_saida_Energia;
          this.dezanove_saida_Salario = (element.tipo_nome == "1.Saida" && element.plano_nome == "Salario") ? +this.dezanove_saida_Salario + +element.valor : this.dezanove_saida_Salario;
          this.dezanove_saida_Transporte = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && element.subtipo_nome == "1.2.Despesas de transporte") ? +this.dezanove_saida_Transporte + +element.valor : this.dezanove_saida_Transporte;
          this.dezanove_saida_Alimentacao = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && element.subtipo_nome == "1.3.Despesas de alimentacao") ? +this.dezanove_saida_Alimentacao + +element.valor : this.dezanove_saida_Alimentacao;
          this.dezanove_saida_Admnistrativas = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && element.subtipo_nome == "1.1.Despesas admnistrativas") ? +this.dezanove_saida_Admnistrativas + +element.valor : this.dezanove_saida_Admnistrativas;
          this.dezanove_saida_Outros = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && (element.subtipo_nome !== "1.1.Despesas admnistrativas" && element.subtipo_nome !== "1.2.Despesas de transporte" && element.subtipo_nome !== "1.3.Despesas de alimentacao")) ? +this.dezanove_saida_Outros + +element.valor : this.dezanove_saida_Outros;

          this.dezanove_saida_Total = element.tipo_nome == "1.Saida" ? +this.dezanove_saida_Total + +element.valor : this.dezanove_saida_Total;             

          dezanove_LancamentoConsolidado = new LancamentoConsolidado(
            element.dia,element.mes, this.dezanove_entrada_NUMERARIO, this.dezanove_entrada_POS, this.dezanove_entrada_MPesa, this.dezanove_entrada_Cheque, this.dezanove_entrada_Convenio,
            this.dezanove_entrada_Consulta, this.dezanove_entrada_Diagnostico, this.dezanove_entrada_Conduta, this.dezanove_entrada_Medicamento, this.dezanove_entrada_Total,
            this.dezanove_saida_Energia, this.dezanove_saida_Salario, this.dezanove_saida_Alimentacao, this.dezanove_saida_Transporte, this.dezanove_saida_Admnistrativas,
            this.dezanove_saida_Outros, this.dezanove_saida_Total);
          break;
        }

        case "20": {
          this.vinte_entrada_NUMERARIO = element.formaPagamento == "Numerário" ? +this.vinte_entrada_NUMERARIO + +element.valor : this.vinte_entrada_NUMERARIO;
          this.vinte_entrada_POS = element.formaPagamento == "POS" ? +this.vinte_entrada_POS + +element.valor : this.vinte_entrada_POS;
          this.vinte_entrada_MPesa = element.formaPagamento == "MPesa" ? +this.vinte_entrada_MPesa + +element.valor : this.vinte_entrada_MPesa;
          this.vinte_entrada_Cheque = element.formaPagamento == "Cheque" ? +this.vinte_entrada_Cheque + +element.valor : this.vinte_entrada_Cheque;
          this.vinte_entrada_Convenio= element.formaPagamento == "Convênio" ? +this.vinte_entrada_Convenio + +element.valor : this.vinte_entrada_Convenio;
          
          this.vinte_entrada_Consulta = element.plano_nome == "CONSULTA_MEDICA" ? +this.vinte_entrada_Consulta + +element.valor : this.vinte_entrada_Consulta;
          this.vinte_entrada_Diagnostico = element.plano_nome == "DIAGNOSTICO_AUX" ? +this.vinte_entrada_Diagnostico + +element.valor : this.vinte_entrada_Diagnostico;
          this.vinte_entrada_Conduta = element.plano_nome == "CONDUTA CLINICA" ? +this.vinte_entrada_Conduta + +element.valor : this.vinte_entrada_Conduta;
          this.vinte_entrada_Medicamento = element.plano_nome == "MEDICAMENTO" ? +this.vinte_entrada_Medicamento + +element.valor : this.vinte_entrada_Medicamento;

          this.vinte_entrada_Total = element.tipo_nome == "2.Entrada" ? +this.vinte_entrada_Total + +element.valor : this.vinte_entrada_Total;

          this.vinte_saida_Energia = (element.tipo_nome == "1.Saida" && element.plano_nome == "Energia") ? +this.vinte_saida_Energia + +element.valor : this.vinte_saida_Energia;
          this.vinte_saida_Salario = (element.tipo_nome == "1.Saida" && element.plano_nome == "Salario") ? +this.vinte_saida_Salario + +element.valor : this.vinte_saida_Salario;
          this.vinte_saida_Transporte = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && element.subtipo_nome == "1.2.Despesas de transporte") ? +this.vinte_saida_Transporte + +element.valor : this.vinte_saida_Transporte;
          this.vinte_saida_Alimentacao = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && element.subtipo_nome == "1.3.Despesas de alimentacao") ? +this.vinte_saida_Alimentacao + +element.valor : this.vinte_saida_Alimentacao;
          this.vinte_saida_Admnistrativas = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && element.subtipo_nome == "1.1.Despesas admnistrativas") ? +this.vinte_saida_Admnistrativas + +element.valor : this.vinte_saida_Admnistrativas;
          this.vinte_saida_Outros = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && (element.subtipo_nome !== "1.1.Despesas admnistrativas" && element.subtipo_nome !== "1.2.Despesas de transporte" && element.subtipo_nome !== "1.3.Despesas de alimentacao")) ? +this.vinte_saida_Outros + +element.valor : this.vinte_saida_Outros;

          this.vinte_saida_Total = element.tipo_nome == "1.Saida" ? +this.vinte_saida_Total + +element.valor : this.vinte_saida_Total;             

          vinte_LancamentoConsolidado = new LancamentoConsolidado(
            element.dia,element.mes, this.vinte_entrada_NUMERARIO, this.vinte_entrada_POS, this.vinte_entrada_MPesa, this.vinte_entrada_Cheque, this.vinte_entrada_Convenio,
            this.vinte_entrada_Consulta, this.vinte_entrada_Diagnostico, this.vinte_entrada_Conduta, this.vinte_entrada_Medicamento, this.vinte_entrada_Total,
            this.vinte_saida_Energia, this.vinte_saida_Salario, this.vinte_saida_Alimentacao, this.vinte_saida_Transporte, this.vinte_saida_Admnistrativas,
            this.vinte_saida_Outros, this.vinte_saida_Total);

          break;
        }

        case "21": {
          this.vinteum_entrada_NUMERARIO = element.formaPagamento == "Numerário" ? +this.vinteum_entrada_NUMERARIO + +element.valor : this.vinteum_entrada_NUMERARIO;
          this.vinteum_entrada_POS = element.formaPagamento == "POS" ? +this.vinteum_entrada_POS + +element.valor : this.vinteum_entrada_POS;
          this.vinteum_entrada_MPesa = element.formaPagamento == "MPesa" ? +this.vinteum_entrada_MPesa + +element.valor : this.vinteum_entrada_MPesa;
          this.vinteum_entrada_Cheque = element.formaPagamento == "Cheque" ? +this.vinteum_entrada_Cheque + +element.valor : this.vinteum_entrada_Cheque;
          this.vinteum_entrada_Convenio= element.formaPagamento == "Convênio" ? +this.vinteum_entrada_Convenio + +element.valor : this.vinteum_entrada_Convenio;
          
          this.vinteum_entrada_Consulta = element.plano_nome == "CONSULTA_MEDICA" ? +this.vinteum_entrada_Consulta + +element.valor : this.vinteum_entrada_Consulta;
          this.vinteum_entrada_Diagnostico = element.plano_nome == "DIAGNOSTICO_AUX" ? +this.vinteum_entrada_Diagnostico + +element.valor : this.vinteum_entrada_Diagnostico;
          this.vinteum_entrada_Conduta = element.plano_nome == "CONDUTA CLINICA" ? +this.vinteum_entrada_Conduta + +element.valor : this.vinteum_entrada_Conduta;
          this.vinteum_entrada_Medicamento = element.plano_nome == "MEDICAMENTO" ? +this.vinteum_entrada_Medicamento + +element.valor : this.vinteum_entrada_Medicamento;

          this.vinteum_entrada_Total = element.tipo_nome == "2.Entrada" ? +this.vinteum_entrada_Total + +element.valor : this.vinteum_entrada_Total;

          this.vinteum_saida_Energia = (element.tipo_nome == "1.Saida" && element.plano_nome == "Energia") ? +this.vinteum_saida_Energia + +element.valor : this.vinteum_saida_Energia;
          this.vinteum_saida_Salario = (element.tipo_nome == "1.Saida" && element.plano_nome == "Salario") ? +this.vinteum_saida_Salario + +element.valor : this.vinteum_saida_Salario;
          this.vinteum_saida_Transporte = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && element.subtipo_nome == "1.2.Despesas de transporte") ? +this.vinteum_saida_Transporte + +element.valor : this.vinteum_saida_Transporte;
          this.vinteum_saida_Alimentacao = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && element.subtipo_nome == "1.3.Despesas de alimentacao") ? +this.vinteum_saida_Alimentacao + +element.valor : this.vinteum_saida_Alimentacao;
          this.vinteum_saida_Admnistrativas = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && element.subtipo_nome == "1.1.Despesas admnistrativas") ? +this.vinteum_saida_Admnistrativas + +element.valor : this.vinteum_saida_Admnistrativas;
          this.vinteum_saida_Outros = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && (element.subtipo_nome !== "1.1.Despesas admnistrativas" && element.subtipo_nome !== "1.2.Despesas de transporte" && element.subtipo_nome !== "1.3.Despesas de alimentacao")) ? +this.vinteum_saida_Outros + +element.valor : this.vinteum_saida_Outros;

          this.vinteum_saida_Total = element.tipo_nome == "1.Saida" ? +this.vinteum_saida_Total + +element.valor : this.vinteum_saida_Total;             

          vinteum_LancamentoConsolidado = new LancamentoConsolidado(
            element.dia,element.mes, this.vinteum_entrada_NUMERARIO, this.vinteum_entrada_POS, this.vinteum_entrada_MPesa, this.vinteum_entrada_Cheque, this.vinteum_entrada_Convenio,
            this.vinteum_entrada_Consulta, this.vinteum_entrada_Diagnostico, this.vinteum_entrada_Conduta, this.vinteum_entrada_Medicamento, this.vinteum_entrada_Total,
            this.vinteum_saida_Energia, this.vinteum_saida_Salario, this.vinteum_saida_Alimentacao, this.vinteum_saida_Transporte, this.vinteum_saida_Admnistrativas,
            this.vinteum_saida_Outros, this.vinteum_saida_Total);

          break;
        }

        case "22": {
          this.vintedois_entrada_NUMERARIO = element.formaPagamento == "Numerário" ? +this.vintedois_entrada_NUMERARIO + +element.valor : this.vintedois_entrada_NUMERARIO;
          this.vintedois_entrada_POS = element.formaPagamento == "POS" ? +this.vintedois_entrada_POS + +element.valor : this.vintedois_entrada_POS;
          this.vintedois_entrada_MPesa = element.formaPagamento == "MPesa" ? +this.vintedois_entrada_MPesa + +element.valor : this.vintedois_entrada_MPesa;
          this.vintedois_entrada_Cheque = element.formaPagamento == "Cheque" ? +this.vintedois_entrada_Cheque + +element.valor : this.vintedois_entrada_Cheque;
          this.vintedois_entrada_Convenio= element.formaPagamento == "Convênio" ? +this.vintedois_entrada_Convenio + +element.valor : this.vintedois_entrada_Convenio;
          
          this.vintedois_entrada_Consulta = element.plano_nome == "CONSULTA_MEDICA" ? +this.vintedois_entrada_Consulta + +element.valor : this.vintedois_entrada_Consulta;
          this.vintedois_entrada_Diagnostico = element.plano_nome == "DIAGNOSTICO_AUX" ? +this.vintedois_entrada_Diagnostico + +element.valor : this.vintedois_entrada_Diagnostico;
          this.vintedois_entrada_Conduta = element.plano_nome == "CONDUTA CLINICA" ? +this.vintedois_entrada_Conduta + +element.valor : this.vintedois_entrada_Conduta;
          this.vintedois_entrada_Medicamento = element.plano_nome == "MEDICAMENTO" ? +this.vintedois_entrada_Medicamento + +element.valor : this.vintedois_entrada_Medicamento;

          this.vintedois_entrada_Total = element.tipo_nome == "2.Entrada" ? +this.vintedois_entrada_Total + +element.valor : this.vintedois_entrada_Total;

          this.vintedois_saida_Energia = (element.tipo_nome == "1.Saida" && element.plano_nome == "Energia") ? +this.vintedois_saida_Energia + +element.valor : this.vintedois_saida_Energia;
          this.vintedois_saida_Salario = (element.tipo_nome == "1.Saida" && element.plano_nome == "Salario") ? +this.vintedois_saida_Salario + +element.valor : this.vintedois_saida_Salario;
          this.vintedois_saida_Transporte = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && element.subtipo_nome == "1.2.Despesas de transporte") ? +this.vintedois_saida_Transporte + +element.valor : this.vintedois_saida_Transporte;
          this.vintedois_saida_Alimentacao = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && element.subtipo_nome == "1.3.Despesas de alimentacao") ? +this.vintedois_saida_Alimentacao + +element.valor : this.vintedois_saida_Alimentacao;
          this.vintedois_saida_Admnistrativas = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && element.subtipo_nome == "1.1.Despesas admnistrativas") ? +this.vintedois_saida_Admnistrativas + +element.valor : this.vintedois_saida_Admnistrativas;
          this.vintedois_saida_Outros = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && (element.subtipo_nome !== "1.1.Despesas admnistrativas" && element.subtipo_nome !== "1.2.Despesas de transporte" && element.subtipo_nome !== "1.3.Despesas de alimentacao")) ? +this.vintedois_saida_Outros + +element.valor : this.vintedois_saida_Outros;

          this.vintedois_saida_Total = element.tipo_nome == "1.Saida" ? +this.vintedois_saida_Total + +element.valor : this.vintedois_saida_Total;             

          vintedois_LancamentoConsolidado = new LancamentoConsolidado(
            element.dia,element.mes, this.vintedois_entrada_NUMERARIO, this.vintedois_entrada_POS, this.vintedois_entrada_MPesa, this.vintedois_entrada_Cheque, this.vintedois_entrada_Convenio,
            this.vintedois_entrada_Consulta, this.vintedois_entrada_Diagnostico, this.vintedois_entrada_Conduta, this.vintedois_entrada_Medicamento, this.vintedois_entrada_Total,
            this.vintedois_saida_Energia, this.vintedois_saida_Salario, this.vintedois_saida_Alimentacao, this.vintedois_saida_Transporte, this.vintedois_saida_Admnistrativas,
            this.vintedois_saida_Outros, this.vintedois_saida_Total);
          break;
        }

        case "23": {
          this.vintetrez_entrada_NUMERARIO = element.formaPagamento == "Numerário" ? +this.vintetrez_entrada_NUMERARIO + +element.valor : this.vintetrez_entrada_NUMERARIO;
          this.vintetrez_entrada_POS = element.formaPagamento == "POS" ? +this.vintetrez_entrada_POS + +element.valor : this.vintetrez_entrada_POS;
          this.vintetrez_entrada_MPesa = element.formaPagamento == "MPesa" ? +this.vintetrez_entrada_MPesa + +element.valor : this.vintetrez_entrada_MPesa;
          this.vintetrez_entrada_Cheque = element.formaPagamento == "Cheque" ? +this.vintetrez_entrada_Cheque + +element.valor : this.vintetrez_entrada_Cheque;
          this.vintetrez_entrada_Convenio= element.formaPagamento == "Convênio" ? +this.vintetrez_entrada_Convenio + +element.valor : this.vintetrez_entrada_Convenio;
          
          this.vintetrez_entrada_Consulta = element.plano_nome == "CONSULTA_MEDICA" ? +this.vintetrez_entrada_Consulta + +element.valor : this.vintetrez_entrada_Consulta;
          this.vintetrez_entrada_Diagnostico = element.plano_nome == "DIAGNOSTICO_AUX" ? +this.vintetrez_entrada_Diagnostico + +element.valor : this.vintetrez_entrada_Diagnostico;
          this.vintetrez_entrada_Conduta = element.plano_nome == "CONDUTA CLINICA" ? +this.vintetrez_entrada_Conduta + +element.valor : this.vintetrez_entrada_Conduta;
          this.vintetrez_entrada_Medicamento = element.plano_nome == "MEDICAMENTO" ? +this.vintetrez_entrada_Medicamento + +element.valor : this.vintetrez_entrada_Medicamento;

          this.vintetrez_entrada_Total = element.tipo_nome == "2.Entrada" ? +this.vintetrez_entrada_Total + +element.valor : this.vintetrez_entrada_Total;

          this.vintetrez_saida_Energia = (element.tipo_nome == "1.Saida" && element.plano_nome == "Energia") ? +this.vintetrez_saida_Energia + +element.valor : this.vintetrez_saida_Energia;
          this.vintetrez_saida_Salario = (element.tipo_nome == "1.Saida" && element.plano_nome == "Salario") ? +this.vintetrez_saida_Salario + +element.valor : this.vintetrez_saida_Salario;
          this.vintetrez_saida_Transporte = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && element.subtipo_nome == "1.2.Despesas de transporte") ? +this.vintetrez_saida_Transporte + +element.valor : this.vintetrez_saida_Transporte;
          this.vintetrez_saida_Alimentacao = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && element.subtipo_nome == "1.3.Despesas de alimentacao") ? +this.vintetrez_saida_Alimentacao + +element.valor : this.vintetrez_saida_Alimentacao;
          this.vintetrez_saida_Admnistrativas = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && element.subtipo_nome == "1.1.Despesas admnistrativas") ? +this.vintetrez_saida_Admnistrativas + +element.valor : this.vintetrez_saida_Admnistrativas;
          this.vintetrez_saida_Outros = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && (element.subtipo_nome !== "1.1.Despesas admnistrativas" && element.subtipo_nome !== "1.2.Despesas de transporte" && element.subtipo_nome !== "1.3.Despesas de alimentacao")) ? +this.vintetrez_saida_Outros + +element.valor : this.vintetrez_saida_Outros;

          this.vintetrez_saida_Total = element.tipo_nome == "1.Saida" ? +this.vintetrez_saida_Total + +element.valor : this.vintetrez_saida_Total;             

          vintetrez_LancamentoConsolidado = new LancamentoConsolidado(
            element.dia,element.mes, this.vintetrez_entrada_NUMERARIO, this.vintetrez_entrada_POS, this.vintetrez_entrada_MPesa, this.vintetrez_entrada_Cheque, this.vintetrez_entrada_Convenio,
            this.vintetrez_entrada_Consulta, this.vintetrez_entrada_Diagnostico, this.vintetrez_entrada_Conduta, this.vintetrez_entrada_Medicamento, this.vintetrez_entrada_Total,
            this.vintetrez_saida_Energia, this.vintetrez_saida_Salario, this.vintetrez_saida_Alimentacao, this.vintetrez_saida_Transporte, this.vintetrez_saida_Admnistrativas,
            this.vintetrez_saida_Outros, this.vintetrez_saida_Total);

          break;
        }

        case "24": {
          this.vintequatro_entrada_NUMERARIO = element.formaPagamento == "Numerário" ? +this.vintequatro_entrada_NUMERARIO + +element.valor : this.vintequatro_entrada_NUMERARIO;
          this.vintequatro_entrada_POS = element.formaPagamento == "POS" ? +this.vintequatro_entrada_POS + +element.valor : this.vintequatro_entrada_POS;
          this.vintequatro_entrada_MPesa = element.formaPagamento == "MPesa" ? +this.vintequatro_entrada_MPesa + +element.valor : this.vintequatro_entrada_MPesa;
          this.vintequatro_entrada_Cheque = element.formaPagamento == "Cheque" ? +this.vintequatro_entrada_Cheque + +element.valor : this.vintequatro_entrada_Cheque;
          this.vintequatro_entrada_Convenio= element.formaPagamento == "Convênio" ? +this.vintequatro_entrada_Convenio + +element.valor : this.vintequatro_entrada_Convenio;
          this.vintequatro_entrada_Consulta = element.plano_nome == "CONSULTA_MEDICA" ? +this.vintequatro_entrada_Consulta + +element.valor : this.vintequatro_entrada_Consulta;

          this.vintequatro_entrada_Diagnostico = element.plano_nome == "DIAGNOSTICO_AUX" ? +this.vintequatro_entrada_Diagnostico + +element.valor : this.vintequatro_entrada_Diagnostico;
          this.vintequatro_entrada_Conduta = element.plano_nome == "CONDUTA CLINICA" ? +this.vintequatro_entrada_Conduta + +element.valor : this.vintequatro_entrada_Conduta;
          this.vintequatro_entrada_Medicamento = element.plano_nome == "MEDICAMENTO" ? +this.vintequatro_entrada_Medicamento + +element.valor : this.vintequatro_entrada_Medicamento;

          this.vintequatro_entrada_Total = element.tipo_nome == "2.Entrada" ? +this.vintequatro_entrada_Total + +element.valor : this.vintequatro_entrada_Total;

          this.vintequatro_saida_Energia = (element.tipo_nome == "1.Saida" && element.plano_nome == "Energia") ? +this.vintequatro_saida_Energia + +element.valor : this.vintequatro_saida_Energia;
          this.vintequatro_saida_Salario = (element.tipo_nome == "1.Saida" && element.plano_nome == "Salario") ? +this.vintequatro_saida_Salario + +element.valor : this.vintequatro_saida_Salario;
          this.vintequatro_saida_Transporte = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && element.subtipo_nome == "1.2.Despesas de transporte") ? +this.vintequatro_saida_Transporte + +element.valor : this.vintequatro_saida_Transporte;
          this.vintequatro_saida_Alimentacao = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && element.subtipo_nome == "1.3.Despesas de alimentacao") ? +this.vintequatro_saida_Alimentacao + +element.valor : this.vintequatro_saida_Alimentacao;
          this.vintequatro_saida_Admnistrativas = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && element.subtipo_nome == "1.1.Despesas admnistrativas") ? +this.vintequatro_saida_Admnistrativas + +element.valor : this.vintequatro_saida_Admnistrativas;
          this.vintequatro_saida_Outros = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && (element.subtipo_nome !== "1.1.Despesas admnistrativas" && element.subtipo_nome !== "1.2.Despesas de transporte" && element.subtipo_nome !== "1.3.Despesas de alimentacao")) ? +this.vintequatro_saida_Outros + +element.valor : this.vintequatro_saida_Outros;

          this.vintequatro_saida_Total = element.tipo_nome == "1.Saida" ? +this.vintequatro_saida_Total + +element.valor : this.vintequatro_saida_Total;             

          vintequatro_LancamentoConsolidado = new LancamentoConsolidado(
            element.dia,element.mes, this.vintequatro_entrada_NUMERARIO, this.vintequatro_entrada_POS, this.vintequatro_entrada_MPesa, this.vintequatro_entrada_Cheque, this.vintequatro_entrada_Convenio,
            this.vintequatro_entrada_Consulta, this.vintequatro_entrada_Diagnostico, this.vintequatro_entrada_Conduta, this.vintequatro_entrada_Medicamento, this.vintequatro_entrada_Total,
            this.vintequatro_saida_Energia, this.vintequatro_saida_Salario, this.vintequatro_saida_Alimentacao, this.vintequatro_saida_Transporte, this.vintequatro_saida_Admnistrativas,
            this.vintequatro_saida_Outros, this.vintequatro_saida_Total);
          break;
        }

        case "25": {
          this.vintecinco_entrada_NUMERARIO = element.formaPagamento == "Numerário" ? +this.vintecinco_entrada_NUMERARIO + +element.valor : this.vintecinco_entrada_NUMERARIO;
          this.vintecinco_entrada_POS = element.formaPagamento == "POS" ? +this.vintecinco_entrada_POS + +element.valor : this.vintecinco_entrada_POS;
          this.vintecinco_entrada_MPesa = element.formaPagamento == "MPesa" ? +this.vintecinco_entrada_MPesa + +element.valor : this.vintecinco_entrada_MPesa;
          this.vintecinco_entrada_Cheque = element.formaPagamento == "Cheque" ? +this.vintecinco_entrada_Cheque + +element.valor : this.vintecinco_entrada_Cheque;
          this.vintecinco_entrada_Convenio= element.formaPagamento == "Convênio" ? +this.vintecinco_entrada_Convenio + +element.valor : this.vintecinco_entrada_Convenio;
          
          this.vintecinco_entrada_Consulta = element.plano_nome == "CONSULTA_MEDICA" ? +this.vintecinco_entrada_Consulta + +element.valor : this.vintecinco_entrada_Consulta;
          this.vintecinco_entrada_Diagnostico = element.plano_nome == "DIAGNOSTICO_AUX" ? +this.vintecinco_entrada_Diagnostico + +element.valor : this.vintecinco_entrada_Diagnostico;
          this.vintecinco_entrada_Conduta = element.plano_nome == "CONDUTA CLINICA" ? +this.vintecinco_entrada_Conduta + +element.valor : this.vintecinco_entrada_Conduta;
          this.vintecinco_entrada_Medicamento = element.plano_nome == "MEDICAMENTO" ? +this.vintecinco_entrada_Medicamento + +element.valor : this.vintecinco_entrada_Medicamento;

          this.vintecinco_entrada_Total = element.tipo_nome == "2.Entrada" ? +this.vintecinco_entrada_Total + +element.valor : this.vintecinco_entrada_Total;

          this.vintecinco_saida_Energia = (element.tipo_nome == "1.Saida" && element.plano_nome == "Energia") ? +this.vintecinco_saida_Energia + +element.valor : this.vintecinco_saida_Energia;
          this.vintecinco_saida_Salario = (element.tipo_nome == "1.Saida" && element.plano_nome == "Salario") ? +this.vintecinco_saida_Salario + +element.valor : this.vintecinco_saida_Salario;
          this.vintecinco_saida_Transporte = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && element.subtipo_nome == "1.2.Despesas de transporte") ? +this.vintecinco_saida_Transporte + +element.valor : this.vintecinco_saida_Transporte;
          this.vintecinco_saida_Alimentacao = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && element.subtipo_nome == "1.3.Despesas de alimentacao") ? +this.vintecinco_saida_Alimentacao + +element.valor : this.vintecinco_saida_Alimentacao;
          this.vintecinco_saida_Admnistrativas = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && element.subtipo_nome == "1.1.Despesas admnistrativas") ? +this.vintecinco_saida_Admnistrativas + +element.valor : this.vintecinco_saida_Admnistrativas;
          this.vintecinco_saida_Outros = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && (element.subtipo_nome !== "1.1.Despesas admnistrativas" && element.subtipo_nome !== "1.2.Despesas de transporte" && element.subtipo_nome !== "1.3.Despesas de alimentacao")) ? +this.vintecinco_saida_Outros + +element.valor : this.vintecinco_saida_Outros;

          this.vintecinco_saida_Total = element.tipo_nome == "1.Saida" ? +this.vintecinco_saida_Total + +element.valor : this.vintecinco_saida_Total;             

          vintecinco_LancamentoConsolidado = new LancamentoConsolidado(
            element.dia,element.mes, this.vintecinco_entrada_NUMERARIO, this.vintecinco_entrada_POS, this.vintecinco_entrada_MPesa, this.vintecinco_entrada_Cheque, this.vintecinco_entrada_Convenio,
            this.vintecinco_entrada_Consulta, this.vintecinco_entrada_Diagnostico, this.vintecinco_entrada_Conduta, this.vintecinco_entrada_Medicamento, this.vintecinco_entrada_Total,
            this.vintecinco_saida_Energia, this.vintecinco_saida_Salario, this.vintecinco_saida_Alimentacao, this.vintecinco_saida_Transporte, this.vintecinco_saida_Admnistrativas,
            this.vintecinco_saida_Outros, this.vintecinco_saida_Total);
          break;
        }

        case "26": {
          this.vinteseis_entrada_NUMERARIO = element.formaPagamento == "Numerário" ? +this.vinteseis_entrada_NUMERARIO + +element.valor : this.vinteseis_entrada_NUMERARIO;
          this.vinteseis_entrada_POS = element.formaPagamento == "POS" ? +this.vinteseis_entrada_POS + +element.valor : this.vinteseis_entrada_POS;
          this.vinteseis_entrada_MPesa = element.formaPagamento == "MPesa" ? +this.vinteseis_entrada_MPesa + +element.valor : this.vinteseis_entrada_MPesa;
          this.vinteseis_entrada_Cheque = element.formaPagamento == "Cheque" ? +this.vinteseis_entrada_Cheque + +element.valor : this.vinteseis_entrada_Cheque;
          this.vinteseis_entrada_Convenio= element.formaPagamento == "Convênio" ? +this.vinteseis_entrada_Convenio + +element.valor : this.vinteseis_entrada_Convenio;
          
          this.vinteseis_entrada_Consulta = element.plano_nome == "CONSULTA_MEDICA" ? +this.vinteseis_entrada_Consulta + +element.valor : this.vinteseis_entrada_Consulta;
          this.vinteseis_entrada_Diagnostico = element.plano_nome == "DIAGNOSTICO_AUX" ? +this.vinteseis_entrada_Diagnostico + +element.valor : this.vinteseis_entrada_Diagnostico;
          this.vinteseis_entrada_Conduta = element.plano_nome == "CONDUTA CLINICA" ? +this.vinteseis_entrada_Conduta + +element.valor : this.vinteseis_entrada_Conduta;
          this.vinteseis_entrada_Medicamento = element.plano_nome == "MEDICAMENTO" ? +this.vinteseis_entrada_Medicamento + +element.valor : this.vinteseis_entrada_Medicamento;

          this.vinteseis_entrada_Total = element.tipo_nome == "2.Entrada" ? +this.vinteseis_entrada_Total + +element.valor : this.vinteseis_entrada_Total;

          this.vinteseis_saida_Energia = (element.tipo_nome == "1.Saida" && element.plano_nome == "Energia") ? +this.vinteseis_saida_Energia + +element.valor : this.vinteseis_saida_Energia;
          this.vinteseis_saida_Salario = (element.tipo_nome == "1.Saida" && element.plano_nome == "Salario") ? +this.vinteseis_saida_Salario + +element.valor : this.vinteseis_saida_Salario;
          this.vinteseis_saida_Transporte = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && element.subtipo_nome == "1.2.Despesas de transporte") ? +this.vinteseis_saida_Transporte + +element.valor : this.vinteseis_saida_Transporte;
          this.vinteseis_saida_Alimentacao = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && element.subtipo_nome == "1.3.Despesas de alimentacao") ? +this.vinteseis_saida_Alimentacao + +element.valor : this.vinteseis_saida_Alimentacao;
          this.vinteseis_saida_Admnistrativas = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && element.subtipo_nome == "1.1.Despesas admnistrativas") ? +this.vinteseis_saida_Admnistrativas + +element.valor : this.vinteseis_saida_Admnistrativas;
          this.vinteseis_saida_Outros = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && (element.subtipo_nome !== "1.1.Despesas admnistrativas" && element.subtipo_nome !== "1.2.Despesas de transporte" && element.subtipo_nome !== "1.3.Despesas de alimentacao")) ? +this.vinteseis_saida_Outros + +element.valor : this.vinteseis_saida_Outros;

          this.vinteseis_saida_Total = element.tipo_nome == "1.Saida" ? +this.vinteseis_saida_Total + +element.valor : this.vinteseis_saida_Total;             

          vinteseis_LancamentoConsolidado = new LancamentoConsolidado(
            element.dia,element.mes, this.vinteseis_entrada_NUMERARIO, this.vinteseis_entrada_POS, this.vinteseis_entrada_MPesa, this.vinteseis_entrada_Cheque, this.vinteseis_entrada_Convenio,
            this.vinteseis_entrada_Consulta, this.vinteseis_entrada_Diagnostico, this.vinteseis_entrada_Conduta, this.vinteseis_entrada_Medicamento, this.vinteseis_entrada_Total,
            this.vinteseis_saida_Energia, this.vinteseis_saida_Salario, this.vinteseis_saida_Alimentacao, this.vinteseis_saida_Transporte, this.vinteseis_saida_Admnistrativas,
            this.vinteseis_saida_Outros, this.vinteseis_saida_Total);
          break;
        }

        case "27": {
          this.vintesete_entrada_NUMERARIO = element.formaPagamento == "Numerário" ? +this.vintesete_entrada_NUMERARIO + +element.valor : this.vintesete_entrada_NUMERARIO;
          this.vintesete_entrada_POS = element.formaPagamento == "POS" ? +this.vintesete_entrada_POS + +element.valor : this.vintesete_entrada_POS;
          this.vintesete_entrada_MPesa = element.formaPagamento == "MPesa" ? +this.vintesete_entrada_MPesa + +element.valor : this.vintesete_entrada_MPesa;
          this.vintesete_entrada_Cheque = element.formaPagamento == "Cheque" ? +this.vintesete_entrada_Cheque + +element.valor : this.vintesete_entrada_Cheque;
          this.vintesete_entrada_Convenio= element.formaPagamento == "Convênio" ? +this.vintesete_entrada_Convenio + +element.valor : this.vintesete_entrada_Convenio;
          
          this.vintesete_entrada_Consulta = element.plano_nome == "CONSULTA_MEDICA" ? +this.vintesete_entrada_Consulta + +element.valor : this.vintesete_entrada_Consulta;
          this.vintesete_entrada_Diagnostico = element.plano_nome == "DIAGNOSTICO_AUX" ? +this.vintesete_entrada_Diagnostico + +element.valor : this.vintesete_entrada_Diagnostico;
          this.vintesete_entrada_Conduta = element.plano_nome == "CONDUTA CLINICA" ? +this.vintesete_entrada_Conduta + +element.valor : this.vintesete_entrada_Conduta;
          this.vintesete_entrada_Medicamento = element.plano_nome == "MEDICAMENTO" ? +this.vintesete_entrada_Medicamento + +element.valor : this.vintesete_entrada_Medicamento;

          this.vintesete_entrada_Total = element.tipo_nome == "2.Entrada" ? +this.vintesete_entrada_Total + +element.valor : this.vintesete_entrada_Total;

          this.vintesete_saida_Energia = (element.tipo_nome == "1.Saida" && element.plano_nome == "Energia") ? +this.vintesete_saida_Energia + +element.valor : this.vintesete_saida_Energia;
          this.vintesete_saida_Salario = (element.tipo_nome == "1.Saida" && element.plano_nome == "Salario") ? +this.vintesete_saida_Salario + +element.valor : this.vintesete_saida_Salario;
          this.vintesete_saida_Transporte = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && element.subtipo_nome == "1.2.Despesas de transporte") ? +this.vintesete_saida_Transporte + +element.valor : this.vintesete_saida_Transporte;
          this.vintesete_saida_Alimentacao = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && element.subtipo_nome == "1.3.Despesas de alimentacao") ? +this.vintesete_saida_Alimentacao + +element.valor : this.vintesete_saida_Alimentacao;
          this.vintesete_saida_Admnistrativas = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && element.subtipo_nome == "1.1.Despesas admnistrativas") ? +this.vintesete_saida_Admnistrativas + +element.valor : this.vintesete_saida_Admnistrativas;
          this.vintesete_saida_Outros = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && (element.subtipo_nome !== "1.1.Despesas admnistrativas" && element.subtipo_nome !== "1.2.Despesas de transporte" && element.subtipo_nome !== "1.3.Despesas de alimentacao")) ? +this.vintesete_saida_Outros + +element.valor : this.vintesete_saida_Outros;

          this.vintesete_saida_Total = element.tipo_nome == "1.Saida" ? +this.vintesete_saida_Total + +element.valor : this.vintesete_saida_Total;             

          vintesete_LancamentoConsolidado = new LancamentoConsolidado(
            element.dia,element.mes, this.vintesete_entrada_NUMERARIO, this.vintesete_entrada_POS, this.vintesete_entrada_MPesa, this.vintesete_entrada_Cheque, this.vintesete_entrada_Convenio,
            this.vintesete_entrada_Consulta, this.vintesete_entrada_Diagnostico, this.vintesete_entrada_Conduta, this.vintesete_entrada_Medicamento, this.vintesete_entrada_Total,
            this.vintesete_saida_Energia, this.vintesete_saida_Salario, this.vintesete_saida_Alimentacao, this.vintesete_saida_Transporte, this.vintesete_saida_Admnistrativas,
            this.vintesete_saida_Outros, this.vintesete_saida_Total);
          break;
        }

        case "28": {
          this.vinteoito_entrada_NUMERARIO = element.formaPagamento == "Numerário" ? +this.vinteoito_entrada_NUMERARIO + +element.valor : this.vinteoito_entrada_NUMERARIO;
          this.vinteoito_entrada_POS = element.formaPagamento == "POS" ? +this.vinteoito_entrada_POS + +element.valor : this.vinteoito_entrada_POS;
          this.vinteoito_entrada_MPesa = element.formaPagamento == "MPesa" ? +this.vinteoito_entrada_MPesa + +element.valor : this.vinteoito_entrada_MPesa;
          this.vinteoito_entrada_Cheque = element.formaPagamento == "Cheque" ? +this.vinteoito_entrada_Cheque + +element.valor : this.vinteoito_entrada_Cheque;
          this.vinteoito_entrada_Convenio= element.formaPagamento == "Convênio" ? +this.vinteoito_entrada_Convenio + +element.valor : this.vinteoito_entrada_Convenio;
          
          this.vinteoito_entrada_Consulta = element.plano_nome == "CONSULTA_MEDICA" ? +this.vinteoito_entrada_Consulta + +element.valor : this.vinteoito_entrada_Consulta;
          this.vinteoito_entrada_Diagnostico = element.plano_nome == "DIAGNOSTICO_AUX" ? +this.vinteoito_entrada_Diagnostico + +element.valor : this.vinteoito_entrada_Diagnostico;
          this.vinteoito_entrada_Conduta = element.plano_nome == "CONDUTA CLINICA" ? +this.vinteoito_entrada_Conduta + +element.valor : this.vinteoito_entrada_Conduta;
          this.vinteoito_entrada_Medicamento = element.plano_nome == "MEDICAMENTO" ? +this.vinteoito_entrada_Medicamento + +element.valor : this.vinteoito_entrada_Medicamento;

          this.vinteoito_entrada_Total = element.tipo_nome == "2.Entrada" ? +this.vinteoito_entrada_Total + +element.valor : this.vinteoito_entrada_Total;

          this.vinteoito_saida_Energia = (element.tipo_nome == "1.Saida" && element.plano_nome == "Energia") ? +this.vinteoito_saida_Energia + +element.valor : this.vinteoito_saida_Energia;
          this.vinteoito_saida_Salario = (element.tipo_nome == "1.Saida" && element.plano_nome == "Salario") ? +this.vinteoito_saida_Salario + +element.valor : this.vinteoito_saida_Salario;
          this.vinteoito_saida_Transporte = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && element.subtipo_nome == "1.2.Despesas de transporte") ? +this.vinteoito_saida_Transporte + +element.valor : this.vinteoito_saida_Transporte;
          this.vinteoito_saida_Alimentacao = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && element.subtipo_nome == "1.3.Despesas de alimentacao") ? +this.vinteoito_saida_Alimentacao + +element.valor : this.vinteoito_saida_Alimentacao;
          this.vinteoito_saida_Admnistrativas = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && element.subtipo_nome == "1.1.Despesas admnistrativas") ? +this.vinteoito_saida_Admnistrativas + +element.valor : this.vinteoito_saida_Admnistrativas;
          this.vinteoito_saida_Outros = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && (element.subtipo_nome !== "1.1.Despesas admnistrativas" && element.subtipo_nome !== "1.2.Despesas de transporte" && element.subtipo_nome !== "1.3.Despesas de alimentacao")) ? +this.vinteoito_saida_Outros + +element.valor : this.vinteoito_saida_Outros;

          this.vinteoito_saida_Total = element.tipo_nome == "1.Saida" ? +this.vinteoito_saida_Total + +element.valor : this.vinteoito_saida_Total;             

          vinteoito_LancamentoConsolidado = new LancamentoConsolidado(
            element.dia,element.mes, this.vinteoito_entrada_NUMERARIO, this.vinteoito_entrada_POS, this.vinteoito_entrada_MPesa, this.vinteoito_entrada_Cheque, this.vinteoito_entrada_Convenio,
            this.vinteoito_entrada_Consulta, this.vinteoito_entrada_Diagnostico, this.vinteoito_entrada_Conduta, this.vinteoito_entrada_Medicamento, this.vinteoito_entrada_Total,
            this.vinteoito_saida_Energia, this.vinteoito_saida_Salario, this.vinteoito_saida_Alimentacao, this.vinteoito_saida_Transporte, this.vinteoito_saida_Admnistrativas,
            this.vinteoito_saida_Outros, this.vinteoito_saida_Total);
          break;
        }

        case "29": {
          this.vintenove_entrada_NUMERARIO = element.formaPagamento == "Numerário" ? +this.vintenove_entrada_NUMERARIO + +element.valor : this.vintenove_entrada_NUMERARIO;
          this.vintenove_entrada_POS = element.formaPagamento == "POS" ? +this.vintenove_entrada_POS + +element.valor : this.vintenove_entrada_POS;
          this.vintenove_entrada_MPesa = element.formaPagamento == "MPesa" ? +this.vintenove_entrada_MPesa + +element.valor : this.vintenove_entrada_MPesa;
          this.vintenove_entrada_Cheque = element.formaPagamento == "Cheque" ? +this.vintenove_entrada_Cheque + +element.valor : this.vintenove_entrada_Cheque;
          this.vintenove_entrada_Convenio= element.formaPagamento == "Convênio" ? +this.vintenove_entrada_Convenio + +element.valor : this.vintenove_entrada_Convenio;
          
          this.vintenove_entrada_Consulta = element.plano_nome == "CONSULTA_MEDICA" ? +this.vintenove_entrada_Consulta + +element.valor : this.vintenove_entrada_Consulta;
          this.vintenove_entrada_Diagnostico = element.plano_nome == "DIAGNOSTICO_AUX" ? +this.vintenove_entrada_Diagnostico + +element.valor : this.vintenove_entrada_Diagnostico;
          this.vintenove_entrada_Conduta = element.plano_nome == "CONDUTA CLINICA" ? +this.vintenove_entrada_Conduta + +element.valor : this.vintenove_entrada_Conduta;
          this.vintenove_entrada_Medicamento = element.plano_nome == "MEDICAMENTO" ? +this.vintenove_entrada_Medicamento + +element.valor : this.vintenove_entrada_Medicamento;

          this.vintenove_entrada_Total = element.tipo_nome == "2.Entrada" ? +this.vintenove_entrada_Total + +element.valor : this.vintenove_entrada_Total;

          this.vintenove_saida_Energia = (element.tipo_nome == "1.Saida" && element.plano_nome == "Energia") ? +this.vintenove_saida_Energia + +element.valor : this.vintenove_saida_Energia;
          this.vintenove_saida_Salario = (element.tipo_nome == "1.Saida" && element.plano_nome == "Salario") ? +this.vintenove_saida_Salario + +element.valor : this.vintenove_saida_Salario;
          this.vintenove_saida_Transporte = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && element.subtipo_nome == "1.2.Despesas de transporte") ? +this.vintenove_saida_Transporte + +element.valor : this.vintenove_saida_Transporte;
          this.vintenove_saida_Alimentacao = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && element.subtipo_nome == "1.3.Despesas de alimentacao") ? +this.vintenove_saida_Alimentacao + +element.valor : this.vintenove_saida_Alimentacao;
          this.vintenove_saida_Admnistrativas = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && element.subtipo_nome == "1.1.Despesas admnistrativas") ? +this.vintenove_saida_Admnistrativas + +element.valor : this.vintenove_saida_Admnistrativas;
          this.vintenove_saida_Outros = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && (element.subtipo_nome !== "1.1.Despesas admnistrativas" && element.subtipo_nome !== "1.2.Despesas de transporte" && element.subtipo_nome !== "1.3.Despesas de alimentacao")) ? +this.vintenove_saida_Outros + +element.valor : this.vintenove_saida_Outros;

          this.vintenove_saida_Total = element.tipo_nome == "1.Saida" ? +this.vintenove_saida_Total + +element.valor : this.vintenove_saida_Total;             

          vintenove_LancamentoConsolidado = new LancamentoConsolidado(
            element.dia,element.mes, this.vintenove_entrada_NUMERARIO, this.vintenove_entrada_POS, this.vintenove_entrada_MPesa, this.vintenove_entrada_Cheque, this.vintenove_entrada_Convenio,
            this.vintenove_entrada_Consulta, this.vintenove_entrada_Diagnostico, this.vintenove_entrada_Conduta, this.vintenove_entrada_Medicamento, this.vintenove_entrada_Total,
            this.vintenove_saida_Energia, this.vintenove_saida_Salario, this.vintenove_saida_Alimentacao, this.vintenove_saida_Transporte, this.vintenove_saida_Admnistrativas,
            this.vintenove_saida_Outros, this.vintenove_saida_Total);
          
          break;
        }

        case "30": {
          this.trinta_entrada_NUMERARIO = element.formaPagamento == "Numerário" ? +this.trinta_entrada_NUMERARIO + +element.valor : this.trinta_entrada_NUMERARIO;
          this.trinta_entrada_POS = element.formaPagamento == "POS" ? +this.trinta_entrada_POS + +element.valor : this.trinta_entrada_POS;
          this.trinta_entrada_MPesa = element.formaPagamento == "MPesa" ? +this.trinta_entrada_MPesa + +element.valor : this.trinta_entrada_MPesa;
          this.trinta_entrada_Cheque = element.formaPagamento == "Cheque" ? +this.trinta_entrada_Cheque + +element.valor : this.trinta_entrada_Cheque;
          this.trinta_entrada_Convenio= element.formaPagamento == "Convênio" ? +this.trinta_entrada_Convenio + +element.valor : this.trinta_entrada_Convenio;
          
          this.trinta_entrada_Consulta = element.plano_nome == "CONSULTA_MEDICA" ? +this.trinta_entrada_Consulta + +element.valor : this.trinta_entrada_Consulta;
          this.trinta_entrada_Diagnostico = element.plano_nome == "DIAGNOSTICO_AUX" ? +this.trinta_entrada_Diagnostico + +element.valor : this.trinta_entrada_Diagnostico;
          this.trinta_entrada_Conduta = element.plano_nome == "CONDUTA CLINICA" ? +this.trinta_entrada_Conduta + +element.valor : this.trinta_entrada_Conduta;
          this.trinta_entrada_Medicamento = element.plano_nome == "MEDICAMENTO" ? +this.trinta_entrada_Medicamento + +element.valor : this.trinta_entrada_Medicamento;

          this.trinta_entrada_Total = element.tipo_nome == "2.Entrada" ? +this.trinta_entrada_Total + +element.valor : this.trinta_entrada_Total;

          this.trinta_saida_Energia = (element.tipo_nome == "1.Saida" && element.plano_nome == "Energia") ? +this.trinta_saida_Energia + +element.valor : this.trinta_saida_Energia;
          this.trinta_saida_Salario = (element.tipo_nome == "1.Saida" && element.plano_nome == "Salario") ? +this.trinta_saida_Salario + +element.valor : this.trinta_saida_Salario;
          this.trinta_saida_Transporte = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && element.subtipo_nome == "1.2.Despesas de transporte") ? +this.trinta_saida_Transporte + +element.valor : this.trinta_saida_Transporte;
          this.trinta_saida_Alimentacao = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && element.subtipo_nome == "1.3.Despesas de alimentacao") ? +this.trinta_saida_Alimentacao + +element.valor : this.trinta_saida_Alimentacao;
          this.trinta_saida_Admnistrativas = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && element.subtipo_nome == "1.1.Despesas admnistrativas") ? +this.trinta_saida_Admnistrativas + +element.valor : this.trinta_saida_Admnistrativas;
          this.trinta_saida_Outros = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && (element.subtipo_nome !== "1.1.Despesas admnistrativas" && element.subtipo_nome !== "1.2.Despesas de transporte" && element.subtipo_nome !== "1.3.Despesas de alimentacao")) ? +this.trinta_saida_Outros + +element.valor : this.trinta_saida_Outros;

          this.trinta_saida_Total = element.tipo_nome == "1.Saida" ? +this.trinta_saida_Total + +element.valor : this.trinta_saida_Total;             

          trinta_LancamentoConsolidado = new LancamentoConsolidado(
            element.dia,element.mes, this.trinta_entrada_NUMERARIO, this.trinta_entrada_POS, this.trinta_entrada_MPesa, this.trinta_entrada_Cheque, this.trinta_entrada_Convenio,
            this.trinta_entrada_Consulta, this.trinta_entrada_Diagnostico, this.trinta_entrada_Conduta, this.trinta_entrada_Medicamento, this.trinta_entrada_Total,
            this.trinta_saida_Energia, this.trinta_saida_Salario, this.trinta_saida_Alimentacao, this.trinta_saida_Transporte, this.trinta_saida_Admnistrativas,
            this.trinta_saida_Outros, this.trinta_saida_Total);
          
          break;
        }

        case "31": {
          this.trintaum_entrada_NUMERARIO = element.formaPagamento == "Numerário" ? +this.trintaum_entrada_NUMERARIO + +element.valor : this.trintaum_entrada_NUMERARIO;
          this.trintaum_entrada_POS = element.formaPagamento == "POS" ? +this.trintaum_entrada_POS + +element.valor : this.trintaum_entrada_POS;
          this.trintaum_entrada_MPesa = element.formaPagamento == "MPesa" ? +this.trintaum_entrada_MPesa + +element.valor : this.trintaum_entrada_MPesa;
          this.trintaum_entrada_Cheque = element.formaPagamento == "Cheque" ? +this.trintaum_entrada_Cheque + +element.valor : this.trintaum_entrada_Cheque;
          this.trintaum_entrada_Convenio= element.formaPagamento == "Convênio" ? +this.trintaum_entrada_Convenio + +element.valor : this.trintaum_entrada_Convenio;
          
          this.trintaum_entrada_Consulta = element.plano_nome == "CONSULTA_MEDICA" ? +this.trintaum_entrada_Consulta + +element.valor : this.trintaum_entrada_Consulta;
          this.trintaum_entrada_Diagnostico = element.plano_nome == "DIAGNOSTICO_AUX" ? +this.trintaum_entrada_Diagnostico + +element.valor : this.trintaum_entrada_Diagnostico;
          this.trintaum_entrada_Conduta = element.plano_nome == "CONDUTA CLINICA" ? +this.trintaum_entrada_Conduta + +element.valor : this.trintaum_entrada_Conduta;
          this.trintaum_entrada_Medicamento = element.plano_nome == "MEDICAMENTO" ? +this.trintaum_entrada_Medicamento + +element.valor : this.trintaum_entrada_Medicamento;

          this.trintaum_entrada_Total = element.tipo_nome == "2.Entrada" ? +this.trintaum_entrada_Total + +element.valor : this.trintaum_entrada_Total;

          this.trintaum_saida_Energia = (element.tipo_nome == "1.Saida" && element.plano_nome == "Energia") ? +this.trintaum_saida_Energia + +element.valor : this.trintaum_saida_Energia;
          this.trintaum_saida_Salario = (element.tipo_nome == "1.Saida" && element.plano_nome == "Salario") ? +this.trintaum_saida_Salario + +element.valor : this.trintaum_saida_Salario;
          this.trintaum_saida_Transporte = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && element.subtipo_nome == "1.2.Despesas de transporte") ? +this.trintaum_saida_Transporte + +element.valor : this.trintaum_saida_Transporte;
          this.trintaum_saida_Alimentacao = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && element.subtipo_nome == "1.3.Despesas de alimentacao") ? +this.trintaum_saida_Alimentacao + +element.valor : this.trintaum_saida_Alimentacao;
          this.trintaum_saida_Admnistrativas = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && element.subtipo_nome == "1.1.Despesas admnistrativas") ? +this.trintaum_saida_Admnistrativas + +element.valor : this.trintaum_saida_Admnistrativas;
          this.trintaum_saida_Outros = (element.tipo_nome == "1.Saida" && (element.plano_nome !== "Energia" && element.plano_nome !="Salario") && (element.subtipo_nome !== "1.1.Despesas admnistrativas" && element.subtipo_nome !== "1.2.Despesas de transporte" && element.subtipo_nome !== "1.3.Despesas de alimentacao")) ? +this.trintaum_saida_Outros + +element.valor : this.trintaum_saida_Outros;

          this.trintaum_saida_Total = element.tipo_nome == "1.Saida" ? +this.trintaum_saida_Total + +element.valor : this.trintaum_saida_Total;             

          trintaum_LancamentoConsolidado = new LancamentoConsolidado(
            element.dia,element.mes, this.trintaum_entrada_NUMERARIO, this.trintaum_entrada_POS, this.trintaum_entrada_MPesa, this.trintaum_entrada_Cheque, this.trintaum_entrada_Convenio,
            this.trintaum_entrada_Consulta, this.trintaum_entrada_Diagnostico, this.trintaum_entrada_Conduta, this.trintaum_entrada_Medicamento, this.trintaum_entrada_Total,
            this.trintaum_saida_Energia, this.trintaum_saida_Salario, this.trintaum_saida_Alimentacao, this.trintaum_saida_Transporte, this.trintaum_saida_Admnistrativas,
            this.trintaum_saida_Outros, this.trintaum_saida_Total);
          break;
        }
        default: { 
           //statements; 
           break; 
        } 
      }
    });

    this.lancamentosConsolidados = [];
    this.lancamentosConsolidados.push(um_LancamentoConsolidado);
    this.lancamentosConsolidados.push(dois_LancamentoConsolidado);
    this.lancamentosConsolidados.push(tres_LancamentoConsolidado);
    this.lancamentosConsolidados.push(quatro_LancamentoConsolidado);
    this.lancamentosConsolidados.push(cinco_LancamentoConsolidado);
    this.lancamentosConsolidados.push(seis_LancamentoConsolidado);
    this.lancamentosConsolidados.push(sete_LancamentoConsolidado);
    this.lancamentosConsolidados.push(oito_LancamentoConsolidado);
    this.lancamentosConsolidados.push(nove_LancamentoConsolidado);
    this.lancamentosConsolidados.push(dez_LancamentoConsolidado);
    this.lancamentosConsolidados.push(onze_LancamentoConsolidado);
    this.lancamentosConsolidados.push(doze_LancamentoConsolidado);
    this.lancamentosConsolidados.push(treze_LancamentoConsolidado);
    this.lancamentosConsolidados.push(catorze_LancamentoConsolidado);
    this.lancamentosConsolidados.push(quinze_LancamentoConsolidado);
    this.lancamentosConsolidados.push(dezasseis_LancamentoConsolidado);
    this.lancamentosConsolidados.push(dezassete_LancamentoConsolidado);
    this.lancamentosConsolidados.push(dezoito_LancamentoConsolidado);
    this.lancamentosConsolidados.push(dezanove_LancamentoConsolidado);
    this.lancamentosConsolidados.push(vinte_LancamentoConsolidado);
    this.lancamentosConsolidados.push(vinteum_LancamentoConsolidado);
    this.lancamentosConsolidados.push(vintedois_LancamentoConsolidado);
    this.lancamentosConsolidados.push(vintetrez_LancamentoConsolidado);
    this.lancamentosConsolidados.push(vintequatro_LancamentoConsolidado);
    this.lancamentosConsolidados.push(vintecinco_LancamentoConsolidado);
    this.lancamentosConsolidados.push(vinteseis_LancamentoConsolidado);
    this.lancamentosConsolidados.push(vintesete_LancamentoConsolidado);
    this.lancamentosConsolidados.push(vinteoito_LancamentoConsolidado);
    this.lancamentosConsolidados.push(vintenove_LancamentoConsolidado);
    this.lancamentosConsolidados.push(trinta_LancamentoConsolidado);
    this.lancamentosConsolidados.push(trintaum_LancamentoConsolidado);

    //Farmacias
    if(this.acesso_indicadores3){
      this.dataSourseLancamentos=new MatTableDataSource(this.lancamentosConsolidados.sort((a, b) => a.dia > b.dia ? 1 : -1));
      setTimeout(()=> this.dataSourseLancamentos.paginator = this.paginatorLancamentos);
    }

    //Clinicas
    if(this.acesso_indicadores4){
      this.dataSourseLancamentos2=new MatTableDataSource(this.lancamentosConsolidados.sort((a, b) => a.dia > b.dia ? 1 : -1));
      setTimeout(()=> this.dataSourseLancamentos2.paginator = this.paginatorLancamentos2);
    }
  
  })















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


  resetDadosLancamentos(){
      //ENTRADA POS
  this.um_entrada_POS = 0
  this.dois_entrada_POS = 0
  this.tres_entrada_POS = 0
  this.quatro_entrada_POS = 0
  this.cinco_entrada_POS = 0
  this.seis_entrada_POS = 0
  this.sete_entrada_POS = 0
  this.oito_entrada_POS = 0
  this.nove_entrada_POS = 0
  this.dez_entrada_POS = 0
  this.onze_entrada_POS = 0
  this.doze_entrada_POS = 0
  this.treze_entrada_POS = 0
  this.catorze_entrada_POS = 0
  this.quinze_entrada_POS = 0
  this.dezasseis_entrada_POS = 0
  this.dezassete_entrada_POS = 0
  this.dezoito_entrada_POS = 0
  this.dezanove_entrada_POS = 0
  this.vinte_entrada_POS = 0
  this.vinteum_entrada_POS = 0
  this.vintedois_entrada_POS = 0
  this.vintetrez_entrada_POS = 0
  this.vintequatro_entrada_POS = 0
  this.vintecinco_entrada_POS = 0
  this.vinteseis_entrada_POS = 0
  this.vintesete_entrada_POS = 0
  this.vinteoito_entrada_POS = 0
  this.vintenove_entrada_POS = 0
  this.trinta_entrada_POS = 0
  this.trintaum_entrada_POS = 0

  //ENTRADA NUMERARIO
  this.um_entrada_NUMERARIO = 0
  this.dois_entrada_NUMERARIO = 0
  this.tres_entrada_NUMERARIO = 0
  this.quatro_entrada_NUMERARIO = 0
  this.cinco_entrada_NUMERARIO = 0
  this.seis_entrada_NUMERARIO = 0
  this.sete_entrada_NUMERARIO = 0
  this.oito_entrada_NUMERARIO = 0
  this.nove_entrada_NUMERARIO = 0
  this.dez_entrada_NUMERARIO = 0
  this.onze_entrada_NUMERARIO = 0
  this.doze_entrada_NUMERARIO = 0
  this.treze_entrada_NUMERARIO = 0
  this.catorze_entrada_NUMERARIO = 0
  this.quinze_entrada_NUMERARIO = 0
  this.dezasseis_entrada_NUMERARIO = 0
  this.dezassete_entrada_NUMERARIO = 0
  this.dezoito_entrada_NUMERARIO = 0
  this.dezanove_entrada_NUMERARIO = 0
  this.vinte_entrada_NUMERARIO = 0
  this.vinteum_entrada_NUMERARIO = 0
  this.vintedois_entrada_NUMERARIO = 0
  this.vintetrez_entrada_NUMERARIO = 0
  this.vintequatro_entrada_NUMERARIO = 0
  this.vintecinco_entrada_NUMERARIO = 0
  this.vinteseis_entrada_NUMERARIO = 0
  this.vintesete_entrada_NUMERARIO = 0
  this.vinteoito_entrada_NUMERARIO = 0
  this.vintenove_entrada_NUMERARIO = 0
  this.trinta_entrada_NUMERARIO = 0
  this.trintaum_entrada_NUMERARIO = 0

  //ENTRADA MPESA
  this.um_entrada_MPesa = 0
  this.dois_entrada_MPesa = 0
  this.tres_entrada_MPesa = 0
  this.quatro_entrada_MPesa = 0
  this.cinco_entrada_MPesa = 0
  this.seis_entrada_MPesa = 0
  this.sete_entrada_MPesa = 0
  this.oito_entrada_MPesa = 0
  this.nove_entrada_MPesa = 0
  this.dez_entrada_MPesa = 0
  this.onze_entrada_MPesa = 0
  this.doze_entrada_MPesa = 0
  this.treze_entrada_MPesa = 0
  this.catorze_entrada_MPesa = 0
  this.quinze_entrada_MPesa = 0
  this.dezasseis_entrada_MPesa = 0
  this.dezassete_entrada_MPesa = 0
  this.dezoito_entrada_MPesa = 0
  this.dezanove_entrada_MPesa = 0
  this.vinte_entrada_MPesa = 0
  this.vinteum_entrada_MPesa = 0
  this.vintedois_entrada_MPesa = 0
  this.vintetrez_entrada_MPesa = 0
  this.vintequatro_entrada_MPesa = 0
  this.vintecinco_entrada_MPesa = 0
  this.vinteseis_entrada_MPesa = 0
  this.vintesete_entrada_MPesa = 0
  this.vinteoito_entrada_MPesa = 0
  this.vintenove_entrada_MPesa = 0
  this.trinta_entrada_MPesa = 0
  this.trintaum_entrada_MPesa = 0

  //ENTRADA CHEQUE
  this.um_entrada_Cheque = 0
  this.dois_entrada_Cheque = 0
  this.tres_entrada_Cheque = 0
  this.quatro_entrada_Cheque = 0
  this.cinco_entrada_Cheque = 0
  this.seis_entrada_Cheque = 0
  this.sete_entrada_Cheque = 0
  this.oito_entrada_Cheque = 0
  this.nove_entrada_Cheque = 0
  this.dez_entrada_Cheque = 0
  this.onze_entrada_Cheque = 0
  this.doze_entrada_Cheque = 0
  this.treze_entrada_Cheque = 0
  this.catorze_entrada_Cheque = 0
  this.quinze_entrada_Cheque = 0
  this.dezasseis_entrada_Cheque = 0
  this.dezassete_entrada_Cheque = 0
  this.dezoito_entrada_Cheque = 0
  this.dezanove_entrada_Cheque = 0
  this.vinte_entrada_Cheque = 0
  this.vinteum_entrada_Cheque = 0
  this.vintedois_entrada_Cheque = 0
  this.vintetrez_entrada_Cheque = 0
  this.vintequatro_entrada_Cheque = 0
  this.vintecinco_entrada_Cheque = 0
  this.vinteseis_entrada_Cheque = 0
  this.vintesete_entrada_Cheque = 0
  this.vinteoito_entrada_Cheque = 0
  this.vintenove_entrada_Cheque = 0
  this.trinta_entrada_Cheque = 0
  this.trintaum_entrada_Cheque = 0

  //ENTRADA CONVEBIO
  this.um_entrada_Convenio = 0
  this.dois_entrada_Convenio = 0
  this.tres_entrada_Convenio = 0
  this.quatro_entrada_Convenio = 0
  this.cinco_entrada_Convenio = 0
  this.seis_entrada_Convenio = 0
  this.sete_entrada_Convenio = 0
  this.oito_entrada_Convenio = 0
  this.nove_entrada_Convenio = 0
  this.dez_entrada_Convenio = 0
  this.onze_entrada_Convenio = 0
  this.doze_entrada_Convenio = 0
  this.treze_entrada_Convenio = 0
  this.catorze_entrada_Convenio = 0
  this.quinze_entrada_Convenio = 0
  this.dezasseis_entrada_Convenio = 0
  this.dezassete_entrada_Convenio = 0
  this.dezoito_entrada_Convenio = 0
  this.dezanove_entrada_Convenio = 0
  this.vinte_entrada_Convenio = 0
  this.vinteum_entrada_Convenio = 0
  this.vintedois_entrada_Convenio = 0
  this.vintetrez_entrada_Convenio = 0
  this.vintequatro_entrada_Convenio = 0
  this.vintecinco_entrada_Convenio = 0
  this.vinteseis_entrada_Convenio = 0
  this.vintesete_entrada_Convenio = 0
  this.vinteoito_entrada_Convenio = 0
  this.vintenove_entrada_Convenio = 0
  this.trinta_entrada_Convenio = 0
  this.trintaum_entrada_Convenio = 0

  //ENTRADA CONSULTA
  this.um_entrada_Consulta = 0
  this.dois_entrada_Consulta = 0
  this.tres_entrada_Consulta = 0
  this.quatro_entrada_Consulta = 0
  this.cinco_entrada_Consulta = 0
  this.seis_entrada_Consulta = 0
  this.sete_entrada_Consulta = 0
  this.oito_entrada_Consulta = 0
  this.nove_entrada_Consulta = 0
  this.dez_entrada_Consulta = 0
  this.onze_entrada_Consulta = 0
  this.doze_entrada_Consulta = 0
  this.treze_entrada_Consulta = 0
  this.catorze_entrada_Consulta = 0
  this.quinze_entrada_Consulta = 0
  this.dezasseis_entrada_Consulta = 0
  this.dezassete_entrada_Consulta = 0
  this.dezoito_entrada_Consulta = 0
  this.dezanove_entrada_Consulta = 0
  this.vinte_entrada_Consulta = 0
  this.vinteum_entrada_Consulta = 0
  this.vintedois_entrada_Consulta = 0
  this.vintetrez_entrada_Consulta = 0
  this.vintequatro_entrada_Consulta = 0
  this.vintecinco_entrada_Consulta = 0
  this.vinteseis_entrada_Consulta = 0
  this.vintesete_entrada_Consulta = 0
  this.vinteoito_entrada_Consulta = 0
  this.vintenove_entrada_Consulta = 0
  this.trinta_entrada_Consulta = 0
  this.trintaum_entrada_Consulta = 0

  //ENTRADA DIAGNOSTICO AUX
  this.um_entrada_Diagnostico = 0
  this.dois_entrada_Diagnostico = 0
  this.tres_entrada_Diagnostico = 0
  this.quatro_entrada_Diagnostico = 0
  this.cinco_entrada_Diagnostico = 0
  this.seis_entrada_Diagnostico = 0
  this.sete_entrada_Diagnostico = 0
  this.oito_entrada_Diagnostico = 0
  this.nove_entrada_Diagnostico = 0
  this.dez_entrada_Diagnostico = 0
  this.onze_entrada_Diagnostico = 0
  this.doze_entrada_Diagnostico = 0
  this.treze_entrada_Diagnostico = 0
  this.catorze_entrada_Diagnostico = 0
  this.quinze_entrada_Diagnostico = 0
  this.dezasseis_entrada_Diagnostico = 0
  this.dezassete_entrada_Diagnostico = 0
  this.dezoito_entrada_Diagnostico = 0
  this.dezanove_entrada_Diagnostico = 0
  this.vinte_entrada_Diagnostico = 0
  this.vinteum_entrada_Diagnostico = 0
  this.vintedois_entrada_Diagnostico = 0
  this.vintetrez_entrada_Diagnostico = 0
  this.vintequatro_entrada_Diagnostico = 0
  this.vintecinco_entrada_Diagnostico = 0
  this.vinteseis_entrada_Diagnostico = 0
  this.vintesete_entrada_Diagnostico = 0
  this.vinteoito_entrada_Diagnostico = 0
  this.vintenove_entrada_Diagnostico = 0
  this.trinta_entrada_Diagnostico = 0
  this.trintaum_entrada_Diagnostico = 0

  //ENTRADA CONDUTAS
  this.um_entrada_Conduta = 0
  this.dois_entrada_Conduta = 0
  this.tres_entrada_Conduta = 0
  this.quatro_entrada_Conduta = 0
  this.cinco_entrada_Conduta = 0
  this.seis_entrada_Conduta = 0
  this.sete_entrada_Conduta = 0
  this.oito_entrada_Conduta = 0
  this.nove_entrada_Conduta = 0
  this.dez_entrada_Conduta = 0
  this.onze_entrada_Conduta = 0
  this.doze_entrada_Conduta = 0
  this.treze_entrada_Conduta = 0
  this.catorze_entrada_Conduta = 0
  this.quinze_entrada_Conduta = 0
  this.dezasseis_entrada_Conduta = 0
  this.dezassete_entrada_Conduta = 0
  this.dezoito_entrada_Conduta = 0
  this.dezanove_entrada_Conduta = 0
  this.vinte_entrada_Conduta = 0
  this.vinteum_entrada_Conduta = 0
  this.vintedois_entrada_Conduta = 0
  this.vintetrez_entrada_Conduta = 0
  this.vintequatro_entrada_Conduta = 0
  this.vintecinco_entrada_Conduta = 0
  this.vinteseis_entrada_Conduta = 0
  this.vintesete_entrada_Conduta = 0
  this.vinteoito_entrada_Conduta = 0
  this.vintenove_entrada_Conduta = 0
  this.trinta_entrada_Conduta = 0
  this.trintaum_entrada_Conduta = 0

  //ENTRADA MEDICAMENTO
  this.um_entrada_Medicamento = 0
  this.dois_entrada_Medicamento = 0
  this.tres_entrada_Medicamento = 0
  this.quatro_entrada_Medicamento = 0
  this.cinco_entrada_Medicamento = 0
  this.seis_entrada_Medicamento = 0
  this.sete_entrada_Medicamento = 0
  this.oito_entrada_Medicamento = 0
  this.nove_entrada_Medicamento = 0
  this.dez_entrada_Medicamento = 0
  this.onze_entrada_Medicamento = 0
  this.doze_entrada_Medicamento = 0
  this.treze_entrada_Medicamento = 0
  this.catorze_entrada_Medicamento = 0
  this.quinze_entrada_Medicamento = 0
  this.dezasseis_entrada_Medicamento = 0
  this.dezassete_entrada_Medicamento = 0
  this.dezoito_entrada_Medicamento = 0
  this.dezanove_entrada_Medicamento = 0
  this.vinte_entrada_Medicamento = 0
  this.vinteum_entrada_Medicamento = 0
  this.vintedois_entrada_Medicamento = 0
  this.vintetrez_entrada_Medicamento = 0
  this.vintequatro_entrada_Medicamento = 0
  this.vintecinco_entrada_Medicamento = 0
  this.vinteseis_entrada_Medicamento = 0
  this.vintesete_entrada_Medicamento = 0
  this.vinteoito_entrada_Medicamento = 0
  this.vintenove_entrada_Medicamento = 0
  this.trinta_entrada_Medicamento = 0
  this.trintaum_entrada_Medicamento = 0

  //ENTRADA TOTAL
  this.um_entrada_Total = 0
  this.dois_entrada_Total = 0
  this.tres_entrada_Total = 0
  this.quatro_entrada_Total = 0
  this.cinco_entrada_Total = 0
  this.seis_entrada_Total = 0
  this.sete_entrada_Total = 0
  this.oito_entrada_Total = 0
  this.nove_entrada_Total = 0
  this.dez_entrada_Total = 0
  this.onze_entrada_Total = 0
  this.doze_entrada_Total = 0
  this.treze_entrada_Total = 0
  this.catorze_entrada_Total = 0
  this.quinze_entrada_Total = 0
  this.dezasseis_entrada_Total = 0
  this.dezassete_entrada_Total = 0
  this.dezoito_entrada_Total = 0
  this.dezanove_entrada_Total = 0
  this.vinte_entrada_Total = 0
  this.vinteum_entrada_Total = 0
  this.vintedois_entrada_Total = 0
  this.vintetrez_entrada_Total = 0
  this.vintequatro_entrada_Total = 0
  this.vintecinco_entrada_Total = 0
  this.vinteseis_entrada_Total = 0
  this.vintesete_entrada_Total = 0
  this.vinteoito_entrada_Total = 0
  this.vintenove_entrada_Total = 0
  this.trinta_entrada_Total = 0
  this.trintaum_entrada_Total = 0

  //SAIDA TOTAL
  this.um_saida_Total = 0
  this.dois_saida_Total = 0
  this.tres_saida_Total = 0
  this.quatro_saida_Total = 0
  this.cinco_saida_Total = 0
  this.seis_saida_Total = 0
  this.sete_saida_Total = 0
  this.oito_saida_Total = 0
  this.nove_saida_Total = 0
  this.dez_saida_Total = 0
  this.onze_saida_Total = 0
  this.doze_saida_Total = 0
  this.treze_saida_Total = 0
  this.catorze_saida_Total = 0
  this.quinze_saida_Total = 0
  this.dezasseis_saida_Total = 0
  this.dezassete_saida_Total = 0
  this.dezoito_saida_Total = 0
  this.dezanove_saida_Total = 0
  this.vinte_saida_Total = 0
  this.vinteum_saida_Total = 0
  this.vintedois_saida_Total = 0
  this.vintetrez_saida_Total = 0
  this.vintequatro_saida_Total = 0
  this.vintecinco_saida_Total = 0
  this.vinteseis_saida_Total = 0
  this.vintesete_saida_Total = 0
  this.vinteoito_saida_Total = 0
  this.vintenove_saida_Total = 0
  this.trinta_saida_Total = 0
  this.trintaum_saida_Total = 0

  //SAIDA ENERGIA
  this.um_saida_Energia = 0
  this.dois_saida_Energia = 0
  this.tres_saida_Energia = 0
  this.quatro_saida_Energia = 0
  this.cinco_saida_Energia = 0
  this.seis_saida_Energia = 0
  this.sete_saida_Energia = 0
  this.oito_saida_Energia = 0
  this.nove_saida_Energia = 0
  this.dez_saida_Energia = 0
  this.onze_saida_Energia = 0
  this.doze_saida_Energia = 0
  this.treze_saida_Energia = 0
  this.catorze_saida_Energia = 0
  this.quinze_saida_Energia = 0
  this.dezasseis_saida_Energia = 0
  this.dezassete_saida_Energia = 0
  this.dezoito_saida_Energia = 0
  this.dezanove_saida_Energia = 0
  this.vinte_saida_Energia = 0
  this.vinteum_saida_Energia = 0
  this.vintedois_saida_Energia = 0
  this.vintetrez_saida_Energia = 0
  this.vintequatro_saida_Energia = 0
  this.vintecinco_saida_Energia = 0
  this.vinteseis_saida_Energia = 0
  this.vintesete_saida_Energia = 0
  this.vinteoito_saida_Energia = 0
  this.vintenove_saida_Energia = 0
  this.trinta_saida_Energia = 0
  this.trintaum_saida_Energia = 0

  //SAIDA DESPESAS ADMNISTRATIVAS
  this.um_saida_Admnistrativas = 0
  this.dois_saida_Admnistrativas = 0
  this.tres_saida_Admnistrativas = 0
  this.quatro_saida_Admnistrativas = 0
  this.cinco_saida_Admnistrativas = 0
  this.seis_saida_Admnistrativas = 0
  this.sete_saida_Admnistrativas = 0
  this.oito_saida_Admnistrativas = 0
  this.nove_saida_Admnistrativas = 0
  this.dez_saida_Admnistrativas = 0
  this.onze_saida_Admnistrativas = 0
  this.doze_saida_Admnistrativas = 0
  this.treze_saida_Admnistrativas = 0
  this.catorze_saida_Admnistrativas = 0
  this.quinze_saida_Admnistrativas = 0
  this.dezasseis_saida_Admnistrativas = 0
  this.dezassete_saida_Admnistrativas = 0
  this.dezoito_saida_Admnistrativas = 0
  this.dezanove_saida_Admnistrativas = 0
  this.vinte_saida_Admnistrativas = 0
  this.vinteum_saida_Admnistrativas = 0
  this.vintedois_saida_Admnistrativas = 0
  this.vintetrez_saida_Admnistrativas = 0
  this.vintequatro_saida_Admnistrativas = 0
  this.vintecinco_saida_Admnistrativas = 0
  this.vinteseis_saida_Admnistrativas = 0
  this.vintesete_saida_Admnistrativas = 0
  this.vinteoito_saida_Admnistrativas = 0
  this.vintenove_saida_Admnistrativas = 0
  this.trinta_saida_Admnistrativas = 0
  this.trintaum_saida_Admnistrativas = 0

  //SAIDA ALIMENTACAO
  this.um_saida_Alimentacao = 0
  this.dois_saida_Alimentacao = 0
  this.tres_saida_Alimentacao = 0
  this.quatro_saida_Alimentacao = 0
  this.cinco_saida_Alimentacao = 0
  this.seis_saida_Alimentacao = 0
  this.sete_saida_Alimentacao = 0
  this.oito_saida_Alimentacao = 0
  this.nove_saida_Alimentacao = 0
  this.dez_saida_Alimentacao = 0
  this.onze_saida_Alimentacao = 0
  this.doze_saida_Alimentacao = 0
  this.treze_saida_Alimentacao = 0
  this.catorze_saida_Alimentacao = 0
  this.quinze_saida_Alimentacao = 0
  this.dezasseis_saida_Alimentacao = 0
  this.dezassete_saida_Alimentacao = 0
  this.dezoito_saida_Alimentacao = 0
  this.dezanove_saida_Alimentacao = 0
  this.vinte_saida_Alimentacao = 0
  this.vinteum_saida_Alimentacao = 0
  this.vintedois_saida_Alimentacao = 0
  this.vintetrez_saida_Alimentacao = 0
  this.vintequatro_saida_Alimentacao = 0
  this.vintecinco_saida_Alimentacao = 0
  this.vinteseis_saida_Alimentacao = 0
  this.vintesete_saida_Alimentacao = 0
  this.vinteoito_saida_Alimentacao = 0
  this.vintenove_saida_Alimentacao = 0
  this.trinta_saida_Alimentacao = 0
  this.trintaum_saida_Alimentacao = 0

  //SAIDA TRANSPORTE
  this.um_saida_Transporte = 0
  this.dois_saida_Transporte = 0
  this.tres_saida_Transporte = 0
  this.quatro_saida_Transporte = 0
  this.cinco_saida_Transporte = 0
  this.seis_saida_Transporte = 0
  this.sete_saida_Transporte = 0
  this.oito_saida_Transporte = 0
  this.nove_saida_Transporte = 0
  this.dez_saida_Transporte = 0
  this.onze_saida_Transporte = 0
  this.doze_saida_Transporte = 0
  this.treze_saida_Transporte = 0
  this.catorze_saida_Transporte = 0
  this.quinze_saida_Transporte = 0
  this.dezasseis_saida_Transporte = 0
  this.dezassete_saida_Transporte = 0
  this.dezoito_saida_Transporte = 0
  this.dezanove_saida_Transporte = 0
  this.vinte_saida_Transporte = 0
  this.vinteum_saida_Transporte = 0
  this.vintedois_saida_Transporte = 0
  this.vintetrez_saida_Transporte = 0
  this.vintequatro_saida_Transporte = 0
  this.vintecinco_saida_Transporte = 0
  this.vinteseis_saida_Transporte = 0
  this.vintesete_saida_Transporte = 0
  this.vinteoito_saida_Transporte = 0
  this.vintenove_saida_Transporte = 0
  this.trinta_saida_Transporte = 0
  this.trintaum_saida_Transporte = 0

  //SAIDA SALARIOS
  this.um_saida_Salario = 0
  this.dois_saida_Salario = 0
  this.tres_saida_Salario = 0
  this.quatro_saida_Salario = 0
  this.cinco_saida_Salario = 0
  this.seis_saida_Salario = 0
  this.sete_saida_Salario = 0
  this.oito_saida_Salario = 0
  this.nove_saida_Salario = 0
  this.dez_saida_Salario = 0
  this.onze_saida_Salario = 0
  this.doze_saida_Salario = 0
  this.treze_saida_Salario = 0
  this.catorze_saida_Salario = 0
  this.quinze_saida_Salario = 0
  this.dezasseis_saida_Salario = 0
  this.dezassete_saida_Salario = 0
  this.dezoito_saida_Salario = 0
  this.dezanove_saida_Salario = 0
  this.vinte_saida_Salario = 0
  this.vinteum_saida_Salario = 0
  this.vintedois_saida_Salario = 0
  this.vintetrez_saida_Salario = 0
  this.vintequatro_saida_Salario = 0
  this.vintecinco_saida_Salario = 0
  this.vinteseis_saida_Salario = 0
  this.vintesete_saida_Salario = 0
  this.vinteoito_saida_Salario = 0
  this.vintenove_saida_Salario = 0
  this.trinta_saida_Salario = 0
  this.trintaum_saida_Salario = 0

  //SAIDA OUTROS
  this.um_saida_Outros = 0
  this.dois_saida_Outros = 0
  this.tres_saida_Outros = 0
  this.quatro_saida_Outros = 0
  this.cinco_saida_Outros = 0
  this.seis_saida_Outros = 0
  this.sete_saida_Outros = 0
  this.oito_saida_Outros = 0
  this.nove_saida_Outros = 0
  this.dez_saida_Outros = 0
  this.onze_saida_Outros = 0
  this.doze_saida_Outros = 0
  this.treze_saida_Outros = 0
  this.catorze_saida_Outros = 0
  this.quinze_saida_Outros = 0
  this.dezasseis_saida_Outros = 0
  this.dezassete_saida_Outros = 0
  this.dezoito_saida_Outros = 0
  this.dezanove_saida_Outros = 0
  this.vinte_saida_Outros = 0
  this.vinteum_saida_Outros = 0
  this.vintedois_saida_Outros = 0
  this.vintetrez_saida_Outros = 0
  this.vintequatro_saida_Outros = 0
  this.vintecinco_saida_Outros = 0
  this.vinteseis_saida_Outros = 0
  this.vintesete_saida_Outros = 0
  this.vinteoito_saida_Outros = 0
  this.vintenove_saida_Outros = 0
  this.trinta_saida_Outros = 0
  this.trintaum_saida_Outros = 0
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

export class LancamentoConsolidado{
  dia?: number;
  mes?: string;

  entrada_Numerario?: number;
  entrada_POS?: number;
  entrada_MPesa?: number;
  entrada_Cheque?: number;
  entrada_Convenio?: number;

  entrada_Consulta?: number;
  entrada_Diagnostico?: number;
  entrada_Conduta?: number;
  entrada_Medicamento?: number;

  entrada_Total?: number;

  saida_Admnistrativa?: number;
  saida_Energia?: number;
  saida_Salario?: number;
  saida_Alimentacao?: number;
  saida_Transporte?: number;
  saida_Outros?: number;

  saida_total?: number;

  constructor(dia?: number, mes?: string, entrada_Numerario?: number, entrada_POS?: number, entrada_MPesa?: number, entrada_Cheque?: number, entrada_Convenio?: number,
  entrada_Consulta?: number, entrada_Diagnostico?: number, entrada_Conduta?: number, entrada_Medicamento?: number, entrada_Total?: number,
  saida_Energia?: number, saida_Salario?: number, saida_Alimentacao?: number, saida_Transporte?: number, saida_Admnistrativa?: number, 
  saida_Outros?: number, saida_total?: number){
    this.dia = dia;
    this.mes = mes;

    this.entrada_Numerario = entrada_Numerario;
    this.entrada_POS = entrada_POS;
    this.entrada_MPesa = entrada_MPesa;
    this.entrada_Cheque = entrada_Cheque;
    this.entrada_Convenio = entrada_Convenio;

    this.entrada_Consulta = entrada_Consulta;
    this.entrada_Diagnostico = entrada_Diagnostico;
    this.entrada_Conduta = entrada_Conduta;
    this.entrada_Medicamento = entrada_Medicamento;

    this.entrada_Total = entrada_Total;

    this.saida_Admnistrativa = saida_Admnistrativa;
    this.saida_Energia = saida_Energia;
    this.saida_Salario = saida_Salario;
    this.saida_Alimentacao = saida_Alimentacao;
    this.saida_Transporte = saida_Transporte;
    this.saida_Outros = saida_Outros;

    this.saida_total = saida_total;
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