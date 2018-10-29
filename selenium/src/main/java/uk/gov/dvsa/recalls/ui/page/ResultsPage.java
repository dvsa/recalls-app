package uk.gov.dvsa.recalls.ui.page;

import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;

import uk.gov.dvsa.recalls.navigation.GotoUrl;
import uk.gov.dvsa.recalls.ui.base.Page;
import uk.gov.dvsa.recalls.ui.base.PageIdentityVerificationException;

import java.util.List;

@GotoUrl("/results-page")
public class ResultsPage extends Page {

    @FindBy(id = "vehicle-or-component-title") private WebElement header;
    @FindBy(className = "recall-title") private List<WebElement> recallTitleHeaderList;

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

    public boolean headerContainsCorrectVehicleMake(String make) {
        return header.isDisplayed() && header.getText().toLowerCase().contains(make.toLowerCase());
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
}
