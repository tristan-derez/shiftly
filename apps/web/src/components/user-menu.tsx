import {
	ClockIcon,
	PencilSimpleIcon,
	SignOutIcon,
	UserIcon,
} from "@phosphor-icons/react";
import { Link, useRouteContext, useRouter } from "@tanstack/react-router";
import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from "@workspace/ui/components/avatar";
import { Button } from "@workspace/ui/components/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import { toast } from "@workspace/ui/components/toast";
import { authClient, setSessionCache } from "@/lib/auth-client";
import { useOnline } from "@/lib/online";
import { readCachedUserProfile } from "@/lib/user-profile-cache";

function UserMenu() {
	const router = useRouter();
	const { authData } = useRouteContext({ from: "__root__" });
	const online = useOnline();
	const user = authData?.user ?? readCachedUserProfile();

	if (!user) {
		return null;
	}

	function handleSignOut() {
		if (!online || !authData?.user) return;

		void toast
			.promise(
				(async () => {
					await authClient.signOut();
					setSessionCache(null);
					await router.invalidate();
					await router.navigate({ to: "/signin" });
				})(),
				{
					loading: { title: "Déconnexion..." },
					success: { title: "Déconnexion réussie", description: "À bientôt !" },
					error: {
						title: "Oups !",
						description: "Quelque chose s'est mal passé, réessaie",
					},
				},
			)
			.catch(() => {});
	}

	const initials = user.name
		.split(" ")
		.map((part) => part.charAt(0))
		.join("")
		.slice(0, 2)
		.toUpperCase();

	return (
		<DropdownMenu>
			<DropdownMenuTrigger
				render={
					<Button variant="outline" size="icon-lg" className="rounded-full">
						<Avatar>
							<AvatarImage src={user.image ?? undefined} />
							<AvatarFallback>{initials}</AvatarFallback>
						</Avatar>
					</Button>
				}
			/>
			<DropdownMenuContent align="end" className="w-45">
				<DropdownMenuGroup>
					<DropdownMenuItem disabled={!online}>
						<UserIcon />
						Compte
					</DropdownMenuItem>
					<DropdownMenuItem render={<Link to="/" />}>
						<ClockIcon />
						Accéder aux horaires
					</DropdownMenuItem>
					<DropdownMenuItem disabled={!online} render={<Link to="/edit" />}>
						<PencilSimpleIcon />
						Modifier horaires
					</DropdownMenuItem>
				</DropdownMenuGroup>
				<DropdownMenuSeparator />
				<DropdownMenuGroup>
					<DropdownMenuItem
						disabled={!online || !authData?.user}
						variant="destructive"
						onClick={handleSignOut}
					>
						<SignOutIcon />
						Se déconnecter
					</DropdownMenuItem>
				</DropdownMenuGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

export { UserMenu };
