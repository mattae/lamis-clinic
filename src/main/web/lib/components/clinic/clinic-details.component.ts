import {Component, ComponentFactoryResolver, OnDestroy, OnInit} from '@angular/core';
import {Clinic} from '../../model/clinic.model';
import {ActivatedRoute, Router} from '@angular/router';
import {ClinicService} from '../../services/clinic.service';
import {TdDialogService} from '@covalent/core';
import {
    CardViewBoolItemModel,
    CardViewDateItemModel,
    CardViewFloatItemModel,
    CardViewIntItemModel,
    CardViewItem,
    CardViewTextItemModel,
    NotificationService
} from '@alfresco/adf-core';

import * as moment_ from 'moment';

const moment = moment_;

@Component({
    selector: 'lamis-clinic',
    templateUrl: './clinic-details.component.html'
})
export class ClinicDetailsComponent implements OnInit, OnDestroy {
    properties: CardViewItem[] = [];
    entity: Clinic;

    constructor(private router: Router, private route: ActivatedRoute, private clinicService: ClinicService,
                private cfr: ComponentFactoryResolver, private _dialogService: TdDialogService,
                private notificationService: NotificationService) {
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
        this.router.navigate(['/', 'clinics', this.entity.uuid, 'patient', this.entity.patient.uuid, 'edit']);
    }

    delete() {
        this._dialogService.openConfirm({
            title: 'Confirm',
            message: 'Do you want to delete this clinic visit, action cannot be reversed?',
            cancelButton: 'No',
            acceptButton: 'Yes',
            width: '500px',
        }).afterClosed().subscribe((accept: boolean) => {
            if (accept) {
                this.clinicService.delete(this.entity.id).subscribe((res) => {
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
        this.properties.push(new CardViewDateItemModel({
            key: 'ds',
            value: this.entity.dateVisit,
            label: this.entity.commence ? 'ART Start Date' : 'Date Visit',
            format: 'dd MMM, yyyy'
        }));
        if (this.entity.commence) {
            this.properties.push(new CardViewIntItemModel({
                label: 'CD4 at start of ART',
                key: 'cd4',
                value: this.entity.cd4p || null
            }));
            this.properties.push(new CardViewFloatItemModel({
                label: 'CD4%',
                key: 'cd4p',
                value: this.entity.cd4p || null
            }));
            this.properties.push(new CardViewTextItemModel({
                label: 'Original Regimen Line',
                key: 'rl',
                value: this.entity.regimenType != null ? this.entity.regimenType.description : ''
            }));
            this.properties.push(new CardViewTextItemModel({
                label: 'Original Regimen',
                key: 'rl',
                value: this.entity.regimen != null ? this.entity.regimen.description : ''
            }));
        }
        if (this.entity.extra && this.entity.patient.extra.prep && this.entity.patient.extra.prep.registered) {
            if (this.entity.commence) {
                this.properties.push(new CardViewTextItemModel({
                    label: 'HIV Status at PrEP Initiation',
                    key: 'cs',
                    value: this.entity.extra.prep.hivTestResult
                }));
                this.properties.push(new CardViewTextItemModel({
                    label: 'Creatinine Clearance (mL/min)',
                    key: 'cs',
                    value: this.entity.extra.prep.creatinineClearance
                }));
                this.properties.push(new CardViewTextItemModel({
                    label: 'Urinalysis',
                    key: 'cs',
                    value: this.entity.extra.prep.urinalysis
                }));
                this.properties.push(new CardViewTextItemModel({
                    label: 'Hepatitis B Screening',
                    key: 'cs',
                    value: this.entity.extra.prep.hepatitisB
                }));
                this.properties.push(new CardViewTextItemModel({
                    label: 'Hepatitis C Screening',
                    key: 'cs',
                    value: this.entity.extra.prep.hepatitisC
                }));
            } else {
                this.properties.push(new CardViewTextItemModel({
                    label: 'HIV Status /Test Result',
                    key: 'cs',
                    value: this.entity.extra.prep.hivTestResult
                }));
            }
        }
        if (this.entity.extra && this.entity.extra.otz && this.entity.extra.otz.dateEnrolledOnOTZ) {
            this.properties.push(new CardViewDateItemModel({
                key: 'ds',
                value: moment(this.entity.extra.dateEnrolledOnOTZ),
                label: 'Date Enrolled on OTZ',
                format: 'dd MMM, yyyy'
            }));
        }
        this.properties.push(new CardViewTextItemModel({
            label: 'Clinical Stage',
            key: 'cs',
            value: this.entity.clinicStage
        }));
        this.properties.push(new CardViewTextItemModel({
            label: 'Functional Status',
            key: 'fs',
            value: this.entity.funcStatus
        }));
        this.properties.push(new CardViewTextItemModel({
            label: 'TB Status',
            key: 'ts',
            value: this.entity.tbStatus
        }));
        this.properties.push(new CardViewFloatItemModel({
            label: 'Body Weight(Kg)',
            key: 'bw',
            value: this.entity.bodyWeight || null
        }));
        this.properties.push(new CardViewFloatItemModel({
            label: 'Height(m)',
            key: 'h',
            value: this.entity.height || null
        }));
        this.properties.push(new CardViewTextItemModel({
            label: 'Blood Pressure',
            key: 'cd4p',
            value: this.entity.bp
        }));
        if (this.entity.patient.gender === 'Female') {
            this.properties.push(new CardViewBoolItemModel({
                label: 'Pregnant',
                key: 'pg',
                value: this.entity.pregnant
            }));
            this.properties.push(new CardViewBoolItemModel({
                label: 'Breastfeeding',
                key: 'bf',
                value: this.entity.breastfeeding
            }));
            this.properties.push(new CardViewDateItemModel({
                key: 'lpm',
                value: this.entity.lmp,
                label: 'LMP',
                format: 'dd MMM, yyyy'
            }));
        }
        this.properties.push(new CardViewTextItemModel({
            label: 'Level of Adherence',
            key: 'ts',
            value: this.entity.tbStatus
        }));
        if (this.entity.extra && this.entity.extra.otz && this.entity.extra.otz.dateLastOTZMeeting) {
            this.properties.push(new CardViewDateItemModel({
                key: 'ds',
                value: moment(this.entity.extra.dateLastOTZMeeting),
                label: 'Date of Last OTZ Meeting',
                format: 'dd MMM, yyyy'
            }));
        }
        this.properties.push(new CardViewDateItemModel({
            key: 'na',
            value: this.entity.nextAppointment,
            label: 'Next Appointment Date',
            format: 'dd MMM, yyyy'
        }));
    }

    previousState() {
        window.history.back();
    }

    public ngOnDestroy() {
    }
}
