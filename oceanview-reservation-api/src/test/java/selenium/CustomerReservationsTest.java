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

import static org.junit.jupiter.api.Assertions.*;

public class CustomerReservationsTest {

    private WebDriver driver;
    private WebDriverWait wait;

    private final String BASE_URL = "http://localhost:5173";

    // ==============================
    // FILL YOUR CUSTOMER LOGIN HERE
    // ==============================
    private final String CUSTOMER_EMAIL = "linukaofficial4@gmail.com";
    private final String CUSTOMER_PASSWORD = "A12345678";

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

    private void clickElement(By by) {
        WebElement element = wait.until(ExpectedConditions.presenceOfElementLocated(by));

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

    private void loginAsCustomer() {
        driver.get(BASE_URL + "/login");

        type(By.name("email"), CUSTOMER_EMAIL);
        type(By.name("password"), CUSTOMER_PASSWORD);
        clickElement(By.cssSelector("button[type='submit']"));

        wait.until(ExpectedConditions.urlContains("/customer/reservations"));
        assertTrue(driver.getCurrentUrl().contains("/customer/reservations"));
    }

    @Test
    void customerReservationsPageLoadsSuccessfully() {
        loginAsCustomer();

        WebElement body = wait.until(
                ExpectedConditions.visibilityOfElementLocated(By.tagName("body"))
        );

        String pageText = body.getText();

        assertTrue(pageText.contains("Make a Reservation"));
        assertTrue(pageText.contains("Reservation Details"));
        assertTrue(pageText.contains("Customer Information"));
        assertTrue(pageText.contains("Booking Information"));
    }

    @Test
    void shouldDisplayMainReservationFields() {
        loginAsCustomer();

        assertTrue(wait.until(ExpectedConditions.visibilityOfElementLocated(By.xpath("//input[@placeholder='Your full name']"))).isDisplayed());
        assertTrue(wait.until(ExpectedConditions.visibilityOfElementLocated(By.xpath("//input[@placeholder='you@example.com']"))).isDisplayed());
        assertTrue(wait.until(ExpectedConditions.visibilityOfElementLocated(By.xpath("//input[@placeholder='07xxxxxxxx']"))).isDisplayed());
        assertTrue(wait.until(ExpectedConditions.visibilityOfElementLocated(By.xpath("//textarea[@placeholder='Arrival time, accessibility needs, baby cot, food allergies, etc.']"))).isDisplayed());
    }

    @Test
    void shouldDisplayRoomTypeOptions() {
        loginAsCustomer();

        WebElement roomType = wait.until(
                ExpectedConditions.visibilityOfElementLocated(By.tagName("select"))
        );

        String selectText = roomType.getText();

        assertTrue(selectText.contains("Standard"));
        assertTrue(selectText.contains("Deluxe"));
        assertTrue(selectText.contains("Suite"));
    }



    @Test
    void shouldShowValidationForInvalidEmail() {
        loginAsCustomer();

        WebElement email = wait.until(
                ExpectedConditions.visibilityOfElementLocated(By.xpath("//input[@placeholder='you@example.com']"))
        );

        email.clear();
        email.sendKeys("wrong-email");

        clickElement(By.cssSelector("button[type='submit']"));

        String pageText = driver.findElement(By.tagName("body")).getText();
        assertTrue(pageText.contains("Enter a valid email."));
    }

    @Test
    void shouldShowValidationForInvalidPhoneNumber() {
        loginAsCustomer();

        WebElement phone = wait.until(
                ExpectedConditions.visibilityOfElementLocated(By.xpath("//input[@placeholder='07xxxxxxxx']"))
        );

        phone.clear();
        phone.sendKeys("123");

        clickElement(By.cssSelector("button[type='submit']"));

        String pageText = driver.findElement(By.tagName("body")).getText();
        assertTrue(pageText.contains("Enter a valid phone number."));
    }

    @Test
    void shouldShowValidationForInvalidCheckoutDate() {
        loginAsCustomer();

        WebElement checkIn = wait.until(
                ExpectedConditions.visibilityOfAllElementsLocatedBy(By.cssSelector("input[type='date']"))
        ).get(0);

        WebElement checkOut = wait.until(
                ExpectedConditions.visibilityOfAllElementsLocatedBy(By.cssSelector("input[type='date']"))
        ).get(1);

        checkIn.clear();
        checkIn.sendKeys("2026-03-20");

        checkOut.clear();
        checkOut.sendKeys("2026-03-19");

        clickElement(By.cssSelector("button[type='submit']"));

        String pageText = driver.findElement(By.tagName("body")).getText();
        assertTrue(pageText.contains("Check-out date must be after check-in date."));
    }

    @Test
    void shouldResetBookingFieldsWhenResetButtonClicked() {
        loginAsCustomer();

        WebElement roomType = wait.until(ExpectedConditions.visibilityOfElementLocated(By.tagName("select")));
        roomType.sendKeys("Suite");

        WebElement adults = driver.findElement(By.xpath("//input[@placeholder='Adults']"));
        WebElement children = driver.findElement(By.xpath("//input[@placeholder='Children']"));
        WebElement specialRequests = driver.findElement(By.tagName("textarea"));

        adults.clear();
        adults.sendKeys("3");

        children.clear();
        children.sendKeys("2");

        specialRequests.clear();
        specialRequests.sendKeys("Need extra pillows.");

        clickElement(By.xpath("//button[contains(.,'Reset Form')]"));

        assertEquals("Standard", roomType.getAttribute("value"));
        assertEquals("1", adults.getAttribute("value"));
        assertEquals("0", children.getAttribute("value"));
        assertEquals("", specialRequests.getAttribute("value"));
    }

    @Test
    void shouldDisplayRightSideInformationCards() {
        loginAsCustomer();

        String pageText = wait.until(
                ExpectedConditions.visibilityOfElementLocated(By.tagName("body"))
        ).getText();

        assertTrue(pageText.contains("What happens next?"));
        assertTrue(pageText.contains("Instant email"));
        assertTrue(pageText.contains("Staff review"));
        assertTrue(pageText.contains("Track status"));

        assertTrue(pageText.contains("Tips"));
        assertTrue(pageText.contains("Use your real email address to receive confirmations."));
        assertTrue(pageText.contains("Check-out must be after check-in"));
        assertTrue(pageText.contains("Adults must be at least 1."));
    }
}