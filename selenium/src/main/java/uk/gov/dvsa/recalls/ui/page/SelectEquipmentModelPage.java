package uk.gov.dvsa.recalls.ui.page;

public class SelectEquipmentModelPage extends SelectModelPage {
    @Override protected String getExpectedPageTitle() {
        return "What model is the equipment?";
    }

    @Override public ResultsPage selectModelAndContinue(String model) {
        selectModelAndContinueCommon(model);
        return new ResultsPage();
    }
}
