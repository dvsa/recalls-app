package uk.gov.dvsa.recalls.ui.page;

import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;

import uk.gov.dvsa.recalls.navigation.GotoUrl;
import uk.gov.dvsa.recalls.ui.base.Page;

import static org.testng.Assert.assertFalse;

@GotoUrl("/recalls")
public class RecallInformationSearchPage extends Page {

    @FindBy(id = "csv-data-link") private WebElement csvDataLink;
    @FindBy(id = "data-guide-link") private WebElement dataGuideLink;
    @FindBy(id = "continue-button") private WebElement continueButton;
    @FindBy(id = "recalls-vehicle") private WebElement vehicleRecallsRadioButton;
    @FindBy(id = "recalls-other") private WebElement equipmentRecallsRadioButton;
    @FindBy(className = "error-message") private WebElement errorMessage;

    @Override
    protected String getExpectedPageTitle() {
        return "What type of recall information are you looking for?";
    }

    public boolean continueButtonExists() {
        return continueButton.isDisplayed();
    }

    public SelectVehicleMakePage selectVehicleRecallAndContinue() {
        vehicleRecallsRadioButton.click();
        continueButton.click();
        return new SelectVehicleMakePage();
    }

    public RecallInformationSearchPage clickContiniueWithNoOptionsSelected() {
        assertFalse(vehicleRecallsRadioButton.isSelected());
        assertFalse(equipmentRecallsRadioButton.isSelected());
        continueButton.click();
        return this;
    }

    public boolean formErrorMessageIsVisible() {
        return errorMessage.getText().contains("Please select an option");
    }

    public SelectEquipmentMakePage selectEquipmentRecallAndContinue() {
        equipmentRecallsRadioButton.click();
        continueButton.click();
        return new SelectEquipmentMakePage();
    }

    public boolean csvDataLinkExists() {
        return csvDataLink.isDisplayed();
    }

    public String getCsvDataLink() {
        return csvDataLink.getAttribute("href");
    }

    public boolean dataGuideLinkExists() {
        return dataGuideLink.isDisplayed();
    }

    public String getDataGuideLink() {
        return dataGuideLink.getAttribute("href");
    }

    public CookiesPage clickCookiesLink() {
        cookiesLink.click();
        return new CookiesPage();
    }

    public TermsAndConditionsPage clickTermsAndConditionsLink() {
        termsAndConditionsLink.click();
        return new TermsAndConditionsPage();
    }
}
