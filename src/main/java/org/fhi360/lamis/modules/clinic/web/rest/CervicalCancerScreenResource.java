package org.fhi360.lamis.modules.clinic.web.rest;

import lombok.RequiredArgsConstructor;
import org.fhi360.lamis.modules.clinic.service.CervicalCancerScreeningService;
import org.fhi360.lamis.modules.clinic.web.rest.vm.ObservationVM;
import org.lamisplus.modules.lamis.legacy.domain.entities.Observation;
import org.lamisplus.modules.lamis.legacy.domain.repositories.ObservationRepository;
import org.lamisplus.modules.lamis.legacy.domain.repositories.PatientRepository;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api")
public class CervicalCancerScreenResource {
    private final ObservationRepository observationRepository;
    private final CervicalCancerScreeningService screeningService;
    private final PatientRepository patientRepository;

    @PostMapping("/cervical-cancer-screenings")
    public void saveScreening(@RequestBody ObservationVM vm) {
        screeningService.saveScreening(vm.getPatient(), vm.getDate(), vm.getData());
    }

    @GetMapping("/cervical-cancer-screenings/patient/{id}")
    public Optional<Observation> getScreeningByPatient(@PathVariable Long id) {
        return patientRepository.findById(id).map(screeningService::getCervicalCancerScreening).get();
    }

    @GetMapping("/cervical-cancer-screenings/patient/{id}/has-screening")
    public boolean patientHasScreening(@PathVariable Long id) {
        return patientRepository.findById(id).map(screeningService::hasCervicalCancerScreening).orElse(false);
    }

    @DeleteMapping("/cervical-cancer-screenings/{id}")
    public void delete(@PathVariable String id) {
        observationRepository.deleteById(id);
    }

    @DeleteMapping("/cervical-cancer-screenings/by-uuid/{id}")
    public void deleteByUuid(@PathVariable String id) {
        observationRepository.deleteById(id);
    }
}
