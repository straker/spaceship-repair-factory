import { loadData } from '../libs/kontra.js';

export const tasks = [];

export async function initTasks() {
  const data = await loadData('/src/data/tasks.csv');
  data
    .split(/[\n\r]/g)
    .filter((row, index) => !!row && index !== 0)
    .forEach(task => {
      const cells = task.split(',');
      if (cells[0]) {
        tasks.push([cells[1], parseInt(cells[2])]);
      } else {
        tasks[tasks.length - 1].push(cells[1], parseInt(cells[2]));
      }
    });
}
