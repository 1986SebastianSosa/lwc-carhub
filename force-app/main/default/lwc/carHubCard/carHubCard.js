import { LightningElement, wire } from "lwc";
import CARHUB_DETAILS_CHANNEL from "@salesforce/messageChannel/carHubDetails__c";
import {
  subscribe,
  MessageContext,
  unsubscribe
} from "lightning/messageService";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { getRecord } from "lightning/uiRecordApi";
import { NavigationMixin } from "lightning/navigation";
import ID_FIELD from "@salesforce/schema/Car__c.Id";
import NAME_FIELD from "@salesforce/schema/Car__c.Name";
import BRAND_FIELD from "@salesforce/schema/Car__c.Brand__c";
import CATEGORY_FIELD from "@salesforce/schema/Car__c.Category__c";
import CONTROL_FIELD from "@salesforce/schema/Car__c.Control__c";
import DESCRIPTION_FIELD from "@salesforce/schema/Car__c.Description__c";
import NUMBER_OF_SEATS_FIELD from "@salesforce/schema/Car__c.Number_of_Seats__c";
import PICTURE_URL from "@salesforce/schema/Car__c.Picture_URL__c";

const FIELDS = [
  ID_FIELD,
  NAME_FIELD,
  BRAND_FIELD,
  CATEGORY_FIELD,
  CONTROL_FIELD,
  DESCRIPTION_FIELD,
  NUMBER_OF_SEATS_FIELD,
  PICTURE_URL
];

export default class CarHubCard extends NavigationMixin(LightningElement) {
  // State: essential properties
  subscription = null;
  recordId = "";
  objectApiName = "Car__c";
  isLoading = false; // Tracks loading state for spinner
  pictureURL;
  carName;

  // Wire MessageContext for LMS
  @wire(MessageContext)
  context;

  // Subscribe to car selection
  connectedCallback() {
    if (!this.subscription) {
      this.subscription = subscribe(
        this.context,
        CARHUB_DETAILS_CHANNEL,
        (data) => {
          this.isLoading = true; // Show spinner on new recordId
          this.recordId = data.recordId;
        }
      );
    }
  }

  // Clean up subscription
  disconnectedCallback() {
    unsubscribe(this.subscription);
    this.subscription = null;
  }

  // Fetch car record
  @wire(getRecord, { recordId: "$recordId", fields: FIELDS })
  wiredCar({ data, error }) {
    this.isLoading = false;
    if (data) {
      this.carName = data.fields.Name.value;
      this.pictureURL = data.fields.Picture_URL__c.value;
    } else if (error) {
      this.showToast(
        "Error",
        "Failed to load car details. Check permissions or record ID.",
        "error"
      );
    }
  }

  // Navigate to record page
  handleNavigateToCarRecord() {
    this[NavigationMixin.Navigate]({
      type: "standard__recordPage",
      attributes: {
        recordId: this.recordId,
        objectApiName: this.objectApiName,
        actionName: "view"
      }
    });
  }

  // Show toast for errors
  showToast(title, message, variant) {
    this.dispatchEvent(new ShowToastEvent({ title, message, variant }));
  }
}
