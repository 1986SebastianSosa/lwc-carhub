import { api, LightningElement } from "lwc";

export default class CarHubTile extends LightningElement {
  // Public property for car data
  @api car;

  // Handle car click and dispatch custom event
  handleCarClicked() {
    const carClicked = new CustomEvent("carclicked", {
      bubbles: true,
      composed: false,
      detail: this.car // Pass car data
    });
    this.dispatchEvent(carClicked);
  }
}
