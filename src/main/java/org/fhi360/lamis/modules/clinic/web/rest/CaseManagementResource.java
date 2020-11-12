package org.fhi360.lamis.modules.clinic.web.rest;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.fhi360.lamis.modules.clinic.service.CaseManagementService;
import org.fhi360.lamis.modules.clinic.web.rest.vm.CaseManagerStats;
import org.fhi360.lamis.modules.clinic.web.rest.vm.Client;
import org.fhi360.lamis.modules.clinic.web.rest.vm.ClientFilter;
import org.lamisplus.modules.lamis.legacy.domain.entities.CaseManager;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Slf4j
public class CaseManagementResource {
    private final CaseManagementService caseManagementService;

    @GetMapping("/case-management/init-clients/{facilityId}")
    public Boolean initClients(@PathVariable Long facilityId) {
        LOG.info("Starting initialize");
        return caseManagementService.buildClientList(facilityId, false);
    }

    @PostMapping("/case-management/client-list")
    public ResponseEntity<List<Client>> getClientList(@RequestBody ClientFilter filter) {
        return caseManagementService.searchClients(filter);
    }

    @GetMapping("/case-management/facility/{facilityId}/case-manager/{caseManagerId}/stats")
    public CaseManagerStats getStats(@PathVariable Long facilityId, @PathVariable Long caseManagerId) {
        return caseManagementService.getStats(caseManagerId, facilityId);
    }

    @GetMapping("/case-management/facility/{facilityId}/case-managers")
    public List<CaseManager> getCaseManagersByFacility(@PathVariable Long facilityId) {
        return caseManagementService.getCaseManagers(facilityId);
    }

    @GetMapping("/case-management/case-manager/{caseManagerId}/assign-clients")
    public void assignClientsToCaseManager(@PathVariable Long caseManagerId, @RequestParam List<Long> ids) {
        caseManagementService.assignClientsToCaseManager(caseManagerId, ids);
    }

    @GetMapping("/case-management/de-assign-clients")
    public void deAssignClients(@RequestParam List<Long> ids) {
        caseManagementService.deAssignClient(ids);
    }
}
