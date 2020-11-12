import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot, Routes} from '@angular/router';
import {EAC} from '../model/clinic.model';
import {Observable, of} from 'rxjs';
import {filter, map} from 'rxjs/operators';
import {HttpResponse} from '@angular/common/http';
import {EacService} from './eac.service';
import {EacEditComponent} from '../components/eac/eac.edit.component';
import {EacDetailsComponent} from '../components/eac/eac.details.component';

@Injectable()
export class EacResolve implements Resolve<EAC> {
    constructor(private service: EacService) {
    }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<EAC> {
        const id = route.params['id'] ? route.params['id'] : null;
        if (id) {
            return this.service.findByUuid(id).pipe(
                filter((response: HttpResponse<EAC>) => response.ok),
                map((patient: HttpResponse<EAC>) => patient.body)
            );
        }
        return of(<EAC>{});
    }
}

export const ROUTES: Routes = [
    {
        path: '',
        data: {
            title: 'EAC Session',
            breadcrumb: 'EAC SESSION'
        },
        children: [
            {
                path: ':id/patient/:patientId/view',
                component: EacDetailsComponent,
                resolve: {
                    entity: EacResolve
                },
                data: {
                    authorities: ['ROLE_USER'],
                    title: 'EAC Session',
                    breadcrumb: 'EAC SESSION'
                },
                //canActivate: [UserRouteAccessService]
            },
            {
                path: 'patient/:patientId/new',
                component: EacEditComponent,
                data: {
                    authorities: ['ROLE_DEC'],
                    title: 'EAC Session',
                    breadcrumb: 'ADD EAC SESSION',
                    commence: true
                },
                //canActivate: [UserRouteAccessService]
            },
            {
                path: ':id/patient/:patientId/edit',
                component: EacEditComponent,
                resolve: {
                    entity: EacResolve
                },
                data: {
                    authorities: ['ROLE_DEC'],
                    title: 'EAC Session Edit',
                    breadcrumb: 'EAC SESSION EDIT'
                },
                //canActivate: [UserRouteAccessService]
            }
        ]
    }
];
