import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot, Routes} from '@angular/router';
import {Observable, of} from 'rxjs';
import {filter, map} from 'rxjs/operators';
import {HttpResponse} from '@angular/common/http';
import {CaseManagerDetailsComponent} from '../components/case-management/case-manager.details.component';
import {CaseManager} from '../model/case-management.model';
import {CaseManagerService} from './case-manager.service';
import {CaseManagerEditComponent} from '../components/case-management/case-manager.edit.component';
import {CaseManagerListComponent} from '../components/case-management/case-manager.list.component';

@Injectable()
export class CaseManagerResolve implements Resolve<CaseManager> {
    constructor(private service: CaseManagerService) {
    }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<CaseManager> {
        const id = route.params['id'] ? route.params['id'] : null;
        if (id) {
            return this.service.findByUuid(id).pipe(
                filter((response: HttpResponse<CaseManager>) => response.ok),
                map((patient: HttpResponse<CaseManager>) => patient.body)
            );
        }
        return of(<CaseManager>{});
    }
}

export const ROUTES: Routes = [
    {
        path: '',
        data: {
            title: 'Case Manager',
            breadcrumb: 'CASE MANAGERS'
        },
        children: [
            {
                path: '',
                component: CaseManagerListComponent,
                data: {
                    authorities: ['ROLE_USER'],
                    title: 'Case Managers',
                    breadcrumb: 'CASE MANAGERS'
                },
                //canActivate: [UserRouteAccessService]
            },
            {
                path: ':id/view',
                component: CaseManagerDetailsComponent,
                resolve: {
                    entity: CaseManagerResolve
                },
                data: {
                    authorities: ['ROLE_USER'],
                    title: 'Case Manager',
                    breadcrumb: 'CASE MANAGER'
                },
                //canActivate: [UserRouteAccessService]
            },
            {
                path: 'new',
                component: CaseManagerEditComponent,
                data: {
                    authorities: ['ROLE_DEC'],
                    title: 'Add Case Manager',
                    breadcrumb: 'ADD CASE MANAGER'
                },
                //canActivate: [UserRouteAccessService]
            },
            {
                path: ':id/edit',
                component: CaseManagerEditComponent,
                resolve: {
                    entity: CaseManagerResolve
                },
                data: {
                    authorities: ['ROLE_DEC'],
                    title: 'Case Manager Edit',
                    breadcrumb: 'CASE MANAGER EDIT'
                },
                //canActivate: [UserRouteAccessService]
            }
        ]
    }
];

