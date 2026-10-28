
package backend;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;

import java.net.ConnectException;
import java.time.Duration;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.MailAuthenticationException;
import org.springframework.mail.MailSendException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mock.env.MockEnvironment;

/**
 * Unit tests for reset email delivery. The SMTP client is mocked, so these
 * tests never open a network connection or send a real message.
 */
@ExtendWith(MockitoExtension.class)
class ResetMailServiceTest {

    private static final String TOKEN = "single-use-reset-token";
    private static final String RECIPIENT = "employee@example.com";

    @Mock
    private JavaMailSender mailSender;

    private MockEnvironment validEnvironment() {
        return new MockEnvironment()
                .withProperty("MAIL_HOST", "smtp.example.com")
                .withProperty("MAIL_PORT", "587")
                .withProperty("MAIL_USERNAME", "mailer@example.com")
                .withProperty("MAIL_PASSWORD", "secret-app-password")
                .withProperty("MAIL_FROM", "mailer@example.com")
                .withProperty("MAIL_RESET_LINK_BASE",
                        "https://app.example.com/");
    }

    private ResetMailService serviceFor(MockEnvironment environment) {
        return new ResetMailService(
                new MailProperties(environment), mailSender);
    }

    @Test
    void missingSmtpConfigurationFailsWithoutTouchingTheSender() {
        ResetMailService service =
                serviceFor(new MockEnvironment());

        MailDeliveryException error = assertThrows(
                MailDeliveryException.class,
                () -> service.sendPasswordReset(
                        RECIPIENT, TOKEN, Duration.ofMinutes(15)));

        assertEquals(MailDeliveryException.Category.CONFIGURATION,
                error.getCategory());
        verifyNoInteractions(mailSender);
    }

    @Test
    void configuredServiceSendsTheResetLink() {
        ResetMailService service = serviceFor(validEnvironment());

        service.sendPasswordReset(
                RECIPIENT, TOKEN, Duration.ofMinutes(15));

        ArgumentCaptor<SimpleMailMessage> captor =
                ArgumentCaptor.forClass(SimpleMailMessage.class);
        verify(mailSender).send(captor.capture());

        SimpleMailMessage message = captor.getValue();
        assertEquals("mailer@example.com", message.getFrom());
        assertEquals(RECIPIENT, message.getTo()[0]);
        assertEquals("PriyoniX One - Password reset", message.getSubject());
        assertTrue(message.getText().contains(
                "https://app.example.com/reset-password?token=" + TOKEN));
        assertTrue(message.getText().contains("expires in 15 minutes"));
        assertTrue(message.getText().contains("can be used once"));
    }

    @Test
    void tokenTtlIsReflectedInTheMessage() {
        ResetMailService service = serviceFor(validEnvironment());

        service.sendPasswordReset(
                RECIPIENT, TOKEN, Duration.ofMinutes(5));

        ArgumentCaptor<SimpleMailMessage> captor =
                ArgumentCaptor.forClass(SimpleMailMessage.class);
        verify(mailSender).send(captor.capture());

        assertTrue(captor.getValue().getText()
                .contains("expires in 5 minutes"));
    }

    @Test
    void authenticationFailureIsClassifiedWithoutLeakingDetails() {
        ResetMailService service = serviceFor(validEnvironment());

        doThrow(new MailAuthenticationException(
                "535-5.7.8 Username and Password not accepted. "
                        + "https://support.google.com/mail/?p=BadCredentials"))
                .when(mailSender).send(any(SimpleMailMessage.class));

        MailDeliveryException error = assertThrows(
                MailDeliveryException.class,
                () -> service.sendPasswordReset(
                        RECIPIENT, TOKEN, Duration.ofMinutes(15)));

        assertEquals(MailDeliveryException.Category.AUTHENTICATION,
                error.getCategory());
        assertFalse(error.getMessage().contains("535"));
        assertFalse(error.getMessage().contains(TOKEN));
    }

    @Test
    void connectionFailureIsClassified() {
        ResetMailService service = serviceFor(validEnvironment());

        doThrow(new MailSendException(
                "Mail server connection failed",
                new ConnectException("Connection refused")))
                .when(mailSender).send(any(SimpleMailMessage.class));

        MailDeliveryException error = assertThrows(
                MailDeliveryException.class,
                () -> service.sendPasswordReset(
                        RECIPIENT, TOKEN, Duration.ofMinutes(15)));

        assertEquals(MailDeliveryException.Category.CONNECTION,
                error.getCategory());
        assertFalse(error.getMessage().contains("Connection refused"));
    }

    @Test
    void unknownFailureIsClassifiedAsUnknown() {
        ResetMailService service = serviceFor(validEnvironment());

        doThrow(new MailSendException("unexpected failure"))
                .when(mailSender).send(any(SimpleMailMessage.class));

        MailDeliveryException error = assertThrows(
                MailDeliveryException.class,
                () -> service.sendPasswordReset(
                        RECIPIENT, TOKEN, Duration.ofMinutes(15)));

        assertEquals(MailDeliveryException.Category.UNKNOWN,
                error.getCategory());
        assertFalse(error.getMessage().contains("unexpected failure"));
    }

    @Test
    void resetLinkIsBuiltFromTheNormalizedBaseUrl() {
        ResetMailService service = serviceFor(validEnvironment());

        assertEquals(
                "https://app.example.com/reset-password?token=" + TOKEN,
                service.buildResetLink(TOKEN));
    }
}
