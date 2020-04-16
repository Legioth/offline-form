import { Router } from "@vaadin/router";
import "./global-styles";
import "./views/form/form-view";
import "./views/form/form-list";

const routes = [
  {
    path: "",
    component: "form-list",
  }, {
    path: "form/:id",
    component: "form-view",
  }
];

export const router = new Router(document.querySelector("#outlet"));
router.setRoutes(routes);
