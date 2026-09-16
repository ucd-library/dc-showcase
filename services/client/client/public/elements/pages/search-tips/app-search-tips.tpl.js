import { html } from 'lit';

import { sharedStyles } from "../../styles/shared-styles";
import tableStyles1 from '@ucd-lib/theme-sass/1_base_html/_tables.css';
import tableStyles2 from '@ucd-lib/theme-sass/2_base_class/_tables.css';
import responsiveTableStyles from '@ucd-lib/theme-sass/4_component/_responsive-table.css';

export function render() {
return html`
  <style>
    ${sharedStyles}
    ${tableStyles1}
    ${tableStyles2}
    ${responsiveTableStyles}
    :host {
      display: block;
    }

    .search-tips-container .text-container {
      margin: 0;
      padding: 0 10px 50px 10px;
    }

    .search-tips-container .text-container h4 {
      margin-bottom: 0;
    }

    .search-tips-container {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .search-tips-container .title-section {
      text-align: center;
      border-bottom: dotted 5px var(--default-secondary-color);
    }

    .search-tips-container .title-section h1 {
      margin-top: 0.5rem;
    }

    .search-tips-container .splat-icon-container {
      display: flex;
      justify-content: center;
      padding-top: 2rem;
    }

    .search-tips-container .splat-icon-container img {
      width: 6rem;
    }

  </style>

  <div class="search-tips-container">

    <div class="splat-icon-container">
      <img
        class="header-icon"
        slot="header-icon"
        src="/images/watercolors/watercolor-splat-cyan-search-tips.png"/>
    </div>

    <div class="text-container">  
      <div class="title-section">
        <h1>Search Tips</h1>
      </div>

      <h4>Default search</h4>
      <p>
        By default, Digital Collections searches for keyword matches across all parts of an item's data, 
        including the title, description, creator, subject labels and identifiers.
      </p>
      <p style="margin-bottom: 0;">
        For example, searching for <em>farming technology</em> will return results that have both <em>farming</em> 
        <strong>AND</strong> <em>technology</em> present in those areas.
      </p>
  
      <h4>Refine your search results</h4>
      <p>
        If you're getting too many or too few results, try using one or more of these search operators to adjust your search:
      </p>
      <div class="responsive-table" role="region" aria-label="Scrollable Table" tabindex="0">
        <table class="table--bordered">
          <thead>
            <tr>
              <th>Operator</th>
              <th>What it does</th>
              <th>Example</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>|</td>
              <td>Search for results related to either X <strong>OR</strong> Y.</td>
              <td><strong>agricultural | farming technology</strong> may include <em>agricultural technology</em> OR <em>farming technology</em></td>
            </tr>
            <tr>
              <td>*</td>
              <td>Search variations of the word</td>
              <td><strong>agr* technology</strong> may include <em>agricultural technology, agrarian technology</em>, etc.</td>
            </tr>
            <tr>
              <td>""</td>
              <td>Match an exact phrase</td>
              <td><strong>"agricultural technology"</strong></td>
            </tr>
            <tr>
              <td>-</td>
              <td>Exclude keywords from your results</td>
              <td><strong>agricultural technology -advertising</strong></td>
            </tr>
            <tr>
              <td>()</td>
              <td>Indicate precedence in complex searches with multiple operators</td>
              <td>
                <strong>(agricultural | farming) + (technology | mechanics)</strong> includes results for <em>agricultural</em> AND <em>technology</em>,
                or <em>agricultural</em> AND <em>mechanics</em>, or <em>farming</em> AND <em>technology</em>, or <em>farming</em> AND <em>mechanics</em>. Without parentheses,
                results might contain just <em>agricultural</em>, or both <em>farming</em> AND <em>technology</em>, or just <em>mechanics</em>.
              </td>
            </tr>
            <tr>
              <td rowspan="3">~1</td>
              <td>Includes near matches; larger number provides higher result variation</td>
              <td><strong>labor~3</strong></td>
            </tr>
            <tr>
              <td style="border-top: none;">Appending to a <strong>word</strong> allows similar spellings</td>
              <td style="border-top: none;">
                <strong>labor~1</strong> may include the British spelling <em>labour</em>
              </td>
            </tr>
            <tr>
              <td style="border-top: none;">Appending to a <strong>phrase</strong> allows additional words</td>
              <td style="border-top: none;">
                <strong>"agricultural labor"~1</strong> may include <em>agricultural migratory labor, agricultural seasonal labor</em>, etc.
              </td>
            </tr>
            <tr>
              <td>+</td>
              <td>Search for results related to X <strong>AND</strong> Y</td>
              <td><strong>agriculture + technology</strong></td>
            </tr>
          </tbody>
        </table>
      </div>

    </div>
  </div>
`;}
