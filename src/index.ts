const tokenTypes = [
  { name: 'comment', test: /^(?:<#|\s*<!#)((?:.|\s)*?)(?:#>|#!>\s*)/ },
  { name: 'text', test: /^(?:\s*<!|<\?)=((?:.|\s)*?)(?:!>\s*|\?>)/ },
  { name: 'raw', test: /^(?:\s*<!|<\?)-((?:.|\s)*?)(?:!>\s*|\?>)/ },
  { name: 'code', test: /^(?:\s*<!|<\?)((?:.|\s)*?)(?:!>\s*|\?>)/ },
  { name: 'content', test: /^((?:.|\s)+?)(<\?|<#|\s*<!|\s*<!#)|(?:.|\s)+/ },
]

function lexer(code: string) {
  const tokens: any[] = []

  while (code) {
    let match: RegExpMatchArray | null | undefined
    
    for (const type of tokenTypes) {
      match = type.test.exec(code)
      
      if (match) {
        const token = {
          type: type.name,
          content: match[1] || match[0]
        }

        if (token.type === 'text' || token.type === 'raw' || token.type === 'comment') {
          code = code.substring(match[0].length)
        } else {
          code = code.substring(token.content.length)
        }

        tokens.push(token)
        
        break
      }
    }

    if (!match) {
      code = code.substr(1)
    }
  }

  return tokens
}

const utils = {
  safeText(text: string) {
    return String(text)
      .replace(/&/gim, '&amp;')
      .replace(/</gim, '&lt;')
      .replace(/>/gim, '&gt;')
  }
}

function quote(text: string) {
  return '`' + text + '`'
}

function append(exp: string) {
  return `$$ += ${exp};\n`
}

function util(name: string, ...args: string[]) {
  return `$.${name}(${args.join(', ')})`
}

function flush() {
  return '\nreturn $$;'
}

function parser(tokens: any[]) {
  let code = "let $$ = '';\n"

  while (tokens.length) {
    let token = tokens.shift()

    if (token.type === 'comment') continue

    if (token.type === 'content') {
      code += append(quote(token.content))
      continue
    }

    if (token.type === 'text' || token.type === 'raw') {
      const exp = String(token.content).trim()

      if (token.type === 'text') {
        code += append(util('safeText', exp))
      } else {
        code += append(exp)
      }

      continue
    }

    if (token.type === 'code') {
      code += token.content + '\n'
    }

    if (token.type === 'end_code') {
      continue
    }
  }

  code += flush()

  return code
}

// eslint-disable-next-line
const AsyncFunction = eval(
  'Object.getPrototypeOf(async function() {}).constructor'
)

interface ParsedTemplate {
  code: string
  render(data: Record<string, any>): string
  renderAsync(data: Record<string, any>): Promise<string>
}

export function parse(code: string): ParsedTemplate {
  const result = parser(lexer(code))

  return {
    code: result,
    // eslint-disable-next-line
    render: new Function('$', '$data', `with ($data) {${result}}`).bind(
      null,
      utils
    ),
    renderAsync: new AsyncFunction(
      '$',
      '$data',
      `with ($data) {${result}}`
    ).bind(null, utils)
  }
}

export async function parseAsync(code: string): Promise<ParsedTemplate> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        resolve(parse(code))
      } catch (err) {
        reject(err)
      }
    }, 0)
  })
}

export function render (code:string, data: Record<string, any> = {}) {
  return parse(code).render(data)
}

export async function renderAsync (code:string, data: Record<string, any> = {}) {
  return parseAsync(code).then(jstpl => jstpl.renderAsync(data))
}
