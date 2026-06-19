declare module "qrcode" {
  function toDataURL(
    text: string,
    options?: {
      width?: number;
      margin?: number;
      color?: { dark?: string; light?: string };
    }
  ): Promise<string>;
  export { toDataURL };
}
