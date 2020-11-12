import {NgModule} from '@angular/core';
import {CaseManagerDetailsComponent} from './components/case-management/case-manager.details.component';
import {CaseManagerEditComponent} from './components/case-management/case-manager.edit.component';
import {CaseManagerListComponent} from './components/case-management/case-manager.list.component';
import {MaterialModule} from './material.module';
import {CoreModule} from '@alfresco/adf-core';
import {CaseManagerResolve, ROUTES} from './services/case-manager.route';
import {FormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {CovalentDialogsModule, CovalentSearchModule} from '@covalent/core';
import {LamisSharedModule} from '@lamis/web-core';

@NgModule({
    imports: [
        CommonModule,
        MaterialModule,
        CoreModule,
        FormsModule,
        RouterModule.forChild(ROUTES),
        CoreModule,
        NgbModule,
        CovalentSearchModule,
        CovalentDialogsModule,
        LamisSharedModule,
    ],
    declarations: [
        CaseManagerDetailsComponent,
        CaseManagerEditComponent,
        CaseManagerListComponent
    ],
    providers: [
        CaseManagerResolve
    ]
})
export class CaseManagerModule {
}
