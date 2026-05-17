declare module '@crates/calculate-hash/pkg' {
  export class CreateSha256 {
    init(): void;
    update(data: Uint8Array): void;
    digest(mode: 'binary' | 'hex'): string;
  }
}

declare module '@crates/similar-wasm-wrapper/pkg' {
  export function diff_lines_unified(oldText: string, newText: string): string;
  export function diff_lines_simple(oldText: string, newText: string): string;
  export function diff_lines_structured(
    oldText: string,
    newText: string,
  ): unknown;
  export function diff_chars_unified(oldText: string, newText: string): string;
}
