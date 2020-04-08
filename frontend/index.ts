import { Flow } from '@vaadin/flow-frontend/Flow';
import { Router } from '@vaadin/router';

import './global-styles';
import './views/main/main-view';
import './views/dashboard/dashboard-view';
import './views/masterdetail/master-detail-view';

const { serverSideRoutes } = new Flow({
  imports: () => import('../target/frontend/generated-flow-imports'),
});

const routes = [
  {path: '', component: 'main-view', children: [  {path: '', component: 'dashboard-view'},
  {path: 'dashboard', component: 'dashboard-view'},
  {path: 'master-detail', component: 'master-detail-view'},
 ...serverSideRoutes]},

];

export const router = new Router(document.querySelector('#outlet'));
router.setRoutes(routes);
