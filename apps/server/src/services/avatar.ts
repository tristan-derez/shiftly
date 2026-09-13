import { Avatar, Style } from "@dicebear/core";
import lineFace from "@dicebear/styles/line-face.json" with { type: "json" };
import { Effect } from "effect";

export class AvatarService extends Effect.Service<AvatarService>()(
	"shiftly/AvatarService",
	{
		effect: Effect.gen(function* () {
			const style = new Style(lineFace);

			const generate = (seed: string): string =>
				new Avatar(style, {
					backgroundColor: ["ffd9b0", "ffa8bf"],
					backgroundColorFill: "linear",
					backgroundColorAngle: 135,
					mouthVariant: ["line", "pleased", "shy", "smile", "smirk", "soft"],
					eyesVariant: [
						"closed",
						"dots",
						"happy",
						"mismatch",
						"wink",
						"winkRight",
					],
					seed,
				}).toDataUri();

			return { generate };
		}),
	},
) {}
