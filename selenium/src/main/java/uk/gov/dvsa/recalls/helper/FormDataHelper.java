package uk.gov.dvsa.recalls.helper;

import org.openqa.selenium.Keys;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.Select;

public class FormDataHelper {

    public static void selectFromDropDownByValue(WebElement element, String value) {
        Select dropdown = new Select(element);
        dropdown.selectByValue(value);
        element.sendKeys(Keys.TAB);
    }

    public static void selectFromDropDownByVisibleText(WebElement element, String value) {
        Select dropdown = new Select(element);
        dropdown.selectByVisibleText(value);
    }
}
