import {Component, Input, OnInit} from '@angular/core';
import {ClinicService} from '../../services/clinic.service';
import {Clinic} from '../../model/clinic.model';
import {CardViewDateItemModel, CardViewFloatItemModel, CardViewItem, CardViewTextItemModel} from '@alfresco/adf-core';

@Component({
    selector: 'clinic-widget',
    templateUrl: './clinic.widget.html'
})
export class ClinicWidget implements OnInit {
    @Input()
    patientId: number;
    clinic: Clinic;
    properties: CardViewItem[] = [];

    constructor(private clinicService: ClinicService) {
    }

    ngOnInit(): void {
        this.clinicService.latestVisit(this.patientId).subscribe((res) => {
            this.clinic = res;
            this.buildProperties();
        });
    }

    buildProperties() {
        this.properties.push(new CardViewDateItemModel({
            key: 'dv',
            value: this.clinic.dateVisit,
            label: 'Last Clinic Visit',
            format: 'dd MMM, yyyy'
        }));
        this.properties.push(new CardViewDateItemModel({
            key: 'nv',
            value: this.clinic.nextAppointment,
            label: 'Next Clinic Visit',
            format: 'dd MMM, yyyy'
        }));
        this.properties.push(new CardViewTextItemModel({
            label: 'Functional Status',
            key: 'fs',
            value: this.clinic.funcStatus
        }));
        this.properties.push(new CardViewTextItemModel({
            label: 'Clinical Stage',
            key: 'cs',
            value: this.clinic.clinicStage
        }));
        this.properties.push(new CardViewTextItemModel({
            label: 'TB Status',
            key: 'ts',
            value: this.clinic.tbStatus
        }));
        this.properties.push(new CardViewFloatItemModel({
            label: 'Body Weight(Kg)',
            key: 'bw',
            value: this.clinic.bodyWeight
        }));
    }

}
