package org.fhi360.lamis.modules.clinic.config;

import org.fhi360.lamis.modules.clinic.domain.ClinicDomain;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@Configuration
@EnableJpaRepositories(basePackageClasses = {ClinicDomain.class})
public class DomainConfiguration {
}
