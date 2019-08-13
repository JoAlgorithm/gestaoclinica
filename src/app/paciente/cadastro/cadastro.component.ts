import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Paciente} from './../../classes/paciente';
import { CustomValidators } from 'ng2-validation';
//import { FileUploader } from 'ng2-file-upload';
//const URL = 'https://evening-anchorage-3159.herokuapp.com/api/';
import { PacienteService } from '../../services/paciente.service';
import {MatSnackBar} from '@angular/material';
//import { format } from 'url';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { Inject} from '@angular/core';

@Component({
  selector: 'app-cadastro',
  templateUrl: './cadastro.component.html',
  styleUrls: ['./cadastro.component.scss']
})
export class CadastroComponent implements OnInit {

  isLinear = true;
  paciente:  Paciente;

  generos = [
    {value: 'Feminino', viewValue: 'Feminino'},
    {value: 'Masculino', viewValue: 'Masculino'}
  ];

  documentos_identificacao = [
    {value: 'BI', viewValue: 'Bilhete de identidade'},
    {value: 'Cedula', viewValue: 'Cedula'},
    {value: 'Passaporte', viewValue: 'Passaporte'},
    {value: 'Certidao de nascimento', viewValue: 'Certidao de nascimento'},
    {value: 'DIRE', viewValue: 'DIRE'},
    {value: 'Outros', viewValue: 'Outros'},
  ]

  nacionalidades = [
    {value: 'Mocambicana', viewValue: 'Mocambicana'},
    {value: 'Sul Africana', viewValue: 'Mocambicana'}
  ]

  provincias = [
    {value: 'Maputo', viewValue: 'Maputo'},
    {value: 'Gaza', viewValue: 'Gaza'},
    {value: 'Inhambane', viewValue: 'Inhambane'},
    {value: 'Sofala', viewValue: 'Sofala'},
    {value: 'Tete', viewValue: 'Tete'},
    {value: 'Quelimane', viewValue: 'Quelimane'},
    {value: 'Nampula', viewValue: 'Nampula'},
    {value: 'Cabo Delgado', viewValue: 'Cabo Delgado'},
    {value: 'Niassa', viewValue: 'Niassa'},
    {value: 'Zambezia', viewValue: 'Zambezia'}
  ]

  //uploader: FileUploader;
  //response: string;

  firstFormGroup: FormGroup;
  secondFormGroup: FormGroup;

  pacientes: Paciente[];

  constructor(private _formBuilder: FormBuilder,
    private pacienteService: PacienteService,
    public snackBar: MatSnackBar, private router: Router) {

    this.paciente = new Paciente();
    this.paciente.nome = "Luis"
    this.paciente.apelido = "Jo"
    this.paciente.sexo = "Masculino"
    this.paciente.datanascimento = new Date();
    this.paciente.documento_identificacao = "15AL311"
    this.paciente.nr_documento_identificacao = "Bilhete de identidade"
    this.paciente.localidade = "Nacala";
    this.paciente.bairro = "Mocone";
    this.paciente.avenidade = "Eduardo Mondlane";
    this.paciente.rua = "Baixa";
    this.paciente.casa = "123";
    this.paciente.celula = "B";
    this.paciente.quarteirao = "2";
    this.paciente.posto_admnistrativo = "Mocone";
    this.paciente.distrito = "Nacala";
    this.paciente.provincia = "Nampula";

    //Dados da pessoa de referencia
    this.paciente.referencia_nome = "Siza";
    this.paciente.referencia_apelido = "Jo";
    this.paciente.referencia_telefone = "828498183";

   }
   
  ngOnInit() {
    this.firstFormGroup = this._formBuilder.group({
      paciente_nome: ['', Validators.required],
      paciente_apelido: ['', Validators.required],
      paciente_sexo: ['', Validators.required],
      paciente_data_nascimento: ['', Validators.required],   
      paciente_documento_identificacao: ['', Validators.required],
      paciente_nr_documento: ['', Validators.required],     

      paciente_localidade: [''],   
      paciente_bairro: ['', Validators.required],  
      paciente_avenida: ['', Validators.required],  
      paciente_rua: ['', Validators.required],
      paciente_casa: [''],
      paciente_celula: [''],
      paciente_quarteirao: ['', Validators.required],
      paciente_posto_admnistrativo: [''],
      paciente_distrito: ['', Validators.required],
      paciente_provincia: ['', Validators.required],
    });

    this.secondFormGroup = this._formBuilder.group({
      paciente_referencia_nome: [''],
      paciente_referencia_apelido: [''],
      paciente_referencia_telefone: ['']
      //paciente_referencia_telefone: ['', Validators.compose([Validators.required, Validators.minLength(9), Validators.maxLength(9)])],
    });

    this.pacienteService.getPacientes().subscribe(data => {
      this.pacientes = data.map(e => {
        return {
          id: e.payload.doc.id,
          ...e.payload.doc.data(),
        } as Paciente;
      });

      if(typeof this.pacientes !== 'undefined' && this.pacientes.length > 0){
        this.paciente.nid = Math.max.apply(Math, this.pacientes.map(function(o) { return o.nid; }));
        this.paciente.nid = this.paciente.nid+1;
        this.paciente.id = this.paciente.nid+'';
      }else{
        this.paciente.nid =  +(new Date().getFullYear()+'001');
        this.paciente.id = this.paciente.nid+'';
      }
    })

  }

  //pacientes: Paciente[];
  getNID(){

  }

  registarPaciente(){

    //this.paciente.id = "123456"

    this.paciente.status_historia_clinica = false;
    let data = Object.assign({}, this.paciente);

    this.pacienteService.createPaciente(data)
    .then( res => {
      this.router.navigateByUrl("/paciente/listagem_paciente")
      this.openSnackBar("Paciente cadastrado com sucesso");
    }).catch( err => {
      console.log("ERRO: " + err.message)
    });

  }

  openSnackBar(mensagem) {
    this.snackBar.open(mensagem, null,{
      duration: 2000
    })
  }

  

}