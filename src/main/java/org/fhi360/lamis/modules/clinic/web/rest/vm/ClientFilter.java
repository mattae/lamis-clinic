package org.fhi360.lamis.modules.clinic.web.rest.vm;

import lombok.Data;

@Data
public class ClientFilter {
    private Boolean pregnant;
    private Boolean breastfeeding;
    private Long lgaId;
    private Integer lowerAgeLimit;
    private Integer upperAgeLimit;
    private String gender;
    private String status;
    private String hospitalNum;
    private int size;
    private int page;
    private Integer facilityId;
    private Boolean assigned;
    private Long caseManagerId;
}
