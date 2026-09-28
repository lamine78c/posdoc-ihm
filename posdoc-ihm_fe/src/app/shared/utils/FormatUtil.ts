export class FormatUtil {
  static formatOuiNon(value: number): string {
    if (value === 0) {
      return 'Non';
    }
    if (value === 1) {
      return 'Oui';
    }
    if (value == null) {
      return '';
    }
    return value.toString();
  }

  static formatValue(field: string, node: any): string {
    if (field == 'password') {
      return node[field] ? '***' : '';
    }
    if (node[field] === true) {
      return 'Vrai';
    }
    if (node[field] === false) {
      return 'Faux';
    }
    return node[field] ?? '';
  }

  static threeDecimalFormatter(value: any): string {
    if (value === 0) {
      return '0.000';
    }
    if (typeof value === 'number') {
      return value.toFixed(3);
    }
    return value;
  }

  /**
   * Formats a number with thousand separators.
   * - Adds 3 decimals only if the number is a decimal.
   * - Keeps integers without decimals, except for 0 => '0.000'.
   * @param value - The input value (number or string)
   * @param decimals - Number of decimal places for decimals (default: 3)
   * @returns A formatted string
   */
  static formatNumberWithThousandSeparators(value: any, decimals: number = 3): string {
    if (value == null || value === '') {
      return '';
    }

    const number = typeof value === 'string' ? parseFloat(value) : value;

    if (isNaN(number)) {
      return value.toString();
    }

    const isInteger = Number.isInteger(number);
    const formatted = isInteger ? number.toString() : number.toFixed(decimals);

    const [integerPart, decimalPart] = formatted.split('.');

    const formattedInteger = new Intl.NumberFormat('fr-FR').format(Number(integerPart));

    return decimalPart ? `${formattedInteger}.${decimalPart}` : formattedInteger;
  }
}
