# CarHub: Salesforce LWC Car Browsing App

## Overview
CarHub is a Salesforce Lightning Web Components (LWC) application for browsing cars. Users can filter cars by name, price, category, and brand, view a grid of car tiles, see detailed car information, and explore similar cars. The app demonstrates modern Salesforce development practices, including Lightning Message Service (LMS) for component communication, Lightning Data Service (LDS) for efficient data fetching, and Apex for secure backend logic.

## Features
- **Dynamic Filtering**: Filter cars by name, max price, categories, and brands using a responsive filter component.
- **Car Grid**: Displays a grid of car tiles with name, image, and price, optimized for minimal data fetching.
- **Car Details**: Shows detailed car information (e.g., category, brand, fuel type) with a large image and navigation to the record page.
- **Similar Cars**: Lists cars with the same brand as the selected car, with navigation support.
- **Responsive UX**: Includes loading spinners for asynchronous data fetching and user-friendly error handling via toast notifications.
- **Production-Ready**: No console logs, secure data access with FLS enforcement, and optimized performance.

## Architecture
- **Components**:
  - **CarHubFilter**: Allows users to input filter criteria (name, price, categories, brands) and publishes updates via LMS.
  - **CarHubTileList**: Subscribes to filter updates, fetches filtered cars via Apex, and displays a grid of car tiles.
  - **CarHubTile**: Renders individual car tiles and dispatches click events to the parent.
  - **CarHubCard**: Subscribes to car selection via LMS, fetches full car details using LDS, and supports navigation to the record page.
  - **CarHubSimilarCars**: Fetches and displays cars with the same brand as the selected car, with navigation support.
- **Apex Controller** (`CarsController`): Handles secure data retrieval with dynamic SOQL and FLS enforcement (`WITH SECURITY_ENFORCED`).
- **Message Channels**:
  - `carHubFilters__c`: Broadcasts filter updates from `CarHubFilter` to `CarHubTileList`.
  - `carHubDetails__c`: Sends selected car ID from `CarHubTileList` to `CarHubCard`.

## Prerequisites
- Salesforce org with **Experience Cloud** enabled (for UI deployment).
- User permissions for the `Car__c` custom object and its fields (`Name`, `Brand__c`, `Category__c`, `MSRP__c`, `Picture_URL__c`, `Fuel_Type__c`, `Number_of_Seats__c`, `Control__c`).
- Salesforce CLI and VS Code for deployment.

## Setup Instructions
1. **Clone the Repository**:
   ```bash
   git clone <repository-url>
   cd carhub
    ```

2. **Deploy to Salesforce Org**:

- Authenticate with your org:
    ```
    sfdx force:auth:web:login -a <alias>
    ```
- Deploy the metadata:
    ```
    sfdx force:source:deploy -p force-app
    ```
3. **Configure the App**:
- Ensure the Car__c custom object and fields are set up in your org.
- Verify Field-Level Security (FLS) for all fields in the user’s profile.
- Create the carHubFilters__c and carHubDetails__c message channels in Setup > Custom Metadata Types > Message Channel.

4. **Add to Experience Cloud**:
- Drag the CarHubFilter, CarHubTileList, and CarHubCard components onto an 3 section Lightning App Page.
- Optionally, place CarHubSimilarCars near CarHubCard for related cars.

5. **Test the App**:
- Create sample Car__c records with valid data (e.g., Picture_URL__c with HTTPS URLs).
- Open the Experience Cloud page and test filtering, car selection, and navigation.

## Best Practices Implemented

- Security: Enforces FLS in Apex with WITH SECURITY_ENFORCED and LDS in CarHubCard.
- Error Handling: User-friendly toast notifications (ShowToastEvent) instead of console logs for production readiness.
- Modularity: LMS for decoupled component communication, with lean state management and reactive properties.
- Scalability: Optimized data fetching (partial fields for lists, full fields for details) and clean lifecycle management.

## Contact
For questions or contributions, contact Sebastian Sosa at [1986SebastianSosa@gmail.com] (mailto:1986SebastianSosa@gmail.com) or though my [LinkedIn](https://www.linkedin.com/in/sebastian-sosa-cinotti/).















