import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DiagnosticoAuxiliar } from '../classes/diagnostico_aux';
import { ConfiguracoesService } from '../services/configuracoes.service';
import { MatSnackBar, MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { Clinica } from '../classes/clinica';

import 'rxjs/add/operator/take';

@Component({
  selector: 'app-configuracoes',
  templateUrl: './configuracoes.component.html',
  styleUrls: ['./configuracoes.component.scss']
})
export class ConfiguracoesComponent implements OnInit {


  /*
  * VARIAVEIS DA TAB DIAGNOSTICO AUXILIAR
  */
  diagnostico: DiagnosticoAuxiliar;
  diagnosticos: DiagnosticoAuxiliar[];

  //ATRIBUTOS DO FORLMULARIO
  cadastro_diagnosticoFormGroup: FormGroup;
  
  //ATRIBUTOS DA TABELA
  dataSourseDiagnostico: MatTableDataSource<DiagnosticoAuxiliar>;
  displayedColumnsDiagnostico = ['nome','preco', 'editar', 'remover'];
  @ViewChild(MatPaginator) paginatorDiagnostico: MatPaginator;
  @ViewChild(MatSort) sortDiagnostico: MatSort;


  /*
  * VARIAVEIS DA TAB DADOS GERAIS
  */
  clinica?: Clinica = new Clinica();
  dados_geraisFormGroup: FormGroup;

  constructor(private _formBuilder: FormBuilder, public configServices: ConfiguracoesService, public snackBar: MatSnackBar) {
    this.diagnostico = new DiagnosticoAuxiliar();
   }

  ngOnInit() {
    //TAB DIAGNOSTICO AUXILIAR
    this.cadastro_diagnosticoFormGroup = this._formBuilder.group({
      diagnostico_nome: ['', Validators.required],
      diagnostico_preco: ['', Validators.required],
    });

    this.configServices.getDiagnosticos().subscribe(data => {
      this.diagnosticos = data.map(e => {
        return {
          id: e.payload.doc.id,
          ...e.payload.doc.data(),
        } as DiagnosticoAuxiliar;
      });
      this.dataSourseDiagnostico=new MatTableDataSource(this.diagnosticos.sort((a, b) => a.nome > b.nome ? 1 : -1));
      this.dataSourseDiagnostico.paginator = this.paginatorDiagnostico;
      this.dataSourseDiagnostico.sort = this.sortDiagnostico;
    })


    //TAB DADOS GERAIS
    this.configServices.getClinica().valueChanges()
    .take(1)
    .subscribe(c => {
      this.clinica = c;
    })
    this.dados_geraisFormGroup = this._formBuilder.group({
      clinica_nome: ['', Validators.required],
      clinica_endereco: ['', Validators.required],
      clinica_cidade: ['', Validators.required],
      clinica_provincia: ['', Validators.required],
      clinica_pais: ['', Validators.required],
      clinica_preco_consulta: ['', Validators.required],
    });
    this.dados_geraisFormGroup.controls['clinica_pais'].disable();
    this.dados_geraisFormGroup.controls['clinica_provincia'].disable();
    this.dados_geraisFormGroup.controls['clinica_cidade'].disable();
    
  }

  registarDiagnostico(){
    let data = Object.assign({}, this.diagnostico);

    this.configServices.createDiagnostico(data)
    .then( res => {
      this.diagnostico = new DiagnosticoAuxiliar();
      this.cadastro_diagnosticoFormGroup.reset;
      this.openSnackBar("Paciente cadastrado com sucesso");
    }).catch( err => {
      this.openSnackBar("Ocorreu um erro ao cadastrar. Contacte o admnistrador do sistema");
    });
  }

  atualizarClinica(){
    let data = Object.assign({}, this.clinica);

    this.configServices.updateClinica(data)
    .then( res => {
      this.openSnackBar("Dados atualizados com sucesso");
    }).catch( err => {
      this.openSnackBar("Ocorreu um erro ao atualizar os dados. Contacte o admnistrador do sistema");
    });
  }

  openSnackBar(mensagem) {
    this.snackBar.open(mensagem, null,{
      duration: 2000
    })
  }

}
