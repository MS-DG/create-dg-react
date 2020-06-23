const basefont = parseFloat(process.env.REACT_APP_BASE_FONT_SIZE!);

/**
 * 转成rem单位
 * rem(16) ==> "0.8rem"
 * rem(0, 16, 32) => "0 0.8rem 1.6rem"
 * @param pxs
 */
export function rem(...pxs: (number | string)[]): string {
  return pxs
    .map(px => (px === 0 ? "0" : typeof px === "string" ? px : `${px / basefont}rem`))
    .join(" ");
}
