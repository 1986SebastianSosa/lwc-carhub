/* eslint-disable @lwc/lwc/no-async-operation */
import { LightningElement, wire } from "lwc";
import { publish, MessageContext } from "lightning/messageService";
import { getObjectInfo, getPicklistValues } from "lightning/uiObjectInfoApi";
import CAR_OBJECT from "@salesforce/schema/Car__c";
import CATEGORY_FIELD from "@salesforce/schema/Car__c.Category__c";
import BRAND_FIELD from "@salesforce/schema/Car__c.Brand__c";
import CARHUB_FILTERS_CHANNEL from "@salesforce/messageChannel/carHubFilters__c";
import { ShowToastEvent } from "lightning/platformShowToastEvent";

export default class CarHubFilter extends LightningElement {
  // Initialize state properties with defaults to prevent undefined errors
  searchInputValue = "";
  carPrice = 999999; // Default max price
  selectedCategories = [];
  selectedBrands = [];
  carObjectId = "";
  categories = [];
  brands = [];
  timer = null; // Timer for debouncing input events

  // Wire MessageContext for LMS publishing
  @wire(MessageContext)
  context;

  // Getter for filters object to ensure reactivity and avoid manual updates
  get filters() {
    return {
      searchInputValue: this.searchInputValue || "",
      carPrice: this.carPrice != null ? Number(this.carPrice) : null,
      selectedCategories: Array.isArray(this.selectedCategories)
        ? [...this.selectedCategories]
        : [],
      selectedBrands: Array.isArray(this.selectedBrands)
        ? [...this.selectedBrands]
        : []
    };
  }

  // Fetch Car__c object metadata to get default record type ID
  @wire(getObjectInfo, { objectApiName: CAR_OBJECT })
  wiredCarObject({ error, data }) {
    if (data) {
      this.carObjectId = data.defaultRecordTypeId;
    } else if (error) {
      // Show user-friendly error
      this.showToast("Error", "Failed to load car object metadata", "error");
    }
  }

  // Fetch Category__c picklist values
  @wire(getPicklistValues, {
    recordTypeId: "$carObjectId",
    fieldApiName: CATEGORY_FIELD
  })
  wiredCategoryPicklist({ error, data }) {
    if (data) {
      this.categories = data.values.map(({ label, value }) => ({
        label,
        value
      }));
    } else if (error) {
      this.showToast(
        "Error",
        "Failed to load category picklist values",
        "error"
      );
    }
  }

  // Fetch Brand__c picklist values
  @wire(getPicklistValues, {
    recordTypeId: "$carObjectId",
    fieldApiName: BRAND_FIELD
  })
  wiredBrandPicklist({ error, data }) {
    if (data) {
      this.brands = data.values.map(({ label, value }) => ({ label, value }));
    } else if (error) {
      this.showToast("Error", "Failed to load brand picklist values", "error");
    }
  }

  // Handle search input with debouncing
  handleSearchInput(event) {
    this.searchInputValue = event.target.value || "";
    this.debouncePublish();
  }

  // Handle price input with debouncing
  handlePrice(event) {
    this.carPrice = event.target.value ? Number(event.target.value) : null;
    this.debouncePublish();
  }

  // Handle category selection (multi-select picklist)
  handleCategories(event) {
    this.selectedCategories = event.target.value || [];
    this.publishFilters();
  }

  // Handle brand selection (multi-select picklist)
  handleBrands(event) {
    this.selectedBrands = event.target.value || [];
    this.publishFilters();
  }

  // Debounce publishing to reduce frequent LMS broadcasts
  debouncePublish() {
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.publishFilters();
    }, 500);
  }

  // Publish filter data to LMS channel
  publishFilters() {
    const payload = this.filters;
    publish(this.context, CARHUB_FILTERS_CHANNEL, payload);
  }

  // Clean up timer on component disconnection to prevent memory leaks
  disconnectedCallback() {
    clearTimeout(this.timer);
    this.timer = null;
  }

  // Utility to show toast notifications for errors
  showToast(title, message, variant) {
    const event = new ShowToastEvent({
      title,
      message,
      variant
    });
    this.dispatchEvent(event);
  }
}
