# Reusable forms and localization

[Public API](index.md) · [Component review](component-review.md) · [Run the examples](../examples/README.md)

Use a custom element when the same semantic interaction needs a stable contract in several places. An app that only needs one input can use the native input or its installed Cube control directly. Do not wrap an existing form control just to rename `label`, `disabled`, or an existing event.

## Own a native form deliberately

The [contact request](../examples/contact-request.html) is a complete no-build example. For npm, use its [module](../examples/contact-request.js) and [page markup](../examples/contact-request-markup.html). The example does not transmit form data.

| Surface                 | Contract                                                                                                                                                                          |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Attributes / properties | `heading`, `email-label` / `emailLabel`, `submit-label` / `submitLabel`, `pending-label` / `pendingLabel`, and `busy`. Copy updates remain reactive without replacing the form.   |
| Slot                    | `help`: consumer-supplied supporting content. Keep controls that submit the shadow form in the form itself.                                                                       |
| Native behavior         | A fieldset and legend group the control. Its wrapping label gives the email input its accessible name. The browser handles required input, email syntax, and keyboard submission. |
| Public event            | `contact-request` emits `{ email: string }` from the host when the native form is valid. Listen on the host, not an ancestor. Do not emit from invalid or busy submission.        |
| Public method           | `focusEmail()` is an intentional native-style command. It finds the concrete input through a local ref. Consumers need not touch the shadow tree.                                 |

The component is a **self-contained form**. Do not put it inside another form or assume the internal input becomes a field of an outer form. If your actual requirement is a custom input that participates in an external form, prefer a native control in that form or a verified form-associated element. Do not invent form association from the existence of `WebComponent.internals`.

The caller owns submission, permission, network errors, retries, and the success message. Read the public event once, set `busy` before awaiting work, and clear it only for the current request. When a caller disconnects or changes the account or entity, remove its host listener and abort or invalidate the request. Keep validation errors next to the relevant field when they refer to a field. Use an appropriate live region or alert for non-field results. Let the platform enforce client constraints and validate independently on the server.

## Let the application own language

Keep locale-independent component data (IDs, values, event names, and payloads) separate from user-visible copy. Inventory all copy: visible labels, help, placeholders, error/loading/success text, tooltips, document metadata, and accessible names. If shared dialogs open from several routes, their common catalog must work without first visiting the originating view. Keep feature-only messages with the feature. Use stable semantic keys such as `contact.emailLabel`, not an English sentence or its current wording. User-entered text and entity names are data, not keys.

The contact form accepts resolved strings because it is reusable independently of any locale library. The example applies Portuguese props and slotted help without rebuilding the control or dropping its live value. This is a component contract demo, not a translation system. Reuse the application's current runtime and message catalog; do not add a local dictionary wrapper, another fallback chain, or a separate translation cache. Change `lang` when the rendered language differs from its parent.

### Optional: connect an existing Before Semicolon Intl scope

If the project already uses Intl (verify the installed release), prefer its provider-aware `<intl-msg>` for translated content where the rendering boundary supplies the right provider. For concrete strings passed as component properties, resolve from the owning mounted scope and update them when its runtime is ready. Do not assume a provider outside a shadow root is discovered from inside that root; pass resolved values or slot the provider-aware text from the caller. No Intl install is necessary for the contact example.

For Intl 0.5.0, the parent can bind an already configured scope as follows. Define the indicated keys in the application's loaded catalog before mounting. The parent calls the returned cleanup when it disconnects or changes scope.

```js
import { subscribeIntl } from '@beforesemicolon/intl/runtime'
import { intlMsg } from '@beforesemicolon/intl/formatters'

function bindContactCopy(form, scope) {
    return subscribeIntl(({ status, locale }) => {
        if (status !== 'ready') return
        form.lang = locale
        form.heading = intlMsg('contact.title', {}, { scope })
        form.emailLabel = intlMsg('contact.emailLabel', {}, { scope })
        form.submitLabel = intlMsg('contact.submit', {}, { scope })
        form.pendingLabel = intlMsg('contact.pending', {}, { scope })
    }, scope)
}
```

Intl owns the locale switch and fallback. If the caller applies more asynchronous work after a switch, invalidate stale work if another language is selected. Do not capture a translated string at module import time or include translated fields in a reusable event payload.

## Verify the actual contract

1. In a browser, target the textbox by accessible name and attempt submission with empty, invalid, and valid input. Only the valid input should emit one host event. Confirm Enter works and the event's technical payload is independent of locale.
2. Set `busy` and verify the controls disable and the pending text is announced. Clear it and verify the form is usable again.
3. Change the copy while a draft is in the input; check both visible text and accessible name, the value, and explicit focus. Mount two instances and ensure changing one does not change the other.
4. When integrated with Intl, test the shared component with only its required shared messages loaded. Test a runtime locale change, and test a missing default catalog key as an error rather than accepting its key as UI text. For a scoped route or dialog, verify that leaving and reopening does not retain an old locale subscription or deliver a stale action result.
