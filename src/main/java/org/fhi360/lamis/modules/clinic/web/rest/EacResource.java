package org.fhi360.lamis.modules.clinic.web.rest;

import io.github.jhipster.web.util.ResponseUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.lamisplus.modules.base.web.errors.BadRequestAlertException;
import org.lamisplus.modules.base.web.util.HeaderUtil;
import org.lamisplus.modules.lamis.legacy.domain.entities.Eac;
import org.lamisplus.modules.lamis.legacy.domain.entities.Laboratory;
import org.lamisplus.modules.lamis.legacy.domain.entities.LaboratoryLine;
import org.lamisplus.modules.lamis.legacy.domain.repositories.EacRepository;
//import org.lamisplus.modules.lamis.legacy.domain.repositories.LaboratoryLineRepository;
import org.lamisplus.modules.lamis.legacy.domain.repositories.LaboratoryRepository;
import org.lamisplus.modules.lamis.legacy.domain.repositories.PatientRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.net.URISyntaxException;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api")
@Slf4j
public class EacResource {
    private final static String ENTITY_NAME = "eac";
    private final EacRepository eacRepository;
    private final PatientRepository patientRepository;
    private final LaboratoryRepository laboratoryRepository;
    //private final LaboratoryLineRepository laboratoryLineRepository;

    /**
     * POST  /eacs : Create a new eac.
     *
     * @param eac the eac to create
     * @return the ResponseEntity with status 201 (Created) and with body the new eac, or with status 400 (Bad Request) if the eac has already an ID
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PostMapping("/eacs")
    public ResponseEntity<Eac> createEac(@RequestBody Eac eac) throws URISyntaxException {
        LOG.debug("REST request to save eac : {}", eac);
        if (eac.getId() != null) {
            throw new BadRequestAlertException("A new eac cannot already have an ID", ENTITY_NAME, "idexists");
        }

        Eac result = eacRepository.save(eac);
        return ResponseEntity.created(new URI("/api/eacs/" + result.getId()))
                .headers(HeaderUtil.createEntityCreationAlert(ENTITY_NAME, result.getId().toString()))
                .body(result);
    }

    /**
     * PUT  /eacs : Updates an existing eac.
     *
     * @param eac the eac to update
     * @return the ResponseEntity with status 200 (OK) and with body the updated eac,
     * or with status 400 (Bad Request) if the eac is not valid,
     * or with status 500 (Internal Server Error) if the eac couldn't be updated
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PutMapping("/eacs")
    public ResponseEntity<Eac> updateEac(@RequestBody Eac eac) throws URISyntaxException {
        LOG.debug("REST request to update eac : {}", eac);
        if (eac.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }

        Eac result = eacRepository.save(eac);
        return ResponseEntity.ok()
                .headers(HeaderUtil.createEntityUpdateAlert(ENTITY_NAME, eac.getId().toString()))
                .body(result);
    }

    /**
     * GET  /eacs/:id : get the "id" eac.
     *
     * @param id the id of the eac to retrieve
     * @return the ResponseEntity with status 200 (OK) and with body the eac, or with status 404 (Not Found)
     */
    @GetMapping("/eacs/{id}")
    public ResponseEntity<Eac> getEac(@PathVariable Long id) {
        LOG.debug("REST request to get eac : {}", id);
        Optional<Eac> eac = eacRepository.findById(id);
        return ResponseUtil.wrapOrNotFound(eac);
    }

    /**
     * GET  /eacs/:id : get the "uuid" eac.
     *
     * @param id the uuid of the eac to retrieve
     * @return the ResponseEntity with status 200 (OK) and with body the eac, or with status 404 (Not Found)
     */
    @GetMapping("/eacs/by-uuid/{id}")
    public ResponseEntity<Eac> getEacByUuid(@PathVariable String id) {
        LOG.debug("REST request to get eac : {}", id);
        Optional<Eac> eac = eacRepository.findByUuid(id);
        return ResponseUtil.wrapOrNotFound(eac);
    }

    /**
     * DELETE  /eacs/:id : delete the "id" eac.
     *
     * @param id the id of the eac to delete
     * @return the ResponseEntity with status 200 (OK)
     */
    @DeleteMapping("/eacs/{id}")
    public ResponseEntity<Void> deleteEac(@PathVariable Long id) {
        LOG.debug("REST request to delete eac : {}", id);
        eacRepository.deleteById(id);
        return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert(ENTITY_NAME, id.toString())).build();
    }

    /**
     * DELETE  /eacs/:id : delete the "uuid" eac.
     *
     * @param id the uuid of the eac to delete
     * @return the ResponseEntity with status 200 (OK)
     */
    @DeleteMapping("/eacs/by-uuid/{id}")
    public ResponseEntity<Void> deleteEacByUuid(@PathVariable String id) {
        LOG.debug("REST request to delete eac : {}", id);
        eacRepository.findByUuid(id).ifPresent(eacRepository::delete);
        return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert(ENTITY_NAME, id.toString())).build();
    }


    /**
     * GET  /eacs/patient/:uuid : get the "uuid" eac.
     *
     * @param uuid the uuid of the patient whose eac is to retrieved
     * @return the ResponseEntity with status 200 (OK) and with body the eac, or with status 404 (Not Found)
     */
    @GetMapping("/eacs/patient/{uuid}")
    public ResponseEntity<Eac> getEacByPatientUuid(@PathVariable String uuid) {
        LOG.debug("REST request to get eac : {}", uuid);
        Optional<Eac> eac = patientRepository.findByUuid(uuid)
                .flatMap(patient -> eacRepository.findByPatient(patient).stream().findFirst());
        return ResponseUtil.wrapOrNotFound(eac);
    }

    @GetMapping("/eacs/patient/{id}/viral-load-result/at/{date}")
    public ResponseEntity<LaboratoryLine> getViralLoadResult(@PathVariable Long id, @PathVariable LocalDate date) {
        Optional<LaboratoryLine> line = patientRepository.findById(id)
                .flatMap(patient -> {
                    List<Laboratory> laboratories = laboratoryRepository.findViralLoadTestByPatient(patient.getId()).stream()
                            .filter(laboratory -> !laboratory.getDateResultReceived().isAfter(date))
                            .collect(Collectors.toList());
                    if (laboratories.isEmpty()) {
                        return Optional.empty();
                    }
                    Laboratory laboratory = laboratories.stream().min((l1, l2) -> l2.getDateResultReceived()
                            .compareTo(l1.getDateResultReceived())).get();
                    /*return laboratoryLineRepository.findByLaboratory(laboratory).stream()
                            .filter(l -> l.getLabTest().getId().equals(16L))*/
                    return laboratory.getLines().stream()
                            .filter(l -> l.getLabTestId().equals(16L))
                            .findFirst();
                });
        return ResponseUtil.wrapOrNotFound(line);
    }
}
