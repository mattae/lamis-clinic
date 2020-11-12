package org.fhi360.lamis.modules.clinic.web.rest;

import io.github.jhipster.web.util.ResponseUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.lamisplus.modules.base.web.errors.BadRequestAlertException;
import org.lamisplus.modules.base.web.util.HeaderUtil;
import org.lamisplus.modules.lamis.legacy.domain.entities.CaseManager;
import org.lamisplus.modules.lamis.legacy.domain.repositories.CaseManagerRepository;
import org.lamisplus.modules.lamis.legacy.domain.repositories.FacilityRepository;
import org.lamisplus.modules.lamis.legacy.domain.repositories.PatientRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Slf4j
public class CaseManagerResource {
    private final static String ENTITY_NAME = "caseManager";
    private final CaseManagerRepository caseManagerRepository;
    private final FacilityRepository facilityRepository;
    private final PatientRepository patientRepository;

    /**
     * POST  /case-managers : Create a new caseManager.
     *
     * @param caseManager the caseManager to create
     * @return the ResponseEntity with status 201 (Created) and with body the new caseManager, or with status 400 (Bad Request) if the caseManager has already an ID
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PostMapping("/case-managers")
    public ResponseEntity<CaseManager> createCaseManager(@RequestBody CaseManager caseManager) throws URISyntaxException {
        LOG.debug("REST request to save caseManager : {}", caseManager);
        if (caseManager.getId() != null) {
            throw new BadRequestAlertException("A new caseManager cannot already have an ID", ENTITY_NAME, "idexists");
        }

        CaseManager result = caseManagerRepository.save(caseManager);
        return ResponseEntity.created(new URI("/api/case-managers/" + result.getId()))
                .headers(HeaderUtil.createEntityCreationAlert(ENTITY_NAME, result.getId().toString()))
                .body(result);
    }

    /**
     * PUT  /case-managers : Updates an existing caseManager.
     *
     * @param caseManager the caseManager to update
     * @return the ResponseEntity with status 200 (OK) and with body the updated caseManager,
     * or with status 400 (Bad Request) if the caseManager is not valid,
     * or with status 500 (Internal Server Error) if the caseManager couldn't be updated
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PutMapping("/case-managers")
    public ResponseEntity<CaseManager> updateCaseManager(@RequestBody CaseManager caseManager) throws URISyntaxException {
        LOG.debug("REST request to update caseManager : {}", caseManager);
        if (caseManager.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }

        CaseManager result = caseManagerRepository.save(caseManager);
        return ResponseEntity.ok()
                .headers(HeaderUtil.createEntityUpdateAlert(ENTITY_NAME, caseManager.getId().toString()))
                .body(result);
    }

    /**
     * GET  /case-managers/:id : get the "id" caseManager.
     *
     * @param id the id of the caseManager to retrieve
     * @return the ResponseEntity with status 200 (OK) and with body the caseManager, or with status 404 (Not Found)
     */
    @GetMapping("/case-managers/{id}")
    public ResponseEntity<CaseManager> getCaseManager(@PathVariable Long id) {
        LOG.debug("REST request to get caseManager : {}", id);
        Optional<CaseManager> caseManager = caseManagerRepository.findById(id);
        return ResponseUtil.wrapOrNotFound(caseManager);
    }

    /**
     * GET  /case-managers/:id : get the "uuid" caseManager.
     *
     * @param id the uuid of the caseManager to retrieve
     * @return the ResponseEntity with status 200 (OK) and with body the caseManager, or with status 404 (Not Found)
     */
    @GetMapping("/case-managers/by-uuid/{id}")
    public ResponseEntity<CaseManager> getCaseManagerByUuid(@PathVariable String id) {
        LOG.debug("REST request to get caseManager : {}", id);
        Optional<CaseManager> caseManager = caseManagerRepository.findByUuid(id);
        return ResponseUtil.wrapOrNotFound(caseManager);
    }

    /**
     * DELETE  /case-managers/:id : delete the "id" caseManager.
     *
     * @param id the id of the caseManager to delete
     * @return the ResponseEntity with status 200 (OK)
     */
    @DeleteMapping("/case-managers/{id}")
    public ResponseEntity<Void> deleteCaseManager(@PathVariable Long id) {
        LOG.debug("REST request to delete caseManager : {}", id);
        caseManagerRepository.findById(id).ifPresent(caseManager ->
                patientRepository.findByCaseManager(caseManager).forEach(patient -> {
                    patient.setCaseManager(null);
                    patientRepository.save(patient);
                }));
        caseManagerRepository.deleteById(id);
        return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert(ENTITY_NAME, id.toString())).build();
    }

    /**
     * GET  /case-managers : get the all caseManagers.
     *
     * @param id the id of the facility whose caseManager to retrieve
     * @return the ResponseEntity with status 200 (OK) and with body the caseManager
     */
    @GetMapping("/case-managers")
    public ResponseEntity<List<CaseManager>> getCaseManagersByFacility(@RequestParam Long id, Pageable pageable) {
        HttpHeaders headers = new HttpHeaders();
        headers.add("X-Total-Count", "0");
        return facilityRepository.findById(id).map(facility -> {
            Page<CaseManager> page = caseManagerRepository.findByFacility(facility, pageable);
            headers.add("X-Total-Count", Long.toString(page.getTotalElements()));
            return new ResponseEntity<>(page.getContent(), headers, HttpStatus.OK);
        }).orElse(new ResponseEntity<>(new ArrayList<>(), headers, HttpStatus.OK));
    }
}
