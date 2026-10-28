
package backend;

import java.util.Properties;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;

/**
 * Builds the SMTP client exclusively from {@link MailProperties}.
 *
 * The bean is created without opening a network connection, so an
 * unconfigured or temporarily unavailable SMTP server never prevents the
 * application from starting. {@link ResetMailService} checks the configuration
 * before using the sender.
 */
@Configuration
public class MailConfig {

    @Bean
    public JavaMailSender javaMailSender(MailProperties mailProperties) {
        JavaMailSenderImpl sender = new JavaMailSenderImpl();

        if (mailProperties.getHost() != null) {
            sender.setHost(mailProperties.getHost());
        }

        sender.setPort(mailProperties.getPort());
        sender.setUsername(mailProperties.getUsername());
        sender.setPassword(mailProperties.getPassword());
        sender.setDefaultEncoding("UTF-8");

        Properties properties = new Properties();
        properties.setProperty("mail.smtp.auth",
                String.valueOf(mailProperties.isSmtpAuth()));
        properties.setProperty("mail.smtp.starttls.enable",
                String.valueOf(mailProperties.isSmtpStartTls()));
        properties.setProperty("mail.smtp.connectiontimeout", "10000");
        properties.setProperty("mail.smtp.timeout", "10000");
        properties.setProperty("mail.smtp.writetimeout", "10000");
        sender.setJavaMailProperties(properties);

        return sender;
    }
}
