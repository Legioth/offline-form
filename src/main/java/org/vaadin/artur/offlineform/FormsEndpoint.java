package org.vaadin.artur.offlineform;

import java.util.ArrayList;
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

        public Field(String name, String type, String options) {
            this.id = name.toLowerCase().replaceAll("\\s", "");
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
        form1Options.put("persons", IntStream.range(0, 10000).mapToObj(i -> "Workplace person " + i).collect(Collectors.toList()));
        List<Field> form1Fields = new ArrayList<>(Arrays.asList(new Field("Workplace location", "text", null), new Field("Accountable", "dropdown", "persons"), new Field("Inspector", "dropdown", "persons")));
        IntStream.range(1, 100).mapToObj(number -> new Field("Generic question " + number, "yesnomaybe", null)).forEach(form1Fields::add);

        forms.put(Integer.valueOf(1), new Form(1, "Workplace Inspection",
                form1Fields,
                form1Options));

        Map<String, List<String>> form2Options = new HashMap<>();
        form2Options.put("options", Arrays.asList("Yes", "No", "Maybe"));
        forms.put(Integer.valueOf(2), new Form(2, "Another Inspection",
        Arrays.asList(new Field("Is it Friday yet?", "dropdown", "options")), form2Options));
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