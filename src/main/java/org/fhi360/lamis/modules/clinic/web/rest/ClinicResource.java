package org.fhi360.lamis.modules.clinic.web.rest;

import io.github.jhipster.web.util.ResponseUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.fhi360.lamis.modules.clinic.service.ClinicService;
import org.fhi360.lamis.modules.patient.service.ObservationValidatorsProvider;
import org.lamisplus.modules.base.web.errors.BadRequestAlertException;
import org.lamisplus.modules.base.web.util.HeaderUtil;
import org.lamisplus.modules.lamis.legacy.domain.entities.*;
import org.lamisplus.modules.lamis.legacy.domain.repositories.*;
import org.lamisplus.modules.lamis.legacy.domain.repositories.projections.VisitDates;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.net.URISyntaxException;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
@Slf4j
@RequiredArgsConstructor
public class ClinicResource {
    private static final String ENTITY_NAME = "clinic";

    private final ClinicRepository clinicRepository;
    private final PatientRepository patientRepository;
    private final AdhereRepository adhereRepository;
    private final AdverseDrugReactionRepository adverseDrugReactionRepository;
    private final OpportunisticInfectionRepository opportunisticInfectionRepository;
    private final RegimenRepository regimenRepository;
    private final RegimenTypeRepository regimenTypeRepository;
    private final ClinicService clinicService;
    private final ObservationValidatorsProvider observationValidatorsProvider;

    /**
     * POST  /clinics : Create a new clinic.
     *
     * @param clinic the clinic to create
     * @return the ResponseEntity with status 201 (Created) and with body the new clinic, or with status 400 (Bad Request) if the clinic has already an ID
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PostMapping("/clinics")
    public ResponseEntity<Clinic> createClinic(@RequestBody Clinic clinic) throws URISyntaxException {
        LOG.debug("REST request to save Clinic : {}", clinic);
        if (clinic.getId() != null) {
            throw new BadRequestAlertException("A new clinic cannot already have an ID", ENTITY_NAME, "idexists");
        }

        Patient patient = patientRepository.getOne(clinic.getPatient().getId());
        observationValidatorsProvider.getValidators(Clinic.class)
                .forEach(validator -> validator.validate(clinic, patient));

        Clinic result = clinicService.saveClinic(clinic);
        return ResponseEntity.created(new URI("/api/clinics/" + result.getId()))
                .headers(HeaderUtil.createEntityCreationAlert(ENTITY_NAME, result.getId().toString()))
                .body(result);
    }

    /**
     * PUT  /clinics : Updates an existing clinic.
     *
     * @param clinic the clinic to update
     * @return the ResponseEntity with status 200 (OK) and with body the updated clinic,
     * or with status 400 (Bad Request) if the clinic is not valid,
     * or with status 500 (Internal Server Error) if the clinic couldn't be updated
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PutMapping("/clinics")
    public ResponseEntity<Clinic> updateClinic(@RequestBody Clinic clinic) throws URISyntaxException {
        LOG.debug("REST request to update Clinic : {}", clinic);
        if (clinic.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        Patient patient = patientRepository.getOne(clinic.getPatient().getId());
        observationValidatorsProvider.getValidators(Clinic.class)
                .forEach(validator -> validator.validate(clinic, patient));

        Clinic result = clinicService.saveClinic(clinic);
        return ResponseEntity.ok()
                .headers(HeaderUtil.createEntityUpdateAlert(ENTITY_NAME, clinic.getId().toString()))
                .body(result);
    }

    /**
     * GET  /clinics/:id : get the "id" clinic.
     *
     * @param id the id of the clinic to retrieve
     * @return the ResponseEntity with status 200 (OK) and with body the clinic, or with status 404 (Not Found)
     */
    @GetMapping("/clinics/{id}")
    public ResponseEntity<Clinic> getClinic(@PathVariable Long id) {
        LOG.debug("REST request to get Clinic : {}", id);
        Optional<Clinic> clinic = clinicRepository.findById(id);
        return ResponseUtil.wrapOrNotFound(clinic);
    }

    /**
     * GET  /clinics/:id : get the "uuid" clinic.
     *
     * @param id the uuid of the clinic to retrieve
     * @return the ResponseEntity with status 200 (OK) and with body the clinic, or with status 404 (Not Found)
     */
    @GetMapping("/clinics/by-uuid/{id}")
    public ResponseEntity<Clinic> getClinicByUuid(@PathVariable String id) {
        LOG.debug("REST request to get Clinic : {}", id);
        Optional<Clinic> clinic = clinicRepository.findByUuid(id);
        return ResponseUtil.wrapOrNotFound(clinic);
    }

    @GetMapping("/clinics/patient/{id}/latest")
    public ResponseEntity<Clinic> getLatestClinicVisit(@PathVariable Long id) {
        LOG.debug("REST request to get latest Clinic : {}", id);
        Patient patient = patientRepository.getOne(id);
        Optional<Clinic> clinic = clinicRepository.getLastClinicVisit(patient);
        return ResponseUtil.wrapOrNotFound(clinic);
    }

    /**
     * DELETE  /clinics/:id : delete the "id" clinic.
     *
     * @param id the id of the clinic to delete
     * @return the ResponseEntity with status 200 (OK)
     */
    @DeleteMapping("/clinics/{id}")
    public ResponseEntity<Void> deleteClinic(@PathVariable Long id) {
        LOG.debug("REST request to delete Clinic : {}", id);
        clinicService.deleteClinic(id);
        return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert(ENTITY_NAME, id.toString())).build();
    }

    /**
     * DELETE  /clinics/:id : delete the "uuid" clinic.
     *
     * @param id the uuid of the clinic to delete
     * @return the ResponseEntity with status 200 (OK)
     */
    @DeleteMapping("/clinics/by-uuid/{id}")
    public ResponseEntity<Void> deleteClinicByUuid(@PathVariable String id) {
        LOG.debug("REST request to delete Clinic : {}", id);
        clinicService.deleteClinic(id);
        return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert(ENTITY_NAME, id.toString())).build();
    }

    @GetMapping("/clinics/adheres")
    public List<Adhere> getAdheres() {
        return adhereRepository.findAll();
    }

    @GetMapping("/clinics/adverse-drug-reactions")
    public List<AdverseDrugReaction> getAdverseDrugReactions() {
        return adverseDrugReactionRepository.findAll();
    }

    @GetMapping("/clinics/opportunistic-infections")
    public List<OpportunisticInfection> getOpportunisticInfections() {
        return opportunisticInfectionRepository.findAll();
    }

    @GetMapping("/clinics/regimen-types")
    public List<RegimenType> getRegimenTypes() {
        return regimenTypeRepository.findAll();
    }

    @GetMapping("/clinics/regimens/regimen-type/{regimenTypeId}")
    public List<Regimen> getRegimensByRegimenType(@PathVariable Long regimenTypeId) {
        Optional<RegimenType> regimenType = regimenTypeRepository.findById(regimenTypeId);
        if (regimenType.isPresent()) {
            return regimenRepository.findByRegimenType(regimenType.get());
        }
        return new ArrayList<>();
    }

    @GetMapping("/clinics/patient/{id}/visit-dates")
    public List<LocalDate> getVisitDatesByPatient(@PathVariable Long id) {
        List<LocalDate> visitDates = new ArrayList<>();
        patientRepository.findById(id).ifPresent(patient -> {
            List<LocalDate> dates = clinicRepository.findVisitsByPatient(patient).stream()
                    .map(VisitDates::getDateVisit)
                    .collect(Collectors.toList());
            visitDates.addAll(dates);
        });
        return visitDates;
    }

    @GetMapping("/clinics/patient/{id}/enrolled-on-otz")
    public Boolean enrolledOnOTZ(@PathVariable Long id) {
        return clinicService.enrolledOnOTZ(id);
    }
}
