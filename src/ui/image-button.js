import { ButtonClass, emit, getWorldRect } from '../libs/kontra.js';
import { GRID_SIZE, COLORS, TEXT_PROPS } from '../constants.js';

export const buttonSize = GRID_SIZE * 1.5;

export default class ImageButton extends ButtonClass {
  constructor(properties) {
    // if (!properties.name) {
    //   throw new TypeError('ImageButton: name prop is required');
    // }

    super({
      width: buttonSize,
      height: buttonSize,
      showTooltip: true,
      focusSize: 2,
      ...properties,
      text: {
        ...TEXT_PROPS,
        x: buttonSize - 4,
        y: buttonSize - 2,
        anchor: { x: 1, y: 1 },
        font: '14px Arial',
        strokeColor: COLORS.black,
        lineWidth: 5,
        ...properties.text
      }
    });

    // the name is only for screen readers and the tooltip so
    // won't be visible in the UI
    this._dn.textContent = this.name + (this.text ? ': ' + this.text : '');

    if (properties.container) {
      properties.container.appendChild(this._dn);
    }

    // if (properties.onDown) {
    //   this.hasDown = true;
    // } else {
    //   this.disable();
    // }
  }

  // override button preupdate function so we don't override the
  // name of the button
  _p() {
    // update DOM node text if it has changed
    let textContent = '';
    if (textContent.includes(':')) {
      textContent = textContent.substring(textContent.indexOf(':') + 2);
    }

    if (this.text != textContent) {
      this._dn.textContent = this.name + ': ' + this.text;
    }

    // update width and height (need to prerender the button
    // first)
    this.textNode._p();

    let width = this.textNode.width + this.padX * 2;
    let height = this.textNode.height + this.padY * 2;

    this.width = Math.max(width, this.width);
    this.height = Math.max(height, this.height);
    this._uw();
  }

  update() {
    super.update();
    const { hovered, focused, selected, showTooltip, name } = this;
    const shouldShowTooltip = hovered || focused || selected;

    if (showTooltip && name && shouldShowTooltip) {
      emit('showTooltip', name, getWorldRect(this));
      this.showingTooltip = true;
    }

    if (this.showingTooltip && !shouldShowTooltip) {
      emit('hideTooltip');
      this.showingTooltip = false;
    }
  }

  draw() {
    const { name, context, image, iconx, icony, width, height } = this;

    context.fillStyle = COLORS.black;
    context.fillRect(0, 0, width, height);

    if (image) {
      context.drawImage(
        image,
        iconx,
        icony,
        width,
        height,
        0,
        0,
        width,
        height
      );
    }

    if (this.hovered || this.focused || this.selected) {
      context.strokeStyle = COLORS.blue;
    } else if (!this.hasDown || this.disabled) {
      context.strokeStyle = COLORS.grey;
    } else {
      context.strokeStyle = COLORS.white;
    }

    context.lineWidth = this.focusSize;
    context.strokeRect(0, 0, width, height);

    // if (this.hasDown && this.disabled) {
    //   context.globalAlpha = 0.6;
    //   context.fillStyle = COLORS.red;
    //   context.fillRect(0, 0, width, height);
    // }
  }
}