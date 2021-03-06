package org.vaadin.artur.offlineform.views.masterdetail;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.vaadin.artur.offlineform.backend.BackendService;
import org.vaadin.artur.offlineform.backend.Employee;
import com.vaadin.flow.server.connect.Endpoint;
import com.vaadin.flow.server.connect.auth.AnonymousAllowed;
import com.vaadin.flow.server.connect.exception.EndpointException;

import org.springframework.beans.factory.annotation.Autowired;

/**
 * The endpoint for the client-side List View.
 */
@Endpoint
@AnonymousAllowed
public class MasterDetailEndpoint {

    @Autowired
    private BackendService service;

    public int countEmployees(){
        return service.getEmployees().size();
    }

    public EmployeesData getEmployeesData(int offset, int limit) {
        List<Employee> allEmployees = service.getEmployees();
        List<Employee> employees = allEmployees.stream().skip(offset).limit(limit).collect(Collectors.toList());
        int totalSize = allEmployees.size();
        return new EmployeesData(employees, totalSize);
    }

    public void saveEmployee(Employee employee) throws EndpointException {
        throw new EndpointException("not implemented");
    }

    public static class EmployeesData {
        private List<Employee> employees;
        private int totalSize;

        public EmployeesData(List<Employee> employees, int totalSize){
            this.employees = new ArrayList<>(employees);
            this.totalSize = totalSize;
        }

        public List<Employee> getEmployees(){
            return employees;
        }

        public int getTotalSize(){
            return totalSize;
        }
    }

}
