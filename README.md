# `<fluid-hotkey-event>`

Creates a generic key handler that emits a new event when the specified key
combination is hit. This component is meant to be consumed by other apps and
custom elements and, in best practice, is not utilized on its own.

***Note: All releases until this notes are removed are to be considered prerelease status, without regard to version number.***

## Usage

Emits an event when a `KeyboardEvent` with the specified key(s) is captured on
element nodes that are being listened to.
```html
<fluid-hotkey-event keys="ctrl+s" emits="save">
</fluid-triggered-method>
```

## Installation

`<fluid-hotkey-event>` is available on [NPM](https://www.npmjs.com/package/@cogizmo/fluid-hotkey-event) and may be installed as a dependency.

```
> npm install @cogizmo/fluid-hotkey-event
```

1. Place the files on your server.

2. Install the appropriate [cogizmo/Cogizmo](https://github.com/cogizmo/cogizmo).
    * From npm
    ```
    > npm install @cogizmo/cogizmo
    ```

    * From github

3. Add Cogizmo to your document `<head>`.

    ```html
    <script src="path/to/cogizmo/Cogizmo.js"></script>
    ```

4. Add `<fluid-hotkey-event>` element to your document.

    ```html
    <script src="path/to/fluid-hotkey-event/component.js"></script>
    ```

6. Use element whereever you want to transclude html.

    ```html
    <fluid-hotkey-event></fluid-hotkey-event>
    ```

## Declarative API (HTML)

### `bubbles` attribute

`Boolean`

Whether or not to allow the event emitted by `emits` to bubble through the DOM.

```html
<fluid-hotkey-event keys="alt+f4" emits="close" bubbles>
</fluid-hotkey-event>
```

### `composed` attribute

`Boolean`

Whether or not to allow bubbling event emitted by `emits` to penetrate Shadow DOM barriers.

```html
<fluid-hotkey-event keys="alt+f4" emits="close" bubbles composed>
</fluid-hotkey-event>
```

### `emits` attribute

`String<EventName>` *Required*

The type of event to emit when a KeyboardEvent that is captured matches one or more `keys`.

```html
<fluid-hotkey-event keys="ctrl+a" emits="select-all">
</fluid-hotkey-event>
```

### `event` attribute

`String` (`"up"` | `"down"` | `"press"`) = `"press"`

Which KeyboardEvent to listen for: `keydown`, `keypress` or `keyup`

```html
<fluid-hotkey-event keys="enter space" emits="select-item">
</fluid-hotkey-event>
```

### `keys` attribute

`String` *Required*

Space separated list of key combinations to match `KeyboardEvent`s against.

```html
<fluid-hotkey-event keys="enter space" emits="select-item">
</fluid-hotkey-event>
```

### `select` attribute

`String<CSSSelector>`

Used by `element.querySelectorAll` to attach the `KeyboardEvent` listeners.

```html
<fluid-hotkey-event keys="esc" select="input[type='text']" emits="reset">
</fluid-hotkey-event>
```

## Imperative API (JS)

### `element.bubbles`

`Boolean`

Whether or not to allow the event emitted by `emits` to bubble through the DOM.

### `element.composed`

`Boolean`

Whether or not to allow bubbling event emitted by `emits` to penetrate Shadow DOM barriers.

### `element.emits` *ReadOnly*

Returns `String<EventName>`

The `event.type` that will be emitted when the appropriate `KeyboardEvent` is
matched.

### `element.keyEvent` *ReadOnly*

Returns `String` (`"up"` | `"down"` | `"press"`)

The unprefixed `KeyboardEvent`

### `element.keys` *ReadOnly*

Returns `Array`

### `element.nodes` *ReadOnly*

Returns `Array`

List of nodes returned when queried using `element.selector`.

### `element.selector` *ReadOnly*

Returns `String<CSSSelector>`

Selector that is used to add the event listeners.

## DOM Events

