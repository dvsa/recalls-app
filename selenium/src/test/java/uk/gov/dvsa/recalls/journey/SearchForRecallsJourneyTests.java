package uk.gov.dvsa.recalls.journey;

import org.testng.annotations.Test;

import uk.gov.dvsa.recalls.base.BaseTest;
import uk.gov.dvsa.recalls.ui.page.EnterYearPage;
import uk.gov.dvsa.recalls.ui.page.RecallInformationSearchPage;
import uk.gov.dvsa.recalls.ui.page.ResultsPage;
import uk.gov.dvsa.recalls.ui.page.SelectEquipmentMakePage;
import uk.gov.dvsa.recalls.ui.page.SelectEquipmentModelPage;
import uk.gov.dvsa.recalls.ui.page.SelectMakePage;
import uk.gov.dvsa.recalls.ui.page.SelectModelPage;
import uk.gov.dvsa.recalls.ui.page.SelectVehicleMakePage;
import uk.gov.dvsa.recalls.ui.page.SelectVehicleModelPage;

import java.io.UnsupportedEncodingException;

import static org.testng.Assert.assertTrue;

public class SearchForRecallsJourneyTests extends BaseTest {

    public static final String RESULTS_PAGE_PATH_VEHICLE = "/recall-types/%s/makes/%s/models/%s/years/%s/recalls";
    public static final String RESULTS_PAGE_PATH_EQUIPMENT = "/recall-types/%s/makes/%s/models/%s/recalls";
    public final String RECALL_TYPE_VEHICLE = "vehicle";
    public final String RECALL_TYPE_EQUIPMENT = "equipment";

    public final String make = "OUGHTRED & HARRISON";
    public final String model = "BERLINGO AMBULANCE";
    public final String year = "2017";

    @Test(description = "User can check recalls for a vehicle of a particular make and model")
    public void searchVehicleByMakeTest() {
        String expectedRecallTitle = "REAR AXLE SECURING BOLTS LOOSE OR MISSING";
        String expectedPageHeader = String.format("%s %s %s", make, model, year);

        //Given I am a user of the site and I want to check vehicle recalls
        //I go to cvr home page
        RecallInformationSearchPage recallInformationSearchPage = recalls.goToRecallInformationSearchPage();

        //When I select no options and click continue, an error appears
        recallInformationSearchPage.clickContiniueWithNoOptionsSelected();
        recallInformationSearchPage.formErrorMessageIsVisible();

        //And I select vehicle recalls option
        //Then I'm redirected to the SelectMake page
        SelectVehicleMakePage selectMakePage = recallInformationSearchPage.selectVehicleRecallAndContinue();

        //When I select no options and click continue, an error appears
        selectMakePage.clickContiniueWithNoOptionsSelected();
        assertTrue(selectMakePage.formErrorMessageIsVisible(), "I can see the make error message");

        //Then I select valid make and continue, I get redirected to the Model Page
        SelectVehicleModelPage selectModelPage = selectMakePage.selectMakeAndContinue(make);

        //When I select no options and click continue, an error appears
        selectModelPage.clickContiniueWithNoOptionsSelected();
        assertTrue(selectModelPage.formErrorMessageIsVisible(), "I can see the model error message");

        //When I select vehicle make from a dropdown and continue
        EnterYearPage yearPage = selectModelPage.selectModelAndContinue(model);
        assertTrue(yearPage.enterYearAndExpectError("", yearPage.EMPTY_YEAR_MSG), "I can see the manufacture year error message");
        assertTrue(yearPage.enterYearAndExpectError("abc", yearPage.DIGITS_ONLY_MSG), "I can see the manufacture year error message");
        assertTrue(yearPage.enterYearAndExpectError("123", yearPage.FOUR_DIGITS_MSG), "I can see the manufacture year error message");
        assertTrue(yearPage.enterYearAndExpectError("3005", yearPage.IN_THE_FUTURE_MSG), "I can see the manufacture year error message");

        ResultsPage resultsPage = yearPage.enterYearAndContinue(year);

        //Then I should be redirected to the Results page and the header should contain make of the vehicle
        assertTrue(resultsPage.headerContains(expectedPageHeader), "Header contains correct text");

        //Recall title should be displayed
        assertTrue(resultsPage.recallTitleIsDisplayed(expectedRecallTitle), "Recall title is displayed");

        //When I expand the first recall
        resultsPage.clickTheFirstRecallAccordion();
        // The following sentence is visible: "How to check if the vehicle is recalled"
        assertTrue(resultsPage.isHowToCheckSentenceValid(RECALL_TYPE_VEHICLE), "'How to check if the vehicle is recalled' is visible");
        // The following sentence is visible: "Number of affected vehicles"
        assertTrue(resultsPage.isNumberOfAffectedVehiclesValid(RECALL_TYPE_VEHICLE), "'Number of affected vehicles' is visible");

        //When I click the "Search again" button, I am redirected to the landing page
        resultsPage.clickSearchAgainButton();
    }

    @Test(description = "User can check recalls for an equpment of a particular make and model")
    public void searchEquipmentByMakeTest() {
        String make = "COOPER";
        String model = "LT285/75R16";
        String expectedRecallTitle = "TYRE TREAD MAY SEPARATE";
        String expectedPageHeader = String.format("%s %s", make, model);

        //Given I am a user of the site and I want to check equipment recalls
        //I go to cvr home page
        RecallInformationSearchPage recallInformationSearchPage = recalls.goToRecallInformationSearchPage();

        //And I select equipment recalls option
        //Then I'm redirected to the SelectMake page
        SelectEquipmentMakePage selectMakePage = recallInformationSearchPage.selectEquipmentRecallAndContinue();

        //When I select no options and click continue, an error appears
        selectMakePage.clickContiniueWithNoOptionsSelected();
        selectMakePage.formErrorMessageIsVisible();

        //Then I select valid make and continue, I get redirected to the Model Page
        SelectEquipmentModelPage selectModelPage = selectMakePage.selectMakeAndContinue(make);

        //When I select no options and click continue, an error appears
        selectModelPage.clickContiniueWithNoOptionsSelected();
        selectModelPage.formErrorMessageIsVisible();

        //When I select equipment make from a dropdown and continue
        ResultsPage resultsPage = selectModelPage.selectModelAndContinue(model);

        //Then I should be redirected to the Results page and the header should contain make of the equipment
        assertTrue(resultsPage.headerContains(expectedPageHeader), "Header contains correct text");

        //Recall title should be displayed
        assertTrue(resultsPage.recallTitleIsDisplayed(expectedRecallTitle), "Recall title is displayed");

        //When I expand the first recall
        resultsPage.clickTheFirstRecallAccordion();
        // The following sentence is visible: "How to check if the equipment is recalled"
        assertTrue(resultsPage.isHowToCheckSentenceValid(RECALL_TYPE_EQUIPMENT), "'How to check if the equipment is recalled' is visible");
        // The following sentence is visible: "Number of affected equipments"
        assertTrue(resultsPage.isNumberOfAffectedVehiclesValid(RECALL_TYPE_EQUIPMENT), "'Number of affected equipment' is visible");

        //When I click the "Search again" button, I am redirected to the landing page
        resultsPage.clickSearchAgainButton();
    }

    @Test(description = "User can use the 'Back' buttons to get from the vehicle results page to the landing page")
    public void vehicleBackButtonsTest() throws UnsupportedEncodingException {
        // When I am on the results page
        ResultsPage resultsPage = recalls.goToResultsPage(RESULTS_PAGE_PATH_VEHICLE, "vehicle", make, model, year);
        // And I click the 'Back' button, I am redirected to the year selection page
        EnterYearPage enterYearPage = (EnterYearPage) resultsPage.clickBackButton(EnterYearPage.class);
        // I click the 'Back' button again, I am redirected to the make page
        SelectModelPage selectModelPage = enterYearPage.clickBackButton(SelectVehicleModelPage.class);
        // I click the 'Back' button again, I am redirected to the make page
        SelectMakePage selectMakePage = selectModelPage.clickBackButton(SelectVehicleMakePage.class);
        // I click the 'Back' button again, I am redirected to the landing page
        selectMakePage.clickBackButton();
    }

    @Test(description = "User can use the 'Back' buttons to get from the equipment results page to the landing page")
    public void equipmentBackButtonsTest() throws UnsupportedEncodingException {
        // When I am on the results page
        ResultsPage resultsPage = recalls.goToResultsPage(RESULTS_PAGE_PATH_EQUIPMENT, "equipment", make, model);
        // I click the 'Back' button again, I am redirected to the make page
        SelectEquipmentModelPage selectModelPage = (SelectEquipmentModelPage) resultsPage.clickBackButton(SelectEquipmentModelPage.class);
        // I click the 'Back' button again, I am redirected to the make page
        SelectMakePage selectMakePage = selectModelPage.clickBackButton(SelectEquipmentMakePage.class);
        // I click the 'Back' button again, I am redirected to the landing page
        selectMakePage.clickBackButton();
    }
}
