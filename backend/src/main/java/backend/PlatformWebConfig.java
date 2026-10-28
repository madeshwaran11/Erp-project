package backend;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class PlatformWebConfig implements WebMvcConfigurer {
    private final AuditInterceptor audit;
    public PlatformWebConfig(AuditInterceptor audit) { this.audit = audit; }
    @org.springframework.context.annotation.Bean
    public jakarta.servlet.MultipartConfigElement multipartConfigElement() {
        return new jakarta.servlet.MultipartConfigElement("", AttachmentService.MAX_BYTES,
                AttachmentService.MAX_BYTES + 1024 * 1024, 0);
    }
    @Override public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(audit).addPathPatterns("/api/**");
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("https://frontend-five-self-66.vercel.app", "http://localhost:5173")
                .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD")
                .allowedHeaders("*")
                .exposedHeaders("Authorization", "Set-Cookie")
                .allowCredentials(true)
                .maxAge(3600);
    }
}
