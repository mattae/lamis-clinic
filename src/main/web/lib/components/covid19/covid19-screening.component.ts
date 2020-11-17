import {Component, OnInit} from '@angular/core';
import {COVIDCancerScreening, Observation, Patient} from '../../model/clinic.model';
import * as moment_ from 'moment';
import {Observable} from 'rxjs';
import {HttpErrorResponse, HttpResponse} from '@angular/common/http';
import {ClinicService} from '../../services/clinic.service';
import {NotificationService} from '@alfresco/adf-core';
import {ActivatedRoute} from '@angular/router';
import {AppLoaderService, DATE_FORMAT} from '@lamis/web-core';
import {Covid19ScreeningService} from '../../services/covid19-screening.service';

const moment = moment_;

@Component({
    selector: 'covid19-screening',
    templateUrl: './covi19-screening.component.html'
})
export class Covid19ScreeningComponent implements OnInit {
    entity: COVIDCancerScreening = {};
    patient: Patient;
    observation: Observation = {};
    today = moment();
    isSaving = false;

    constructor(private clinicService: ClinicService,
                private screeningService: Covid19ScreeningService,
                protected notification: NotificationService,
                protected activatedRoute: ActivatedRoute,
                private appLoaderService: AppLoaderService) {
    }

    ngOnInit(): void {
        this.activatedRoute.data.subscribe(({entity}) => {
            this.observation = !!entity && entity.body ? entity.body : entity;
            if (!!this.observation) {
                this.entity = this.observation.data.covid19Screening;
                this.entity.dateOutcome = this.entity.dateOutcome != null ? moment(this.entity.dateOutcome) : null;
                this.entity.dateScreened = this.entity.dateScreened != null ? moment(this.entity.dateScreened) : null;
                this.entity.dateConfirmed = this.entity.dateConfirmed != null ? moment(this.entity.dateConfirmed) : null;
            } else {
                this.observation = {};
            }

            if (this.entity === undefined) {
                this.entity = {};
            }
            console.log('Entity: {}', this.entity);
            const patientId = this.activatedRoute.snapshot.paramMap.get('patientId');
            this.clinicService.getPatient(patientId).subscribe((res) => {
                this.patient = res;
            });
        });
    }

    previousState() {
        window.history.back();
    }


    save() {
        // this.submitButton.disabled = true;
        // this.progressBar.mode = 'indeterminate';
        this.isSaving = true;
        this.appLoaderService.open('Saving COVID19 screening..');
        if (!this.entity.confirmed) {
            this.entity.outcome = null;
            this.entity.dateOutcome = null;
        }

        const data = {
            id: this.observation && this.observation.id || null,
            patient: this.patient,
            date: this.entity.dateScreened.format(DATE_FORMAT),
            facility: this.patient.facility,
            type: 'COVID19_SCREENING',
            data: {
                covid19Screening: Object.assign({}, this.entity, {
                    dateScreened: this.entity.dateScreened != null && this.entity.dateScreened.isValid() ?
                        this.entity.dateScreened.format(DATE_FORMAT) : null,
                    dateConfirmed: this.entity.dateConfirmed != null && this.entity.dateConfirmed.isValid() ?
                        this.entity.dateConfirmed.format(DATE_FORMAT) : null,
                    dateOutcome: this.entity.dateOutcome != null && this.entity.dateOutcome.isValid() ?
                        this.entity.dateOutcome.format(DATE_FORMAT) : null,
                    confirmed: !!this.entity.confirmed
                })
            }
        };
        if (!!this.observation.id) {
            this.subscribeToSaveResponse(this.screeningService.update(data));
        } else {
            this.subscribeToSaveResponse(this.screeningService.save(data));
        }
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
        this.notification.showInfo('COVID19 screening successfully saved');
        this.previousState();
    }

    private onSaveError() {
        this.isSaving = false;
        this.appLoaderService.close();
        // this.submitButton.disabled = true;
        this.notification.showError('Error occurred saving COVID19 screening; try again');
        // this.progressBar.mode = 'determinate';
    }

    protected onError(errorMessage: string) {
        this.appLoaderService.close();
        this.notification.showError(errorMessage);
    }

}
