/**
 * wsrv.nl
 * @see https://wsrv.nl
 * @description An image cache & resize service.
Manipulate images on-the-fly with a worldwide cache.
 */
export function wsrv(url: string | URL, options?: WrsvOptions) {
    const u = new URL("https://wsrv.nl/");
    u.searchParams.set("url", new URL(url).href);
    const COMMA = "__C_O_M_M_A__";
    if (options)
        Object.entries(options).forEach(([k, v]) =>
            u.searchParams.set(k, Array.isArray(v) ? v.join(COMMA) : String(v))
        );
    return u.href.replace(new RegExp(COMMA, "g"), ",");
}

/**
 * supported color formats
 * @see https://images.weserv.nl/docs/adjustment.html#background
 */
type Color = string;
type Degree = number;
type Permutation<T, K = T> = [T] extends [never] ? [] : K extends K ? [K, ...Permutation<Exclude<T, K>>] : never;
type QueryList<T> = T | Permutation<T>;

/**
 * @see https://images.weserv.nl/docs/quick-reference.html
 */
export type WrsvOptions = Partial<{
    /**
     * Width:
     *
     * Sets the width of the image, in pixels.
     */
    w: number;
    /**
     * Height:
     *
     * Sets the height of the image, in pixels.
     */
    h: number;
    /**
     * Device pixel ratio:
     *
     * The device pixel ratio is used to easily convert between CSS pixels and device pixels. This makes it possible to display images at the correct pixel density on a variety of devices such as Apple devices with Retina Displays and Android devices. You must specify either a width, a height, or both for this parameter to work. Use values between 1 and 8.
     */
    dpr: number;
    /**
     * Fit:
     *
     * Controls how the image is fitted to its target dimensions. Below are a couple of examples. Some of these values are based on the object-fit CSS property.
     */
    fit: "inside" | "outside" | "cover" | "fill" | "contain";
    /**
     * The remaining space can be filled with a background color by using &cbg=
     */
    cbg: Color;
    /**
     * Without enlargement:
     *
     * Do not enlarge if the width or height are already less than the specified dimensions.
     */
    we: boolean;
    /**
     * Alignment position:
     *
     * How the image should be aligned when &fit=cover or &fit=contain is set. The &w= and &h= parameters should also be specified.
     */
    a:
        | "center"
        | "top"
        | "right"
        | "bottom"
        | "left"
        | "top-left"
        | "bottom-left"
        | "bottom-right"
        | "top-right"
        | "focal"
        | QueryList<"entropy" | "attention">;
    /**
     * Rectangle crop:
     *
     * Crops the image to specific dimensions after any other resize operations.
     */
    cx: number;
    cy: number;
    cw: number;
    ch: number;
    precrop: number;
    /**
     * Trim:
     *
     * Trim "boring" pixels from all edges that contain values within a similarity of the top-left pixel. Trimming occurs before any resize operation. Use values between 1 and 254 to define a tolerance level to trim away similar color values. You also can specify just &trim, which defaults to a tolerance level of 10.
     */
    trim: number;
    /**
     * Mask:
     *
     * Controls the visible and non-visible area of the image.
     */
    mask:
        | "circle"
        | "ellipse"
        | "triangle"
        | "triangle-180"
        | "pentagon"
        | "pentagon-180"
        | "hexagon"
        | "square"
        | "star"
        | "heart";
    /**
     * Mask trim:
     *
     * Removes the remaining whitespace from the mask.
     */
    mtrim: boolean;
    /**
     * Mask background:
     *
     * Sets the background color of the mask. See here for the supported color formats.
     */
    mbg: Color;
    /**
     * Flip:
     *
     * Flip the image about the vertical Y axis. This always occurs after rotation, if any.
     */
    flip: boolean;
    /**
     * Flop:
     *
     * Flop the image about the horizontal X axis. This always occurs after rotation, if any.
     */
    //
    //
    flop: boolean;
    /**
     * Rotation:
     *
     * Rotates the image by either an explicit angle or auto-orient based on the EXIF Orientation tag.
     *
     * If an angle is specified, it is converted to a valid positive degree rotation. For example, -450 will produce a 270 degree rotation. When rotating by an angle other than a multiple of 90, the background color can be provided with the &rbg= parameter. See here for the supported color formats.
     *
     * If no angle is provided, it is determined from the EXIF data.
     */
    ro: Degree;
    rgb: Color;
    /**
     * Background:
     *
     * Sets the background color of the image. Supports a variety of color formats. In addition to the 140 color names supported by all modern browsers (listed here), it also accepts hexadecimal RGB and RBG alpha formats.
     */
    bg: Color;
    /**
     * Blur:
     *
     * Adds a blur effect to the image. When used without a value (&blur), performs a fast, mild blur of the output image. When a value is provided, performs a slower, more accurate Gaussian blur.
     *
     * Use values between 0.3 and 1000, representing the sigma of the Gaussian mask, where sigma = 1 + radius / 2.
     */
    blur: number;
    /**
     * Contrast:
     *
     * Adjusts the image contrast. Use values between -100 and +100, where 0 represents no change.
     */
    con: number;
    /**
     * Filter:
     *
     * Applies a filter effect to the image. Accepts greyscale, sepia, duotone or negate.
     */
    filt: "greyscale" | "sepia" | "duotone" | "negate";
    /**
     * Gamma:
     *
     * Adjusts the image gamma. Use values between 1.0 and 3.0. The default value is 2.2, a suitable approximation for sRGB images.
     */
    gam: number;
    /**
     * Modulate:
     *
     * Transforms the image using brightness, saturation and hue rotation. Use `&mod=[brightness multiplier],[saturation multiplier],[hue degrees]` to define the below adjustments at once.
     *
     * Adjusts the brightness of the image. A multiplier greater than 1 will increase brightness, while a multiplier less than 1 will decrease the brightness.
     */
    mod: string | number;
    /**
     * Saturation:
     *
     * Adjusts the saturation of the image. A multiplier greater than 1 will increase saturation, while a multiplier less than 1 will decrease the saturation.
     */
    sat: number;
    /**
     * Hue rotation:
     *
     * Applies a hue rotation to the image. A positive hue rotation increases the hue value, while a negative rotation decreases the hue value.
     *
     * Values are given in degrees, there is no minimum or maximum value; &hue=N evaluates to N modulo 360.
     */
    hue: Degree;
    /**
     * Sharpen:
     *
     * Sharpen the image. Performs an accurate sharpen of the L channel in the LAB color space. Use in combination with &sharpf= and &sharpj= to control the level of sharpening in "flat" and "jagged" areas.
     */
    sharp: number;
    sharpf: number;
    sharpj: number;
    /**
     * Tint:
     *
     * Tint the image using the provided chroma while preserving the image luminance. See here for the supported color formats.
     */
    tint: Color;
    /**
     * Adaptive filter:
     *
     * Use adaptive row filtering for reducing the PNG file size. This only works when the output image is png.
     */
    af: boolean;
    /**
     * Base64 (data URL):
     *
     * Encodes the image to be used directly in the src= of the `<img>` tag. Use this link to see the output result.
     */
    encoding: "base64";
    /**
     * Cache-Control:
     *
     * Defines for how long an image should be cached by the browser. This will change the max-age of the Cache-Control HTTP-header.
     *
     * We define a "far-future expiration" of 1 year by default. The duration can be specified in days, weeks, months, and years using the following suffixes:
     *
     * ```
     * d: days
     * w: weeks, 7 days
     * M: months, 30 days
     * y: years, 365 days
     * ```
     *
     * A duration must be in the range of 1d (1 day) to 1y (1 year), inclusive. Any other value will be ignored and fallback to the default value of 1 year.
     */
    maxage: string;
    /**
     * Compression level:
     *
     * The zlib compression level. Use a value between 0 (no Deflate) and 9 (maximum Deflate). The default value is 6. This only works when the output image is png.
     */
    l: number;
    /**
     * Default image:
     *
     * If there is a problem loading an image, then an error is shown. However, there might be a need where instead of giving a broken image to the user, you want a default image to be delivered.
     */
    default: string;
    /**
     * Filename:
     *
     * To specify the filename returned in the Content-Disposition header. The filename must only contain alphanumeric characters.
     */
    filename: string;
    /**
     * Interlace / progressive:
     *
     * Adds interlacing to GIF and PNG. JPEGs become progressive.
     */
    il: boolean;
    /**
     * Number of pages:
     *
     * To select the number of pages to render. The default value is 1. Set to -1 to mean "until the end of the document".
     *
     * TIP: -1 will be useful if you need to resize an animated WebP or GIF image.
     */
    n: number;
    /**
     * Output:
     *
     * Encodes the image to a specific format. Accepts jpg, png, gif, tiff, webp or json. If none is given, it will honor the origin image format.
     */
    output: "jpg" | "png" | "gif" | "tiff" | "webp" | "json";
    /**
     * Page:
     *
     * To load a given page (for an PDF, TIFF and multi-size ICO file). The value is numbered from zero. For a multi-resolution image, you can use -1 to get the largest page and -2 to get the smallest page.
     */
    page: number;
    /**
     * Quality:
     *
     * Defines the quality of the image. Use values between 1 and 100. Defaults to 80. This only works when the output image is jpg, tiff or webp.
     */
    q: number;
}>;
