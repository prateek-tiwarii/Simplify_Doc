declare module 'culori' {
  export function parse(input: string): any;
  export function converter(mode: string): (c: any) => any;
  export function formatRgb(color: any): string;
}
