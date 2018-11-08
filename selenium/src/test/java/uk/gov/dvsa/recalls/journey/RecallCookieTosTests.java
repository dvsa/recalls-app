package uk.gov.dvsa.recalls.journey;

import org.testng.annotations.Test;
import uk.gov.dvsa.recalls.base.BaseTest;
import uk.gov.dvsa.recalls.ui.page.CookiesPage;
import uk.gov.dvsa.recalls.ui.page.TermsAndConditionsPage;

import static org.testng.Assert.assertEquals;

public class RecallCookieTosTests extends BaseTest {

    @Test(description = "As a user of the site with a vested interest in cookie policy, I can view them")
    public void canViewCookiesPageWhenClickingLinkInFooter() {

        //Given I am a user of the site
        //When I open home page
        //And I click the cookies link in footer of the page
        CookiesPage cookiesPage =  recalls.goToRecallInformationSearchPage().clickCookiesLink();

        //Then I am taken to the cookies page
        assertEquals(cookiesPage.getTitle(), "Cookie policy", "Cookies page is not returned");
    }

    @Test(description = "As a user of the site with a vested interest in terms and conditions of the service, I can view them")
    public void canViewTermsAndConditionsPageWhenClickingLinkInFooter() {

        //Given I am a user of the site
        //When I open home page
        //And I click the terms and conditions link in footer of the page
        TermsAndConditionsPage termsAndConditionsPage = recalls.goToRecallInformationSearchPage().clickTermsAndConditionsLink();

        //Then I am taken to the terms and conditions page
        assertEquals(termsAndConditionsPage.getTitle(), "Terms and conditions", "Terms and conditions page is not returned");
    }
}
