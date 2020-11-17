import {Component, OnInit} from '@angular/core';
import {CardViewBoolItemModel, CardViewDateItemModel, CardViewItem, CardViewTextItemModel, NotificationService} from '@alfresco/adf-core';
import {COVIDCancerScreening, Observation, Patient} from '../../model/clinic.model';
import {ActivatedRoute, Router} from '@angular/router';
import {TdDialogService} from '@covalent/core';
import {CervicalCancerScreeningService} from '../../services/cervical-cancer-screening.service';
import {ClinicService} from '../../services/clinic.service';


@Component({
    selector: 'covid19-screening-detail',
    templateUrl: './covid19-screening-detail.component.html'
})
export class Covid19ScreeningDetailComponent implements OnInit {

    properties: CardViewItem[] = [];
    entity: COVIDCancerScreening;
    observation: Observation;
    patient: Patient;

    constructor(private router: Router, private route: ActivatedRoute, private screeningService: CervicalCancerScreeningService,
                private _dialogService: TdDialogService, private clinicService: ClinicService,
                private notificationService: NotificationService) {
    }

    ngOnInit() {
        this.route.data.subscribe(({entity}) => {
            this.observation = !!entity && entity.body ? entity.body : entity;
            this.entity = this.observation.data;

            const patientId = this.route.snapshot.paramMap.get('patientId');
            this.clinicService.getPatient(patientId).subscribe((res) => this.patient = res);
            this.buildProperties();
        });
    }

    edit() {
        this.router.navigate(['/', 'covid19-screenings', this.observation.id, 'patient', this.patient.uuid, 'edit']);
    }

    delete() {
        this._dialogService.openConfirm({
            title: 'Confirm',
            message: 'Do you want to delete this COVID19 screening, action cannot be reversed?',
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
        this.properties.push(new CardViewBoolItemModel({
            key: 'na',
            value: this.entity.confirmed,
            label: 'COVID19 Confirmed',
        }));
        this.properties.push(new CardViewDateItemModel({
            label: 'Date Confirmed COVID19',
            key: 'fs',
            value: this.entity.dateConfirmed,
            format: 'dd MMM, yyyy'
        }));
        this.properties.push(new CardViewTextItemModel({
            label: 'COVID19 Outcome',
            key: 'adr',
            value: this.entity.outcome
        }));

        this.properties.push(new CardViewDateItemModel({
            key: 'ds',
            value: this.entity.dateOutcome,
            label: 'Date of COVID19 Outcome',
            format: 'dd MMM, yyyy'
        }));

    }

    previousState() {
        window.history.back();
    }

}
