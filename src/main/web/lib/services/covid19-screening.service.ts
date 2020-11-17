import {Inject, Injectable} from '@angular/core';
import {HttpClient, HttpResponse} from '@angular/common/http';
import {SERVER_API_URL_CONFIG, ServerApiUrlConfig} from '@lamis/web-core';
import {Observation} from '../model/clinic.model';
import {map} from 'rxjs/operators';
import {Observable} from 'rxjs';
import * as moment_ from 'moment';

const moment = moment_;

@Injectable({
    providedIn: 'root'
})
export class Covid19ScreeningService {
    public resourceUrl = '';
    public observationResourceUrl = '';

    constructor(protected http: HttpClient, @Inject(SERVER_API_URL_CONFIG) private serverUrl: ServerApiUrlConfig) {
        this.resourceUrl = serverUrl.SERVER_API_URL + '/api/covid19-screenings';
        this.observationResourceUrl = serverUrl.SERVER_API_URL + '/api/observations';
    }

    find(id: string) {
        return this.http.get<Observation>(`${this.observationResourceUrl}/${id}`, {observe: 'response'})
            .pipe(map(res => {
                res.body.date = res.body.date != null ? moment(res.body.date) : null;
                res.body.data.dateOutcome = res.body.data.dateOutcome != null ? moment(res.body.data.dateOutcome) : null;
                res.body.data.dateConfirmed = res.body.data.dateConfirmed != null ? moment(res.body.data.dateConfirmed) : null;
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
                res.body.data.dateConfirmed = res.body.data.dateConfirmed != null ? moment(res.body.data.dateConfirmed) : null;
                res.body.data.dateOutcome = res.body.data.dateOutcome != null ? moment(res.body.data.dateOutcome) : null;
                res.body.data.dateScreened = res.body.data.dateScreened != null ? moment(res.body.data.dateScreened) : null;
                return res;
            }));
    }

    update(data: any): Observable<HttpResponse<Observation>> {
        return this.http.put<Observation>(`${this.observationResourceUrl}`, data, {observe: 'response'})
            .pipe(map(res => {
                res.body.data.dateConfirmed = res.body.data.dateConfirmed != null ? moment(res.body.data.dateConfirmed) : null;
                res.body.data.dateOutcome = res.body.data.dateOutcome != null ? moment(res.body.data.dateOutcome) : null;
                res.body.data.dateScreened = res.body.data.dateScreened != null ? moment(res.body.data.dateScreened) : null;
                return res;
            }));
    }
}
