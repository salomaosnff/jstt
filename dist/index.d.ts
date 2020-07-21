interface ParsedTemplate {
    code: string;
    render(data: Record<string, any>): string;
    renderAsync(data: Record<string, any>): Promise<string>;
}
export declare class Template {
    static parse(code: string): ParsedTemplate;
    static parseAsync(code: string): Promise<ParsedTemplate>;
    static render(code: string, data?: Record<string, any>): string;
}
export {};
