import { Component, OnInit, ViewChild } from '@angular/core';
import { Paciente } from '../../classes/paciente';
import { MatTableDataSource, MatPaginator, MatSort, MatSnackBar } from '@angular/material';
import { ConfiguracoesService } from '../../services/configuracoes.service';
import { PacienteService } from '../../services/paciente.service';
import { AuthService } from '../../services/auth.service';
import { Consulta } from '../../classes/consulta';
import { Faturacao } from '../../classes/faturacao';

@Component({
  selector: 'app-pendentes',
  templateUrl: './pendentes.component.html',
  styleUrls: ['./pendentes.component.scss']
})
export class PendentesComponent implements OnInit {

  consultas: Consulta[];
  dataSourse: MatTableDataSource<Consulta>;
  displayedColumns = ['nid','apelido', 'nome', 'diagnosticos_aux', 'valor_pagar' ,'status','imprimir', 'faturar'];
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  faturacao: Faturacao;

  constructor(public authService: AuthService, public configServices:ConfiguracoesService,
    private pacienteService: PacienteService,public snackBar: MatSnackBar) { }

    ngOnInit() {
      this.pacienteService.getConsultas().subscribe(data => {
        this.consultas = data.map(e => {
          return {
            id: e.payload.doc.id,
            paciente: e.payload.doc.data()['paciente'] as Paciente,
            ...e.payload.doc.data(),
          } as Consulta;
        })

        this.consultas.filter(c =>c.status === "Diagnostico" || c.status === "Internamento").forEach(c => {
          c.lista_diagnosticos_aux = undefined;
          //console.log(" --------------- "+ c.paciente.nome+" ---------------------")
          c.diagnosticos_aux.forEach(element => {
            //if(element.faturado !== true){

              //console.log("ELEMENT "+ element.nome)
              //console.log("LISTA ATUAL "+c.lista_diagnosticos_aux)

              if(c.lista_diagnosticos_aux){
                //console.log("2")
                c.lista_diagnosticos_aux = c.lista_diagnosticos_aux + " | " + element.nome
                c.preco_diagnosticos = +c.preco_diagnosticos + +element.preco;
              }else{
                //console.log("1")
                c.lista_diagnosticos_aux = element.nome;
                c.preco_diagnosticos = element.preco;
              }
            //}
            
          });

        });

        

      this.dataSourse=new MatTableDataSource(
        this.consultas.filter(c =>c.status === "Diagnostico" || c.status === "Internamento").sort((a, b) => a.data > b.data ? 1 : -1)
      );
      this.dataSourse.paginator = this.paginator;
      this.dataSourse.sort = this.sort;
    })
  }
  

  applyFilter(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // Datasource defaults to lowercase matches
    this.dataSourse.filter = filterValue;
    this.dataSourse.filter = filterValue;
  }

  faturarDiagnostico(consulta: Consulta){

    this.faturacao = new Faturacao();
    this.faturacao.categoria = "DIAGNOSTICO_AUX";
    this.faturacao.valor = consulta.preco_diagnosticos;
    this.faturacao.data = new Date();
    this.faturacao.consulta = consulta;
    this.faturacao.diagnostico_aux = consulta.diagnosticos_aux;
    //this.faturacao.diagnostico_aux = this.consultas.
    this.faturacao.faturador = this.authService.get_perfil + ' - ' + this.authService.get_user_displayName;

    consulta.status = "Em andamento";

    if(consulta.diagnosticos_aux.length>1){
      //Mais de um diagnostico para rececionista poder selecionar apenas que os clientes querem
      console.log("mais de 1")
    }else{
      //Um diagnostico apenas
      
      consulta.diagnosticos_aux[0].faturado = true;
      //faturacao
      let data = Object.assign({}, this.faturacao);

      this.pacienteService.faturar(data)
      .then( res => {

        let d = Object.assign({}, consulta); 
        this.pacienteService.updateConsulta(d)
        .then(r => {
          this.openSnackBar("Faturado com sucesso");
        })
        .catch(er => {
          console.log("ERRO: " + er.message)
        })
        
      }).catch( err => {
        console.log("ERRO: " + err.message)
      });
    }
  }


  openSnackBar(mensagem) {
    this.snackBar.open(mensagem, null,{
      duration: 2000
    })
  }



}
