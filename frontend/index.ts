import { Router } from "@vaadin/router";
import "./global-styles";
import "./views/form/inspection-view";
import "./views/form/form-list";

const routes = [
  {
    path: "",
    component: "form-list",
  }, {
    path: "inspection/:id",
    component: "inspection-view",
  }
];

export const router = new Router(document.querySelector("#outlet"));
router.setRoutes(routes);
