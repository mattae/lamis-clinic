package org.fhi360.lamis.modules.clinic.web.rest;

import io.github.jhipster.web.util.ResponseUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.lamisplus.modules.base.web.errors.BadRequestAlertException;
import org.lamisplus.modules.base.web.util.HeaderUtil;
import org.lamisplus.modules.lamis.legacy.domain.entities.ChronicCare;
import org.lamisplus.modules.lamis.legacy.domain.entities.DMScreen;
import org.lamisplus.modules.lamis.legacy.domain.entities.TBScreen;
import org.lamisplus.modules.lamis.legacy.domain.repositories.ChronicCareRepository;
import org.lamisplus.modules.lamis.legacy.domain.repositories.DMScreenRepository;
import org.lamisplus.modules.lamis.legacy.domain.repositories.PatientRepository;
import org.lamisplus.modules.lamis.legacy.domain.repositories.TBScreenRepository;
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
@RequiredArgsConstructor
@RequestMapping("/api")
@Slf4j
public class ChronicCareResource {
    private static final String ENTITY_NAME = "chronicCare";

    private final ChronicCareRepository chronicCareRepository;
    private final TBScreenRepository tbScreenRepository;
    private final DMScreenRepository dmScreenRepository;
    private final PatientRepository patientRepository;

    /**
     * POST  /chronic-cares : Create a new chronicCare.
     *
     * @param chronicCare the chronicCare to create
     * @return the ResponseEntity with status 201 (Created) and with body the new chronicCare, or with status 400 (Bad Request) if the chronicCare has already an ID
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PostMapping("/chronic-cares")
    public ResponseEntity<ChronicCare> createChronicCare(@RequestBody ChronicCare chronicCare) throws URISyntaxException {
        LOG.debug("REST request to save chronicCare : {}", chronicCare);
        if (chronicCare.getId() != null) {
            throw new BadRequestAlertException("A new chronicCare cannot already have an ID", ENTITY_NAME, "idexists");
        }

        ChronicCare result = chronicCareRepository.save(chronicCare);
        return ResponseEntity.created(new URI("/api/chronic-cares/" + result.getId()))
                .headers(HeaderUtil.createEntityCreationAlert(ENTITY_NAME, result.getId().toString()))
                .body(result);
    }

    /**
     * PUT  /chronic-cares : Updates an existing chronicCare.
     *
     * @param chronicCare the chronicCare to update
     * @return the ResponseEntity with status 200 (OK) and with body the updated chronicCare,
     * or with status 400 (Bad Request) if the chronicCare is not valid,
     * or with status 500 (Internal Server Error) if the chronicCare couldn't be updated
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PutMapping("/chronic-cares")
    public ResponseEntity<ChronicCare> updateChronicCare(@RequestBody ChronicCare chronicCare) throws URISyntaxException {
        LOG.debug("REST request to update chronicCare : {}", chronicCare);
        if (chronicCare.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }

        ChronicCare result = chronicCareRepository.save(chronicCare);
        return ResponseEntity.ok()
                .headers(HeaderUtil.createEntityUpdateAlert(ENTITY_NAME, chronicCare.getId().toString()))
                .body(result);
    }

    /**
     * GET  /chronic-cares/:id : get the "id" chronicCare.
     *
     * @param id the id of the chronicCare to retrieve
     * @return the ResponseEntity with status 200 (OK) and with body the chronicCare, or with status 404 (Not Found)
     */
    @GetMapping("/chronic-cares/{id}")
    public ResponseEntity<ChronicCare> getChronicCare(@PathVariable Long id) {
        LOG.debug("REST request to get chronicCare : {}", id);
        Optional<ChronicCare> chronicCare = chronicCareRepository.findById(id);
        return ResponseUtil.wrapOrNotFound(chronicCare);
    }

    /**
     * GET  /chronic-cares/:id : get the "uuid" chronicCare.
     *
     * @param id the uuid of the chronicCare to retrieve
     * @return the ResponseEntity with status 200 (OK) and with body the chronicCare, or with status 404 (Not Found)
     */
    @GetMapping("/chronic-cares/by-uuid/{id}")
    public ResponseEntity<ChronicCare> getChronicCareByUuid(@PathVariable String id) {
        LOG.debug("REST request to get chronicCare : {}", id);
        Optional<ChronicCare> chronicCare = chronicCareRepository.findByUuid(id);
        return ResponseUtil.wrapOrNotFound(chronicCare);
    }

    /**
     * DELETE  /chronic-cares/:id : delete the "id" chronicCare.
     *
     * @param id the id of the chronicCare to delete
     * @return the ResponseEntity with status 200 (OK)
     */
    @DeleteMapping("/chronic-cares/{id}")
    public ResponseEntity<Void> deleteChronicCare(@PathVariable Long id) {
        LOG.debug("REST request to delete chronicCare : {}", id);
        chronicCareRepository.deleteById(id);
        return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert(ENTITY_NAME, id.toString())).build();
    }

    /**
     * DELETE  /chronic-cares/:id : delete the "uuid" chronicCare.
     *
     * @param id the uuid of the chronicCare to delete
     * @return the ResponseEntity with status 200 (OK)
     */
    @DeleteMapping("/chronic-cares/by-uuid/{id}")
    public ResponseEntity<Void> deleteChronicCareByUuid(@PathVariable String id) {
        LOG.debug("REST request to delete chronicCare : {}", id);
        chronicCareRepository.findByUuid(id).ifPresent(chronicCareRepository::delete);
        return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert(ENTITY_NAME, id.toString())).build();
    }

    @GetMapping("/chronic-cares/tb-screens")
    public List<TBScreen> getTbScreens() {
        return tbScreenRepository.findAll();
    }

    @GetMapping("/chronic-cares/dm-screens")
    public List<DMScreen> getDmScreens() {
        return dmScreenRepository.findAll();
    }

    @GetMapping("/chronic-cares/patient/{id}/visit-dates")
    public List<LocalDate> getVisitDatesByPatient(@PathVariable Long id) {
        List<LocalDate> visitDates = new ArrayList<>();
        patientRepository.findById(id).ifPresent(patient -> {
            List<LocalDate> dates = chronicCareRepository.findVisitsByPatient(patient).stream()
                    .map(VisitDates::getDateVisit)
                    .collect(Collectors.toList());
            visitDates.addAll(dates);
        });
        return visitDates;
    }
}
