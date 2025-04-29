import { CommonModule } from '@angular/common';
import { AfterContentInit, Component, OnDestroy, OnInit } from '@angular/core';
import {
  FormsModule,
  ReactiveFormsModule,
  FormGroup,
  FormControl,
  Validators,
} from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faTimes, faChevronDown } from '@fortawesome/free-solid-svg-icons';
import {
  DynamicDialogRef,
  DynamicDialogConfig,
  DialogService,
} from 'primeng/dynamicdialog';
import { IftaLabelModule } from 'primeng/iftalabel';
import { InputNumberModule } from 'primeng/inputnumber';
import { Subject } from 'rxjs';
import { WarehouseSelectDialogComponent } from '../../../warehouse/components/warehouse-select-dialog/warehouse-select-dialog.component';
import { Warehouse } from '../../../warehouse/interfaces/warehouse';

@Component({
  selector: 'app-purchase-order-warehouse-add-dialog',
  imports: [
    CommonModule,
    FontAwesomeModule,
    FormsModule,
    ReactiveFormsModule,
    InputNumberModule,
    IftaLabelModule,
  ],
  templateUrl: './purchase-order-warehouse-add-dialog.component.html',
  styleUrl: './purchase-order-warehouse-add-dialog.component.css',
})
export class PurchaseOrderWarehouseAddDialogComponent
  implements OnInit, AfterContentInit, OnDestroy
{
  private readonly destroy$: any = new Subject();

  // Icons
  faTimes = faTimes;
  faChevronDown = faChevronDown;

  loading = false;
  title = '';

  existingWarehouses: Warehouse[] = [];

  purchaseOrderWarehouseForm: FormGroup;
  constructor(
    private ref: DynamicDialogRef,
    private config: DynamicDialogConfig,
    private dialogService: DialogService,
  ) {
    if (this.config.data.title) {
      this.title = this.config.data.title;
    }

    if (this.config.data.existingWarehouse) {
      this.existingWarehouses = this.config.data.existingWarehouse;
    }

    this.purchaseOrderWarehouseForm = new FormGroup({
      warehouse: new FormControl(null, Validators.required),
      quantity_ordered: new FormControl(null, Validators.required),
    });

    if (this.config.data.purchaseOrderWarehouse) {
      let data = this.config.data.purchaseOrderWarehouse;
      this.purchaseOrderWarehouseForm.patchValue({
        warehouse: data.warehouse,
        quantity_ordered: data.quantity_ordered,
      });
    }
  }

  ngOnInit(): void {}
  ngAfterContentInit(): void {}
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSelectWarehouse() {
    const ref = this.dialogService.open(WarehouseSelectDialogComponent, {
      data: {
        title: 'Select Waerhouse',
        existingWarehouse: this.existingWarehouses,
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
        this.purchaseOrderWarehouseForm.controls['warehouse'].setValue(
          warehouse,
        );
      }
    });
  }

  removeWarehouse() {
    this.purchaseOrderWarehouseForm.controls['warehouse'].setValue('');
  }

  isSubmitAllowed(): boolean {
    if (this.purchaseOrderWarehouseForm.valid) {
      return true;
    } else {
      return false;
    }
  }

  onClose() {
    this.ref.close();
  }

  submit() {
    this.ref.close(this.purchaseOrderWarehouseForm.value);
  }
}
