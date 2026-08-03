---
name: '{{t.pages.documentation.advanced.browser_globals.meta.browser_globals}}'
order: 8.3
title: '{{t.pages.documentation.advanced.browser_globals.meta.browser_globals_webcomponent_by_before_semicolon}}'
description: '{{t.pages.documentation.advanced.browser_globals.meta.use_webcomponent_and_re_exported_markup_apis_via_cdn_and_global_window_namespaces}}'
layout: document
---

## {{t.pages.documentation.advanced.browser_globals.content.browser_globals}}

{{t.pages.documentation.advanced.browser_globals.content.for_quick_prototyping_testing_or_simple_web_pages_you_might_prefer_not_to_set_up_a_build_pipelin}}

---

### {{t.pages.documentation.advanced.browser_globals.content.cdn_integration}}

{{t.pages.documentation.advanced.browser_globals.content.to_use_the_component_library_directly_in_your_html_files_load_the_client_script_from_a_cdn_such}}

```html
<!-- Load the latest version -->
<script src="https://unpkg.com/@beforesemicolon/web-component/dist/client.js"></script>

<!-- Or pin a specific version (recommended for production) -->
<script src="https://unpkg.com/@beforesemicolon/web-component@1.19.2/dist/client.js"></script>
```

{{t.pages.documentation.advanced.browser_globals.content.once_loaded_the_library_attaches_a_single_global_variable_bfs_to_the_browser_s_window_object}}

---

### {{t.pages.documentation.advanced.browser_globals.content.the_bfs_global_namespace}}

{{t.pages.documentation.advanced.browser_globals.content.the_window_bfs_namespace_is_structured_as_follows}}

- {{t.pages.documentation.advanced.browser_globals.content.window_bfs_webcomponent_the_core_component_base_class}}
- {{t.pages.documentation.advanced.browser_globals.content.window_bfs_css_the_tagged_template_function_for_creating_reactive_scoped_css}}
- {{t.pages.documentation.advanced.browser_globals.content.window_bfs_markup_an_object_containing_all_the_re_exported_apis_from_the_underlying_beforesemico}}

#### {{t.pages.documentation.advanced.browser_globals.content.re_exported_markup_apis_under_bfs_markup}}

{{t.pages.documentation.advanced.browser_globals.content.through_bfs_markup_you_can_access_all_template_rendering_and_reactivity_tools}}

- {{t.pages.documentation.advanced.browser_globals.content.html_tagged_template_function_for_rendering_dom_elements}}
- {{t.pages.documentation.advanced.browser_globals.content.state_creates_reactive_state_getters_and_setters}}
- {{t.pages.documentation.advanced.browser_globals.content.effect_tracks_side_effects_depending_on_states}}
- {{t.pages.documentation.advanced.browser_globals.content.helper_utilities_when_repeat_suspense_visible_etc}}

---

### {{t.pages.documentation.advanced.browser_globals.content.complete_zero_build_example}}

{{t.pages.documentation.advanced.browser_globals.content.here_is_a_complete_single_file_html_page_showing_how_to_declare_and_use_a_reactive_custom_elemen}}

```html
<!doctype html>
<html lang="en">
    <head>
        <meta charset="UTF-8" />
        <title>Zero-Build Web Component Example</title>
        <!-- 1. Load the library from CDN -->
        <script src="https://unpkg.com/@beforesemicolon/web-component/dist/client.js"></script>
    </head>
    <body>
        <!-- 2. Declare custom elements in the HTML -->
        <user-card username="john_doe"></user-card>

        <script>
            // 3. Extract APIs from the global namespace
            const { WebComponent, css } = window.BFS
            const { html, state } = window.BFS.MARKUP

            // 4. Define your reactive component class
            class UserCard extends WebComponent {
                static observedAttributes = ['username']

                initialState = {
                    name: 'John Doe',
                    role: 'Developer',
                }

                // Scoped, reactive CSS
                stylesheet = css`
                    :host {
                        display: block;
                        padding: 1rem;
                        border: 1px solid #ccc;
                        border-radius: 8px;
                        font-family: sans-serif;
                        background-color: #f9f9f9;
                    }
                    h3 {
                        margin: 0 0 0.5rem;
                        color: var(--primary-color, #333);
                    }
                `

                render() {
                    return html`
                        <h3>${() => this.state.name()}</h3>
                        <p>Username: @${this.props.username}</p>
                        <p>Role: ${() => this.state.role()}</p>
                    `
                }
            }

            // 5. Register the element with the browser
            customElements.define('user-card', UserCard)
        </script>
    </body>
</html>
```

---

### {{t.pages.documentation.advanced.browser_globals.content.standard_es_modules_alternative}}

{{t.pages.documentation.advanced.browser_globals.content.if_you_want_to_use_modern_javascript_imports_import_syntax_without_a_bundler_you_can_import_dire}}

```javascript
import {
    WebComponent,
    html,
    state,
} from 'https://unpkg.com/@beforesemicolon/web-component/dist/esm/index.js'
```

{{t.pages.documentation.advanced.browser_globals.content.pin_the_package_version_for_production_pages_so_cdn_updates_cannot_change_behavior_unexpectedly}}
