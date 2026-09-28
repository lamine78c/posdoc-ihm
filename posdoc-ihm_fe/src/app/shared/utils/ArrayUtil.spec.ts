import { ArrayUtil } from './ArrayUtil';

describe('ArrayUtil', () => {
  it('should return true when one region selected', () => {
    expect(ArrayUtil.isSelectedOrgsInOneRegion({ '117': { '117': true, '998': true }, '116': { '116': false } })).toBe(true);
  });
  it('should return false when multi region selected', () => {
    expect(ArrayUtil.isSelectedOrgsInOneRegion({ '117': { '117': true, '998': false }, '116': { '116': true } })).toBe(false);
  });

  it('should return unique list', () => {
    const data = [{ id: '1' }, { id: '2' }, { id: '1' }, { id: { '117': true } }];
    expect(ArrayUtil.getUniqueList(data, 'id')).toEqual([{ id: '1' }, { id: '2' }, { id: { '117': true } }]);
  });

  it('should return dimension by array', () => {
    const data = ['1', '2', '3'];
    expect(ArrayUtil.convertArrayDimention(data, 2)).toEqual([
      { text: '1\n2', border: false },
      { text: '3', border: false },
    ]);
    expect(ArrayUtil.convertArrayDimention(data, 3)).toEqual([
      { text: '1', border: false },
      { text: '2', border: false },
      { text: '3', border: false },
    ]);
  });

  it('should return keys with value true', () => {
    const data = [{ '117': false }, { '116': true }];
    expect(ArrayUtil.extractTrueKeys(data)).toEqual(['116']);
  });

  it('should return selected organismes', () => {
    const data = [{ '117': false }, { '116': true }];
    const selectedOrgs = [];
    ArrayUtil.extractSelectedOrgs(data, selectedOrgs);
    expect(selectedOrgs).toEqual(['116']);
  });
});
