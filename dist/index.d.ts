interface ParsedTemplate {
    source: string;
    render(data: Record<string, any>): string;
    renderAsync(data: Record<string, any>): Promise<string>;
}
export declare function parse(code: string): ParsedTemplate;
export declare function parseAsync(code: string): Promise<ParsedTemplate>;
export declare function render(code: string, data?: Record<string, any>): string;
export declare function renderAsync(code: string, data?: Record<string, any>): Promise<string>;
export {};
