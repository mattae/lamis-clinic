import {NgModule} from '@angular/core';
import {ClinicWidget} from './components/clinic/clinic.widget';
import {CommonModule} from '@angular/common';
import {CoreModule} from '@alfresco/adf-core';
import {MaterialModule} from './material.module';

@NgModule({
    imports: [
        CommonModule,
        MaterialModule,
        CoreModule
    ],
    declarations: [
        ClinicWidget
    ],
    entryComponents: [
        ClinicWidget
    ],
    exports: [
        ClinicWidget
    ],
    providers: []
})
export class ClinicWidgetModule {

}
