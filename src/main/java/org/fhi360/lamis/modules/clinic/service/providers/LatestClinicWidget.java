package org.fhi360.lamis.modules.clinic.service.providers;

import lombok.SneakyThrows;
import org.fhi360.lamis.modules.patient.service.providers.PatientWidgetProvider;
import org.lamisplus.modules.lamis.legacy.domain.entities.Patient;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.util.FileCopyUtils;

//@Service
public class LatestClinicWidget implements PatientWidgetProvider {
    @Override
    public String getTitle() {
        return "Latest Clinical Info";
    }

    @Override
    public String getComponentName() {
        return "ClinicWidget";
    }

    @Override
    public String getModuleName() {
        return "ClinicWidgetModule";
    }

    @SneakyThrows
    @Override
    public String getUmdContent() {
        Resource resource = new ClassPathResource("views/static/clinic/js/bundles/lamis-clinic-1.0.1.umd.js");
        return new String(FileCopyUtils.copyToByteArray(resource.getInputStream()));
    }

    @Override
    public String getUrl() {
        return "/across/resources/static/clinic/js/bundles/lamis-clinic-1.0.1.umd.js";
    }

    @Override
    public boolean applicableTo(Patient patient) {
        return true;
    }
}
