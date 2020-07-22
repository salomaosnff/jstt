const tokenTypes = [
  { name: 'comment', test: /^(?:<#|\s*<!#)((?:.|\s)*?)(?:#>|#!>\s*)/ },
  { name: 'text', test: /^(?:\s*<!|<\?)=((?:.|\s)*?)(?:!>\s*|\?>)/ },
  { name: 'raw', test: /^(?:\s*<!|<\?)-((?:.|\s)*?)(?:!>\s*|\?>)/ },
  { name: 'code', test: /^(?:\s*<!|<\?)((?:.|\s)*?)(?:!>\s*|\?>)/ },
  { name: 'content', test: /^((?:.|\s)+?)(<\?|<#|\s*<!|\s*<!#)|(?:.|\s)+/ },
]

interface ParsedTemplate {
  source: string
  render(data: Record<string, any>): string
  renderAsync(data: Record<string, any>): Promise<string>
}

function lexer(code: string) {
  const tokens: any[] = []

  while (code) {
    let match: RegExpMatchArray | null | undefined

    for (const type of tokenTypes) {
      match = type.test.exec(code)

      
      if (match) {
        const token = {
          type: type.name,
          content: match[1] || match[0],
        }
        
        if (token.type !== 'content') {
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

function quote(text: string) {
  return '`' + text.replace('`', '\\`') + '`'
}

function parser(tokens: any[]) {
  let code = '';
  
  while (tokens.length) {
    let token = tokens.shift()
    
    if (token.type === 'comment') continue

    if (token.type === 'content') {
      code += `$__append(${quote(token.content)});\n`
    }

    else if (token.type === 'text' || token.type === 'raw') {
      code += `$__append(${String(token.content).trim()}, ${token.type === 'text'});\n`
    }

    else if (token.type === 'code') {
      code += `${token.content};\n`
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
