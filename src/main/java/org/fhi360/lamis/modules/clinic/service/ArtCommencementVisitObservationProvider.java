package org.fhi360.lamis.modules.clinic.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.NullNode;
import lombok.AllArgsConstructor;
import org.fhi360.lamis.modules.patient.service.providers.PatientObservationViewProvider;
import org.lamisplus.modules.lamis.legacy.domain.entities.Patient;
import org.lamisplus.modules.lamis.legacy.domain.entities.enumerations.ClientStatus;
import org.lamisplus.modules.lamis.legacy.domain.repositories.ClinicRepository;
import org.springframework.stereotype.Service;

import java.util.Objects;

@Service
@AllArgsConstructor
public class ArtCommencementVisitObservationProvider implements PatientObservationViewProvider {
    private final ClinicRepository clinicRepository;

    @Override
    public boolean applicableTo(Patient patient) {
        JsonNode extra = patient.getExtra();
        return !clinicRepository.getArtCommencement(patient).isPresent()
                && (extra.get("art") != null && !(extra.get("art") instanceof NullNode)) && extra.get("art").asBoolean();
    }

    @Override
    public String getName() {
        return "Commence ART";
    }

    @Override
    public String getPath() {
        return "clinics/art-commencement";
    }

    @Override
    public String getTooltip() {
        return "ART Commencement Visit";
    }

    @Override
    public String getIcon() {
        return null;
    }
}
