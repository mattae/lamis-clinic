package org.fhi360.lamis.modules.clinic.service;

import lombok.RequiredArgsConstructor;
import org.fhi360.lamis.modules.patient.service.providers.ObservationValidator;
import org.lamisplus.modules.lamis.legacy.domain.entities.Clinic;
import org.lamisplus.modules.lamis.legacy.domain.entities.Patient;
import org.lamisplus.modules.lamis.legacy.domain.repositories.ClinicRepository;
import org.lamisplus.modules.lamis.legacy.web.rest.errors.ObservationValidationException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ArtCommencementValidator implements ObservationValidator {
    private final ClinicRepository clinicRepository;

    @Override
    public void validate(Object o, Patient patient) throws ObservationValidationException {
        boolean exists = clinicRepository.getArtCommencement(patient).isPresent();
        if (o instanceof Clinic) {
            Clinic clinic = (Clinic) o;
            if (clinic.getCommence() != null && clinic.getCommence() && exists) {
                throw new ObservationValidationException("Patient already has ART Commencement");
            }
        }
    }

    @Override
    public boolean applicableForType(Class<?> aClass) {
        return aClass.isInstance(Clinic.class);
    }
}
