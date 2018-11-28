package uk.gov.dvsa.recalls.ui.page;

import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import uk.gov.dvsa.recalls.helper.FormDataHelper;
import uk.gov.dvsa.recalls.navigation.GotoUrl;
import uk.gov.dvsa.recalls.ui.base.Page;
import uk.gov.dvsa.recalls.ui.base.PageInstanceNotFoundException;

public class EnterYearPage extends Page {
    private WebDriverWait wait = new WebDriverWait(driver, 5);
    @FindBy(id = "continue-button") private WebElement continueButton;
    @FindBy(id = "year") private WebElement manufactureYearField;
    @FindBy(className = "error-message") private WebElement errorMessage;
    @FindBy(className = "link-back") private WebElement backButton;

    public final String EMPTY_YEAR_MSG = "Enter the year the vehicle was made";
    public final String DIGITS_ONLY_MSG = "Enter a year using numbers 0 to 9";
    public final String FOUR_DIGITS_MSG = "Enter a real year";
    public final String IN_THE_FUTURE_MSG = "Year must not be in the future";

    @Override
    protected String getExpectedPageTitle() {
        return "What year was the vehicle made?";
    }

    public ResultsPage enterYearAndContinue(String year) {
        FormDataHelper.enterText(manufactureYearField, year);
        clickContinueButtonWhenReady();
        return new ResultsPage();
    }

    public boolean enterYearAndExpectError(String year, String error) {
        FormDataHelper.enterText(manufactureYearField, year);
        clickContinueButtonWhenReady();
        return errorMessage.getText().contains(error);
    }

    private void clickContinueButtonWhenReady() {
        title.click(); // Click some text to close a dropdown which might be obscuring the button
        wait.until(ExpectedConditions.elementToBeClickable(continueButton)).click();
    }

    public SelectModelPage clickBackButton(Class<? extends SelectModelPage> clazz) {
        backButton.click();
        try {
            return clazz.newInstance();
        } catch (InstantiationException | IllegalAccessException e) {
            throw new PageInstanceNotFoundException(String.format("Could not create a Make Page: %s", clazz.getName()));
        }
    }
}
