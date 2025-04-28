import { AfterContentInit, Component, OnDestroy, OnInit } from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router } from '@angular/router';
import { faSave, faRefresh } from '@fortawesome/free-solid-svg-icons';
import { Subject } from 'rxjs';
import { LayoutService } from '../../../../layout/services/layout.service';
import { BranchService } from '../../services/branch.service';
import { MessageService } from 'primeng/api';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { FcActionBarComponent } from '../../../../shared/components/fc-action-bar/fc-action-bar.component';
import { FcInputTextComponent } from '../../../../shared/components/fc-input-text/fc-input-text.component';
import { FcTextareaComponent } from '../../../../shared/components/fc-textarea/fc-textarea.component';
import { ButtonModule } from 'primeng/button';
import { FcInputTelComponent } from '../../../../shared/components/fc-input-tel/fc-input-tel.component';
import { PureAbility } from '@casl/ability';

@Component({
  selector: 'app-branch-add',
  imports: [
    CommonModule,
    FontAwesomeModule,
    FcActionBarComponent,
    FcInputTextComponent,
    FcTextareaComponent,
    ButtonModule,
    FormsModule,
    ReactiveFormsModule,
    FcInputTelComponent,
  ],
  templateUrl: './branch-add.component.html',
  styleUrl: './branch-add.component.css',
})
export class BranchAddComponent implements OnInit, OnDestroy, AfterContentInit {
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
  filterButtons: any[] = [
    {
      label: '',
      icon: faRefresh,

      action: () => {},
    },
  ];

  branchForm: FormGroup;
  loading = false;

  constructor(
    private layoutService: LayoutService,
    private branchService: BranchService,
    private messageService: MessageService,
    private router: Router,
    private ability: PureAbility,
  ) {
    this.actionButtons[0].hidden = !this.ability.can('create', 'branch');
    this.layoutService.setHeaderConfig({
      title: 'Add Branch',
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
    this.layoutService.setSearchConfig({ hide: true });
  }

  ngAfterContentInit(): void {}
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.layoutService.setSearchConfig({ hide: false });
  }

  submit() {
    if (this.branchForm.valid) {
      this.actionButtons[0].loading = true;
      this.branchService.addBranch(this.branchForm.value).subscribe({
        next: (res: any) => {
          this.router.navigate(['/branch/view/', res.data.id]);
          this.actionButtons[0].loading = false;
          this.messageService.add({
            severity: 'success',
            summary: 'Branch',
            detail: 'successfully add branch',
          });
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
    } else {
      // Toast
      this.messageService.add({
        summary: 'Branch',
        detail: 'Fill the form first!',
        // lottieOption: {
        //   path: '/assets/lotties/warning.json',
        //   loop: false,
        // },
      });
    }
  }
}
