import { html, css } from 'lit';

export function render() { 
return html`
  <style>
    dams-collection-import {
      display: block;
    }

    dams-collection-import .ci-row {
      display: flex;
      justify-content: space-between;
      padding: 10px;
    }

    dams-collection-import pre.logs {
      overflow: auto;
      font-size: 0.8em;
      max-height: 300px;
      background: black;
      color: white;
      padding: 10px;
      margin-top: 0px;
      border-radius: 1.25em 1.25em 1.25em 1.25em;
      box-shadow: 0 0 10px #6fcfeb inset;
      max-width: 90vw;
    }

    dams-collection-import .logs-header {
      font-weight: bold;
      padding: 10px 25px;
      display: inline-block;
    }
  </style>

  <div class="responsive-table">
    <table>
    ${this.collectionList.map(item => html`
      <tr>
        <td>
          ${item.id}
        </td>
        <td style="padding: 5px">
          <div ?hidden="${item.state == 'not-running'}">
            <a href="${this.getJobLink(item.id)}" target="_blank">View in k8s Console</a>
          </div>
          <div>
            ${this._renderStatus(item)}
          </div>
        </td>
        <td>
          <div ?hidden="${item.state !== 'not-running'}">
            <button class="btn btn--primary btn--round" @click="${() => this._onCollectionImportClicked(item.id)}">Run Import</button>
          </div>
          <div ?hidden="${item.state !== 'running'}">
            <button class="btn btn--primary btn--round" @click="${() => this._onForceStopClicked(item.id)}">Force Stop</button>
          </div>
          <div ?hidden="${item.state !== 'finished'}">
            <button class="btn btn--primary btn--round" @click="${() => this._onRerunImportClicked(item)}">Rerun Import</button>
          </div>
          <div ?hidden="${item.state !== 'finished' && !item.volume}">
            <input type="checkbox" id="ibs-input-${item.id}"> Ignore Binary Sync
          </div>
          <div>
            <input type="checkbox" id="private-input-${item.id}"> Set Private
          </div>
        </td>
      </tr>
      <tr>
        <td ?hidden="${!item.logs}" colspan="3" style="border-top: none">
          <span class="logs-header">Logs</span>
          <pre class="logs" collection-id="${item.id}" auto-scroll>
            ${item.logs || ''}
          </pre>
        </td>
      </tr>
    `)}
    </table>
  </div>
`;}