import { PencilSimpleIcon, SignOutIcon, UserIcon } from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
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

function UserMenu() {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger
				render={
					<Button variant="ghost" size="icon-lg" className="rounded-full">
						<Avatar>
							<AvatarImage src="https://github.com/tristan-derez.png" alt="" />
							<AvatarFallback>TD</AvatarFallback>
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
					<DropdownMenuItem variant="destructive">
						<SignOutIcon />
						Se déconnecter
					</DropdownMenuItem>
				</DropdownMenuGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

export { UserMenu };
