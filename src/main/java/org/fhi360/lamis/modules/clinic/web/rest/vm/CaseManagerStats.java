package org.fhi360.lamis.modules.clinic.web.rest.vm;

import lombok.Data;

@Data
public class CaseManagerStats {
    private long assigned;
    private long stable;
    private long preArt;
    private long unstableLessThan1year;
    private long unstableMoreThan1Year;
}
