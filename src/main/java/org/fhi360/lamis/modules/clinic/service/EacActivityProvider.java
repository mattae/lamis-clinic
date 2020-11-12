package org.fhi360.lamis.modules.clinic.service;

import lombok.RequiredArgsConstructor;
import org.fhi360.lamis.modules.patient.service.providers.PatientActivityProvider;
import org.fhi360.lamis.modules.patient.service.providers.vm.PatientActivity;
import org.lamisplus.modules.lamis.legacy.domain.entities.Patient;
import org.lamisplus.modules.lamis.legacy.domain.repositories.EacRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EacActivityProvider implements PatientActivityProvider {
    private final EacRepository eacRepository;

    @Override
    public List<PatientActivity> getActivitiesFor(Patient patient) {
        List<PatientActivity> activities = new ArrayList<>();
        eacRepository.findByPatient(patient).forEach(eac -> {
            PatientActivity activity = new PatientActivity(eac.getUuid(), "EAC Session", eac.getDateEac1(),
                    "", "eacs");
            activities.add(activity);
        });
        return activities;
    }
}
