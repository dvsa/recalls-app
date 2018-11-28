package uk.gov.dvsa.recalls.helper;

import uk.gov.dvsa.recalls.navigation.PageNavigator;
import uk.gov.dvsa.recalls.ui.page.RecallInformationSearchPage;
import uk.gov.dvsa.recalls.ui.page.ResultsPage;

import java.io.UnsupportedEncodingException;

public class Recall {

    public RecallInformationSearchPage goToRecallInformationSearchPage() {

        return PageNavigator.goTo(RecallInformationSearchPage.class);
    }

    public ResultsPage goToResultsPage(String path, String recallType, String make, String model, String year) throws UnsupportedEncodingException {

        return PageNavigator.goToResultsPage(path, recallType, make, model, year);
    }
}
