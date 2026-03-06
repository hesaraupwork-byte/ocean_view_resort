package selenium;

import org.junit.jupiter.api.*;
import org.openqa.selenium.*;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;

import static org.junit.jupiter.api.Assertions.*;

public class LoginPageTest {

    private WebDriver driver;
    private WebDriverWait wait;

    // Change this if your frontend runs on another port
    private final String BASE_URL = "http://localhost:5173";

    @BeforeEach
    void setUp() {
        driver = new ChromeDriver();
        driver.manage().window().maximize();
        wait = new WebDriverWait(driver, Duration.ofSeconds(10));
    }
    

    @AfterEach
    void tearDown() {
        if (driver != null) {
            driver.quit();
        }
    }

    @Test
    void loginPageLoadsSuccessfully() {
        driver.get(BASE_URL + "/login");

        WebElement heading = wait.until(
                ExpectedConditions.visibilityOfElementLocated(By.tagName("h3"))
        );

        assertEquals("Login", heading.getText());
        assertTrue(driver.getPageSource().contains("Sign in to manage your reservations and account."));
    }

    @Test
    void shouldShowValidationWhenFieldsAreEmpty() {
        driver.get(BASE_URL + "/login");

        WebElement submitBtn = driver.findElement(By.cssSelector("button[type='submit']"));
        submitBtn.click();

        WebElement emailError = wait.until(
                ExpectedConditions.visibilityOfElementLocated(By.className("invalid-feedback"))
        );

        assertTrue(emailError.getText().contains("Email is required."));
        assertTrue(driver.getPageSource().contains("Password is required."));
    }

    @Test
    void shouldShowValidationForInvalidEmail() {
        driver.get(BASE_URL + "/login");

        WebElement emailInput = driver.findElement(By.name("email"));
        WebElement passwordInput = driver.findElement(By.name("password"));
        WebElement submitBtn = driver.findElement(By.cssSelector("button[type='submit']"));

        emailInput.sendKeys("wrongemail");
        passwordInput.sendKeys("123456");
        submitBtn.click();

        WebElement emailError = wait.until(
                ExpectedConditions.visibilityOfElementLocated(By.className("invalid-feedback"))
        );

        assertEquals("Enter a valid email address.", emailError.getText());
    }

    @Test
    void shouldShowValidationForShortPassword() {
        driver.get(BASE_URL + "/login");

        WebElement emailInput = driver.findElement(By.name("email"));
        WebElement passwordInput = driver.findElement(By.name("password"));
        WebElement submitBtn = driver.findElement(By.cssSelector("button[type='submit']"));

        emailInput.sendKeys("test@example.com");
        passwordInput.sendKeys("123");
        submitBtn.click();

        assertTrue(driver.getPageSource().contains("Password must be at least 6 characters."));
    }

    @Test
    void shouldNavigateToForgotPasswordPage() {
        driver.get(BASE_URL + "/login");

        WebElement forgotLink = driver.findElement(By.linkText("Forgot password?"));
        forgotLink.click();

        wait.until(ExpectedConditions.urlContains("/forgot-password"));
        assertTrue(driver.getCurrentUrl().contains("/forgot-password"));
    }

    @Test
    void shouldNavigateToRegisterPage() {
        driver.get(BASE_URL + "/login");

        WebElement signUpLink = driver.findElement(By.linkText("Sign up"));
        signUpLink.click();

        wait.until(ExpectedConditions.urlContains("/register"));
        assertTrue(driver.getCurrentUrl().contains("/register"));
    }

    @Test
    void shouldTogglePasswordVisibility() {
        driver.get(BASE_URL + "/login");

        WebElement passwordInput = driver.findElement(By.name("password"));
        WebElement toggleBtn = driver.findElement(By.cssSelector("button[aria-label='Show password']"));

        assertEquals("password", passwordInput.getAttribute("type"));

        toggleBtn.click();
        assertEquals("text", passwordInput.getAttribute("type"));
    }

    @Test
    void shouldLoginSuccessfullyWithValidCredentials() {
        driver.get(BASE_URL + "/login");

        WebElement emailInput = driver.findElement(By.name("email"));
        WebElement passwordInput = driver.findElement(By.name("password"));
        WebElement submitBtn = driver.findElement(By.cssSelector("button[type='submit']"));

        // Change these according to your database test account
        emailInput.sendKeys("testuser3@gmail.com");
        passwordInput.sendKeys("A12345678");
        submitBtn.click();

        wait.until(ExpectedConditions.or(
                ExpectedConditions.urlContains("/admin/users"),
                ExpectedConditions.urlContains("/staff/reservations"),
                ExpectedConditions.urlContains("/customer/reservations")
        ));

        String currentUrl = driver.getCurrentUrl();

        assertTrue(
                currentUrl.contains("/admin/users") ||
                        currentUrl.contains("/staff/reservations") ||
                        currentUrl.contains("/customer/reservations")
        );
    }

    @Test
    void shouldShowErrorMessageForInvalidCredentials() {
        driver.get(BASE_URL + "/login");

        WebElement emailInput = driver.findElement(By.name("email"));
        WebElement passwordInput = driver.findElement(By.name("password"));
        WebElement submitBtn = driver.findElement(By.cssSelector("button[type='submit']"));

        emailInput.sendKeys("wronguser@test.com");
        passwordInput.sendKeys("A1234567");
        submitBtn.click();

        WebElement alertBox = wait.until(
                ExpectedConditions.visibilityOfElementLocated(By.className("ov-alert"))
        );

        assertFalse(alertBox.getText().trim().isEmpty());
    }
}