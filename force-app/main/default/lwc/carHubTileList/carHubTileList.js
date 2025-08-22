import { LightningElement, wire } from "lwc";
import {
  publish,
  subscribe,
  unsubscribe,
  MessageContext
} from "lightning/messageService";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import getCars from "@salesforce/apex/CarsController.getCars";
import CARHUB_FILTERS_CHANNEL from "@salesforce/messageChannel/carHubFilters__c";
import CARHUB_DETAILS_CHANNEL from "@salesforce/messageChannel/carHubDetails__c";

export default class CarHubTileList extends LightningElement {
  // State: only essential properties
  subscription = null;
  filters = {
    searchInputValue: "",
    carPrice: 999999,
    selectedCategories: [],
    selectedBrands: []
  };
  cars = [];
  isLoading = true; // Tracks loading state for spinner
  noCars = false; // To control the "No cars found" message

  // Wire MessageContext for LMS
  @wire(MessageContext)
  context;

  // Subscribe to filter updates
  connectedCallback() {
    if (!this.subscription) {
      this.subscription = subscribe(
        this.context,
        CARHUB_FILTERS_CHANNEL,
        (data) => {
          this.handleFilterUpdate(data);
        }
      );
    }
  }

  // Clean up subscription
  disconnectedCallback() {
    unsubscribe(this.subscription);
    this.subscription = null;
  }

  // Fetch cars with reactive filters
  @wire(getCars, { filters: "$filters" })
  wiredCars({ data, error }) {
    // this.isLoading = false; // Hide spinner when call completes
    if (data) {
      this.noCars = data.length ? false : true;
      this.cars = data.map((car) => ({
        ...car,
        Name: car.Name ? car.Name.toUpperCase() : "N/A",
        MSRP__c:
          car.MSRP__c != null
            ? new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD"
              }).format(car.MSRP__c)
            : "N/A"
      }));
    } else if (error) {
      this.cars = [];
      this.noCars = true;
      this.showToast("Error", "Failed to load cars", "error");
    }
    this.isLoading = false;
  }

  // Update filters from LMS
  handleFilterUpdate(data) {
    this.isLoading = true; // Show spinner before fetching new data
    this.filters = { ...data };
  }

  // Publish recordId to details component
  handleCarClicked(e) {
    publish(this.context, CARHUB_DETAILS_CHANNEL, { recordId: e.detail.Id });
  }

  // Show toast for errors
  showToast(title, message, variant) {
    this.dispatchEvent(new ShowToastEvent({ title, message, variant }));
  }
}
