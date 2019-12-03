import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { UUID } from 'angular2-uuid';
import { BRITISH_COLUMBIA, CommonLogEvents, CommonLogMessage, CommonImage } from 'moh-common-lib';
import { convertToJSONDate, stripPhoneFormatting, stripPostalCodeSpaces } from '../../core-bcp/models/helperFunc';
import { BaseResponse, ReturnCodes } from '../models/create-facility-api-model';



@Injectable({
  providedIn: 'root'
})
export class CreateFacilityDataService {

  //#endregion

  constructor() {
    if (environment.bypassModal) {
      this.informationCollectionNoticeConsent = true;
    }

    if (environment.useDummyData) {
      // Name and PracNumber will pass backend validation in TEST
      this.facAdminFirstName = 'TEST';
      this.facAdminLastName = 'PRIVATEPRACTICE';
      this.pracNumber = '89902';
      // this.emailAddress = 'test@privatepractice.com'; // optional field
      this.facAdminPhoneNumber = '(222) 222-2221';

      // Following code is as per directions by Adam ref:bcp-68 18/10/2019 10:40AM
      // facility
      this.facInfoFacilityName = 'TODS OF FACILITY';
      this.facInfoPhysicalAddress = '12345 Douglas Street';
      this.facInfoCity = 'Victoria';
      this.facInfoProvince = 'BC';
      this.facInfoPostalCode = 'V8R3C2';
      // this.facInfoPhoneNumber = '(250) 555-1234';
      // this.facInfoPhoneExtension = '444'
      // this.facInfoFaxNumber = '(222) 222-2222'; // optional field
      this.facInfoEffectiveDate = new Date(2020, 0, 10);

      this.facInfoIsSameMailingAddress = true;
      this.facInfoIsQualifyForBCP = true;
      // mailing info
      this.facInfoMailAddress = '12345 Carson Street';
      this.facInfoMailCity = 'Victoria';
      this.facInfoMailProvince = 'BC'; // 'British Columbia';
      this.facInfoMailPostalCode = 'V8J 8J8';

      // Review page
      this.dateOfDeclaration = new Date();
    }
  }

  // Response from Middleware for final request
  requestResponse: any = null;

  //#region Create Facility

  applicationUUID: string = UUID.UUID();

  // Home
  informationCollectionNoticeConsent: boolean;
  // Facility Administrator
  facAdminFirstName: string;
  facAdminLastName: string;
  pracNumber = '';
  emailAddress: string; // optional field
  facAdminPhoneNumber: string;
  facAdminExtension: string;

  // Following code is as per directions by Adam ref:bcp-68 18/10/2019 10:40AM
  // facility info
  facInfoFacilityName: string;
  facInfoPhysicalAddress: string;
  facInfoCity: string;
  facInfoProvince: string = BRITISH_COLUMBIA;
  facInfoPostalCode: string;
  facInfoFaxNumber: string;
  facInfoEffectiveDate: Date;
  facInfoIsSameMailingAddress: boolean | null = null;
  facInfoIsQualifyForBCP: boolean;

  // mailing info
  facInfoMailAddress: string;
  facInfoMailCity: string;
  facInfoMailProvince: string = BRITISH_COLUMBIA;
  facInfoMailPostalCode: string;

  // review page
  dateOfDeclaration: Date;

  // API responses
  apiDuplicateWarning: boolean = false;

  dateOfAcceptance: Date = null;
  dateOfSubmission: Date = null;

  validateFacilityMessage: string;

  /* Used to switch review contents to a view to be printed (i.e. no edit icons,
   *  or grey background)
   */
  isPrintView: boolean = false;

  // TODO: Figure out where this variable is used
  json: any;

  signature: CommonImage;

  //#endregion

  //#region Validation

  // Response from Middleware for final request

  jsonApplicantValidation = {
    request: null,
    response: null
  };

  jsonFacilityValidation = {
    request: null,
    response: null
  };

  jsonCreateFacility = {
    request: null,
    response: null
  };

  //#region JSON Payload

  getJSONPayload() {

    const jsonPayLoad: any = {
      informationConsentAgreement: this.informationCollectionNoticeConsent,
      administrator: {
        firstName: this.facAdminFirstName,
        lastName: this.facAdminLastName,
        pracNumber: this.pracNumber,
        email: this.emailAddress ? this.emailAddress : null,
        phoneNumber: stripPhoneFormatting( this.facAdminPhoneNumber )
      },
      facility: {
        name: this.facInfoFacilityName,
        address: this.facInfoPhysicalAddress,
        city: this.facInfoCity,
        postalCode: stripPostalCodeSpaces(this.facInfoPostalCode),
        faxNumber: stripPhoneFormatting(this.facInfoFaxNumber),
        province: this.facInfoProvince,
        effectiveDate: convertToJSONDate(this.facInfoEffectiveDate), // "2020-11-10",
        qualifiesForBCP: this.facInfoIsQualifyForBCP,
      },
      // TODO: Should this be a constant somewhere?  I assume that is this on a page somewhere and should be the same.
      declarationText: 'I understand that MSP is a public system based on trust, but also that my claims are subject to audit and financial recovery for claims contrary to the Medicare Protection Act (the “Act”). I undertake to not submit false or misleading claims information, and acknowledge that doing so is an offence under the Act and may be an offence under the Criminal Code of Canada. Further, I agree that I will meet the requirements of the Act and related Payment Schedule regarding claims for payment, including that prior to submitting a claim, I must create: (a) an adequate medical record, if I am a medical practitioner; or (b) an adequate clinical record, if I am a health care practitioner.',
      dateOfAcceptance: convertToJSONDate(this.dateOfAcceptance),
      // TODO : that should be from validation - for happy path it fixed to EXACT Match temporariliy
      validateFacilityMessage: this.validateFacilityMessage
    };

    if (this.facAdminExtension && this.facAdminExtension.length > 0) {
      jsonPayLoad.administrator.extension = this.facAdminExtension;
    }

    if (this.facInfoIsSameMailingAddress === false) {
      jsonPayLoad.facility.mailingAddress = {
        address: this.facInfoMailAddress ? this.facInfoMailAddress : this.facInfoPhysicalAddress,
        city: this.facInfoMailCity ? this.facInfoMailCity : this.facInfoCity,
        province: this.facInfoMailProvince ? this.facInfoMailProvince : this.facInfoProvince,
        postalCode: this.facInfoMailPostalCode ? stripPostalCodeSpaces(this.facInfoMailPostalCode) :
        stripPostalCodeSpaces(this.facInfoPostalCode),
      };
    }

    return jsonPayLoad;
  }

  //#region Validation

   getSubmissionLogObject<T extends BaseResponse>(requestType: string, res: T ): CommonLogMessage {
    return {
      event: CommonLogEvents.submission,
      request: requestType,
      success: res.returnCode === ReturnCodes.SUCCESS || res.returnCode === ReturnCodes.WARNING,
      response: res
    };
  }
}
