const tokenTypes = [
  { name: 'comment', test: /^(?:<#|\s*<!#)([\s\S]*?)(?:#>|#!>\s*)/ },
  { name: 'raw', test: /^(?:\s*<!|<\?)([\-=])([\s\S]*?)(?:!>\s*|\?>)/ },
  { name: 'code', test: /^(?:\s*<!|<\?)([\s\S]*?)(?:!>\s*|\?>)/ },
  { name: 'content', test: /^([\s\S]*?)(?:<\?|\s*<![#\-=]?)|(?:[\s\S]+)/ },
]
const tokenTypesLen = tokenTypes.length;

interface ParsedTemplate {
  source: string
  render(data: Record<string, any>): string
  renderAsync(data: Record<string, any>): Promise<string>
}

function lexer(code: string) {
  const tokens: any[] = []

  while (code) {
    let match: RegExpMatchArray | null | undefined

    for (let i = 0; i < tokenTypesLen; i++) {
      const type = tokenTypes[i]
      match = type.test.exec(code)
      
      if (match) {
        const token = {
          type: type.name,
          content: match[1] || match[0],
          escape: false
        }

        if (token.type === 'raw') {
          token.content = match[2]
          token.escape = match[1] === '='
        }
        
        if (token.type === 'content') {
          code = code.substring(token.content.length)
        } else {
          code = code.substring(match[0].length)
        }

        tokens.push(token)
        
        break
      }
    }

    if (!match) {
      throw new Error(`Invalid token "${code[0]}"`)
    }
  }

  return tokens
}

function quote(text: string) {
  return '`' + text.replace('`', '\\`') + '`'
}

function parser(tokens: any[]) {
  let code = '';
  let len = tokens.length;
  
  for (let i = 0; i < len; i++) {
    let token = tokens[i]
    
    if (token.type === 'comment') continue

    if (token.type === 'content') {
      code += `; $__append(${quote(token.content)})\n`
      continue
    }

    if (token.type === 'raw') {
      code += `; $__append(${String(token.content).trim()}, ${token.escape})\n`
      continue
    }

    if (token.type === 'code') {
      code += `; ${token.content}\n`
      continue
    }
  }

  return code
}

// eslint-disable-next-line
const AsyncFunction = eval(
  'Object.getPrototypeOf(async function() {}).constructor'
)

export function parse(code: string): ParsedTemplate {
  const result = parser(lexer(code))
  const source = `
  let $$ = '';

  function $__append (exp, escape) {
    if (exp == undefined || exp == null) {
      return;
    }
    
    if (escape) {
      $$ += String(exp)
        .replace(/&/gim, '&amp;')
        .replace(/</gim, '&lt;')
        .replace(/>/gim, '&gt;');
    } else {
      $$ += String(exp);
    }
  };

  with (Object.assign({ $$: undefined }, locals)) {
    ${result}
  };

  return $$;`

  return {
    source,
    render: new Function('locals', source) as any,
    renderAsync: new AsyncFunction('locals', source)
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

export function render(code: string, data: Record<string, any> = {}) {
  return parse(code).render(data)
}

export async function renderAsync(code: string, data: Record<string, any> = {}) {
  return parseAsync(code).then(jstpl => jstpl.renderAsync(data))
}
