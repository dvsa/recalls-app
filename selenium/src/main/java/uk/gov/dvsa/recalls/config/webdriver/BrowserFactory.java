package uk.gov.dvsa.recalls.config.webdriver;

import org.openqa.selenium.remote.RemoteWebDriver;

public class BrowserFactory {

    public static BaseAppDriver createDriver(RemoteWebDriver remoteWebDriver) {

        return new RemoteAppWebDriver(remoteWebDriver);
    }
}
