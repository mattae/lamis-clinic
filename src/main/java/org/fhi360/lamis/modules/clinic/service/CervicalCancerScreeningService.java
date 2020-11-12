package org.fhi360.lamis.modules.clinic.service;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.RequiredArgsConstructor;
import org.lamisplus.modules.lamis.legacy.domain.entities.Observation;
import org.lamisplus.modules.lamis.legacy.domain.entities.Patient;
import org.lamisplus.modules.lamis.legacy.domain.repositories.ObservationRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CervicalCancerScreeningService {
    private final static String TYPE = "CERVICAL_CANCER_SCREENING";
    private final ObservationRepository observationRepository;

    public boolean hasCervicalCancerScreening(Patient patient) {
        return !observationRepository.findByPatientAndType(patient, TYPE).isEmpty();
    }

    public Optional<Observation> getCervicalCancerScreening(Patient patient) {
        List<Observation> observations = observationRepository.findByPatientAndType(patient, TYPE);
        if (observations.isEmpty()) {
            return Optional.empty();
        }
        return Optional.of(observations.get(0));
    }

    public void saveScreening(Patient patient, LocalDate date, JsonNode data) {
        List<Observation> observations = observationRepository.findByPatientAndType(patient, TYPE);
        Observation observation;
        if (!observations.isEmpty()) {
            observation = observations.get(0);
        } else {
            observation = new Observation();
            observation.setPatient(patient);
            observation.setFacility(patient.getFacility());
        }
        observation.setDate(date);
        observation.setData(data);
    }

    public void deleteScreening(Patient patient) {
        observationRepository.deleteAll(observationRepository.findByPatientAndType(patient, TYPE));
    }
}
