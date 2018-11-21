package uk.gov.dvsa.recalls.ui.page;

public class SelectVehicleMakePage extends SelectMakePage {
    @Override protected String getExpectedPageTitle() {
        return "What make is the vehicle?";
    }

    @Override public SelectVehicleModelPage selectMakeAndContinue(String make) {
        selectMakePageCommon(make);
        return new SelectVehicleModelPage();
    }
}
