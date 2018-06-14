const tape = require("tape");
const PrioritizedTaskExecutor = require("../prioritizedTaskExecutor.js");

const taskExecutor = new PrioritizedTaskExecutor(2);

tape("prioritized task executor test", (t) => {
  const tasks = [1, 2, 3, 4];
  const callbacks = [];
  const executionOrder = [];

  tasks.forEach((task) => {
    taskExecutor.execute(task, (cb) => {
      executionOrder.push(task);
      callbacks.push(cb);
    });
  });

  callbacks.forEach((callback) => {
    callback();
  });

  const expectedExecutionOrder = [1, 2, 4, 3];

  t.deepEqual(executionOrder, expectedExecutionOrder);
  t.end();
});
