package org.fhi360.lamis.modules.clinic.service;

import lombok.RequiredArgsConstructor;
import org.fhi360.lamis.modules.patient.service.providers.PatientObservationViewProvider;
import org.lamisplus.modules.lamis.legacy.domain.entities.Eac;
import org.lamisplus.modules.lamis.legacy.domain.entities.Patient;
import org.lamisplus.modules.lamis.legacy.domain.repositories.EacRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EacUpdateObservationProvider implements PatientObservationViewProvider {
    private final EacRepository eacRepository;

    @Override
    public boolean applicableTo(Patient patient) {
        List<Eac> eacs = eacRepository.findByPatient(patient);
        if (eacs.isEmpty()) {
            return false;
        }
        Eac eac = eacs.get(0);
        return eac.getDateEac2() == null || eac.getDateEac3() == null || eac.getDateSampleCollected() == null;
    }

    @Override
    public String getName() {
        return "Update EAC Session";
    }

    @Override
    public String getPath() {
        return "eacs";
    }
}
