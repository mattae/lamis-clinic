import {NgModule} from '@angular/core';
import {ChronicCareDetailComponent} from './components/chronic-care/chronic.care.detail.component';
import {ChronicCareEditComponent} from './components/chronic-care/chronic.care.edit.component';
import {ChronicCareResolve} from './services/chronic.care.route';
import {MaterialModule} from './material.module';
import {CoreModule} from '@alfresco/adf-core';
import {CustomFormsModule} from 'ng2-validation';
import {CommonModule} from '@angular/common';
import {CovalentDialogsModule} from '@covalent/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {LamisSharedModule, MatDateFormatModule} from '@lamis/web-core';
import {RouterModule} from '@angular/router';
import {ROUTES} from './services/chronic.care.route';
import {MatStepperModule} from '@angular/material';

@NgModule({
    declarations: [
        ChronicCareDetailComponent,
        ChronicCareEditComponent
    ],
    imports: [
        CommonModule,
        CovalentDialogsModule,
        FormsModule,
        ReactiveFormsModule,
        LamisSharedModule,
        MaterialModule,
        CoreModule,
        CustomFormsModule,
        MatDateFormatModule,
        RouterModule.forChild(ROUTES),
        MatStepperModule
    ],
    providers: [
        ChronicCareResolve
    ]
})
export class ChronicCareModule {

}
