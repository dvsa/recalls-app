package uk.gov.dvsa.recalls.ui.page;

import org.openqa.selenium.By;

import uk.gov.dvsa.recalls.navigation.GotoUrl;
import uk.gov.dvsa.recalls.ui.base.Page;

@GotoUrl("/recalls")
public class RecallInformationSearchPage extends Page {

    private static final String CONTINUE_BUTTON_ID = "continue-button";
    private static final String CSV_DATA_LINK_ID = "csv-data-link";
    private static final String DATA_GUIDE_LINK_ID = "data-guide-link";

    @Override
    protected String getPageTitle() {
        return "What type of recall information are you looking for?";
    }

    public boolean continueButtonExists()
    {
        return isElementVisible(By.id(CONTINUE_BUTTON_ID));
    }

    public boolean csvDataLinkExists()
    {
        return isElementVisible(By.id(CSV_DATA_LINK_ID));
    }

    public String getCsvDataLink()
    {
        return getLinkHref(By.id(CSV_DATA_LINK_ID));
    }

    public boolean dataGuideLinkExists()
    {
        return isElementVisible(By.id(DATA_GUIDE_LINK_ID));
    }

    public String getDataGuideLink()
    {
        return getLinkHref(By.id(DATA_GUIDE_LINK_ID));
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
