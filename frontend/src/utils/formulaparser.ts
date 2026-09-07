export class FormulaParser {
  static evaluate(formula: string): number {
    try {
      let f = formula.trim();
      if (f.startsWith('=')) f = f.substring(1);
      
      f = f.replace(/SUM\(([^)]+)\)/g, (_, args) => this.sum(args).toString());
      f = f.replace(/AVERAGE\(([^)]+)\)/g, (_, args) => this.average(args).toString());
      f = f.replace(/MAX\(([^)]+)\)/g, (_, args) => Math.max(...this.parseArgs(args)).toString());
      f = f.replace(/MIN\(([^)]+)\)/g, (_, args) => Math.min(...this.parseArgs(args)).toString());
      
      if (!/^[\d\.\+\-\*\/\(\)\s]+$/.test(f)) {
        throw new Error("Invalid characters in formula");
      }
      
      return new Function(`return ${f}`)();
    } catch (e) {
      throw new Error(`Formula evaluation error: ${(e as Error).message}`);
    }
  }

  private static parseArgs(argsStr: string): number[] {
    return argsStr.split(',').map(s => Number(s.trim()));
  }

  private static sum(argsStr: string): number {
    return this.parseArgs(argsStr).reduce((a, b) => a + b, 0);
  }

  private static average(argsStr: string): number {
    const args = this.parseArgs(argsStr);
    return args.reduce((a, b) => a + b, 0) / args.length;
  }
}
