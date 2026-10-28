
package backend;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.mockito.Answers;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.data.mongodb.MongoDatabaseFactory;
import org.springframework.http.MediaType;
import org.springframework.mail.MailAuthenticationException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

/**
 * Verifies the forgot-password HTTP contract when SMTP is configured.
 *
 * The SMTP client is mocked: no test opens a network connection, sends a real
 * email or logs a real reset token. The suite also proves that an SMTP failure
 * never changes the generic response that protects account privacy.
 */
@SpringBootTest(properties = {
        "spring.mongodb.uri=mongodb://127.0.0.1:27017/priyonix-test",
        "JWT_SECRET=dGVzdC1zZWNyZXQtZm9yLXVuaXQtYnVpbGRzLW9ubHktMzItYnl0ZXM=",
        "ADMIN_EMAIL=",
        "ADMIN_PASSWORD=",
        "PASSWORD_RESET_DEV_MODE=false",
        "MAIL_HOST=smtp.example.com",
        "MAIL_PORT=587",
        "MAIL_USERNAME=mailer@example.com",
        "MAIL_PASSWORD=secret-app-password",
        "MAIL_FROM=mailer@example.com",
        "MAIL_RESET_LINK_BASE=https://app.example.com",
        "MAIL_SMTP_AUTH=true",
        "MAIL_SMTP_STARTTLS=true",
        "AUTH_LOGIN_MAX_IP_ATTEMPTS=1000",
        "AUTH_FORGOT_MAX_IP_REQUESTS=1000",
        "AUTH_RESET_MAX_ATTEMPTS=1000"
})
@AutoConfigureMockMvc
class PasswordResetMailIntegrationTests
        extends PlatformMockDatabaseTestSupport {

    private static final String RAW_PASSWORD = "Sup3rSecret-Passw0rd!";

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private UserRepository userRepository;

    @MockitoBean
    private PasswordResetTokenRepository tokenRepository;

    @MockitoBean
    private MetricsService metricsService;

    @MockitoBean
    private EmployeeRepository employeeRepository;

    @MockitoBean
    private TaskRepository taskRepository;

    @MockitoBean
    private FollowUpRepository followUpRepository;

    @MockitoBean
    private JavaMailSender mailSender;

    @MockitoBean(answers = Answers.RETURNS_DEEP_STUBS)
    private MongoDatabaseFactory mongoDatabaseFactory;

    private User enabledEmployee() {
        User user = new User();
        user.setId("employee-1");
        user.setEmail("employee@example.com");
        user.setPassword(new PasswordConfig()
                .passwordEncoder().encode(RAW_PASSWORD));
        user.setRole("EMPLOYEE");
        user.setEnabled(true);
        return user;
    }

    private void stubTokenStorage() {
        when(tokenRepository.save(any(PasswordResetToken.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
    }

    @Test
    void existingAccountReceivesAnEmailWithoutExposingTheToken()
            throws Exception {
        when(userRepository.findByEmailIgnoreCase("employee@example.com"))
                .thenReturn(Optional.of(enabledEmployee()));
        stubTokenStorage();

        String body = mockMvc.perform(post("/api/auth/forgot-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"employee@example.com\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SUCCESS"))
                .andExpect(jsonPath("$.message").value(
                        AuthController.GENERIC_RESET_MESSAGE))
                .andExpect(jsonPath("$.token").doesNotExist())
                .andReturn().getResponse().getContentAsString();

        ArgumentCaptor<SimpleMailMessage> captor =
                ArgumentCaptor.forClass(SimpleMailMessage.class);
        verify(mailSender).send(captor.capture());

        SimpleMailMessage message = captor.getValue();
        assertEquals("mailer@example.com", message.getFrom());
        assertEquals("employee@example.com", message.getTo()[0]);
        assertTrue(message.getText().contains(
                "https://app.example.com/reset-password?token="));
        assertFalse(body.contains("reset-password"));
    }

    @Test
    void unknownAccountDoesNotSendAnEmail() throws Exception {
        when(userRepository.findByEmailIgnoreCase("ghost@example.com"))
                .thenReturn(Optional.empty());

        mockMvc.perform(post("/api/auth/forgot-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"ghost@example.com\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value(
                        AuthController.GENERIC_RESET_MESSAGE));

        verifyNoInteractions(mailSender);
    }

    @Test
    void smtpAuthenticationFailureKeepsTheGenericResponse() throws Exception {
        when(userRepository.findByEmailIgnoreCase("employee@example.com"))
                .thenReturn(Optional.of(enabledEmployee()));
        stubTokenStorage();

        doThrow(new MailAuthenticationException(
                "535 Username and Password not accepted"))
                .when(mailSender).send(any(SimpleMailMessage.class));

        String body = mockMvc.perform(post("/api/auth/forgot-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"employee@example.com\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SUCCESS"))
                .andExpect(jsonPath("$.message").value(
                        AuthController.GENERIC_RESET_MESSAGE))
                .andReturn().getResponse().getContentAsString();

        verify(mailSender).send(any(SimpleMailMessage.class));
        assertFalse(body.contains("535"));
        assertFalse(body.contains("reset-password"));
        assertFalse(body.contains("token"));
    }

    @Test
    void disabledAccountDoesNotReceiveAnEmail() throws Exception {
        User disabled = enabledEmployee();
        disabled.setEnabled(false);

        when(userRepository.findByEmailIgnoreCase("employee@example.com"))
                .thenReturn(Optional.of(disabled));

        mockMvc.perform(post("/api/auth/forgot-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"employee@example.com\"}"))
                .andExpect(status().isOk());

        verify(mailSender, never()).send(any(SimpleMailMessage.class));
    }
}
