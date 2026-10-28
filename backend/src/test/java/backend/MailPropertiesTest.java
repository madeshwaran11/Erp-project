
package backend;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;
import org.springframework.mock.env.MockEnvironment;

/**
 * Unit tests for SMTP configuration normalization and validation.
 *
 * No test sends an email or connects to a server.
 */
class MailPropertiesTest {

    private MockEnvironment validEnvironment() {
        return new MockEnvironment()
                .withProperty("MAIL_HOST", "smtp.example.com")
                .withProperty("MAIL_PORT", "587")
                .withProperty("MAIL_USERNAME", "mailer@example.com")
                .withProperty("MAIL_PASSWORD", "secret-app-password")
                .withProperty("MAIL_FROM", "mailer@example.com")
                .withProperty("MAIL_RESET_LINK_BASE",
                        "https://app.example.com/")
                .withProperty("MAIL_SMTP_AUTH", "true")
                .withProperty("MAIL_SMTP_STARTTLS", "true");
    }

    @Test
    void missingConfigurationIsReportedAsNotConfigured() {
        MailProperties properties =
                new MailProperties(new MockEnvironment());

        assertFalse(properties.isConfigured());
        assertTrue(properties.configurationProblems().stream()
                .anyMatch(problem -> problem.contains("MAIL_HOST")));
        assertTrue(properties.configurationProblems().stream()
                .anyMatch(problem -> problem.contains("MAIL_FROM")));
        assertTrue(properties.configurationProblems().stream()
                .anyMatch(problem -> problem.contains("MAIL_USERNAME")));
        assertTrue(properties.configurationProblems().stream()
                .anyMatch(problem -> problem.contains("MAIL_PASSWORD")));
    }

    @Test
    void validConfigurationIsAccepted() {
        MailProperties properties =
                new MailProperties(validEnvironment());

        assertTrue(properties.configurationProblems().isEmpty());
        assertTrue(properties.isConfigured());
        assertEquals("smtp.example.com", properties.getHost());
        assertEquals(587, properties.getPort());
        assertEquals("mailer@example.com", properties.getFrom());
        assertEquals("https://app.example.com",
                properties.getResetLinkBase());
    }

    @Test
    void quotedValuesAreNormalized() {
        MockEnvironment environment = new MockEnvironment()
                .withProperty("MAIL_HOST", "  \"smtp.example.com\" ")
                .withProperty("MAIL_USERNAME", "'mailer@example.com'")
                .withProperty("MAIL_PASSWORD", "  \"secret\"  ")
                .withProperty("MAIL_FROM", "\"mailer@example.com\"")
                .withProperty("MAIL_RESET_LINK_BASE",
                        "\"https://app.example.com\"");

        MailProperties properties = new MailProperties(environment);

        assertEquals("smtp.example.com", properties.getHost());
        assertEquals("mailer@example.com", properties.getUsername());
        assertEquals("secret", properties.getPassword());
        assertEquals("mailer@example.com", properties.getFrom());
        assertEquals("https://app.example.com",
                properties.getResetLinkBase());
    }

    @Test
    void gmailAppPasswordSpacesAreRemoved() {
        MockEnvironment environment = validEnvironment()
                .withProperty("MAIL_HOST", "smtp.gmail.com")
                .withProperty("MAIL_USERNAME", "mailer@gmail.com")
                .withProperty("MAIL_PASSWORD", "abcd efgh ijkl mnop");

        MailProperties properties = new MailProperties(environment);

        assertEquals("abcdefghijklmnop", properties.getPassword());
        assertTrue(properties.isConfigured());
    }

    @Test
    void gmailUsernameMustBeTheFullAddress() {
        MockEnvironment environment = validEnvironment()
                .withProperty("MAIL_HOST", "smtp.gmail.com")
                .withProperty("MAIL_USERNAME", "mailer")
                .withProperty("MAIL_PASSWORD", "abcd efgh ijkl mnop");

        MailProperties properties = new MailProperties(environment);

        assertFalse(properties.isConfigured());
        assertTrue(properties.configurationProblems().stream()
                .anyMatch(problem -> problem.contains(
                        "full Gmail address")));
    }

    @Test
    void nonGmailPasswordSpacesArePreserved() {
        MockEnvironment environment = validEnvironment()
                .withProperty("MAIL_PASSWORD", "pass word");

        MailProperties properties = new MailProperties(environment);

        assertEquals("pass word", properties.getPassword());
    }

    @Test
    void authenticationRequiresUsernameAndPassword() {
        MockEnvironment environment = new MockEnvironment()
                .withProperty("MAIL_HOST", "smtp.example.com")
                .withProperty("MAIL_FROM", "mailer@example.com")
                .withProperty("MAIL_SMTP_AUTH", "true");

        MailProperties properties = new MailProperties(environment);

        assertFalse(properties.isConfigured());
        assertEquals(2, properties.configurationProblems().stream()
                .filter(problem -> problem.contains("MAIL_"))
                .count());
    }

    @Test
    void authenticationCanBeDisabledWithoutCredentials() {
        MockEnvironment environment = new MockEnvironment()
                .withProperty("MAIL_HOST", "smtp.example.com")
                .withProperty("MAIL_FROM", "mailer@example.com")
                .withProperty("MAIL_SMTP_AUTH", "false");

        MailProperties properties = new MailProperties(environment);

        assertTrue(properties.isConfigured());
        assertNull(properties.getUsername());
        assertNull(properties.getPassword());
    }

    @Test
    void invalidPortAndBaseUrlAreReported() {
        MockEnvironment environment = validEnvironment()
                .withProperty("MAIL_PORT", "99999")
                .withProperty("MAIL_RESET_LINK_BASE", "app.example.com");

        MailProperties properties = new MailProperties(environment);

        assertFalse(properties.isConfigured());
        assertTrue(properties.configurationProblems().stream()
                .anyMatch(problem -> problem.contains("MAIL_PORT")));
        assertTrue(properties.configurationProblems().stream()
                .anyMatch(problem -> problem.contains(
                        "MAIL_RESET_LINK_BASE")));
    }

    @Test
    void summaryNeverContainsCredentials() {
        MailProperties properties =
                new MailProperties(validEnvironment());

        String summary = properties.configurationSummary();

        assertFalse(summary.contains("secret-app-password"));
        assertFalse(summary.contains("mailer@example.com"));
        assertTrue(summary.contains("usernameConfigured=true"));
        assertTrue(summary.contains("passwordConfigured=true"));
    }
}
