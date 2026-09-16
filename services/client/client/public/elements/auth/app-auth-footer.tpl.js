import { html } from "lit";

export default function render() {
  return html`
    <style include="shared-styles">
  :host {
    display: block;
    color: var(--color-white);
  }
  [hidden] {
    display: none !important;
  }
  a {
    color: var(--color-white);
    cursor: pointer;
    display: block;
    padding: var(--spacing-half);
    text-decoration: underline;
    padding-left: 0;
  }
  @media (max-width: 768px) {
    .gold,
    span.logged-in-as {
      padding-left: 0;
    }
  }
</style>

<div>
  <span class="logged-in-as" ?hidden="${!this.loggedIn}">Logged in as: ${this.user.preferred_username}</span>
  <a ?hidden="${this.loggedIn}" href="/auth/login?redirectUrl=${this.path}">Admin Login</a>
  <div ?hidden="${!this.loggedIn}">
    <a @click="${this._logout}" class="gold">Log Out</a>
  </div>
</div>
`;
}
