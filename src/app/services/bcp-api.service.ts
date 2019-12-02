import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { AbstractHttpService, CommonImage } from 'moh-common-lib';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { SplunkLoggerService } from './splunk-logger.service';
import { ValidatePractitionerRequest, PractitionerValidationPartial, FacilityValidationPartial } from '../modules/create-facility/models/create-facility-api-model';
import { CreateFacilityDataService } from '../modules/create-facility/services/create-facility-data.service';
import { flatMap, catchError } from 'rxjs/operators';

// TODO: Type Requests
// TODO: Type responses
// TODO: Splunk logging for requests

@Injectable({
  providedIn: 'root'
})
export class BCPApiService extends AbstractHttpService {

  protected _headers: HttpHeaders;

  hasToken = false;
  baseUrl = environment.api.base;

  // Do NOT add data-services here.  It should be passed data as parameters, and not require services.
  constructor(protected http: HttpClient,
              private logger: SplunkLoggerService,
              private dataService: CreateFacilityDataService) {
    super(http);
  }

  protected handleError(error: HttpErrorResponse) {
    this.logger.logHttpError(error);

    // TODO: Improve / reduce logging here once done development.
    console.log('BCP API ERRROR', error);
    throw new Error('BCP API Error');
  }

  setToken(token: string) {

    this._headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Response-Type': 'application/json',
      'X-Authorization': 'Bearer ' + token
    });
    this.hasToken = true;
  }

  validatePractitioner(practitioner: PractitionerValidationPartial, applicationUUID) {
    const payload: ValidatePractitionerRequest = {
      practitioner,
      requestUUID: this.generateUUID(),
      applicationUUID
    };
    this.dataService.jsonApplicantValidation.request = payload;

    const url = `${this.baseUrl}/validatePractitioner`;


    return this.post(url, payload);
  }

  validateFacility(facility: FacilityValidationPartial, applicationUUID: string) {
    const payload = {
      facility,
      requestUUID: this.generateUUID(),
      applicationUUID
    };

    this.dataService.jsonFacilityValidation.request = payload;

    const url = `${this.baseUrl}/validateFacility`;


    return this.post(url, payload);
  }


  /**
   * Creates a facility, uploading attachments and then JSON
   * @param jsonPayLoad Payload to submit
   * @param signature Consent signature
   * @param applicationUUID Shared UUID to use across requests.
   */
  createFacility(jsonPayLoad, signature: CommonImage, applicationUUID) {
    return this.uploadSignature(signature, applicationUUID)
      .pipe(
        flatMap(attachRes => this.submitFacilityJson(jsonPayLoad, applicationUUID)),
        catchError(this.handleError.bind(this))
      );
  }

  private submitFacilityJson(jsonPayLoad: any, applicationUUID: string) {
    const requestUUID = this.generateUUID();
    const payload = {
      createFacilitySubmission: jsonPayLoad,
      requestUUID,
      applicationUUID
    };

    this.dataService.jsonCreateFacility.request = payload;

    const url = `${this.baseUrl}/createFacility`;
    return this.post(url, payload);
  }

  private uploadSignature(attachment: CommonImage, applicationUUID) {
    let url = `${environment.api.attachment}/${applicationUUID}/attachments/${attachment.uuid}`;

    // TODO: Make non-hardcoded.
    url += `?attachmentdocumenttype=SIGNATURE&programArea=CLAIMS&contentType=1`;

    return this.uploadAttachment(url, attachment);
  }


  // TODO: Move this into Common lib?
  // TODO: REMOVE
  // private uploadAttachmentOld(attachment: CommonImage, applicationUUID) {
  //   let url = `${environment.api.attachment}/${applicationUUID}/attachments/${attachment.uuid}`;

  //   // TODO: Make non-hardcoded.
  //   url += `?attachmentdocumenttype=SIGNATURE&programArea=CLAIMS&contentType=1`;

  //   const options = {headers: this._headers, responseType: 'text' as 'text'};

  //   const binary = atob(attachment.fileContent.split(',')[1]);
  //   const array = [];
  //   for (let i = 0; i < binary.length; i++) {
  //       array.push(binary.charCodeAt(i));
  //   }
  //   const blob = new Blob([new Uint8Array(array)], {type: attachment.contentType});

  //   return this.http.post(url, blob, options);
  // }

}
