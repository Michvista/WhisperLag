declare module "busboy" {
  import { IncomingHttpHeaders } from "http";
  import { Readable, Writable } from "stream";

  interface BusboyConfig {
    headers: IncomingHttpHeaders;
    limits?: {
      fieldNameSize?: number;
      fieldSize?: number;
      fields?: number;
      fileSize?: number;
      files?: number;
      parts?: number;
      headerPairs?: number;
    };
  }

  interface FileInfo {
    filename: string;
    encoding: string;
    mimeType: string;
  }

  interface BusboyInstance extends Writable {
    on(event: "field", listener: (name: string, value: string, info: any) => void): this;
    on(event: "file", listener: (name: string, stream: Readable, info: FileInfo) => void): this;
    on(event: "finish" | "close", listener: () => void): this;
    on(event: "error", listener: (err: any) => void): this;
  }

  function Busboy(config: BusboyConfig): BusboyInstance;
  export default Busboy;
}
