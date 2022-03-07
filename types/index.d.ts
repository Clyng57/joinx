
/**
 * @module joinscript
 */
declare module 'joinscript'
/**
 * Class JoinScript - A light-weight javascript templating engine for generating html.
 */
declare class JoinScript {
  /**
   * Create JoinScript
   * 
   * @param {Object} options - contains options.
   * @param {string} options.boilerplate - runs on every render.
   * @param {string | undefined} options.views - path to view folder.
   * @param {string | undefined} options.blocks - path to blocks folder.
   * @param {any | undefined} options.default - add default data that can be altered by passing in options.
   */
  constructor(
    options?: { 
      views: string | undefined; 
      blocks: string | undefined; 
      boilerplate: string | undefined; 
      default: any | undefined;
    }
  )
  /** @private */
  private boilerplate: any;
  /** @private */
  private dirname: string;
  /** @private */
  private blockDirname: string;
  /** @private */
  private blocks: Array<string>;
  /** @private */
  private default: any;

  parse: (template: string) => string[];
  compile: (template: string, options: any) => any;
  /** @private */
  parseCustomBlocks: (content: string) => Promise<any>;
  /** @private */
  parseBlocks: (content: string) => Promise<any>;
  render: (filePath: string, options: any) => Promise<any>;
  use: (app: any, engine: string) => Promise<any>;

}

export = JoinScript;
