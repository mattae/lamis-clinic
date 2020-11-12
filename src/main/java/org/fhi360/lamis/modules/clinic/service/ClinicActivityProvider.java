package org.fhi360.lamis.modules.clinic.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.fhi360.lamis.modules.patient.service.providers.PatientActivityProvider;
import org.fhi360.lamis.modules.patient.service.providers.vm.PatientActivity;
import org.lamisplus.modules.lamis.legacy.domain.entities.Clinic;
import org.lamisplus.modules.lamis.legacy.domain.entities.Patient;
import org.lamisplus.modules.lamis.legacy.domain.repositories.ClinicRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ClinicActivityProvider implements PatientActivityProvider {
    private final ClinicRepository clinicRepository;

    @Override
    public List<PatientActivity> getActivitiesFor(Patient patient) {
        List<PatientActivity> activities = new ArrayList<>();
        List<Clinic> clinics = clinicRepository.findByPatient(patient, PageRequest.of(0, 1000));
        clinics.forEach(clinic -> {
            String name = "Clinic Visit";
            if (clinic.getCommence() != null && clinic.getCommence()) {
                name = "ART Commencement Visit";
            }
            PatientActivity activity = new PatientActivity(clinic.getUuid(), name, clinic.getDateVisit(), "", "clinics");
            activities.add(activity);
        });
        return activities;
    }
}
