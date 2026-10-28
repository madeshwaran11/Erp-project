
package backend;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.List;
import java.util.Locale;

import org.springframework.mail.MailAuthenticationException;
import org.springframework.mail.MailException;
import org.springframework.mail.MailSendException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

/**
 * Sends the password reset email.
 *
 * The SMTP connection is built from {@link MailProperties} (environment
 * variables only). When no SMTP server is configured the service reports
 * {@link #isConfigured()} as false and the caller decides what to do; it
 * never pretends that a message was sent.
 */
@Service
public class ResetMailService {

    private final MailProperties mailProperties;
    private final JavaMailSender mailSender;

    public ResetMailService(
            MailProperties mailProperties,
            JavaMailSender mailSender) {
        this.mailProperties = mailProperties;
        this.mailSender = mailSender;
    }

    public boolean isConfigured() {
        return mailProperties.isConfigured();
    }

    /** Safe configuration diagnostics; never contains secrets. */
    public List<String> configurationProblems() {
        return mailProperties.configurationProblems();
    }

    /** Safe configuration summary; never contains secrets. */
    public String configurationSummary() {
        return mailProperties.configurationSummary();
    }

    /**
     * Builds the single-use reset link for the given token.
     */
    public String buildResetLink(String rawToken) {
        return mailProperties.getResetLinkBase()
                + "/reset-password?token="
                + URLEncoder.encode(rawToken, StandardCharsets.UTF_8);
    }

    /**
     * Sends the reset instructions.
     *
     * @throws MailDeliveryException when the local configuration is incomplete
     *         or the SMTP server rejects the message. Callers must not report
     *         success to the operator just because the HTTP response stays
     *         generic.
     */
    public void sendPasswordReset(
            String toEmail,
            String rawToken,
            Duration tokenTtl) {

        if (!mailProperties.isConfigured()) {
            throw new MailDeliveryException(
                    MailDeliveryException.Category.CONFIGURATION,
                    "SMTP is not configured for password reset delivery.");
        }

        String resetLink = buildResetLink(rawToken);

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(mailProperties.getFrom());
        message.setTo(toEmail);
        message.setSubject("PriyoniX One - Password reset");
        message.setText(buildBody(resetLink, tokenTtl));

        try {
            mailSender.send(message);
        } catch (MailAuthenticationException ex) {
            throw new MailDeliveryException(
                    MailDeliveryException.Category.AUTHENTICATION,
                    "The SMTP server rejected the credentials.",
                    ex);
        } catch (MailSendException ex) {
            throw new MailDeliveryException(classify(ex), safeMessage(ex), ex);
        } catch (MailException ex) {
            throw new MailDeliveryException(classify(ex), safeMessage(ex), ex);
        } catch (RuntimeException ex) {
            throw new MailDeliveryException(
                    MailDeliveryException.Category.UNKNOWN,
                    "The reset email could not be sent.",
                    ex);
        }
    }

    /**
     * Classifies a delivery failure without copying SMTP responses, addresses
     * or credentials into the application log.
     */
    private static MailDeliveryException.Category classify(Throwable error) {
        Throwable current = error;

        while (current != null) {
            String message = current.getMessage();
            String lower = message == null
                    ? ""
                    : message.toLowerCase(Locale.ROOT);
            String type = current.getClass().getSimpleName()
                    .toLowerCase(Locale.ROOT);

            if (current instanceof MailAuthenticationException
                    || type.contains("authentication")
                    || lower.contains("535")
                    || lower.contains("username and password not accepted")
                    || lower.contains("badcredentials")) {
                return MailDeliveryException.Category.AUTHENTICATION;
            }

            if (current instanceof java.net.UnknownHostException
                    || current instanceof java.net.ConnectException
                    || current instanceof java.net.SocketTimeoutException
                    || type.contains("connect")
                    || type.contains("timeout")
                    || lower.contains("unknown host")
                    || lower.contains("connection refused")) {
                return MailDeliveryException.Category.CONNECTION;
            }

            if (type.contains("address")
                    || type.contains("sender")
                    || lower.contains("invalid address")
                    || lower.contains("sender")) {
                return MailDeliveryException.Category.SENDER;
            }

            current = current.getCause();
        }

        return MailDeliveryException.Category.UNKNOWN;
    }

    private static String safeMessage(Throwable error) {
        return switch (classify(error)) {
            case AUTHENTICATION ->
                    "The SMTP server rejected the credentials.";
            case CONNECTION ->
                    "The SMTP server could not be reached.";
            case SENDER ->
                    "The sender or recipient address was rejected.";
            case CONFIGURATION ->
                    "SMTP is not configured for password reset delivery.";
            case UNKNOWN ->
                    "The reset email could not be sent.";
        };
    }

    private String buildBody(
            String resetLink,
            Duration tokenTtl) {
        long minutes = tokenTtl == null
                ? PasswordResetService.DEFAULT_TOKEN_TTL.toMinutes()
                : tokenTtl.toMinutes();

        return "Hello,\n\n"
                + "We received a request to reset the password of your "
                + "PriyoniX One account.\n"
                + "Use the secure link below to choose a new password. "
                + "The link can be used once and expires in "
                + minutes + " minutes.\n\n"
                + resetLink + "\n\n"
                + "If you did not request a password reset you can safely "
                + "ignore this message; your password stays unchanged.\n\n"
                + "PriyoniX One";
    }
}
