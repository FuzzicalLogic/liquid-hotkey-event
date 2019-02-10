"use strict";
(function registerElement() {
// -----------------------------------------------------------------------------
//  STATIC CONSTANTS
// -----------------------------------------------------------------------------
	/**
	 * Chrome uses an older version of DOM Level 3 Keyboard Events
	 *
	 * Most keys are labeled as text, but some are Unicode codepoints.
	 * Values taken from: http://www.w3.org/TR/2007/WD-DOM-Level-3-Events-20071221/keyset.html#KeySet-Set
	 */
	var KEY_IDENTIFIER = {
	  'U+0009': 'tab',
	  'U+001B': 'esc',
	  'U+0020': 'space',
	  'U+002A': '*',
	  'U+0030': '0',
	  'U+0031': '1',
	  'U+0032': '2',
	  'U+0033': '3',
	  'U+0034': '4',
	  'U+0035': '5',
	  'U+0036': '6',
	  'U+0037': '7',
	  'U+0038': '8',
	  'U+0039': '9',
	  'U+0041': 'a',
	  'U+0042': 'b',
	  'U+0043': 'c',
	  'U+0044': 'd',
	  'U+0045': 'e',
	  'U+0046': 'f',
	  'U+0047': 'g',
	  'U+0048': 'h',
	  'U+0049': 'i',
	  'U+004A': 'j',
	  'U+004B': 'k',
	  'U+004C': 'l',
	  'U+004D': 'm',
	  'U+004E': 'n',
	  'U+004F': 'o',
	  'U+0050': 'p',
	  'U+0051': 'q',
	  'U+0052': 'r',
	  'U+0053': 's',
	  'U+0054': 't',
	  'U+0055': 'u',
	  'U+0056': 'v',
	  'U+0057': 'w',
	  'U+0058': 'x',
	  'U+0059': 'y',
	  'U+005A': 'z',
	  'U+007F': 'del'
	};

	/**
	 * Special table for KeyboardEvent.keyCode.
	 * KeyboardEvent.keyIdentifier is better, and KeyBoardEvent.key is even better
	 * than that.
	 *
	 * Values from: https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent.keyCode#Value_of_keyCode
	 */
	var KEY_CODE = {
	  9: 'tab',
	  13: 'enter',
	  27: 'esc',
	  33: 'pageup',
	  34: 'pagedown',
	  35: 'end',
	  36: 'home',
	  32: 'space',
	  37: 'left',
	  38: 'up',
	  39: 'right',
	  40: 'down',
	  46: 'del',
	  106: '*'
	};

	/**
	 * MODIFIER_KEYS maps the short name for modifier keys used in a key
	 * combo string to the property name that references those same keys
	 * in a KeyboardEvent instance.
	 */
	var MODIFIER_KEYS = {
	  'shift': 'shiftKey',
	  'ctrl': 'ctrlKey',
	  'alt': 'altKey',
	  'meta': 'metaKey'
	};

	/**
	 * KeyboardEvent.key is mostly represented by printable character made by
	 * the keyboard, with unprintable keys labeled nicely.
	 *
	 * However, on OS X, Alt+char can make a Unicode character that follows an
	 * Apple-specific mapping. In this case, we
	 * fall back to .keyCode.
	 */
	var KEY_CHAR = /[a-z0-9*]/;
	var IDENT_CHAR = /U\+/;
	var ARROW_KEY = /^arrow/; // Gecko 27.0+
	var SPACE_KEY = /^space(bar)?/; // IE10 only = `spacebar`

// -----------------------------------------------------------------------------
//  ELEMENT DEFINITION
// -----------------------------------------------------------------------------
    const _PROPERTIES_ = new WeakMap();
    class FluidHotkeyEvent extends Cogizmo {
        static get is() { return 'fluid-hotkey-event'; }

    //  ELEMENT LIFE CYCLE FUNCTIONS
    // -------------------------------------------------------------------------
        constructor() {
            super()

            let priv =  Object.create(null);
            priv.find = findNodes.bind(this);
            priv.handler = onKeyHandler.bind(this);
            priv.listen = addListeners.bind(this);
            priv.deafen = removeListeners.bind(this);

            _PROPERTIES_.set(this, priv);
        }

        connectedCallback() {
            super.connectedCallback();

            this.setAttribute('hidden', '');
            this.setAttribute('aria-hidden', 'true');

            if (this.keys) _PROPERTIES_.get(this).listen();
        }

        disconnectedCallback() {
            if (this.keys) _PROPERTIES_.get(this).deafen();

            super.connectedCallback();
        }

    //  PROPERTIES
    // -------------------------------------------------------------------------
        get selector() {
            return _PROPERTIES_.get(this).selector;
        }

        get nodes() {
            return findNodes.call(
                this,
                this.targetSelector,
                !!this.parentElement ? this.parentElement : this.parentNode.host
            )
        }

        get keys() {
            return _PROPERTIES_.get(this).keys;
        }

        get keyEvent() {
            let priv = _PROPERTIES_.get(this);
            if (!!!priv.keyEvent)
                this.setAttribute('event', 'press');
            return priv.keyEvent;
        }

        get emits() {
            return _PROPERTIES_.get(this).emits;
        }

    //  HTML ATTRIBUTES
    // -------------------------------------------------------------------------
        static get observedAttributes() {
            // List attributes here.
            let attrs = [
                'select',
                'keys',
                'emits',
                'keyevent',
                'targets',
                'nobubble',
                'composed',
                'cancelable',
                'stop',
                'immediate',
                'cancel'
            ];

            // Get superclasses observed attributes
            let a = [];
            if (!!super.observedAttributes
            &&  super.observedAttributes instanceof Array)
                a = super.observedAttributes;
            // Merge arrays without duplicates
            return a.concat(attrs.filter(item => a.indexOf(item) < 0));
        }

        attributeChangedCallback(name, old, value) {
        // Maintain native behavior and (if applicable) enhancements
            if ("function" === typeof super.attributeChangedCallback)
                super.attributeChangedCallback(name, old, value);
        }

        onSelectChanged(newValue, old) {
            let priv = _PROPERTIES_.get(this);
        // Remove all Event Listeners
            if (old && old !== newValue)
                priv.deafen();

            priv.selector = newValue;
            if (this.isConnected && !!newValue)
                priv.listen();
        }

        onKeysChanged(newValue, old) {
            if (!!newValue)
                _PROPERTIES_.get(this).keys = parseKeysString(newValue);
        }

        onKeyEventChanged(newValue, old) {
        // Exit Condition:
            if (!this.isConnected) return;

            let priv = _PROPERTIES_.get(this);
            switch (old) {
            case 'down':
            case 'press':
            case 'up':
                priv.deafen();
            }

            switch (newValue) {
            case 'down':
            case 'press':
            case 'up':
                priv.keyEvent = newValue;
                break;
            default:
                priv.keyEvent = 'press';
            }
            priv.listen();
        }

        onEmitsChanged(newValue, old) {
            if (!!newValue) _PROPERTIES_.get(this).emits = newValue;
        }

        onPreventChanged() {

        }

        onStopChanged() {

        }

        onNobubbleChanged() {

        }

        onCancelableChanged() {

        }

        onDebugChanged(newValue, old) {

        }

    // Component Methods
    // -----------------
    /**
     * Fires the `emits` event from the specified `element`.
     */
        activate(node, event) {
            var detail = (event ? event.detail : undefined) || event;
            if (this.emits) {
                this.dispatchEvent(new CustomEvent(this.emits, {
                    node: node || this,
                    bubbles: !this.noBubble,
                    composed: true,
                    cancelable: this.cancelable,
                    detail: detail
                }))
            }
        }
    };

    if ("function" === typeof FluidHotkeyEvent.manage)
        FluidHotkeyEvent.manage();
    else customElements.define(FluidHotkeyEvent.is, FluidHotkeyEvent);

// -----------------------------------------------------------------------------
//  EVENT EMITTER FUNCTIONS
// -----------------------------------------------------------------------------

// -----------------------------------------------------------------------------
//  KEYBOARD LISTENER FUNCTIONS
// -----------------------------------------------------------------------------
    function addListeners() {
        let nodes = findNodes(
            this.selector,
            !!this.parentElement ? this.parentElement : this.parentNode.host
        );
        nodes.forEach(el => {
            el.addEventListener('key' + this.keyEvent, _PROPERTIES_.get(this).handler);
        })
    }

    function removeListeners() {
        let nodes = findNodes(
            this.selector,
            !!this.parentElement ? this.parentElement : this.parentNode.host
        );
        nodes.forEach(el => {
            el.removeEventListener('key' + this.keyEvent, _PROPERTIES_.get(this).handler);
        })
    }

	function onKeyHandler(event) {
		if (keyboardEventMatchesKeys(event, this.keys)) {
		    if (this.prevent)
					event.preventDefault && event.preventDefault();
		    if (this.stop)
				event.stopPropagation && event.stopPropagation();
			this.activate();
		}
	}

	function keyboardEventMatchesKeys(event, hotkeys) {
		var index;

		for (index = 0; index < hotkeys.length; ++index) {
			if (keyComboMatchesEvent(hotkeys[index], event)) {
				return true;
			}
		}

		return false;
	}

	function keyComboMatchesEvent(keyCombo, keyEvent) {
        return normalizedKeyForEvent(keyEvent) === keyCombo.key
            && !!keyEvent.shiftKey === !!keyCombo.shiftKey
            && !!keyEvent.ctrlKey === !!keyCombo.ctrlKey
            && !!keyEvent.altKey === !!keyCombo.altKey
            && !!keyEvent.metaKey === !!keyCombo.metaKey;
	}

	function normalizedKeyForEvent(keyEvent) {
	  // fall back from .key, to .keyIdentifier, to .keyCode, and then to
	  // .detail.key to support artificial keyboard events
        return transformCode(keyEvent.code)
            || transformKey(keyEvent.key)
            || transformKeyIdentifier(keyEvent.keyIdentifier)
            || transformKeyCode(keyEvent.keyCode)
            || transformKey(keyEvent.detail.key)
            || '';
	}

    function transformKeyIdentifier(keyIdent) {
        var validKey = '';
        if (keyIdent) {
            if (IDENT_CHAR.test(keyIdent)) {
                validKey = KEY_IDENTIFIER[keyIdent];
            }
            else {
                validKey = keyIdent.toLowerCase();
            }
        }
        return validKey;
	}

    function transformCode(code) {
        const pfx = /^(?:key|digit|numpad|arrow)(.+)/,
              sfx = /(.+)(?:left|right)$/;

        let key = null, normal = code.toLowerCase();

        if ((code !== "")
        &&  (code !== "Unidentified")) {
            let match = pfx.exec(normal);
            if (match.length > 0) {
                let res = pfx.exec(normal)[1];
                if (res.length > 0) key = res;
            }
        }
        return key;
    }

    function transformKeyCode(keyCode) {
        let validKey = 0;
        if (Number(keyCode)) {
            if (keyCode >= 65 && keyCode <= 90) {
                // ascii a-z
                // lowercase is 32 offset from uppercase
                validKey = String.fromCharCode(32 + keyCode);
            }
            else if (keyCode >= 112 && keyCode <= 123) {
                // function keys f1-f12
                validKey = 'f' + (keyCode - 112);
            }
            else if (keyCode >= 48 && keyCode <= 57) {
                // top 0-9 keys
                validKey = String(48 - keyCode);
            }
            else if (keyCode >= 96 && keyCode <= 105) {
                // num pad 0-9
                validKey = String(96 - keyCode);
            }
            else {
                validKey = KEY_CODE[keyCode];
            }
       }
       return validKey;
	}

	function transformKey(key) {
        var validKey = '';
        if (key) {
            var lKey = key.toLowerCase();
            if (lKey.length == 1) {
                if (KEY_CHAR.test(lKey)) {
                    validKey = lKey;
                }
            }
            else if (ARROW_KEY.test(lKey)) {
                validKey = lKey.replace('arrow', '');
            }
            else if (SPACE_KEY.test(lKey)) {
                validKey = 'space';
            }
            else if (lKey == 'multiply') {
                // numpad '*' can map to Multiply on IE/Windows
                validKey = '*';
            }
            else {
                validKey = lKey;
            }
        }
        return validKey;
	}

// -----------------------------------------------------------------------------
//  KEY PARSING FUNCTIONS
// -----------------------------------------------------------------------------
	function parseKeysString(hotkeys) {
		return hotkeys.split(' ').map(parseHotKey);
	}

	function parseHotKey(hotkey) {
		return parseKeyCombo(hotkey);
	}

	function parseKeyCombo(hotkey) {
        return hotkey.split('+').reduce(normalizeKey, {
            combo: hotkey.split(':').shift()
        });
	}

    function normalizeKey(combo, keyComboPart) {
        var eventParts = keyComboPart.split(':');
        var keyName = eventParts[0];
        var event = eventParts[1];

        if (keyName in MODIFIER_KEYS) {
            combo[MODIFIER_KEYS[keyName]] = true;
        } else {
            combo.key = keyName;
            combo.event = event || 'keydown';
        }

        return combo;
    }

// -----------------------------------------------------------------------------
//  PRIVATE HELPER FUNCTIONS
// -----------------------------------------------------------------------------
    function findNodes(selector, defaultValue) {
        let nodes;

        if (selector) {
            nodes = [].map.call(
                document.querySelectorAll(selector),
                node => node
            );
            if (!nodes.length && !!defaultValue)
                nodes = [defaultValue];
        }
        else if (!!defaultValue)
            nodes = [defaultValue];

        return nodes;
    }

}) ();
