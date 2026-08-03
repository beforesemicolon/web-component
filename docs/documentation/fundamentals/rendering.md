---
name: '{{t.pages.documentation.fundamentals.rendering.meta.rendering}}'
order: 4.2
title: '{{t.pages.documentation.fundamentals.rendering.meta.rendering_webcomponent_by_before_semicolon}}'
description: '{{t.pages.documentation.fundamentals.rendering.meta.learn_about_the_render_method_and_how_content_slots_work}}'
layout: document
---

## {{t.pages.documentation.fundamentals.rendering.content.rendering}}

{{t.pages.documentation.fundamentals.rendering.content.the_primary_way_to_define_a_component_s_visual_interface_is_by_implementing_the_render_method_th}}

### {{t.pages.documentation.fundamentals.rendering.content.the_render_method}}

{{t.pages.documentation.fundamentals.rendering.content.the_render_method_has_the_following_signature}}

```typescript
render(): HtmlTemplate | string | Node | void
```

#### {{t.pages.documentation.fundamentals.rendering.content.supported_return_types}}

1. {{t.pages.documentation.fundamentals.rendering.content.htmltemplate_the_recommended_return_type_built_using_the_html_tagged_template_from_beforesemicol}}

    ```javascript
    import { WebComponent, html } from '@beforesemicolon/web-component'

    class SimpleCard extends WebComponent {
        render() {
            return html`
                <div class="card">
                    <h2>Card Title</h2>
                    <p>Card content goes here.</p>
                </div>
            `
        }
    }
    ```

2. {{t.pages.documentation.fundamentals.rendering.content.string_a_raw_html_string_can_be_returned_note_that_returning_raw_strings_does_not_benefit_from_t}}

    ```javascript
    class StringElement extends WebComponent {
        render() {
            return '<div>Raw HTML string content</div>'
        }
    }
    ```

3. {{t.pages.documentation.fundamentals.rendering.content.native_node_you_can_return_standard_dom_nodes_created_programmatically}}

    ```javascript
    class DOMNodeElement extends WebComponent {
        render() {
            const div = document.createElement('div')
            div.textContent = 'Native DOM Node Content'
            return div
        }
    }
    ```

4. {{t.pages.documentation.fundamentals.rendering.content.null_or_void_headless_or_logic_only_components_that_do_not_render_any_markup_can_return_null_or}}

    ```javascript
    class HeadlessTracker extends WebComponent {
        onMount() {
            console.log('Tracker active')
            // Perform background tasks...
        }

        render() {
            // Nothing is rendered
        }
    }
    ```

---

### {{t.pages.documentation.fundamentals.rendering.content.slot_projections}}

{{t.pages.documentation.fundamentals.rendering.content.web_components_support_content_projection_via_the_element_allowing_users_to_pass_markup_down_int}}

#### {{t.pages.documentation.fundamentals.rendering.content.default_slots}}

{{t.pages.documentation.fundamentals.rendering.content.an_unnamed_acts_as_the_default_catch_all_container_for_any_children_passed_inside_your_custom_el}}

{{t.pages.documentation.fundamentals.rendering.content.component_definition}}

```javascript
import { WebComponent, html } from '@beforesemicolon/web-component'

class SimpleBox extends WebComponent {
    render() {
        return html`
            <div class="box">
                <slot></slot>
            </div>
        `
    }
}
customElements.define('simple-box', SimpleBox)
```

{{t.pages.documentation.fundamentals.rendering.content.usage_in_html}}

```html
<simple-box>
    <p>This paragraph will render inside the box slot.</p>
</simple-box>
```

#### {{t.pages.documentation.fundamentals.rendering.content.named_slots}}

{{t.pages.documentation.fundamentals.rendering.content.to_project_content_into_specific_locations_use_named_slots_you_specify_the_name_using_the_name_a}}

{{t.pages.documentation.fundamentals.rendering.content.component_definition}}

```javascript
class LayoutPanel extends WebComponent {
    render() {
        return html`
            <div class="panel">
                <header>
                    <slot name="header"></slot>
                </header>
                <main>
                    <slot></slot>
                    <!-- default slot -->
                </main>
                <footer>
                    <slot name="footer"></slot>
                </footer>
            </div>
        `
    }
}
customElements.define('layout-panel', LayoutPanel)
```

{{t.pages.documentation.fundamentals.rendering.content.usage_in_html}}

```html
<layout-panel>
    <h1 slot="header">Panel Header</h1>
    <p>Main content goes to the default slot.</p>
    <p slot="footer">Panel Footer Information</p>
</layout-panel>
```
