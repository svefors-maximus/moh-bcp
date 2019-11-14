import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CreateFacilityForm } from '../../models/create-facility-form';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { cCreateFacilityValidators, validMultiFormControl } from '../../models/validators';
import { CheckCompleteBaseService, Address, getProvinceDescription } from 'moh-common-lib';
import { CreateFacilityDataService } from '../../services/create-facility-data.service';
import { BCPApiService } from '../../../../services/bcp-api.service';
import { ValidationResponse, ReturnCodes } from '../../models/create-facility-api-model';

@Component({
  selector: 'app-facility-info',
  templateUrl: './facility-info.component.html',
  styleUrls: ['./facility-info.component.scss']
})
export class FacilityInfoComponent extends CreateFacilityForm implements OnInit {

  constructor(
    protected router: Router,
    private pageCheckService: CheckCompleteBaseService,
    public dataService: CreateFacilityDataService,
    private fb: FormBuilder,
    private api: BCPApiService,
    private cdr: ChangeDetectorRef,
  ) {
    super(router);
    this.validFormControl = validMultiFormControl;
  }

  showMailingAddress: boolean = false;
  facilityForm: FormGroup;
  mailingForm: FormGroup;

  validFormControl: (fg: FormGroup, name: string) => boolean;
  json: (formValues: any) => any;
  physicalAddress: any = null;

  mailingAddress: any = null;

  ngOnInit() {
    this.facilityForm = this.initialize();
    this.updateMailingValidity(this.dataService.facInfoIsSameMailingAddress);
  }

  private initialize() {
    const form = this.fb.group({
      facilityName: [
        this.dataService.facInfoFacilityName,
        cCreateFacilityValidators.facilityDetail.facilityName,
      ],
      address: [this.dataService.facInfoPhysicalAddress, cCreateFacilityValidators.address.streetAddress],
      city: [this.dataService.facInfoCity, cCreateFacilityValidators.address.city],
     //  province: [{value: this.dataService.facInfoProvince, disabled: true}],
      postalCode: [this.dataService.facInfoPostalCode, cCreateFacilityValidators.address.postalCode],

      // Phone number and extensions has been removed
      // phoneNumber: [this.dataService.facInfoPhoneNumber, cCreateFacilityValidators.facilityDetail.phoneNumber],
      // phoneExtension: [this.dataService.facInfoPhoneExtension],

      faxNumber: [this.dataService.facInfoFaxNumber],
      isSameMailingAddress: [this.dataService.facInfoIsSameMailingAddress, cCreateFacilityValidators.facilityDetail.isSameMailingAddress],
      isQualifyForBCP: [this.dataService.facInfoIsQualifyForBCP, cCreateFacilityValidators.facilityDetail.isQualifyForBCP],

      // effectiveDate: [this.getEffectiveDateInCommonDateFormat, cCreateFacilityValidators.facilityDetail.effectiveDate],
      // common-date gives error if we provide date in simpledate format for initialization, changinging to null
      // effectiveDate: [null, cCreateFacilityValidators.facilityDetail.effectiveDate],
      effectiveDate: [this.dataService.facInfoEffectiveDate, cCreateFacilityValidators.facilityDetail.effectiveDate],
      // effectiveDate: [new Date()],



      mailingAddress: [this.dataService.facInfoMailAddress, cCreateFacilityValidators.address.streetAddress],
      mailingCity: [this.dataService.facInfoMailCity, cCreateFacilityValidators.address.city],
     // mailingProvince: [{value: this.dataService.facInfoMailProvince, disabled: true}],
      mailingPostalCode: [this.dataService.facInfoMailPostalCode, cCreateFacilityValidators.address.postalCode],

    });

    form.get('isSameMailingAddress').valueChanges.subscribe(
      value => this.updateMailingValidity(value)
    );

    form.get('address').valueChanges.subscribe(
      value => {
        console.log('%c ADDRESS changed: %o', 'color:red', value);
        if (!value) {
          this.physicalAddress = null;
          this.dataService.facInfoPhysicalAddress = null;
        }
      }
    );

    form.get('mailingAddress').valueChanges.subscribe(
      value => {
        console.log('%c ADDRESS changed: %o', 'color:red', value);
        if (!value) {
          this.mailingAddress = null;
          this.dataService.facInfoMailAddress = null;
        }
      }
    );

    this.showMailingAddress = this.dataService.facInfoIsSameMailingAddress ? !this.dataService.facInfoIsSameMailingAddress : false;
    this.physicalAddress = { addressLine1: this.dataService.facInfoPhysicalAddress };
    this.mailingAddress = { addressLine1: this.dataService.facInfoMailAddress };
    return form;
  }

  //#region Mailing Address update data service effective date
  // following code intentionally kept simple for maintenance

  // public get getEffectiveDateInCommonDateFormat(): SimpleDate {

  //   // issue with common-date. It does not set the common-date at all, in simpledate or initialization
  //   // ref: bcp-16 #comment-24615
  //   // https://github.com/bcgov/moh-common-styles/blob/master/projects/common/lib/models/simple-date.interface.ts
  //   // https://github.com/bcgov/moh-common-styles/blob/master/projects/common/lib/components/date/date.component.ts

  //   // tbr
  //   const date = this.dataService.facInfoEffectiveDate? this.dataService.facInfoEffectiveDate : new Date();

  //   const commonDateFormat = {
  //     day: date.getDay(),
  //     month: date.getMonth(),
  //     year: date.getFullYear(),
  //   }
  //   return commonDateFormat;
  // }

  updateMailingValidity(isRequired: boolean | null): void {
    const address = this.facilityForm.get('mailingAddress');
    const city = this.facilityForm.get('mailingCity');
    // const province = this.facilityForm.get('mailingProvince'); read only field
    const postalCode = this.facilityForm.get('mailingPostalCode');
    if (!isRequired) {
      address.setValidators(Validators.required);
      city.setValidators(Validators.required);
      // province.setValidators(Validators.required); read only field
      postalCode.setValidators(Validators.required);
    } else {
      address.clearValidators();
      city.clearValidators();
      // province.clearValidators(); - read only field
      postalCode.clearValidators();

      address.patchValue(null);
      city.patchValue(null);
      postalCode.patchValue(null);
    }

    address.updateValueAndValidity();
    city.updateValueAndValidity();
    // province.updateValueAndValidity(); read only field
    postalCode.updateValueAndValidity();

    this.showMailingAddress = !(isRequired === null) ? !isRequired : false;
    this.facilityForm.updateValueAndValidity({ onlySelf: false });
  }

  updateDataService() {
    // As per direction  to use dataservice for state ref:bcp-68 bcp-69 comments

    const fd = this.facilityForm.value;
    this.dataService.facInfoFacilityName = fd.facilityName;
    this.dataService.facInfoPhysicalAddress = this.physicalAddress ? this.physicalAddress.addressLine1 : fd.address;
    this.dataService.facInfoCity = fd.city;
    // this.dataService.facInfoProvince = fd.province;
    this.dataService.facInfoPostalCode = fd.postalCode;
    this.dataService.facInfoFaxNumber = fd.faxNumber;
    this.dataService.facInfoIsSameMailingAddress = fd.isSameMailingAddress;
    this.dataService.facInfoIsQualifyForBCP = fd.isQualifyForBCP;
    this.dataService.facInfoEffectiveDate = fd.effectiveDate;

    this.dataService.facInfoMailAddress = this.mailingAddress ? this.mailingAddress.addressLine1 : fd.mailingAddress;
    this.dataService.facInfoMailCity = fd.mailingCity;
    // this.dataService.facInfoMailProvince = fd.mailingProvince;
    this.dataService.facInfoMailPostalCode = fd.mailingPostalCode;
  }

  //#region

  continue() {
    this.updateDataService();


    // todo: fix common-components issues
    this.facilityForm.markAllAsTouched();
    // this.markAllInputsTouched();
    if (this.facilityForm.valid) {
      this.loading = true;

      this.api.validateFacility({
        facilityName: this.dataService.facInfoFacilityName,
        // API expects postalCode without any spaces in it
        postalCode: this.dataService.facInfoPostalCode.replace(' ', '')
      }, this.dataService.applicationUUID)
        .subscribe((res: ValidationResponse) => {
          this.dataService.jsonFacilityValidation.response = res;

          if (res.returnCode === ReturnCodes.SUCCESS) {
            this.handleAPIValidation(true);
          } else if (res.returnCode === ReturnCodes.WARNING || res.returnCode === ReturnCodes.FAILURE) {
            // we treat near match or exact match the same
            this.handleAPIValidation(false);
          }
          this.dataService.validateFacilityMessage = res.message;
          this.navigate('register-facility/review');
          // TODO: Handle failure case, e.g. no backend, failed request, etc.
        });
    }
  }
  physicalAddressSelected(address: Address) {
    console.log(address);
    this.facilityForm.patchValue({
      address: address.addressLine1,
      city: address.city
    });

    this.dataService.facInfoPhysicalAddress = address.addressLine1;
    this.dataService.facInfoCity = address.city;
    this.physicalAddress = address;
  }
  mailingAddressSelected(address: Address) {
    // console.log('%c ADDRESS: %o', 'color:red', address);
    this.facilityForm.patchValue({
      mailingAddress: address.addressLine1,
      mailingCity: address.city
    });
    this.dataService.facInfoMailAddress = address.addressLine1;
    this.dataService.facInfoMailCity = address.city;
    this.mailingAddress = address;
  }


  handleAPIValidation(isValid: boolean) {
    this.loading = false;
    this.cdr.detectChanges();
    this.dataService.apiDuplicateWarning = !isValid;
    if (isValid) {
      this.pageCheckService.setPageComplete();
    } else {
      this.pageCheckService.setPageIncomplete();
    }

  }

  // Read-only fields
  get facInfoProvince() {
    return getProvinceDescription(this.dataService.facInfoProvince);
  }

  get facInfoMailProvince() {
    return getProvinceDescription(this.dataService.facInfoMailProvince);
  }
}
