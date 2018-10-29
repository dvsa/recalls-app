package uk.gov.dvsa.recalls.ui.page;

import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;

import uk.gov.dvsa.recalls.helper.FormDataHelper;
import uk.gov.dvsa.recalls.navigation.GotoUrl;
import uk.gov.dvsa.recalls.ui.base.Page;

@GotoUrl("/vehicle-make")
public class SelectMakePage extends Page {

    @FindBy(id = "continue-button") private WebElement continueButton;
    @FindBy(id = "vehicleMake") private WebElement vehicleMakeDropdown;

    @Override
    protected String getPageTitle() {
        return "What make is the vehicle?";
    }

    public ResultsPage selectVehicleMakeAndContinue(String make) {
        FormDataHelper.selectFromDropDownByVisibleText(vehicleMakeDropdown, make);
        continueButton.click();
        return new ResultsPage(make);
    }
}
