import {Component} from '@angular/core';
import {CardViewBoolItemModel, CardViewItem, CardViewTextItemModel, NotificationService} from '@alfresco/adf-core';
import {ActivatedRoute, Router} from '@angular/router';
import {TdDialogService} from '@covalent/core';
import {CaseManager} from '../../model/case-management.model';
import {CaseManagerService} from '../../services/case-manager.service';

@Component({
    selector: 'case-manager-details',
    templateUrl: './case-manager.details.component.html'
})
export class CaseManagerDetailsComponent {
    properties: CardViewItem[] = [];
    entity: CaseManager;

    constructor(private router: Router, private route: ActivatedRoute, private service: CaseManagerService,
                private _dialogService: TdDialogService,
                private notificationService: NotificationService) {
    }

    ngOnInit() {
        this.route.data.subscribe(({entity}) => {
            this.entity = !!entity && entity.body ? entity.body : entity;
            this.buildProperties();
        });
    }

    edit() {
        this.router.navigate(['/', 'admin', 'case-managers', this.entity.uuid, 'edit']);
    }

    delete() {
        this._dialogService.openConfirm({
            title: 'Confirm',
            message: 'Do you want to delete this Case Manager, action cannot be reversed?',
            cancelButton: 'No',
            acceptButton: 'Yes',
            width: '500px',
        }).afterClosed().subscribe((accept: boolean) => {
            if (accept) {
                this.service.delete(this.entity.id).subscribe((res) => {
                    if (res.ok) {
                        this.router.navigate(['admin', 'case-managers']);
                    } else {
                        this.notificationService.showError('Error deleting Case Manager, please try again');
                    }
                });
            } else {
                // DO SOMETHING ELSE
            }
        });
    }

    buildProperties() {
        this.properties.push(new CardViewTextItemModel({
            label: 'Name',
            key: 'cs',
            value: this.entity.name
        }));
        this.properties.push(new CardViewTextItemModel({
            label: 'Address',
            key: 'fs',
            value: this.entity.address
        }));
        this.properties.push(new CardViewTextItemModel({
            label: 'Gender',
            key: 'ts',
            value: this.entity.gender === 'FEMALE' ? 'Female' : 'Male'
        }));
        this.properties.push(new CardViewTextItemModel({
            label: 'Telephone',
            key: 'cd4p',
            value: this.entity.phoneNumber
        }));
        this.properties.push(new CardViewBoolItemModel({
            label: 'Active',
            key: 'cd4p',
            value: this.entity.active
        }));
    }

    previousState() {
        window.history.back();
    }

}
