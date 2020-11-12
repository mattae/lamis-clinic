package org.fhi360.lamis.modules.clinic.web.rest.vm;

import lombok.Data;
import org.lamisplus.modules.lamis.legacy.domain.entities.ChronicCare;
import org.lamisplus.modules.lamis.legacy.domain.entities.ChronicCareTB;
import org.lamisplus.modules.lamis.legacy.domain.entities.ChronicCareDM;

import java.util.ArrayList;
import java.util.List;

@Data
public class ChronicCareVm {
    private ChronicCare chronicCare;
    private List<ChronicCareTB> tbs = new ArrayList<>();
    private List<ChronicCareDM> dms = new ArrayList<>();
}
