import { customElement, html, css, LitElement, property } from "lit-element";
import { get, set, Store, del } from "idb-keyval";

//@ts-ignore
import { readAsDataURL } from "promise-file-reader";

import "@vaadin/vaadin-text-field";
import "@vaadin/vaadin-combo-box";
import "@vaadin/vaadin-radio-button";
import "@vaadin/vaadin-upload";
import "@vaadin/vaadin-radio-button/vaadin-radio-group";

import Form from "../../generated/org/vaadin/artur/offlineform/FormsEndpoint/Form";
import Field from "../../generated/org/vaadin/artur/offlineform/FormsEndpoint/Field";

import { v4 as uuidv4 } from 'uuid';

const inspectionsStore = new Store('inspections');
const imagesStore = new Store('images');

interface Inspection extends Form {
  values: Record<string, any>;
  images: Record<string, string>;
}

@customElement("inspection-view")
export class InspectionView extends LitElement {
  @property() private inspection : Inspection = ({} as Inspection);

  expandedImages : Record<string, string> = {};

  inspectionId: string = "";

  static get styles() {
    return css`
      vaadin-upload {
        display: inline-block;
      }

      img {
        max-height: 200px;
      }
    `;
  }  

  async connectedCallback() {
    super.connectedCallback();

    this.inspectionId = (this as any).location.params.id;
    this.inspection = await get(this.inspectionId, inspectionsStore);
    this.inspection.values = this.inspection.values || {};
    this.inspection.images = this.inspection.images || {};
  }

  async upload(field: string, event: CustomEvent<any>) {
    console.log("Upload", field, event);

    const upload: any = event.target;
    const file = event.detail.file;
    file.status = "processing";
    upload._notifyFileChanges(file);

    const data = await readAsDataURL(file);
    await this.setImage(field, data, true);

    file.complete = true;
    file.held = false;
    file.status = "complete";
    upload._notifyFileChanges(file);

    setTimeout(() => {
      upload.files = upload.files.filter((f: any) => f != file);
    }, 500);    
  }

  async setImage(fieldId: string, data: string, expand : boolean) {
    let oldImageId = this.inspection.images[fieldId];
    if (oldImageId) {
      del(oldImageId, imagesStore);
    }

    let newImageId = uuidv4();
    await set(newImageId, data, imagesStore);
    this.inspection.images[fieldId] = newImageId;
    await this.save();

    if (expand) {
      this.expandedImages[fieldId] = data;
    }
    this.requestUpdate();
  }
 
  render() {
    if (this.inspection.name) {
      let populateDummyRendered = false;
      return html`
        <h1>${this.inspection.name}</h1>
        ${this.inspection.fields.map(field =>{
          let dummyPopulateButton : any = '';
          if (!populateDummyRendered
              && field.type == 'yesnomaybe'
              && this.inspection.values[field.id] === undefined) {
            populateDummyRendered = true;
            dummyPopulateButton = html`
              <button @click=${() => this.fillDummy("base_small.jpg", true)}>Fill in dummy values (small images)</button>
              <button @click=${() => this.fillDummy("base_big.jpg", false)}>Fill in dummy values (huuuge images)</button>
            <br>`
          }
          return  html`
            ${dummyPopulateButton}
            ${this.renderField(field)}<br>
            ${this.renderImageOrUpload(field)}
            <br>`
        })}
      `;
    } else {
      return `Loading inspection`;
    }
  }

  renderImageOrUpload(field: Field) {
    let imageId = this.inspection.images[field.id];
    if (imageId) {
      if (this.expandedImages[field.id]) {
        return html`<img src=${this.expandedImages[field.id]}><button @click=${() => this.removeImage(field.id)}>X</button>`;
      } else {
        return html`<button @click=${() => this.loadImage(field)}>Show image</button>`;
      }
    } else {
      return html`<vaadin-upload capture="camera" accept="image/*"
        @upload-before=${(e: CustomEvent) => {
          this.upload(field.id, e);
          e.preventDefault();
        }}
      ></vaadin-upload>`
    }
  }
  async loadImage(field: Field) {
    let imageId = this.inspection.images[field.id];
    let dataUrl : string = await get(imageId, imagesStore);
    this.expandedImages[field.id] = dataUrl;
    this.requestUpdate();
  }

  async removeImage(id: string) {
    let imageId = this.inspection.images[id];
    if (imageId) {
      del(imageId, imagesStore);
      delete this.inspection.images[id];
      await this.save();
      await this.requestUpdate();
    }
  }

  async setValue(field : Field, value: any) {
    this.inspection.values[field.id] = value;
    await this.save();
  }

  async save() {
    await set(this.inspectionId, this.inspection, inspectionsStore);
  }

  async fillDummy(baseImageUrl : string, expand : boolean) {
    const needsPhoto : Field[] = [];

    this.inspection.fields.forEach(field => {
      if (field.type === 'yesnomaybe' && this.inspection.values[field.id] === undefined) {
        let value = ["yes", "no", "na"][Math.floor(Math.random() * 3)];
        this.inspection.values[field.id] = value;
        needsPhoto.push(field);
      }
    });
    await this.save();
    await this.requestUpdate();

    const baseImage = new Image();
    baseImage.src = baseImageUrl;

    let generateImage = async () => {
      const field = needsPhoto.shift();
      if (field === undefined) {
        return;
      }

      let start = performance.now();
      
      let canvas = document.createElement("canvas")
      canvas.height = baseImage.height;
      canvas.width = baseImage.width;
      let context = canvas.getContext("2d")!;

      context.drawImage(baseImage, 0, 0);

      context.fillStyle = "white";
      let textHeight = baseImage.height / 15;
      context.font = `${textHeight}px sans-serif`
      context.fillText(field.name, 0, textHeight);

      let image = canvas.toDataURL("image/png");

      await this.setImage(field.id, image, expand);

      let end = performance.now();
      console.log(end - start);

      setTimeout(generateImage, 100);
    }
    baseImage.onload = () => {
      generateImage();
    }
  }

  renderField(field: Field) {
    switch(field.type) {
      case "text":
        return html`<vaadin-text-field name=${field.id} label=${field.name}
          .value=${this.inspection.values[field.id]}
          @change=${(event : InputEvent) => this.handleFieldChange(field, event)}>
        </vaadin-text-field>`;
      case "dropdown": {
        let items : string[] = [];
        let optionsId = field.options;
        if (optionsId !== undefined) {
          items = this.inspection!.options[optionsId];
        }
        return html`<vaadin-combo-box name=${field.id} label=${field.name} .items=${items}
          .value=${this.inspection.values[field.id]}
          @change=${(event : InputEvent) => this.handleFieldChange(field, event)}>
        ></vaadin-combo-box>`
      }
      case "yesnomaybe": {
        return html`<vaadin-radio-group label="${field.name}"
            .value=${this.inspection.values[field.id]}
            @change=${(event : InputEvent) => this.handleFieldChange(field, event)}>
          <vaadin-radio-button value="yes">Yes</vaadin-radio-button>
          <vaadin-radio-button value="no">No</vaadin-radio-button>
          <vaadin-radio-button value="na">N/A</vaadin-radio-button>
        </vaadin-radio-group>`;
      }
      default:
        return "Unknown type: " + field.type;
    }
  }

  handleFieldChange(field : Field, event : InputEvent) {
    this.setValue(field, (event.target as any).value);
  }
}
