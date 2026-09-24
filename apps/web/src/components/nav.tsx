import { Link, useLocation, useRouteContext } from "@tanstack/react-router";
import { UserMenu } from "@/components/user-menu";
import { readCachedSchedule } from "@/lib/schedule-cache";
import { readCachedUserProfile } from "@/lib/user-profile-cache";

export function Nav() {
	const { authData } = useRouteContext({ from: "__root__" });
	const isCachedSchedulePage =
		useLocation({ select: (location) => location.pathname === "/" }) &&
		readCachedSchedule() !== null;
	const hasCachedUserProfile = readCachedUserProfile() !== null;

	if (!authData?.user && !isCachedSchedulePage) return null;

	return (
		<header className="static top-0 z-10 bg-background">
			<div className="mx-auto flex w-full items-center justify-between py-4">
				<div className="flex gap-2">
					<Link to="/" aria-label="Accueil">
						<img src="/shiftly-full-logo.svg" className="h-5 w-auto" />
					</Link>
				</div>
				<div className="flex items-center gap-2">
					{authData?.user || (isCachedSchedulePage && hasCachedUserProfile) ? (
						<UserMenu />
					) : null}
				</div>
			</div>
		</header>
	);
}
