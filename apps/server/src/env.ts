import { PlatformConfigProvider } from "@effect/platform";
import { NodeFileSystem } from "@effect/platform-node";
import { Layer } from "effect";

export const DotEnvConfig = PlatformConfigProvider.layerDotEnvAdd(".env").pipe(
	Layer.provide(NodeFileSystem.layer),
);
