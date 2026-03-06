package selenium;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.Dimension;
import org.openqa.selenium.ElementClickInterceptedException;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

public class HomePageTest {

    private WebDriver driver;
    private WebDriverWait wait;

    private final String BASE_URL = "http://localhost:5173";

    @BeforeEach
    void setUp() {
        driver = new ChromeDriver();
        driver.manage().window().setSize(new Dimension(1400, 1000));
        wait = new WebDriverWait(driver, Duration.ofSeconds(10));
    }

    @AfterEach
    void tearDown() {
        if (driver != null) {
            driver.quit();
        }
    }

    private void clickElement(By by) {
        WebElement element = wait.until(
                ExpectedConditions.presenceOfElementLocated(by)
        );

        ((JavascriptExecutor) driver).executeScript(
                "arguments[0].scrollIntoView({block: 'center'});", element
        );

        wait.until(ExpectedConditions.visibilityOf(element));

        try {
            element.click();
        } catch (ElementClickInterceptedException e) {
            ((JavascriptExecutor) driver).executeScript("arguments[0].click();", element);
        }
    }

    @Test
    void homePageLoadsSuccessfully() {
        driver.get(BASE_URL + "/");

        WebElement body = wait.until(
                ExpectedConditions.visibilityOfElementLocated(By.tagName("body"))
        );

        String pageText = body.getText().toLowerCase();

        assertTrue(pageText.contains("welcome to ocean view resort"));
        assertTrue(pageText.contains("luxury"));
        assertTrue(pageText.contains("stay"));
        assertTrue(pageText.contains("ocean"));
        assertTrue(pageText.contains("experience"));
    }

    @Test
    void shouldDisplayHeroSectionContent() {
        driver.get(BASE_URL + "/");

        WebElement body = wait.until(
                ExpectedConditions.visibilityOfElementLocated(By.tagName("body"))
        );

        String pageText = body.getText().toLowerCase();

        assertTrue(pageText.contains("book rooms, manage reservations, billing, and customer requests"));
        assertTrue(pageText.contains("get started"));
        assertTrue(pageText.contains("learn more"));
    }

    @Test
    void shouldNavigateToAboutPageWhenLearnMoreClicked() {
        driver.get(BASE_URL + "/");

        clickElement(By.linkText("Learn More"));

        wait.until(ExpectedConditions.urlContains("/about"));
        assertTrue(driver.getCurrentUrl().contains("/about"));
    }

    @Test
    void shouldNavigateToReservationsFromHeroGetStarted() {
        driver.get(BASE_URL + "/");

        List<WebElement> getStartedButtons = wait.until(
                ExpectedConditions.visibilityOfAllElementsLocatedBy(By.linkText("Get Started"))
        );

        assertFalse(getStartedButtons.isEmpty());

        WebElement firstButton = getStartedButtons.get(0);

        ((JavascriptExecutor) driver).executeScript(
                "arguments[0].scrollIntoView({block: 'center'});", firstButton
        );

        try {
            firstButton.click();
        } catch (ElementClickInterceptedException e) {
            ((JavascriptExecutor) driver).executeScript("arguments[0].click();", firstButton);
        }

        wait.until(ExpectedConditions.urlContains("/login"));
        assertTrue(driver.getCurrentUrl().contains("/login"));
    }

    @Test
    void shouldDisplayServicesSection() {
        driver.get(BASE_URL + "/");

        WebElement body = wait.until(
                ExpectedConditions.visibilityOfElementLocated(By.tagName("body"))
        );

        String pageText = body.getText().toLowerCase();

        assertTrue(pageText.contains("we provide modern & premium resort services"));
        assertTrue(pageText.contains("reservation management"));
        assertTrue(pageText.contains("email confirmations"));
        assertTrue(pageText.contains("billing automation"));
        assertTrue(pageText.contains("customer support"));
    }

    @Test
    void shouldDisplayAllRoomCards() {
        driver.get(BASE_URL + "/");

        WebElement body = wait.until(
                ExpectedConditions.visibilityOfElementLocated(By.tagName("body"))
        );

        String pageText = body.getText();

        assertTrue(pageText.contains("Standard Room"));
        assertTrue(pageText.contains("Deluxe Room"));
        assertTrue(pageText.contains("Suite Room"));

        assertTrue(pageText.contains("Comfortable stay with essential facilities and clean experience."));
        assertTrue(pageText.contains("Premium comfort with modern interior and better views."));
        assertTrue(pageText.contains("Luxury suite with maximum space and resort-level service."));
    }

    @Test
    void shouldNavigateToReservationsFromServicesGetStarted() {
        driver.get(BASE_URL + "/");

        List<WebElement> getStartedButtons = wait.until(
                ExpectedConditions.visibilityOfAllElementsLocatedBy(By.linkText("Get Started"))
        );

        assertTrue(getStartedButtons.size() >= 2);

        WebElement secondButton = getStartedButtons.get(1);

        ((JavascriptExecutor) driver).executeScript(
                "arguments[0].scrollIntoView({block: 'center'});", secondButton
        );

        try {
            secondButton.click();
        } catch (ElementClickInterceptedException e) {
            ((JavascriptExecutor) driver).executeScript("arguments[0].click();", secondButton);
        }

        wait.until(ExpectedConditions.urlContains("/login"));
        assertTrue(driver.getCurrentUrl().contains("/login"));
    }

    @Test
    void shouldDisplayFeaturesSection() {
        driver.get(BASE_URL + "/");

        WebElement body = wait.until(
                ExpectedConditions.visibilityOfElementLocated(By.tagName("body"))
        );

        String pageText = body.getText();

        assertTrue(pageText.contains("Best Quality"));
        assertTrue(pageText.contains("Reliable service and professional user experience."));
        assertTrue(pageText.contains("Email Alerts"));
        assertTrue(pageText.contains("Automatic pending and confirmed reservation emails."));
        assertTrue(pageText.contains("Secure Access"));
        assertTrue(pageText.contains("Secure login and role-based access control."));
    }

    @Test
    void shouldDisplayThreeServiceCards() {
        driver.get(BASE_URL + "/");

        List<WebElement> cards = wait.until(
                ExpectedConditions.visibilityOfAllElementsLocatedBy(By.className("ov-card"))
        );

        assertEquals(3, cards.size());
    }

    @Test
    void shouldDisplayThreeFeatureBoxes() {
        driver.get(BASE_URL + "/");

        List<WebElement> features = wait.until(
                ExpectedConditions.visibilityOfAllElementsLocatedBy(By.className("ov-feature"))
        );

        assertEquals(3, features.size());
    }
}