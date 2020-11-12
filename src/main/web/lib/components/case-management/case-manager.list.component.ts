import {Component, OnInit} from '@angular/core';
import {CaseManager} from '../../model/case-management.model';
import {CaseManagerService} from '../../services/case-manager.service';
import {NotificationService} from '@alfresco/adf-core';
import {ActivatedRoute, Router} from '@angular/router';
import {CaseManagementService} from '../../services/case-management.service';
import {Facility} from '../../model/facility.model';

@Component({
    selector: 'case-managers',
    templateUrl: './case-manager.list.component.html'
})
export class CaseManagerListComponent implements OnInit {
    page = 0;
    caseManagers: CaseManager[];
    loading = false;
    public itemsPerPage: number = 200;
    public currentSearch: string = '';
    totalItems = 0;
    display = 'list';
    facility: Facility;

    constructor(private caseManagerService: CaseManagerService,
                private caseManagementService: CaseManagementService,
                protected notification: NotificationService,
                protected router: Router,
                protected activatedRoute: ActivatedRoute) {
    }

    ngOnInit(): void {
        this.caseManagementService.getActiveFacility().subscribe(res => {
            this.facility = res;
            this.onPageChange(0);
        });
    }

    public select(data: any): any {
        this.router.navigate(['..', 'case-managers', data.obj.uuid, 'view'], {relativeTo: this.activatedRoute});
    }

    onPageChange(pageInfo) {
        this.page = pageInfo;
        this.loadAll();
    }

    loadPage(page: number) {
        this.page = page;
        this.loadAll();
    }

    loadAll() {
        this.loading = true;
        this.caseManagerService.query({
            keyword: this.currentSearch,
            page: 0,
            id: this.facility && this.facility.id || 0,
            size: this.itemsPerPage,
            sort: ['id', 'asc']
        }).subscribe(
            (res: any) => {
                this.onSuccess(res.body, res.headers);
            },
            (res: any) => this.onError(res)
        );
    }

    protected onSuccess(data: any, headers: any) {
        this.caseManagers = data;
        this.totalItems = headers.get('X-Total-Count');
        this.loading = false;
    }

    private onError(error: any) {
        this.notification.openSnackMessage(error.message);
        this.loading = false;
    }
}
