import { NodeRuntime } from "@effect/platform-node";
import { Layer } from "effect";
import { HttpLive } from "./layers.ts";

NodeRuntime.runMain(Layer.launch(HttpLive));
