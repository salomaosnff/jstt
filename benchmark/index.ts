import * as Benchmark from 'benchmark'
import * as JSTT from '../src'
import * as EJS from 'ejs'

const suite = new Benchmark.Suite

const inputEJS = new Array(100).fill(`<% 
function table (title, items) { 
  const props = new Set(
    [].concat(...items.map(Object.keys))
  );
%>
<table>
  <thead>
    <tr>
      <th colspan="100%"><%= title %></th>
    </tr>
    <tr>
    <% for (const prop of props ) { %>
      <th><%= prop %></th>
    <% } %>
    </tr>
  </thead>
  <tbody>
    <% for (const item of items) { %>
    <tr>
    <% for (const prop of props ) { %>
      <th><%= item[prop] %></th>
    <% } %>
    </tr>
    <% } %>
  </tbody>
</table>
<% } %>

<? table('Usuários', [
 { id: '1', name: "João" },
 { id: '2', name: "Maria" },
 { id: '3', name: "Pedro" },
 { id: '4', name: "Ana" },
]) %>

<% table('Tarefas', [
 { status: 'done', name: "Item 1" },
 { status: 'pending', name: "Item 2" },
 { status: 'done', name: "Item 3" },
 { status: 'pending', name: "Item 4" },
]) %>`
).join('\n')

const inputJSTT = new Array(100).fill(`<! 
function table (title, items) { 
  const props = new Set(
    [].concat(...items.map(Object.keys))
  );
!>
<table>
  <thead>
    <tr>
      <th colspan="100%"><?= title ?></th>
    </tr>
    <tr>
    <! for (const prop of props ) { ?>
      <th><?= prop ?></th>
    <! } ?>
    </tr>
  </thead>
  <tbody>
    <! for (const item of items) { ?>
    <tr>
    <! for (const prop of props ) { ?>
      <th><?= item[prop] ?></th>
    <! } ?>
    </tr>
    <! } ?>
  </tbody>
</table>
<! } !>

<? table('Usuários', [
 { id: '1', name: "João" },
 { id: '2', name: "Maria" },
 { id: '3', name: "Pedro" },
 { id: '4', name: "Ana" },
]) ?>

<? table('Tarefas', [
 { status: 'done', name: "Item 1" },
 { status: 'pending', name: "Item 2" },
 { status: 'done', name: "Item 3" },
 { status: 'pending', name: "Item 4" },
]) !>`).join('\n')

console.log('Iniciando benchmark...')
suite
  .add('EJS', () => EJS.render(inputEJS))
  .add('JSTT', () => JSTT.render(inputJSTT))
  .on('cycle', (event) => console.log(event.target.aborted ? `${event.target.name}: ${event.target.error}`: String(event.target)))
  .on('complete', function () {
    const fastest = this.filter('fastest')[0]
    const slowest = this.filter('slowest')[0]

    console.log(`\n\x1b[33m${fastest.name} is ${(fastest.hz / slowest.hz).toPrecision(3)}x more faster than ${slowest.name}.\x1b[0m\n`)
  })
  .run();