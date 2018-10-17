package uk.gov.dvsa.recalls.navigation;

import uk.gov.dvsa.recalls.WebDriverConfiguratorRegistry;
import uk.gov.dvsa.recalls.ui.base.Page;

import java.text.MessageFormat;
import java.util.stream.Stream;

public class PageNavigator {

    public static <T extends Page> T goTo(Class<T> pageClass, Object... params) {

        GotoUrl urlAn = ((GotoUrl) Stream.of(pageClass.getAnnotations())
                .filter(a -> a.annotationType().equals(GotoUrl.class))
                .findFirst()
                .orElseThrow(RuntimeException::new));

        WebDriverConfiguratorRegistry.get().getDriver().navigateToPath(MessageFormat.format(urlAn.value(), params));

        try {
            return pageClass.newInstance();
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
