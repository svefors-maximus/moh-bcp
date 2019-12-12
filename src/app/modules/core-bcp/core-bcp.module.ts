import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedCoreModule } from 'moh-common-lib';
import { PractitionerNumberComponent } from './components/practitioner-number/practitioner-number.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ValidateFacilityNumberDirective } from './components/facility-number/validate-facility-number.directive';
import { ValidatePractitionerNumberDirective } from './components/practitioner-number/validate-practitioner-number.directive';
import { ReviewContainerComponent } from './components/review-container/review-container.component';
import { SignaturePadModule } from 'angular2-signaturepad';
import { SignatureComponent } from './components/signature/signature.component';
import { ModalModule } from 'ngx-bootstrap';
import { CorePractitionerInfoComponent } from './components/core-practitioner-info/core-practitioner-info.component';
import { CoreFacilityInfoComponent } from './components/core-facility-info/core-facility-info.component';
import { CoreConsentModalComponent } from './components/core-consent-modal/core-consent-modal.component';
import { CaptchaModule } from 'moh-common-lib/captcha';
import { FacilityNumberComponent } from './components/facility-number/facility-number.component';

const exportables = [
  CoreFacilityInfoComponent,
  CorePractitionerInfoComponent,
  CoreConsentModalComponent,
  FacilityNumberComponent,
  PractitionerNumberComponent,
  ValidateFacilityNumberDirective,
  ValidatePractitionerNumberDirective,
  ReviewContainerComponent,
  SignatureComponent
];

@NgModule({
  declarations: [...exportables],
  imports: [
    CaptchaModule,
    CommonModule,
    SharedCoreModule,
    FormsModule,
    SignaturePadModule,
    ModalModule.forRoot(),
    ReactiveFormsModule,
  ],
  exports: [
    SharedCoreModule,
    ...exportables
  ]
})
export class CoreBCPModule { }
