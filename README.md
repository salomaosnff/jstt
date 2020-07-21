# JSTT - JavaScript Text Templates

## Installation

```bash
$ npm i jtt
# or
$ yarn add jstt
```

## First Template

```typescript
import { render } from 'jstt';

const html = render(`<h1><?= message ?></h1>`, {
  message: 'Hello world!'
});

console.log(html);
```

## Using JavaScript
```typescript
import { render } from 'jstt';

const html = render(`
<? if (flag) { ?>
  <h1><?= message ?></h1>
<? } ?>
`, {
  message: 'Hello world!'
});

console.log(html);
```

## Delimiters

| Delimiter  | Description                       |
|------------|-----------------------------------|
| <?  or <!  | Starts a JavaScript code block    |
| <?= or <!= | Prints an expression as text      |
| <?- or <!- | Prints an expression as html      |
| ?>  or ?>  | Ends a JavaScript code block      |
| <#         | Starts a comment block            |
| #>         | Ends a comment block              |

## Special delimiters

Delimiters that contain "!" they must ignore spaces and line breaks for better readability.
```
<! for (let i = 0; i < 5; i++) { !>
  <h1><!= i !><h1>
<! } !>
```
is the same as:
```
<? for (let i = 0; i < 5; i++) { ?><h1><?= i !><h1><? } !>
```

## Pre-parse

If you need to render the same template for a lot of data, you can use the parse function and use its return several times.

```javascript
const jstt = require('jstt');

const tableTemplate = jstt.parse(`
<table>
  <thead>
    <tr>
      <th colspan="100%"><?= title ?></th>
    </tr>
    <tr>
      <? for (const head of headers) { ?>
        <th><?= head ?></th>
      <! } ?>
    </tr>
  </thead>
  <tbody>
    <? for (const item of items) { ?>
      <tr>
        <? for (const head of headers) { ?>
          <td><?= item[head] ?></td>
        <! } ?>
      </tr>
    <! } ?>
  </thead>
</table>
`);

const usersTable = tableTemplate.render({
  title: 'Users',
  headers: ['id', 'name', 'email'],
  items: [
    { id: '1', name: 'John', email: 'john@email.com' },
    { id: '2', name: 'Mary', email: 'mary@email.com' },
    { id: '3', name: 'Anna', email: 'anna@email.com' },
  ]
});

const todoTable = tableTemplate.render({
  title: 'Todo list',
  headers: ['status', 'title'],
  items: [
    { id: 'done', title: 'Todo 1' },
    { id: 'pending', title: 'Todo 2' },
    { id: 'pending', title: 'Todo 3' },
  ]
});

console.log(usersTable)
console.log(todoTable)
```

## Benchmark

Run `npm run benchmark` or `yarn benchmark`

```
EJS x 1,614 ops/sec ±1.56% (86 runs sampled)
JSTT x 3,460 ops/sec ±1.60% (89 runs sampled)
Fastest is JSTT
```