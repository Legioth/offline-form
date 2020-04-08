package org.vaadin.artur.offlineform;

import com.vaadin.flow.component.page.AppShellConfigurator;
import com.vaadin.flow.server.PWA;

/**
 * Use the @PWA annotation make the application installable on phones, tablets
 * and some desktop browsers.
 */
@PWA(name = "Offline form", shortName = "offline-form")
public class AppShell implements AppShellConfigurator {
}
