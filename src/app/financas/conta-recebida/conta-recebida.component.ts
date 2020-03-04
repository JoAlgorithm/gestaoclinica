import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatSort, MatSnackBar, MatDialog } from '@angular/material';
import { Conta } from '../../classes/conta';
import { PacienteService } from '../../services/paciente.service';
import { ConfiguracoesService } from '../../services/configuracoes.service';

@Component({
  selector: 'app-conta-recebida',
  templateUrl: './conta-recebida.component.html',
  styleUrls: ['./conta-recebida.component.scss']
})
export class ContaRecebidaComponent implements OnInit {

  anos = [];
  ano:string = (new Date()).getFullYear()+"";

  contas: Conta[] = [];

  dataSourse: MatTableDataSource<Conta>;
  displayedColumns = ['fatura','data', 'valor_total', 'seguradora', 'paciente', 'servico', 'fpagamento', 'imprimir'];
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  
  formas_pagamento = [
    {value: 'Todas', viewValue: 'Todas'},
    {value: 'Cartão de crédito', viewValue: 'Cartão de crédito'},
    {value: 'Convênio', viewValue: 'Convênio'},
    {value: 'Numerário', viewValue: 'Numerário'},
  ]
  forma_pagamento = this.formas_pagamento[0].value;
  
  constructor(private pacienteService: PacienteService, private configService: ConfiguracoesService, public snackBar: MatSnackBar,
    public dialog: MatDialog) { }

  ngOnInit() {
    setTimeout(() => {
      //ANOS
      this.configService.getAnos().snapshotChanges().subscribe(data => {
        this.anos = data.map(e => {
          return {
            id: e.payload.key
          }
        })
      })

      //CONTAS
      this.pacienteService.getContasRecebidas(this.ano).snapshotChanges().subscribe(data => {
        this.contas = data.map(e => {
          return {
            id: e.payload.key,
            ...e.payload.val(),
          } as Conta;
        })

        this.dataSourse=new MatTableDataSource(this.contas.sort((a, b) => +b.id - +a.id));
        this.dataSourse.paginator = this.paginator;
        this.dataSourse.sort = this.sort      

        if(this.contas.length <= 0){
          this.openSnackBar("Nao existe nenhuma conta recebida em "+this.ano);
        }
      })

    })//Fim do timeOut
  }

  mudarFPagamento(){

  }

  onSelect(ano, forma_pagamento){
    this.contas = [];
    this.pacienteService.getContasRecebidas(ano).snapshotChanges().subscribe(data => {
      this.contas = data.map(e => {
        return {
          id: e.payload.key,
          ...e.payload.val(),
        } as Conta;
      })

         

      if(this.contas.length <= 0){
        this.openSnackBar("Nao existe nenhuma conta recebida em "+this.ano);
      }else{
        if(forma_pagamento !== "Todas"){

          this.contas.forEach(element => {

            if(element.forma_pagamento !== forma_pagamento){
              this.contas = this.contas.filter(obj => obj !== element); //Remover obejto do array
            }
  
          });

        }
      }

      this.dataSourse=new MatTableDataSource(this.contas);
      this.dataSourse.paginator = this.paginator;
      this.dataSourse.sort = this.sort   
    })
  }

  imprimir(conta: Conta){
    
  }

  openSnackBar(mensagem) {
    this.snackBar.open(mensagem, null,{
      duration: 2000
    })
  }

}
