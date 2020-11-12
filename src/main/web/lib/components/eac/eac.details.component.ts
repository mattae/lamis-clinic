import {Component, OnInit} from '@angular/core';
import {EAC} from '../../model/clinic.model';
import {ActivatedRoute, Router} from '@angular/router';
import {TdDialogService} from '@covalent/core';
import {CardViewDateItemModel, CardViewItem, CardViewTextItemModel, NotificationService} from '@alfresco/adf-core';
import {EacService} from '../../services/eac.service';

@Component({
    selector: 'eac-details',
    templateUrl: './eac.details.component.html'
})
export class EacDetailsComponent implements OnInit {
    properties: CardViewItem[] = [];
    entity: EAC;

    constructor(private router: Router, private route: ActivatedRoute,
                private _dialogService: TdDialogService, private notificationService: NotificationService,
                private eacService: EacService) {
    }

    ngOnInit() {
        this.route.data.subscribe(({entity}) => {
            this.entity = !!entity && entity.body ? entity.body : entity;
            this.buildProperties();
        });
    }

    edit() {
        this.router.navigate(['/', 'eacs', this.entity.uuid, 'patient', this.entity.patient.uuid, 'edit']);
    }

    delete() {
        this._dialogService.openConfirm({
            title: 'Confirm',
            message: 'Do you want to delete this EAC Record, action cannot be reversed?',
            cancelButton: 'No',
            acceptButton: 'Yes',
            width: '500px',
        }).afterClosed().subscribe((accept: boolean) => {
            if (accept) {
                this.eacService.delete(this.entity.id).subscribe((res) => {
                    if (res.ok) {
                        this.router.navigate(['patients']);
                    } else {
                        this.notificationService.showError('Error deleting visit, please try again');
                    }
                });
            } else {
                // DO SOMETHING ELSE
            }
        });
    }

    buildProperties() {
        this.properties.push(new CardViewDateItemModel({
            key: 'ds',
            value: this.entity.dateLastViralLoad,
            label: 'Date Last Viral Load',
            format: 'dd MMM, yyyy'
        }));
        this.properties.push(new CardViewTextItemModel({
            key: 'vl',
            value: this.entity.lastViralLoad,
            label: 'Last Viral Load'
        }));
        this.properties.push(new CardViewDateItemModel({
            key: 'ds',
            value: this.entity.dateEac1,
            label: 'Date of 1st EAC Session',
            format: 'dd MMM, yyyy'
        }));
        if (this.entity.dateEac2) {
            this.properties.push(new CardViewDateItemModel({
                key: 'ds',
                value: this.entity.dateEac2,
                label: 'Date of 2nd EAC Session',
                format: 'dd MMM, yyyy'
            }));
        }
        if (this.entity.dateEac3) {
            this.properties.push(new CardViewDateItemModel({
                key: 'ds',
                value: this.entity.dateEac3,
                label: 'Date of 3rd EAC Session',
                format: 'dd MMM, yyyy'
            }));
        }
        if (this.entity.dateEac3) {
            this.properties.push(new CardViewDateItemModel({
                key: 'ds',
                value: this.entity.dateSampleCollected,
                label: 'Date of Repeat VL Sample Collection',
                format: 'dd MMM, yyyy'
            }));
        }
        this.properties.push(new CardViewTextItemModel({
            label: 'Notes',
            key: 'ts',
            value: this.entity.notes
        }));
    }

    previousState() {
        window.history.back();
    }
}
