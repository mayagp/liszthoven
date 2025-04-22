import { CommonModule, Location } from '@angular/common';
import {
  AfterContentInit,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Ability } from '@casl/ability';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faEye,
  faTruckMoving,
  faPlus,
  faTimes,
  faChevronDown,
  faSave,
  faTrash,
  faRefresh,
} from '@fortawesome/free-solid-svg-icons';
import { DialogService } from 'primeng/dynamicdialog';
import { Subject, takeUntil } from 'rxjs';
import { LayoutService } from '../../../../layout/services/layout.service';
import { FcActionBarComponent } from '../../../../shared/components/fc-action-bar/fc-action-bar.component';
import { DataListParameter } from '../../../../shared/interfaces/data-list-parameter.interface';
import { Warehouse } from '../../interfaces/warehouse';
import { WarehouseService } from '../../services/warehouse.service';
import { Inventory } from '../../../inventory/interfaces/inventory';
import { InventoryServices } from '../../../inventory/services/inventory.service';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { FcInputTextComponent } from '../../../../shared/components/fc-input-text/fc-input-text.component';
import { BranchSelectDialogComponent } from '../../../branch/components/branch-select-dialog/branch-select-dialog.component';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-warehouse-view',
  imports: [
    CommonModule,
    FontAwesomeModule,
    FcActionBarComponent,
    ConfirmDialogModule,
    FcInputTextComponent,
    FormsModule,
    ReactiveFormsModule,
    ToastModule,
  ],
  templateUrl: './warehouse-view.component.html',
  styleUrl: './warehouse-view.component.css',
  providers: [ConfirmationService, MessageService, DialogService],
})
export class WarehouseViewComponent
  implements OnInit, OnDestroy, AfterContentInit
{
  // Icons
  faEye = faEye;
  faTruckMoving = faTruckMoving;
  faPlus = faPlus;
  faTimes = faTimes;
  faChevronDown = faChevronDown;

  private readonly destroy$: any = new Subject();
  warehouseForm: FormGroup;
  loading = false;
  @Input() warehouse: Warehouse = {} as Warehouse;
  @Input() quickView: Boolean = false;
  @Output() onDeleted = new EventEmitter();
  @Output() onUpdated = new EventEmitter();
  inventories: Inventory[] = [];
  loadingInventory = false;

  actionButtons: any[] = [
    {
      label: 'Save',
      icon: faSave,
      action: () => {
        this.submit();
      },
      hidden: false,
    },
    {
      label: 'Delete',
      icon: faTrash,
      action: () => {
        this.delete();
      },
      hidden: false,
    },
  ];
  hiddenActionButtons: any[] = [];
  filterButtons: any[] = [
    {
      label: 'Refresh',
      icon: faRefresh,
      action: () => {
        this.refresh();
      },
    },
  ];

  constructor(
    private layoutService: LayoutService,
    private warehouseService: WarehouseService,
    private inventoryService: InventoryServices,
    private route: ActivatedRoute,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private dialogService: DialogService,
    private location: Location,
    private ability: Ability,
  ) {
    // this.actionButtons[0].hidden = !this.ability.can('update', 'warehouse');
    // this.actionButtons[1].hidden = !this.ability.can('delete', 'warehouse');
    this.warehouse.id = String(this.route.snapshot.paramMap.get('id'));
    this.layoutService.setHeaderConfig({
      title: 'Warehouse Detail',
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
    if (!this.quickView) {
      this.loadData();
    }
    this.layoutService.setSearchConfig({ hide: true });
  }
  ngOnChanges(): void {
    this.refresh();
  }
  ngAfterContentInit(): void {}
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.layoutService.setSearchConfig({ hide: false });
  }

  loadData() {
    this.loading = true;
    this.destroy$.next();
    this.warehouseService
      .getWarehouse(this.warehouse.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        this.loading = false;
        this.warehouse = res.data;
        this.loadInventories();
        this.warehouseForm.patchValue({
          business_unit: this.warehouse.business_unit,
          code: this.warehouse.code,
          name: this.warehouse.name,
          location: this.warehouse.location,
        });
      });
  }

  loadInventories() {
    this.loadingInventory = true;
    let dataListParameter: DataListParameter = {} as DataListParameter;
    dataListParameter.rows = 10;
    dataListParameter.page = 1;
    dataListParameter.filterObj = `warehouse_id=${this.warehouse.id}&with_filter=1`;
    this.inventoryService
      .getInventories(dataListParameter)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        this.loadingInventory = false;
        this.inventories = res.data.inventories;
      });
  }

  // onSelectInventoryTransactions(id: number) {
  //   // Open Dialog
  //   const ref = this.dialogService.open(InventoryTransactionsDialogComponent, {
  //     data: {
  //       title: 'Inventory Transactions',
  //       stockMovementId: id,
  //     },
  //     showHeader: false,
  //     contentStyle: {
  //       padding: '0',
  //     },
  //     style: {
  //       overflow: 'hidden',
  //     },
  //     styleClass: 'rounded-sm',
  //     dismissableMask: true,
  //     width: '450px',
  //   });
  //   ref.onClose.subscribe((newData) => {
  //     if (newData) {
  //     }
  //   });
  // }

  delete() {
    this.confirmationService.confirm({
      header: 'Confirmation',
      message: 'Are you sure to delete this warehouse?',
      acceptLabel: 'Yes',
      rejectLabel: 'No',
      accept: () => {
        this.actionButtons[1].loading = true;
        this.warehouseService.deleteWarehouse(this.warehouse.id).subscribe({
          next: (res: any) => {
            this.actionButtons[1].loading = false;
            this.messageService.add({
              severity: 'success',
              summary: 'Warehouse',
              detail: res.message,
            });
            if (this.quickView) {
              this.onDeleted.emit();
            } else {
              this.back();
            }
          },
          error: (err) => {
            this.actionButtons[1].loading = false;
            this.messageService.add({
              severity: 'error',
              summary: 'Warehouse',
              detail: err.message,
            });
          },
        });
      },
      reject: () => {
        this.messageService.add({
          severity: 'warn',
          summary: 'Cancelled',
          detail: 'Delete operation was cancelled',
        });
      },
    });
  }

  onSelectBranch() {
    const ref = this.dialogService.open(BranchSelectDialogComponent, {
      data: {
        title: 'Select Business Unit',
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

  removeBranch() {
    this.warehouseForm.controls['business_unit'].setValue(null);
  }

  submit() {
    this.actionButtons[0].loading = true;
    // bodyReq
    let bodyReq = { ...this.warehouseForm.value };
    delete bodyReq.business_unit;
    this.warehouseService
      .updateWarehouse(this.warehouse.id, bodyReq)
      .subscribe({
        next: (res: any) => {
          this.actionButtons[0].loading = false;
          this.messageService.add({
            severity: 'success',
            summary: 'Warehouse',
            detail: res.message,
          });
          this.onUpdated.emit(res.data);
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
  }
  back() {
    this.location.back();
  }
  refresh() {
    this.warehouseForm.reset();
    this.loadData();
  }
}
