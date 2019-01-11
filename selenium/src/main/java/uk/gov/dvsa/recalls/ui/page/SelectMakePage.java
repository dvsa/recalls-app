package uk.gov.dvsa.recalls.ui.page;

import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import uk.gov.dvsa.recalls.helper.FormDataHelper;
import uk.gov.dvsa.recalls.navigation.GotoUrl;
import uk.gov.dvsa.recalls.ui.base.Page;

public abstract class SelectMakePage extends Page {

    private WebDriverWait wait = new WebDriverWait(driver, 5);
    @FindBy(id = "continue-button") private WebElement continueButton;
    @FindBy(id = "make") private WebElement vehicleMakeDropdown;
    @FindBy(className = "error-message") private WebElement errorMessage;
    @FindBy(className = "link-back") private WebElement backButton;
    @FindBy(id = "recall-not-listed-link") private WebElement recallNotListedLink;

    @Override
    protected abstract String getExpectedPageTitle();

    public abstract SelectModelPage selectMakeAndContinue(String make);

    private void clickContinueButtonWhenReady() {
        title.click(); // Click some text to close a dropdown which might be obscuring the button
        wait.until(ExpectedConditions.elementToBeClickable(continueButton)).click();
    }

    public void clickContinueWithNoOptionsSelected() {
        FormDataHelper.selectFromDropDownByVisibleText(vehicleMakeDropdown, "Choose a make");
        continueButton.click();
    }

    public boolean formErrorMessageIsVisible() {
        return errorMessage.getText().contains("Select the vehicle make");
    }

    void selectMakePageCommon(String make) {
        FormDataHelper.selectFromDropDownByVisibleText(vehicleMakeDropdown, make);
        clickContinueButtonWhenReady();
    }

    public RecallInformationSearchPage clickBackButton() {
        backButton.click();
        return new RecallInformationSearchPage();
    }

    public RecallNotListedPage clickWhyMakeIsNotListedLink() {
        recallNotListedLink.click();
        return new RecallNotListedPage();
    }
}
