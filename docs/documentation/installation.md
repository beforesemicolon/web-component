---
name: '{{t.pages.documentation.installation.meta.installation}}'
order: 3
title: '{{t.pages.documentation.installation.meta.installation_webcomponent_by_before_semicolon}}'
description: '{{t.pages.documentation.installation.meta.install_webcomponent_via_npm_yarn_pnpm_or_include_it_via_cdn}}'
layout: document
---

## {{t.pages.documentation.installation.content.installation}}

{{t.pages.documentation.installation.content.beforesemicolon_web_component_is_a_plug_and_play_library_it_does_not_require_complex_build_steps}}

### {{t.pages.documentation.installation.content.via_package_managers}}

{{t.pages.documentation.installation.content.install_the_package_using_your_package_manager_of_choice}}

#### {{t.pages.documentation.installation.content.npm}}

```bash
npm install @beforesemicolon/web-component
```

#### {{t.pages.documentation.installation.content.yarn}}

```bash
yarn add @beforesemicolon/web-component
```

#### {{t.pages.documentation.installation.content.pnpm}}

```bash
pnpm add @beforesemicolon/web-component
```

{{t.pages.documentation.installation.content.once_installed_you_can_import_webcomponent_styling_utilities_and_markup_templating_functions_dir}}

```javascript
import { WebComponent, html, css } from '@beforesemicolon/web-component'
```

### {{t.pages.documentation.installation.content.via_cdn}}

{{t.pages.documentation.installation.content.for_rapid_prototyping_or_zero_build_environments_you_can_include_the_script_from_a_cdn_such_as_u}}

#### {{t.pages.documentation.installation.content.latest_version}}

```html
<script src="https://unpkg.com/@beforesemicolon/web-component/dist/client.js"></script>
```

#### {{t.pages.documentation.installation.content.specific_version}}

```html
<script src="https://unpkg.com/@beforesemicolon/web-component@1.21.0-next/dist/client.js"></script>
```

### {{t.pages.documentation.installation.content.cdn_global_namespaces}}

{{t.pages.documentation.installation.content.when_using_the_client_cdn_build_beforesemicolon_web_component_exposes_a_global_variable_bfs_unde}}

- {{t.pages.documentation.installation.content.bfs_webcomponent_the_base_class_for_building_custom_elements}}
- {{t.pages.documentation.installation.content.bfs_css_the_tagged_template_styling_helper}}
- {{t.pages.documentation.installation.content.bfs_markup_the_underlying_markup_library_namespace_containing_html_state_effect_and_other_templa}}

{{t.pages.documentation.installation.content.here_is_an_example_of_accessing_these_apis_from_browser_native_scripts}}

```javascript
const { WebComponent, css } = BFS
const { html, state } = BFS.MARKUP

class MyCounter extends WebComponent {
    initialState = { count: 0 }

    render() {
        return html`
            <button
                type="button"
                onclick="${() =>
                    this.setState({ count: this.state.count() + 1 })}"
            >
                Count: ${this.state.count}
            </button>
        `
    }
}
customElements.define('my-counter', MyCounter)
```
