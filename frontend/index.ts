import "./global-styles";
import "./views/form/inspection-view";
import "./views/form/form-list";

const outlet = document.querySelector("#outlet")!;

export function navigate() {
  let params = new URLSearchParams(window.location.search);
  let inspectionId = params.get("inspection");

  let element;
  if (inspectionId) {
    element = document.createElement("inspection-view");
    (element as any).location = {
      params: { id: inspectionId}
    }
  } else {
    element = document.createElement("form-list");
  }

  outlet.innerHTML = '';
  outlet.appendChild(element);
}

navigate();

window.addEventListener('popstate', navigate);