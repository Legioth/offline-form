import { customElement, html, LitElement, property } from "lit-element";
import { keys, get, set, clear } from "idb-keyval";
import { ifDefined } from "lit-html/directives/if-defined";
import "@vaadin/vaadin-upload";
import "@vaadin/vaadin-combo-box";

//@ts-ignore
import { readAsDataURL } from "promise-file-reader";
import { getInitialImages } from "../../generated/ImageEndpoint";

@customElement("form-view")
export class FormView extends LitElement {
  keys: IDBValidKey[] = [];
  nextKey: number = 0;

  @property({ type: Array })
  images: string[] = [];
  @property({ type: String })
  imageSrc: string = "";

  @property({ type: String })
  statusMessage: string = "";

  async connectedCallback() {
    super.connectedCallback();
    clear();

    this.keys = await keys();
    this.updateImages();
    this.nextKey = this.keys.length;

    this.statusMessage = "Loading initial images from the server";
    const urls = await getInitialImages();
    let loadedUrls = 0;
    urls.forEach(async (url) => {
      const response = await fetch(url);
      const data = await response.blob();
      this.addImage(await readAsDataURL(data));
      loadedUrls++;
      this.statusMessage =
        "Loading initial images from the server " +
        loadedUrls +
        "/" +
        urls.length;
    });
  }

  render() {
    return html`
      <div>${this.statusMessage}</div>
      <vaadin-upload
        @upload-before=${(e: CustomEvent) => {
          this.upload(e);
          e.preventDefault();
        }}
      ></vaadin-upload>

      <vaadin-combo-box
        @value-changed="${(e: CustomEvent) => this.showImage(e)}"
        label="Available images"
        .items=${this.images}
      ></vaadin-combo-box>
      <p>
        <img src="${ifDefined(this.imageSrc)}" style="height: 200px" />
      </p>
    `;
  }
  async showImage(e: CustomEvent<any>) {
    //@ts-ignore
    const key = e.detail.value;

    this.imageSrc = await get(key);
  }
  async upload(e: CustomEvent<any>) {
    //@ts-ignore
    const upload = e.path[0];
    const file = e.detail.file;
    file.status = "processing";
    upload._notifyFileChanges(file);

    const data = await readAsDataURL(file);
    await this.addImage(data);

    file.complete = true;
    file.held = false;
    file.status = "complete";
    upload._notifyFileChanges(file);

    console.log("Done");

    setTimeout(() => {
      upload.files = upload.files.filter((f: any) => f != file);
    }, 500);
  }

  async addImage(data: string) {
    const key = "file-" + this.nextKey++;
    set(key, data);
    this.keys = await keys();
    setTimeout(() => {
      this.updateImages();
    }, 500);
  }

  updateImages() {
    this.images = this.keys as string[];
  }
}
