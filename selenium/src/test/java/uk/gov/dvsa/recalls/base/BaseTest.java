package uk.gov.dvsa.recalls.base;

import org.testng.ITestResult;
import org.testng.annotations.AfterMethod;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Listeners;

import uk.gov.dvsa.recalls.WebDriverConfigurator;
import uk.gov.dvsa.recalls.WebDriverConfiguratorRegistry;
import uk.gov.dvsa.recalls.config.Configurator;
import uk.gov.dvsa.recalls.config.TestExecutionListener;
import uk.gov.dvsa.recalls.config.webdriver.BaseAppDriver;
import uk.gov.dvsa.recalls.helper.Recall;
import uk.gov.dvsa.recalls.logging.Logger;

import java.util.Date;

@Listeners(TestExecutionListener.class)
public abstract class BaseTest {

    protected Recall recalls = new Recall();
    protected BaseAppDriver driver = null;

    private static String buildScreenShotPath(ITestResult result) {

        String dir = Configurator.getErrorScreenshotPath() + "/" + Configurator.getBuildNumber();

        return String.format("%s/%s.%s_%s.png",
                dir,
                result.getTestClass().getName().replace("uk.gov.dvsa.recalls", ""),
                result.getName(),
                Configurator.getScreenshotDateFormat().format(new Date())
        );
    }

    @BeforeMethod(alwaysRun = true)
    public void setupBaseTest() {

        driver = WebDriverConfiguratorRegistry.get().getDriver();
        driver.setBaseUrl(Configurator.baseUrl());
    }

    @AfterMethod(alwaysRun = true)
    public void tearDown(ITestResult result) {

        if (result.isSuccess()) {
            if (null != driver) {
                driver.manage().deleteAllCookies();
            }
        } else {
            WebDriverConfigurator cachedDriver = WebDriverConfiguratorRegistry.get();

            // Take screenshot on test failure
            if (cachedDriver != null && result.getStatus() == ITestResult.FAILURE && Configurator.isErrorScreenshotEnabled()) {
                driver.takeScreenShot(buildScreenShotPath(result));
            }

            if (null != cachedDriver) {
                Logger.error("Tearing down webdriver because of test failure");
                cachedDriver.destroy();
                WebDriverConfiguratorRegistry.clear();
            }
            driver = null;
        }
    }
}
