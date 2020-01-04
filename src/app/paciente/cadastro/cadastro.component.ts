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
import {Md5} from "md5-typescript";



@Component({
  selector: 'app-cadastro',
  templateUrl: './cadastro.component.html',
  styleUrls: ['./cadastro.component.scss']
})
export class CadastroComponent implements OnInit {

  clicou = false;
  texto = "FINALIZAR CADASTRO";
  isLinear = true;
  paciente:  Paciente;
  tel: string[];

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
  tele:Paciente[];

  constructor(private _formBuilder: FormBuilder,
    private pacienteService: PacienteService,
    public snackBar: MatSnackBar, private router: Router) {

    this.paciente = new Paciente();
    this.paciente.localidade = "";
    this.paciente.avenida = "";
    this.paciente.rua = "";
    this.paciente.casa = "";
    this.paciente.celula = "";
    this.paciente.quarteirao = "";
    this.paciente.posto_admnistrativo = "";
    this.paciente.referencia_nome = "";
    this.paciente.referencia_apelido= "";
    this.paciente.referencia_telefone= "";
    this.paciente.telefone = "";
    this.paciente.nuit = "";
    /*this.paciente.nome = "Luis"
    this.paciente.apelido = "Jo"
    this.paciente.sexo = "Masculino"
    this.paciente.datanascimento = new Date();
    this.paciente.documento_identificacao = "15AL311"
    this.paciente.nr_documento_identificacao = "Bilhete de identidade"
    this.paciente.localidade = "Nacala";
    this.paciente.bairro = "Mocone";
    this.paciente.avenida = "Eduardo Mondlane";
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
    this.paciente.referencia_telefone = "828498183";*/
  
   }
   
  ngOnInit() {
    let nome = "Luis jo";
    nome = Md5.init(nome);
    //console.log("nome encriptado: "+nome);
    
    //console.log("nome desincriptado: "+Md5.ConvertToWordArray(nome))

    this.firstFormGroup = this._formBuilder.group({
      paciente_nome: ['', Validators.required],
      paciente_apelido: ['', Validators.required],
      paciente_sexo: ['', Validators.required],
      paciente_data_nascimento: ['', Validators.required],   
      paciente_documento_identificacao: ['', Validators.required],
      paciente_nr_documento: ['', Validators.required],     

      paciente_localidade: [''],   
      paciente_bairro: ['', Validators.required],  
      paciente_avenida: [''],  
      paciente_rua: [''],
      paciente_casa: [''],
      paciente_celula: [''],
      paciente_quarteirao: [''],
      paciente_posto_admnistrativo: [''],
      paciente_distrito: ['', Validators.required],
      paciente_provincia: ['', Validators.required],

      paciente_telefone: [''],
      paciente_nuit: [''],
    });

    this.secondFormGroup = this._formBuilder.group({
      paciente_referencia_nome: [''],
      paciente_referencia_apelido: [''],
      paciente_referencia_telefone: ['']
      //paciente_referencia_telefone: ['', Validators.compose([Validators.required, Validators.minLength(9), Validators.maxLength(9)])],
    });

    this.pacienteService.getPacientes().snapshotChanges().subscribe(data => {
      this.pacientes = data.map(e => {
        return {
          id: e.payload.key,
          ...e.payload.val(),
        } as Paciente;
      });

      if(typeof this.pacientes !== 'undefined' && this.pacientes.length > 0){

        this.paciente.nid = Math.max.apply(Math, this.pacientes.map(function(o) { return o.nid; }));
        
        if(this.paciente.nid.toString().substr(0,4) == new Date().getFullYear().toString()){
          //Se nao bater significa que mudamos de ano e precisamos recomecar a contagem
          this.paciente.nid = this.paciente.nid+1;
        }else{
          this.paciente.nid =  +(new Date().getFullYear()+'001');
        }

      }else{
        this.paciente.nid =  +(new Date().getFullYear()+'001');
      }
    })
  }

 

  //pacientes: Paciente[];
  getNID(){

  }
 
  myFilter = (d: Date): boolean => {
    let dia = new Date().getDate();
    let ano= new Date().getFullYear();
    let mes=new Date().getMonth();
    let semana=new Date().getDay();
    const day = d.getDate();
    const year =d.getFullYear();
    const meses=d.getMonth();
    const sem=d.getDay();
   
    // Prevent Saturday and Sunday from being selected.
    return  year<=ano && meses<=mes;
  }


  registarPaciente(){

    
    /*let verificar_existe = false;
    this.pacientes.forEach(p => {
    if(p.telefone == this.paciente.telefone ||p.documento_identificacao==this.paciente.documento_identificacao && p.nr_documento_identificacao==this.paciente.nr_documento_identificacao){
    verificar_existe = true;
   
    }
    });*/


    this.clicou = true;
    this.texto = "AGUARDE...";


    //this.paciente.id = "123456"

    //this.paciente.nome = Md5.init(this.paciente.nome);
    //this.paciente.apelido = Md5.init(this.paciente.apelido);
    this.paciente.status_historia_clinica = false;

    let data = Object.assign({}, this.paciente);
    //if(verificar_existe==false ){ 
    this.pacienteService.createPaciente(data)
      .then( res => {
        this.router.navigateByUrl("/paciente/listagem_paciente")
        this.openSnackBar("Paciente cadastrado com sucesso");
      }, err=> {
        console.log("ERRO: " + err.message)          
        this.clicou = false;
        this.texto = "FINALIZAR CADASTRO";
      })
    //}else{
    //  this.openSnackBar("Documento ou Telefone Existente"); 
    //  console.log("") ;

    //}

     

  }
  

  openSnackBar(mensagem) {
    this.snackBar.open(mensagem, null,{
      duration: 2000
    })
  }

  

}