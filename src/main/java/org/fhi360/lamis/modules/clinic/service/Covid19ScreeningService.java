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
public class Covid19ScreeningService {
    private final static String TYPE = "COVID19_SCREENING";
    private final ObservationRepository observationRepository;

    public Optional<Observation> getCovid19Screening(String id) {
        return observationRepository.findById(id);
    }

    public List<Observation> getCovid19Screenings(Patient patient) {
        return observationRepository.findByPatientAndType(patient, TYPE);
    }

    public Observation saveScreening(Patient patient, LocalDate date, JsonNode data, String id) {
        Observation observation = observationRepository.findById(id).orElse(new Observation());
        observation.setPatient(patient);
        observation.setFacility(patient.getFacility());
        observation.setDate(date);
        observation.setData(data);
        return observationRepository.save(observation);
    }

    public void deleteScreening(String id) {
        observationRepository.deleteById(id);
    }
}
