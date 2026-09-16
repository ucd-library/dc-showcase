import { html, css } from 'lit';

export function styles() {
  const elementStyles = css`
    :host {
      display: block;
    }

    .slider {
      display: block;
      position: relative;
      height: 20px;
      top: 25px;

      -webkit-touch-callout: none; /* iOS Safari */
      -webkit-user-select: none; /* Safari */
      -khtml-user-select: none; /* Konqueror HTML */
      -moz-user-select: none; /* Firefox */
      -ms-user-select: none; /* Internet Explorer/Edge */
      user-select: none; /* Non-prefixed version, currently */
    }

    #track {
      position: relative;
      width: 100%;
      height: 8px;
      background-color: #ccc;
      border-radius: 10px;
      cursor: pointer;
    }

    #handle {
      background: #022851;
      position: absolute;
      width: 20px;
      height: 20px;
      border-radius: 50%; 
      top: -5px;
      margin-left: -9px;
      z-index: 6;
      border: none;
    }

    .search-indicators {
      position: absolute;
    }

    .search-indicators .indicator {
      background-color: var(--color-aggie-gold);
      width: 8px;
      position: absolute;
      height: 17px;
      bottom: 6px;
      border-radius: 2px;
      display: inline-block;
      cursor: pointer;
    }

    .search-indicators .search-query {
      display: none;
    }

    .search-indicators .indicator:hover .search-query {
      display: block;
      position: absolute;
      left: -14px;
      bottom: 25px;
      width: 350px;
      max-width: 100vw;
      padding: 12px 14px;
      padding-bottom: 10px;
      color: #fff;
      background: #333;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
      border-radius: 4px;
      animation: fadeUp 0.2s;
      font-size: 0.9rem;
      cursor: pointer;
      z-index: 100;
    }

    .search-indicators .search-query footer {
      font-size: .8rem;
    }

    .search-indicators .search-query mark {
      color: #adaedc;
      font-weight: bold;
      background-color: #272958;
    }

    .label {
      width : 25px;
      font-size: 12px; 
      position: absolute;
      top: -22px;
      left: -2px;
      text-align: center;
      transform: scale(0);
      transition: transform 200ms linear;
      color: var(--default-primary-color);
    }

    .label[moving] {
      transform: scale(1);
    }

  `;

  return [elementStyles];
}

export function render() { 
return html`
  <div class="slider">
    <div class="search-indicators">
      <!-- <div class="search-query">
        <main>"Lean M. <mark>Davis</mark>, B.S.; E.H. Hagermann; Henry L. Hurst"</main>
        <footer>Page 45</footer>
      </div> -->
    </div>
    <div id="track" @click="${this._onClickTrack}">
      <div id="handle"  
        @mousedown="${this._onMoveStart}"
        @touchstart="${this._onMoveStart}">
        <div id="numberLabel" class="label" ?moving="${this.isMoving}">${this.selectedPage+1}</div>
     </div>
    </div>
  </div>

`;}