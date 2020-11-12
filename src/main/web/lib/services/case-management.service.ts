import {Inject, Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {SERVER_API_URL_CONFIG, ServerApiUrlConfig} from '@lamis/web-core';
import {Facility} from '../model/facility.model';
import {CaseManager, CaseManagerStats, Patient} from '../model/case-management.model';

@Injectable({
    providedIn: 'root'
})
export class CaseManagementService {
    public resourceUrl = '';

    constructor(protected http: HttpClient, @Inject(SERVER_API_URL_CONFIG) private serverUrl: ServerApiUrlConfig) {
        this.resourceUrl = serverUrl.SERVER_API_URL + '/api/case-management';
    }

    initClients(facilityId: number) {
        return this.http.get(`${this.resourceUrl}/init-clients/${facilityId}`);
    }

    getClientList(req: any) {
        return this.http.post<Patient[]>(`${this.resourceUrl}/client-list`, req, {observe: 'response'});
    }

    getCaseManagerStats(caseManagerId: number, facilityId: number) {
        return this.http.get<CaseManagerStats>(`${this.resourceUrl}/facility/${facilityId}/case-manager/${caseManagerId}/stats`);
    }

    getActiveFacility() {
        return this.http.get<Facility>('/api/facilities/active');
    }

    getCaseManagers(facilityId: number) {
        return this.http.get<CaseManager[]>(`${this.resourceUrl}/facility/${facilityId}/case-managers`);
    }

    assignToCaseManager(caseManagerId: number, ids: number[]) {
        let params = new HttpParams();
        ids.forEach(id => params = params.append('ids', id.toString()));
        return this.http.get(`${this.resourceUrl}/case-manager/${caseManagerId}/assign-clients`, {
            params,
            observe: 'response'
        });
    }

    deAssignClients(ids: number[]) {
        let params = new HttpParams();
        ids.forEach(id => params = params.append('ids', id.toString()));
        return this.http.get(`${this.resourceUrl}/de-assign-clients`, {
            params,
            observe: 'response'
        });
    }

    getStates() {
        return this.http.get<any[]>('/api/states');
    }

    getLgasByState(id) {
        return this.http.get<any[]>(`/api/provinces/state/${id}`);
    }
}
