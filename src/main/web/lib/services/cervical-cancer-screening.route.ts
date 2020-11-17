import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot, Routes} from '@angular/router';
import {Injectable} from '@angular/core';
import {Observation} from '../model/clinic.model';
import {Observable, of} from 'rxjs';
import {filter, map} from 'rxjs/operators';
import {HttpResponse} from '@angular/common/http';
import {CervicalCancerScreeningService} from './cervical-cancer-screening.service';
import {CervicalCancerScreeningDetailComponent} from '../components/cervical-cancer-screening/cervical-cancer-screening-detail.component';
import {CervicalCancerScreeningComponent} from '../components/cervical-cancer-screening/cervical-cancer-screening.component';

@Injectable({
    providedIn: 'root'
})
export class ObservationResolve implements Resolve<Observation> {
    constructor(private service: CervicalCancerScreeningService) {
    }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Observation> {
        const id = route.params['id'] ? route.params['id'] : null;
        if (id) {
            return this.service.find(id).pipe(
                filter((response: HttpResponse<Observation>) => response.ok),
                map((patient: HttpResponse<Observation>) => patient.body)
            );
        }
        return of(<Observation>{});
    }
}

export const ROUTES: Routes = [
    {
        path: '',
        data: {
            title: 'Cervical Cancer Screening',
            breadcrumb: 'CERVICAL CANCER SCREENING'
        },
        children: [
            {
                path: ':id/patient/:patientId/view',
                component: CervicalCancerScreeningDetailComponent,
                resolve: {
                    entity: ObservationResolve
                },
                data: {
                    authorities: ['ROLE_USER'],
                    title: 'Cervical Cancer Screening',
                    breadcrumb: 'CERVICAL CANCER SCREENING'
                },
                // canActivate: [UserRouteAccessService]
            },
            {
                path: 'patient/:patientId/new',
                component: CervicalCancerScreeningComponent,
                data: {
                    authorities: ['ROLE_DEC'],
                    title: 'Cervical Cancer Screening',
                    breadcrumb: 'ADD CERVICAL CANCER SCREENING'
                },
                // canActivate: [UserRouteAccessService]
            },
            {
                path: ':id/patient/:patientId/edit',
                component: CervicalCancerScreeningComponent,
                resolve: {
                    entity: ObservationResolve
                },
                data: {
                    authorities: ['ROLE_DEC'],
                    title: 'Cervical Cancer Screening',
                    breadcrumb: 'CERVICAL CANCER SCREENING EDIT'
                },
                // canActivate: [UserRouteAccessService]
            }
        ]
    }
];
