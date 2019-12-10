import { Component, OnInit, ViewChild } from '@angular/core';
import { ReviewContainerComponent } from 'src/app/modules/core-bcp/components/review-container/review-container.component';
import { CreatePractitionerDataService } from '../../../services/create-practitioner-data.service';
import { PRACTITIONER_REGISTRATION_PAGES } from '../../../practitioner-registration-route-constants';

@Component({
  selector: 'bcp-review-practitioner-facility',
  templateUrl: './review-practitioner-facility.component.html',
  styleUrls: ['./review-practitioner-facility.component.scss']
})
export class ReviewPractitionerFacilityComponent implements OnInit {
  @ViewChild(ReviewContainerComponent, { static: true })
  review: ReviewContainerComponent;

  constructor(public dataService: CreatePractitionerDataService) { }

  ngOnInit() {
    this.reviewItems();
  }

  reviewItems() {
    //this.review.displayPrintView = this.dataService.isPrintView;
    this.review.redirectPath = PRACTITIONER_REGISTRATION_PAGES.FACILITY_INFO.fullpath;
    this.review.header = PRACTITIONER_REGISTRATION_PAGES.FACILITY_INFO.title;

    const items = [
      [
        { label: 'Facility name', value: this.dataService.pracFacilityName },
        { label: 'Medical Services Plan facility number', value: this.dataService.pracFacilityNumber },
        { label: 'Address', value: this.dataService.pracFacilityAddress },
        { label: 'City', value: this.dataService.pracFacilityCity },
        { label: 'Province', value: this.dataService.pracFacilityProvince },
        { label: 'Postal code', value: this.dataService.pracFacilityPostalCode },
        { label: 'Fax number (optional)', value: this.dataService.pracFacilityFax }
        
      ],
    ];
    this.review.sectionItems = items;
  }

}