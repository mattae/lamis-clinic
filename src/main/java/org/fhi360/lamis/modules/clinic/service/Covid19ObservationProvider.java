package org.fhi360.lamis.modules.clinic.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.NullNode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.fhi360.lamis.modules.patient.service.providers.PatientObservationViewProvider;
import org.lamisplus.modules.lamis.legacy.domain.entities.Observation;
import org.lamisplus.modules.lamis.legacy.domain.entities.Patient;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class Covid19ObservationProvider implements PatientObservationViewProvider {
    private final Covid19ScreeningService screeningService;

    @Override
    public boolean applicableTo(Patient patient) {
        List<Observation> observations = screeningService.getCovid19Screenings(patient);
        if (observations.isEmpty()) {
            return true;
        }
        return observations.stream()
                .noneMatch(observation -> {
                    JsonNode data = observation.getData();
                    if (data.get("covid19Screening").get("outcome") == null ||
                            data.get("covid19Screening").get("outcome") instanceof NullNode) {
                        return false;
                    }
                    return StringUtils.equals(data.get("covid19Screening").get("outcome").asText(), "Admitted");
                });
    }

    @Override
    public String getName() {
        return "COVID19 Screening";
    }

    @Override
    public String getPath() {
        return "covid19-screenings";
    }
}
