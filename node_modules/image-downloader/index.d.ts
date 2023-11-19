declare module 'image-downloader' {
  import { RequestOptions } from 'http';

  type Options = Pick<RequestOptions, 'headers' | 'auth' | 'agent' | 'timeout' | 'maxHeaderSize'> & {

    /**
     * The image URL to download
     */
    url: string;

    /**
     * The image destination. Can be a directory or a filename.
     * If a directory is given, ID will automatically extract the image filename
     * from `options.url`
     */
    dest: string;

    /**
     * Boolean indicating whether the image filename will be automatically extracted
     * from `options.url` or not. Set to `false` to have `options.dest` without a
     * file extension for example.
     * @default true
     */
    extractFilename?: boolean;

    /**
     * The maximum number of allowed redirects; if exceeded, an error will be emitted.
     * @default 21
     */
    maxRedirects?: number;
  }

  type DownloadResult = {

    /**
     * The downloaded filename
     */
    filename: string,
  };

  // eslint-disable-next-line no-unused-vars
  function image(options: Options): Promise<DownloadResult>;
}
