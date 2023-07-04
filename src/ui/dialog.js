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
  Grid,
  GridClass,
  Button,
  onInput
} from '../libs/kontra.js';

export default class Dialog extends GridClass {
  constructor(headerText, properties = {}) {
    properties = {
      x: GAME_WIDTH / 2,
      y: GAME_HEIGHT / 2,
      anchor: { x: 0.5, y: 0.5 },
      margin: GRID_SIZE / 4,
      flow: 'column',
      rowGap: GRID_SIZE / 2,
      hidden: true,
      ...properties
    }

    super(properties);

    this.dialogName = Text({
      ...TEXT_PROPS,
      text: headerText,
      color: COLORS.black
    });

    const children = [this.dialogName];
    if (this.body) {
      children.push(...this.body);
    }
    this.children = children;
  }

  show() {
    this.hidden = false;
  }

  hide() {
    this.hidden = true;
  }


  // this doesn't prevent children from drawing
  draw() {
    // if (this.hidden) {
    //   return;
    // }

    const { context } = this;

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
  }
}