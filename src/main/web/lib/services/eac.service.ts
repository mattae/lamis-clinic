import {Inject, Injectable} from '@angular/core';
import {HttpClient, HttpResponse} from '@angular/common/http';
import {DATE_FORMAT, SERVER_API_URL_CONFIG, ServerApiUrlConfig} from '@lamis/web-core';
import {EAC} from '../model/clinic.model';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import * as moment_ from 'moment';
import {Moment} from 'moment';

const moment = moment_;


@Injectable({
    providedIn: 'root'
})
export class EacService {
    public resourceUrl = '';

    constructor(protected http: HttpClient, @Inject(SERVER_API_URL_CONFIG) private serverUrl: ServerApiUrlConfig) {
        this.resourceUrl = serverUrl.SERVER_API_URL + '/api/eacs';
    }

    create(eac: EAC): Observable<HttpResponse<EAC>> {
        const copy = this.convertDateFromClient(eac);
        return this.http
            .post<EAC>(this.resourceUrl, copy, {observe: 'response'})
            .pipe(map((res: HttpResponse<EAC>) => this.convertDateFromServer(res)));
    }

    update(eac: EAC): Observable<HttpResponse<EAC>> {
        const copy = this.convertDateFromClient(eac);
        return this.http
            .put<EAC>(this.resourceUrl, copy, {observe: 'response'})
            .pipe(map((res: HttpResponse<EAC>) => this.convertDateFromServer(res)));
    }

    find(id: number): Observable<HttpResponse<EAC>> {
        return this.http
            .get<EAC>(`${this.resourceUrl}/${id}`, {observe: 'response'})
            .pipe(map((res: HttpResponse<EAC>) => this.convertDateFromServer(res)));
    }

    findByUuid(id: string): Observable<HttpResponse<EAC>> {
        return this.http
            .get<EAC>(`${this.resourceUrl}/by-uuid/${id}`, {observe: 'response'})
            .pipe(map((res: HttpResponse<EAC>) => this.convertDateFromServer(res)));
    }

    delete(id: number): Observable<HttpResponse<any>> {
        return this.http.delete<any>(`${this.resourceUrl}/${id}`, {observe: 'response'});
    }

    getLatestByPatient(uuid: string): Observable<HttpResponse<EAC>> {
        return this.http
            .get<EAC>(`${this.resourceUrl}/patient/${uuid}`, {observe: 'response'})
            .pipe(map((res: HttpResponse<EAC>) => this.convertDateFromServer(res)));
    }

    getLatestViralLoadByPatient(id: number, at: Moment): Observable<HttpResponse<any>> {
        const date = at.format(DATE_FORMAT);
        return this.http
            .get<any>(`${this.resourceUrl}/patient/${id}/viral-load-result/at/${date}`, {observe: 'response'})
            .pipe(map((res: HttpResponse<any>) => {
                if (res.body) {
                    res.body.laboratory.dateReported = res.body.laboratory.dateReported != null ?
                        moment(res.body.laboratory.dateReported) : null;
                }
                return res;
            }));
    }

    protected convertDateFromClient(eac: EAC): EAC {
        const copy: EAC = Object.assign({}, eac, {
            dateEac1: eac.dateEac1 != null && eac.dateEac1.isValid() ? eac.dateEac1.format(DATE_FORMAT) : null,
            dateEac2: eac.dateEac2 != null && eac.dateEac2.isValid() ? eac.dateEac2.format(DATE_FORMAT) : null,
            dateEac3: eac.dateEac3 != null && eac.dateEac3.isValid() ? eac.dateEac3.format(DATE_FORMAT) : null,
            dateSampleCollected: eac.dateSampleCollected != null && eac.dateSampleCollected.isValid() ? eac.dateSampleCollected.format(DATE_FORMAT) : null,
            dateLastViralLoad: eac.dateLastViralLoad != null && eac.dateLastViralLoad.isValid() ? eac.dateLastViralLoad.format(DATE_FORMAT) : null,
        });
        return copy;
    }

    protected convertDateFromServer(res: HttpResponse<EAC>): HttpResponse<EAC> {
        if (res.body) {
            res.body.dateLastViralLoad = res.body.dateLastViralLoad != null ? moment(res.body.dateLastViralLoad) : null;
            res.body.dateEac1 = res.body.dateEac1 != null ? moment(res.body.dateEac1) : null;
            res.body.dateEac2 = res.body.dateEac2 != null ? moment(res.body.dateEac2) : null;
            res.body.dateEac3 = res.body.dateEac3 != null ? moment(res.body.dateEac3) : null;
            res.body.dateSampleCollected = res.body.dateSampleCollected != null ? moment(res.body.dateSampleCollected) : null;
        }
        return res;
    }

}
