
package backend;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

/**
 * SMTP configuration for password reset emails.
 *
 * <table>
 *   <caption>Environment variables</caption>
 *   <tr><th>Variable</th><th>Default</th><th>Purpose</th></tr>
 *   <tr><td>MAIL_HOST</td><td>-</td><td>SMTP server host</td></tr>
 *   <tr><td>MAIL_PORT</td><td>587</td><td>SMTP server port</td></tr>
 *   <tr><td>MAIL_USERNAME</td><td>-</td><td>SMTP username (full address for Gmail)</td></tr>
 *   <tr><td>MAIL_PASSWORD</td><td>-</td><td>SMTP password or app password</td></tr>
 *   <tr><td>MAIL_FROM</td><td>-</td><td>Sender address of reset emails</td></tr>
 *   <tr><td>MAIL_RESET_LINK_BASE</td><td>http://localhost:5173</td>
 *       <td>Public base URL of the frontend, used to build the reset link</td></tr>
 *   <tr><td>MAIL_SMTP_AUTH</td><td>true</td><td>SMTP authentication</td></tr>
 *   <tr><td>MAIL_SMTP_STARTTLS</td><td>true</td><td>STARTTLS encryption</td></tr>
 * </table>
 *
 * Credentials are never hardcoded and never logged. Values are normalized so
 * that quoted .env entries and Gmail app passwords that are displayed with
 * spaces work without editing the secret itself.
 */
@Component
public class MailProperties {

    private static final int DEFAULT_PORT = 587;
    private static final String DEFAULT_RESET_LINK_BASE =
            "http://localhost:5173";

    private final String host;
    private final int port;
    private final String username;
    private final String password;
    private final String from;
    private final String resetLinkBase;
    private final boolean smtpAuth;
    private final boolean smtpStartTls;

    public MailProperties(Environment environment) {
        this.host = normalize(environment.getProperty("MAIL_HOST"));
        this.port = readInt(environment, "MAIL_PORT", DEFAULT_PORT);
        this.username = normalize(environment.getProperty("MAIL_USERNAME"));
        this.password = normalizeSecret(
                environment.getProperty("MAIL_PASSWORD"), host);
        this.from = normalize(environment.getProperty("MAIL_FROM"));
        this.resetLinkBase = normalizeBase(
                environment.getProperty("MAIL_RESET_LINK_BASE"));
        this.smtpAuth = readBoolean(environment, "MAIL_SMTP_AUTH", true);
        this.smtpStartTls = readBoolean(
                environment, "MAIL_SMTP_STARTTLS", true);
    }

    /**
     * Trims whitespace and removes one pair of surrounding quotes, which is a
     * common way to write values in .env files.
     */
    private static String normalize(String value) {
        if (value == null) {
            return null;
        }

        String normalized = value.trim();

        if (normalized.length() >= 2
                && ((normalized.startsWith("\"") && normalized.endsWith("\""))
                || (normalized.startsWith("'")
                && normalized.endsWith("'")))) {
            normalized = normalized.substring(1, normalized.length() - 1)
                    .trim();
        }

        return normalized.isEmpty() ? null : normalized;
    }

    /**
     * Gmail shows app passwords in four groups of four characters. The spaces
     * are formatting only and must not be sent to the SMTP server.
     */
    private static String normalizeSecret(String value, String host) {
        String normalized = normalize(value);

        if (normalized == null) {
            return null;
        }

        if (isGmailHost(host)) {
            return normalized.replaceAll("\\s+", "");
        }

        return normalized;
    }

    private static boolean isGmailHost(String host) {
        if (host == null) {
            return false;
        }

        String lower = host.toLowerCase(Locale.ROOT);
        return lower.equals("smtp.gmail.com")
                || lower.endsWith(".gmail.com")
                || lower.equals("smtp.googlemail.com")
                || lower.endsWith(".googlemail.com");
    }

    private static String normalizeBase(String value) {
        String normalized = normalize(value);

        if (normalized == null) {
            return null;
        }

        while (normalized.endsWith("/")
                && !normalized.endsWith("://")
                && normalized.length() > 1) {
            normalized = normalized.substring(0, normalized.length() - 1);
        }

        return normalized;
    }

    private static int readInt(
            Environment environment,
            String name,
            int fallback) {
        String raw = environment.getProperty(name);
        if (raw == null || raw.isBlank()) {
            return fallback;
        }
        try {
            return Integer.parseInt(raw.trim());
        } catch (NumberFormatException ex) {
            return fallback;
        }
    }

    private static boolean readBoolean(
            Environment environment,
            String name,
            boolean fallback) {
        String raw = environment.getProperty(name);
        if (raw == null || raw.isBlank()) {
            return fallback;
        }
        return Boolean.parseBoolean(raw.trim());
    }

    /**
     * True when enough valid configuration exists to attempt an SMTP send.
     * The result never depends on network access or on a server being
     * reachable; it only validates the local configuration.
     */
    public boolean isConfigured() {
        return configurationProblems().isEmpty();
    }

    /**
     * Safe, human readable list of configuration problems. Only variable names
     * and fixed sentences are returned, never values or credentials.
     */
    public List<String> configurationProblems() {
        List<String> problems = new ArrayList<>();

        if (host == null) {
            problems.add("MAIL_HOST is not set.");
        }

        if (port < 1 || port > 65535) {
            problems.add("MAIL_PORT must be between 1 and 65535.");
        }

        if (from == null) {
            problems.add("MAIL_FROM is not set.");
        } else if (!from.contains("@")) {
            problems.add("MAIL_FROM must be an email address.");
        }

        if (smtpAuth) {
            if (username == null) {
                problems.add(
                        "MAIL_USERNAME is required while MAIL_SMTP_AUTH is enabled.");
            }
            if (password == null) {
                problems.add(
                        "MAIL_PASSWORD is required while MAIL_SMTP_AUTH is enabled.");
            }
        }

        if (isGmailHost(host) && username != null && !username.contains("@")) {
            problems.add("MAIL_USERNAME must be the full Gmail address.");
        }

        String base = getResetLinkBase();
        if (!base.startsWith("http://") && !base.startsWith("https://")) {
            problems.add(
                    "MAIL_RESET_LINK_BASE must start with http:// or https://.");
        }

        return problems;
    }

    /**
     * Diagnostic summary for operators. Contains no credentials, tokens or
     * full reset links.
     */
    public String configurationSummary() {
        return "host=" + (host == null ? "<unset>" : host)
                + ", port=" + port
                + ", auth=" + smtpAuth
                + ", starttls=" + smtpStartTls
                + ", usernameConfigured=" + (username != null)
                + ", passwordConfigured=" + (password != null)
                + ", fromConfigured=" + (from != null)
                + ", resetLinkBaseConfigured=" + (resetLinkBase != null);
    }

    public String getHost() {
        return host;
    }

    public int getPort() {
        return port;
    }

    public String getUsername() {
        return username;
    }

    public String getPassword() {
        return password;
    }

    public String getFrom() {
        return from;
    }

    public String getResetLinkBase() {
        return resetLinkBase == null
                ? DEFAULT_RESET_LINK_BASE
                : resetLinkBase;
    }

    public boolean isSmtpAuth() {
        return smtpAuth;
    }

    public boolean isSmtpStartTls() {
        return smtpStartTls;
    }
}
