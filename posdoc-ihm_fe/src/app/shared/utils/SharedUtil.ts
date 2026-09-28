import { AgGridUtil } from './AgGridUtil';
import { DateUtil } from './DateUtil';
import { FormUtil } from './FormUtil';
import { ArrayUtil } from './ArrayUtil';
import { FormatUtil } from './FormatUtil';
import { StringUtil } from './StringUtil';

export default class SharedUtil {
  static getGroupedFields = AgGridUtil.getGroupedFields;
  static getGroupedFieldsConcat = AgGridUtil.getGroupedFieldsConcat;
  static getGroupedFieldsAllConcat = AgGridUtil.getGroupedFieldsAllConcat;
  static getNumberTotalRows = AgGridUtil.getNumberTotalRows;
  static getGridHeight = AgGridUtil.getGridHeight;
  static getDetailRow = AgGridUtil.getDetailRow;
  static generatePinnedBottomRowForGroupedRows = AgGridUtil.generatePinnedBottomRowForGroupedRows;
  static generatePinnedBottomRowForNotGroupedRows = AgGridUtil.generatePinnedBottomRowForNotGroupedRows;
  static calculateColumnSum = AgGridUtil.calculateColumnSum;
  static updateTotalRowCount = AgGridUtil.updateTotalRowCount;

  static getNgbDateFromString = DateUtil.getNgbDateFromString;
  static getCurentDate = DateUtil.getCurentDate;
  static formatDateToDDMMYYYYHHMMSS = DateUtil.formatDateToDDMMYYYYHHMMSS;
  static formatDateToDDMMYYYY = DateUtil.formatDateToDDMMYYYY;
  static comparePeriodes = DateUtil.comparePeriodes;
  static getDateFromPeriode = DateUtil.getDateFromPeriode;
  static formatDate = DateUtil.formatDate;

  static getOrgFormByOrgData = FormUtil.getOrgFormByOrgData;
  static getSelectedValuesFromListeDeroulanteMultiple = FormUtil.getSelectedValuesFromListeDeroulanteMultiple;

  static isEqual = ArrayUtil.isEqual;
  static getUniqueList = ArrayUtil.getUniqueList;
  static getUniqueListAsObservable = ArrayUtil.getUniqueListAsObservable;
  static convertArrayDimention = ArrayUtil.convertArrayDimention;
  static extractTrueKeys = ArrayUtil.extractTrueKeys;
  static extractSelectedOrgs = ArrayUtil.extractSelectedOrgs;

  static formatOuiNon = FormatUtil.formatOuiNon;
  static formatValue = FormatUtil.formatValue;
  static threeDecimalFormatter = FormatUtil.threeDecimalFormatter;

  static getOrganismePropertyName = StringUtil.getOrganismePropertyName;
  static getCodeRegionByCodeOrg = StringUtil.getCodeRegionByCodeOrg;
  static getDestinataireEnIntersection = StringUtil.getDestinataireEnIntersection;
  static setError = StringUtil.setError;
}
