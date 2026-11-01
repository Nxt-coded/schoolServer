declare module "*express-rate-limit";

// Minimal declaration for mammoth (3rd-party lib without types in this project)
declare module "mammoth" {
	export function extractRawText(options: { path: string } | { buffer: ArrayBuffer } ): Promise<{ value: string }>;
	const _default: any;
	export default _default;
}
