package org.fhi360.lamis.modules.clinic.service;

import lombok.RequiredArgsConstructor;
import org.fhi360.lamis.modules.patient.service.providers.PatientActivityProvider;
import org.fhi360.lamis.modules.patient.service.providers.vm.PatientActivity;
import org.lamisplus.modules.lamis.legacy.domain.entities.Patient;
import org.lamisplus.modules.lamis.legacy.domain.repositories.ChronicCareRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ChronicCareActivityProvider implements PatientActivityProvider {
    private final ChronicCareRepository chronicCareRepository;

    @Override
    public List<PatientActivity> getActivitiesFor(Patient patient) {
        List<PatientActivity> activities = new ArrayList<>();
        chronicCareRepository.findByPatient(patient).forEach(chronicCare -> {
            PatientActivity activity = new PatientActivity(chronicCare.getUuid(), "Chronic Care Visit",
                    chronicCare.getDateVisit(), "", "chronic-cares");
            activities.add(activity);
        });
        return activities;
    }
}
