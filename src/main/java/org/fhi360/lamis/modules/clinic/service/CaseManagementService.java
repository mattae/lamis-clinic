package org.fhi360.lamis.modules.clinic.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.fhi360.lamis.modules.clinic.web.rest.vm.CaseManagerStats;
import org.fhi360.lamis.modules.clinic.web.rest.vm.Client;
import org.fhi360.lamis.modules.clinic.web.rest.vm.ClientFilter;
import org.lamisplus.modules.lamis.legacy.domain.entities.CaseManager;
import org.lamisplus.modules.lamis.legacy.domain.entities.Patient;
import org.lamisplus.modules.lamis.legacy.domain.entities.PatientCaseManager;
import org.lamisplus.modules.lamis.legacy.domain.entities.enumerations.ClientStatus;
import org.lamisplus.modules.lamis.legacy.domain.repositories.*;
import org.springframework.cache.CacheManager;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.BeanPropertyRowMapper;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import javax.annotation.PostConstruct;
import java.sql.ResultSet;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Period;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import static java.util.stream.Collectors.counting;
import static java.util.stream.Collectors.groupingBy;

@Service
@RequiredArgsConstructor
@Slf4j
public class CaseManagementService {
    private final CacheManager cacheManager = new CaffeineCacheManager();
    private final StatusHistoryRepository statusHistoryRepository;
    private final LaboratoryRepository laboratoryRepository;
    private final ClinicRepository clinicRepository;
    private final CaseManagerRepository caseManagerRepository;
    private final PatientCaseManagerRepository patientCaseManagerRepository;
    private final PatientRepository patientRepository;
    private final FacilityRepository facilityRepository;
    private final JdbcTemplate jdbcTemplate;
    private final SimpMessageSendingOperations messagingTemplate;

    public ResponseEntity<List<Client>> searchClients(ClientFilter filter) {

        List<Client> clients = cacheManager.getCache("clientList").get("clientList:" + filter.getFacilityId(), List.class);
        long total = 0L;
        if (clients != null) {
            clients = clients.stream()
                    .filter(client -> {
                        boolean include = true;
                        if (StringUtils.isNotBlank(filter.getStatus())) {
                            include = StringUtils.equals(client.getStatus(), filter.getStatus());
                        }
                        if (StringUtils.isNotBlank(filter.getGender())) {
                            include = include && StringUtils.equals(client.getGender(), filter.getGender());
                        }
                        if (filter.getLgaId() != null) {
                            include = include && Objects.equals(client.getLgaId(), filter.getLgaId());
                        }
                        if (filter.getBreastfeeding() != null && filter.getBreastfeeding()) {
                            include = include && Objects.equals(client.getBreastfeeding(), true);
                        }
                        if (filter.getPregnant() != null && filter.getPregnant()) {
                            include = include && Objects.equals(client.getPregnant(), true);
                        }
                        if (StringUtils.isNotBlank(filter.getHospitalNum())) {
                            include = include && StringUtils.lowerCase(client.getHospitalNum()).contains(filter.getHospitalNum().toLowerCase());
                        }
                        if (filter.getLowerAgeLimit() != null && filter.getUpperAgeLimit() != null) {
                            include = include && (LocalDate.now().getYear() - client.getDateBirth().getYear()) >= filter.getLowerAgeLimit()
                                    && (LocalDate.now().getYear() - client.getDateBirth().getYear()) <= filter.getUpperAgeLimit();
                        }
                        if (filter.getAssigned() != null) {
                            include = include && filter.getAssigned() == (client.getCaseManagerId() != null);
                        }
                        if (filter.getCaseManagerId() != null) {
                            include = include && Objects.equals(client.getCaseManagerId(), filter.getCaseManagerId());
                        }
                        return include;
                    }).collect(Collectors.toList());
            total = clients.size();
            clients = clients.stream()
                    .sorted(Comparator.comparing(Client::getId))
                    .skip(filter.getPage() * filter.getSize())
                    .limit(filter.getSize())
                    .collect(Collectors.toList());
        } else {
            clients = new ArrayList<>();
        }
        HttpHeaders headers = new HttpHeaders();
        headers.add("X-Total-Count", Long.toString(total));
        return new ResponseEntity<>(clients, headers, HttpStatus.OK);
    }

    public CaseManagerStats getStats(Long caseManagerId, Long facilityId) {
        CaseManagerStats stats = new CaseManagerStats();
        List<Client> clients = cacheManager.getCache("clientList").get("clientList:" + facilityId, List.class);
        if (clients != null) {
            Stream<Client> stream = clients.stream();
            if (caseManagerId != null && !Objects.equals(caseManagerId, 0L)) {
                stream = stream.filter(client -> client.getCaseManagerId() != null && client.getCaseManagerId().equals(caseManagerId));
            }
            Map<String, Long> counts = stream.collect(groupingBy(Client::getStatus, counting()));
            final long[] total = {0};
            counts.forEach((s, c) -> {
                total[0] += c;
                switch (s) {
                    case "STABLE":
                        stats.setStable(c);
                        break;
                    case "PRE_ART":
                        stats.setPreArt(c);
                        break;
                    case "UNSTABLE_LESS_THAN_1_YEAR":
                        stats.setUnstableLessThan1year(c);
                        break;
                    default:
                        stats.setUnstableMoreThan1Year(c);
                        break;
                }
            });
            stats.setAssigned(total[0]);
        }
        return stats;
    }

    public Boolean buildClientList(Long facilityId, boolean refresh) {
        if (!refresh) {
            if (cacheManager.getCache("clientList").get("clientList:" + facilityId) != null) {
                return true;
            }
        }
        synchronized (this) {
            List<Client> clients = cacheManager.getCache("clientList").get("clientList:" + facilityId, List.class);
            if (clients == null || refresh) {
                LocalDateTime start = LocalDateTime.now();
                List<Client> finalClients = clients;
                List<Client> builderList = jdbcTemplate.query("select distinct p.id, concat(surname, ', ', other_names) as name, date_birth," +
                                "date_started, address, gender, hospital_num, lga_id, case_manager_id from patient p " +
                                "where p.facility_id = ? and archived = false",
                        new BeanPropertyRowMapper<>(Client.class), facilityId).stream()
                        .filter(client -> hasPharmacyOrClinicVisitWithinLast18Months(client.getId()))
                        .filter(client -> {
                            if (!refresh) {
                                return true;
                            }
                            if (finalClients == null) {
                                return true;
                            }
                            return !finalClients.stream()
                                    .map((Function<Client, Object>) Client::getId)
                                    .collect(Collectors.toList()).contains(client.getId());
                        })
                        .map(client -> {
                            messagingTemplate.convertAndSend("/topic/case-management", "initializing");
                            Patient patient = new Patient();
                            patient.setId(client.getId());
                            statusHistoryRepository.getCurrentStatusForPatientAt(patient, LocalDate.now().plusDays(1)).ifPresent(status ->
                                    client.setCurrentStatus(status.getStatus().getStatus()));
                            laboratoryRepository.findViralLoadTestByPatient(patient.getId()).stream()
                                    .sorted((l1, l2) -> l2.getDateResultReceived().compareTo(l1.getDateResultReceived()))
                                    .limit(1)
                                    .forEach(laboratory -> laboratory.getLines().stream()
                                            .filter(line -> Objects.equals(line.getLabTestId(), 16L))
                                            .forEach(line -> {
                                                try {
                                                    client.setViralLoad(Long.parseLong(line.getResult()));
                                                } catch (Exception ignored) {
                                                }
                                            }));
                            laboratoryRepository.findCD4TestByPatient(patient.getId()).stream()
                                    .sorted((l1, l2) -> l2.getDateResultReceived().compareTo(l1.getDateResultReceived()))
                                    .limit(1)
                                    .forEach(laboratory -> laboratory.getLines().stream()
                                            .filter(line -> Objects.equals(line.getLabTestId(), 1L))
                                            .forEach(line -> {
                                                try {
                                                    client.setCd4(Long.parseLong(line.getResult()));
                                                } catch (Exception ignored) {
                                                }
                                            }));
                            if (StringUtils.equalsIgnoreCase(client.getGender(), "Female")) {
                                clinicRepository.findByPatientAndDateVisitBefore(patient, LocalDate.now().plusDays(1),
                                        PageRequest.of(0, 1, Sort.by(Sort.Direction.DESC, "dateVisit")))
                                        .forEach(clinic -> {
                                            client.setPregnant(clinic.getPregnant());
                                            client.setBreastfeeding(clinic.getBreastfeeding());
                                        });
                            }
                            clinicRepository.getArtCommencement(patient).ifPresent(clinic -> client.setCd4p(clinic.getCd4p()));
                            if (Arrays.asList(ClientStatus.PRE_ART_TRANSFER_IN.getStatus(), ClientStatus.HIV_PLUS_NON_ART.getStatus())
                                    .contains(client.getCurrentStatus())) {
                                client.setStatus("PRE_ART");
                            } else if (client.getDateStarted() == null) {
                                client.setStatus("UNSTABLE_LESS_THAN_1_YEAR");
                            } else {
                                LocalDate today = LocalDate.now();
                                Period intervalPeriod = Period.between(client.getDateStarted(), today);
                                if (intervalPeriod.getYears() <= 1) {
                                    if (Arrays.asList(ClientStatus.STOPPED_TREATMENT.getStatus(), ClientStatus.LOST_TO_FOLLOWUP.getStatus())
                                            .contains(client.getCurrentStatus())) {
                                        client.setStatus("UNSTABLE_MORE_THAN_1_YEAR");
                                    } else {
                                        if (clinicRepository.precedingOpportunityInfectionsByPatient(patient) == 0) {
                                            if (clinicRepository.visitsByPatient(patient) >= 5) {
                                                if (client.getViralLoad() != null) {
                                                    if (client.getViralLoad() < 1000) {
                                                        client.setStatus("STABLE");
                                                    } else {
                                                        client.setStatus("UNSTABLE_LESS_THAN_1_YEAR");
                                                    }
                                                } else {
                                                    if (client.getCd4() == null || client.getCd4() == 0) {
                                                        if (client.getCd4p() != null && client.getCd4p() > 250) {
                                                            client.setStatus("STABLE");
                                                        } else {
                                                            client.setStatus("UNSTABLE_LESS_THAN_1_YEAR");
                                                        }
                                                    } else {
                                                        if (client.getCd4() > 250) {
                                                            client.setStatus("STABLE");
                                                        } else {
                                                            client.setStatus("UNSTABLE_LESS_THAN_1_YEAR");
                                                        }
                                                    }
                                                }
                                            } else {
                                                client.setStatus("UNSTABLE_LESS_THAN_1_YEAR");
                                            }
                                        } else {
                                            client.setStatus("UNSTABLE_LESS_THAN_1_YEAR");
                                        }
                                    }
                                } else {
                                    client.setStatus("UNSTABLE_MORE_THAN_1_YEAR");
                                }
                            }
                            return client;
                        }).collect(Collectors.toList());
                LocalDateTime end = LocalDateTime.now();
                LOG.debug("Duration: {}", Duration.between(start, end).toMinutes());
                messagingTemplate.convertAndSend("/topic/case-management", "finished");
                if (clients == null) {
                    clients = builderList;
                }
                if (refresh) {
                    clients.addAll(builderList);
                }
                cacheManager.getCache("clientList").put("clientList:" + facilityId, clients);
            }
            return true;
        }
    }

    public void assignClientsToCaseManager(Long caseManagerId, List<Long> patientIds) {
        caseManagerRepository.findById(caseManagerId).ifPresent(caseManager -> {
            patientRepository.findAllById(patientIds).forEach(patient -> {
                PatientCaseManager patientCaseManager = new PatientCaseManager();
                patientCaseManager.setPatient(patient);
                patientCaseManager.setFacility(patient.getFacility());
                patientCaseManager.setCaseManager(caseManager);
                patientCaseManager.setDateAssigned(LocalDate.now());
                if (patient.getCaseManager() == null) {
                    patientCaseManager.setAction("ASSIGNMENT");
                } else if (!Objects.equals(patient.getCaseManager().getId(), caseManagerId)) {
                    patientCaseManager.setAction("RE_ASSIGNMENT");
                }
                patient.setCaseManager(caseManager);
                patientRepository.save(patient);
                patientCaseManagerRepository.save(patientCaseManager);
            });

            List<Client> clients = cacheManager.getCache("clientList").get("clientList:" +
                    caseManager.getFacility().getId(), List.class);
            if (clients != null) {
                clients = clients.stream()
                        .map(client -> {
                            if (patientIds.contains(client.getId())) {
                                client.setCaseManagerId(caseManagerId);
                            }
                            return client;
                        }).collect(Collectors.toList());
                cacheManager.getCache("clientList").put("clientList:" + caseManager.getFacility().getId(), clients);
            }
        });
    }

    public void deAssignClient(List<Long> patientIds) {
        patientRepository.findAllById(patientIds).forEach(patient -> {
            PatientCaseManager patientCaseManager = new PatientCaseManager();
            patientCaseManager.setPatient(patient);
            patientCaseManager.setFacility(patient.getFacility());
            patientCaseManager.setDateAssigned(LocalDate.now());
            patient.setCaseManager(null);
            patientRepository.save(patient);
            patientCaseManagerRepository.save(patientCaseManager);

            List<Client> clients = cacheManager.getCache("clientList").get("clientList:" +
                    patient.getFacility().getId(), List.class);
            if (clients != null) {
                clients = clients.stream()
                        .map(client -> {
                            if (patientIds.contains(client.getId())) {
                                client.setCaseManagerId(null);
                            }
                            return client;
                        }).collect(Collectors.toList());
                cacheManager.getCache("clientList").put("clientList:" + patient.getFacility().getId(), clients);
            }
        });
    }

    public List<CaseManager> getCaseManagers(Long facilityId) {
        return facilityRepository.findById(facilityId)
                .map(caseManagerRepository::findByFacilityOrderByName).orElse(new ArrayList<>());
    }

    private Boolean hasPharmacyOrClinicVisitWithinLast18Months(Long patientId) {
        return jdbcTemplate.query("select date_visit from pharmacy where patient_id = ? and date_visit >= " +
                        "current_date - interval '18 months' and archived = false union select date_visit from clinic where " +
                        "patient_id = ? and date_visit >= current_date - interval '18 months'  and archived = false",
                ResultSet::next, patientId, patientId);
    }

    @PostConstruct
    public void defaultInit() {
        new Thread(() -> jdbcTemplate.query("select facility_id from users where facility_id is not null", rs -> {
            Long facilityId = rs.getLong(1);
            buildClientList(facilityId, false);
        })).start();
    }

    @Scheduled(cron = "0 0/5 * * * ?")
    public void refreshList() {
        new Thread(() -> jdbcTemplate.query("select facility_id from users where facility_id is not null", rs -> {
            Long facilityId = rs.getLong(1);
            buildClientList(facilityId, true);
        })).start();
    }
}
