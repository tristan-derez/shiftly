import { PencilSimpleIcon, SignOutIcon, UserIcon } from "@phosphor-icons/react";
import { Link, useRouteContext } from "@tanstack/react-router";
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
import { authClient } from "@/lib/auth-client";

function UserMenu() {
	const { authData } = useRouteContext({ from: "__root__" });

	if (!authData) {
		return null;
	}

	async function handleSignOut() {
		await authClient.signOut();

		toast.add({
			title: "Déconnexion réussie",
			description: "À bientôt !",
			type: "success",
		});
	}

	const { user } = authData;
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
			<DropdownMenuContent align="end" className="w-36">
				<DropdownMenuGroup>
					<DropdownMenuItem>
						<UserIcon />
						Compte
					</DropdownMenuItem>
					<DropdownMenuItem render={<Link to="/edit" />}>
						<PencilSimpleIcon />
						Modifier horaires
					</DropdownMenuItem>
				</DropdownMenuGroup>
				<DropdownMenuSeparator />
				<DropdownMenuGroup>
					<DropdownMenuItem variant="destructive" onClick={handleSignOut}>
						<SignOutIcon />
						Se déconnecter
					</DropdownMenuItem>
				</DropdownMenuGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

export { UserMenu };
