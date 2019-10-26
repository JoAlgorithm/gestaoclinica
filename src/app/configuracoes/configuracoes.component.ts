import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DiagnosticoAuxiliar } from '../classes/diagnostico_aux';
import { ConfiguracoesService } from '../services/configuracoes.service';
import { MatSnackBar, MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { Clinica } from '../classes/clinica';

import 'rxjs/add/operator/take';
import { User } from '../classes/user';
import { AuthService } from '../services/auth.service';
import { CategoriaConsulta } from '../classes/categoria_consulta';
import { CondutaClinica } from '../classes/conduta_clinica';
import { TipoCondutaClinica } from '../classes/tipo_conduta_clinica';
import { TipoDiagnosticoAux } from '../classes/tipo_diagnostico';
import { SubTipoDiagnosticoAux } from '../classes/subtipo_diagnostico';


@Component({
  selector: 'app-configuracoes',
  templateUrl: './configuracoes.component.html',
  styleUrls: ['./configuracoes.component.scss']
})
export class ConfiguracoesComponent implements OnInit {

  perfil = "";
  acesso_users = false;
  
  editar_conduta = false;
  editar_diagnostico = false;
  editar_consultas = false;

  /*
  * VARIAVEIS DA TAB DIAGNOSTICO AUXILIAR
  */
  diagnostico: DiagnosticoAuxiliar;
  diagnosticos: DiagnosticoAuxiliar[];
  //tipos_diagnosticos = this.configServices.tipos_diagnosticos;
  //tipos_diagnosticos = this.configServices.getTiposDiagnosticos();
  tipos_diagnosticos: TipoDiagnosticoAux[];
  tipos_diagnosticos_ax: TipoDiagnosticoAux[];
  subtipos_diagnosticos: SubTipoDiagnosticoAux[];
  subtipos_diagnosticos_aux: SubTipoDiagnosticoAux[];

  //ATRIBUTOS DO FORLMULARIO
  cadastro_diagnosticoFormGroup: FormGroup;
  
  //ATRIBUTOS DA TABELA
  dataSourseDiagnostico: MatTableDataSource<DiagnosticoAuxiliar>;
  displayedColumnsDiagnostico = ['tipo','subtipo','nome','preco', 'editar', 'remover'];
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

  /*
  * VARIAVEIS DA TAB CONSULTAS MEDICAS
  */
  categoria_consulta: CategoriaConsulta;
  categorias_consulta: CategoriaConsulta[];
  categorias_consultaFormGroup: FormGroup;


  
  //ATRIBUTOS DA TABELA
  dataSourseCategoriaC: MatTableDataSource<CategoriaConsulta>;
  displayedColumnsCategoriaC = ['nome','preco', 'editar'];
  @ViewChild(MatPaginator) paginatorCategoriaC: MatPaginator;
  @ViewChild(MatSort) sortCategoriaC: MatSort;

  constructor(private _formBuilder: FormBuilder, public configServices: ConfiguracoesService, public snackBar: MatSnackBar,
    private authService: AuthService) {
    this.diagnostico = new DiagnosticoAuxiliar();
    this.categoria_consulta = new CategoriaConsulta();
    this.conduta_clinica = new CondutaClinica();
  }

  /*
  * VARIAVEIS DA TAB CONDUTAS CLINICAS
  */
  tipos_conduta_clinica: TipoCondutaClinica[];
  tipos_conduta_clinica_aux: TipoCondutaClinica[];
  conduta_clinica: CondutaClinica;
  condutas_clinica: CondutaClinica[];
  condutas_clinicaFormGroup: FormGroup;

  //ATRIBUTOS DA TABELA
  dataSourseCondutaC: MatTableDataSource<CondutaClinica>;
  displayedColumnsCondutaC = ['tipo','nome','preco', 'editar'];
  @ViewChild(MatPaginator) paginatorCondutaC: MatPaginator;
  @ViewChild(MatSort) sortCondutaC: MatSort;


  ngOnInit() {
    this.perfil = this.authService.get_perfil;
    if(this.perfil == 'Clinica_Admin'){
      this.acesso_users = true;
    }else{
      this.acesso_users = false;
    }

    //TAB DIAGNOSTICO AUXILIAR
    this.cadastro_diagnosticoFormGroup = this._formBuilder.group({
      diagnostico_tipo: ['', Validators.required],
      diagnostico_subtipo: [''],
      diagnostico_nome: ['', Validators.required],
      diagnostico_preco: ['', Validators.required],
    });

    this.configServices.getDiagnosticos().snapshotChanges().subscribe(data => {
      this.diagnosticos = data.map(e => {
        return {
          id: e.payload.key,
          ...e.payload.val(),
        } as DiagnosticoAuxiliar;
      });
      this.dataSourseDiagnostico=new MatTableDataSource(this.diagnosticos.sort((a, b) => a.nome > b.nome ? 1 : -1));
      setTimeout(()=> this.dataSourseDiagnostico.paginator = this.paginatorDiagnostico);
    })
 

    this.configServices.getTiposDiagnosticos().snapshotChanges().subscribe(data => {
      this.tipos_diagnosticos = data.map(e => {
        return {
          id: e.payload.key,
          //subtipos: e.payload.val()['subtipo'] as SubTipoDiagnosticoAux[],
          ...e.payload.val(),
        } as TipoDiagnosticoAux;
      });
      this.tipos_diagnosticos_ax = this.tipos_diagnosticos;
    })

    this.configServices.getSubTiposDiagnosticos().snapshotChanges().subscribe(data => {
      this.subtipos_diagnosticos = data.map(e => {
        return {
          id: e.payload.key,
          tipo: e.payload.val()['tipo'] as TipoDiagnosticoAux,
          ...e.payload.val(),
        } as SubTipoDiagnosticoAux;
      });
      this.subtipos_diagnosticos_aux = this.subtipos_diagnosticos;
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

    this.configServices.getUsers().snapshotChanges().subscribe(data => {
      this.users = data.map(e => {
        return {
          uid: e.payload.key,
          ...e.payload.val(),
        } as User;
      });

      this.dataSourseUser=new MatTableDataSource(
        this.users.filter(u => u.clinica_id+"" === this.authService.get_clinica_id+"").sort((a, b) => a.displayName > b.displayName ? 1 : -1)
      );
      this.dataSourseUser.paginator = this.paginatorUser;
    })


    //TAB CONSULTAS MEDICAS (CATEGORIACONSULTA)
    this.categorias_consultaFormGroup = this._formBuilder.group({
      cs_nome: ['', Validators.required],
      cs_preco: ['', Validators.required]
    });

    this.configServices.getCategoriasConsulta().snapshotChanges().subscribe(data => {
      this.categorias_consulta = data.map(e => {
        return {
          id: e.payload.key,
          ...e.payload.val(),
        } as CategoriaConsulta;
      });
      this.dataSourseCategoriaC=new MatTableDataSource(
        this.categorias_consulta.sort((a, b) => a.nome > b.nome ? 1 : -1)
      );
      this.dataSourseCategoriaC.paginator = this.paginatorCategoriaC;
    })


    //TAB CONDUTAS CLINICAS
    this.configServices.getTiposCondutaClinica().snapshotChanges().subscribe(data => {
      this.tipos_conduta_clinica = data.map(e => {
        return {
          id: e.payload.key,
          ...e.payload.val(),
        } as CondutaClinica;
      });
      this.tipos_conduta_clinica.sort((a, b) => a.id > b.id ? 1 : -1)
      this.tipos_conduta_clinica_aux=this.tipos_conduta_clinica;
    })

    this.condutas_clinicaFormGroup = this._formBuilder.group({
      conduta_tipo: ['', Validators.required],
      conduta_nome: ['', Validators.required],
      conduta_preco: ['', Validators.required]
    });

    this.configServices.getCondutasClinica().snapshotChanges().subscribe(data => {
      this.condutas_clinica = data.map(e => {
        return {
          id: e.payload.key,
          ...e.payload.val(),
        } as CondutaClinica;
      });
      this.dataSourseCondutaC = new MatTableDataSource(
        this.condutas_clinica.sort((a, b) => a.tipo.id > b.tipo.id ? 1 : -1)
      );
      this.dataSourseCondutaC.paginator = this.paginatorCondutaC;
    })

  }//FIM ngOnInit

  registarDiagnostico(){
    this.editar_diagnostico = false;
    if(!this.diagnostico.subtipo){
      this.diagnostico.subtipo = null;
    }
    

    let data = Object.assign({}, this.diagnostico);
    if(data.id){ 
      //Ja tem ID ja Conduta entao deve atualizar
      this.configServices.updateDiagnostico(data)
      .then( res => {
        this.diagnostico= new DiagnosticoAuxiliar();
        this.cadastro_diagnosticoFormGroup.reset;
        this.openSnackBar("Diagnostico atualizado com sucesso");
      }, err=>{
        this.openSnackBar("Ocorreu um erro ao atualizar. Contacte o admnistrador do sistema");
      })
    }else{
    this.configServices.createDiagnostico(data)
    
    .then( res => {
      this.diagnostico = new DiagnosticoAuxiliar();
      this.cadastro_diagnosticoFormGroup.reset;
      this.openSnackBar("Diagnostico cadastrado com sucesso");
    }, err=>{
      this.openSnackBar("Ocorreu um erro ao cadastrar. Contacte o admnistrador do sistema");
    })
  }}

  registarCategoriaConsulta(){
    this.editar_consultas = false;
    if(this.categoria_consulta.nome && this.categoria_consulta.preco){

      
        let data = Object.assign({}, this.categoria_consulta);

        /*this.categoria_consulta = new CategoriaConsulta();
        this.categorias_consultaFormGroup.reset;
        Object.keys(this.categorias_consultaFormGroup.controls).forEach(key => {
          console.log("key "+key)
          this.categorias_consultaFormGroup.get(key).setErrors(null) ;
        });*/

        if(data.id){ 
          //Ja tem ID ja Conduta entao deve atualizar
          this.configServices.updateClinica(data)
          .then( res => {
            this.categoria_consulta = new CategoriaConsulta();
            this.categorias_consultaFormGroup.reset;
            this.openSnackBar("Consulta medica Atualizada com sucesso");
          }, err=>{
            this.openSnackBar("Ocorreu um erro ao atualizar. Contacte o admnistrador do sistema");
          })
        }else{

          this.configServices.createCategoriaConsulta(data)
          .then( res => {
            this.categoria_consulta = new CategoriaConsulta();
            this.categorias_consultaFormGroup.reset;
            this.categorias_consultaFormGroup.valid === true;
            this.openSnackBar("Consulta medica cadastrada com sucesso");
          }, err=>{
            this.openSnackBar("Ocorreu um erro ao cadastrar. Contacte o admnistrador do sistema");
          })
        }
      }else{
        this.openSnackBar("Preencha os campos obrigatorios");
      }
    }

  registarCondutaClinica(){
    this.editar_conduta = false;
    let data = Object.assign({}, this.conduta_clinica);

    if(data.id){ 
      //Ja tem ID ja Conduta entao deve atualizar
      this.configServices.updateCondutaClinica(data)
      .then( res => {
        this.conduta_clinica = new CondutaClinica();
        this.condutas_clinicaFormGroup.reset;
        this.openSnackBar("Conduta clinica cadastrada com sucesso");
      }, err=>{
        this.openSnackBar("Ocorreu um erro ao cadastrar. Contacte o admnistrador do sistema");
      })
    }else{
      //Conduta nova deve salvar
      this.configServices.createCondutaClinica(data)
      .then( res => {
        this.conduta_clinica = new CondutaClinica();
        this.condutas_clinicaFormGroup.reset;
        this.openSnackBar("Conduta clinica atualizada com sucesso");
      }, err=>{
        this.openSnackBar("Ocorreu um erro ao atualizar. Contacte o admnistrador do sistema");
      })
    }

    
  }

  editarConduta(conduta: CondutaClinica){
    this.editar_conduta = true;
    this.conduta_clinica = conduta;
    this.tipos_conduta_clinica.forEach(element => {
      if(element.nome == this.conduta_clinica.tipo.nome){
        this.conduta_clinica.tipo = element;
      }
    });
  }

  
  editarConsulta(consulta: CategoriaConsulta){
    this.editar_consultas = true;
    this.categoria_consulta = consulta;
  }

  editarDiagnostico(diagnostico: DiagnosticoAuxiliar){
    this.editar_diagnostico = true;
    this.diagnostico = diagnostico;
    this.tipos_diagnosticos.forEach(element => {
      if(element.nome == diagnostico.tipo.nome){
        this.diagnostico.tipo = element;
      }
    });

    if(this.diagnostico.subtipo){
      this.subtipos_diagnosticos.forEach(element => {
        if(element.nome == diagnostico.subtipo.nome){
          this.diagnostico.subtipo = element;
        }
      });
    }
    
  }


  applyFilter(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // Datasource defaults to lowercase matches
    //this.dataSourseDiagnostico.filter = filterValue;
   this.tipos_diagnosticos.filter((unit) => unit.nome.indexOf(filterValue) > -1);
  }

  filtratipodiagnostico="";
  filtrarTipoDiagnosticos(filtratipodiagnostico) {
    if(filtratipodiagnostico){
      filtratipodiagnostico = filtratipodiagnostico.trim(); // Remove whitespace
      filtratipodiagnostico = filtratipodiagnostico.toLowerCase(); // Datasource defaults to lowercase matches
     
      this.tipos_diagnosticos= null;

      this.tipos_diagnosticos = this.tipos_diagnosticos_ax.filter(item => item.nome.toLocaleLowerCase().indexOf(filtratipodiagnostico) > -1);     
    }else{
      this.tipos_diagnosticos = this.tipos_diagnosticos_ax;
    }
  }



  atualizarClinica(){
    let data = Object.assign({}, this.clinica);

    this.configServices.updateClinica(data)
    .then( res => {
      this.openSnackBar("Dados atualizados com sucesso");

      //Limpar usuario
      /*this.user = new User();
      this.user.clinica = this.authService.get_clinica_nome;
      this.user.clinica_id = this.authService.get_clinica_id;
      this.user.emailVerified = true;
      this.user.photoURL = "";
      this.user.provincia = this.clinica.provincia+"";
      this.user.endereco = this.clinica.endereco+"";
      this.user.cidade = this.clinica.cidade+"";*/

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

  filtrarTipoDiagnostico(tipo: TipoDiagnosticoAux){
    console.log(tipo.nome);
    this.subtipos_diagnosticos = null;
    this.subtipos_diagnosticos = this.subtipos_diagnosticos_aux.filter(item => item.tipo.nome == tipo.nome);
  }

  filtrarsubtipoDiagnosticos="";
  filtrarSubtipoDiagnosticos(filtrarsubtipoDiagnosticos){
    if(filtrarsubtipoDiagnosticos){
      filtrarsubtipoDiagnosticos = filtrarsubtipoDiagnosticos.trim(); // Remove whitespace
      filtrarsubtipoDiagnosticos = filtrarsubtipoDiagnosticos.toLowerCase(); // Datasource defaults to lowercase matches
     
    this.subtipos_diagnosticos= null;

  this.subtipos_diagnosticos = this.subtipos_diagnosticos_aux.filter(item => item.nome.toLocaleLowerCase().indexOf(filtrarsubtipoDiagnosticos) > -1);     
    }else{
      this.subtipos_diagnosticos = this.subtipos_diagnosticos_aux;
    }
  }
  filtrartipocondut="";
  filtrarTiposCondutas(filtrartipocondut){
    if(filtrartipocondut){
      filtrartipocondut = filtrartipocondut.trim(); // Remove whitespace
      filtrartipocondut = filtrartipocondut.toLowerCase(); // Datasource defaults to lowercase matches
     
    this.tipos_conduta_clinica= null;

  this.tipos_conduta_clinica = this.tipos_conduta_clinica_aux.filter(item => item.nome.toLocaleLowerCase().indexOf(filtrartipocondut) > -1);     
    }else{
      this.tipos_conduta_clinica = this.tipos_conduta_clinica_aux;
    }
  }

  filtrarTipoconduta(filterValue){
    if(filterValue){
      filterValue = filterValue.trim(); // Remove whitespace
      filterValue = filterValue.toLowerCase(); // Datasource defaults to lowercase matches
     
    this.subtipos_diagnosticos= null;

  this.subtipos_diagnosticos = this.subtipos_diagnosticos_aux.filter(item => item.nome.toLocaleLowerCase().indexOf(filterValue) > -1);     
    }else{
      this.subtipos_diagnosticos = this.subtipos_diagnosticos_aux;
    }
  }
  



  openSnackBar(mensagem) {
    this.snackBar.open(mensagem, null,{
      duration: 2000
    })
  }

}
