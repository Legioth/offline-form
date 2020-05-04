import { customElement, html, LitElement, property } from "lit-element";
import { keys, get, set, del, Store } from "idb-keyval";
import { v4 as uuidv4 } from 'uuid';

import * as formsEndpoint from "../../generated/FormsEndpoint";
import FormInfo from "../../generated/org/vaadin/artur/offlineform/FormsEndpoint/FormInfo";
import { Router } from "@vaadin/router";

const inspectionsStore = new Store('inspections');
const imagesStore = new Store('images');

@customElement("form-list")
export class FormList extends LitElement {
  @property() private forms : FormInfo[] = [];
  @property() private inspections : string[] = [];

  @property() private offline = true;

  private checkOffline = () => {
    navigator.onLine ? this.goOnline() : this.goOffline()
  }

  async connectedCallback() {
    super.connectedCallback();

    window.addEventListener("offline", this.checkOffline);
    window.addEventListener("online", this.checkOffline);
    this.checkOffline();

    this.inspections = (await keys(inspectionsStore)) as string[];
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener("offline", this.checkOffline);
    window.removeEventListener("online", this.checkOffline);
  }

  async goOnline() {
    this.offline = false;

    if (this.forms.length == 0) {
      this.forms = await formsEndpoint.getForms();
    }
  }

  async goOffline() {
    this.offline = true;
  }

  render() {
    return html`
      <h2>Forms</h2>
      ${this.offline 
        ? "Only available when online"
        :html`<ul>
          ${this.forms.map(form => 
            this.renderForm(form))}
        </ul>`
      }
      
      <h2>Incomplete inspections</h2>
      <ul>
      ${this.inspections.map(id => {
        return html`<li>
          <a href="inspection/${id}">${id}</a>
          <button @click=${() => this.removeInspection(id)}>X</button>
          ${this.offline ? '' : html`<button @click=${() => window.alert("Not yet implemented")}>Submit</button>`}
        </li>`;
      })}
      </ul>
    `;
  }
  
  async removeInspection(id: string) {
    let inspection : any = await get(id, inspectionsStore);
    await del(id, inspectionsStore);
    this.inspections = this.inspections.filter(value => value != id);

    if (inspection.images) {
      Object.values(inspection.images).forEach((imageId : any) => {
        del(imageId, imagesStore);
      });
    }
  }

  renderForm(form : FormInfo) {
    return html`<li>
        ${form.name} <button @click=${() => this.startInspection(form)}>Start inspection</button>
      </li>`;
  }

  async startInspection(form : FormInfo) {
    const fullForm = await formsEndpoint.getForm(form.id);
    const id = uuidv4();
    await set(id, fullForm, inspectionsStore);
    Router.go(`inspection/${id}`);
  }
}
