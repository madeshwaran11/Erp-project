
package backend;

/**
 * Raised when a password reset email cannot be delivered.
 *
 * The category is safe to log: it describes the failure class without
 * containing credentials, recipient addresses, tokens or SMTP responses.
 */
public class MailDeliveryException extends RuntimeException {

    public enum Category {
        /** Local configuration is missing or invalid. */
        CONFIGURATION,
        /** The SMTP server rejected the username or password. */
        AUTHENTICATION,
        /** The SMTP server could not be reached or timed out. */
        CONNECTION,
        /** The sender or recipient address was rejected. */
        SENDER,
        /** Any other delivery failure. */
        UNKNOWN
    }

    private final Category category;

    public MailDeliveryException(Category category, String message) {
        super(message);
        this.category = category;
    }

    public MailDeliveryException(
            Category category,
            String message,
            Throwable cause) {
        super(message, cause);
        this.category = category;
    }

    public Category getCategory() {
        return category;
    }
}
