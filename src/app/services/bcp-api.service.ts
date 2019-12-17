import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { AbstractHttpService, CommonImage } from 'moh-common-lib';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { SplunkLoggerService } from './splunk-logger.service';
import { BCPDocumentTypes } from '../modules/core-bcp/models/documentTypes';
import { BaseDataService } from './base-data.service';

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
              protected logger: SplunkLoggerService,
              protected dataService: BaseDataService) {
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

  protected uploadSignature(attachment: CommonImage<BCPDocumentTypes>, applicationUUID) {
    let url = `${environment.api.attachment}/${applicationUUID}/attachments/${attachment.uuid}`;

    url += `?attachmentdocumenttype=SIGNATURE&programArea=CLAIMS&contentType=1`;

    return this.uploadAttachment(url, attachment);
  }

}
