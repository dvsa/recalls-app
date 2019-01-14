package uk.gov.dvsa.recalls.ui.page;

import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;

import uk.gov.dvsa.recalls.ui.base.Page;

public class RecallNotListedPage extends Page {

    @FindBy(className = "link-back") private WebElement backButton;
    @FindBy(linkText = "Check for other vehicle or equipment recalls") private WebElement checkForOtherRecallsLink;

    @Override
    protected String getExpectedPageTitle() {
        return "Why is my make or model not listed?";
    }

    public RecallInformationSearchPage clickCheckForOtherRecallsLink() {
        checkForOtherRecallsLink.click();
        return new RecallInformationSearchPage();
    }

    public SelectEquipmentModelPage clickBackButtonRedirectToEquipmentModelPage() {
        backButton.click();
        return new SelectEquipmentModelPage();
    }
}
