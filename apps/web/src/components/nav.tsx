import { Link } from "@tanstack/react-router";
import { UserMenu } from "@/components/user-menu";

function Nav() {
	return (
		<div className="flex items-center justify-between px-2 pt-4">
			<div className="flex gap-2">
				<Link to="/" className="[&.active]:font-bold">
					Accueil
				</Link>
			</div>
			<div className="flex items-center gap-2">
				<UserMenu />
			</div>
		</div>
	);
}

export { Nav };
