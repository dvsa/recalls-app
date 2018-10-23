package uk.gov.dvsa.recalls.ui.page;

import org.openqa.selenium.By;

import uk.gov.dvsa.recalls.navigation.GotoUrl;
import uk.gov.dvsa.recalls.ui.base.Page;

@GotoUrl("/recalls")
public class RecallInformationSearchPage extends Page {

    private static final String CONTINUE_BUTTON_ID = "continue-button";

    @Override
    protected String getPageTitle() {
        return "What type of recall information are you looking for?";
    }

    public boolean continueButtonExists()
    {
        return isElementVisible(By.id(CONTINUE_BUTTON_ID));
    }
}
