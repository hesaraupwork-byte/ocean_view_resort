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

public class FaqPageTest {

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
    void faqPageLoadsSuccessfully() {
        driver.get(BASE_URL + "/faq");

        WebElement body = wait.until(
                ExpectedConditions.visibilityOfElementLocated(By.tagName("body"))
        );

        String pageText = body.getText().toLowerCase();

        assertTrue(pageText.contains("help center"));
        assertTrue(pageText.contains("frequently asked"));
        assertTrue(pageText.contains("questions"));
    }

    @Test
    void shouldDisplayHeroSectionContent() {
        driver.get(BASE_URL + "/faq");

        WebElement body = wait.until(
                ExpectedConditions.visibilityOfElementLocated(By.tagName("body"))
        );

        String pageText = body.getText().toLowerCase();

        assertTrue(pageText.contains("quick answers about reservations, emails, billing, and system access"));
        assertTrue(pageText.contains("reservations"));
        assertTrue(pageText.contains("emails"));
        assertTrue(pageText.contains("billing"));
        assertTrue(pageText.contains("security"));
    }

    @Test
    void shouldDisplayFaqHeading() {
        driver.get(BASE_URL + "/faq");

        WebElement heading = wait.until(
                ExpectedConditions.visibilityOfElementLocated(By.xpath("//h2[contains(text(),'FAQs')]"))
        );

        assertTrue(heading.isDisplayed());
    }

    @Test
    void shouldDisplayAllFaqQuestions() {
        driver.get(BASE_URL + "/faq");

        String pageText = wait.until(
                ExpectedConditions.visibilityOfElementLocated(By.tagName("body"))
        ).getText();

        assertTrue(pageText.contains("How do I make a reservation?"));
        assertTrue(pageText.contains("Can I cancel or change my reservation?"));
        assertTrue(pageText.contains("Will I receive an email after booking?"));
        assertTrue(pageText.contains("Do I need an account to reserve?"));
        assertTrue(pageText.contains("What payment methods are supported?"));
        assertTrue(pageText.contains("Is my data secure?"));
    }

    @Test
    void shouldHaveFirstAccordionOpenByDefault() {
        driver.get(BASE_URL + "/faq");

        WebElement firstAnswer = wait.until(
                ExpectedConditions.visibilityOfElementLocated(By.id("c-0"))
        );

        assertTrue(firstAnswer.getAttribute("class").contains("show"));
        assertTrue(firstAnswer.getText().contains("Go to the “Make Reservation” page"));
    }

    @Test
    void shouldOpenSecondAccordionWhenClicked() {
        driver.get(BASE_URL + "/faq");

        WebElement secondQuestionBtn = wait.until(
                ExpectedConditions.elementToBeClickable(By.cssSelector("button[data-bs-target='#c-1']"))
        );

        clickElement(By.cssSelector("button[data-bs-target='#c-1']"));

        WebElement secondAnswer = wait.until(
                ExpectedConditions.visibilityOfElementLocated(By.id("c-1"))
        );

        assertTrue(secondAnswer.getAttribute("class").contains("show"));
        assertTrue(secondAnswer.getText().contains("If your reservation is still pending"));
    }

    @Test
    void shouldNavigateToReservationsFromTopMakeReservationButton() {
        driver.get(BASE_URL + "/faq");

        List<WebElement> reservationButtons = wait.until(
                ExpectedConditions.visibilityOfAllElementsLocatedBy(By.linkText("Make Reservation"))
        );

        assertFalse(reservationButtons.isEmpty());

        WebElement topButton = reservationButtons.get(0);

        ((JavascriptExecutor) driver).executeScript(
                "arguments[0].scrollIntoView({block: 'center'});", topButton
        );

        try {
            topButton.click();
        } catch (ElementClickInterceptedException e) {
            ((JavascriptExecutor) driver).executeScript("arguments[0].click();", topButton);
        }

        wait.until(ExpectedConditions.urlContains("/login"));
        assertTrue(driver.getCurrentUrl().contains("/login"));
    }

    @Test
    void shouldNavigateToAboutFromLearnMoreButton() {
        driver.get(BASE_URL + "/faq");

        clickElement(By.linkText("Learn More"));

        wait.until(ExpectedConditions.urlContains("/about"));
        assertTrue(driver.getCurrentUrl().contains("/about"));
    }

    @Test
    void shouldDisplayQuickTipsSection() {
        driver.get(BASE_URL + "/faq");

        String pageText = wait.until(
                ExpectedConditions.visibilityOfElementLocated(By.tagName("body"))
        ).getText();

        assertTrue(pageText.contains("Quick Tips"));
        assertTrue(pageText.contains("Before booking, confirm your dates and room type"));
        assertTrue(pageText.contains("Average Response Time"));
        assertTrue(pageText.contains("Within 24 hours (Email Support)"));
        assertTrue(pageText.contains("Reservation Status"));
        assertTrue(pageText.contains("Pending → Confirmed"));
        assertTrue(pageText.contains("Secure Access"));
        assertTrue(pageText.contains("Role-based (Admin / Customer)"));
    }

    @Test
    void shouldDisplayBottomCtaSection() {
        driver.get(BASE_URL + "/faq");

        String pageText = wait.until(
                ExpectedConditions.visibilityOfElementLocated(By.tagName("body"))
        ).getText();

        assertTrue(pageText.contains("Ready to book your stay?"));
        assertTrue(pageText.contains("Start your reservation in a few steps"));
        assertTrue(pageText.contains("Fast reservation submission"));
        assertTrue(pageText.contains("Email confirmation & alerts"));
        assertTrue(pageText.contains("Secure customer and admin access"));
        assertTrue(pageText.contains("Start Now"));
        assertTrue(pageText.contains("Click below to create a new reservation."));
    }

    @Test
    void shouldNavigateToReservationsFromBottomMakeReservationButton() {
        driver.get(BASE_URL + "/faq");

        List<WebElement> reservationButtons = wait.until(
                ExpectedConditions.visibilityOfAllElementsLocatedBy(By.linkText("Make Reservation"))
        );

        assertTrue(reservationButtons.size() >= 2);

        WebElement bottomButton = reservationButtons.get(1);

        ((JavascriptExecutor) driver).executeScript(
                "arguments[0].scrollIntoView({block: 'center'});", bottomButton
        );

        try {
            bottomButton.click();
        } catch (ElementClickInterceptedException e) {
            ((JavascriptExecutor) driver).executeScript("arguments[0].click();", bottomButton);
        }

        wait.until(ExpectedConditions.urlContains("/login"));
        assertTrue(driver.getCurrentUrl().contains("/login"));
    }

    @Test
    void shouldDisplaySixAccordionItems() {
        driver.get(BASE_URL + "/faq");

        List<WebElement> accordionItems = wait.until(
                ExpectedConditions.visibilityOfAllElementsLocatedBy(By.className("accordion-item"))
        );

        assertEquals(6, accordionItems.size());
    }
}