package selenium;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.Dimension;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.ElementClickInterceptedException;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

public class RegisterPageTest {

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

    private void clickSubmitButton() {
        WebElement submitBtn = wait.until(
                ExpectedConditions.presenceOfElementLocated(By.cssSelector("button[type='submit']"))
        );

        ((JavascriptExecutor) driver).executeScript(
                "arguments[0].scrollIntoView({block: 'center'});", submitBtn
        );

        wait.until(ExpectedConditions.visibilityOf(submitBtn));

        try {
            submitBtn.click();
        } catch (ElementClickInterceptedException e) {
            ((JavascriptExecutor) driver).executeScript("arguments[0].click();", submitBtn);
        }
    }

    @Test
    void registerPageLoadsSuccessfully() {
        driver.get(BASE_URL + "/register");

        WebElement heading = wait.until(
                ExpectedConditions.visibilityOfElementLocated(By.tagName("h3"))
        );

        assertEquals("Create Account", heading.getText());
        assertTrue(driver.getPageSource().contains("Register to book rooms and manage your reservations."));
    }

    @Test
    void shouldShowValidationWhenRequiredFieldsAreEmpty() {
        driver.get(BASE_URL + "/register");

        clickSubmitButton();

        assertTrue(driver.getPageSource().contains("Full name is required."));
        assertTrue(driver.getPageSource().contains("Email is required."));
        assertTrue(driver.getPageSource().contains("Password is required."));
        assertTrue(driver.getPageSource().contains("Confirm password is required."));
    }

    @Test
    void shouldShowValidationForShortFullName() {
        driver.get(BASE_URL + "/register");

        type(By.name("fullName"), "Li");
        type(By.name("email"), "testuser@example.com");
        type(By.name("password"), "A123456");
        type(By.name("confirmPassword"), "A123456");
        clickSubmitButton();

        assertTrue(driver.getPageSource().contains("Full name is too short."));
    }

    @Test
    void shouldShowValidationForInvalidEmail() {
        driver.get(BASE_URL + "/register");

        type(By.name("fullName"), "Linuka Shehan");
        type(By.name("email"), "invalid-email");
        type(By.name("password"), "A123456");
        type(By.name("confirmPassword"), "A123456");
        clickSubmitButton();

        assertTrue(driver.getPageSource().contains("Enter a valid email address."));
    }

    @Test
    void shouldShowValidationForInvalidPhoneNumber() {
        driver.get(BASE_URL + "/register");

        type(By.name("fullName"), "Linuka Shehan");
        type(By.name("email"), "testuser@example.com");
        type(By.name("phone"), "abc12");
        type(By.name("password"), "A123456");
        type(By.name("confirmPassword"), "A123456");
        clickSubmitButton();

        assertTrue(driver.getPageSource().contains("Enter a valid phone number."));
    }

    @Test
    void shouldShowValidationWhenPasswordIsTooShort() {
        driver.get(BASE_URL + "/register");

        type(By.name("fullName"), "Linuka Shehan");
        type(By.name("email"), "testuser@example.com");
        type(By.name("password"), "A123");
        type(By.name("confirmPassword"), "A123");
        clickSubmitButton();

        assertTrue(driver.getPageSource().contains("Password must be at least 6 characters."));
    }

    @Test
    void shouldShowValidationWhenPasswordHasNoUppercaseLetter() {
        driver.get(BASE_URL + "/register");

        type(By.name("fullName"), "Linuka Shehan");
        type(By.name("email"), "testuser@example.com");
        type(By.name("password"), "abc12345");
        type(By.name("confirmPassword"), "abc12345");
        clickSubmitButton();

        assertTrue(driver.getPageSource().contains("Add at least one uppercase letter."));
    }

    @Test
    void shouldShowValidationWhenPasswordHasNoNumber() {
        driver.get(BASE_URL + "/register");

        type(By.name("fullName"), "Linuka Shehan");
        type(By.name("email"), "testuser@example.com");
        type(By.name("password"), "Abcdefgh");
        type(By.name("confirmPassword"), "Abcdefgh");
        clickSubmitButton();

        assertTrue(driver.getPageSource().contains("Add at least one number."));
    }

    @Test
    void shouldShowValidationWhenPasswordsDoNotMatch() {
        driver.get(BASE_URL + "/register");

        type(By.name("fullName"), "Linuka Shehan");
        type(By.name("email"), "testuser@example.com");
        type(By.name("password"), "A123456");
        type(By.name("confirmPassword"), "A123999");
        clickSubmitButton();

        assertTrue(driver.getPageSource().contains("Passwords do not match."));
    }

    @Test
    void shouldTogglePasswordVisibility() {
        driver.get(BASE_URL + "/register");

        WebElement passwordInput = driver.findElement(By.name("password"));
        List<WebElement> toggleButtons = driver.findElements(By.cssSelector("button[aria-label='Show password']"));

        assertEquals("password", passwordInput.getAttribute("type"));
        assertFalse(toggleButtons.isEmpty());

        toggleButtons.get(0).click();

        assertEquals("text", passwordInput.getAttribute("type"));
    }

    @Test
    void shouldToggleConfirmPasswordVisibility() {
        driver.get(BASE_URL + "/register");

        WebElement confirmPasswordInput = driver.findElement(By.name("confirmPassword"));
        List<WebElement> toggleButtons = driver.findElements(By.cssSelector("button[aria-label='Show password']"));

        assertEquals("password", confirmPasswordInput.getAttribute("type"));
        assertTrue(toggleButtons.size() >= 2);

        toggleButtons.get(1).click();

        assertEquals("text", confirmPasswordInput.getAttribute("type"));
    }

    @Test
    void shouldNavigateToLoginPage() {
        driver.get(BASE_URL + "/register");

        WebElement loginLink = driver.findElement(By.linkText("Login"));
        loginLink.click();

        wait.until(ExpectedConditions.urlContains("/login"));
        assertTrue(driver.getCurrentUrl().contains("/login"));
    }

    @Test
    void shouldRegisterSuccessfullyWithValidData() {
        driver.get(BASE_URL + "/register");

        String uniqueEmail = "user" + System.currentTimeMillis() + "@test.com";

        type(By.name("fullName"), "Nadil Hesara");
        type(By.name("email"), uniqueEmail);
        type(By.name("phone"), "0771234567");
        type(By.name("password"), "A123456");
        type(By.name("confirmPassword"), "A123456");
        clickSubmitButton();

        WebElement alertBox = wait.until(
                ExpectedConditions.visibilityOfElementLocated(By.className("ov-alert"))
        );

        String alertText = alertBox.getText().toLowerCase();
        System.out.println("Success alert: " + alertText);

        assertTrue(alertText.contains("account created")
                || alertText.contains("success")
                || alertText.contains("redirecting"));

        wait.until(ExpectedConditions.urlContains("/login"));
        assertTrue(driver.getCurrentUrl().contains("/login"));
    }

    @Test
    void shouldShowErrorMessageForDuplicateOrFailedRegistration() {
        driver.get(BASE_URL + "/register");

        type(By.name("fullName"), "Existing User");
        type(By.name("email"), "admin@test.com");
        type(By.name("phone"), "0771234567");
        type(By.name("password"), "A123456");
        type(By.name("confirmPassword"), "A123456");
        clickSubmitButton();

        WebElement alertBox = wait.until(
                ExpectedConditions.visibilityOfElementLocated(By.className("ov-alert"))
        );

        assertFalse(alertBox.getText().trim().isEmpty());
    }
}