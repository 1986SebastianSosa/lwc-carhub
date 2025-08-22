public with sharing class CarsController {
  public class Filters {
    @AuraEnabled
    public String searchInputValue { get; set; }
    @AuraEnabled
    public Decimal carPrice { get; set; }
    @AuraEnabled
    public String[] selectedCategories { get; set; }
    @AuraEnabled
    public String[] selectedBrands { get; set; }
  }

  @AuraEnabled(cacheable=true)
  public static List<Car__c> getCars(Filters filters) {
    System.debug(filters);
    String key, query, whereClause = '';
    Decimal carPrice = 0;
    String[] selectedCategories, selectedBrands, criteria = new List<String>();

    if (filters != null) {
      if (!String.isEmpty(filters.searchInputValue)) {
        key = '%' + filters.searchInputValue + '%';
        criteria.add('Name LIKE :key');
      }
      if (filters.carPrice >= 0) {
        carPrice = filters.carPrice;
        criteria.add('MSRP__c <= :carPrice');
      }
      if (filters.selectedCategories.size() > 0) {
        selectedCategories = filters.selectedCategories;
        criteria.add('Category__c IN :selectedCategories');
      }
      if (filters.selectedBrands.size() > 0) {
        selectedBrands = filters.selectedBrands;
        criteria.add('Brand__c IN :selectedBrands');
      }
      whereClause = ' WHERE ' + String.join(criteria, ' AND ');
    }

    query =
      'SELECT Id, Name, MSRP__c, Picture_URL__c FROM Car__c' +
      whereClause +
      ' WITH SECURITY_ENFORCED ORDER BY Name';

    System.debug(query);
    try {
      return Database.query(query);
    } catch (Exception e) {
      throw new AuraHandledException(e.getMessage());
    }
  }

  @AuraEnabled(cacheable=true)
  public static List<Car__c> getSimilarCars(String id, String brand) {
    System.debug(id);
    System.debug(brand);

    try {
      return [
        SELECT Id, Name, MSRP__c, Picture_URL__c
        FROM Car__c
        WHERE Brand__c = :brand AND Id != :id
        LIMIT 2
      ];
    } catch (Exception e) {
      throw new AuraHandledException(e.getMessage());
    }
  }
}
