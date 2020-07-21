import * as Benchmark from 'benchmark'
import * as JSTT from '../src'
import * as EJS from 'ejs'

const suite = new Benchmark.Suite

const inputEJS = new Array(100).fill(`<pre><%= JSON.stringify({}) %></pre>`).join('\n')
const inputTPL = new Array(100).fill(`<pre><?= JSON.stringify({}) ?></pre>`).join('\n')

const data = { message: 'Hello' }

suite
  .add('EJS', () => EJS.render(inputEJS, data))
  .add('JSTT', () => JSTT.render(inputTPL, data))
  .on('cycle', (event) => console.log(String(event.target)))
  .on('complete', function () {
    console.log('Fastest is ' + this.filter('fastest').map('name'))
  })
  .run({ async: true });