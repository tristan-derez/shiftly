import { Link, useRouteContext } from "@tanstack/react-router";
import { UserMenu } from "@/components/user-menu";

export function Nav() {
	const { authData } = useRouteContext({ from: "__root__" });

	return !authData?.user ? null : (
		<header className="static top-0 z-10 bg-background">
			<div className="mx-auto flex w-full items-center justify-between py-4">
				<div className="flex gap-2">
					<Link to="/" aria-label="Accueil">
						<img src="/shiftly-full-logo.svg" className="h-5 w-auto" />
					</Link>
				</div>
				<div className="flex items-center gap-2">
					<UserMenu />
				</div>
			</div>
		</header>
	);
}
