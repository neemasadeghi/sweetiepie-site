import imageUrlBuilder from "@sanity/image-url";
import { client } from "./client";

const builder = client ? imageUrlBuilder(client) : null;

export function urlFor(source: any) {
  if (!builder) throw new Error("Sanity client not configured");
  return builder.image(source);
}
