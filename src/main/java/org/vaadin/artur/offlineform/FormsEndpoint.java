package org.vaadin.artur.offlineform;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

import javax.annotation.Nullable;

import com.vaadin.flow.server.connect.Endpoint;
import com.vaadin.flow.server.connect.auth.AnonymousAllowed;

@Endpoint
@AnonymousAllowed
public class FormsEndpoint {
    public static class FormInfo {
        private final int id;
        private final String name;

        public FormInfo(int id, String name) {
            this.id = id;
            this.name = name;
        }

        public FormInfo(Form form) {
            this(form.id, form.getName());
        }

        public int getId() {
            return id;
        }

        public String getName() {
            return name;
        }
    }

    public static class Field {
        private final String id;
        private final String name;
        private final String type;
        private final @Nullable String options;

        public Field(String id, String name, String type, String options) {
            this.id = id;
            this.name = name;
            this.type = type;
            this.options = options;
        }

        public String getId() {
            return id;
        }

        public String getName() {
            return name;
        }

        public String getType() {
            return type;
        }

        public String getOptions() {
            return options;
        }
    }

    public static class Form {
        private final int id;
        private final String name;
        private final List<Field> fields;
        private final Map<String, List<String>> options;

        public Form(int id, String name, List<Field> fields, Map<String, List<String>> options) {
            this.id = id;
            this.name = name;
            this.fields = fields;
            this.options = options;
        }

        public int getId() {
            return id;
        }

        public String getName() {
            return name;
        }

        public List<Field> getFields() {
            return fields;
        }

        public Map<String, List<String>> getOptions() {
            return options;
        }
    }

    public Map<Integer, Form> forms = new HashMap<>();

    public FormsEndpoint() {
        Map<String, List<String>> form1Options = new HashMap<>();
        form1Options.put("bosses", IntStream.range(0, 10000).mapToObj(i -> "Boss " + i).collect(Collectors.toList()));
        forms.put(Integer.valueOf(1), new Form(1, "Form 1",
                Arrays.asList(new Field("name", "Name", "text", null), new Field("boss", "Boss", "dropdown", "bosses")),
                form1Options));

        Map<String, List<String>> form2Options = new HashMap<>();
        form2Options.put("options", Arrays.asList("Yes", "No", "Maybe"));
        forms.put(Integer.valueOf(2), new Form(2, "Form 2",
                Arrays.asList(new Field("awesome", "Are you awesome?", "dropdown", "options")), form2Options));
    }

    public List<FormInfo> getForms() {
        return forms.values().stream().map(FormInfo::new).collect(Collectors.toList());
    }

    public Form getForm(int formId) {
        return forms.get(formId);
    }

    public String sayHello(String name) {
        return "Hello " + name;
    }
}