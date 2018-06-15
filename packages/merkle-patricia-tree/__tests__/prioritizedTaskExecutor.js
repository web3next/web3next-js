const PrioritizedTaskExecutor = require("../prioritizedTaskExecutor.js");

const taskExecutor = new PrioritizedTaskExecutor(2);

test("prioritized task executor test", () => {
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

  expect(executionOrder).toEqual(expectedExecutionOrder);
});
