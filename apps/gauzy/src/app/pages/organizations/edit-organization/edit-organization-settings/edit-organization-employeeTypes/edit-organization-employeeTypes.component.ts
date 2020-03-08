import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Subject, Observable } from 'rxjs';
import { EmployeesService } from '../../../../../@core/services/employees.service';
import {
	Employee,
	Organization,
	EmployeeTypesCreateInput,
	EmployeeType
} from '@gauzy/models';
import { takeUntil, switchMap, tap } from 'rxjs/operators';
import { OrganizationEditStore } from '../../../../../@core/services/organization-edit-store.service';
import { OrganizationEmpTypesService } from '../../../../../@core/services/organization-emp-types.service';
import { NbToastrService } from '@nebular/theme';
import { TranslateService } from '@ngx-translate/core';
import { TranslationBaseComponent } from 'apps/gauzy/src/app/@shared/language-base/translation-base.component';
import { EmployeeTypesStore } from 'apps/gauzy/src/app/@core/services/employee-types-store.service';

@Component({
	selector: 'ga-edit-org-emptypes',
	templateUrl: './edit-organization-employeeTypes.component.html'
})
export class EditOrganizationEmployeeTypes extends TranslationBaseComponent
	implements OnInit, OnDestroy {
	private _ngDestroy$ = new Subject<void>();
	selectedEmployee: Employee;
	organization: Organization;
	employeeTypes: EmployeeTypesCreateInput[];
	showAddCard: boolean;
	empTypes$: Observable<EmployeeType[]>;

	constructor(
		private employeeService: EmployeesService,
		private organizationEditStore: OrganizationEditStore,
		private employeeTypesStore: EmployeeTypesStore,
		private organizationEmpTypesService: OrganizationEmpTypesService,
		private readonly toastrService: NbToastrService,
		readonly translateService: TranslateService
	) {
		super(translateService);
	}

	ngOnInit(): void {
		this.empTypes$ = this.employeeTypesStore.employeeTypes$;

		this.organizationEditStore.selectedOrganization$
			.pipe(
				tap((organization) => (this.organization = organization)),
				switchMap(({ id }) => this.employeeService.getEmpTypes(id)),

				tap((empTypes) => this.employeeTypesStore.loadAll(empTypes)),
				takeUntil(this._ngDestroy$)
			)
			.subscribe();
	}

	createEmployeeType(employeeType: string) {
		// TODO ADD ERROR NOTIFICATION AND ADD VALUE FOR ALL LANGUAGES
		const newEmpType = {
			name: employeeType,
			organizationId: this.organization.id
		};
		this.employeeService
			.addEmpType(newEmpType)
			.pipe(takeUntil(this._ngDestroy$))
			.subscribe((data) => {
				this.employeeTypesStore.create(data);
				this.showAddCard = false;
				this.toastrService.primary(
					this.getTranslation(
						'NOTES.ORGANIZATIONS.EDIT_ORGANIZATIONS_EMPLOYEE_TYPES.ADD_EMPLOYEE_TYPE',
						{
							name: name
						}
					),
					this.getTranslation('TOASTR.TITLE.SUCCESS')
				);
			});
	}

	delType(id: number) {
		// TODO ADD ERROR NOTIFICATION AND ADD VALUE FOR ALL LANGUAGES
		this.organizationEmpTypesService
			.delType(id)
			.pipe(takeUntil(this._ngDestroy$))
			.subscribe(() => {
				this.employeeTypesStore.delete(id);
				this.toastrService.primary(
					this.getTranslation(
						'NOTES.ORGANIZATIONS.EDIT_ORGANIZATIONS_EMPLOYEE_TYPES.REMOVE_EMPLOYEE_TYPE',
						{
							name: name
						}
					),
					this.getTranslation('TOASTR.TITLE.SUCCESS')
				);
			});
	}

	ngOnDestroy() {
		this._ngDestroy$.next();
		this._ngDestroy$.complete();
	}
}
