import { on, Text } from '../libs/kontra.js';
import { TEXT_PROPS, COLORS } from '../constants.js';

let showTooltip = false;
const padding = 5;

const tooltip = Text({
  ...TEXT_PROPS,
  color: COLORS.black,
  font: '16px Arial',
  text: '',
  // anchor: { x: 0.5, y: 0.5 },
  render() {
    if (showTooltip) {
      const { context } = this;
      context.fillStyle = COLORS.white;
      context.strokeStyle = COLORS.black;

      context.fillRect(-padding, -padding, this.width + padding *
       2, this.height + padding * 2);
      context.strokeRect(-padding, -padding, this.width + padding * 2, this.height + padding * 2);

      this.draw();
    }
  }
});

on('showTooltip', (text, anchor) => {
  showTooltip = true;
  tooltip.text = text;
  tooltip.x = anchor.x;
  tooltip.y = anchor.y - 20;
});

on('hideTooltip', () => {
  showTooltip = false;
});

// NOTE: only 1 tooltip should be showing at a time
export default tooltip;