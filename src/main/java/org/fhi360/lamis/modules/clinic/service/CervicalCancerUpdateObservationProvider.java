package org.fhi360.lamis.modules.clinic.service;

import lombok.RequiredArgsConstructor;
import org.fhi360.lamis.modules.patient.service.providers.PatientObservationViewProvider;
import org.lamisplus.modules.lamis.legacy.domain.entities.Patient;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CervicalCancerUpdateObservationProvider implements PatientObservationViewProvider {
    private final CervicalCancerScreeningService screeningService;

    @Override
    public boolean applicableTo(Patient patient) {
        return screeningService.hasCervicalCancerScreening(patient);
    }

    @Override
    public String getName() {
        return "Update Cervical Cancer Screening";
    }

    @Override
    public String getPath() {
        return "cervical-cancer-screening";
    }
}
