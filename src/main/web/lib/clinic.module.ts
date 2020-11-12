import {CoreModule} from '@alfresco/adf-core';
import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatProgressBarModule,
    MatSelectModule
} from '@angular/material';
import {RouterModule} from '@angular/router';
import {CovalentDialogsModule, CovalentMessageModule} from '@covalent/core';
import {ClinicDetailsComponent} from './components/clinic/clinic-details.component';
import {ClinicEditComponent} from './components/clinic/clinic-edit.component';
import {ClinicResolve, ROUTES} from './services/clinic.route';
import {ClinicWidgetModule} from './clinic.widget.module';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {LamisSharedModule, MatDateFormatModule} from '@lamis/web-core';
import {CustomFormsModule} from 'ng2-validation';
import {NgxDatatableModule} from '@swimlane/ngx-datatable';

@NgModule({
    declarations: [
        ClinicDetailsComponent,
        ClinicEditComponent
    ],
    imports: [
        CommonModule,
        MatInputModule,
        MatIconModule,
        MatCardModule,
        MatSelectModule,
        MatButtonModule,
        RouterModule.forChild(ROUTES),
        MatProgressBarModule,
        CovalentMessageModule,
        CovalentDialogsModule,
        MatListModule,
        CoreModule,
        ClinicWidgetModule,
        FormsModule,
        ReactiveFormsModule,
        MatDateFormatModule,
        CustomFormsModule,
        LamisSharedModule,
        NgxDatatableModule,
    ],
    exports: [
        ClinicDetailsComponent,
        ClinicEditComponent
    ],
    entryComponents: [],
    providers: [
        ClinicResolve
    ]
})
export class ClinicModule {
}
