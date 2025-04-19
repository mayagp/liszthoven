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
import { ActivatedRoute, Router } from '@angular/router';
import { Ability } from '@casl/ability';
import {
  faPlus,
  faTrash,
  faSave,
  faCog,
  faChevronDown,
  faRefresh,
  faChevronRight,
  faChevronLeft,
  faBoxOpen,
  faLocationDot,
} from '@fortawesome/free-solid-svg-icons';
import { DialogService } from 'primeng/dynamicdialog';
import { Subject, takeUntil } from 'rxjs';
import { LayoutService } from '../../../../layout/services/layout.service';
import { Branch } from '../../interfaces/branch';
import { BranchService } from '../../services/branch.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialog, ConfirmDialogModule } from 'primeng/confirmdialog';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { FcActionBarComponent } from '../../../../shared/components/fc-action-bar/fc-action-bar.component';
import { FcInputTextComponent } from '../../../../shared/components/fc-input-text/fc-input-text.component';
import { FcTextareaComponent } from '../../../../shared/components/fc-textarea/fc-textarea.component';
import { FcInputTelComponent } from '../../../../shared/components/fc-input-tel/fc-input-tel.component';

@Component({
  selector: 'app-branch-view',
  imports: [
    ToastModule,
    ButtonModule,
    CommonModule,
    FontAwesomeModule,
    FcActionBarComponent,
    FcInputTextComponent,
    FcTextareaComponent,
    ButtonModule,
    FormsModule,
    ReactiveFormsModule,
    ConfirmDialogModule,
    FcInputTelComponent,
  ],
  templateUrl: './branch-view.component.html',
  styleUrl: './branch-view.component.css',
  providers: [ConfirmationService, MessageService, DialogService],
})
export class BranchViewComponent
  implements OnInit, OnDestroy, AfterContentInit
{
  private readonly destroy$: any = new Subject();

  // fontawesome
  faPlus = faPlus;
  faTrash = faTrash;
  faSave = faSave;
  faCog = faCog;
  faChevronDown = faChevronDown;
  faRefresh = faRefresh;
  faChevronRight = faChevronRight;
  faChevronLeft = faChevronLeft;
  faBoxOpen = faBoxOpen;
  faLocationDot = faLocationDot;

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
        this.confirmDelete();
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
  @Input() branch: Branch = {} as Branch;
  @Input() quickView: Boolean = false;
  @Output() onDeleted = new EventEmitter();
  @Output() onUpdated = new EventEmitter();

  branchForm: FormGroup;
  companies: any;
  loading = false;

  constructor(
    private layoutService: LayoutService,
    private branchService: BranchService,
    private route: ActivatedRoute,
    private router: Router,
    private dialogService: DialogService,
    private messageService: MessageService,
    private location: Location,
    // private fcConfirmService: FcConfirmService,
    private confirmationService: ConfirmationService,
    private ability: Ability,
  ) {
    this.branch.id = String(this.route.snapshot.paramMap.get('id'));
    // this.actionButtons[0].hidden = !this.ability.can('update', 'branch');
    // this.actionButtons[1].hidden = !this.ability.can('delete', 'branch');

    this.layoutService.setHeaderConfig({
      title: 'Branch Detail',
      icon: '',
      showHeader: true,
    });

    this.branchForm = new FormGroup({
      address: new FormControl('', Validators.required),
      note: new FormControl(''),
      email: new FormControl(''),
      phone: new FormControl(''),
      electric_bill_no: new FormControl(''),
      water_bill_no: new FormControl(''),
      internet_bill_no: new FormControl(''),
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
    this.branchService
      .getBranch(this.branch.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        this.loading = false;
        this.branch = res.data;
        this.companies = res.data.companies;
        this.branchForm.patchValue({
          address: this.branch?.address,
          note: this.branch.note || '-',
          email: this.branch.email,
          phone: this.branch.phone,
          water_bill_no: this.branch.water_bill_no,
          electric_bill_no: this.branch.electric_bill_no,
          internet_bill_no: this.branch.internet_bill_no,
        });
      });
  }

  submit() {
    this.actionButtons[0].loading = true;
    this.branchService
      .updateBrach(this.branch.id, this.branchForm.value)
      .subscribe({
        next: (res: any) => {
          this.actionButtons[0].loading = false;
          this.messageService.add({
            severity: 'success',
            summary: 'Branch',
            detail: res.message,
          });
          this.onUpdated.emit(res.data);
        },
        error: (err) => {
          this.actionButtons[0].loading = false;
          this.messageService.add({
            severity: 'error',
            summary: 'Branch',
            detail: err.message,
          });
        },
      });
  }

  confirmDelete() {
    this.confirmationService.confirm({
      header: 'Confirmation',
      message: 'Are you sure to delete this branch?',
      acceptLabel: 'Yes',
      rejectLabel: 'No',
      accept: () => {
        this.delete();
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

  delete() {
    this.actionButtons[1].loading = true;
    this.branchService.deleteBranch(this.branch.id).subscribe({
      next: (res: any) => {
        this.actionButtons[1].loading = false;
        this.router.navigate(['/branch/list']);
        this.messageService.add({
          severity: 'success',
          summary: 'Branch',
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
          summary: 'Branch',
          detail: err.message,
        });
      },
    });
  }

  back() {
    this.location.back();
  }
  refresh() {
    this.branchForm.reset();
    this.loadData();
  }
}
