package uk.gov.dvsa.recalls.ui.page;

import uk.gov.dvsa.recalls.helper.FormDataHelper;

public class SelectVehicleModelPage extends SelectModelPage {
    @Override protected String getExpectedPageTitle() {
        return "What model is the vehicle?";
    }

    @Override
    public EnterYearPage selectModelAndContinue(String model) {
        selectModelAndContinueCommon(model);
        return new EnterYearPage();
    }
}
