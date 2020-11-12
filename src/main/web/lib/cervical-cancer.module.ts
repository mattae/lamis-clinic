import {NgModule} from '@angular/core';
import {CervicalCancerScreeningComponent} from './components/cervical-cancer-screening/cervical-cancer-screening.component';
import {MaterialModule} from './material.module';
import {FormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {CervicalCancerScreeningDetailComponent} from './components/cervical-cancer-screening/cervical-cancer-screening-detail.component';
import {LamisSharedModule, MatDateFormatModule} from '@lamis/web-core';
import {CoreModule} from '@alfresco/adf-core';
import {RouterModule} from '@angular/router';
import {ObservationResolve, ROUTES} from './services/cervical-cancer-screening.route';
import {CovalentDialogsModule, CovalentMessageModule} from '@covalent/core';
import {CustomFormsModule} from 'ng2-validation';

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
        CervicalCancerScreeningComponent,
        CervicalCancerScreeningDetailComponent
    ],
    providers: [
        //ObservationResolve
    ]
})
export class CervicalCancerModule {

}
