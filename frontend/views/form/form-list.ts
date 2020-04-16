import { customElement, html, LitElement, property } from "lit-element";
import { until } from "lit-html/directives/until"
import { keys, get, set, del, Store } from "idb-keyval";

import * as formsEndpoint from "../../generated/FormsEndpoint";
import FormInfo from "../../generated/org/vaadin/artur/offlineform/FormsEndpoint/FormInfo";

const formsStore = new Store('forms');

const asyncIf = (condition : Promise<Boolean>, trueValue : any, falseValue : any, pendingValue : any) =>
 until(condition.then(value => value ? trueValue : falseValue), pendingValue);

@customElement("form-list")
export class FormList extends LitElement {
  @property() private forms : Array<FormInfo> = [];

  @property() private offline = true;

  private checkOffline = () => {
    navigator.onLine ? this.goOnline() : this.goOffline()
  }

  async connectedCallback() {
    super.connectedCallback();

    window.addEventListener("offline", this.checkOffline);
    window.addEventListener("online", this.checkOffline);
    this.checkOffline();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener("offline", this.checkOffline);
    window.removeEventListener("online", this.checkOffline);
  }

  async goOnline() {
    this.offline = false;

    this.forms = await formsEndpoint.getForms();
  }

  async goOffline() {
    this.offline = true;

    const ids = (await keys(formsStore)) as number[];
    this.forms = await Promise.all(ids.map(async id => get(id, formsStore) as Promise<FormInfo>));
  }

  async availableOffline(form : FormInfo) {
    const offlineForm = await get(form.id, formsStore);
    return offlineForm != undefined;
  }

  render() {
    return html`
      <ul>
        ${this.forms.map(form => 
          this.renderForm(form))}
      </ul>
      ${this.offline ? "Additional forms may be available online": ""}
    `;
  }

  renderForm(form : FormInfo) {
    return html`<li>
        <a href='form/${form.id}'>${form.name}</a>
        ${asyncIf(this.availableOffline(form),
          html`Available offline <button @click=${() => this.purgeOffline(form)}>Purge</button>`,
          html`<button @click=${() => this.loadOffline(form)}>Load for offline</button>`,
          "Checking offline availability")}
      </li>`;
  }

  async purgeOffline(form: FormInfo) {
    await del(form.id, formsStore);

    if (this.offline) {
      this.forms = this.forms.filter(value => value != form);
    } else {
      this.requestUpdate();
    }
  }

  async loadOffline(form : FormInfo) {
    const formData = await formsEndpoint.getForm(form.id);
    await set(form.id, formData, formsStore);
    this.requestUpdate();
  }
}
