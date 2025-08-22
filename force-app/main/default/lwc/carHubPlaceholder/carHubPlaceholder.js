import { api, LightningElement } from "lwc";
import USER_IMAGE from "@salesforce/resourceUrl/car_hub_logo";

export default class CarHubPlaceholder extends LightningElement {
  // Company Logo
  logo_url = USER_IMAGE;

  //Custom Text to Display
  @api text;
}
