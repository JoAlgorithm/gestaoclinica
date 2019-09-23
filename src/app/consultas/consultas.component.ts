import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { Consulta } from './../classes/consulta';
import { MatTableDataSource, MatPaginator, MatSort, MatSnackBar, MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material';
import { PacienteService } from './../services/paciente.service';
import { Paciente } from '../classes/paciente';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { c } from '@angular/core/src/render3';
import { ConfiguracoesService } from '../services/configuracoes.service';
import { DiagnosticoAuxiliar } from '../classes/diagnostico_aux';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-consultas',
  templateUrl: './consultas.component.html',
  styleUrls: ['./consultas.component.scss']
})
export class ConsultasComponent implements OnInit {

  consultas: Consulta[]; //Lista de todas as consultas da base de dados

  //Atributos da tabela de consultas PENDENTES
  dataSoursePendentes: MatTableDataSource<Consulta>; //Tabela de consultas pendentes
  displayedColumnsPendentes = ['data','tipo','nid','apelido', 'nome', 'preco' , 'cancelar', 'atender'];
  @ViewChild(MatPaginator) paginatorPendentes: MatPaginator;
  @ViewChild(MatSort) sortPendentes: MatSort;

  //Atributos da tabela de consultas CANCELADAS
  dataSourseCanceladas: MatTableDataSource<Consulta>; //Tabela de consultas canceladas
  displayedColumnsCanceladas = ['data','nid','apelido', 'nome', 'justificativa', 'cancelador'];
  @ViewChild(MatPaginator) paginatorCanceladas: MatPaginator;
  @ViewChild(MatSort) sortCanceladas: MatSort;

  //Atributos da tabela de consultas ENCERRADAS
  dataSourseEncerradas: MatTableDataSource<Consulta>; //Tabela de consultas canceladas
  displayedColumnsEncerradas = ['data','nid','apelido', 'nome', 'diagnostico','tratamento','internamento', 'detalhes'];
  @ViewChild(MatPaginator) paginatorEncerradass: MatPaginator;
  @ViewChild(MatSort) sortEncerradas: MatSort;


  //Atributos da tabela de consultas EM DIAGNOSTICO OU INTERNAMENTO
  dataSourseAndamento: MatTableDataSource<Consulta>; //Tabela de consultas canceladas
  displayedColumnsEAndamento = ['data','nid','apelido', 'nome', 'diagnostico','status','atender'];
  @ViewChild(MatPaginator) paginatorAndamento: MatPaginator;
  @ViewChild(MatSort) sortAndamento: MatSort;

  

  justificativa:String = ""; //variavel usada para pegar justificativa caso a consulta seja cancelada

  diagnosticos:DiagnosticoAuxiliar[];

  

  constructor(private pacienteService: PacienteService, public authService: AuthService,
    public dialog: MatDialog, public snackBar: MatSnackBar, private router: Router, public configServices:ConfiguracoesService) {
   }

  ngOnInit() {
    this.pacienteService.getConsultas().subscribe(data => {
      this.consultas = data.map(e => {
        return {
          id: e.payload.doc.id,
          paciente: e.payload.doc.data()['paciente'] as Paciente,
          ...e.payload.doc.data(),
        } as Consulta;
      })

      //Consultas PENDENTES
      this.dataSoursePendentes=new MatTableDataSource(
        this.consultas.filter(c =>c.status === "Aberta" && c.tipo === "Consulta Medica").sort((a, b) => a.data > b.data ? 1 : -1)
      );
      setTimeout(() => this.dataSoursePendentes.paginator = this.paginatorPendentes);
      this.dataSoursePendentes.sort = this.sortPendentes;

      //Consultas CANCELADAS
      this.dataSourseCanceladas=new MatTableDataSource(
        this.consultas.filter(c =>c.status === "Cancelada" && c.tipo === "Consulta Medica").sort((a, b) => a.data > b.data ? 1 : -1)
      );
      this.dataSourseCanceladas.paginator = this.paginatorCanceladas;
      //this.dataSourseCanceladas.sort = this.sortCanceladas;

      //Consultas ENCERRADAS
      this.dataSourseEncerradas=new MatTableDataSource(
        this.consultas.filter(c =>c.status === "Encerrada" && c.tipo === "Consulta Medica").sort((a, b) => a.data_encerramento > b.data_encerramento ? 1 : -1)
      );
      setTimeout(() => this.dataSourseEncerradas.paginator = this.paginatorEncerradass);
      

      //Consultas EM ATENDIMENTO
      this.dataSourseAndamento=new MatTableDataSource(
        this.consultas.filter(c => (c.status === "Diagnostico" || c.status === "Internamento" || c.status === "Em andamento") && c.tipo === "Consulta Medica").sort((a, b) => a.data > b.data ? 1 : -1)
      );
      this.dataSourseAndamento.paginator = this.paginatorAndamento;
    })

    this.configServices.getDiagnosticos().subscribe(data => {
      this.diagnosticos = data.map(e => {
        return {
          id: e.payload.doc.id,
          ...e.payload.doc.data(),
        } as DiagnosticoAuxiliar;
      })
    })
  }

  openDialog(row: Consulta): void {
    let dialogRef = this.dialog.open(CancelarConsultaDialog, {
    width: '400px',
    data: { consulta: row }
    });
    /*dialogRef.afterClosed().subscribe(result => {
      //console.log("result "+result);
    });*/
  }

  applyFilter(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // Datasource defaults to lowercase matches
    this.dataSoursePendentes.filter = filterValue;
    this.dataSourseCanceladas.filter = filterValue;
  }

  

  atenderPaciente(consulta:Consulta){

    /*consulta.diagnosticos_aux.forEach(d => {
      console.log("Diagnostico aux do pacientes "+d.nome)
    });*/

    let dataSourseHistConsultas: MatTableDataSource<Consulta>; //Tabela de consultas pendentes
    dataSourseHistConsultas=new MatTableDataSource(
      this.consultas.filter(c =>c.status === "Encerrada" && c.tipo == "Consulta Medica" && c.paciente.nid == consulta.paciente.nid).sort((a, b) => a.data_encerramento > b.data_encerramento ? 1 : -1)
    );
    
    //A tabela de diagnosticos é enviada para o dialog pura
    // porém se algum diagnostico tiver sido faturado esse deve se tornar nao editável daí que verificamos se existe algum
    // diagnostico faturado para passar true para a vaiavel faturado e ir tornar esse nao editavel la nao tela
    if (consulta.diagnosticos_aux){
      consulta.diagnosticos_aux.forEach(d => {
        this.diagnosticos.forEach(diagno => {
          if(d.id == diagno.id){
            
            if(d.faturado){
              diagno.faturado = true;
            }
          }
        })
      })
    }
    

    let dialogRef = this.dialog.open(AtenderConsultaDialog, {
      width: '1000px',
      height: '600px',
      data: { consulta: consulta, consultas: dataSourseHistConsultas, 
      diagnosticos: this.diagnosticos as DiagnosticoAuxiliar[] }
    });
    dialogRef.afterClosed().subscribe(result => {
     // console.log("result "+result);
    });


    //let data = Object.assign({}, consulta);
    //this.router.navigate(['/atendimento'], {queryParams: {id: consulta.id}});
    //this.pacienteService.sendConsulta(data);

    /*consulta.status = "Em atendimento";
    consulta.data_atendimento = new Date();
    let data = Object.assign({}, consulta);

    this.pacienteService.updateConsulta(data)
    .then( res => {

      //this.router.navigateByUrl("/paciente/listagem_paciente")
      //this.route.navigateByUrl('/atendimento', { data: { consulta: consulta } });

      this.openSnackBar("Paciente cadastrado com sucesso");
    }).catch( err => {
      console.log("ERRO: " + err.message)
    });*/
  }

  openSnackBar(mensagem) {
    this.snackBar.open(mensagem, null,{
      duration: 2000
    })
  }
  

}






//DIALOG ATENDIMENTO DE CONSULTA ---------------------------------------------------------------
@Component({
  selector: 'atender-consulta-dialog',
  templateUrl: 'atender-consulta.html',
  styleUrls: ['./atender-consulta.component.scss']
  })
  export class AtenderConsultaDialog {

  isLinear = true;
  ps_situacoes_laborais = [
    {value: 'Estudante', viewValue: 'Estudante'},
    {value: 'Empregado', viewValue: 'Empregado'},
    {value: 'Desempregado', viewValue: 'Desempregado'},
    {value: 'Trabalhador informal', viewValue: 'Trabalhador informal'}
  ];

  ps_status_familiares = [
    {value: 'Solteiro', viewValue: 'Solteiro'},
    {value: 'Casado', viewValue: 'Casado'},
    {value: 'Divorciado', viewValue: 'Divorciado'},
    {value: 'Viúvo', viewValue: 'Viúvo'},
    {value: 'Filhos', viewValue: 'Filhos'}
  ];

  ps_suportes = [
    {value: 'Familiar', viewValue: 'Familiar'},
    {value: 'Amigos', viewValue: 'Amigos'},
    {value: 'Religiosos', viewValue: 'Religiosos'},
    {value: 'Outros', viewValue: 'Outros'}
  ];

  ps_fatores_stressantes = [
    {value: 'Financeiros', viewValue: 'Financeiros'},
    {value: 'Familiares', viewValue: 'Familiares'},
    {value: 'Laborais ou Escolares', viewValue: 'Laborais ou Escolares'},
    {value: 'De saúde', viewValue: 'De saúde'}
  ];

  ps_fatores_risco_estilo_vida = [
    {value: 'Álcool', viewValue: 'Álcool'},
    {value: 'Tabaco', viewValue: 'Tabaco'},
    {value: 'Cafeína', viewValue: 'Cafeína'},
    {value: 'Dieta', viewValue: 'Dieta'},
    {value: 'Drogas', viewValue: 'Drogas'},
    {value: 'Outros', viewValue: 'Outros'}
  ];

  ps_fatores_risco_trabalho = [
    {value: 'Álcool', viewValue: 'Álcool'},
    {value: 'Tabaco', viewValue: 'Tabaco'},
    {value: 'Cafeína', viewValue: 'Cafeína'},
    {value: 'Dieta', viewValue: 'Dieta'},
    {value: 'Drogas', viewValue: 'Drogas'},
    {value: 'Outros', viewValue: 'Outros'}
  ];

  diagnosticos_alternativo: String[] = [];

  //Atributos da tabela de HISTORICO DE CONSULTAS
  //dataSourseHistConsultas: MatTableDataSource<Consulta>; //Tabela de consultas pendentes
  displayedColumnsHistConsultas = ['data','diagnostico','tratamento','internamento', 'detalhes'];
  @ViewChild(MatPaginator) paginatorHistConsultas: MatPaginator;

  //temHistorico = false;

  toppings = new FormControl();

  constructor(  public dialogRef: MatDialogRef<AtenderConsultaDialog>,
  @Inject(MAT_DIALOG_DATA) public data: any, public authService:AuthService,
  public pacienteService: PacienteService,  public snackBar: MatSnackBar, public configServices:ConfiguracoesService) {
    
  }

  atualizarDadosGerais(paciente:Paciente, consultaAtual:Consulta, consultas:Consulta[]){
    //Ao atualizar o objecto Paciente atualiza-se os dados na tabela de pacientes e em todas as consultas desse paciente
    //console.log("hf_diabete_mellitus: " + paciente.hf_diabete_mellitus)
    let data = Object.assign({}, paciente);

    
    //Atualizar dados do paciente na tabela paciente
      this.pacienteService.updatePaciente(data)
      .then( res => {

          //Atualizar dados do paciente na consulta atual
          this.pacienteService.updateConsulta(Object.assign({}, consultaAtual))
          .then(re =>{
            this.openSnackBar("Dados gerais do paciente atualizados com sucesso");
          
            /*//Como o objeto paciente é gravado estaticamente dentro de cada consulta entao deve-se atualizar os dados desse 
            // paciente em todas outras consultas (alem da atual que ja foi gravada) para garantir que a info do paciente esteja atualizada
            if(consultas){
              //Se o array nao estiver vazio
              consultas.forEach(c => {
                c.paciente = paciente;
                let d = Object.assign({}, c);
                this.pacienteService.updateConsulta(c)
                .then(r =>{
                  this.openSnackBar("Dados gerais do paciente atualizados com sucesso");
                  console.log("Cadastrado com sucesso")
                })
                .catch(er =>{
                  this.openSnackBar("Ocorreu um erro ao atualizar os dados. Consulte o Admin do sistema.");
                  console.log("Erro ao atualizar dados do paciente na consulta: "+er.message)
                })
              })
            }else{
              //Se for a primeira consulta
              this.openSnackBar("Dados gerais do paciente atualizados com sucesso");
            }

          })
          .catch(erro => {
            this.openSnackBar("Ocorreu um erro ao atualizar os dados. Consulte o Admin do sistema.");
            console.log("Erro ao atualizar dados do paciente na consulta: "+er.message)
          })*/
        }).catch(erro => {
          this.openSnackBar("Ocorreu um erro ao atualizar os dados. Consulte o Admin do sistema.");
            console.log("Erro ao atualizar dados do paciente na consulta: "+erro.message)
        })

      }).catch( err => {
        this.openSnackBar("Ocorreu um erro ao atualizar os dados. Consulte o Admin do sistema.");
        console.log("Erro ao atualizar dados do paciente: "+err.message)
      });
    
  }

  encerrarConsulta(consulta:Consulta){

    

    consulta.status = "Encerrada";
    consulta.encerrador = this.authService.get_perfil + ' - ' + this.authService.get_user_displayName;
    consulta.data_encerramento = new Date();

    let data = Object.assign({}, consulta);

    this.pacienteService.updateConsulta(data)
    .then( res => {
      this.dialogRef.close();
      this.openSnackBar("Consulta encerrada com sucesso");
    }).catch( err => {
      console.log("ERRO: " + err.message)
    });
  }

  aguardarDiagnostico(consulta:Consulta){

    //REMOVER DIAGNOSTICOS QUE NAO TENHAM SIDO FATURADOS
    //consulta.diagnosticos_aux = []
    
    //ADICIONAR DIAGNOSTICOS SEM MEXER NOS
    this.diagnosticos_alternativo.forEach(d => {
      
      this.data.diagnosticos.forEach(element => {
        //console.log("ELEMENT "+element.nome)
        if (d === element.nome){

          if(consulta.diagnosticos_aux){//verficar se a lista de diagnosticos nao esta nula
            if(consulta.diagnosticos_aux.includes(element)){
            }else{
              //Garantir que diagnosticos faturados nao sejam repetidos
              if(element.faturado != true){
                consulta.diagnosticos_aux.push(element);
                console.log("PUSH ALTERNATIVO: "+d)
              }  
            }
          }else{
            consulta.diagnosticos_aux = []; //Ja que o array esta nulo precisa ser instanciado
            //Garantir que diagnosticos faturados nao sejam repetidos
            if(element.faturado != true){
              consulta.diagnosticos_aux.push(element);
              console.log("PUSH ALTERNATIVO: "+d)
            }
          }
          
          

          
        }
      });

    });

    //Se nao tiver sido selecionado nenhum diagnostico aux entao nao deve passar
    let selecionado = false
    consulta.diagnosticos_aux.forEach(d => {
      console.log("Diagnosticos aux marcados: "+d.nome)
      if(d.faturado != true){
        selecionado = true; //significa que tem pelo menos 1 selecionad que nao tenha sido faturado
      }
    });


    consulta.status = "Diagnostico";
    consulta.data_diagnostico = new Date();
    consulta.marcador_diagnostico = this.authService.get_perfil + ' - ' + this.authService.get_user_displayName;
    let data = Object.assign({}, consulta);


    //console.log("-----------------------")
    //console.log("Diagnosticos selecionados:")
    //consulta.diagnosticos_aux.forEach(element => {
      //console.log("NOME: "+element.nome + " FATURADO: "+ element.faturado)
    //});

    //console.log("SELECIONADO: "+selecionado)

    
    if(selecionado){
      this.pacienteService.updateConsulta(data)
      .then( res => {
        this.dialogRef.close();
        this.openSnackBar("Paciente dispensado para diagnostico");
      }).catch( err => {
        this.dialogRef.close();
        console.log("ERRO: " + err.message)
      });
    }else{
      this.openSnackBar("Selecione pelo menos um diagnostico aux");
    }
    

  }

  ngOnInit() {
    this.dialogRef.updateSize('80%', '90%');

    /*this.configServices.getDiagnosticos().subscribe(data => {
      this.diagnosticos = data.map(e => {
        return {
          id: e.payload.doc.id,
          ...e.payload.doc.data(),
        } as DiagnosticoAuxiliar;
      })
    })*/

    if(this.data.consulta.diagnosticos_aux){
      this.data.consulta.diagnosticos_aux.forEach(element => {
        //console.log("DIAGNOSITOCOS funcionand"+element.nome)
        //this.toppings.setValue(element);
        this.diagnosticos_alternativo.push(element.nome);
      });
    }
    


    //this.toppings.setValue(this.data.consulta.diagnosticos_aux);

    /*this.data.consultas.forEach(c => {
      if (c.status === "Encerrada"){
        console.log('consolta de '+c.nome)
      }
    });

    this.dataSourseHistConsultas =new MatTableDataSource(
      this.data.consultas.filter(c =>c.status === "Encerrada").sort((a, b) => a.data > b.data ? 1 : -1)
    );
    this.dataSourseHistConsultas .paginator = this.paginatorHistConsultas;*/
  }

  onNoClick(): void {
    this.dialogRef.close();
  }


  openSnackBar(mensagem) {
    this.snackBar.open(mensagem, null,{
      duration: 2000
    })
  }

  step = 2;
  setStep(index: number) {
    this.step = index;
  }
  nextStep() {
   this.step++;
  }
  prevStep() {
    this.step--;
  }

  }









//DIALOG CANCELAMENTO DE CONSULTA ---------------------------------------------------------------
@Component({
selector: 'cancelar-consulta-dialog',
templateUrl: 'cancelar-consulta.html',
})
export class CancelarConsultaDialog {

  constructor(  public dialogRef: MatDialogRef<CancelarConsultaDialog>,
  @Inject(MAT_DIALOG_DATA) public data: any, public authService:AuthService,
  public pacienteService: PacienteService,  public snackBar: MatSnackBar) { }

  onNoClick(): void {
    this.dialogRef.close();
  }

  cancelarConsulta(consulta:Consulta){
    this.dialogRef.close();
    consulta.cancelador = this.authService.get_perfil + ' - ' + this.authService.get_user_displayName;
    consulta.status = "Cancelada";
    consulta.data_cancelamento = new Date();
    let data = Object.assign({}, consulta);
    
    this.pacienteService.updateConsulta(data)
    .then( res => {
      this.openSnackBar("Consulta cancelada com sucesso");
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