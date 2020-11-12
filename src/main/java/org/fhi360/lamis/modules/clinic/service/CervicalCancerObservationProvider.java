package org.fhi360.lamis.modules.clinic.service;

import lombok.RequiredArgsConstructor;
import org.fhi360.lamis.modules.patient.service.providers.PatientObservationViewProvider;
import org.lamisplus.modules.base.domain.enumeration.Gender;
import org.lamisplus.modules.lamis.legacy.domain.entities.Patient;
import org.springframework.stereotype.Service;

import java.util.Objects;

@Service
@RequiredArgsConstructor
public class CervicalCancerObservationProvider implements PatientObservationViewProvider {
    private final CervicalCancerScreeningService screeningService;

    @Override
    public boolean applicableTo(Patient patient) {
        return Objects.equals(Gender.FEMALE.name(), patient.getGender()) && !screeningService.hasCervicalCancerScreening(patient);
    }

    @Override
    public String getName() {
        return "Start Cervical Cancer Screening";
    }

    @Override
    public String getPath() {
        return "cervical-cancer-screening";
    }
}
