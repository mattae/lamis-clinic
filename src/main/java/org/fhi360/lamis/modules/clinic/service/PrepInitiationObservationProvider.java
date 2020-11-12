package org.fhi360.lamis.modules.clinic.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.NullNode;
import lombok.AllArgsConstructor;
import org.fhi360.lamis.modules.patient.service.providers.PatientObservationViewProvider;
import org.lamisplus.modules.lamis.legacy.domain.entities.Patient;
import org.lamisplus.modules.lamis.legacy.domain.repositories.ClinicRepository;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class PrepInitiationObservationProvider implements PatientObservationViewProvider {
    private final ClinicRepository clinicRepository;

    @Override
    public boolean applicableTo(Patient patient) {
        JsonNode extra = patient.getExtra();
        return !clinicRepository.getArtCommencement(patient).isPresent() &&
                extra.get("prep") != null && !(extra.get("prep") instanceof NullNode)
                && extra.get("prep").get("registered").asBoolean();
    }

    @Override
    public String getName() {
        return "PrEP Initiation";
    }

    @Override
    public String getPath() {
        return "clinics/art-commencement";
    }

    @Override
    public String getTooltip() {
        return "PrEP Initiation Visit";
    }

    @Override
    public String getIcon() {
        return null;
    }
}
