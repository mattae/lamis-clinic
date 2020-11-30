import {Component, OnInit} from '@angular/core';
import {Adhere, AdverseDrugReaction, Clinic, ClinicAdverseDrugReaction, OpportunisticInfection} from '../../model/clinic.model';
import {ClinicService} from '../../services/clinic.service';
import {NotificationService} from '@alfresco/adf-core';
import {ActivatedRoute} from '@angular/router';
import {HttpErrorResponse, HttpResponse} from '@angular/common/http';
import {Observable} from 'rxjs';
import * as moment_ from 'moment';
import {Moment} from 'moment';
import {AppLoaderService, DATE_FORMAT, entityCompare} from '@lamis/web-core';
import {ColumnMode} from '@swimlane/ngx-datatable';

const moment = moment_;

@Component({
    selector: 'lamis-clinic-edit',
    templateUrl: './clinic-edit.component.html'
})
export class ClinicEditComponent implements OnInit {
    // @ViewChild(MatProgressBar, {static: true}) progressBar: MatProgressBar;
    // @ViewChild(MatButton, {static: true}) submitButton: MatButton;
    entity: Clinic;
    isSaving: boolean;
    error = false;
    commence: any;
    today = moment();
    lmpMin: Moment;
    appointmentMax: Moment;
    appointmentMin: Moment;
    opportunisticInfections: OpportunisticInfection[];
    adverseDrugReactions: AdverseDrugReaction[];
    adheres: Adhere[];
    regimenLines: any[];
    regimens: any[];
    dateBirth: Moment;
    dateRegistration: Moment;
    visitDates: Moment[] = [];
    selectedClinicAdr: ClinicAdverseDrugReaction[] = [];
    // oiList: OpportunisticInfection[] = [];
    // adhereList: Adhere[] = [];
    ColumnMode = ColumnMode;
    adr = false;
    enrolledOnOTZ: boolean;
    fullDisclosure: boolean;
    dateOfFullDisclosure: Moment;
    dateEnrolledOnOTZ: Moment;
    attendedLastOTZMeeting: boolean;
    dateLastOTZMeeting: Moment;
    modulesCompleted: number;
    caregiverPhone: string;
    caregiverAddress: string;
    otzApplicable = false;
    hasOtz = false;
    hivTestResult: string;
    prep: boolean;
    urinalysis: string;
    hepatitisB: string;
    hepatitisC: string;
    creatinineClearance: any;

    constructor(private clinicService: ClinicService,
                protected notification: NotificationService,
                protected activatedRoute: ActivatedRoute,
                private appLoaderService: AppLoaderService) {
    }

    createEntity(): Clinic {
        return <Clinic>{};
    }

    ngOnInit(): void {
        this.clinicService.opportunisticInfections().subscribe(res => this.opportunisticInfections = res);
        this.clinicService.adheres().subscribe(res => this.adheres = res);
        this.isSaving = false;
        this.clinicService.getRegimenLines().subscribe(res => {
            this.regimenLines = res;
        });
        this.activatedRoute.data.subscribe(({entity}) => {
            this.commence = !!this.activatedRoute.snapshot.data['commence'];

            this.entity = !!entity && entity.body ? entity.body : entity;
            if (this.entity === undefined) {
                this.entity = this.createEntity();
            }
            const patientId = this.activatedRoute.snapshot.paramMap.get('patientId');

            this.clinicService.getPatient(patientId).subscribe((res) => {
                this.entity.patient = res;
                this.entity.facility = res.facility;
                this.dateBirth = res.dateBirth;
                this.dateRegistration = res.dateRegistration;

                if (res.statusAtRegistration === 'ART_TRANSFER_IN') {
                    this.dateRegistration = moment('1999-01-01', 'YYYY-MM-DD');
                    if (this.dateRegistration.isBefore(this.entity.patient.dateBirth)) {
                        this.dateRegistration = this.entity.patient.dateBirth.clone().add(3, 'months');
                    }
                }
                if (res.extra && res.extra.prep && res.extra.prep.registered) {
                    this.prep = true;

                    this.clinicService.getRegimenLines().subscribe(res1 => {
                        this.regimenLines = res1.filter(t => {
                            return t.id === 30;
                        });
                    });
                }

                this.clinicService.enrolledOnOTZ(res.id).subscribe(r => {
                    this.enrolledOnOTZ = r;
                    this.hasOtz = r;
                });

                this.otzApplicable = !moment().subtract(24, 'years').isAfter(this.entity.patient.dateBirth)
                    && !moment().subtract(10, 'years').isBefore(this.entity.patient.dateBirth);

                this.clinicService.getVisitDatesByPatient(this.entity.patient.id).subscribe((res1) => {
                    this.visitDates = res1;
                });
            });
            if (this.entity.commence && this.entity.regimenType) {
                this.regimenLineChange(this.entity.regimenType);
            }
            this.commence = this.commence || this.entity.commence;

            if (this.commence) {
                this.entity.commence = true;
                if (this.entity.regimenType) {
                    this.regimenLineChange(this.entity.regimenType);
                }
            }

            if (this.entity.id) {
                this.appointmentMin = this.entity.dateVisit.clone().add(14, 'days');
                this.appointmentMax = this.entity.dateVisit.clone().add(8, 'months');
                this.clinicService.adverseDrugReactions().subscribe(res1 => {
                    this.adverseDrugReactions = res1;

                    this.adr = !!this.entity.adverseDrugReactions.length;
                    this.adverseDrugReactions.forEach(adr => {
                        let found = false;
                        (this.entity.adverseDrugReactions || []).forEach(cadr => {
                            if (cadr.adverseDrugReaction.id === adr.id) {
                                found = true;
                                this.selectedClinicAdr.push(cadr);
                            }
                        });
                        if (!found) {
                            this.selectedClinicAdr.push({
                                adverseDrugReaction: adr
                            });
                        }
                    });
                    this.selectedClinicAdr = [...this.selectedClinicAdr];

                    if (this.entity.extra) {
                        if (this.entity.extra.prep) {
                            this.hivTestResult = this.entity.extra.prep.hivTestResult;
                            this.creatinineClearance = this.entity.extra.prep.creatinineClearance;
                            this.hepatitisB = this.entity.extra.prep.hepatitisB;
                            this.hepatitisC = this.entity.extra.prep.hepatitisC;
                            this.urinalysis = this.entity.extra.prep.urinalysis;
                        }

                        if (this.entity.extra.otz) {
                            if (!!this.entity.extra.otz.dateOfFullDisclosure) {
                                this.dateOfFullDisclosure = moment(this.entity.extra.otz.dateOfFullDisclosure);
                            }
                            this.attendedLastOTZMeeting = !!this.entity.extra.otz.attendedLastOTZMeeting;
                            this.enrolledOnOTZ = !!this.entity.extra.otz.enrolledOnOTZ;
                            if (!!this.entity.extra.otz.dateEnrolledOnOTZ) {
                                this.dateEnrolledOnOTZ = moment(this.entity.extra.otz.dateEnrolledOnOTZ);
                            }

                            if (!!this.entity.extra.otz.dateLastOTZMeeting) {
                                this.dateLastOTZMeeting = moment(this.entity.extra.otz.dateLastOTZMeeting);
                            }
                            this.caregiverPhone = this.entity.extra.otz.caregiverPhone;
                            this.caregiverAddress = this.entity.extra.otz.caregiverAddress;
                            this.modulesCompleted = this.entity.extra.otz.modulesCompleted;
                            this.fullDisclosure = this.entity.extra.otz.fullDisclosure;
                        }
                    }
                });
            } else {
                this.clinicService.adverseDrugReactions().subscribe(res => {
                    this.adverseDrugReactions = res;
                    this.adverseDrugReactions.forEach(adr => {
                        this.selectedClinicAdr.push({
                            adverseDrugReaction: adr
                        });
                    });
                });

                this.selectedClinicAdr = [...this.selectedClinicAdr];
            }
        });
    }

    updateValue(event, cell, row: AdverseDrugReaction) {
        console.log('Edit', event, cell, row);
        this.selectedClinicAdr = [...this.selectedClinicAdr.map(cadr => {
            if (cadr.adverseDrugReaction && cadr.adverseDrugReaction.id === row.id) {
                cadr.severity = event;
            }
            return cadr;
        })];
        console.log('UPDATED!', row, event);
    }


    filterDates(date: Moment): boolean {
        let exists = false;

        this.visitDates.forEach(d => {
            if (date.diff(d, 'days') === 0) {
                exists = true;
            }
        });
        return (this.entity.id && date.diff(this.entity.dateVisit, 'days') === 0) || !exists;
    }

    dateChanged(date: Moment) {
        this.appointmentMax = date.clone().add(6, 'months');
        this.lmpMin = date.clone().subtract(2, 'years');
        this.appointmentMin = date.clone().add(14, 'days');

        this.otzApplicable = !date.clone().subtract(24, 'years').isAfter(this.entity.patient.dateBirth)
            && !date.clone().subtract(10, 'years').isBefore(this.entity.patient.dateBirth);
    }

    entityCompare(e1, e2) {
        return entityCompare(e1, e2);
    }

    previousState() {
        window.history.back();
    }

    save() {
        this.isSaving = true;
        if (!this.entity.extra) {
            this.entity.extra = {};
        }
        this.entity.extra.otz = {};

        this.entity.extra.otz.fullDisclosure = this.fullDisclosure;
        this.entity.extra.otz.dateOfFullDisclosure = this.dateOfFullDisclosure != null && this.dateOfFullDisclosure.isValid() ?
            this.dateOfFullDisclosure.format(DATE_FORMAT) : null;
        this.entity.extra.otz.dateEnrolledOnOTZ = this.dateEnrolledOnOTZ != null && this.dateEnrolledOnOTZ.isValid() ?
            this.dateEnrolledOnOTZ.format(DATE_FORMAT) : null;
        this.entity.extra.otz.attendedLastOTZMeeting = !!this.attendedLastOTZMeeting;
        this.entity.extra.otz.dateLastOTZMeeting = this.dateLastOTZMeeting != null && this.dateLastOTZMeeting.isValid() ?
            this.dateLastOTZMeeting.format(DATE_FORMAT) : null;
        this.entity.extra.otz.enrolledOnOTZ = this.enrolledOnOTZ;
        this.entity.extra.otz.caregiverPhone = this.caregiverPhone;
        this.entity.extra.otz.caregiverAddress = this.caregiverAddress;
        this.entity.extra.otz.modulesCompleted = this.modulesCompleted;

        if (this.prep) {
            this.entity.extra.prep = {};
            this.entity.extra.prep.hivTestResult = this.hivTestResult;
            this.entity.extra.prep.creatinineClearance = this.creatinineClearance;
            this.entity.extra.prep.hepatitisB = this.hepatitisB;
            this.entity.extra.prep.hepatitisC = this.hepatitisC;
            this.entity.extra.prep.urinalysis = this.urinalysis;
        }
        this.entity.adverseDrugReactions = this.selectedClinicAdr.filter(cadr => !!cadr.severity);
        if (this.entity.opportunisticInfections && this.entity.opportunisticInfections.length &&
            !this.entity.opportunisticInfections[1]) {
            this.entity.opportunisticInfections = [];
        }
        // this.entity.opportunisticInfections = this.oiList;
        // this.entity.adheres = this.adhereList;
        this.appLoaderService.open('Saving clinic visit..');
        if (this.entity.id !== undefined) {
            this.subscribeToSaveResponse(this.clinicService.update(this.entity));
        } else {
            this.subscribeToSaveResponse(this.clinicService.create(this.entity));
        }
    }

    regimenLineChange(type: any) {
        this.clinicService.getRegimenByLine(type.id).subscribe(res => this.regimens = res);
    }

    private subscribeToSaveResponse(result: Observable<HttpResponse<any>>) {
        result.subscribe(
            (res: HttpResponse<any>) => this.onSaveSuccess(res.body),
            (res: HttpErrorResponse) => {
                this.onSaveError();
                this.onError(res.message);
            });
    }

    private onSaveSuccess(result: any) {
        this.appLoaderService.close();
        this.isSaving = false;
        this.notification.showInfo('Clinic visit successfully saved');
        this.previousState();
    }

    private onSaveError() {
        this.isSaving = false;
        this.appLoaderService.close();
        this.error = true;
        // this.submitButton.disabled = true;
        this.notification.showError('Error occurred saving clinic visit; try again');
        // this.progressBar.mode = 'determinate';
    }

    protected onError(errorMessage: string) {
        this.appLoaderService.close();
        this.notification.showError(errorMessage);
    }
}
