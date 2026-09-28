import { PORNOT_CODE, PORNOT_LABEL } from '@app/shared/utils/Constants';

export default class ConvertorUtil {
  static convertPornotLabelToCode(label: string): string {
    const labelMapping: { [key: string]: string } = PORNOT_CODE;
    return labelMapping[label] || label;
  }

  static convertPornotCodeToLabel(code: string): string {
    const codeMapping: { [key: string]: string } = PORNOT_LABEL;
    return codeMapping[code] || code;
  }
}
