import { Link } from "@tanstack/react-router";
import { Button } from "@workspace/ui/components/button";

function NotFound() {
	return (
		<div className="flex flex-col items-center justify-center gap-4 text-center min-h-svh">
			<p className="text-4xl font-bold">404</p>
			<p className="text-muted-foreground">Page introuvable</p>
			<Link to="/">
				<Button>Retour à l'accueil</Button>
			</Link>
		</div>
	);
}

export { NotFound };
