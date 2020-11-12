import {Inject, Injectable} from '@angular/core';
import {HttpClient, HttpResponse} from '@angular/common/http';
import {createRequestOption, SERVER_API_URL_CONFIG, ServerApiUrlConfig} from '@lamis/web-core';
import {Observable} from 'rxjs';
import {CaseManager} from '../model/case-management.model';

@Injectable({
    providedIn: 'root'
})
export class CaseManagerService {
    public resourceUrl = '';

    constructor(protected http: HttpClient, @Inject(SERVER_API_URL_CONFIG) private serverUrl: ServerApiUrlConfig) {
        this.resourceUrl = serverUrl.SERVER_API_URL + '/api/case-managers';
    }

    create(caseManager: CaseManager): Observable<HttpResponse<CaseManager>> {
        return this.http
            .post<CaseManager>(this.resourceUrl, caseManager, {observe: 'response'});
    }

    update(caseManager: CaseManager): Observable<HttpResponse<CaseManager>> {
        return this.http
            .put<CaseManager>(this.resourceUrl, caseManager, {observe: 'response'});
    }

    find(id: number): Observable<HttpResponse<CaseManager>> {
        return this.http
            .get<CaseManager>(`${this.resourceUrl}/${id}`, {observe: 'response'});
    }

    findByUuid(id: string): Observable<HttpResponse<CaseManager>> {
        return this.http
            .get<CaseManager>(`${this.resourceUrl}/by-uuid/${id}`, {observe: 'response'});
    }

    delete(id: number): Observable<HttpResponse<any>> {
        return this.http.delete<any>(`${this.resourceUrl}/${id}`, {observe: 'response'});
    }

    query(req?: any): Observable<HttpResponse<CaseManager[]>> {
        const options = createRequestOption(req);
        return this.http
            .get<CaseManager[]>(this.resourceUrl, {params: options, observe: 'response'});
    }
}
