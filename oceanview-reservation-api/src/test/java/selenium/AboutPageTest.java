package selenium;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.*;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;

import static org.junit.jupiter.api.Assertions.*;

public class AboutPageTest {

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

    private void type(By by, String text) {
        WebElement element = wait.until(ExpectedConditions.visibilityOfElementLocated(by));
        element.clear();
        element.sendKeys(text);
    }

    private void clickButton(By by) {
        WebElement button = wait.until(ExpectedConditions.presenceOfElementLocated(by));
        ((JavascriptExecutor) driver).executeScript(
                "arguments[0].scrollIntoView({block: 'center'});", button
        );
        wait.until(ExpectedConditions.visibilityOf(button));

        try {
            button.click();
        } catch (ElementClickInterceptedException e) {
            ((JavascriptExecutor) driver).executeScript("arguments[0].click();", button);
        }
    }

    @Test
    void aboutPageLoadsSuccessfully() {
        driver.get(BASE_URL + "/about");

        WebElement title = wait.until(
                ExpectedConditions.visibilityOfElementLocated(By.tagName("h1"))
        );

        assertTrue(title.getText().contains("Premium hospitality"));
        assertTrue(driver.getPageSource().contains("ABOUT OCEAN VIEW RESORT"));
    }

    @Test
    void shouldDisplayHeroSectionContent() {
        driver.get(BASE_URL + "/about");

        WebElement body = wait.until(
                ExpectedConditions.visibilityOfElementLocated(By.tagName("body"))
        );

        String pageText = body.getText().toLowerCase();

        assertTrue(pageText.contains("premium hospitality in"));
        assertTrue(pageText.contains("sri lanka"));
        assertTrue(pageText.contains("luxury coastal experience"));
        assertTrue(pageText.contains("luxury rooms"));
        assertTrue(pageText.contains("ocean view"));
        assertTrue(pageText.contains("24/7 support"));
    }

    @Test
    void shouldDisplayWhoWeAreSection() {
        driver.get(BASE_URL + "/about");

        assertTrue(driver.getPageSource().contains("Who we are"));
        assertTrue(driver.getPageSource().contains("Online reservation creation and management"));
        assertTrue(driver.getPageSource().contains("Reservation confirmation workflow with email notifications"));
        assertTrue(driver.getPageSource().contains("Billing management with tax, service charge, and discounts"));
        assertTrue(driver.getPageSource().contains("Customer question submission and email replies"));
    }

    @Test
    void shouldDisplayContactInfoBoxes() {
        driver.get(BASE_URL + "/about");

        assertTrue(driver.getPageSource().contains("Location"));
        assertTrue(driver.getPageSource().contains("Galle, Sri Lanka"));
        assertTrue(driver.getPageSource().contains("Email"));
        assertTrue(driver.getPageSource().contains("restinoceanview@gmail.com"));
        assertTrue(driver.getPageSource().contains("Support"));
        assertTrue(driver.getPageSource().contains("Fast response via email"));
    }

    @Test
    void shouldDisplayVisionAndMission() {
        driver.get(BASE_URL + "/about");

        assertTrue(driver.getPageSource().contains("Our Vision"));
        assertTrue(driver.getPageSource().contains("Our Mission"));
        assertTrue(driver.getPageSource().contains("To become a leading luxury resort experience in Sri Lanka"));
        assertTrue(driver.getPageSource().contains("To simplify reservations, billing, and customer support"));
    }

    @Test
    void shouldDisplayStatsSection() {
        driver.get(BASE_URL + "/about");

        assertTrue(driver.getPageSource().contains("Room Types"));
        assertTrue(driver.getPageSource().contains("Standard • Deluxe • Suite"));
        assertTrue(driver.getPageSource().contains("System Modules"));
        assertTrue(driver.getPageSource().contains("Reservations • Billing • Support"));
        assertTrue(driver.getPageSource().contains("Email Updates"));
        assertTrue(driver.getPageSource().contains("Pending • Confirmed • OTP"));
    }

    @Test
    void shouldDisplayQuestionFormFields() {
        driver.get(BASE_URL + "/about");

        assertTrue(wait.until(ExpectedConditions.visibilityOfElementLocated(By.name("customerName"))).isDisplayed());
        assertTrue(wait.until(ExpectedConditions.visibilityOfElementLocated(By.name("customerEmail"))).isDisplayed());
        assertTrue(wait.until(ExpectedConditions.visibilityOfElementLocated(By.name("subject"))).isDisplayed());
        assertTrue(wait.until(ExpectedConditions.visibilityOfElementLocated(By.name("message"))).isDisplayed());

        assertTrue(driver.getPageSource().contains("Send Question"));
        assertTrue(driver.getPageSource().contains("Note: You will receive a reply to your email address."));
    }

    @Test
    void shouldClearFormFields() {
        driver.get(BASE_URL + "/about");

        type(By.name("customerName"), "Linuka Shehan");
        type(By.name("customerEmail"), "linuka@test.com");
        type(By.name("subject"), "Room prices");
        type(By.name("message"), "I need details about room prices.");

        clickButton(By.xpath("//button[text()='Clear']"));

        assertEquals("", driver.findElement(By.name("customerName")).getAttribute("value"));
        assertEquals("", driver.findElement(By.name("customerEmail")).getAttribute("value"));
        assertEquals("", driver.findElement(By.name("subject")).getAttribute("value"));
        assertEquals("", driver.findElement(By.name("message")).getAttribute("value"));
    }

    @Test
    void shouldSubmitQuestionSuccessfully() {
        driver.get(BASE_URL + "/about");

        type(By.name("customerName"), "Linuka Shehan");
        type(By.name("customerEmail"), "linuka" + System.currentTimeMillis() + "@test.com");
        type(By.name("subject"), "Reservation details");
        type(By.name("message"), "I would like to know more about room availability.");

        clickButton(By.xpath("//button[contains(text(),'Submit Question')]"));

        WebElement alertBox = wait.until(
                ExpectedConditions.visibilityOfElementLocated(By.className("ov-alert"))
        );

        String alertText = alertBox.getText().toLowerCase();
        System.out.println("Success alert: " + alertText);

        assertTrue(alertText.contains("question submitted successfully")
                || alertText.contains("email you soon")
                || alertText.contains("success"));

        assertEquals("", driver.findElement(By.name("customerName")).getAttribute("value"));
        assertEquals("", driver.findElement(By.name("customerEmail")).getAttribute("value"));
        assertEquals("", driver.findElement(By.name("subject")).getAttribute("value"));
        assertEquals("", driver.findElement(By.name("message")).getAttribute("value"));
    }

    @Test
    void shouldShowErrorMessageForInvalidSubmission() {
        driver.get(BASE_URL + "/about");

        type(By.name("customerName"), "Linuka Shehan");
        type(By.name("customerEmail"), "wrong-email-format");
        type(By.name("subject"), "Test subject");
        type(By.name("message"), "Test message");

        clickButton(By.xpath("//button[contains(text(),'Submit Question')]"));

        // HTML5 email validation may stop form submit before backend call
        WebElement emailInput = driver.findElement(By.name("customerEmail"));
        String validationMessage = emailInput.getAttribute("validationMessage");

        assertTrue(
                !validationMessage.isEmpty()
                        || driver.getPageSource().contains("Please check your inputs.")
                        || driver.getPageSource().contains("Failed to submit question.")
                        || driver.getPageSource().contains("Something went wrong.")
        );
    }

    @Test
    void shouldShowLoadingStateOnSubmit() {
        driver.get(BASE_URL + "/about");

        type(By.name("customerName"), "Linuka Shehan");
        type(By.name("customerEmail"), "linuka" + System.currentTimeMillis() + "@test.com");
        type(By.name("subject"), "Inquiry");
        type(By.name("message"), "Please send more information.");

        WebElement submitButton = driver.findElement(By.xpath("//button[contains(text(),'Submit Question')]"));

        ((JavascriptExecutor) driver).executeScript(
                "arguments[0].scrollIntoView({block: 'center'});", submitButton
        );

        try {
            submitButton.click();
        } catch (ElementClickInterceptedException e) {
            ((JavascriptExecutor) driver).executeScript("arguments[0].click();", submitButton);
        }

        assertTrue(
                driver.getPageSource().contains("Sending...")
                        || driver.getPageSource().contains("Question submitted successfully")
                        || driver.getPageSource().contains("We will email you soon.")
        );
    }

    @Test
    void shouldDisplayHelpItems() {
        driver.get(BASE_URL + "/about");

        assertTrue(driver.getPageSource().contains("Have a question?"));
        assertTrue(driver.getPageSource().contains("Email reply available"));
        assertTrue(driver.getPageSource().contains("Fast response time"));
        assertTrue(driver.getPageSource().contains("Your data is protected"));
    }
}