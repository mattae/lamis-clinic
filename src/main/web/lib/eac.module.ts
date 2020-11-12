import {NgModule} from '@angular/core';
import {EacDetailsComponent} from './components/eac/eac.details.component';
import {EacEditComponent} from './components/eac/eac.edit.component';
import {EacResolve, ROUTES} from './services/eac.route';
import {CommonModule} from '@angular/common';
import {CovalentDialogsModule} from '@covalent/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {LamisSharedModule, MatDateFormatModule} from '@lamis/web-core';
import {MaterialModule} from './material.module';
import {CoreModule} from '@alfresco/adf-core';
import {CustomFormsModule} from 'ng2-validation';
import {RouterModule} from '@angular/router';

@NgModule({
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
        RouterModule.forChild(ROUTES)
    ],
    declarations: [
        EacDetailsComponent,
        EacEditComponent
    ],
    providers: [
        EacResolve
    ]
})
export class EacModule {

}
