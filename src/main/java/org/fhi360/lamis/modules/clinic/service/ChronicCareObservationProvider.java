package org.fhi360.lamis.modules.clinic.service;

import lombok.RequiredArgsConstructor;
import org.fhi360.lamis.modules.patient.service.providers.PatientObservationViewProvider;
import org.lamisplus.modules.lamis.legacy.domain.entities.Patient;
import org.lamisplus.modules.lamis.legacy.domain.repositories.ClinicRepository;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ChronicCareObservationProvider implements PatientObservationViewProvider {
    private final ClinicRepository clinicRepository;

    @Override
    public boolean applicableTo(Patient patient) {
        return true;
    }

    @Override
    public String getName() {
        return "Add Chronic Care Visit";
    }

    @Override
    public String getPath() {
        return "chronic-cares";
    }
}
