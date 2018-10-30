package uk.gov.dvsa.recalls.journey;

import org.testng.annotations.Test;

import uk.gov.dvsa.recalls.base.BaseTest;
import uk.gov.dvsa.recalls.ui.page.RecallInformationSearchPage;
import uk.gov.dvsa.recalls.ui.page.ResultsPage;
import uk.gov.dvsa.recalls.ui.page.SelectMakePage;

import static org.testng.Assert.assertTrue;

public class SearchByMakeTests extends BaseTest {

    @Test(description = "User can check recalls for a vehicle of particular make")
    public void searchByMakeTest() {
        String make = "land rover";
        String expectedRecallTitle = "front passenger airbag may not deploy";

        //Given I am a user of the site and I want to check vehicle recalls
        //I go to cvr home page
        RecallInformationSearchPage recallInformationSearchPage = recalls.goToRecallInformationSearchPage();

        //And I select vehicle recalls option
        //Then I'm redirected to the SelectMake page
        SelectMakePage selectMakePage = recallInformationSearchPage.selectVehicleRecallAndContinue();

        //When I select vehicle make from a dropdown and continue
        ResultsPage resultsPage = selectMakePage.selectVehicleMakeAndContinue(make);

        //Then I should be redirected to the Results page and the header should contain make of the vehicle
        assertTrue(resultsPage.headerContainsCorrectVehicleMake(make));

        //And recall title should be displayed
        assertTrue(resultsPage.recallTitleIsDisplayed(expectedRecallTitle));
    }
}
