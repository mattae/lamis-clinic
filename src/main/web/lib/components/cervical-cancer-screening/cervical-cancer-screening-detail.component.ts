import {Component, OnInit} from '@angular/core';
import {
    CardViewBoolItemModel,
    CardViewDateItemModel,
    CardViewItem,
    CardViewTextItemModel,
    NotificationService
} from '@alfresco/adf-core';
import {CervicalCancerScreening, Observation, Patient} from '../../model/clinic.model';
import {ActivatedRoute, Router} from '@angular/router';
import {TdDialogService} from '@covalent/core';
import {CervicalCancerScreeningService} from '../../services/cervical-cancer-screening.service';
import {ClinicService} from '../../services/clinic.service';

const RESULT = {
    NEGATIVE: 'Negative',
    POSITIVE: 'Positive',
    SUSPICIOUS: 'Suspicious Cancerous Lesions'
};

const METHOD = {
    VIA: 'Visual Inspection with Acetric Acid (VIA)',
    VILI: 'Visual Inspection with Lugos Iodine (VILI)',
    PAP_SMEAR: 'PAP Smear'
};
const LESION_METHOD = {
    CRYOTHERAPY: 'Cryotherapy',
    THERMAL_ABLATION: 'Thermal Ablation/ Thermocoagulation',
    LEETZ_LEEP: 'LEETZ/ LEEP',
    CONIZATION: 'Conization Knifer/ Lagor'
};

const TYPE = {
    FIRST_TIME: 'First Time',
    FOLLOWUP: 'Followup after previous negative result or suspected cancer',
    POST_TREATMENT_FOLLOWUP: 'Post-treatment Followup'
};

@Component({
    selector: 'cervical-screening-detail',
    templateUrl: './cervical-cancer-screening-detail.component.html'
})
export class CervicalCancerScreeningDetailComponent implements OnInit {

    properties: CardViewItem[] = [];
    entity: CervicalCancerScreening;
    observation: Observation;
    patient: Patient;

    constructor(private router: Router, private route: ActivatedRoute, private screeningService: CervicalCancerScreeningService,
                private _dialogService: TdDialogService, private clinicService: ClinicService,
                private notificationService: NotificationService) {
    }

    ngOnInit() {
        this.route.data.subscribe(({entity}) => {
            this.entity = !!entity && entity.body ? entity.body.data.cervicalCancerScreening : entity.data.cervicalCancerScreening;
            this.observation = !!entity && entity.body ? entity.body : entity;

            const patientId = this.route.snapshot.paramMap.get('patientId');
            this.clinicService.getPatient(patientId).subscribe((res) => this.patient = res);
            this.buildProperties();
        });
    }

    edit() {
        this.router.navigate(['/', 'cervical-cancer-screening', this.observation.id, 'patient', this.patient.uuid, 'edit']);
    }

    delete() {
        this._dialogService.openConfirm({
            title: 'Confirm',
            message: 'Do you want to delete this Cervical cancer screening, action cannot be reversed?',
            cancelButton: 'No',
            acceptButton: 'Yes',
            width: '500px',
        }).afterClosed().subscribe((accept: boolean) => {
            if (accept) {
                this.screeningService.delete(this.observation.id).subscribe((res) => {
                    if (res.ok) {
                        this.router.navigate(['patients']);
                    } else {
                        this.notificationService.showError('Error deleting screening, please try again');
                    }
                });
            } else {
                // DO SOMETHING ELSE
            }
        });
    }

    buildProperties() {
        this.properties.push(new CardViewDateItemModel({
            key: 'ds',
            value: this.observation.date,
            label: 'Date of Screening',
            format: 'dd MMM, yyyy'
        }));
        this.properties.push(new CardViewTextItemModel({
            key: 'na',
            value: TYPE[this.entity.screeningType],
            label: 'Screening Type',
        }));
        this.properties.push(new CardViewTextItemModel({
            label: 'Screening Method',
            key: 'fs',
            value: METHOD[this.entity.screeningMethod]
        }));
        this.properties.push(new CardViewTextItemModel({
            label: 'Result',
            key: 'adr',
            value: RESULT[this.entity.screeningResult]
        }));
        this.properties.push(new CardViewBoolItemModel({
            label: 'Referred for Treatment',
            key: 'bw',
            value: this.entity.referredForTreatment
        }));

        if (!!this.entity.referredForTreatment) {
            this.properties.push(new CardViewTextItemModel({
                label: 'Precancerous Lesions Treatment method',
                key: 'adr',
                value: LESION_METHOD[this.entity.precancerousLesionsTreatmentMethod]
            }));

            this.properties.push(new CardViewDateItemModel({
                key: 'ds',
                value: this.entity.dateTreated,
                label: 'Date of Treated',
                format: 'dd MMM, yyyy'
            }));
        }

    }

    previousState() {
        window.history.back();
    }

}
