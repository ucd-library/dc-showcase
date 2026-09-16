import { html } from 'lit';

import SharedHtml from '../../utils/shared-html';
import { sharedStyles } from "../../styles/shared-styles";
import priorityLinksCss from "@ucd-lib/theme-sass/4_component/_priority-links.css";
import iconsCss from "@ucd-lib/theme-sass/4_component/_icons.css";
import categoryBrandCss from "@ucd-lib/theme-sass/4_component/_category-brand.css";
import verticalLinksCss from "@ucd-lib/theme-sass/4_component/_vertical-link.css";
import mobileBarCss from "@ucd-lib/theme-sass/4_component/_mobile-bar.css";
import navToggleCss from "@ucd-lib/theme-sass/4_component/_nav-toggle.css";
import headingsCss from "@ucd-lib/theme-sass/2_base_class/_headings.css";
import linksCss from "@ucd-lib/theme-sass/1_base_html/_links.css";
import buttonsCss from "@ucd-lib/theme-sass/2_base_class/_buttons.css";
import listsCss from "@ucd-lib/theme-sass/2_base_class/_lists.css";

export default function render() {
  return html`
    <style>
      ${sharedStyles}
      ${priorityLinksCss}
      ${iconsCss}
      ${categoryBrandCss}
      ${verticalLinksCss}
      ${mobileBarCss}
      ${navToggleCss}
      ${headingsCss}
      ${linksCss}
      ${buttonsCss}
      ${listsCss}
      :host {
        display: block;
        position: relative;
        background-color: var(--super-light-background-color);
      }

      .text-container {
        margin: 0;
        padding: 0 10px 50px 10px;
      }

      h1, h4 {
        color: var(--default-primary-color);
      }

      h4 {
        margin: 15px 0 0 0px;
      }

      .yellow-line {
        margin: 0 auto 0 0;
        text-align: left;
        width: 50px;
        height: 4px;

        border-color: var(--default-secondary-color);
        background-color: var(--default-secondary-color);
      }

      .fw-light {
        font-weight: 200;
        font-style: normal;
        margin: 0.75rem 0 0.25rem;
        padding: 0;
        line-height: 1.2;
      }

      app-about .title-section {
        text-align: center;
        border-bottom: dotted 5px var(--default-secondary-color);
      }

      app-about .title-section h1 {
        margin-top: 0.5rem;
      }

      app-about .splat-icon-container {
        display: flex;
        justify-content: center;
        padding-top: 2rem;
      }

      app-about .splat-icon-container img {
        width: 6rem;
      }


    </style>
    <div class="splat-icon-container">
      <img
        class="header-icon"
        slot="header-icon"
        src="/images/watercolors/watercolor-splat-sunset-about.png"
      />
    </div>
    <div class="text-container">  
      <div class="title-section">
        <h1>About<br><span class="fw-light">Digital Collections</span></h1>
      </div>
      
      <p>
        UC Davis Digital Collections provide online access to digitized or born-digital materials from the UC Davis Library, 
        with a particular focus on the rare and unique materials in its Archives and Special Collections. 
        These documents, images, audio and video files offer a rich resource for exploration by scholars and the public alike.
      </p>
      
      <h4>How We Determine What to Share Online</h4>
      
      <p>      
        We consider materials based on criteria including the library's collecting strengths and priorities, rarity, 
        research value, demonstrated demand, support of areas of excellence for UC Davis, and the desire to elevate the 
        narratives, perspectives, and expertise of communities historically underrepresented in the scholarly record. 
      </p>

      <p>
        We acknowledge that some materials presented in our collections may reflect views that are considered outdated, 
        biased or offensive today. Although some of these materials may be difficult to encounter, we believe it is 
        important to document history without censorship, so that students and scholars can reflect on and learn from the past. 
        The library's stewardship and preservation of the breadth of the historical record does not imply support for any views expressed therein.
      </p>

      <h4>Contact</h4>
      <p>
        Please contact us with questions or to report potential errors. Regarding requests to remove materials published 
        in our digital collections, it is generally the policy of the UC Davis Library to provide access as broadly as possible 
        to the materials we hold, consistent with our legal and ethical obligations, and to remove materials only for 
        compelling legal or ethical reasons. Given our commitment to the integrity of the historical record, we are unable 
        to alter errors or inaccuracies in original materials. The ultimate authority to make decisions regarding takedown 
        requests lies with the University Librarian or their designee. All questions, corrections, or requests should be directed to:
      </p>      
      <div>
        <ul class="list--arrow" style="margin-top: 0;">
          <li><a href="mailto:digitalcollections@ucdavis.edu">digitalcollections@ucdavis.edu</a></li>
        </ul>
      </div>

      <h4>Platform</h4>
      <p>
        The UC Davis Digital Collections platform is actively developed by the UC Davis Library.  
        The platform runs using multiple web standards, including primarily the Fedora Linked Data Platform 
        server and Web Components for user interface design.
      </p>
      
    </div>
`;}