/**
 * Wordpress Jetpack - Site Accelerator
 * @see https://jetpack.com/support/site-accelerator/
 * @description Photon is an image acceleration and modification service for Jetpack-connected WordPress sites. Converted images are cached automatically and served from the WordPress.com CDN. Images can be cropped, resized, and filtered by using a simple API controlled by GET query arguments. When Photon is enabled in Jetpack, images are updated on the fly.
 */
export function wp(
  url: string | URL,
  options?: PhotonOptions,
  i: 0 | 1 | 2 | 3 = 0,
) {
  const u = new URL(url);
  const { host, pathname } = u;
  u.protocol = "https:";
  u.host = `i${i}.wp.com`;
  u.pathname = `${host}${pathname}`;

  const COMMA = "__C_O_M_M_A__";
  if (options) {
    Object.entries(options).forEach(([k, v]) =>
      u.searchParams.set(k, Array.isArray(v) ? v.join(COMMA) : String(v))
    );
  }
  return u.href.replace(new RegExp(COMMA, "g"), ",");
}

/**
 * @see https://developer.wordpress.com/docs/photon/
 * @see https://developer.wordpress.com/docs/photon/api/
 */
export type PhotonOptions = Partial<{
  /**
   * Set the width of an image in pixels.
   */
  w: number;
  /**
   * Set the height of an image in pixels.
   */
  h: number;
  /**
   * Crop an image by percentages x-offset,y-offset,width,height (x,y,w,h). Percentages are used so that you don’t need to recalculate the cropping when transforming the image in other ways such as resizing it.
   */
  crop: [x: number, y: number, w: number, h: number];
  /**
   * Resize and crop an image to exact width,height pixel dimensions. Set the first number as close to the target size as possible and then crop the rest. Which direction it’s resized and cropped depends on the aspect ratios of the original image and the target size.
   */
  resize: [w: number, h: number];
  /**
   * Fit an image to a containing box of width,height dimensions. Image aspect ratio is maintained.
   */
  fit: [w: number, h: number];
  /**
   * Add black letterboxing effect to images, by scaling them to width, height while maintaining the aspect ratio and filling the rest with black.
   */
  lb: [w: number, h: number];
  /**
   * Remove black letterboxing effect from images with ulb. This function takes only one argument, true.
   */
  ulb: true;
  /**
   * The filter GET parameter is optional and is used to apply one of multiple filters. Valid values are: negate, grayscale, sepia, edgedetect, emboss, blurgaussian, blurselective, meanremoval.
   */
  filter:
    | "negate"
    | "grayscale"
    | "sepia"
    | "edgedetect"
    | "emboss"
    | "blurgaussian"
    | "blurselective"
    | "meanremoval";
  /**
   * Adjust the brightness of an image. Valid values are -255 through 255 where -255 is black and 255 is white. Higher is brighter. The default is zero.brightness=-40 will darken an image by 40 and brightness=80will brighten an image by 80.
   */
  brightness: number;
  /**
   * Adjust the contrast contrast of an image. Valid values are -100 through 100. The default is zero.contrast=-50 will decrease contrast by 50 and contrast=50 will increase contrast by 50.
   */
  contrast: number;
  /**
   * Add color hues to an image with colorize by passing a comma separated list of red,green,blue (RGB) values such as 255,0,0 (red), 0,255,0 (green), 0,0,255 (blue).
   */
  colorize: [r: number, g: number, b: number];
  /**
   * The smooth parameter can be used to smooth out the image.
   */
  smooth: number;
  /**
   * Use zoom to size images for high pixel ratio devices and browsers when zoomed. Not available to use with crop. Zoom is intended for use by scripts such as devicepx.js which automatically set the zoom level. Valid zoom levels are 1, 1.5, 2-10.
   */
  zoom: number;
  /**
   * Use the quality parameter to manage the quality output of JPEG and PNG images. Valid settings are between the values between 20 and 100. For JPEGs a setting of 100 will output the image at the original unaltered quality setting. However when specifying a quality of 100 for PNGs, the image is compressed using lossless compression and produces an image with identical quality as the original. Note that if the requesting web browser supports the WebP image format, then PNG and JPEG images will automatically be converted to the WebP image format by the server. When specifying 100 as the quality in this instance, a lossless compressed image will be produced, which in some instances may result in a file larger than the original.
   *
   * Note that the default quality setting for JPEGs is 89%, PNGs 80%, and WebP images is 80%.
   */
  quality: number;
  /**
   * Use the strip functionality to remove JPEG image Exif, IPTC, comment, and color data from the output image to reduce the image’s file size without having any visual data removed from the image. If orientation data is included in the Exif metadata, the image will be rotated accordingly.There are 3 valid settings for this parameter:
   *
   * - all: strips all extraneous data.
   * - info: removes Exif, IPTC and comment data from the output image.
   * - color: removes any ICC color profiles.
   */
  strip: "all" | "info" | "color";
}>;
