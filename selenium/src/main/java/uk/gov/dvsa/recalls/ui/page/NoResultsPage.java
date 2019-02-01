package uk.gov.dvsa.recalls.ui.page;

import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import uk.gov.dvsa.recalls.ui.base.Page;
import uk.gov.dvsa.recalls.ui.base.PageIdentityVerificationException;
import uk.gov.dvsa.recalls.ui.base.PageInstanceNotFoundException;

public class NoResultsPage extends Page {
    @FindBy(id = "vehicle-or-component-title") private WebElement header;
    @FindBy(className = "link-back") private WebElement backButton;
    @FindBy(id = "link-home") private WebElement homeLink;

    @Override protected void selfVerify() {
        if (!driver.getPageSource().contains("This vehicle has <b>no recalls.</b>")) {
            throw new PageIdentityVerificationException(
                    "Page identity verification failed: \n Page does not contain no recalls message"
            );
        }

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

    public Page clickBackButton(Class<? extends Page> clazz) {
        backButton.click();
        try {
            return clazz.newInstance();
        } catch (InstantiationException | IllegalAccessException e) {
            throw new PageInstanceNotFoundException(String.format("Could not create Page: %s", clazz.getName()));
        }
    }

    public RecallInformationSearchPage clickHomeLink() {
        homeLink.click();
        return new RecallInformationSearchPage();
    }
}
