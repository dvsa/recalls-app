package uk.gov.dvsa.recalls.journey;

import org.testng.annotations.Test;

import uk.gov.dvsa.recalls.base.BaseTest;
import uk.gov.dvsa.recalls.ui.page.RecallInformationSearchPage;
import uk.gov.dvsa.recalls.ui.page.ResultsPage;
import uk.gov.dvsa.recalls.ui.page.SelectMakePage;
import uk.gov.dvsa.recalls.ui.page.SelectModelPage;
import uk.gov.dvsa.recalls.ui.page.SelectVehicleMakePage;
import uk.gov.dvsa.recalls.ui.page.SelectVehicleModelPage;

import java.io.UnsupportedEncodingException;

import static org.testng.Assert.assertTrue;

public class SearchByMakeTests extends BaseTest {

    public static final String RESULTS_PAGE_PATH = "/results-page?recallType=%s&make=%s&model=%s";
    public final String RECALL_TYPE_VEHICLE = "vehicle";
    public final String RECALL_TYPE_EQUIPMENT = "equipment";

    public final String make = "OUGHTRED & HARRISON";
    public final String model = "BERLINGO AMBULANCE";

    @Test(description = "User can check recalls for a vehicle of a particular make and model")
    public void searchVehicleByMakeTest() {
        String expectedRecallTitle = "REAR AXLE SECURING BOLTS LOOSE OR MISSING";

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
        assertTrue(selectMakePage.formErrorMessageIsVisible(), "I can see the error message");

        //Then I select valid make and continue, I get redirected to the Model Page
        SelectModelPage selectModelPage = selectMakePage.selectMakeAndContinue(make);

        //When I select no options and click continue, an error appears
        selectModelPage.clickContiniueWithNoOptionsSelected();
        assertTrue(selectModelPage.formErrorMessageIsVisible(), "I can see the error message");

        //When I select vehicle make from a dropdown and continue
        ResultsPage resultsPage = selectModelPage.selectModelAndContinue(model);

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

    @Test(description = "User can check recalls for an equpment of a particular make and model")
    public void searchEquipmentByMakeTest() {
        String make = "COOPER BUSSMANN (UK) LTD";
        String model = "1315-B";
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

        //Then I select valid make and continue, I get redirected to the Model Page
        SelectModelPage selectModelPage = selectMakePage.selectMakeAndContinue(make);

        //When I select no options and click continue, an error appears
        selectModelPage.clickContiniueWithNoOptionsSelected();
        selectModelPage.formErrorMessageIsVisible();

        //When I select equipment make from a dropdown and continue
        ResultsPage resultsPage = selectModelPage.selectModelAndContinue(model);

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

    @Test(description = "User can use the 'Back' buttons to get from the results page to the landing page")
    public void backButtonsTest() throws UnsupportedEncodingException {
        // When I am on the results page
        ResultsPage resultsPage = recalls.goToResultsPage(RESULTS_PAGE_PATH, "vehicle", make, model);
        // And I click the 'Back' button, I am redirected to the model page
        SelectModelPage selectModelPage = resultsPage.clickBackButton(SelectVehicleModelPage.class);
        // I click the 'Back' button again, I am redirected to the make page
        SelectMakePage selectMakePage = selectModelPage.clickBackButton(SelectVehicleMakePage.class);
        // I click the 'Back' button again, I am redirected to the landing page
        selectMakePage.clickBackButton();
    }
}
