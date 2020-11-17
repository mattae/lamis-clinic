package org.fhi360.lamis.modules.clinic.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.NullNode;
import lombok.RequiredArgsConstructor;
import org.fhi360.lamis.modules.patient.service.providers.PatientObservationViewProvider;
import org.lamisplus.modules.lamis.legacy.domain.entities.Eac;
import org.lamisplus.modules.lamis.legacy.domain.entities.LaboratoryLine;
import org.lamisplus.modules.lamis.legacy.domain.entities.Patient;
import org.lamisplus.modules.lamis.legacy.domain.entities.enumerations.ClientStatus;
import org.lamisplus.modules.lamis.legacy.domain.repositories.EacRepository;
//import org.lamisplus.modules.lamis.legacy.domain.repositories.LaboratoryLineRepository;
import org.lamisplus.modules.lamis.legacy.domain.repositories.LaboratoryRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class EacObservationProvider implements PatientObservationViewProvider {
    private final EacRepository eacRepository;
    private final LaboratoryRepository laboratoryRepository;
    //private final LaboratoryLineRepository laboratoryLineRepository;

    @Override
    public boolean applicableTo(Patient patient) {
        final boolean[] above1000 = {false};
        laboratoryRepository.findViralLoadTestByPatient(patient.getId()).stream()
                .sorted((l1, l2) -> l2.getDateResultReceived().compareTo(l1.getDateResultReceived()))
                .limit(1)
                .forEach(laboratory -> {
                    /*LaboratoryLine line = laboratoryLineRepository.findByLaboratory(laboratory)
                            .stream().filter(l -> l.getLabTest().getId() == 16)*/
                    LaboratoryLine line = laboratory.getLines()
                            .stream().filter(l -> l.getLabTestId() == 16)
                            .findFirst().get();
                    long result = 0L;
                    try {
                        result = Long.parseLong(line.getResult());
                    } catch (NumberFormatException ignored) {
                    }
                    if (result > 1000) {
                        above1000[0] = true;
                    }
                });
        List<Eac> eacs = eacRepository.findByPatient(patient);
        Optional<Eac> latestEac = eacs.stream()
                .sorted((e1, e2) -> e2.getDateEac1().compareTo(e1.getDateEac1()))
                .limit(1)
                .findFirst();
        JsonNode extra = patient.getExtra();
        boolean art = (extra.get("art") != null || !(extra.get("art") instanceof NullNode)) && extra.get("art").asBoolean();
        return (eacs.isEmpty() || (latestEac.isPresent() && latestEac.get().getDateSampleCollected() != null))
                && above1000[0] && art;
    }

    @Override
    public String getName() {
        return "Start EAC Session";
    }

    @Override
    public String getPath() {
        return "eacs";
    }
}
