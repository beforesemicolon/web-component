import {proxify} from "./proxify";

describe('proxify', () => {
  describe('should ignore', () => {
    it('proxy', () => {
      const prx = new Proxy({}, {});

      expect(proxify('sample', prx)).toEqual(prx);
    });

    it('function', () => {
      const fn1 = () => null;
      const fn2 = function sample() {};

      expect(proxify('sample', fn1)).toEqual(fn1);
      expect(proxify('sample', fn2)).toEqual(fn2);
    });

    it('number', () => {
      expect(proxify('sample', 12)).toEqual(12);
    });

    it('string', () => {
      expect(proxify('sample', 'str')).toEqual('str');
    });

    it('boolean', () => {
      expect(proxify('sample', true)).toEqual(true);
      expect(proxify('sample', false)).toEqual(false);
    });
  });

  describe('should proxy Array', () => {
    const cb = jest.fn();
    let arr: any[] = [];
    let prx: any;

    beforeEach(() => {
      arr = [];
      prx = proxify('sample', arr, cb);
      cb.mockClear();
    })

    it('when changed index', () => {
      prx[0] = 10;

      expect(cb).toHaveBeenCalledWith("sample", [10]);

      cb.mockClear();

      prx[0] = 20;

      expect(cb).toHaveBeenCalledWith("sample", [20]);
    });

    it('when using push and pop', () => {
      prx.push(10);

      expect(cb).toHaveBeenCalledWith("sample", [10]);

      cb.mockClear();

      prx.pop();

      expect(cb).toHaveBeenCalledWith("sample", []);
    });

    it('when using shift and unshift', () => {
      prx.unshift(10);

      expect(cb).toHaveBeenCalledWith("sample", [10]);

      cb.mockClear();

      prx.shift();

      expect(cb).toHaveBeenCalledWith("sample", []);
    });

    it('when using splice', () => {
      prx.push(10);

      expect(prx).toEqual([10]);

      prx.splice(0, 1, 20);

      expect(cb).toHaveBeenCalledWith("sample", [20]);
    });

    it('when using sort and reverse', () => {
      prx.push(40);
      prx.push(5);
      prx.push(15);

      expect(prx).toEqual([40, 5, 15]);

      cb.mockClear();

      prx.sort();

      expect(prx).toEqual([15, 40, 5]);
      expect(cb).toHaveBeenCalledWith("sample", [15, 40, 5]);

      cb.mockClear();

      prx.reverse();

      expect(prx).toEqual([5, 40, 15]);
      expect(cb).toHaveBeenCalledWith("sample", [5, 40, 15]);
    });

    it('when using fill and copyWithin', () => {
      prx.push(40);
      prx.push(5);
      prx.push(15);

      cb.mockClear();

      prx.fill(10, 0, 3);

      expect(prx).toEqual([10, 10, 10]);
      expect(cb).toHaveBeenCalledWith("sample", [10, 10, 10]);

      cb.mockClear();

      prx.copyWithin(0, 1);

      expect(cb).toHaveBeenCalledWith("sample", [10, 10, 10]);
    });
  });
})