package org.vaadin.artur.offlineform;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import com.vaadin.flow.server.connect.Endpoint;
import com.vaadin.flow.server.connect.auth.AnonymousAllowed;

import org.springframework.core.io.Resource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;

@Endpoint
@AnonymousAllowed
public class ImageEndpoint {

    private static List<String> images = new ArrayList<>();
    {
        PathMatchingResourcePatternResolver resolver = new PathMatchingResourcePatternResolver();
        try {
            Resource[] resources = resolver.getResources("classpath*:static/**");
            for (Resource r : resources) {
                String path = r.getURL().getPath();
                if (path.endsWith(".jpg")) {
                    path = path.replaceAll(".*/static/images/photo", "images/photo");
                    images.add(path);
                }
            }

        } catch (IOException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        }

    }

    public List<String> getInitialImages() {
        return images;
    }
}