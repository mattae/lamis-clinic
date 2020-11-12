import {Component, OnInit} from '@angular/core';
import {CaseManager} from '../../model/case-management.model';
import {NotificationService} from '@alfresco/adf-core';
import {ActivatedRoute} from '@angular/router';
import {AppLoaderService} from '@lamis/web-core';
import {CaseManagementService} from '../../services/case-management.service';
import {CaseManagerService} from '../../services/case-manager.service';
import {Observable} from 'rxjs';
import {HttpErrorResponse, HttpResponse} from '@angular/common/http';

@Component({
    selector: 'case-manager-edit',
    templateUrl: './case-manager.edit.component.html'
})
export class CaseManagerEditComponent implements OnInit {
    entity: CaseManager;
    isSaving: boolean;

    constructor(private caseManagementService: CaseManagementService,
                private caseManagerService: CaseManagerService,
                protected notification: NotificationService,
                protected activatedRoute: ActivatedRoute,
                private appLoaderService: AppLoaderService) {
    }

    createEntity(): CaseManager {
        return <CaseManager>{};
    }

    ngOnInit(): void {
        this.isSaving = false;
        this.activatedRoute.data.subscribe(({entity}) => {
            this.entity = !!entity && entity.body ? entity.body : entity;
            if (this.entity === undefined) {
                this.entity = this.createEntity();
            }

            this.caseManagementService.getActiveFacility().subscribe((res: any) => {
                this.entity.facility = res;
            });
        });
    }

    save() {
        this.isSaving = true;
        this.appLoaderService.open('Saving Case Manager..');
        if (this.entity.id !== undefined) {
            this.subscribeToSaveResponse(this.caseManagerService.update(this.entity));
        } else {
            this.subscribeToSaveResponse(this.caseManagerService.create(this.entity));
        }
    }

    previousState() {
        window.history.back();
    }

    private subscribeToSaveResponse(result: Observable<HttpResponse<any>>) {
        result.subscribe(
            (res: HttpResponse<any>) => this.onSaveSuccess(res.body),
            (res: HttpErrorResponse) => {
                this.onSaveError();
                this.onError(res.message);
            });
    }

    private onSaveSuccess(result: any) {
        this.appLoaderService.close();
        this.isSaving = false;
        this.notification.openSnackMessage('Case Manager successfully saved');
        this.previousState();
    }

    private onSaveError() {
        this.isSaving = false;
        this.appLoaderService.close();
        //this.submitButton.disabled = true;
        this.notification.showError('Error occurred saving Case Manager; try again');
        //this.progressBar.mode = 'determinate';
    }

    protected onError(errorMessage: string) {
        this.appLoaderService.close();
        this.notification.showError(errorMessage);
    }
}
