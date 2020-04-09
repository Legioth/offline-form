import { Router } from "@vaadin/router";
import "./global-styles";
import "./views/form/form-view";
import "./views/main/main-view";

const routes = [
  {
    path: "",
    component: "main-view",
    children: [
      { path: "", component: "form-view" }, //
    ],
  },
];

export const router = new Router(document.querySelector("#outlet"));
router.setRoutes(routes);
