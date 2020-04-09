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
  images: string[] = [];
  @property({ type: String })
  imageSrc: string = "";

  @property({ type: String })
  statusMessage: string = "";
  updateTimer?: NodeJS.Timeout;

  async connectedCallback() {
    super.connectedCallback();

    const imageKeys = await keys();
    this.doUpdateImages(imageKeys);

    if (imageKeys.length == 0) {
      await this.clearAndLoadImages();
    } else {
      this.setLoadedStatus(imageKeys);
    }
  }
  setLoadedStatus(keys: IDBValidKey[]) {
    this.statusMessage = keys.length + " images available locally";
  }

  async loadUrls(urls: string[]) {
    let loadedUrls = 0;
    for (var i = 0; i < urls.length; i++) {
      const url = urls[i];
      await this.loadUrl(url);
      loadedUrls++;
      this.statusMessage =
        "Loading images from the server " + loadedUrls + "/" + urls.length;
    }
  }
  async loadUrl(url: string) {
    const response = await fetch(url);
    const data = await response.blob();
    await this.addImage(url.replace(".*/", ""), await readAsDataURL(data));
  }

  async clearAndLoadImages() {
    clear();

    this.statusMessage = "Loading images from the server";
    const urls = await getInitialImages();
    await this.loadUrls(urls);
    this.setLoadedStatus(await keys());
  }

  render() {
    return html`
      <div>${this.statusMessage}</div>
      <button @click="${() => this.clearAndLoadImages()}">Re-initialize</button>
      <vaadin-upload
        @upload-before=${(e: CustomEvent) => {
          this.upload(e);
          e.preventDefault();
        }}
      ></vaadin-upload>

      <vaadin-combo-box
        style="width: 50%"
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
    const upload: any = e.target;
    const file = e.detail.file;
    file.status = "processing";
    upload._notifyFileChanges(file);

    const data = await readAsDataURL(file);
    await this.addImage(file.name, data);

    file.complete = true;
    file.held = false;
    file.status = "complete";
    upload._notifyFileChanges(file);

    console.log("Done");

    setTimeout(() => {
      upload.files = upload.files.filter((f: any) => f != file);
    }, 500);
  }

  async addImage(name: string, data: string) {
    const key = name;
    await set(key, data);
    this.updateImages();
  }

  updateImages() {
    if (this.updateTimer) {
      return;
    }
    this.updateTimer = setTimeout(async () => {
      this.doUpdateImages(await keys());
      this.updateTimer = undefined;
    }, 500);
  }
  doUpdateImages(keys: IDBValidKey[]) {
    this.images = keys as string[];
  }
}
