import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule, MatCardModule, MatTableModule, MatPaginatorModule, MatButtonModule, MatListModule, MatProgressBarModule, MatMenuModule, MatSelectModule, MatInputModule, MatSnackBarModule } from '@angular/material';
import { FlexLayoutModule } from '@angular/flex-layout';

import { AngularFirestore } from '@angular/fire/firestore';

import { ChartsModule } from 'ng2-charts/ng2-charts';
import { AgmCoreModule } from '@agm/core';
import { FusionChartsModule } from 'angular-fusioncharts';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { MatDialogModule } from '@angular/material/dialog';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { EstoqueService } from '../services/estoque.service';
import { VendasRoutes } from './vendas.routing';
import { VendasComponent } from './vendas.component';
import { ConfiguracoesService } from '../services/configuracoes.service';
import { OverlayContainer, FullscreenOverlayContainer } from '@angular/cdk/overlay';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(VendasRoutes),
    MatIconModule,
    MatCardModule,
    MatButtonModule,
    MatListModule,
    MatProgressBarModule,
    MatMenuModule,
    FlexLayoutModule,
    ChartsModule,
    AgmCoreModule,
    MatSelectModule,
    FusionChartsModule,// Include in imports
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    NgxPaginationModule,
    NgxDatatableModule,
    MatTableModule,
    MatPaginatorModule,
    MatDialogModule,
    NgxMatSelectSearchModule,
    MatSnackBarModule,
  ],
  providers: [
    {provide: OverlayContainer, useClass: FullscreenOverlayContainer},
    AngularFirestore,
    EstoqueService,
    ConfiguracoesService 
  ],
  declarations: [ 
    VendasComponent
  ],
  entryComponents: [
  ]
})

export class VendasModule {
  
}
