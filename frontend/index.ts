import { Router } from "@vaadin/router";
import "./global-styles";
import "./views/form/form-view";

const routes = [
  {
    path: "",
    component: "form-view",
  },
];

export const router = new Router(document.querySelector("#outlet"));
router.setRoutes(routes);
