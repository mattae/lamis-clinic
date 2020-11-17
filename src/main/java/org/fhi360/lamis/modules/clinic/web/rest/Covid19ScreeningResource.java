package org.fhi360.lamis.modules.clinic.web.rest;

import io.github.jhipster.web.util.ResponseUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.fhi360.lamis.modules.clinic.service.Covid19ScreeningService;
import org.fhi360.lamis.modules.clinic.web.rest.vm.ObservationVM;
import org.lamisplus.modules.base.web.errors.BadRequestAlertException;
import org.lamisplus.modules.base.web.util.HeaderUtil;
import org.lamisplus.modules.lamis.legacy.domain.entities.Observation;
import org.lamisplus.modules.lamis.legacy.domain.repositories.PatientRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.Optional;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api")
@Slf4j
public class Covid19ScreeningResource {
    private static final String ENTITY_NAME = "covid19";
    private final Covid19ScreeningService screeningService;
    private final PatientRepository patientRepository;

    /**
     * POST  /covid19-screenings : Create a new observation.
     *
     * @param vm the observation to create
     * @return the ResponseEntity with status 201 (Created) and with body the new observation, or with status 400 (Bad Request) if the observation has already an ID
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PostMapping("/covid19-screenings")
    public ResponseEntity<Observation> saveScreening(@RequestBody ObservationVM vm) throws URISyntaxException {
        LOG.debug("REST request to save Covid19 Screening : {}", vm);
        if (vm.getId() != null) {
            throw new BadRequestAlertException("A new screening cannot already have an ID", ENTITY_NAME, "idexists");
        }
        Observation result = screeningService.saveScreening(vm.getPatient(), vm.getDate(), vm.getData(), vm.getId());

        return ResponseEntity.created(new URI("/api/covid19-screenings/" + result.getId()))
                .headers(HeaderUtil.createEntityCreationAlert(ENTITY_NAME, result.getId()))
                .body(result);
    }

    /**
     * PUT  /covid19-screenings : Updates an existing observation.
     *
     * @param vm the observation to update
     * @return the ResponseEntity with status 200 (OK) and with body the updated observation,
     * or with status 400 (Bad Request) if the observation is not valid,
     * or with status 500 (Internal Server Error) if the observation couldn't be updated
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PutMapping("/covid19-screenings")
    public ResponseEntity<Observation> updateScreening(@RequestBody ObservationVM vm) throws URISyntaxException {

        LOG.debug("REST request to update Covid19 Screening : {}", vm);
        if (vm.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        Observation result = screeningService.saveScreening(vm.getPatient(), vm.getDate(), vm.getData(), vm.getId());

        return ResponseEntity.created(new URI("/api/covid19-screenings/" + result.getId()))
                .headers(HeaderUtil.createEntityCreationAlert(ENTITY_NAME, result.getId()))
                .body(result);
    }

    /**
     * GET  /covid19-screenings/:id : get the "id" observation.
     *
     * @param id the id of the observation to retrieve
     * @return the ResponseEntity with status 200 (OK) and with body the observation, or with status 404 (Not Found)
     */
    @GetMapping("/covid19-screenings/{id}")
    public ResponseEntity<Observation> getScreening(@PathVariable String id) {
        LOG.debug("REST request to get Covid19 Screening: {}", id);
        Optional<Observation> observation = screeningService.getCovid19Screening(id);
        return ResponseUtil.wrapOrNotFound(observation);
    }

    /**
     * GET  /covid19-screenings/:id : get the "uuid" observation.
     *
     * @param id the uuid of the observation.to retrieve
     * @return the ResponseEntity with status 200 (OK) and with body the observation, or with status 404 (Not Found)
     */
    @GetMapping("/covid19-screenings/by-uuid/{id}")
    public ResponseEntity<Observation> getScreeningByUuid(@PathVariable String id) {
        LOG.debug("REST request to get observation : {}", id);
        Optional<Observation> observation = screeningService.getCovid19Screening(id);
        return ResponseUtil.wrapOrNotFound(observation);
    }

    /**
     * DELETE  /covid19-screening/:id : delete the "id" observation.
     *
     * @param id the id of the observation to delete
     * @return the ResponseEntity with status 200 (OK)
     */
    @DeleteMapping("/covid19-screenings/{id}")
    public ResponseEntity<Void> deleteScreening(@PathVariable String id) {
        LOG.debug("REST request to delete Covid19 Screening : {}", id);
        screeningService.deleteScreening(id);
        return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert(ENTITY_NAME, id.toString())).build();
    }

    /**
     * DELETE  /covid19-screenings/:id : delete the "uuid" observation.
     *
     * @param id the uuid of the observation to delete
     * @return the ResponseEntity with status 200 (OK)
     */
    @DeleteMapping("/covid19-screenings/by-uuid/{id}")
    public ResponseEntity<Void> deleteScreeningByUuid(@PathVariable String id) {
        LOG.debug("REST request to delete Covid19 Screening : {}", id);
        screeningService.deleteScreening(id);
        return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert(ENTITY_NAME, id)).build();
    }
}
