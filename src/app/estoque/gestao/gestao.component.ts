import { Component, OnInit, ViewChild } from '@angular/core';
import { Deposito } from '../../classes/deposito';
import { EstoqueService } from '../../services/estoque.service';
import { Medicamento } from '../../classes/medicamento';
import { MatTableDataSource, MatPaginator, MatSort, MatSnackBar } from '@angular/material';
//import { CommonModule, CurrencyPipe} from '@angular/common';

@Component({
  selector: 'app-gestao',
  templateUrl: './gestao.component.html',
  styleUrls: ['./gestao.component.scss']
})
export class GestaoComponent implements OnInit {

  depositos: Deposito[];
  deposito: Deposito;
  medicamentos: Medicamento[] = [];

  dataSourse: MatTableDataSource<Medicamento>;
  displayedColumns = ['codigo','nome', 'min',  'qtd_disponivel', 'valor_unitario', 'valor_total', 'nivel', 'sugestao'];
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(private estoqueService: EstoqueService, public snackBar: MatSnackBar
    //, private currencyPipe : CurrencyPipe
    ) { 
    this.deposito = new Deposito();
  }


  ngOnInit() {
    this.estoqueService.getDepositos().snapshotChanges().subscribe(data => {
      this.depositos = data.map(e => {
        return {
          id: e.payload.key,
          medicamentos: e.payload.val()['medicamentos'] as Medicamento[],
          ...e.payload.val(),
        } as Deposito;
      })

      if(this.depositos[0]){
        this.deposito = this.depositos[0];
        this.medicamentos = this.depositos[0].medicamentos;

       

      //transformAmount(element){
        //this.formattedAmount = this.currencyPipe.transform(this.deposito.valor_total, '$');
    
        //element.target.value = this.formattedAmount;
      //}

      }

      this.medicamentos = [];
      if(this.deposito.medicamentos){

        Object.keys(this.deposito.medicamentos).forEach(key=>{
          this.medicamentos.push(this.deposito.medicamentos[key]);
        })

        this.medicamentos.forEach(element => {
          if(element.min){
            if(element.qtd_disponivel == 0){
              element.nivel = "Zerado";
              element.sugestao = "Repor urgente";
            }else if(element.qtd_disponivel >= element.min){
              element.nivel = ">= Min";
              element.sugestao = "Estoque aceitavel";
            }else if(element.min > 0){
              element.nivel = "< Min";
              element.sugestao = "Repor";
            }else{
              element.sugestao = "Definir min";
            }
          }else{
            element.sugestao = "Definir min";
          }
        });

        this.dataSourse=new MatTableDataSource(this.medicamentos);
        this.dataSourse.paginator = this.paginator;
        this.dataSourse.sort = this.sort
  
      }else{
        this.medicamentos = [];
        this.dataSourse=new MatTableDataSource(this.medicamentos);
        this.dataSourse.paginator = this.paginator;
        this.dataSourse.sort = this.sort
        this.openSnackBar("Deposito sem medicamentos. Contacte o Admnistrativo");
      }
      
    })
  }
  
  onSelect(deposito: Deposito){ //Mudar de deposito
    this.medicamentos = [];
    //this.medicamento = new Medicamento();
    //this.max = 1;
    if(deposito.medicamentos){

      Object.keys(deposito.medicamentos).forEach(key=>{
        this.medicamentos.push(deposito.medicamentos[key]);
      })

      this.medicamentos.forEach(element => {
        if(element.min){
          if(element.qtd_disponivel == 0){
            element.nivel = "Zerado";
            element.sugestao = "Repor urgente";
          }else if(element.qtd_disponivel >= element.min){
            element.nivel = ">= Min";
            element.sugestao = "Estoque aceitavel";
          }else if(element.min > 0){
            element.nivel = "< Min";
            element.sugestao = "Repor";
          }else{
            element.sugestao = "Definir min";
          }
        }else{
          element.sugestao = "Definir min";
        }
      });

      this.dataSourse=new MatTableDataSource(this.medicamentos);
      this.dataSourse.paginator = this.paginator;
      this.dataSourse.sort = this.sort

    }else{
      this.medicamentos = [];
      this.dataSourse=new MatTableDataSource(this.medicamentos);
      this.dataSourse.paginator = this.paginator;
      this.dataSourse.sort = this.sort
      this.openSnackBar("Deposito sem medicamentos. Contacte o Admnistrativo");
    }
  }

  openSnackBar(mensagem) {
    this.snackBar.open(mensagem, null,{
      duration: 3000
    })
  }


}
