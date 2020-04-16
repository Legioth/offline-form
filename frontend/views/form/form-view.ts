import { customElement, html, LitElement, property } from "lit-element";
import { get, Store } from "idb-keyval";

import "@vaadin/vaadin-text-field";
import "@vaadin/vaadin-combo-box"

//@ts-ignore
import * as formsEndpoint from "../../generated/FormsEndpoint";
import Form from "../../generated/org/vaadin/artur/offlineform/FormsEndpoint/Form";
import Field from "../../generated/org/vaadin/artur/offlineform/FormsEndpoint/Field";

const formsStore = new Store('forms');

@customElement("form-view")
export class FormView extends LitElement {
  @property() private form : Form | null = null;
  @property() private offline = false;

  private formId = -1;

  private checkOffline = () => {
    navigator.onLine ? this.goOnline() : this.goOffline()
  }

  async connectedCallback() {
    this.formId = +(this as any).location.params.id;

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

    this.form = await formsEndpoint.getForm(this.formId);
  }

  async goOffline() {
    this.offline = true;


    this.form = await get(this.formId, formsStore);
  }
 
  render() {
    if (this.form) {
      return html`
        <h1>${this.form.name}</h1>
        ${this.form.fields.map(field => this.renderField(field))}
      `;
    } else if (this.offline) {
      return `Form ${this.formId} is not available offline`;
    } else {
      return `Loading form`;
    }
  }

  renderField(field: Field) {
    switch(field.type) {
      case "text":
        return html`<vaadin-text-field name=${field.id} label=${field.name}></vaadin-text-field><br>`;
      case "dropdown": {
        let items : string[] = [];
        let optionsId = field.options;
        if (optionsId !== undefined) {
          items = this.form!.options[optionsId];
        }
        return html`<vaadin-combo-box name=${field.id} label=${field.name} .items=${items}></vaadin-combo-box><br>`
      }
      default:
        return "Unknown type: " + field.type;
    }
  }
}
