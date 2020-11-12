package org.fhi360.lamis.modules.clinic.web.rest.vm;

import lombok.Data;

import java.time.LocalDate;

@Data
public class Client {
    private Long id;
    private String name;
    private String hospitalNum;
    private Long lgaId;
    private LocalDate dateStarted;
    private LocalDate dateBirth;
    private String gender;
    private String address;
    private String status;
    private String currentStatus;
    private Long caseManagerId;
    private Long cd4;
    private Double cd4p;
    private Long viralLoad;
    private Boolean pregnant;
    private Boolean breastfeeding;
}
