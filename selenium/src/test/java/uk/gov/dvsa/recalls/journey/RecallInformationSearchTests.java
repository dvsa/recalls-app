package uk.gov.dvsa.recalls.journey;

import org.testng.annotations.Test;

import uk.gov.dvsa.recalls.base.BaseTest;
import uk.gov.dvsa.recalls.ui.page.RecallInformationSearchPage;

import static org.testng.Assert.assertFalse;

public class RecallInformationSearchTests extends BaseTest {

    @Test(description = "Recalls Information Search Page exists")
    public void recallInformationSearchPageTest()
    {
        //Given I am a user of the site
        //When I open home page
        RecallInformationSearchPage recallInformationSearchPage = recalls.goToRecallInformationSearchPage();

        //Then I will see screen with "Continue" button
        assertFalse(recallInformationSearchPage.continueButtonExists());
    }
}
