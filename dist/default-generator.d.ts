import { JSTTGenerator } from "./generator.interface";
export declare class DefaultGenerator implements JSTTGenerator {
    code: string;
    stdout: string;
    echo(text: string): void;
}
