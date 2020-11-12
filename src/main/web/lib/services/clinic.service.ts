import {Inject, Injectable} from '@angular/core';
import {HttpClient, HttpResponse} from '@angular/common/http';
import {Observable} from 'rxjs';
import {DATE_FORMAT, SERVER_API_URL_CONFIG, ServerApiUrlConfig} from '@lamis/web-core';
import {map} from 'rxjs/operators';
import {
    Clinic,
    ClinicAdhere,
    ClinicAdverseDrugReaction,
    ClinicOpportunisticInfection,
    ClinicVm,
    Patient
} from '../model/clinic.model';

import * as moment_ from 'moment';
import {Moment} from 'moment';

const moment = moment_;

type EntityResponseType = HttpResponse<Clinic>;
type EntityArrayResponseType = HttpResponse<Clinic[]>;

@Injectable({providedIn: 'root'})
export class ClinicService {
    public resourceUrl = '';

    constructor(protected http: HttpClient, @Inject(SERVER_API_URL_CONFIG) private serverUrl: ServerApiUrlConfig) {
        this.resourceUrl = serverUrl.SERVER_API_URL + '/api/clinics';
    }

    create(clinic: Clinic): Observable<EntityResponseType> {
        clinic = this.convertDateFromClient(clinic);
        return this.http
            .post<Clinic>(this.resourceUrl, clinic, {observe: 'response'})
            .pipe(map((res: EntityResponseType) => this.convertDateFromServer(res)));
    }

    update(clinic: Clinic): Observable<EntityResponseType> {
        clinic = this.convertDateFromClient(clinic);
        return this.http
            .put<Clinic>(this.resourceUrl, clinic, {observe: 'response'})
            .pipe(map((res: EntityResponseType) => this.convertDateFromServer(res)));
    }

    find(id: number): Observable<EntityResponseType> {
        return this.http
            .get<Clinic>(`${this.resourceUrl}/${id}`, {observe: 'response'})
            .pipe(map((res: EntityResponseType) => this.convertDateFromServer(res)));
    }

    findByUuid(id: string): Observable<EntityResponseType> {
        return this.http
            .get<Clinic>(`${this.resourceUrl}/by-uuid/${id}`, {observe: 'response'})
            .pipe(map((res: EntityResponseType) => this.convertDateFromServer(res)));
    }

    delete(id: number): Observable<HttpResponse<any>> {
        return this.http.delete<any>(`${this.resourceUrl}/${id}`, {observe: 'response'});
    }

    getVisitDatesByPatient(patientId: number) {
        return this.http.get<Moment[]>(`${this.resourceUrl}/patient/${patientId}/visit-dates`)
            .pipe(map((res) => {
                    res.forEach(d => moment(d));
                    return res;
                })
            );
    }

    getPatient(id: any) {
        return this.http.get<Patient>(`/api/patients/by-uuid/${id}`, {observe: 'body'})
            .pipe(map((res) => {
                if (res) {
                    res.dateRegistration = res.dateRegistration != null ? moment(res.dateRegistration) : null;
                    res.dateBirth = res.dateBirth != null ? moment(res.dateBirth) : null;
                }
                return res;
            }));
    }

    getRegimenLines() {
        return this.http.get<any[]>(`${this.resourceUrl}/regimen-types`);
    }

    getRegimenByLine(id) {
        return this.http.get<any[]>(`${this.resourceUrl}/regimens/regimen-type/${id}`);
    }

    adverseDrugReactions() {
        return this.http.get<any[]>(`${this.resourceUrl}/adverse-drug-reactions`);
    }

    opportunisticInfections() {
        return this.http.get<any[]>(`${this.resourceUrl}/opportunistic-infections`);
    }

    adheres() {
        return this.http.get<any[]>(`${this.resourceUrl}/adheres`);
    }

    regimes(regimenType: number) {
        return this.http.get(`${this.resourceUrl}/regimens/${regimenType}`);
    }

    latestVisit(patientId: number) {
        return this.http.get<Clinic>(`${this.resourceUrl}/patient/${patientId}/latest`);
    }

    enrolledOnOTZ(id: number) {
        return this.http.get<boolean>(`${this.resourceUrl}/patient/${id}/enrolled-on-otz`);
    }

    protected convertDateFromClient(clinic: Clinic): Clinic {
        const copy: Clinic = Object.assign({}, clinic, {
            dateVisit: clinic.dateVisit != null && clinic.dateVisit.isValid() ? clinic.dateVisit.format(DATE_FORMAT) : null,
            lmp: clinic.lmp != null && clinic.lmp.isValid() ? clinic.lmp.format(DATE_FORMAT) : null,
            nextAppointment: clinic.nextAppointment != null && clinic.nextAppointment.isValid() ?
                clinic.nextAppointment.format(DATE_FORMAT) : null,
            pregnant: clinic.pregnancyStatus != null && clinic.pregnancyStatus === 2,
            breastfeeding: clinic.pregnancyStatus != null && clinic.pregnancyStatus === 3,
            bp: clinic.bp1 > 0 && clinic.bp2 > 0 ? clinic.bp1 + '/' + clinic.bp2 : null
        });
        return copy;
    }

    protected convertDateFromServer(res: EntityResponseType): EntityResponseType {
        if (res.body) {
            res.body.nextAppointment = res.body.nextAppointment != null ? moment(res.body.nextAppointment) : null;
            res.body.dateVisit = res.body.dateVisit != null ? moment(res.body.dateVisit) : null;
            res.body.lmp = res.body.lmp != null ? moment(res.body.lmp) : null;
            res.body.pregnancyStatus = res.body.pregnant ? 2 : res.body.breastfeeding ? 3 : 1;
            if (res.body.bp) {
                const parts = res.body.bp.split('/');
                res.body.bp1 = parseInt(parts[0], 10);
                res.body.bp2 = parts.length === 2 ? parseInt(parts[1], 10) : null;
            }
        }
        return res;
    }

    protected convertDateArrayFromServer(res: EntityArrayResponseType): EntityArrayResponseType {
        if (res.body) {
            res.body.forEach((clinic: Clinic) => {
                clinic.dateVisit = clinic.dateVisit != null ? moment(clinic.dateVisit) : null;
                clinic.lmp = clinic.lmp != null ? moment(clinic.lmp) : null;
                clinic.nextAppointment = clinic.nextAppointment != null ? moment(clinic.nextAppointment) : null;
                clinic.pregnancyStatus = clinic.pregnant ? 2 : clinic.breastfeeding ? 3 : 1;
            });
        }
        return res;
    }
}
