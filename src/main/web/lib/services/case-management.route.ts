import {Routes} from '@angular/router';
import {PatientListComponent} from '../components/case-management/patient.list.component';


export const ROUTES: Routes = [
    {
        path: '',
        data: {
            title: 'Case Management',
            breadcrumb: 'CASE MANAGEMENT'
        },
        children: [
            {
                path: '',
                children: [
                    {
                        path: '',
                        component: PatientListComponent,
                        data: {
                            authorities: ['ROLE_USER'],
                            title: 'Case Management',
                            breadcrumb: 'CASE MANAGEMENT'
                        }
                    }
                ],
                data: {
                    title: 'Case Management',
                    breadcrumb: 'CASE MANAGEMENT'
                },
                //canActivate: [UserRouteAccessService]
            }
        ]
    }
];

