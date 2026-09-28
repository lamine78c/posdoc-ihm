package fr.acoss.posdoc.security.configuration;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties("posdoc.security")
public class PrismeSecurityProperties {

    private Boolean enabled;

    private String prismeHttpHeader;

    public String getPrismeHttpHeader() {
        return prismeHttpHeader;
    }

    public void setPrismeHttpHeader(String prismeHttpHeader) {
        this.prismeHttpHeader = prismeHttpHeader;
    }

    public Boolean getEnabled() {
        return enabled;
    }

    public void setEnabled(Boolean enabled) {
        this.enabled = enabled;
    }

}
