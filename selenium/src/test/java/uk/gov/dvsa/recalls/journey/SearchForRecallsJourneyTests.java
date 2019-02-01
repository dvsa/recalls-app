package uk.gov.dvsa.recalls.journey;

import org.testng.annotations.Test;

import uk.gov.dvsa.recalls.base.BaseTest;
import uk.gov.dvsa.recalls.ui.page.*;

import java.io.UnsupportedEncodingException;

import static org.testng.Assert.assertTrue;

public class SearchForRecallsJourneyTests extends BaseTest {

    public static final String RESULTS_PAGE_PATH_VEHICLE = "/recall-type/%s/make/%s/model/%s/year/%s/recalls";
    public static final String RESULTS_PAGE_PATH_EQUIPMENT = "/recall-type/%s/make/%s/model/%s/recalls";
    public final String RECALL_TYPE_VEHICLE = "vehicle";
    public final String RECALL_TYPE_VEHICLE_PLURAL = "vehicles";
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
        selectMakePage.clickContinueWithNoOptionsSelected();
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

        ResultsPage resultsPage = (ResultsPage) yearPage.enterYearAndContinue(year, ResultsPage.class);

        //Then I should be redirected to the Results page and the header should contain make of the vehicle
        assertTrue(resultsPage.headerContains(expectedPageHeader), "Header contains correct text");

        //Recall title should be displayed
        assertTrue(resultsPage.recallTitleIsDisplayed(expectedRecallTitle), "Recall title is displayed");

        //When I expand the first recall
        resultsPage.clickTheFirstRecallAccordion();
        // The following sentence is visible: "How to check if the vehicle is recalled"
        assertTrue(resultsPage.isHowToCheckSentenceValid(RECALL_TYPE_VEHICLE), "'How to check if the vehicle is recalled' is visible");
        // The following sentence is visible: "Number of affected vehicles"
        assertTrue(resultsPage.isNumberOfAffectedRecallTypesHeaderValid(RECALL_TYPE_VEHICLE_PLURAL), "'Number of affected vehicles' is visible");

        //When I click the "Search again" button, I am redirected to the landing page
        resultsPage.clickSearchAgainButton();
    }

    @Test(description = "User can check recalls for an equipment of a particular make and model")
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
        selectMakePage.clickContinueWithNoOptionsSelected();
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
        assertTrue(resultsPage.isNumberOfAffectedRecallTypesHeaderValid(RECALL_TYPE_EQUIPMENT), "'Number of affected equipment' is visible");

        //When I click the "Search again" button, I am redirected to the landing page
        resultsPage.clickSearchAgainButton();
    }

    @Test(description = "User can use the 'Back' buttons to get from the vehicle results page to the landing page")
    public void vehicleBackButtonsTest() throws UnsupportedEncodingException {
        // When I am on the results page
        ResultsPage resultsPage = recalls.goToResultsPage(RESULTS_PAGE_PATH_VEHICLE, RECALL_TYPE_VEHICLE, make, model, year);
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
        ResultsPage resultsPage = recalls.goToResultsPage(RESULTS_PAGE_PATH_EQUIPMENT, RECALL_TYPE_EQUIPMENT, make, model);
        // I click the 'Back' button again, I am redirected to the make page
        SelectEquipmentModelPage selectModelPage = (SelectEquipmentModelPage) resultsPage.clickBackButton(SelectEquipmentModelPage.class);
        // I click the 'Back' button again, I am redirected to the make page
        SelectMakePage selectMakePage = selectModelPage.clickBackButton(SelectEquipmentMakePage.class);
        // I click the 'Back' button again, I am redirected to the landing page
        selectMakePage.clickBackButton();
    }

    @Test(description = "User can access page with more information, when not seeing particular make or model on the list")
    public void searchMakeAndModelIsNotOnTheListTest() {
        // Given I am a user of the site and I want to check vehicle recalls
        // I go to cvr home page
        RecallInformationSearchPage recallInformationSearchPage = recalls.goToRecallInformationSearchPage();

        // And I select vehicle recalls option
        // Then I'm redirected to the SelectMake page
        SelectVehicleMakePage selectMakePage = recallInformationSearchPage.selectVehicleRecallAndContinue();

        // I can't find particular make on the list, so I click 'Why is my vehicle make not listed?' link
        // Then I'm directed to the RecallNotListed page
        RecallNotListedPage recallNotListedPage = selectMakePage.clickWhyMakeIsNotListedLink();

        // When I'm on the RecallNotListed page
        // And I click the 'Check for other vehicle or equipment recalls' link
        // Then I'm redirected to cvr home page
        RecallInformationSearchPage recallInformationSearchPage2 = recallNotListedPage.clickCheckForOtherRecallsLink();

        // When I select equipment option
        SelectEquipmentMakePage selectEquipmentMakePage = recallInformationSearchPage2.selectEquipmentRecallAndContinue();

        // And I select valid make
        // Then I'm on the SelectModel page
        SelectEquipmentModelPage selectEquipmentModelPage = selectEquipmentMakePage.selectMakeAndContinue("COOPER");

        // I can't find particular model on the list, so I click 'Why is my vehicle model not listed?' link
        // Then I'm directed to the RecallNotListed page
        RecallNotListedPage recallNotListedPage2 = selectEquipmentModelPage.clickWhyModelIsNotListedLink();

        // When I click the 'back' button
        // Then I'm redirected back to SelectModel page
        recallNotListedPage2.clickBackButtonRedirectToEquipmentModelPage();
    }

    @Test(description = "User is informed there are no recalls for the vehicle he is searching for")
    public void searchNoResultsForGivenYearTest() throws UnsupportedEncodingException {
        String yearWithNoRecall = "2000";
        // When I am on the results page and I can see recalls
        ResultsPage resultsPage = recalls.goToResultsPage(RESULTS_PAGE_PATH_VEHICLE, RECALL_TYPE_VEHICLE, make, model, year);

        // And I click the 'Back' button
        // Then I am redirected to the year selection page
        EnterYearPage enterYearPage = (EnterYearPage) resultsPage.clickBackButton(EnterYearPage.class);

        // When I select a vehicle year without recalls
        // Then I get redirected to no results page
        NoResultsPage noResultsPage = (NoResultsPage)enterYearPage.enterYearAndContinue(yearWithNoRecall, NoResultsPage.class);

        // And I can navigate back to the home page
        noResultsPage.clickHomeLink();
    }
}
