package org.fhi360.lamis.modules.clinic.service;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.lamisplus.modules.lamis.legacy.domain.entities.Clinic;
import org.lamisplus.modules.lamis.legacy.domain.entities.Patient;
import org.lamisplus.modules.lamis.legacy.domain.entities.StatusHistory;
import org.lamisplus.modules.lamis.legacy.domain.entities.enumerations.ClientStatus;
import org.lamisplus.modules.lamis.legacy.domain.repositories.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.Objects;

@Service
@RequiredArgsConstructor
@Slf4j
public class ClinicService {
    private final ClinicRepository clinicRepository;
    private final PatientRepository patientRepository;
    private final StatusHistoryRepository statusHistoryRepository;
    private final DevolveRepository devolveRepository;
    private final JdbcTemplate jdbcTemplate;

    public Clinic saveClinic(Clinic clinic) {
        //clinic.setOpportunisticInfections(new HashSet<>());
        if (clinic.getCommence() != null && clinic.getCommence()) {
            patientRepository.findById(clinic.getPatient().getId()).ifPresent(patient -> {
                JsonNode extra = patient.getExtra();
                boolean art = extra != null && extra.get("art").asBoolean();
                if (art) {
                    patient.setDateStarted(clinic.getDateVisit());
                    patientRepository.save(patient);

                    StatusHistory history = new StatusHistory();
                    history.setFacility(patient.getFacility());
                    history.setPatient(patient);
                    history.setStatus(ClientStatus.ART_START);
                    history.setDateStatus(clinic.getDateVisit());
                    statusHistoryRepository.save(history);
                }
            });
        }

        return clinicRepository.save(clinic);
    }

    public void deleteClinic(String clinicId) {
        clinicRepository.findByUuid(clinicId).ifPresent(clinic -> deleteClinic(clinic.getId()));
    }

    public void deleteClinic(Long clinicId) {
        clinicRepository.findById(clinicId).ifPresent(clinic -> {
            Patient patient = clinic.getPatient();
            devolveRepository.findByPatient(patient)
                    .forEach(devolve -> {
                        if (devolve.getRelatedClinic() != null && Objects.equals(clinicId, devolve.getRelatedClinic().getId())) {
                            devolve.setRelatedClinic(null);
                            devolveRepository.save(devolve);
                        }
                    });
            if (clinic.getCommence() != null && clinic.getCommence()
                    && patient.getDateStarted().equals(clinic.getDateVisit())) {
                patient.setDateStarted(null);
                patientRepository.save(patient);
                statusHistoryRepository.findByPatient(patient).stream()
                        .filter(s -> s.getStatus().equals(ClientStatus.ART_START))
                        .forEach(statusHistoryRepository::delete);
            }
            clinicRepository.delete(clinic);
        });
    }

    public Boolean enrolledOnOTZ(Long patientId) {
        try {
            Boolean enrolled = jdbcTemplate.queryForObject("select (extra->'otz'->>'enrolledOnOTZ')::boolean from clinic where " +
                    "patient_id = ? and archived = false", Boolean.class, patientId);
            return enrolled != null ? enrolled : false;
        } catch (Exception e) {
            return false;
        }
    }
}
