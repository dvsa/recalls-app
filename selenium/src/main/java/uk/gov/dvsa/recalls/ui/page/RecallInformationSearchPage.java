package uk.gov.dvsa.recalls.ui.page;

import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;

import uk.gov.dvsa.recalls.navigation.GotoUrl;
import uk.gov.dvsa.recalls.ui.base.Page;

@GotoUrl("/recalls")
public class RecallInformationSearchPage extends Page {

    @FindBy(id="csv-data-link") private WebElement csvDataLink;
    @FindBy(id="data-guide-link") private WebElement dataGuideLink;
    @FindBy(id = "continue-button") private WebElement continueButton;
    @FindBy(id = "recalls-vehicle") private WebElement vehicleRecallsRadioButton;

    @Override
    protected String getExpectedPageTitle() {
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

    public CookiesPage clickCookiesLink()
    {
        cookiesLink.click();
        return new CookiesPage();
    }

    public TermsAndConditionsPage clickTermsAndConditionsLink()
    {
        termsAndConditionsLink.click();
        return new TermsAndConditionsPage();
    }
}
