package org.fhi360.lamis.modules.clinic.service;

import lombok.RequiredArgsConstructor;
import org.fhi360.lamis.modules.patient.service.providers.PatientActivityProvider;
import org.fhi360.lamis.modules.patient.service.providers.vm.PatientActivity;
import org.lamisplus.modules.lamis.legacy.domain.entities.Patient;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CervicalCancerScreeningActivityProvider implements PatientActivityProvider {
    private final CervicalCancerScreeningService screeningService;

    @Override
    public List<PatientActivity> getActivitiesFor(Patient patient) {
        List<PatientActivity> activities = new ArrayList<>();
        screeningService.getCervicalCancerScreening(patient).ifPresent(observation -> {
            PatientActivity activity = new PatientActivity(observation.getId(), "Cervical Cancer Screening",
                    observation.getDate(), "", "cervical-cancer-screening");
            activities.add(activity);
        });
        return activities;
    }
}
