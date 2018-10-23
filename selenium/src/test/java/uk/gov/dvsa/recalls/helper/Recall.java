package uk.gov.dvsa.recalls.helper;

import uk.gov.dvsa.recalls.navigation.PageNavigator;
import uk.gov.dvsa.recalls.ui.page.RecallInformationSearchPage;

public class Recall {

    public RecallInformationSearchPage goToRecallInformationSearchPage() {

        return PageNavigator.goTo(RecallInformationSearchPage.class);
    }
}
