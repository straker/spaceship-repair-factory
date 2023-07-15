import GameObject from '../utils/game-object.js';
import {
  GAME_WIDTH,
  GAME_HEIGHT,
  GRID_SIZE,
  TEXT_PROPS,
  COLORS
} from '../constants.js'
import {
  Text,
  GridClass,
  keyPressed,
  imageAssets,
  getWorldRect,
  emit,
  Grid
} from '../libs/kontra.js';
import { i18n } from '../data/translations.js';
import ImageButton, { buttonSize } from './image-button.js';
import { removeFromArray } from '../utils/index.js';

window.getWorldRect = getWorldRect

const dialogStack = Grid({
  x: GAME_WIDTH / 2,
  y: GAME_HEIGHT / 2,
  anchor: { x: 0.5, y: 0.5 },
  flow: 'grid',
  numCols: 2,
  rowGap: GRID_SIZE,
  colGap: GRID_SIZE
});
window.dialogStack = dialogStack;

export default class Dialog extends GridClass {
  constructor(properties = {}) {
    super({
      margin: GRID_SIZE / 4,
      flow: 'column',
      rowGap: GRID_SIZE / 2,
      hidden: true,
      ...properties
    });

    this.closeButton = new ImageButton({
      name: i18n('Close'),
      anchor: { x: 1, y: 0 },
      showTooltip: false,
      image: imageAssets.icons,
      // close x
      iconx: buttonSize,
      icony: 0,
      y: -3,
      x: 0,
      focusSize: 5,
      scaleX: 0.5,
      scaleY: 0.5,
      onDown: () => {
        this.hide();
      }
    });
    // don't add the close button as a child so it doesn't
    // autoplace to the grid
    this.closeButton.parent = this;
    this.closeButton._pc();

    // create accessible HTML node
    const dialog = this._dn = document.createElement('div');
    dialog.setAttribute('role', 'dialog');
    dialog.setAttribute('aria-modal', true);
    dialog.setAttribute('tabindex', -1);
    dialog.setAttribute('hidden', true);
    dialog.classList.add('sr-only');
    document.body.appendChild(dialog);

    dialog.appendChild(this.closeButton._dn);

    dialogStack.addChild(this);
  }

  show(headerText) {
    if (!this._dn.hasAttribute('hidden')) {
      return;
    }

    this.dialogName = Text({
      ...TEXT_PROPS,
      text: headerText,
      color: COLORS.black
    });

    // save children so we can remove them when not visible
    // (since children still render if we don't draw anything)
    this.addChild(this.dialogName);
    this.body?.forEach(child => {
      this.addChild(child);
      if (child._dn) {
        this._dn.appendChild(child._dn);
      }
    });

    this._dn.removeAttribute('hidden');
    this._dn.removeAttribute('inert');
    this._dn.setAttribute('aria-label', headerText);
    this._p();
    this._dn.focus();

    // use sx/sy to force the pointer to calculate the button
    // at the correct position (bit of a hack ¯\_(ツ)_/¯)
    this.closeButton.x = this.width - this.margin / 2;
    this.closeButton.sx = this.width / 2 - this.margin / 2;
    this.closeButton.sy = this.height / 2;

    // make everything not this dialog inert
    Array.from(document.body.children)
      .filter(elm => elm !== this.context.canvas && elm !== this._dn)
      .forEach(elm => elm.setAttribute('inert', true));
  }

  hide() {
    if (this._dn.hasAttribute('hidden')) {
      return;
    }

    this._dn.setAttribute('hidden', true);
    Array.from(document.body.children)
      .filter(elm => elm !== this.context.canvas && elm !== this._dn)
      .forEach(elm => elm.removeAttribute('inert'));
    this.children.forEach(child => child.destroy?.());
    this.children = [];
    emit('hideTooltip');
  }

  advance() {
    // use keyPressed to not override other onInput/key events
    if (keyPressed('esc') && !this._dn.hasAttribute('hidden')) {
      this.hide();
    }
  }

  destroy() {
    super.destroy();
    dialogStack.removeChild(this);
    emit('hideTooltip');
  }

  // this doesn't prevent children from drawing
  draw() {
    const { context, _dn } = this;

    if (_dn.hasAttribute('hidden')) {
      return;
    }

    /*
     * body
     */
    context.fillStyle = COLORS.black;
    context.strokeStyle = COLORS.white;
    context.lineWidth = 2;
    context.fillRect(
      -this.margin,
      -this.margin,
      this.width + this.margin * 2,
      this.height + this.margin * 2
    );
    context.strokeRect(
      -this.margin,
      -this.margin,
      this.width + this.margin * 2,
      this.height + this.margin * 2
    );

    /*
     * header
     */
    context.fillStyle = COLORS.white;
    context.fillRect(
      -this.margin,
      -this.margin,
      this.width + this.margin * 2,
      this.dialogName.height + this.margin * 2
    );

    this.closeButton.render();
  }
}

export function renderDialogs() {
  dialogStack.render();
}

export function updateDialogs() {
  dialogStack.update();
}