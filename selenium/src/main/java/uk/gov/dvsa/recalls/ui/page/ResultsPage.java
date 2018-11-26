package uk.gov.dvsa.recalls.ui.page;

import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import uk.gov.dvsa.recalls.navigation.GotoUrl;
import uk.gov.dvsa.recalls.ui.base.Page;
import uk.gov.dvsa.recalls.ui.base.PageIdentityVerificationException;
import uk.gov.dvsa.recalls.ui.base.PageInstanceNotFoundException;

import java.util.List;

@GotoUrl("/results-page")
public class ResultsPage extends Page {
    WebDriverWait wait = new WebDriverWait(driver, 5);

    @FindBy(id = "vehicle-or-component-title") private WebElement header;
    @FindBy(className = "recall-title") private List<WebElement> recallTitleHeaderList;
    @FindBy(className = "how-to") private List<WebElement> howToCheckRecallType;
    @FindBy(className = "affected-number") private List<WebElement> affectedVehiclesSentences;
    @FindBy(className = "js-accordion__title-button") private List<WebElement> recallAccordions;
    @FindBy(className = "link-back") private WebElement backButton;

    @Override protected void selfVerify() {
        if (getTitle().length() < 1) {
            throw new PageIdentityVerificationException("Page identity verification failed: " +
                    String.format("\n Page header (id = %s) cannot be empty.",
                            header.getAttribute("id"))
            );
        }
    }

    @Override
    protected String getExpectedPageTitle() {
        return ""; // Page title has no static text - it is completely dynamic
    }

    public boolean headerContains(String text) {
        return header.isDisplayed() && header.getText().toLowerCase().contains(text.toLowerCase());
    }

    public boolean recallTitleIsDisplayed(String recallTitle) {
        return !recallTitleHeaderList.isEmpty() && isRecallTitlePresentInRecallList(recallTitleHeaderList, recallTitle);
    }

    private boolean isRecallTitlePresentInRecallList(List<WebElement> recallTitleHeaderList, String recallTitle) {
        for (WebElement recallTitleHeader : recallTitleHeaderList) {
            if (recallTitleHeader.getText().toLowerCase().contains(recallTitle.toLowerCase())) {
                return true;
            }
        }

        return false;
    }

    public void clickTheFirstRecallAccordion() {
        recallAccordions.get(0).click();
    }

    public boolean isHowToCheckSentenceValid(String recallType) {
        wait.until(ExpectedConditions.visibilityOf(howToCheckRecallType.get(0)));
        return howToCheckRecallType.get(0).getText().contains(
                String.format("How to check if the %s is recalled", recallType)
        );
    }

    public boolean isNumberOfAffectedVehiclesValid(String recallType) {
        return affectedVehiclesSentences.get(0).getText().contains(
                String.format("Number of affected %s", recallType)

        );
    }

    public Page clickBackButton(Class<? extends Page> clazz) {
        backButton.click();
        try {
            return clazz.newInstance();
        } catch (InstantiationException | IllegalAccessException e) {
            throw new PageInstanceNotFoundException(String.format("Could not create a Model Page: %s", clazz.getName()));
        }
    }
}
