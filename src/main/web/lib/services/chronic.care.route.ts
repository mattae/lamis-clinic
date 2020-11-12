import {Injectable} from '@angular/core';
import {HttpResponse} from '@angular/common/http';
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot, Routes} from '@angular/router';
import {Observable, of} from 'rxjs';
import {filter, map} from 'rxjs/operators';
import {ChronicCare} from '../model/clinic.model';
import {ChronicCareService} from './chronic.care.service';
import {ChronicCareEditComponent} from '../components/chronic-care/chronic.care.edit.component';
import {ChronicCareDetailComponent} from '../components/chronic-care/chronic.care.detail.component';

@Injectable()
export class ChronicCareResolve implements Resolve<ChronicCare> {
    constructor(private service: ChronicCareService) {
    }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<ChronicCare> {
        const id = route.params['id'] ? route.params['id'] : null;
        if (id) {
            return this.service.findByUuid(id).pipe(
                filter((response: HttpResponse<ChronicCare>) => response.ok),
                map((patient: HttpResponse<ChronicCare>) => patient.body)
            );
        }
        return of(<ChronicCare>{});
    }
}

export const ROUTES: Routes = [
    {
        path: '',
        data: {
            title: 'Chronic Care Visit',
            breadcrumb: 'CHRONIC CARE VISIT'
        },
        children: [
            {
                path: ':id/patient/:patientId/view',
                component: ChronicCareDetailComponent,
                resolve: {
                    entity: ChronicCareResolve
                },
                data: {
                    authorities: ['ROLE_USER'],
                    title: 'Chronic Care Visit',
                    breadcrumb: 'CHRONIC CARE VISIT'
                },
                //canActivate: [UserRouteAccessService]
            },
            {
                path: 'patient/:patientId/new',
                component: ChronicCareEditComponent,
                data: {
                    authorities: ['ROLE_DEC'],
                    title: 'Chronic Care Visit',
                    breadcrumb: 'ADD CHRONIC CARE VISIT'
                },
                //canActivate: [UserRouteAccessService]
            },
            {
                path: ':id/patient/:patientId/edit',
                component: ChronicCareEditComponent,
                resolve: {
                    entity: ChronicCareResolve
                },
                data: {
                    authorities: ['ROLE_DEC'],
                    title: 'Chronic Care Visit Edit',
                    breadcrumb: 'CHRONIC CARE VISIT EDIT'
                },
                //canActivate: [UserRouteAccessService]
            }
        ]
    }
];

