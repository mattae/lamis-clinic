package org.fhi360.lamis.modules.clinic;

import com.foreach.across.core.annotations.AcrossDepends;
import com.foreach.across.core.context.configurer.ComponentScanConfigurer;
import com.foreach.across.modules.hibernate.jpa.AcrossHibernateJpaModule;
import org.lamisplus.modules.base.LamisModule;

@AcrossDepends(required = AcrossHibernateJpaModule.NAME)
public class LamisClinicModule extends LamisModule {
    public static final String NAME = "LAMISClinicModule";

    public LamisClinicModule() {
        super();
        addApplicationContextConfigurer(
                new ComponentScanConfigurer(getClass().getPackage().getName() + ".service",
                        getClass().getPackage().getName() + ".web"));
    }

    @Override
    public String getName() {
        return NAME;
    }
}
