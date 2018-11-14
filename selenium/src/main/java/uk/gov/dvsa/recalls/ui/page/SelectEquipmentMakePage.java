package uk.gov.dvsa.recalls.ui.page;

public class SelectEquipmentMakePage extends SelectMakePage {
    @Override protected String getExpectedPageTitle() {
        return "What make is the equipment?";
    }

    @Override public SelectEquipmentModelPage selectMakeAndContinue(String make) {
        selectMakePageCommon(make);
        return new SelectEquipmentModelPage();
    }
}
