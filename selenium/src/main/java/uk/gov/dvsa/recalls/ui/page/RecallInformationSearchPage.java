package uk.gov.dvsa.recalls.ui.page;

import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;

import uk.gov.dvsa.recalls.navigation.GotoUrl;
import uk.gov.dvsa.recalls.ui.base.Page;

@GotoUrl("/recalls")
public class RecallInformationSearchPage extends Page {

    @FindBy(id = "continue-button") private WebElement continueButton;
    @FindBy(id = "recalls-vehicle") private WebElement vehicleRecallsRadioButton;

    @Override
    protected String getPageTitle() {
        return "What type of recall information are you looking for?";
    }

    public boolean continueButtonExists() {
        return continueButton.isDisplayed();
    }

    public SelectMakePage selectVehicleRecallAndContinue() {
        vehicleRecallsRadioButton.click();
        continueButton.click();
        return new SelectMakePage();
    }
}
