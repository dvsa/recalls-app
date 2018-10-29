package uk.gov.dvsa.recalls.journey;

import org.testng.annotations.Test;

import uk.gov.dvsa.recalls.base.BaseTest;
import uk.gov.dvsa.recalls.ui.page.RecallInformationSearchPage;
import uk.gov.dvsa.recalls.ui.page.ResultsPage;
import uk.gov.dvsa.recalls.ui.page.SelectMakePage;

import static org.testng.Assert.assertTrue;

public class SearchByMakeTests extends BaseTest {

    public final String RECALL_TYPE_VEHICLE = "vehicle";
    public final String RECALL_TYPE_EQUIPMENT = "equipment";

    @Test(description = "User can check recalls for a vehicle of particular make")
    public void searchVehicleByMakeTest() {
        String make = "LAND ROVER";
        String expectedRecallTitle = "LOCKING RING MAY BE INCORRECTLY ASSEMBLED";

        //Given I am a user of the site and I want to check vehicle recalls
        //I go to cvr home page
        RecallInformationSearchPage recallInformationSearchPage = recalls.goToRecallInformationSearchPage();

        //When I select no options and click continue, an error appears
        recallInformationSearchPage.clickContiniueWithNoOptionsSelected();
        recallInformationSearchPage.formErrorMessageIsVisible();

        //And I select vehicle recalls option
        //Then I'm redirected to the SelectMake page
        SelectMakePage selectMakePage = recallInformationSearchPage.selectVehicleRecallAndContinue();

        //When I select no options and click continue, an error appears
        selectMakePage.clickContiniueWithNoOptionsSelected();
        selectMakePage.formErrorMessageIsVisible();

        //When I select vehicle make from a dropdown and continue
        ResultsPage resultsPage = selectMakePage.selectVehicleMakeAndContinue(make);

        //Then I should be redirected to the Results page and the header should contain make of the vehicle
        assertTrue(resultsPage.headerContainsCorrectVehicleMake(make), "Header contains correct vehicle make");

        //Recall title should be displayed
        assertTrue(resultsPage.recallTitleIsDisplayed(expectedRecallTitle), "Recall title is displayed");

        //When I expand the first recall
        resultsPage.clickTheFirstRecallAccordion();
        // The following sentence is visible: "How to check if the vehicle is recalled"
        assertTrue(resultsPage.isHowToCheckSentenceValid(RECALL_TYPE_VEHICLE), "'How to check if the vehicle is recalled' is visible");
        // The following sentence is visible: "Number of affected vehicles"
        assertTrue(resultsPage.isNumberOfAffectedVehiclesValid(RECALL_TYPE_VEHICLE), "'Number of affected vehicles' is visible");
    }

    @Test(description = "User can check recalls for an equpment of particular make")
    public void searchEquipmentByMakeTest() {
        String make = "COOPER BUSSMANN (UK) LTD";
        String expectedRecallTitle = "FIRE MAY OCCUR";

        //Given I am a user of the site and I want to check equipment recalls
        //I go to cvr home page
        RecallInformationSearchPage recallInformationSearchPage = recalls.goToRecallInformationSearchPage();

        //And I select equipment recalls option
        //Then I'm redirected to the SelectMake page
        SelectMakePage selectMakePage = recallInformationSearchPage.selectEquipmentRecallAndContinue();

        //When I select no options and click continue, an error appears
        selectMakePage.clickContiniueWithNoOptionsSelected();
        selectMakePage.formErrorMessageIsVisible();

        //When I select equipment make from a dropdown and continue
        ResultsPage resultsPage = selectMakePage.selectVehicleMakeAndContinue(make);

        //Then I should be redirected to the Results page and the header should contain make of the equipment
        assertTrue(resultsPage.headerContainsCorrectVehicleMake(make), "Header contains correct equipment make");

        //Recall title should be displayed
        assertTrue(resultsPage.recallTitleIsDisplayed(expectedRecallTitle), "Recall title is displayed");

        //When I expand the first recall
        resultsPage.clickTheFirstRecallAccordion();
        // The following sentence is visible: "How to check if the equipment is recalled"
        assertTrue(resultsPage.isHowToCheckSentenceValid(RECALL_TYPE_EQUIPMENT), "'How to check if the equipment is recalled' is visible");
        // The following sentence is visible: "Number of affected equipments"
        assertTrue(resultsPage.isNumberOfAffectedVehiclesValid(RECALL_TYPE_EQUIPMENT), "'Number of affected equipments' is visible");
    }
}
