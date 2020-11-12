import {Component, OnInit} from '@angular/core';
import * as moment_ from 'moment';
import {Moment} from 'moment';
import {Observable} from 'rxjs';
import {HttpErrorResponse, HttpResponse} from '@angular/common/http';
import {ClinicService} from '../../services/clinic.service';
import {NotificationService} from '@alfresco/adf-core';
import {ActivatedRoute} from '@angular/router';
import {AppLoaderService} from '@lamis/web-core';
import {EAC, Patient} from '../../model/clinic.model';
import {EacService} from '../../services/eac.service';
import {catchError, tap} from 'rxjs/operators';

const moment = moment_;


@Component({
    selector: 'eac-edit',
    templateUrl: './eac.edit.component.html'
})
export class EacEditComponent implements OnInit {
    entity: EAC;
    patient: Patient;
    today = moment();
    dateRegistration: Moment;
    eac1Min: Moment;
    eac2Min: Moment;
    eac3Min: Moment;
    repeatVLMin: Moment;
    repeatVLMax: Moment;
    isSaving: boolean = false;

    constructor(private clinicService: ClinicService,
                private eacService: EacService,
                protected notification: NotificationService,
                protected activatedRoute: ActivatedRoute,
                private appLoaderService: AppLoaderService) {
    }

    createEntity(): EAC {
        return <EAC>{};
    }

    ngOnInit(): void {
        this.activatedRoute.data.subscribe(({entity}) => {
            this.entity = !!entity && entity.body ? entity.body : entity;

            if (this.entity === undefined) {
                this.entity = this.createEntity();
            }
            const patientId = this.activatedRoute.snapshot.paramMap.get('patientId');
            this.clinicService.getPatient(patientId).subscribe((res) => {
                this.entity.patient = res;
                this.entity.facility = res.facility;
                this.dateRegistration = res.dateRegistration;
                this.updateMinDates(res.id, moment());
                if (!this.entity.id) {
                    this.eacService.getLatestByPatient(res.uuid).subscribe(r => {
                        this.entity = r.ok ? r.body : this.createEntity();
                        this.repeatVLMin = this.entity.dateEac3 ? this.entity.dateEac3.clone().add(1, 'day') :
                            this.entity.dateLastViralLoad;
                        this.eac2Min = this.entity.dateEac1 ? this.entity.dateEac1.clone().add(2, 'week') :
                            this.entity.dateLastViralLoad;
                        this.eac3Min = this.entity.dateEac2 ? this.entity.dateEac2.clone().add(2, 'week') :
                            this.entity.dateLastViralLoad;
                    });
                }
            });

        });
    }

    updateMinDates(id: number, date: Moment) {
        this.eacService.getLatestViralLoadByPatient(id, date).pipe(tap((r: any) => {
                this.entity.dateLastViralLoad = moment(r.laboratory.dateResultReceived);
                this.entity.lastViralLoad = r.result;
                this.eac1Min = this.entity.dateLastViralLoad.clone().add(1, 'day');
                this.eac2Min = this.entity.dateEac1 ? this.entity.dateEac1.clone().add(2, 'week') :
                    this.entity.dateLastViralLoad;
                this.eac3Min = this.entity.dateEac2 ? this.entity.dateEac2.clone().add(2, 'week') :
                    this.entity.dateLastViralLoad;
                this.repeatVLMin = this.entity.dateEac3 ? this.entity.dateEac3.clone().add(1, 'day') :
                    this.entity.dateLastViralLoad;
            }),
            catchError((err: any) => {
                this.entity.dateLastViralLoad = null;
                this.entity.lastViralLoad = null;
                this.eac1Min = this.entity.patient.dateRegistration.clone().add(1, 'day');
                this.eac2Min = this.entity.dateEac1 ? this.entity.dateEac1.clone().add(2, 'week') :
                    this.entity.dateLastViralLoad;
                this.eac3Min = this.entity.dateEac2 ? this.entity.dateEac2.clone().add(2, 'week') :
                    this.entity.dateLastViralLoad;
                this.repeatVLMin = this.entity.dateEac3 ? this.entity.dateEac3.clone().add(1, 'day') :
                    this.entity.dateLastViralLoad;
                return null;
            }));
    }

    dateEac1Changed(date: Moment) {
        this.eac2Min = date.clone().add(2, 'weeks');
        this.updateMinDates(this.entity.patient.id, date);
    }

    dateEac2Changed(date: Moment) {
        this.eac3Min = date.clone().add(2, 'weeks');
    }

    dateEac3Changed(date: Moment) {
        this.repeatVLMin = date.clone().add(1, 'days');
        this.repeatVLMax = date.clone().add(6, 'months');
    }

    save() {
        //this.submitButton.disabled = true;
        //this.progressBar.mode = 'indeterminate';
        this.isSaving = true;
        this.appLoaderService.open('Saving EAC session..');
        if (this.entity.id !== undefined) {
            this.subscribeToSaveResponse(this.eacService.update(this.entity));
        } else {
            this.subscribeToSaveResponse(this.eacService.create(this.entity));
        }
    }

    previousState() {
        window.history.back();
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
        this.notification.openSnackMessage('EAC session successfully saved');
        this.previousState();
    }

    private onSaveError() {
        this.isSaving = false;
        this.appLoaderService.close();
        //this.submitButton.disabled = true;
        this.notification.showError('Error occurred saving EAC session; try again');
        //this.progressBar.mode = 'determinate';
    }

    protected onError(errorMessage: string) {
        this.appLoaderService.close();
        this.notification.showError(errorMessage);
    }

}
