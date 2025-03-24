export type Url = {
  value: string;
};

export const Url = (() => {
  const init = (): Url => ({
    value: ""
  });
  const toNo = (value: string) => {
    const match = value.match(/^#L(\d+)$/);
    return match ? match[1] : null;
  }
  const toSegment = (path: string): string[] | Error => {
    const pathArray = path.split('/').filter(segment => segment.length > 0);
    const err = new Error("URLの形式が多分違います。githubのファイルURLをコピペするだけ。");
    if (pathArray.length < 4 || pathArray[2] !== "blob") return err;
    return pathArray;
  }
  const isError = (value: unknown): value is Error => {
    return value instanceof Error;
  }
  const setParam = (url: URL, key: string, value: string) => {
    url.searchParams.set(key, value);
    return url.toString();
  }
  return {
    init,
    toNo,
    toSegment,
    isError,
    setParam,
  }
})();