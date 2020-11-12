package org.fhi360.lamis.modules.clinic.web.rest.vm;

import lombok.Data;
import org.lamisplus.modules.lamis.legacy.domain.entities.Adhere;
import org.lamisplus.modules.lamis.legacy.domain.entities.Clinic;
import org.lamisplus.modules.lamis.legacy.domain.entities.ClinicAdverseDrugReaction;
import org.lamisplus.modules.lamis.legacy.domain.entities.OpportunisticInfection;

import java.util.ArrayList;
import java.util.List;

@Data
public class ClinicVM {
    private Clinic clinic;
    private List<OpportunisticInfection> oiList = new ArrayList<>();
    private List<ClinicAdverseDrugReaction> adrList = new ArrayList<>();
    private List<Adhere> adhereList = new ArrayList<>();
}
