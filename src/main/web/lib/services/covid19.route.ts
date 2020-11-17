import {Routes} from '@angular/router';
import {Covid19ScreeningDetailComponent} from '../components/covid19/covid19-screening-detail.component';
import {Covid19ScreeningComponent} from '../components/covid19/covid19-screening.component';
import {ObservationResolve} from './cervical-cancer-screening.route';

export const ROUTES: Routes = [
    {
        path: '',
        data: {
            title: 'COVID19 Screening',
            breadcrumb: 'COVID19 SCREENING'
        },
        children: [
            {
                path: ':id/patient/:patientId/view',
                component: Covid19ScreeningDetailComponent,
                resolve: {
                    entity: ObservationResolve
                },
                data: {
                    authorities: ['ROLE_USER'],
                    title: 'COVID19 Screening',
                    breadcrumb: 'COVID19 SCREENING'
                },
                // canActivate: [UserRouteAccessService]
            },
            {
                path: 'patient/:patientId/new',
                component: Covid19ScreeningComponent,
                data: {
                    authorities: ['ROLE_DEC'],
                    title: 'COVID19 Screening',
                    breadcrumb: 'ADD COVID19 SCREENING'
                },
                // canActivate: [UserRouteAccessService]
            },
            {
                path: ':id/patient/:patientId/edit',
                component: Covid19ScreeningComponent,
                resolve: {
                    entity: ObservationResolve
                },
                data: {
                    authorities: ['ROLE_DEC'],
                    title: 'COVID19 Screening Edit',
                    breadcrumb: 'COVID19 SCREENING EDIT'
                },
                // canActivate: [UserRouteAccessService]
            }
        ]
    }
];

