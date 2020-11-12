package org.fhi360.lamis.modules.clinic.web.rest.vm;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.Data;
import org.lamisplus.modules.lamis.legacy.domain.entities.Patient;

import java.time.LocalDate;

@Data
public class ScreeningVM {
    private Patient patient;
    private LocalDate date;
    private JsonNode data;
}
