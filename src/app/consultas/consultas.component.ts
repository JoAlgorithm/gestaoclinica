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
        this.consultas.filter(c =>c.status === "Aberta").sort((a, b) => a.data > b.data ? 1 : -1)
      );
      this.dataSoursePendentes.paginator = this.paginatorPendentes;
      this.dataSoursePendentes.sort = this.sortPendentes;

      //Consultas CANCELADAS
      this.dataSourseCanceladas=new MatTableDataSource(
        this.consultas.filter(c =>c.status === "Cancelada").sort((a, b) => a.data > b.data ? 1 : -1)
      );
      this.dataSourseCanceladas.paginator = this.paginatorCanceladas;
      //this.dataSourseCanceladas.sort = this.sortCanceladas;

      //Consultas ENCERRADAS
      this.dataSourseEncerradas=new MatTableDataSource(
        this.consultas.filter(c =>c.status === "Encerrada").sort((a, b) => a.data_encerramento > b.data_encerramento ? 1 : -1)
      );
      this.dataSourseEncerradas.paginator = this.paginatorEncerradass;

      //Consultas EM ATENDIMENTO
      this.dataSourseAndamento=new MatTableDataSource(
        this.consultas.filter(c =>c.status === "Diagnostico" || c.status === "Internamento").sort((a, b) => a.data > b.data ? 1 : -1)
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
    dialogRef.afterClosed().subscribe(result => {
      //console.log("result "+result);
    });
  }

  applyFilter(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // Datasource defaults to lowercase matches
    this.dataSoursePendentes.filter = filterValue;
    this.dataSourseCanceladas.filter = filterValue;
  }

  

  atenderPaciente(consulta:Consulta){

    consulta.diagnosticos_aux.forEach(d => {
      console.log("Diagnostico aux do pacientes "+d.nome)
    });

    let dataSourseHistConsultas: MatTableDataSource<Consulta>; //Tabela de consultas pendentes
    dataSourseHistConsultas=new MatTableDataSource(
      this.consultas.filter(c =>c.status === "Encerrada" && c.paciente.nid == consulta.paciente.nid).sort((a, b) => a.data_encerramento > b.data_encerramento ? 1 : -1)
    );

    let dialogRef = this.dialog.open(AtenderConsultaDialog, {
      width: '1000px',
      height: '600px',
      data: { consulta: consulta, consultas: dataSourseHistConsultas, 
      diagnosticos: this.diagnosticos as DiagnosticoAuxiliar[] }
      });
      dialogRef.afterClosed().subscribe(result => {
      console.log("result "+result);
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

  //Atributos da tabela de HISTORICO DE CONSULTAS
  //dataSourseHistConsultas: MatTableDataSource<Consulta>; //Tabela de consultas pendentes
  displayedColumnsHistConsultas = ['data','diagnostico','tratamento','internamento', 'detalhes'];
  @ViewChild(MatPaginator) paginatorHistConsultas: MatPaginator;

  //temHistorico = false;

  

  constructor(  public dialogRef: MatDialogRef<AtenderConsultaDialog>,
  @Inject(MAT_DIALOG_DATA) public data: any, public authService:AuthService,
  public pacienteService: PacienteService,  public snackBar: MatSnackBar) {
    
  }

  atualizarDadosGerais(paciente:Paciente, consultas:Consulta[]){
    //Ao atualizar o objecto Paciente atualiza-se os dados na tabela de pacientes e em todas as consultas desse paciente
    let data = Object.assign({}, paciente);
    
    this.pacienteService.updatePaciente(data)
    .then( res => {

      consultas.forEach(c => {
        c.paciente = paciente;
        let d = Object.assign({}, c);
        this.pacienteService.updateConsulta(c)
        .then(r =>{})
        .catch(er =>{
          this.openSnackBar("Ocorreu um erro ao atualizar os dados. Consulte o Admin do sistema.");
        })
      });

      this.openSnackBar("Dados gerais do paciente atualizados com sucesso");

    }).catch( err => {
      this.openSnackBar("Ocorreu um erro ao atualizar os dados. Consulte o Admin do sistema.");
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

    consulta.diagnosticos_aux.forEach(d => {
      console.log("Diagnosticos aux marcados: "+d.nome)
    });


    consulta.status = "Diagnostico";
    consulta.data_diagnostico = new Date();
    consulta.marcador_diagnostico = this.authService.get_perfil + ' - ' + this.authService.get_user_displayName;
    let data = Object.assign({}, consulta);

    this.pacienteService.updateConsulta(data)
    .then( res => {
      this.dialogRef.close();
      this.openSnackBar("Paciente dispensado para diagnostico");
    }).catch( err => {
      console.log("ERRO: " + err.message)
    });

  }

  ngOnInit() {
    this.dialogRef.updateSize('80%', '90%');

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