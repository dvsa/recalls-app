package uk.gov.dvsa.recalls.journey;

import org.apache.http.HttpResponse;
import org.testng.annotations.Test;

import uk.gov.dvsa.recalls.base.BaseTest;
import uk.gov.dvsa.recalls.ui.page.RecallInformationSearchPage;


import java.io.IOException;

import static org.testng.Assert.assertEquals;
import static org.testng.Assert.assertTrue;
import static uk.gov.dvsa.recalls.navigation.HttpClient.performHeadRequest;

public class RecallInformationSearchTests extends BaseTest {

    @Test(description = "Recalls Information Search Page exists")
    public void recallInformationSearchPageTest() throws IOException
    {
        //Given I am a user of the site
        //When I open home page
        RecallInformationSearchPage recallInformationSearchPage = recalls.goToRecallInformationSearchPage();

        //Then I will see screen with "Continue" button
        assertTrue(recallInformationSearchPage.continueButtonExists());

        //And I will see links for full CSV data and data guide
        assertTrue(recallInformationSearchPage.csvDataLinkExists());
        assertTrue(recallInformationSearchPage.dataGuideLinkExists());

        // TODO BL-952 - Fix acccess from jenkins nodes to non-production environments
//        //And I can download the full CSV data set
//        HttpResponse csvResponse = performHeadRequest(recallInformationSearchPage.getCsvDataLink());
//        assertEquals(
//                csvResponse.getStatusLine().getStatusCode(),
//                200,
//                "CSV full data response status is not HTTP:OK");
//
//        //And I can download the data guide
//        HttpResponse guideResponse = performHeadRequest(recallInformationSearchPage.getDataGuideLink());
//        assertEquals(
//                guideResponse.getStatusLine().getStatusCode(),
//                200,
//                "Data guide response status is not HTTP:OK");

    }
}
