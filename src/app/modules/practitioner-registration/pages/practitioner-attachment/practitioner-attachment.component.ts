import { Component, OnInit, AfterViewInit } from '@angular/core';
import { PRACTITIONER_REGISTRATION_PAGES } from '../../practitioner-registration-route-constants';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ContainerService, PageStateService } from 'moh-common-lib';
import { BcpBaseForm } from '../../../core-bcp/models/bcp-base-form';
import { PRACTITIONER_ATTACHMENT } from '../../models/practitioner-attachment';
import { IRadioItems } from 'moh-common-lib/lib/components/radio/radio.component';
import { RegisterPractitionerDataService } from '../../services/register-practitioner-data.service';

interface BaseFormGroup {
  attachmentType: any;
}

interface NewFormGroup extends BaseFormGroup {
  newAttachmentType: any;
  newAttachmentEffectiveDate?: any;
  newAttachmentCancelDate?: any;
}

interface CancelFormGroup extends BaseFormGroup {
  cancelAttachmentDate: any;
}

interface ChangeFormGroup extends BaseFormGroup {
  changeAttachmentEffectiveDate: any;
  changeAttachmentCancelDate: any;
}

@Component({
  selector: 'bcp-practitioner-attachment',
  templateUrl: './practitioner-attachment.component.html',
  styleUrls: ['./practitioner-attachment.component.scss']
})
export class PractitionerAttachmentComponent extends BcpBaseForm implements OnInit, AfterViewInit {

  pageTitle: string = 'Practitioner Attachment';
  formGroup: FormGroup;
  radioItems: Array<IRadioItems>;
  sameMailAddrError: boolean = false;

  constructor( protected containerService: ContainerService,
               protected router: Router,
               protected pageStateService: PageStateService,
               private fb: FormBuilder,
               public dataService: RegisterPractitionerDataService ) {
    super(router, containerService, pageStateService);
  }

  ngOnInit() {
    super.ngOnInit();

    this.radioItems = [
      {
        label: PRACTITIONER_ATTACHMENT.NEW.label,
        value: PRACTITIONER_ATTACHMENT.NEW.value,
      },
      {
        label: PRACTITIONER_ATTACHMENT.CANCEL.label,
        value: PRACTITIONER_ATTACHMENT.CANCEL.value,
      },
      {
        label: PRACTITIONER_ATTACHMENT.CHANGE.label,
        value: PRACTITIONER_ATTACHMENT.CHANGE.value,
      },
    ];

    this.initValidators();
  }

  ngAfterViewInit() {
    super.ngAfterViewInit();
    this.listenForChanges();
  }

  listenForChanges() {
    if (!this.formGroup) {
      return;
    }
    this.formGroup.valueChanges.subscribe( value => {
      // Update data service values
      this.dataService.pracAttachmentType = value.attachmentType;
      this.dataService.pracNewAttachmentType = value.newAttachmentType;
      this.dataService.pracNewAttachmentEffectiveDate = value.newAttachmentEffectiveDate;
      this.dataService.pracNewAttachmentCancelDate = value.newAttachmentCancelDate;
      this.dataService.pracCancelAttachmentDate = value.cancelAttachmentDate;
      this.dataService.pracChangeAttachmentEffectiveDate = value.changeAttachmentEffectiveDate;
      this.dataService.pracChangeAttachmentCancelDate = value.changeAttachmentCancelDate;
    });
  }

  initValidators() {
    switch (this.dataService.pracAttachmentType) {
      case PRACTITIONER_ATTACHMENT.NEW.value:
        this.formGroup = this.getFormGroupForNew();
        break;

      case PRACTITIONER_ATTACHMENT.CANCEL.value:
        this.formGroup = this.getFormGroupForCancel();
        break;

      case PRACTITIONER_ATTACHMENT.CHANGE.value:
        this.formGroup = this.getFormGroupForChange();
        break;

      default:
        this.formGroup = this.fb.group(this.getBaseFormGroup());
        break;
    }
  }

  private getBaseFormGroup(): BaseFormGroup {
    return {
      attachmentType: [this.dataService.pracAttachmentType, Validators.required]
    };
  }

  private getFormGroupForNew(): FormGroup {
    const formGroupObj: NewFormGroup = {
      ...this.getBaseFormGroup(),
      newAttachmentType: [this.dataService.pracNewAttachmentType, Validators.required]
    };

    if (this.dataService.pracNewAttachmentType === true || this.dataService.pracNewAttachmentType === false) {
      formGroupObj.newAttachmentEffectiveDate = [this.dataService.pracNewAttachmentEffectiveDate, Validators.required];
    }
    if (this.dataService.pracNewAttachmentType === true) {
      formGroupObj.newAttachmentCancelDate = [this.dataService.pracNewAttachmentCancelDate, Validators.required];
    }
    return this.fb.group(formGroupObj);
  }

  private getFormGroupForCancel(): FormGroup {
    const formGroupObj: CancelFormGroup = {
      ...this.getBaseFormGroup(),
      cancelAttachmentDate: [this.dataService.pracCancelAttachmentDate, Validators.required]
    };
    return this.fb.group(formGroupObj);
  }

  private getFormGroupForChange(): FormGroup {
    const formGroupObj: ChangeFormGroup = {
      ...this.getBaseFormGroup(),
      changeAttachmentEffectiveDate: [this.dataService.pracChangeAttachmentEffectiveDate],
      changeAttachmentCancelDate: [this.dataService.pracChangeAttachmentCancelDate],
    };
    return this.fb.group(formGroupObj);
  }

  continue() {
    this.markAllInputsTouched();

    console.log( 'Continue: Practitioner Assignment', this.formGroup);
    if (this.formGroup.valid) {
      this.navigate(PRACTITIONER_REGISTRATION_PAGES.REVIEW.fullpath);
    }
  }

  changeAttachmentType(value) {
    this.dataService.pracAttachmentType = value;
    this.initValidators();
    this.listenForChanges();
  }

  changeNewAttachmentType(value: boolean) {
    this.dataService.pracNewAttachmentType = value;
    this.initValidators();
    this.listenForChanges();
  }

  get shouldShowNewSection() {
    return this.dataService.pracAttachmentType === PRACTITIONER_ATTACHMENT.NEW.value;
  }

  get shouldShowCancelSection() {
    return this.dataService.pracAttachmentType === PRACTITIONER_ATTACHMENT.CANCEL.value;
  }

  get shouldShowChangeSection() {
    return this.dataService.pracAttachmentType === PRACTITIONER_ATTACHMENT.CHANGE.value;
  }
}