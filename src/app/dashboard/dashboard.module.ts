import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule, MatCardModule, MatButtonModule, MatListModule, MatProgressBarModule, MatMenuModule, MatSelectModule, MatInputModule } from '@angular/material';
import { FlexLayoutModule } from '@angular/flex-layout';

import { DashboardComponent } from './dashboard.component';
import { DashboardRoutes } from './dashboard.routing';
import { PacienteService } from '../services/paciente.service';
import { AngularFirestore } from '@angular/fire/firestore';

import { ChartsModule } from 'ng2-charts/ng2-charts';
import { AgmCoreModule } from '@agm/core';
import { ConfiguracoesService } from '../services/configuracoes.service';
import { FusionChartsModule } from 'angular-fusioncharts';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(DashboardRoutes),
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
    MatInputModule
  ],
  providers: [
    //{provide: OverlayContainer, useClass: FullscreenOverlayContainer},
    PacienteService,
    AngularFirestore,
    ConfiguracoesService
    
  ],
  declarations: [ DashboardComponent ]
})

export class DashboardModule {
  
}
