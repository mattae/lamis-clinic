import {Component, OnInit} from '@angular/core';
import {ChronicCare, ChronicCareDm, ChronicCareTB, Patient} from '../../model/clinic.model';
import {ClinicService} from '../../services/clinic.service';
import {NotificationService} from '@alfresco/adf-core';
import {ActivatedRoute} from '@angular/router';
import {ChronicCareService} from '../../services/chronic.care.service';
import {Observable} from 'rxjs';
import {HttpErrorResponse, HttpResponse} from '@angular/common/http';
import * as moment_ from 'moment';
import {Moment} from 'moment';
import {AppLoaderService} from '@lamis/web-core';

const moment = moment_;

@Component({
    selector: 'chronic-care-edit',
    templateUrl: './chronic.care.edit.component.html'
})
export class ChronicCareEditComponent implements OnInit {
    entity: ChronicCare;
    patient: Patient;
    today = moment();
    tbs: ChronicCareTB[] = [];
    dms: ChronicCareDm[] = [];
    visitDates: Moment[] = [];
    isSaving = false;
    bmi = '';
    bmiCalculated = '';

    constructor(private clinicService: ClinicService,
                private chronicCareService: ChronicCareService,
                protected notification: NotificationService,
                protected activatedRoute: ActivatedRoute,
                private appLoaderService: AppLoaderService) {
    }

    createEntity(): ChronicCare {
        return <ChronicCare>{};
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
                this.chronicCareService.getVisitDatesByPatient(this.entity.patient.id).subscribe((res1) => {
                    this.visitDates = res1;
                });
            });

            this.calculateBmi();
        });

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

    previousState() {
        window.history.back();
    }

    calculateBmi() {
        if (this.entity.bodyWeight && this.entity.height) {
            const bmi = this.entity.bodyWeight / Math.pow(this.entity.height, 2);
            if (bmi < 18.5) {
                this.bmi = '<18.5 (Underweight)';
            } else if (bmi < 24.9) {
                this.bmi = '18.5 - 24.9 (Healthy)';
            } else if (bmi < 29.9) {
                this.bmi = '25.0 - 29.9 (Overweight)';
            } else if (bmi < 40) {
                this.bmi = '30 - 40 (Obesity)';
            } else {
                this.bmi = '>40 (Morbid Obesity)';
            }
            this.bmiCalculated = bmi.toFixed(1);
        } else {
            this.bmi = '';
        }
    }

    save() {
        // this.submitButton.disabled = true;
        // this.progressBar.mode = 'indeterminate';
        this.isSaving = true;
        this.appLoaderService.open('Saving chronic care visit..');
        if (this.entity.id !== undefined) {
            this.subscribeToSaveResponse(this.chronicCareService.update(this.entity));
        } else {
            this.subscribeToSaveResponse(this.chronicCareService.create(this.entity));
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
        this.notification.showInfo('Chronic Care visit successfully saved');
        this.previousState();
    }

    private onSaveError() {
        this.isSaving = false;
        this.appLoaderService.close();
        // this.submitButton.disabled = true;
        this.notification.showError('Error occurred saving chronic care visit; try again');
        // this.progressBar.mode = 'determinate';
    }

    protected onError(errorMessage: string) {
        this.appLoaderService.close();
        this.notification.showError(errorMessage);
    }

}
