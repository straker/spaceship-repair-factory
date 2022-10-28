import { loadData } from '../libs/kontra.js';
import { CSV } from '../libs/csv.js';

export const tasks = [];

export async function initTasks() {
  const data = await loadData('/src/data/tasks.csv');

  CSV.parse(data)
    .filter((row, index) => index !== 0)
    // remove empty lines
    .filter(line => line.some(cell => !!cell))
    .forEach(cells => {
      if (cells[0]) {
        tasks.push([cells[1], parseInt(cells[2])]);
      } else {
        tasks[tasks.length - 1].push(cells[1], parseInt(cells[2]));
      }
    });

  // console.info('tasks:', tasks);
}
