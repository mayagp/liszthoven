import { AfterContentInit, Component, OnDestroy, OnInit } from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { Ability } from '@casl/ability';
import {
  faTimes,
  faChevronDown,
  faSave,
} from '@fortawesome/free-solid-svg-icons';
import { DialogService } from 'primeng/dynamicdialog';
import { Subject } from 'rxjs';
import { LayoutService } from '../../../../layout/services/layout.service';
import { WarehouseService } from '../../services/warehouse.service';
import { MessageService } from 'primeng/api';
import { BranchSelectDialogComponent } from '../../../branch/components/branch-select-dialog/branch-select-dialog.component';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { FcActionBarComponent } from '../../../../shared/components/fc-action-bar/fc-action-bar.component';
import { FcInputTextComponent } from '../../../../shared/components/fc-input-text/fc-input-text.component';

@Component({
  selector: 'app-warehouse-add',
  imports: [
    CommonModule,
    FontAwesomeModule,
    FcActionBarComponent,
    FcInputTextComponent,
    FormsModule,
    ReactiveFormsModule,
  ],
  templateUrl: './warehouse-add.component.html',
  styleUrl: './warehouse-add.component.css',
  providers: [DialogService],
})
export class WarehouseAddComponent
  implements OnInit, OnDestroy, AfterContentInit
{
  // icons
  faTimes = faTimes;
  faChevronDown = faChevronDown;

  private readonly destroy$: any = new Subject();
  actionButtons: any[] = [
    {
      label: 'Save',
      icon: faSave,

      action: () => {
        this.submit();
      },
    },
  ];
  hiddenActionButtons: any[] = [];
  filterButtons: any[] = [];

  warehouseForm: FormGroup;
  loading = false;

  constructor(
    private layoutService: LayoutService,
    private warehouseService: WarehouseService,
    private messageService: MessageService,
    private dialogService: DialogService,
    private ability: Ability,
  ) {
    // this.actionButtons[0].hidden = !this.ability.can('create', 'warehouse');
    this.layoutService.setHeaderConfig({
      title: 'Add Warehouse',
      icon: '',
      showHeader: true,
    });
    this.warehouseForm = new FormGroup({
      business_unit: new FormControl(null, Validators.required),
      code: new FormControl('', Validators.required),
      name: new FormControl('', Validators.required),
      location: new FormControl('', Validators.required),
    });
  }

  ngOnInit(): void {
    this.layoutService.setSearchConfig({ hide: true });
  }
  ngAfterContentInit(): void {}
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.layoutService.setSearchConfig({ hide: false });
  }

  onSelectBranch() {
    const ref = this.dialogService.open(BranchSelectDialogComponent, {
      data: {
        title: 'Select Branch',
        companyId: 2,
      },
      showHeader: false,
      contentStyle: {
        padding: '0',
      },
      style: {
        overflow: 'hidden',
      },
      styleClass: 'rounded-sm',
      dismissableMask: true,
      width: '450px',
    });
    ref.onClose.subscribe((businessUnit: any) => {
      if (businessUnit) {
        this.warehouseForm.controls['business_unit'].setValue(businessUnit);
      }
    });
  }

  removeBusinessUnit() {
    this.warehouseForm.controls['business_unit'].setValue(null);
  }

  submit() {
    if (this.warehouseForm.valid) {
      let bodyReq = this.warehouseForm.value;
      bodyReq.business_unit_id = bodyReq.business_unit.id;
      delete bodyReq.business_unit;
      this.actionButtons[0].loading = true;
      this.warehouseService.addWarehouse(bodyReq).subscribe({
        next: (res: any) => {
          this.warehouseForm.reset();
          this.actionButtons[0].loading = false;
          this.messageService.add({
            severity: 'success',
            summary: 'Warehouse',
            detail: res.message,
          });
        },
        error: (err) => {
          this.actionButtons[0].loading = false;
          this.messageService.add({
            severity: 'error',
            summary: 'Warehouse',
            detail: err.message,
          });
        },
      });
    } else {
      // Toast
      this.messageService.add({
        summary: 'Warehouse',
        detail: 'Fill the form first!',
        // lottieOption: {
        //   path: '/assets/lotties/warning.json',
        //   loop: false,
        // },
      });
    }
  }
}
