import * as snapshot from 'snap-shot-it';

function abs(x: number) {
  return Math.abs(x);
}

function add(x: number, y: number) {
  return x + y;
}

it('works', () => {
  snapshot(42);
  snapshot('another value');
  snapshot(abs, -3, 2, 4, 3);
  snapshot(add, [3, 4], [5, 6]);
});
