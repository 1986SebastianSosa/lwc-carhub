import { getRecord } from "lightning/uiRecordApi";
import { api, LightningElement, wire } from "lwc";
import { NavigationMixin } from "lightning/navigation";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import BRAND_FIELD from "@salesforce/schema/Car__c.Brand__c";
import getSimilarCars from "@salesforce/apex/CarsController.getSimilarCars";

export default class CarHubSimilarCars extends NavigationMixin(
  LightningElement
) {
  // State: essential properties
  @api recordId;
  similarCars = [];
  isLoading = true; // Tracks loading state for spinner

  // Fetch brand for the current car
  @wire(getRecord, { recordId: "$recordId", fields: BRAND_FIELD })
  wiredCar({ error, data }) {
    if (data && data.fields?.Brand__c?.value) {
      this.similarCarsService(this.recordId, data.fields.Brand__c.value);
    }
    if (error) {
      this.isLoading = false;
      this.showToast("Error", "Failed to load car brand", "error");
    }
  }

  // Fetch similar cars from Apex
  async similarCarsService(id, brand) {
    try {
      const similarCars = await getSimilarCars({ id, brand });
      this.similarCars = similarCars.map((item) => ({
        ...item,
        Name: item.Name ? item.Name.toUpperCase() : "N/A",
        MSRP__c:
          item.MSRP__c != null
            ? new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD"
              }).format(item.MSRP__c)
            : "N/A"
      }));
    } catch (error) {
      this.similarCars = [];
      this.showToast("Error", "Failed to load similar cars", "error");
    } finally {
      this.isLoading = false; // Hide spinner
    }
  }

  // Navigate to similar car record page
  handleNavigateToSimilarCarRecord(e) {
    this[NavigationMixin.Navigate]({
      type: "standard__recordPage",
      attributes: {
        recordId: e.currentTarget.dataset.id,
        objectApiName: "Car__c",
        actionName: "view"
      }
    });
  }

  // Show toast for errors
  showToast(title, message, variant) {
    this.dispatchEvent(new ShowToastEvent({ title, message, variant }));
  }
}
