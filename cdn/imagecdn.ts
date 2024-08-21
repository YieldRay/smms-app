/**
 * ImageCDN
 * @see https://imagecdn.app
 * @description A free image resizing service and CDN.
 */
export function imageCDN(url: string | URL, options?: ImageCDNOptions) {
  const u = new URL(
    "https://imagecdn.app/v2/image/" + encodeURIComponent(new URL(url).href),
  );
  if (options) {
    Object.entries(options).forEach(([k, v]) =>
      u.searchParams.set(k, String(v))
    );
  }
  return u.href;
}

/**
 * @see https://imagecdn.app/docs
 */
export type ImageCDNOptions = Partial<{
  /**
   * Height of the desired image, in pixels.
   */
  height: number;
  /**
   * Width of the desired image, in pixels.
   */
  width: number;
  /**
   * Override the format output by the service.
   *
   * Options are: `webp`, `jpg`, `png`.
   *
   * Defaults to the best format supported by the current browser.
   */
  format: "webp" | "jpg" | "png";
  /**
   * How to fill the space provided by height/width.
   *
   * Options are: `cover`, `contain`, `fill`, `inside` or `outside`.
   *
   * Defaults to: `cover`.
   */
  fit: "cover" | "contain" | "fill" | "inside" | "outside";
}>;
