import {Inject, Injectable} from '@angular/core';

import * as moment_ from 'moment';
import {SERVER_API_URL_CONFIG, ServerApiUrlConfig} from '@lamis/web-core';
import {HttpClient, HttpResponse} from '@angular/common/http';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {Observation} from '../model/clinic.model';

const moment = moment_;


@Injectable({
    providedIn: 'root'
})
export class CervicalCancerScreeningService {
    public resourceUrl = '';
    public observationResourceUrl = '';

    constructor(protected http: HttpClient, @Inject(SERVER_API_URL_CONFIG) private serverUrl: ServerApiUrlConfig) {
        this.resourceUrl = serverUrl.SERVER_API_URL + '/api/cervical-cancer-screenings';
        this.observationResourceUrl = serverUrl.SERVER_API_URL + '/api/observations';
    }

    find(id: string) {
        return this.http.get<Observation>(`${this.observationResourceUrl}/${id}`, {observe: 'response'})
            .pipe(map(res => {
                console.log('Response1', res);
                res.body.date = res.body.date != null ? moment(res.body.date) : null;
                res.body.data.dateTreated = res.body.data.dateTreated != null ? moment(res.body.data.dateTreated) : null;
                res.body.data.dateScreened = res.body.data.dateScreened != null ? moment(res.body.data.dateScreened) : null;
                return res;
            }));
    }

    findByUuid(id: string) {
        return this.find(id);
    }

    delete(id: string) {
        return this.http.delete(`${this.observationResourceUrl}/${id}`, {observe: 'response'});
    }

    save(data: any): Observable<HttpResponse<Observation>> {
        return this.http.post<Observation>(`${this.observationResourceUrl}`, data, {observe: 'response'})
            .pipe(map(res => {
                res.body.data.dateTreated = res.body.data.dateTreated != null ? moment(res.body.data.dateTreated) : null;
                res.body.data.dateScreened = res.body.data.dateScreened != null ? moment(res.body.data.dateScreened) : null;
                return res;
            }));
    }

    update(data: any): Observable<HttpResponse<Observation>> {
        return this.http.put<Observation>(`${this.observationResourceUrl}`, data, {observe: 'response'})
            .pipe(map(res => {
                res.body.data.dateTreated = res.body.data.dateTreated != null ? moment(res.body.data.dateTreated) : null;
                res.body.data.dateScreened = res.body.data.dateScreened != null ? moment(res.body.data.dateScreened) : null;
                return res;
            }));
    }

    getScreeningByPatient(id: number) {
        return this.http.get<any>(`${this.resourceUrl}/patient/${id}`, {observe: 'response'})
            .pipe(map(res => {
                res.body.data = res.body.data.cervicalCancerScreening;
                res.body.date = res.body.date != null ? moment(res.body.date) : null;
                res.body.data.dateTreated = res.body.data.dateTreated != null ? moment(res.body.data.dateTreated) : null;
                res.body.data.dateScreened = res.body.data.dateScreened != null ? moment(res.body.data.dateScreened) : null;
                return res;
            }));
    }
}
