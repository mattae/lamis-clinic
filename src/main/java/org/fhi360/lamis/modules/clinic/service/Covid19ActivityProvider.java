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
public class Covid19ActivityProvider implements PatientActivityProvider {
    private final Covid19ScreeningService screeningService;

    @Override
    public List<PatientActivity> getActivitiesFor(Patient patient) {
        List<PatientActivity> activities = new ArrayList<>();
        screeningService.getCovid19Screenings(patient).forEach(observation -> {
            PatientActivity activity = new PatientActivity(observation.getId(), "Covid19 Screening",
                    observation.getDate(), "", "covid19-screenings");
            activities.add(activity);
        });
        return activities;
    }
}
