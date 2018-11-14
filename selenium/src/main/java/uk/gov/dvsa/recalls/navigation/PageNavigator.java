package uk.gov.dvsa.recalls.navigation;

import uk.gov.dvsa.recalls.WebDriverConfiguratorRegistry;
import uk.gov.dvsa.recalls.config.webdriver.BaseAppDriver;
import uk.gov.dvsa.recalls.ui.base.Page;
import uk.gov.dvsa.recalls.ui.page.ResultsPage;

import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.text.MessageFormat;
import java.util.stream.Stream;

public class PageNavigator {

    public static <T extends Page> T goTo(Class<T> pageClass, Object... params) {

        GotoUrl urlAn = ((GotoUrl) Stream.of(pageClass.getAnnotations())
                .filter(a -> a.annotationType().equals(GotoUrl.class))
                .findFirst()
                .orElseThrow(RuntimeException::new));

        navigateToPath(MessageFormat.format(urlAn.value(), params));

        try {
            return pageClass.newInstance();
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    public static ResultsPage goToResultsPage(String path, String recallType, String make, String model) throws UnsupportedEncodingException {
        make = URLEncoder.encode(make, "UTF-8");
        model = URLEncoder.encode(model, "UTF-8");
        String fullPath = String.format(path, recallType, make, model);
        navigateToPath(fullPath);
        return new ResultsPage();
    }

    private static void navigateToPath(String path) {
        getDriver().navigateToPath(path);
    }

    private static BaseAppDriver getDriver() {
        return WebDriverConfiguratorRegistry.get().getDriver();
    }
}
