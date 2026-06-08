# Agent Rules — read this file fully before writing any code.

1. Complete ONLY the current task. Do not implement anything from future tasks.
2. After writing all code for this task, re-read every file you created or modified.
3. Verify each file against the task spec: check for missing imports, undefined variables,
   wrong function signatures, and broken cross-file references.
4. Before declaring the task done, go through the Review Checkpoint list one item at a time
   and explicitly confirm each one passes. If any fail, fix them first.
5. Do not refactor or reorganize code from previous tasks unless the current task requires it.
6. ALL game state lives in gameState.js. Never store mutable game state inside other modules.
7. All draw functions receive ctx as a parameter. Never call document.getElementById inside draw functions.
8. All positions and sizes are calculated from W and H (canvas dimensions), never hardcoded pixels.
9. When a task says "add to update()" or "add to draw()", locate those functions in main.js and
   insert the call in the correct order. Do not duplicate the loop.
10. After completing the task, list every file modified and summarize what changed in each one.
