import {Component, OnDestroy, OnInit} from '@angular/core';
import {CaseManager, CaseManagerStats, Patient} from '../../model/case-management.model';
import {CaseManagementService} from '../../services/case-management.service';
import {CardViewIntItemModel, CardViewItem, NotificationService} from '@alfresco/adf-core';
import {TdDialogService} from '@covalent/core';
import {Subscription} from 'rxjs';
import {RxStompService} from '@stomp/ng2-stompjs';

export interface Filter {
    upperAgeLimit?: number;
    lowerAgeLimit?: number;
    pregnant?: boolean;
    breastfeeding?: boolean;
    lgaId?: number;
    facilityId?: number;
    status?: string;
    gender?: string;
    hospitalNum?: string;
    page?: number;
    size?: number;
    assigned?: boolean;
    caseManagerId?: number;
}

@Component({
    selector: 'case-management-patient-list',
    templateUrl: './patient.list.component.html'
})
export class PatientListComponent implements OnInit, OnDestroy {
    caseManagers: CaseManager[] = [];
    caseManager: CaseManager;
    assignCaseManager: CaseManager;
    patients: Patient[] = [];
    properties: Array<CardViewItem> = [];
    globalProperties: Array<CardViewItem> = [];
    stats: CaseManagerStats = {};
    globalStats: CaseManagerStats = {};
    facilityId: number;
    filter: Filter = {};
    ageLimit: number;
    pregnancyStatus: number;
    states: any[];
    lgas: any[];
    hospitalNum = '';
    totalItems = 0;
    page = 0;
    itemsPerPage = 20;
    loading = true;
    initializing = true;
    filterByCaseManager = false;
    private topicSubscription: Subscription;

    constructor(private service: CaseManagementService, private _dialogService: TdDialogService,
                private notificationService: NotificationService, private stompService: RxStompService) {
    }

    ngOnInit(): void {
        /*this.topicSubscription = this.stompService.watch('/topic/case-management').subscribe((msg: Message) => {
            console.log('Simp Message', msg);
            if(msg.body === 'finished'){
                this.initializing = false;
            }
        });*/

        this.service.getActiveFacility().subscribe((f) => {
            if (f) {
                this.facilityId = f.id;
                this.service.initClients(f.id).subscribe((r) => {
                    this.initializing = false;
                    this.service.getCaseManagers(f.id).subscribe(res => {
                        this.caseManagers = res.filter(c => c.active);
                        this.updateList();
                    });
                });

                this.service.getCaseManagerStats(0, f.id).subscribe(res => {
                    this.stats = res;
                    this.buildStats();
                });
            }
        });
        this.service.getStates().subscribe(res => this.states = res);
    }

    ngOnDestroy(): void {
        // this.topicSubscription.unsubscribe();
    }

    clearHospitalNum() {
        this.hospitalNum = null;
        this.filter['hospitalNum'] = null;
        this.page = 0;
    }

    search() {
        this.page = 0;
        this.updateList();
    }

    assignClients() {
        this._dialogService.openConfirm({
            title: 'Confirm',
            message: 'Do you want to assign selected clients to the selected Case Manager?',
            cancelButton: 'No',
            acceptButton: 'Yes',
            width: '500px',
        }).afterClosed().subscribe((accept: boolean) => {
            if (accept) {
                const patientIds = this.patients.filter(p => p.selected)
                    .map(p => p.id);
                this.service.assignToCaseManager(this.assignCaseManager.id, patientIds).subscribe((res) => {
                    if (res.ok) {
                        this.updateList();
                        this.service.getCaseManagerStats(this.caseManager.id, this.facilityId).subscribe(res1 => {
                            this.stats = res1;
                            this.buildStats();
                        });
                    } else {
                        this.notificationService.showError('Error assigning clients, please try again');
                    }
                });
            } else {
                // DO SOMETHING ELSE
            }
        });
    }

    deAssignClients() {
        this._dialogService.openConfirm({
            title: 'Confirm',
            message: 'Do you want to de-assign selected clients?',
            cancelButton: 'No',
            acceptButton: 'Yes',
            width: '500px',
        }).afterClosed().subscribe((accept: boolean) => {
            if (accept) {
                const patientIds = this.patients.filter(p => p.selected)
                    .map(p => p.id);
                this.service.deAssignClients(patientIds).subscribe((res) => {
                    if (res.ok) {
                        this.updateList();
                        this.service.getCaseManagerStats(this.caseManager.id, this.facilityId).subscribe(res1 => {
                            this.stats = res1;
                            this.buildStats();
                        });
                    } else {
                        this.notificationService.showError('Error de-assigning clients, please try again');
                    }
                });
            } else {
                // DO SOMETHING ELSE
            }
        });
    }

    selections(): boolean {
        return this.patients && !!this.patients.find(p => p.selected);
    }

    loadPage(page) {
        this.page = page;
        this.updateList();
    }

    select(event) {
        this.patients = this.patients.map(p => {
            if (p.id === event.obj.id) {
                p.selected = !p.selected;
            }
            return p;
        });
    }

    caseManagerChanged() {
        if (!this.caseManager) {
            this.stats = null;
        }
        this.service.getCaseManagerStats(this.caseManager.id, this.facilityId).subscribe(res => {
            this.stats = res;
            this.buildStats();
        });
        if (this.filterByCaseManager) {
            this.filter['caseManagerId'] = this.caseManager.id;
        } else {
            this.filter['caseManagerId'] = null;
        }
        this.updateList();
    }

    updateList() {
        if (this.hospitalNum) {
            this.filter.hospitalNum = this.hospitalNum;
        }
        this.filter['facilityId'] = this.facilityId;
        this.filter['size'] = this.itemsPerPage;
        this.filter['page'] = this.page > 0 ? this.page - 1 : 0;
        if (this.filterByCaseManager) {
            this.filter['caseManagerId'] = this.caseManager.id;
        } else {
            this.filter['caseManagerId'] = null;
        }
        this.loading = true;
        this.service.getClientList(this.filter).subscribe(res => {
            if (res.body) {
                this.patients = res.body.map(p => {
                    const caseManager = this.caseManagers.find(c => c.id === p.caseManagerId);
                    if (caseManager) {
                        p.caseManager = caseManager;
                    }
                    return p;
                });
                this.totalItems = (<any>res.headers).get('X-Total-Count');
                this.service.getCaseManagerStats(0, this.facilityId).subscribe(res1 => {
                    this.globalStats = res1;
                    this.buildGlobalStats();
                });
            }
            this.loading = false;
        });
    }

    ageGroupChanged() {
        if (this.ageLimit === 9) {
            this.filter['lowerAgeLimit'] = 0;
            this.filter['upperAgeLimit'] = 9;
        } else if (this.ageLimit === 14) {
            this.filter['lowerAgeLimit'] = 10;
            this.filter['upperAgeLimit'] = 14;
        } else if (this.ageLimit === 19) {
            this.filter['lowerAgeLimit'] = 15;
            this.filter['upperAgeLimit'] = 19;
        } else if (this.ageLimit === 24) {
            this.filter['lowerAgeLimit'] = 20;
            this.filter['upperAgeLimit'] = 24;
        } else if (this.ageLimit === 100) {
            this.filter['lowerAgeLimit'] = 25;
            this.filter['upperAgeLimit'] = 100;
        }
        if (!this.ageLimit) {
            this.filter['lowerAgeLimit'] = null;
            this.filter['upperAgeLimit'] = null;
        }
        this.updateList();
    }

    pregnancyStatusChanged() {
        if (this.pregnancyStatus === 1) {
            this.filter['pregnant'] = true;
        } else if (this.pregnancyStatus === 2) {
            this.filter['breastfeeding'] = true;
        }
        if (!this.pregnancyStatus) {
            this.filter['pregnant'] = null;
            this.filter['breastfeeding'] = null;
        }
        this.updateList();
    }

    stateChanged(id) {
        if (id) {
            this.service.getLgasByState(id).subscribe(res => this.lgas = res);
        }
    }

    assigned(val) {
        if (val === 1) {
            this.filter.assigned = true;
        } else if (val === 2) {
            this.filter.assigned = false;
        } else {
            this.filter.assigned = null;
        }
        this.updateList();
    }

    lgaChanged(id) {
        if (id) {
            this.filter.lgaId = id;
        } else {
            this.filter.lgaId = null;
        }
        this.updateList();
    }

    buildStats() {
        this.properties = [];
        this.properties.push(new CardViewIntItemModel({
            label: 'Clients(s) Assigned',
            key: 'as',
            value: this.stats.assigned
        }));
        this.properties.push(new CardViewIntItemModel({
            label: 'Stable 1 Year',
            key: 'as',
            value: this.stats.stable
        }));
        this.properties.push(new CardViewIntItemModel({
            label: 'Unstable less than 1 Year',
            key: 'as',
            value: this.stats.unstableLessThan1year
        }));
        this.properties.push(new CardViewIntItemModel({
            label: 'Unstable more than 1 Year',
            key: 'as',
            value: this.stats.unstableMoreThan1Year
        }));
        this.properties.push(new CardViewIntItemModel({
            label: 'Awaiting ART',
            key: 'as',
            value: this.stats.preArt
        }));
    }

    buildGlobalStats() {
        this.globalProperties = [];
        if (this.globalStats) {
            this.globalProperties.push(new CardViewIntItemModel({
                label: 'Clients(s) Assigned',
                key: 'as',
                value: this.globalStats.assigned
            }));
            this.globalProperties.push(new CardViewIntItemModel({
                label: 'Stable 1 Year',
                key: 'as',
                value: this.globalStats.stable
            }));
            this.globalProperties.push(new CardViewIntItemModel({
                label: 'Unstable less than 1 Year',
                key: 'as',
                value: this.globalStats.unstableLessThan1year
            }));
            this.globalProperties.push(new CardViewIntItemModel({
                label: 'Unstable more than 1 Year',
                key: 'as',
                value: this.globalStats.unstableMoreThan1Year
            }));
            this.globalProperties.push(new CardViewIntItemModel({
                label: 'Awaiting ART',
                key: 'as',
                value: this.globalStats.preArt
            }));
        }
    }
}
