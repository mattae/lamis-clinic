import {Injectable} from '@angular/core';
import {HttpResponse} from '@angular/common/http';
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot, Routes} from '@angular/router';
import {Observable, of} from 'rxjs';
import {filter, map} from 'rxjs/operators';
import {ClinicService} from './clinic.service';
import {Clinic} from '../model/clinic.model';
import {ClinicDetailsComponent} from '../components/clinic/clinic-details.component';
import {ClinicEditComponent} from '../components/clinic/clinic-edit.component';

@Injectable()
export class ClinicResolve implements Resolve<Clinic> {
    constructor(private service: ClinicService) {
    }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Clinic> {
        const id = route.params['id'] ? route.params['id'] : null;
        if (id) {
            return this.service.findByUuid(id).pipe(
                filter((response: HttpResponse<Clinic>) => response.ok),
                map((patient: HttpResponse<Clinic>) => patient.body)
            );
        }
        return of(<Clinic>{});
    }
}

export const ROUTES: Routes = [
    {
        path: '',
        data: {
            title: 'Clinic Visit',
            breadcrumb: 'CLINIC VISIT'
        },
        children: [
            {
                path: ':id/patient/:patientId/view',
                component: ClinicDetailsComponent,
                resolve: {
                    entity: ClinicResolve
                },
                data: {
                    authorities: ['ROLE_USER'],
                    title: 'Clinic Visit',
                    breadcrumb: 'CLINIC VISIT'
                },
                // canActivate: [UserRouteAccessService]
            },
            {
                path: 'patient/:patientId/new',
                component: ClinicEditComponent,
                data: {
                    authorities: ['ROLE_DEC'],
                    title: 'Clinic Visit',
                    breadcrumb: 'ADD CLINIC VISIT'
                },
                // canActivate: [UserRouteAccessService]
            },
            {
                path: 'art-commencement/patient/:patientId/new',
                component: ClinicEditComponent,
                data: {
                    authorities: ['ROLE_DEC'],
                    title: 'ART Commencement /PrEP Initiation',
                    breadcrumb: 'ADD ART COMMENCEMENT /PREP INITIATION',
                    commence: true
                },
                // canActivate: [UserRouteAccessService]
            },
            {
                path: ':id/patient/:patientId/edit',
                component: ClinicEditComponent,
                resolve: {
                    entity: ClinicResolve
                },
                data: {
                    authorities: ['ROLE_DEC'],
                    title: 'Clinic Visit Edit',
                    breadcrumb: 'CLINIC VISIT EDIT'
                },
                // canActivate: [UserRouteAccessService]
            }
        ]
    }
];

