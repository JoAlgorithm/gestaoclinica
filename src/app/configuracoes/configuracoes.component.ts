import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DiagnosticoAuxiliar } from '../classes/diagnostico_aux';
import { ConfiguracoesService } from '../services/configuracoes.service';
import { MatSnackBar, MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { Clinica } from '../classes/clinica';

import 'rxjs/add/operator/take';
import { User } from '../classes/user';
import { AuthService } from '../services/auth.service';

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

  /*
  * VARIAVEIS DA TAB DADOS GESTAO DE USUARIOS
  */
  cadastro_userFormGroup: FormGroup;

  perfis = [
    {value: 'Admin', viewValue: 'Admin'},
    {value: 'Admnistrativo', viewValue: 'Admnistrativo'},
    {value: 'Medico', viewValue: 'Medico'},
    {value: 'Rececionista', viewValue: 'Rececionista'}
  ]

  user: User;
  users: User[];

  dataSourseUser: MatTableDataSource<User>;
  displayedColumnsUser = ['displayName','email', 'perfil'];
  @ViewChild(MatPaginator) paginatorUser: MatPaginator;
  @ViewChild(MatSort) sortUser: MatSort;

  constructor(private _formBuilder: FormBuilder, public configServices: ConfiguracoesService, public snackBar: MatSnackBar,
    private authService: AuthService) {
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
      //this.dataSourseDiagnostico.sort = this.sortDiagnostico;
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
    

    //TAB GESTAO DE USUARIOS
    //TAB DIAGNOSTICO AUXILIAR
    this.cadastro_userFormGroup = this._formBuilder.group({
      user_displayName: ['', Validators.required],
      user_email: ['', Validators.required],
      user_perfil: ['', Validators.required],
    });
    this.user = new User();
    this.user.clinica = this.authService.get_clinica_nome;
    this.user.clinica_id = this.authService.get_clinica_id;
    this.user.emailVerified = true;
    this.user.photoURL = "";
    this.user.provincia = this.clinica.provincia+"";
    this.user.endereco = this.clinica.endereco+"";
    this.user.cidade = this.clinica.cidade+"";

    this.configServices.getUsers().subscribe(data => {
      this.users = data.map(e => {
        return {
          uid: e.payload.doc.id,
          ...e.payload.doc.data(),
        } as User;
      });

      this.users.forEach(element => {
        //console.log(element.displayName +" comparando "+element.clinica_id +" com "+this.authService.get_clinica_id)
        //console.log(element.clinica_id+"" == this.authService.get_clinica_id+"")
      });

      this.dataSourseUser=new MatTableDataSource(
        this.users.filter(u => u.clinica_id+"" === this.authService.get_clinica_id+"").sort((a, b) => a.displayName > b.displayName ? 1 : -1)
      );
      this.dataSourseUser.paginator = this.paginatorUser;
      //this.dataSourseDiagnostico.sort = this.sortDiagnostico;
    })

  }//FIM ngOnInit

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

      //Limpar usuario
      this.user = new User();
      this.user.clinica = this.authService.get_clinica_nome;
      this.user.clinica_id = this.authService.get_clinica_id;
      this.user.emailVerified = true;
      this.user.photoURL = "";
      this.user.provincia = this.clinica.provincia+"";
      this.user.endereco = this.clinica.endereco+"";
      this.user.cidade = this.clinica.cidade+"";

    }).catch( err => {
      this.openSnackBar("Ocorreu um erro ao atualizar os dados. Contacte o admnistrador do sistema");
    });
  }

  //Ja nao vamos registar usuario atraves do sistema
  // o admin apenas atualizara os dperfis do user pq brevemente cobraremos por contas
  registarUsuario(){
    let data = Object.assign({}, this.user);

    //createUser
    this.authService.SignUp(this.user.email, "123456")
    .then(r => {
      
      data.uid = r.user.uid;
      //console.log("userid "+data.uid)
      this.configServices.createUser(data)
      this.openSnackBar("Usuario registado com sucesso com sucesso");
      
/*
      this.configServices.createUser(data)
      .then( res => {
        this.openSnackBar("Usuario registado com sucesso com sucesso");
      }).catch( err => {
        this.openSnackBar("Ocorreu um erro ao atualizar os dados. Contacte o admnistrador do sistema");
        console.log("err2: "+err.message)
      })
      console.log("comecou a cadastrar na lista de users "+data.uid)
*/
    }).catch( er => {
      this.openSnackBar("Ocorreu um erro ao atualizar os dados. Contacte o admnistrador do sistema");
      //console.log("erro1: "+er.message)
    })

    /*this.configServices.updateClinica(data)
    .then( res => {
      this.openSnackBar("Dados atualizados com sucesso");
    }).catch( err => {
      this.openSnackBar("Ocorreu um erro ao atualizar os dados. Contacte o admnistrador do sistema");
    });*/

  }

  openSnackBar(mensagem) {
    this.snackBar.open(mensagem, null,{
      duration: 2000
    })
  }

}
