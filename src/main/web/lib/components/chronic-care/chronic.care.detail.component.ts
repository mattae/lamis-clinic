import {Component, OnInit} from '@angular/core';
import {ClinicService} from '../../services/clinic.service';
import {CardViewItem, NotificationService} from '@alfresco/adf-core';
import {ActivatedRoute, Router} from '@angular/router';
import {ChronicCare} from '../../model/clinic.model';
import {TdDialogService} from '@covalent/core';
import {ChronicCareService} from '../../services/chronic.care.service';

@Component({
    selector: 'chronic-care-detail',
    templateUrl: './chronic.care.detail.component.html'
})
export class ChronicCareDetailComponent implements OnInit {
    properties: CardViewItem[] = [];
    entity: ChronicCare;

    constructor(private router: Router, private route: ActivatedRoute, private chronicCareService: ChronicCareService,
                private _dialogService: TdDialogService, private notificationService: NotificationService,
                private clinicService: ClinicService) {
    }

    ngOnInit() {
        this.route.data.subscribe(({entity}) => {
            this.entity = !!entity && entity.body ? entity.body : entity;
            const patientId = this.route.snapshot.paramMap.get('patientId');
            this.clinicService.getPatient(patientId).subscribe((res) => this.entity.patient = res);
            this.buildProperties();
        });
    }

    edit() {
        this.router.navigate(['/', 'chronic-cares', this.entity.uuid, 'patient', this.entity.patient.uuid, 'edit']);
    }

    delete() {
        this._dialogService.openConfirm({
            title: 'Confirm',
            message: 'Do you want to delete this chronic care visit, action cannot be reversed?',
            cancelButton: 'No',
            acceptButton: 'Yes',
            width: '500px',
        }).afterClosed().subscribe((accept: boolean) => {
            if (accept) {
                this.chronicCareService.delete(this.entity.id).subscribe((res) => {
                    if (res.ok) {
                        this.router.navigate(['patients']);
                    } else {
                        this.notificationService.showError('Error deleting visit, please try again');
                    }
                });
            } else {
                // DO SOMETHING ELSE
            }
        });
    }

    buildProperties() {

    }


    previousState() {
        window.history.back();
    }
}
