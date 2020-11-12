import {NgModule} from '@angular/core';
import {PatientListComponent} from './components/case-management/patient.list.component';
import {MaterialModule} from './material.module';
import {FormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {CoreModule} from '@alfresco/adf-core';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {CovalentDialogsModule, CovalentSearchModule} from '@covalent/core';
import {ROUTES} from './services/case-management.route';
import {RouterModule} from '@angular/router';
import {LamisSharedModule} from '@lamis/web-core';

@NgModule({
    imports: [
        MaterialModule,
        FormsModule,
        CommonModule,
        RouterModule.forChild(ROUTES),
        CoreModule,
        NgbModule,
        CovalentSearchModule,
        CovalentDialogsModule,
        LamisSharedModule,
    ],
    declarations: [
        PatientListComponent
    ],
    providers: []
})
export class CaseManagementModule {

}
