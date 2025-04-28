import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormsModule,
  ReactiveFormsModule,
  FormGroup,
  FormControl,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { PureAbility } from '@casl/ability';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faTimes,
  faChevronDown,
  faSave,
} from '@fortawesome/free-solid-svg-icons';
import { DialogService } from 'primeng/dynamicdialog';
import { Subject, takeUntil } from 'rxjs';
import { LayoutService } from '../../../../layout/services/layout.service';
import { FcActionBarComponent } from '../../../../shared/components/fc-action-bar/fc-action-bar.component';
import { Warehouse } from '../../../warehouse/interfaces/warehouse';
import { WarehouseService } from '../../../warehouse/services/warehouse.service';
import { StockMovementService } from '../../services/stock-movement.service';
import { MessageService } from 'primeng/api';
import { FcDatepickerComponent } from '../../../../shared/components/fc-datepicker/fc-datepicker.component';
import { WarehouseSelectDialogComponent } from '../../../warehouse/components/warehouse-select-dialog/warehouse-select-dialog.component';
import { FcInputTextComponent } from '../../../../shared/components/fc-input-text/fc-input-text.component';
import { DatePickerModule } from 'primeng/datepicker';
import { IftaLabelModule } from 'primeng/iftalabel';
import { InventorySelectDialogComponent } from '../../../inventory/components/inventory-select-dialog/inventory-select-dialog.component';

@Component({
  selector: 'app-stock-movement-add',
  imports: [
    CommonModule,
    FormsModule,
    FontAwesomeModule,
    ReactiveFormsModule,
    FcActionBarComponent,
    FcInputTextComponent,
    DatePickerModule,
    IftaLabelModule,
  ],
  templateUrl: './stock-movement-add.component.html',
  styleUrl: './stock-movement-add.component.css',
  providers: [DialogService],
})
export class StockMovementAddComponent {
  // Icons
  faTimes = faTimes;
  faChevronDown = faChevronDown;
  private readonly destroy$: any = new Subject();
  actionButtons: any[] = [
    {
      label: 'Save',
      icon: faSave,
      hidden: false,
      action: () => {
        this.submit();
      },
    },
  ];

  hiddenActionButtons: any[] = [];
  filterButtons: any[] = [];

  stockMovementForm!: FormGroup;
  constructor(
    private layoutService: LayoutService,
    private stockMovementService: StockMovementService,
    private dialogService: DialogService,
    private router: Router,
    private warehouseService: WarehouseService,
    private ability: PureAbility,
    private messageService: MessageService,
  ) {
    this.actionButtons[0].hidden = !this.ability.can(
      'create',
      'stock-movement',
    );
    this.layoutService.setHeaderConfig({
      title: 'Add Stock Movement',
      icon: '',
      showHeader: true,
    });
    this.stockMovementForm = new FormGroup({
      product: new FormControl('', Validators.required),
      quantity: new FormControl('', Validators.required),
      date: new FormControl(new Date(), Validators.required),
      from_warehouse: new FormControl('', Validators.required),
      to_warehouse: new FormControl('', Validators.required),
      note: new FormControl(''),
      type: new FormControl(0, Validators.required),
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

  onSelectWarehouseFrom() {
    let existingWarehouses: any[] = [];
    existingWarehouses.push({
      warehouse: this.stockMovementForm.value.to_warehouse,
    });
    const ref = this.dialogService.open(WarehouseSelectDialogComponent, {
      data: {
        title: 'Select Warehouse',
        existingWarehouse: existingWarehouses,
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
    ref.onClose.subscribe((warehouse) => {
      if (warehouse) {
        this.stockMovementForm.controls['from_warehouse'].setValue(warehouse);
        this.loadWarehouse(warehouse.id);
      }
    });
  }

  removeWarehouseFrom() {
    this.stockMovementForm.controls['from_warehouse'].setValue('');
    this.stockMovementForm.controls['product'].setValue('');
  }

  loadingWarehouse = false;
  warehouse!: Warehouse;
  loadWarehouse(warehouseId: string) {
    this.loadingWarehouse = true;
    this.warehouseService
      .getWarehouse(warehouseId)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        this.warehouse = res.data;
        this.loadingWarehouse = false;
      });
  }

  onSelectWarehouseTo() {
    let existingWarehouses: any[] = [];
    existingWarehouses.push({
      warehouse: this.stockMovementForm.value.from_warehouse,
    });
    const ref = this.dialogService.open(WarehouseSelectDialogComponent, {
      data: {
        title: 'Select Warehouse',
        existingWarehouse: existingWarehouses,
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
    ref.onClose.subscribe((warehouse) => {
      if (warehouse) {
        this.stockMovementForm.controls['to_warehouse'].setValue(warehouse);
      }
    });
  }

  removeWarehouseTo() {
    this.stockMovementForm.controls['to_warehouse'].setValue('');
  }

  allowedQuantity: any;
  onSelectProductInventory() {
    const ref = this.dialogService.open(InventorySelectDialogComponent, {
      data: {
        title: 'Select Product Inventory',
        inventories: this.warehouse.inventories,
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
    ref.onClose.subscribe((inventory) => {
      if (inventory) {
        this.stockMovementForm.controls['product'].setValue(inventory.product);
        this.allowedQuantity = inventory.quantity;
        this.stockMovementForm.controls['quantity'].setValue(
          inventory.quantity,
        );
      }
    });
  }

  removeProductInventory() {
    this.stockMovementForm.controls['product'].setValue('');
    this.stockMovementForm.controls['quantity'].setValue('');
  }

  submit() {
    this.actionButtons[0].loading = true;
    if (this.stockMovementForm.valid) {
      if (this.stockMovementForm.value.quantity > this.allowedQuantity) {
        this.actionButtons[0].loading = false;
        // Toast
        this.messageService.add({
          summary: 'Stock Movement',
          detail: `Maximum Quantity is ${this.allowedQuantity}`,
          // lottieOption: {
          //   path: '/assets/lotties/warning.json',
          //   loop: false,
          // },
        });
      } else {
        let bodyReqForm: FormGroup;
        bodyReqForm = new FormGroup({
          product_id: new FormControl(this.stockMovementForm.value.product.id),
          quantity: new FormControl(this.stockMovementForm.value.quantity),
          date: new FormControl(this.stockMovementForm.value.date),
          from_id: new FormControl(
            this.stockMovementForm.value.from_warehouse.id,
          ),
          to_id: new FormControl(this.stockMovementForm.value.to_warehouse.id),
          note: new FormControl(this.stockMovementForm.value.note),
          type: new FormControl(this.stockMovementForm.value.type),
        });
        this.stockMovementService
          .createStockMovement(bodyReqForm.value)
          .subscribe({
            next: (res: any) => {
              this.actionButtons[0].loading = false;
              this.messageService.clear();
              this.messageService.add({
                severity: 'success',
                summary: 'Stock Movement',
                detail: res.message,
              });
              this.router.navigate(['/warehouse/view/', res.data.to_id]);
            },
            error: (err) => {
              this.actionButtons[0].loading = false;
              this.messageService.clear();
              this.messageService.add({
                severity: 'error',
                summary: 'Stock Movement',
                detail: err.message,
              });
            },
          });
      }
    } else {
      this.actionButtons[0].loading = false;
      // Toast
      this.messageService.add({
        summary: 'Stock Movement',
        detail: 'Fill the form first!',
        // lottieOption: {
        //   path: '/assets/lotties/warning.json',
        //   loop: false,
        // },
      });
    }
  }
}
