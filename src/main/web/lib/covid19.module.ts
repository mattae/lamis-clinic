import {NgModule} from '@angular/core';
import {MaterialModule} from './material.module';
import {FormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {LamisSharedModule, MatDateFormatModule} from '@lamis/web-core';
import {CoreModule} from '@alfresco/adf-core';
import {RouterModule} from '@angular/router';
import {ROUTES} from './services/covid19.route';
import {CovalentDialogsModule, CovalentMessageModule} from '@covalent/core';
import {CustomFormsModule} from 'ng2-validation';
import {Covid19ScreeningComponent} from './components/covid19/covid19-screening.component';
import {Covid19ScreeningDetailComponent} from './components/covid19/covid19-screening-detail.component';

@NgModule({
    imports: [
        MaterialModule,
        FormsModule,
        CommonModule,
        MatDateFormatModule,
        CoreModule,
        RouterModule.forChild(ROUTES),
        CovalentMessageModule,
        CovalentDialogsModule,
        CustomFormsModule,
        LamisSharedModule,
    ],
    declarations: [
        Covid19ScreeningComponent,
        Covid19ScreeningDetailComponent
    ],
    providers: []
})
export class Covid19Module {

}
