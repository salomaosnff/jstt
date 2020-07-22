import * as Benchmark from 'benchmark'
import * as JSTT from '../src'
import * as EJS from 'ejs'
import * as NJK from 'nunjucks'
import * as HBS from 'handlebars'

const suite = new Benchmark.Suite

const inputEJS = new Array(100).fill(`<pre><%= message %></pre>`).join('\n')
const inputJSTT = new Array(100).fill(`<pre><?= message ?></pre>`).join('\n')
const inputNJK = new Array(100).fill(`<pre>{{ message }}</pre>`).join('\n')
const data = { message: 'Hello' }

suite
  .add('EJS', () => EJS.render(inputEJS, data))
  .add('JSTT', () => JSTT.render(inputJSTT, data))
  .add('Nunjucks', () => NJK.renderString(inputNJK, data))
  .add('Handlebars', () => HBS.compile(inputNJK)(data))
  .on('cycle', (event) => console.log(event.target.aborted ? `${event.target.name}: ${event.target.error}`: String(event.target)))
  .on('complete', function () {
    const fastest = this.filter('fastest')[0]
    const slowest = this.filter('slowest')[0]

    console.log(`\n\x1b[33m${fastest.name} is ${(fastest.hz / slowest.hz).toPrecision(3)}x more faster then ${slowest.name}.\x1b[0m\n`)
  })
  .run();